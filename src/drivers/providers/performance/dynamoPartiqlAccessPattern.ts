import {
  DynamoDbAccessPath,
  DynamoDbAccessPattern,
  DynamoDbKeyConditionOperator,
  DynamoDbKeySchema,
  DynamoDbQueryAnalysisInput,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';

// Purpose-built structural parser classifies DynamoDB access paths without retaining literal values.

type TokenType =
  | 'ident'
  | 'qident'
  | 'string'
  | 'number'
  | 'param'
  | 'punct'
  | 'eof';

type Token = { type: TokenType; value: string };

const PUNCT_2 = new Set(['<=', '>=', '<>', '!=']);
const PUNCT_1 = new Set([
  '(',
  ')',
  '[',
  ']',
  ',',
  '.',
  '=',
  '<',
  '>',
  '*',
  ';',
]);

// Returns undefined on any lexical error (unterminated string/identifier) -
// callers must treat that identically to a parse failure (accessPath:
// 'unknown'), never fall back to a partial token list.
//
// `allowNamedParam` gates `:name` value-placeholder tokens. PartiQL
// (ExecuteStatement) only ever accepts `?` positional parameters - a literal
// `:name` in PartiQL statement text is not valid DynamoDB PartiQL syntax at
// all, so the WHERE-clause tokenizer leaves `:` unrecognized (a genuine
// parse failure, correctly reported as 'unknown'). Native Query/Scan's
// KeyConditionExpression/FilterExpression is a different expression
// language that exclusively uses `:name` (paired with ExpressionAttributeValues),
// never `?` - analyzeDynamoNativeQueryAccessPattern passes true here for
// exactly that reason.
function tokenize(sql: string, allowNamedParam = false): Token[] | undefined {
  const tokens: Token[] = [];
  const n = sql.length;
  let i = 0;

  while (i < n) {
    const ch = sql[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '-' && sql[i + 1] === '-') {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && sql[i + 1] === '*') {
      const close = sql.indexOf('*/', i + 2);
      if (close === -1) return undefined;
      i = close + 2;
      continue;
    }
    if (ch === "'") {
      const end = readQuoted(sql, i, "'");
      if (end === undefined) return undefined;
      tokens.push({ type: 'string', value: '' });
      i = end;
      continue;
    }
    if (ch === '"') {
      const end = readQuoted(sql, i, '"');
      if (end === undefined) return undefined;
      tokens.push({
        type: 'qident',
        value: unescapeQuoted(sql.slice(i + 1, end - 1), '"'),
      });
      i = end;
      continue;
    }
    if (ch === '?') {
      tokens.push({ type: 'param', value: '?' });
      i++;
      continue;
    }
    if (ch === ':' && allowNamedParam) {
      const m = /^:[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i));
      if (!m) return undefined;
      tokens.push({ type: 'param', value: m[0] });
      i += m[0].length;
      continue;
    }
    // `#name` ExpressionAttributeNames placeholder - native Query/Scan only
    // (same gate as `:name` above). Tokenized as an ordinary identifier
    // carrying its `#` prefix; resolveAttributeNames() substitutes the real
    // attribute name from expressionAttributeNames before classification
    // ever compares it against the table's key schema.
    if (ch === '#' && allowNamedParam) {
      const m = /^#[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i));
      if (!m) return undefined;
      tokens.push({ type: 'ident', value: m[0] });
      i += m[0].length;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const m = /^\d+(\.\d+)?/.exec(sql.slice(i));
      tokens.push({ type: 'number', value: m![0] });
      i += m![0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i));
      tokens.push({ type: 'ident', value: m![0] });
      i += m![0].length;
      continue;
    }
    const two = sql.slice(i, i + 2);
    if (PUNCT_2.has(two)) {
      tokens.push({ type: 'punct', value: two === '!=' ? '<>' : two });
      i += 2;
      continue;
    }
    if (PUNCT_1.has(ch)) {
      tokens.push({ type: 'punct', value: ch });
      i++;
      continue;
    }
    // Any other character (e.g. `:`, `@`, `%`, unsupported operators) means
    // this file does not understand the statement well enough to guarantee
    // meaning-preserving classification - bail out rather than guess.
    return undefined;
  }
  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

