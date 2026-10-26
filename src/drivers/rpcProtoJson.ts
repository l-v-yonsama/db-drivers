import protobuf from 'protobufjs';
import * as protojson from 'protobufjs/ext/protojson';

const LONG_TYPES = new Set([
  'int64',
  'uint64',
  'sint64',
  'fixed64',
  'sfixed64',
]);
const SPECIAL_JSON_TYPES = new Set([
  '.google.protobuf.Duration',
  '.google.protobuf.Timestamp',
  '.google.protobuf.FieldMask',
  '.google.protobuf.DoubleValue',
  '.google.protobuf.FloatValue',
  '.google.protobuf.Int64Value',
  '.google.protobuf.UInt64Value',
  '.google.protobuf.Int32Value',
  '.google.protobuf.UInt32Value',
  '.google.protobuf.BoolValue',
  '.google.protobuf.StringValue',
  '.google.protobuf.BytesValue',
  '.google.protobuf.Value',
  '.google.protobuf.Struct',
  '.google.protobuf.ListValue',
]);
const NUMBER_TOKEN = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

class JsonNumberToken {
  constructor(readonly text: string) {}
}

// Keep number tokens intact until 64-bit fields have been checked. JSON.parse
// would round an unsafe integer before a schema-aware validator can see it.
function parseNumberTokens(json: string): unknown {
  let marker = '__rpc_protojson_number__';
  while (json.includes(marker)) marker += '_';
  const tokens: string[] = [];
  let transformed = '';
  for (let i = 0; i < json.length; ) {
    if (json[i] === '"') {
      const start = i++;
      while (i < json.length) {
        if (json[i] === '\\') i += 2;
        else if (json[i++] === '"') break;
      }
      transformed += json.slice(start, i);
    } else if (json[i] === '-' || (json[i] >= '0' && json[i] <= '9')) {
      NUMBER_TOKEN.lastIndex = i;
      const match = NUMBER_TOKEN.exec(json);
      if (!match) {
        transformed += json[i++];
        continue;
      }
      tokens.push(match[0]);
      transformed += `{${JSON.stringify(marker)}:${tokens.length - 1}}`;
      i = NUMBER_TOKEN.lastIndex;
    } else {
      transformed += json[i++];
    }
  }
  return JSON.parse(transformed, (_key, value: unknown) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 1 &&
      Object.prototype.hasOwnProperty.call(value, marker)
    ) {
      const index = (value as Record<string, unknown>)[marker];
      if (typeof index === 'number' && Number.isInteger(index) && tokens[index])
        return new JsonNumberToken(tokens[index]);
    }
    return value;
  });
}

function isSafeIntegerToken(text: string): boolean {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match) return false;
  const digits = match[2] + (match[3] ?? '');
  if (!/[1-9]/.test(digits)) return true;
  const shift = Number(match[4] ?? 0) - (match[3]?.length ?? 0);
  if (!Number.isSafeInteger(shift) || shift > 20 || shift < -digits.length)
    return false;
  let integer = digits;
  if (shift < 0) {
    if (!/^0*$/.test(digits.slice(shift))) return false;
    integer = digits.slice(0, shift) || '0';
  } else {
    integer += '0'.repeat(shift);
  }
  const value = BigInt(`${match[1]}${integer}`);
  return (
    value >= BigInt(Number.MIN_SAFE_INTEGER) &&
    value <= BigInt(Number.MAX_SAFE_INTEGER)
  );
}

function assertSafeNumber(value: unknown, path: string): void {
  if (value instanceof JsonNumberToken && !isSafeIntegerToken(value.text))
    throw new Error(
      `Invalid RPC request: ${path} must be a safe integer or decimal string.`,
    );
}

