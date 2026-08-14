import * as fs from 'fs';
import * as path from 'path';

// Recovered from a 2025-06 prototype (see git-notebook local history, never committed - hence
// no git blame to point to) and ported onto today's types/naming. The .md files alongside
// these .yaml fixtures under __tests__/data/cfn/ are the prototype's own hand-checked example
// output and are kept for reference, but are NOT used as exact-match goldens here: they
// predate a bugfix in getCfnIconString (it used to double-prefix icons as
// "logos:logos:aws-ec2") and don't necessarily reflect the exact code that produced them, so
// the assertions below check specific, meaningful lines instead of full-file equality.
export const FIXTURES_DIR = path.join(__dirname, '../data/cfn');

export const readYamlFixture = (relativePath: string): string =>
  fs.readFileSync(path.join(FIXTURES_DIR, relativePath), 'utf-8');