function readQuoted(
  sql: string,
  start: number,
  quoteChar: string,
): number | undefined {
  let i = start + 1;
  const n = sql.length;
  while (i < n) {
    if (sql[i] === quoteChar) {
      if (sql[i + 1] === quoteChar) {
        i += 2;
        continue;
      }
      return i + 1;
    }
    i++;
  }
  return undefined; // unterminated
}

function unescapeQuoted(raw: string, quoteChar: string): string {
  return raw.split(quoteChar + quoteChar).join(quoteChar);
}

// ---------------------------------------------------------------------------
// Internal boolean-tree AST. Never exported - nothing outside this file
// needs it, and keeping it private means the public API can never leak a
// shape that accidentally starts carrying literal values later.
// ---------------------------------------------------------------------------

type CompareOp =
  | '='
  | '<>'
  | '<'
  | '<='
  | '>'
  | '>='
  | 'IN'
  | 'NOT_IN'
  | 'BETWEEN'
  | 'NOT_BETWEEN'
  | 'begins_with';

type BoolNode =
  | { kind: 'and'; children: BoolNode[] }
  | { kind: 'or'; children: BoolNode[] }
  | { kind: 'not'; child: BoolNode }
  // `attribute` is the bare top-level attribute name (first path segment)
  // only when the compared side was a direct attribute path - undefined
  // when the left-hand side was itself a function call (e.g. `size(x) > 5`),
  // which can never be a key condition.
  | { kind: 'compare'; attribute?: string; op: CompareOp }
  // Successfully parsed but structurally never a key predicate - a bare
  // boolean function call used standalone (`attribute_exists(x)`), or a
  // function call this parser recognizes without special-casing.
  | { kind: 'other' };

class ParseError extends Error {}

class TokenCursor {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  next(): Token {
    const t = this.peek();
    if (t.type !== 'eof') this.pos++;
    return t;
  }

  atEnd(): boolean {
    return this.peek().type === 'eof';
  }

  isKeyword(word: string, offset = 0): boolean {
    const t = this.peek(offset);
    return t.type === 'ident' && t.value.toUpperCase() === word;
  }

  expectKeyword(word: string): void {
    if (!this.isKeyword(word)) {
      throw new ParseError(`expected ${word}`);
    }
    this.next();
  }

  isPunct(value: string, offset = 0): boolean {
    const t = this.peek(offset);
    return t.type === 'punct' && t.value === value;
  }

  expectPunct(value: string): void {
    if (!this.isPunct(value)) {
      throw new ParseError(`expected '${value}'`);
    }
    this.next();
  }
}

// ---------------------------------------------------------------------------
// Attribute path (`a`, `"a"`, `a.b`, `a[0].b`) - only the first segment is
// ever treated as "the attribute this predicate touches" for classification;
// the full dotted form is kept only for the projection list's display text.
// ---------------------------------------------------------------------------

function parsePath(c: TokenCursor): string[] | undefined {
  const t = c.peek();
  if (t.type !== 'ident' && t.type !== 'qident') {
    return undefined;
  }
  c.next();
  const segments = [t.value];
  for (;;) {
    if (c.isPunct('.')) {
      c.next();
      const seg = c.peek();
      if (seg.type !== 'ident' && seg.type !== 'qident') {
        throw new ParseError('expected identifier after .');
      }
      c.next();
      segments.push(seg.value);
      continue;
    }
    if (c.isPunct('[')) {
      c.next();
      // Index expression - only a bare integer literal is supported (the
      // only form DynamoDB PartiQL document paths actually use); anything
      // else is treated as unparseable rather than guessed at.
      if (c.peek().type !== 'number') {
        throw new ParseError('expected numeric array index');
      }
      c.next();
      c.expectPunct(']');
      continue;
    }
    break;
  }
  return segments;
}