function assertSafe64BitNumbers(
  type: protobuf.Type,
  value: unknown,
  path: string,
): void {
  if (
    type.fullName === '.google.protobuf.Int64Value' ||
    type.fullName === '.google.protobuf.UInt64Value'
  ) {
    assertSafeNumber(value, path);
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const object = value as Record<string, unknown>;
  if (type.fullName === '.google.protobuf.Any') {
    const typeUrl = object['@type'];
    if (typeof typeUrl !== 'string') return;
    const embedded = type.root.lookupType(typeUrl.slice(typeUrl.lastIndexOf('/') + 1));
    const embeddedValue = embedded.fullName.startsWith('.google.protobuf.')
      ? object.value
      : object;
    assertSafe64BitNumbers(embedded, embeddedValue, path);
    return;
  }
  for (const [name, fieldValue] of Object.entries(object)) {
    const field = type.fieldsArray.find(
      (item) =>
        name === item.name || name === item.jsonName || name === item.protoName,
    );
    if (!field || fieldValue === null) continue;
    field.resolve();
    const check = (item: unknown, itemPath: string): void => {
      if (LONG_TYPES.has(field.type)) assertSafeNumber(item, itemPath);
      else if (field.resolvedType instanceof protobuf.Type)
        assertSafe64BitNumbers(field.resolvedType, item, itemPath);
    };
    const fieldPath = `${path}.${name}`;
    if (field.repeated && Array.isArray(fieldValue))
      fieldValue.forEach((item, index) => check(item, `${fieldPath}[${index}]`));
    else if (field.map && fieldValue && typeof fieldValue === 'object')
      Object.entries(fieldValue).forEach(([key, item]) =>
        check(item, `${fieldPath}[${JSON.stringify(key)}]`),
      );
    else check(fieldValue, fieldPath);
  }
}

export function parseRpcProtoJson(
  type: protobuf.Type,
  json: string,
): protobuf.Message {
  assertSafe64BitNumbers(type, parseNumberTokens(json), type.fullName);
  return protojson.fromJsonString(type, json);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function defaultJsonValue(field: protobuf.Field): unknown {
  if (field.map) return {};
  if (field.repeated) return [];
  if (field.resolvedType instanceof protobuf.Enum) {
    const name = field.resolvedType.valuesById[field.typeDefault as number];
    if (name === undefined) return field.typeDefault;
    return field.resolvedType.valuesOptions?.[name]?.[
      '(pb.enumvalue.json).string'
    ] ?? name;
  }
  if (LONG_TYPES.has(field.type)) return '0';
  if (field.type === 'bool') return false;
  if (field.type === 'string' || field.type === 'bytes') return '';
  return 0;
}

function includeDefaultValues(type: protobuf.Type, json: unknown): void {
  if (!isObject(json)) return;
  if (type.fullName === '.google.protobuf.Any') {
    const typeUrl = json['@type'];
    if (typeof typeUrl === 'string') {
      const embedded = type.root.lookupType(
        typeUrl.slice(typeUrl.lastIndexOf('/') + 1),
      );
      includeDefaultValues(embedded, json);
    }
    return;
  }
  if (SPECIAL_JSON_TYPES.has(type.fullName)) return;

  for (const field of type.fieldsArray) {
    field.resolve();
    const key = field.jsonName;
    if (!Object.prototype.hasOwnProperty.call(json, key)) {
      if (
        field.map ||
        field.repeated ||
        (!field.hasPresence && !(field.resolvedType instanceof protobuf.Type))
      ) {
        // Define the property explicitly to support a custom json_name of __proto__.
        Object.defineProperty(json, key, {
          value: defaultJsonValue(field),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      continue;
    }
    if (!(field.resolvedType instanceof protobuf.Type)) continue;
    const value = json[key];
    if (field.map && isObject(value)) {
      for (const item of Object.values(value))
        includeDefaultValues(field.resolvedType, item);
    } else if (field.repeated && Array.isArray(value)) {
      for (const item of value) includeDefaultValues(field.resolvedType, item);
    } else {
      includeDefaultValues(field.resolvedType, value);
    }
  }
}

export function formatRpcProtoJson(
  type: protobuf.Type,
  message: protobuf.Message,
  showDefaultValues = false,
): unknown {
  const json: unknown = protojson.toJson(type, message);
  if (showDefaultValues) includeDefaultValues(type, json);
  return json;
}
