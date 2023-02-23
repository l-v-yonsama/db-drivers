import * as path from 'path';
import * as fs from 'fs';
import prettyBytes from 'pretty-bytes';
import * as mkdirp from 'mkdirp';
import { promisify } from 'util';
import * as jconv from 'jconv';
import GeneralResponse from '../service/response/GeneralReponse';

export {
  replaceSafeFileName,
  asyncCreateKeyFolder,
  getAppPath,
  createAbsoluteFilePath,
  getAbsTmpDirPath,
  asyncReadFile,
  syncReadFile,
  isAsyncFileExists,
  sizeToString,
  stats,
  asyncGetKeyFile,
};

const AWS = 'aws';
const RDH = 'rdh';
const XLSX = 'xlsx';
const CAPTURE = 'capture';
const REQUEST = 'request';
const MSG_PACK = 'msgpack';
const MSG_PACK_IMAGE = 'msgpack_image';
const REST = 'rest';
const TMP = 'tmp';
const SESSION = 'session';

const BASE_DIRS = [
  AWS,
  RDH,
  REQUEST,
  XLSX,
  CAPTURE,
  MSG_PACK,
  MSG_PACK_IMAGE,
  SESSION,
  REST,
  TMP,
];

function sizeToString(len?: number): string {
  if (len === undefined) {
    return '';
  }
  return prettyBytes(len);
}

function stats(file_path: string): StatsExtra {
  const stat = fs.statSync(file_path);
  const r = <StatsExtra>Object.assign({}, stat);
  r.size_string = sizeToString(stat.size);
  r.type = '';
  r.extension = '';
  r.basename = path.basename(file_path);
  const dot = r.basename.lastIndexOf('.');
  if (dot >= 0) {
    r.extension = r.basename.substring(dot + 1);
    if (r.extension.match(/(jpg|jpeg|png|gif|bmp|tiff|tif)/i)) {
      r.type = 'image/' + r.extension;
    }
  }
  return r;
}

export interface StatsExtra extends fs.Stats {
  size_string: string;
  type: string;
  basename: string;
  extension: string;
}

function getAppPath(): string {
  return './';
}

function createAbsoluteFilePath(
  category: string,
  relative_file_path: string,
): string {
  const userDataDir = getAppPath();
  return path.join(userDataDir, category, relative_file_path);
}

const lpad = (n: number) => (n < 10 ? '0' + n : String(n));

function replaceSafeFileName(name = ''): string {
  return name.replace(/[<>#%{}|\\^~[]`;\?:@=& ]/gi, '_').trim();
}

async function asyncCreateKeyFolder(
  bucket_name: string,
  key: string,
): Promise<string> {
  if (key.startsWith('/')) {
    // remove.
    key = key.substring(1);
  }
  let folders = [];
  if (key.endsWith('/')) {
    // this is folder
    // remove.
    key = key.substring(0, key.length - 1);
    folders = key.split('/');
  } else {
    // this is file
    folders = key.split('/');
    folders.pop(); // remove filename
  }

  const userDataDir = getAppPath();
  const output_dir_path = path.join(userDataDir, AWS, bucket_name, ...folders);
  mkdirp.sync(output_dir_path);
  return output_dir_path;
}

function getAbsTmpDirPath(): string {
  const userDataDir = getAppPath();
  return path.join(userDataDir, TMP);
}

async function isAsyncFileExists(full_path: string): Promise<boolean> {
  const stat = promisify(fs.stat);
  try {
    await stat(full_path);
    return true;
  } catch (e) {
    return false;
  }
}

async function asyncReadFile(
  full_path: string,
  encoding: string | null = null,
): Promise<string | Buffer> {
  return new Promise<string | Buffer>((resolve, reject) => {
    if (encoding && encoding.match(/sjis|jis|eucjp|ucs2|utf16le/i)) {
      fs.readFile(full_path, (err, buf: Buffer) => {
        if (err) {
          reject(err);
        } else {
          // var buf = new Buffer(data, 'binary');
          const retStr = jconv.decode(buf, encoding);
          resolve(retStr);
        }
      });
    } else {
      // log.info(LOG_PREFIX, '#asyncReadFile', full_path)
      fs.readFile(full_path, encoding as BufferEncoding, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  });
}

function syncReadFile(
  full_path: string,
  encoding: BufferEncoding | null = null,
): string | Buffer {
  if (encoding) {
    return fs.readFileSync(full_path, encoding);
  }
  return fs.readFileSync(full_path);
}

async function asyncGetKeyFile(
  bucket_name: string,
  key: string,
): Promise<GeneralResponse> {
  if (key.startsWith('/')) {
    key = key.substring(1);
  }
  if (key.endsWith('/')) {
    // this is folder
    // remove.
    key = key.substring(0, key.length - 1);
  }
  const userDataDir = getAppPath();
  const key_file_path = path.join(
    userDataDir,
    AWS,
    bucket_name,
    ...key.split('/'),
  );
  const exists = await isAsyncFileExists(key_file_path);
  const res = new GeneralResponse(exists, '');
  res.result = key_file_path;
  // log.info(LOG_PREFIX, "key_file_path:res=", res);
  return res;
}