// Consumes a single value (literal, `?` param, or a nested value like a
// document-path reference or PartiQL array literal `[v1, v2]`) without
// capturing its content anywhere. Never returns text.
function skipValue(c: TokenCursor): void {
  const t = c.peek();
  if (t.type === 'string' || t.type === 'number' || t.type === 'param') {
    c.next();
    return;
  }
  if (c.isPunct('[')) {
    c.next();
    if (!c.isPunct(']')) {
      skipValue(c);
      while (c.isPunct(',')) {
        c.next();
        skipValue(c);
      }
    }
    c.expectPunct(']');
    return;
  }
  if (t.type === 'ident' || t.type === 'qident') {
    // A bare identifier used as a value position (an attribute-to-attribute
    // comparison, or the start of a function call) - consume it as a path,
    // then optionally a function-call argument list, without keeping either.
    parsePath(c);
    if (c.isPunct('(')) {
      c.next();
      if (!c.isPunct(')')) {
        skipValue(c);
        while (c.isPunct(',')) {
          c.next();
          skipValue(c);
        }
      }
      c.expectPunct(')');
    }
    return;
  }
  throw new ParseError('expected value');
}

function skipValueList(c: TokenCursor): void {
  skipValue(c);
  while (c.isPunct(',')) {
    c.next();
    skipValue(c);
  }
}

const COMPARE_PUNCT: Record<string, CompareOp> = {
  '=': '=',
  '<>': '<>',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
};

// A single WHERE-clause / KeyConditionExpression / FilterExpression
// predicate: `path <op> value`, `path [NOT] BETWEEN value AND value`,
// `path [NOT] IN (values)` / `path [NOT] IN [values]`, a `begins_with(path,
// value)` call, or any other function call (kept as 'other' / with
// `attribute: undefined` when it appears on the left of a comparison).
function parsePredicate(c: TokenCursor): BoolNode {
  const startsWithPath =
    c.peek().type === 'ident' || c.peek().type === 'qident';
  if (!startsWithPath) {
    throw new ParseError('expected predicate');
  }

  const path = parsePath(c);
  if (path === undefined) {
    throw new ParseError('expected predicate');
  }
  const attribute = path.length === 1 ? path[0] : path[0]; // top-level segment either way

  // Function call: `name(args)`. begins_with(path, value) is the one
  // function DynamoDB treats as a key-condition-capable predicate; every
  // other function (contains/attribute_exists/attribute_not_exists/
  // attribute_type/size/anything unrecognized) is never a key predicate.
  if (c.isPunct('(')) {
    const fnName = path.length === 1 ? path[0].toLowerCase() : undefined;
    c.next();
    if (fnName === 'begins_with') {
      const argPath = parsePathOrThrow(c);
      c.expectPunct(',');
      skipValue(c);
      c.expectPunct(')');
      return { kind: 'compare', attribute: argPath[0], op: 'begins_with' };
    }
    // Any other function call: consume its argument list without
    // interpreting it, then check whether it's used as a comparison LHS
    // (`size(x) > 5`) or a standalone boolean predicate
    // (`attribute_exists(x)`).
    if (!c.isPunct(')')) {
      skipValue(c);
      while (c.isPunct(',')) {
        c.next();
        skipValue(c);
      }
    }
    c.expectPunct(')');
    return maybeTrailingComparison(c, undefined);
  }

  return maybeTrailingComparison(c, attribute);
}

function parsePathOrThrow(c: TokenCursor): string[] {
  const path = parsePath(c);
  if (path === undefined) {
    throw new ParseError('expected identifier');
  }
  return path;
}

