import { promises as fs } from 'fs';
import * as path from 'path';
import { DbResource, fromJson } from '../../src';

export const RES_FILE_NAMES = [
  'mysqlDbRes.json',
  'postgresDbRes.json',
] as const;
export type ResFileNames = (typeof RES_FILE_NAMES)[number];

const dataFolder = path.join('__tests__', 'data');

export async function saveRes(
  name: ResFileNames,
  res: DbResource,
): Promise<void> {
  const data = res.toJsonStringify();
  await fs.writeFile(path.join(dataFolder, name.toString()), data, {
    encoding: 'utf8',
  });
}

export async function loadRes<T extends DbResource>(
  name: ResFileNames,
): Promise<T> {
  const jsonString = await fs.readFile(path.join(dataFolder, name.toString()), {
    encoding: 'utf8',
  });
  return fromJson<T>(JSON.parse(jsonString));
}