// After a bare path or a function call, look for BETWEEN / IN / a
// comparison operator; if none follows, the path/call was itself the whole
// (boolean-valued) predicate.
function maybeTrailingComparison(
  c: TokenCursor,
  attribute: string | undefined,
): BoolNode {
  let negated = false;
  if (c.isKeyword('NOT')) {
    negated = true;
    c.next();
  }

  if (c.isKeyword('BETWEEN')) {
    c.next();
    skipValue(c);
    c.expectKeyword('AND');
    skipValue(c);
    return {
      kind: 'compare',
      attribute,
      op: negated ? 'NOT_BETWEEN' : 'BETWEEN',
    };
  }
  if (c.isKeyword('IN')) {
    c.next();
    const closer = c.isPunct('[') ? ']' : ')';
    c.expectPunct(closer === ']' ? '[' : '(');
    if (!c.isPunct(closer)) {
      skipValueList(c);
    }
    c.expectPunct(closer);
    return { kind: 'compare', attribute, op: negated ? 'NOT_IN' : 'IN' };
  }
  if (negated) {
    // A bare `NOT <path>` / `NOT <call>` with no BETWEEN/IN following is not
    // a shape this file assigns any meaning to.
    throw new ParseError('unsupported NOT predicate');
  }

  const opToken = c.peek();
  if (opToken.type === 'punct' && opToken.value in COMPARE_PUNCT) {
    c.next();
    skipValue(c);
    return { kind: 'compare', attribute, op: COMPARE_PUNCT[opToken.value] };
  }

  // No trailing operator at all: only valid when the predicate was itself a
  // function call used as a standalone boolean (attribute !== a bare path
  // that was never given a comparison - a lone attribute path is not valid
  // PartiQL/KeyCondition boolean syntax and is rejected).
  if (attribute === undefined) {
    return { kind: 'other' };
  }
  throw new ParseError('expected comparison operator');
}

function parseNot(c: TokenCursor): BoolNode {
  if (c.isKeyword('NOT')) {
    c.next();
    return { kind: 'not', child: parseNot(c) };
  }
  if (c.isPunct('(')) {
    c.next();
    const inner = parseOr(c);
    c.expectPunct(')');
    return inner;
  }
  return parsePredicate(c);
}

function parseAnd(c: TokenCursor): BoolNode {
  const children = [parseNot(c)];
  while (c.isKeyword('AND')) {
    c.next();
    children.push(parseNot(c));
  }
  return children.length === 1 ? children[0] : { kind: 'and', children };
}

function parseOr(c: TokenCursor): BoolNode {
  const children = [parseAnd(c)];
  while (c.isKeyword('OR')) {
    c.next();
    children.push(parseAnd(c));
  }
  return children.length === 1 ? children[0] : { kind: 'or', children };
}

// ---------------------------------------------------------------------------
// SELECT statement (§7.2's FROM / projection / WHERE / ORDER BY / LIMIT)
// ---------------------------------------------------------------------------

type ParsedSelect = {
  tableName: string;
  indexName?: string;
  projection: DynamoDbAccessPattern['projection'];
  where?: BoolNode;
  limit?: number;
  scanForward?: boolean;
};

// Deliberately does not reuse parsePath(): that helper greedily consumes
// every `.`-separated segment as one document-path attribute reference
// (correct for a WHERE-clause predicate), which would swallow `"table"."index"`
// as a single length-2 path before this function ever saw the `.` - exactly
// the bug caught by this file's own test suite. A FROM-clause ref is at most
// one `.` between exactly two identifiers, parsed directly here instead.
function parseTableRef(c: TokenCursor): {
  tableName: string;
  indexName?: string;
} {
  const first = c.peek();
  if (first.type !== 'ident' && first.type !== 'qident') {
    throw new ParseError('expected table name');
  }
  c.next();
  if (c.isPunct('.')) {
    c.next();
    const second = c.peek();
    if (second.type !== 'ident' && second.type !== 'qident') {
      throw new ParseError('expected index name');
    }
    c.next();
    return { tableName: first.value, indexName: second.value };
  }
  return { tableName: first.value };
}

function parseProjection(c: TokenCursor): DynamoDbAccessPattern['projection'] {
  if (c.isPunct('*')) {
    c.next();
    return { mode: 'allAttributes', allAttributes: true, attributes: [] };
  }
  const attributes: string[] = [];
  for (;;) {
    const path = parsePathOrThrow(c);
    attributes.push(path.join('.'));
    // Tolerate (and discard) an `AS alias`.
    if (c.isKeyword('AS')) {
      c.next();
      parsePathOrThrow(c);
    }
    if (c.isPunct(',')) {
      c.next();
      continue;
    }
    break;
  }
  return { mode: 'specific', allAttributes: false, attributes };
}

function parseDynamoPartiqlSelect(sql: string): ParsedSelect | undefined {
  if (typeof sql !== 'string' || sql.trim() === '') {
    return undefined;
  }
  const tokens = tokenize(sql);
  if (!tokens) {
    return undefined;
  }
  const c = new TokenCursor(tokens);
  try {
    c.expectKeyword('SELECT');
    const projection = parseProjection(c);
    c.expectKeyword('FROM');
    const { tableName, indexName } = parseTableRef(c);

    let where: BoolNode | undefined;
    if (c.isKeyword('WHERE')) {
      c.next();
      where = parseOr(c);
    }

    let scanForward: boolean | undefined;
    if (c.isKeyword('ORDER')) {
      c.next();
      c.expectKeyword('BY');
      parsePathOrThrow(c);
      if (c.isKeyword('ASC')) {
        c.next();
        scanForward = true;
      } else if (c.isKeyword('DESC')) {
        c.next();
        scanForward = false;
      }
    }

    let limit: number | undefined;
    if (c.isKeyword('LIMIT')) {
      c.next();
      const t = c.peek();
      if (t.type !== 'number') {
        throw new ParseError('expected LIMIT value');
      }
      c.next();
      limit = Number(t.value);
    }

    if (c.isPunct(';')) {
      c.next();
    }
    if (!c.atEnd()) {
      // Trailing content this grammar doesn't recognize (a second
      // statement, an unsupported clause, ...) - refuse to guess.
      throw new ParseError('unexpected trailing content');
    }

    return { tableName, indexName, projection, where, limit, scanForward };
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Classification (the decision table at the top of this file)
// ---------------------------------------------------------------------------

// True iff `node` being true structurally GUARANTEES that `attrName` was
// compared with `=`/`IN` - the single recursive rule that captures both
// "Query" rows of the decision table at once: an AND-conjunct guarantees it
// for the whole AND (only one branch needs to hold), while an OR only
// guarantees it when EVERY branch independently guarantees it (any other
// branch could be the one that actually held).
//
// Matches `node.attribute` against `attrName` case-sensitively: DynamoDB
// attribute names are case-sensitive (AWS naming rules), so a schema key
// named `tenantId` must never match a statement's `tenantid` - that would
// misclassify a full scan as a key-condition Query and silently drop the
// DYNAMODB_FULL_TABLE_SCAN/DYNAMODB_FULL_INDEX_SCAN warning.
function guaranteesKeyEquality(node: BoolNode, attrName: string): boolean {
  switch (node.kind) {
    case 'and':
      return node.children.some((child) =>
        guaranteesKeyEquality(child, attrName),
      );
    case 'or':
      return (
        node.children.length > 0 &&
        node.children.every((child) => guaranteesKeyEquality(child, attrName))
      );
    case 'not':
      return false;
    case 'compare':
      return (
        node.attribute === attrName && (node.op === '=' || node.op === 'IN')
      );
    case 'other':
      return false;
  }
}

const REPORTABLE_SORT_OPS = new Set<DynamoDbKeyConditionOperator>([
  '=',
  '<',
  '<=',
  '>',
  '>=',
  'BETWEEN',
  'begins_with',
]);

function toReportableOp(
  op: CompareOp,
): DynamoDbKeyConditionOperator | undefined {
  return REPORTABLE_SORT_OPS.has(op as DynamoDbKeyConditionOperator)
    ? (op as DynamoDbKeyConditionOperator)
    : undefined;
}

// First direct comparison found anywhere in the tree for `attrName` -
// descriptive metadata only (partitionKey/sortKey reporting), never used to
// decide accessPath itself. Case-sensitive for the same reason as
// guaranteesKeyEquality above.
function findFirstComparison(
  node: BoolNode,
  attrName: string,
): CompareOp | undefined {
  switch (node.kind) {
    case 'and':
    case 'or':
      for (const child of node.children) {
        const found = findFirstComparison(child, attrName);
        if (found) return found;
      }
      return undefined;
    case 'not':
      return findFirstComparison(node.child, attrName);
    case 'compare':
      return node.attribute === attrName ? node.op : undefined;
    case 'other':
      return undefined;
  }
}

function collectAttributes(node: BoolNode, into: Set<string>): void {
  switch (node.kind) {
    case 'and':
    case 'or':
      node.children.forEach((child) => collectAttributes(child, into));
      return;
    case 'not':
      collectAttributes(node.child, into);
      return;
    case 'compare':
      if (node.attribute !== undefined) into.add(node.attribute);
      return;
    case 'other':
      return;
  }
}

// Native Query/Scan's KeyConditionExpression/FilterExpression may reference
// attributes through a `#name` ExpressionAttributeNames placeholder instead
// of the bare attribute name (required for reserved words, common
// practice otherwise). Classification must compare against real attribute
// names, so this rewrites every `#xxx` a parsed tree captured back to its
// real name before guaranteesKeyEquality/findFirstComparison/
// collectAttributes ever run. A `#xxx` with no entry in `names` is left as
// the literal placeholder string, which safely never matches any real key
// attribute name (under-classifies toward Scan rather than guessing).
function resolveAttributeNames(
  node: BoolNode,
  names: Record<string, string> | undefined,
): BoolNode {
  if (!names) return node;
  switch (node.kind) {
    case 'and':
      return {
        kind: 'and',
        children: node.children.map((child) =>
          resolveAttributeNames(child, names),
        ),
      };
    case 'or':
      return {
        kind: 'or',
        children: node.children.map((child) =>
          resolveAttributeNames(child, names),
        ),
      };
    case 'not':
      return { kind: 'not', child: resolveAttributeNames(node.child, names) };
    case 'compare':
      if (node.attribute?.startsWith('#')) {
        const resolved = names[node.attribute];
        if (resolved !== undefined) {
          return { ...node, attribute: resolved };
        }
      }
      return node;
    case 'other':
      return node;
  }
}

function classify(params: {
  operation: 'PartiQLSelect' | 'Query' | 'Scan';
  where: BoolNode | undefined;
  keySchema: DynamoDbKeySchema;
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  projection: DynamoDbAccessPattern['projection'];
  consistentRead: 'eventual' | 'strong' | 'unknown';
  limit?: number;
  resultItemLimit?: number;
  scanForward?: boolean;
}): DynamoDbAccessPattern {
  const {
    keySchema,
    tableName,
    indexName,
    indexType,
    projection,
    consistentRead,
    limit,
    resultItemLimit,
    scanForward,
    where,
  } = params;
  const pkAttr = keySchema.partitionKey.attributeName;
  const skAttr = keySchema.sortKey?.attributeName;

  // Exact, case-sensitive match against the schema's own key attribute
  // names - DynamoDB attribute names are case-sensitive, so e.g. a
  // `tenantid = ?` predicate must never be treated as satisfying a
  // `tenantId` partition key (AWS naming rules; see this function's own
  // doc comment above for the classification impact).
  const isQuery = where !== undefined && guaranteesKeyEquality(where, pkAttr);

  const accessPath: DynamoDbAccessPath = isQuery
    ? indexName
      ? 'indexQuery'
      : 'tableQuery'
    : indexName
    ? 'indexScan'
    : 'tableScan';

  const allAttrs = new Set<string>();
  if (where) collectAttributes(where, allAttrs);

  const filterAttrs = new Set(allAttrs);
  const partitionKey = {
    attributeName: pkAttr,
    operator: undefined as '=' | 'IN' | undefined,
    conditionPresent: false,
  };
  const sortKey = skAttr
    ? {
        attributeName: skAttr,
        operator: undefined as DynamoDbKeyConditionOperator | undefined,
        conditionPresent: false,
      }
    : undefined;

  if (where) {
    const pkOp = findFirstComparison(where, pkAttr);
    if (pkOp) {
      partitionKey.conditionPresent = true;
      if (pkOp === '=' || pkOp === 'IN') partitionKey.operator = pkOp;
    }
    if (skAttr && sortKey) {
      const skOp = findFirstComparison(where, skAttr);
      if (skOp) {
        sortKey.conditionPresent = true;
        sortKey.operator = toReportableOp(skOp);
      }
    }
  }

  if (isQuery) {
    filterAttrs.delete(pkAttr);
    if (skAttr) filterAttrs.delete(skAttr);
  }

  return {
    operation: params.operation,
    accessPath,
    confidence: 'certain',
    tableName,
    indexName,
    indexType,
    partitionKey,
    sortKey,
    postReadFilter: {
      present: filterAttrs.size > 0,
      attributes: [...filterAttrs],
    },
    projection,
    consistentRead,
    limit,
    resultItemLimit,
    scanForward,
  };
}

function unknownAccessPattern(params: {
  operation: 'PartiQLSelect' | 'Query' | 'Scan';
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  consistentRead: 'eventual' | 'strong' | 'unknown';
}): DynamoDbAccessPattern {
  return {
    operation: params.operation,
    accessPath: 'unknown',
    confidence: 'unknown',
    tableName: params.tableName,
    indexName: params.indexName,
    indexType: params.indexType,
    postReadFilter: { present: false, attributes: [] },
    projection: { mode: 'allAttributes', allAttributes: true, attributes: [] },
    consistentRead: params.consistentRead,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Step 3 of §7.1's static collection sequence: table/index extraction only,
// before the DescribeTable call that resolves a real key schema. Returns
// undefined when the statement cannot be parsed at all (not a single
// well-formed SELECT) - callers must treat that as a hard failure for static
// collection, per §7.2's last decision-table row / §9's "usable context な
// し" rule, not silently fall back to Scan.
export function extractDynamoPartiqlTarget(
  sql: string,
): { tableName: string; indexName?: string } | undefined {
  const parsed = parseDynamoPartiqlSelect(sql);
  if (!parsed) return undefined;
  return { tableName: parsed.tableName, indexName: parsed.indexName };
}

// Step 5: full parse + classify against the table/index's actual key schema
// (from DescribeTable). Always returns a DynamoDbAccessPattern - a
// re-parsing failure at this stage (which should be rare, since
// extractDynamoPartiqlTarget already succeeded on the same text) degrades to
// accessPath: 'unknown' / confidence: 'unknown' rather than throwing, so a
// Provider can always attach it to the Context and let
// DYNAMODB_ACCESS_PATTERN_UNRESOLVED communicate the gap.
export function analyzeDynamoPartiqlAccessPattern(params: {
  sql: string;
  keySchema: DynamoDbKeySchema;
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  consistentRead?: 'eventual' | 'strong' | 'unknown';
}): DynamoDbAccessPattern {
  const consistentRead = params.consistentRead ?? 'unknown';
  const parsed = parseDynamoPartiqlSelect(params.sql);
  if (!parsed) {
    return unknownAccessPattern({
      operation: 'PartiQLSelect',
      tableName: params.tableName,
      indexName: params.indexName,
      indexType: params.indexType,
      consistentRead,
    });
  }
  return classify({
    operation: 'PartiQLSelect',
    where: parsed.where,
    keySchema: params.keySchema,
    tableName: params.tableName,
    indexName: params.indexName,
    indexType: params.indexType,
    projection: parsed.projection,
    consistentRead,
    limit: parsed.limit,
    scanForward: parsed.scanForward,
  });
}

// Native Query's KeyConditionExpression/FilterExpression grammar is a strict
// subset of PartiQL WHERE (the AWS Query API itself rejects anything else
// for KeyConditionExpression - OR, non-key attributes, and nested
// parentheses are not valid there), so both are parsed with the same
// predicate/boolean-tree grammar as the WHERE clause above. Every attribute
// referenced by filterExpression is unconditionally a post-read filter
// attribute, by definition - unlike PartiQL's single WHERE clause, there is
// no ambiguity to resolve here.
export function analyzeDynamoNativeQueryAccessPattern(params: {
  input: DynamoDbQueryAnalysisInput;
  keySchema: DynamoDbKeySchema;
  indexType?: 'LSI' | 'GSI';
}): DynamoDbAccessPattern {
  const { input, keySchema, indexType } = params;
  // Query's documented default is eventual consistency when ConsistentRead
  // is omitted. This is known execution semantics, not missing evidence.
  const consistentRead: 'eventual' | 'strong' = input.consistentRead
    ? 'strong'
    : 'eventual';

  const keyTokens = tokenize(input.keyConditionExpression ?? '', true);
  if (!keyTokens) {
    return unknownAccessPattern({
      operation: 'Query',
      tableName: input.tableName,
      indexName: input.indexName,
      indexType,
      consistentRead,
    });
  }
  let keyWhere: BoolNode;
  try {
    const c = new TokenCursor(keyTokens);
    keyWhere = resolveAttributeNames(
      parseOr(c),
      input.expressionAttributeNames,
    );
    if (!c.atEnd()) throw new ParseError('unexpected trailing content');
  } catch {
    return unknownAccessPattern({
      operation: 'Query',
      tableName: input.tableName,
      indexName: input.indexName,
      indexType,
      consistentRead,
    });
  }

  const classified = classify({
    operation: 'Query',
    where: keyWhere,
    keySchema,
    tableName: input.tableName,
    indexName: input.indexName,
    indexType,
    projection: input.projectionExpression
      ? {
          mode: 'specific',
          allAttributes: false,
          attributes: input.projectionExpression
            .split(',')
            .map((s) => s.trim())
            .map(
              (attribute) =>
                input.expressionAttributeNames?.[attribute] ?? attribute,
            ),
        }
      : input.select === 'ALL_ATTRIBUTES' || !input.indexName
      ? { mode: 'allAttributes', allAttributes: true, attributes: [] }
      : {
          mode: 'allProjectedAttributes',
          allAttributes: false,
          attributes: [],
        },
    consistentRead,
    limit: input.limit,
    resultItemLimit: input.resultItemLimit,
    scanForward: input.scanIndexForward,
  });

  // filterExpression attributes are always post-read filter attributes for
  // a native Query, regardless of what classify() inferred from
  // keyConditionExpression alone.
  if (input.filterExpression) {
    const filterTokens = tokenize(input.filterExpression, true);
    const filterAttrs = new Set(classified.postReadFilter.attributes);
    if (filterTokens) {
      try {
        const c = new TokenCursor(filterTokens);
        const filterWhere = resolveAttributeNames(
          parseOr(c),
          input.expressionAttributeNames,
        );
        if (c.atEnd()) {
          collectAttributes(filterWhere, filterAttrs);
        }
      } catch {
        // Leave filterAttrs as-is; filterExpression's presence is still
        // meaningful even if we couldn't enumerate its attribute names.
      }
    }
    return {
      ...classified,
      postReadFilter: { present: true, attributes: [...filterAttrs] },
    };
  }

  return classified;
}
