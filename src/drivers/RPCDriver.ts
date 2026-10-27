import { GeneralColumnType } from '@l-v-yonsama/rdh';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import Long from 'long';
import protobuf from 'protobufjs';
import * as descriptor from 'protobufjs/ext/descriptor';
import {
  RpcDatabase,
  RpcField,
  RpcFieldType,
  RpcCallKind,
  RpcMessage,
  RpcMethod,
  RpcPackage,
  RpcScalarType,
  RpcService,
  getRpcCallKind,
} from '../resource';
import { ConnectionSetting } from '../types';
import { BaseDriver } from './BaseDriver';
import { formatRpcProtoJson, parseRpcProtoJson } from './rpcProtoJson';
import { parseRpcRequestMetadata } from './rpcMetadata';

export type RpcInvokeParams = {
  service: string;
  method: string;
  request: Record<string, unknown>;
  metadata?: Record<string, string | string[]>;
};

export type RpcProtoJsonInvokeParams = {
  service: string;
  method: string;
  requestJson: string;
  metadata?: Record<string, string | string[]>;
};

export type RpcStatus = {
  code: number;
  name: string;
  details: string;
};

export type RpcTextMetadata = Record<string, string[]>;

export type UnaryResult<Contents = Record<string, unknown>> = {
  contents: Contents;
  status: RpcStatus;
  elapsedMs: number;
  headers?: RpcTextMetadata;
  trailers?: RpcTextMetadata;
};

export type RpcProtoJsonStreamParams = {
  service: string;
  method: string;
  metadata?: Record<string, string | string[]>;
  /** Required for server streaming; omitted for client and bidirectional streaming. */
  requestJson?: string;
};

export type RpcStreamKind = Exclude<RpcCallKind, 'unary'>;

export type RpcStreamEvent =
  | { type: 'headers'; headers: RpcTextMetadata }
  | { type: 'sent'; index: number; at: number; contents: unknown }
  | { type: 'received'; index: number; at: number; contents: unknown };

export type RpcStreamCompletion = {
  outcome: 'success' | 'error' | 'cancelled' | 'timeout';
  status?: RpcStatus;
  trailers?: RpcTextMetadata;
  elapsedMs: number;
  sentCount: number;
  receivedCount: number;
  error?: RpcInvokeError;
};

export type RpcStreamSession = {
  kind: RpcStreamKind;
  events: AsyncIterable<RpcStreamEvent>;
  completion: Promise<RpcStreamCompletion>;
  send?: (requestJson: string) => Promise<void>;
  finishSending?: () => Promise<void>;
  cancel: () => void;
};

/** A bounded queue. A stalled consumer cannot retain unlimited response bodies. */
class RpcStreamEventQueue implements AsyncIterable<RpcStreamEvent> {
  private readonly items: Array<{ value: RpcStreamEvent; bytes: number }> = [];
  private readonly readers: Array<(value: IteratorResult<RpcStreamEvent>) => void> = [];
  private ended = false;
  private bufferedBytes = 0;
  onDrain?: () => void;

  get size(): number {
    return this.items.length;
  }

  push(value: RpcStreamEvent): boolean {
    if (this.ended) return false;
    const bytes = Buffer.byteLength(JSON.stringify(value));
    if (bytes > 8 * 1024 * 1024) return false;
    const reader = this.readers.shift();
    if (reader) reader({ value, done: false });
    else if (this.items.length < 256 && this.bufferedBytes + bytes <= 8 * 1024 * 1024) {
      this.items.push({ value, bytes });
      this.bufferedBytes += bytes;
    }
    else return false;
    return true;
  }

  close(): void {
    this.ended = true;
    if (this.items.length) return;
    for (const reader of this.readers.splice(0))
      reader({ value: undefined, done: true });
  }

  async *[Symbol.asyncIterator](): AsyncIterator<RpcStreamEvent> {
    while (true) {
      const item = this.items.shift();
      if (item) {
        this.bufferedBytes -= item.bytes;
        this.onDrain?.();
        yield item.value;
        continue;
      }
      if (this.ended) return;
      const next = await new Promise<IteratorResult<RpcStreamEvent>>((resolve) =>
        this.readers.push(resolve),
      );
      if (next.done) return;
      this.onDrain?.();
      yield next.value;
    }
  }
}

export class RpcInvokeError extends Error {
  readonly kind: 'local' | 'grpc';
  readonly status?: RpcStatus;
  readonly headers?: RpcTextMetadata;
  readonly trailers?: RpcTextMetadata;
  readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      kind: 'local' | 'grpc';
      status?: RpcStatus;
      headers?: RpcTextMetadata;
      trailers?: RpcTextMetadata;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'RpcInvokeError';
    this.kind = options.kind;
    this.status = options.status;
    this.headers = options.headers;
    this.trailers = options.trailers;
    if (options.cause !== undefined)
      Object.defineProperty(this, 'cause', { value: options.cause });
  }
}

function rpcStatus(code: number, details: string): RpcStatus {
  return { code, name: grpc.status[code] ?? 'UNKNOWN', details };
}

function debugMetadata(metadata?: grpc.Metadata): RpcTextMetadata | undefined {
  if (!metadata) return undefined;
  const values: RpcTextMetadata = {};
  for (const [key, rawValues] of Object.entries(metadata.toJSON())) {
    const name = key.toLowerCase();
    if (
      name.endsWith('-bin') ||
      name.startsWith('grpc-') ||
      ['content-type', 'date', 'te', 'user-agent'].includes(name) ||
      /authorization|cookie|token|secret|password|api[-_]?key/.test(name)
    )
      continue;
    const textValues = rawValues.filter(
      (value): value is string => typeof value === 'string',
    );
    if (textValues.length) values[name] = textValues;
  }
  return Object.keys(values).length ? values : undefined;
}

function rpcInvokeError(
  error: unknown,
  headers?: RpcTextMetadata,
  trailers?: RpcTextMetadata,
  finalStatus?: grpc.StatusObject,
): RpcInvokeError {
  if (error instanceof RpcInvokeError) return error;
  const source = error as Partial<grpc.ServiceError> | undefined;
  const code =
    typeof source?.code === 'number' ? source.code : finalStatus?.code;
  const details = source?.details ?? finalStatus?.details ?? '';
  const status = code === undefined ? undefined : rpcStatus(code, details);
  const message = error instanceof Error ? error.message : String(error);
  return new RpcInvokeError(
    status ? `${message} statusCode:${status.code}` : message,
    {
      kind: status ? 'grpc' : 'local',
      status,
      headers,
      trailers: trailers ?? debugMetadata(source?.metadata),
      cause: error,
    },
  );
}

// The wire fields used by this client from the canonical gRPC reflection v1 proto:
// https://github.com/grpc/grpc-proto/blob/master/grpc/reflection/v1/reflection.proto
const REFLECTION_V1_PROTO = `
syntax = "proto3";
package grpc.reflection.v1;
service ServerReflection {
  rpc ServerReflectionInfo(stream ServerReflectionRequest)
      returns (stream ServerReflectionResponse);
}
message ServerReflectionRequest {
  oneof message_request {
    string file_by_filename = 3;
    string file_containing_symbol = 4;
    string list_services = 7;
  }
}
message ServerReflectionResponse {
  oneof message_response {
    FileDescriptorResponse file_descriptor_response = 4;
    ListServiceResponse list_services_response = 6;
    ErrorResponse error_response = 7;
  }
}
message FileDescriptorResponse { repeated bytes file_descriptor_proto = 1; }
message ListServiceResponse { repeated ServiceResponse service = 1; }
message ServiceResponse { string name = 1; }
message ErrorResponse { int32 error_code = 1; string error_message = 2; }
`;

const REFLECTION_DEFINITION = protoLoader.fromJSON(
  protobuf.parse(REFLECTION_V1_PROTO).root.toJSON(),
)['grpc.reflection.v1.ServerReflection'] as protoLoader.ServiceDefinition;

const REFLECTION_UNIMPLEMENTED_MESSAGE =
  'This server does not implement gRPC server reflection. Select "Local proto" in "Definition source" and configure a .proto file.';

const SCALARS = new Set<string>([
  'double',
  'float',
  'int32',
  'int64',
  'uint32',
  'uint64',
  'sint32',
  'sint64',
  'fixed32',
  'fixed64',
  'sfixed32',
  'sfixed64',
  'bool',
  'string',
  'bytes',
]);

function stripDot(name: string): string {
  return name.replace(/^\./, '');
}

function packageOf(value: protobuf.ReflectionObject): string {
  let parent = value.parent;
  while (parent instanceof protobuf.Type) parent = parent.parent;
  return parent && !(parent instanceof protobuf.Root)
    ? stripDot(parent.fullName)
    : '';
}

function fieldType(field: protobuf.Field): RpcFieldType {
  field.resolve();
  let element: RpcFieldType;
  if (SCALARS.has(field.type)) {
    element = { kind: 'scalar', scalar: field.type as RpcScalarType };
  } else if (field.resolvedType instanceof protobuf.Type) {
    element = {
      kind: 'message',
      typeName: stripDot(field.resolvedType.fullName),
    };
  } else if (field.resolvedType instanceof protobuf.Enum) {
    element = {
      kind: 'enum',
      typeName: stripDot(field.resolvedType.fullName),
      values: { ...field.resolvedType.values },
    };
  } else {
    throw new Error(`Unsupported protobuf field type: ${field.type}`);
  }
  if (field.map)
    return {
      kind: 'map',
      key: (field as unknown as protobuf.MapField).keyType as RpcScalarType,
      value: element,
    };
  if (field.repeated) return { kind: 'repeated', element };
  return element;
}

function generalType(type: RpcFieldType): GeneralColumnType {
  if (type.kind === 'map') return GeneralColumnType.JSON;
  if (type.kind === 'repeated') return GeneralColumnType.ARRAY;
  if (type.kind === 'message') return GeneralColumnType.OBJECT;
  if (type.kind === 'enum') return GeneralColumnType.ENUM;
  switch (type.scalar) {
    case 'bool':
      return GeneralColumnType.BOOLEAN;
    case 'string':
      return GeneralColumnType.TEXT;
    case 'bytes':
      return GeneralColumnType.BINARY;
    case 'float':
      return GeneralColumnType.FLOAT;
    case 'double':
      return GeneralColumnType.DOUBLE_PRECISION;
    case 'int64':
    case 'uint64':
    case 'sint64':
    case 'fixed64':
    case 'sfixed64':
      return GeneralColumnType.BIGINT;
    default:
      return GeneralColumnType.INTEGER;
  }
}

function isServiceDefinition(
  value: protoLoader.AnyDefinition,
): value is protoLoader.ServiceDefinition {
  return typeof value === 'object' && value !== null && !('format' in value);
}

const LONG_TYPES = new Set([
  'int64',
  'uint64',
  'sint64',
  'fixed64',
  'sfixed64',
]);
const SIGNED_32_TYPES = new Set(['int32', 'sint32', 'sfixed32']);
const UNSIGNED_32_TYPES = new Set(['uint32', 'fixed32']);

function check32BitInteger(
  value: unknown,
  scalar: string,
  fieldName: string,
): void {
  const min = SIGNED_32_TYPES.has(scalar) ? -2147483648 : 0;
  const max = SIGNED_32_TYPES.has(scalar) ? 2147483647 : 4294967295;
  if (typeof value !== 'number' || !Number.isInteger(value))
    throw new Error(`Invalid RPC request: ${fieldName} must be an integer.`);
  if (value < min || value > max)
    throw new Error(
      `Invalid RPC request: ${fieldName} is outside its ${scalar} range.`,
    );
}

function parse64BitInteger(
  value: unknown,
  scalar: string,
  fieldName: string,
): Long {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value))
      throw new Error(
        `Invalid RPC request: ${fieldName} must be a safe integer or decimal string.`,
      );
    value = String(value);
  }
  if (typeof value !== 'string')
    throw new Error(
      `Invalid RPC request: ${fieldName} must be a safe integer or decimal string.`,
    );
  if (!/^-?\d+$/.test(value))
    throw new Error(
      `Invalid RPC request: ${fieldName} must be a decimal integer.`,
    );
  const unsigned = scalar === 'uint64' || scalar === 'fixed64';
  const canonical = `${value.startsWith('-') ? '-' : ''}${value
    .replace(/^-/, '')
    .replace(/^0+(?=\d)/, '')}`.replace(/^-0$/, '0');
  const long = Long.fromString(value, unsigned);
  if (long.toString() !== canonical)
    throw new Error(
      `Invalid RPC request: ${fieldName} is outside its 64-bit range.`,
    );
  return long;
}

function checkMapKey(key: string, keyType: string, fieldName: string): void {
  if (keyType === 'bool') {
    if (key !== 'true' && key !== 'false')
      throw new Error(
        `Invalid RPC request: ${fieldName} has an invalid bool key.`,
      );
  } else if (LONG_TYPES.has(keyType)) {
    parse64BitInteger(key, keyType, `${fieldName} map key`);
  } else if (SIGNED_32_TYPES.has(keyType) || UNSIGNED_32_TYPES.has(keyType)) {
    if (!/^-?\d+$/.test(key))
      throw new Error(
        `Invalid RPC request: ${fieldName} has an invalid ${keyType} key.`,
      );
    check32BitInteger(Number(key), keyType, `${fieldName} map key`);
  }
}

function normalizeRequest(
  type: protobuf.Type,
  value: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...value };
  for (const key of Object.keys(result)) {
    if (!type.fields[key])
      throw new Error(`Invalid RPC request: unknown field ${key}.`);
  }
  for (const field of type.fieldsArray) {
    const fieldValue = value[field.name];
    if (fieldValue === undefined || fieldValue === null) continue;
    field.resolve();
    const normalizeValue = (item: unknown): unknown => {
      if (LONG_TYPES.has(field.type))
        return parse64BitInteger(item, field.type, field.name);
      if (SIGNED_32_TYPES.has(field.type) || UNSIGNED_32_TYPES.has(field.type))
        check32BitInteger(item, field.type, field.name);
      if (
        field.resolvedType instanceof protobuf.Enum &&
        typeof item === 'string'
      ) {
        const enumValue = field.resolvedType.values[item];
        if (enumValue === undefined)
          throw new Error(`Invalid RPC request: unknown enum value ${item}.`);
        return enumValue;
      }
      if (
        field.resolvedType instanceof protobuf.Type &&
        item &&
        typeof item === 'object' &&
        !Buffer.isBuffer(item)
      ) {
        return normalizeRequest(
          field.resolvedType,
          item as Record<string, unknown>,
        );
      }
      return item;
    };
    if (
      field.map &&
      fieldValue &&
      typeof fieldValue === 'object' &&
      !Array.isArray(fieldValue)
    ) {
      const keyType = (field as unknown as protobuf.MapField).keyType;
      result[field.name] = Object.fromEntries(
        Object.entries(fieldValue).map(([key, item]) => {
          checkMapKey(key, keyType, field.name);
          return [key, normalizeValue(item)];
        }),
      );
    } else if (field.repeated && Array.isArray(fieldValue)) {
      result[field.name] = fieldValue.map(normalizeValue);
    } else {
      result[field.name] = normalizeValue(fieldValue);
    }
  }
  return result;
}

export class RPCDriver extends BaseDriver<RpcDatabase> {
  private client?: grpc.Client;
  private root?: protobuf.Root;
  private packageDefinition?: protoLoader.PackageDefinition;
  private protoPath?: string;
  private reflectedServiceNames?: Set<string>;
  private reflectionVersion: 'v1' | 'v1alpha' = 'v1';

  constructor(setting: ConnectionSetting) {
    super(setting);
  }

  private getTimeout(kind: 'connect' | 'query'): number {
    const value =
      kind === 'connect'
        ? this.conRes.connectTimeoutMs
        : this.conRes.queryTimeoutMs;
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
      throw new Error(`${kind} timeout must be a positive number.`);
    }
    return value ?? 10000;
  }

  private getStreamTimeout(): number {
    const value = this.conRes.rpc.streamTimeoutMs;
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
      throw new Error('rpc.streamTimeoutMs must be zero or a positive number.');
    return value ?? 300000;
  }

  private validateSetting(): void {
    const rpc = this.conRes.rpc;
    if (!rpc) throw new Error('RPC settings are required.');
    if (
      rpc.discovery !== undefined &&
      !['reflection', 'proto', 'verify'].includes(rpc.discovery)
    )
      throw new Error('Unsupported RPC definition source.');
    if (
      rpc.showDefaultValues !== undefined &&
      typeof rpc.showDefaultValues !== 'boolean'
    )
      throw new Error('rpc.showDefaultValues must be a boolean.');
    this.getStreamTimeout();
    if (rpc.discovery !== 'reflection' && !rpc.protoFilePath?.trim())
      throw new Error('rpc.protoFilePath is required for local proto.');
    if (
      !this.conRes.host ||
      !Number.isInteger(this.conRes.port) ||
      this.conRes.port < 1 ||
      this.conRes.port > 65535
    ) {
      throw new Error('RPC host and port are required.');
    }
    const auth = this.conRes.rpc.authentication ?? { type: 'none' as const };
    if (auth.type !== 'none' && auth.type !== 'bearer') {
      throw new Error('Unsupported RPC authentication type.');
    }
    const secure = this.conRes.ssl?.use === true;
    if (auth.type === 'bearer') {
      if (!secure) throw new Error('Bearer authentication requires TLS.');
      if (!auth.token?.trim()) throw new Error('Bearer token is required.');
    } else if (secure) {
      throw new Error('TLS without Bearer authentication is not supported.');
    }
    if (!secure && this.conRes.rpc.caFilePath)
      throw new Error('caFilePath requires TLS.');
    this.getTimeout('connect');
    this.getTimeout('query');
  }

  private loadRoot(filename: string, includeDirs: string[]): protobuf.Root {
    const root = new protobuf.Root();
    const baseResolve = root.resolvePath.bind(root);
    root.resolvePath = (origin, target): string => {
      if (path.isAbsolute(target) && fs.existsSync(target)) return target;
      const fromOrigin = origin
        ? path.resolve(path.dirname(origin), target)
        : path.resolve(target);
      if (fs.existsSync(fromOrigin)) return fromOrigin;
      for (const dir of includeDirs) {
        const candidate = path.resolve(dir, target);
        if (fs.existsSync(candidate)) return candidate;
      }
      return baseResolve(origin, target);
    };
    root.loadSync(filename, { keepCase: true });
    root.resolveAll();
    return root;
  }

  async connectSub(): Promise<string> {
    try {
      this.validateSetting();
      const rpc = this.conRes.rpc;
      if (rpc.discovery !== 'reflection') {
        this.protoPath = path.resolve(rpc.protoFilePath);
        if (!fs.existsSync(this.protoPath))
          throw new Error(`Proto file not found: ${this.protoPath}`);
        const includeDirs = (rpc.includeDirs ?? []).map((p) => path.resolve(p));
        this.root = this.loadRoot(this.protoPath, includeDirs);
        this.packageDefinition = protoLoader.loadSync(this.protoPath, {
          includeDirs: [path.dirname(this.protoPath), ...includeDirs],
          keepCase: true,
          longs: String,
          enums: String,
          defaults: false,
        });
      }

      let credentials: grpc.ChannelCredentials;
      if (rpc.authentication?.type === 'bearer') {
        const ca = rpc.caFilePath
          ? fs.readFileSync(path.resolve(rpc.caFilePath))
          : undefined;
        const ssl = grpc.credentials.createSsl(ca);
        const token = rpc.authentication.token;
        const call = grpc.credentials.createFromMetadataGenerator(
          (_params, callback) => {
            const metadata = new grpc.Metadata();
            metadata.set('authorization', `Bearer ${token}`);
            callback(null, metadata);
          },
        );
        credentials = grpc.credentials.combineChannelCredentials(ssl, call);
      } else {
        credentials = grpc.credentials.createInsecure();
      }

      const client = new grpc.Client(
        `${this.conRes.host}:${this.conRes.port}`,
        credentials,
      );
      this.client = client;
      await new Promise<void>((resolve, reject) => {
        client.waitForReady(Date.now() + this.getTimeout('connect'), (error) =>
          error ? reject(error) : resolve(),
        );
      });
      if (rpc.discovery === 'reflection') await this.loadReflectedSchema();
      return '';
    } catch (error) {
      try {
        await this.closeSub();
      } catch {
        // Preserve the original connection error if closing the channel fails.
      }
      return error instanceof Error ? error.message : String(error);
    }
  }

  async closeSub(): Promise<string> {
    const client = this.client;
    this.client = undefined;
    this.root = undefined;
    this.packageDefinition = undefined;
    this.protoPath = undefined;
    this.reflectedServiceNames = undefined;
    this.reflectionVersion = 'v1';
    client?.close();
    return '';
  }

  async test(with_connect = false): Promise<string> {
    if (!with_connect)
      return this.isConnected ? '' : 'RPC client is not connected.';
    const error = await this.connect();
    if (error) return error;
    return this.disconnect();
  }

  private async reflectionRequest(
    request: Record<string, unknown>,
  ): Promise<Record<string, any>> {
    try {
      return await this.reflectionRequestVersion(request);
    } catch (error) {
      if ((error as grpc.ServiceError).code !== grpc.status.UNIMPLEMENTED)
        throw error;
      if (this.reflectionVersion === 'v1') {
        this.reflectionVersion = 'v1alpha';
        try {
          return await this.reflectionRequestVersion(request);
        } catch (fallbackError) {
          if (
            (fallbackError as grpc.ServiceError).code !==
            grpc.status.UNIMPLEMENTED
          )
            throw fallbackError;
        }
      }
      throw new Error(REFLECTION_UNIMPLEMENTED_MESSAGE);
    }
  }

  private reflectionRequestVersion(
    request: Record<string, unknown>,
  ): Promise<Record<string, any>> {
    const method = REFLECTION_DEFINITION.ServerReflectionInfo;
    return new Promise((resolve, reject) => {
      const stream = this.client.makeBidiStreamRequest(
        method.path.replace('.v1.', `.${this.reflectionVersion}.`),
        method.requestSerialize,
        method.responseDeserialize,
        new grpc.Metadata(),
        { deadline: Date.now() + this.getTimeout('query') },
      );
      let received = false;
      stream.on('data', (response: Record<string, any>) => {
        if (received) return;
        received = true;
        if (response.errorResponse) {
          const { errorCode, errorMessage } = response.errorResponse;
          reject(
            Object.assign(
              new Error(
                `Server reflection error ${errorCode}: ${errorMessage}`,
              ),
              { code: errorCode },
            ),
          );
        } else resolve(response);
        // One request per stream ensures dependencies are not omitted because
        // the server sent them in an earlier response on the same stream.
        stream.cancel();
      });
      stream.on('error', (error: grpc.ServiceError) => {
        if (!received) reject(error);
      });
      stream.on('end', () => {
        if (!received)
          reject(new Error('Server reflection returned no response.'));
      });
      stream.write(request);
      stream.end();
    });
  }

  private async loadReflectedSchema(): Promise<void> {
    const list = await this.reflectionRequest({ listServices: '' });
    if (!list.listServicesResponse)
      throw new Error('Server reflection returned no service list.');
    const names = new Set<string>(
      (list.listServicesResponse.service ?? [])
        .map((service: { name: string }) => service.name)
        .filter((name: string) => !name.startsWith('grpc.reflection.')),
    );
    const files = new Map<string, descriptor.IFileDescriptorProto>();
    const addFiles = (response: Record<string, any>): void => {
      const buffers: Buffer[] =
        response.fileDescriptorResponse?.fileDescriptorProto ?? [];
      if (!buffers.length)
        throw new Error('Server reflection returned no file descriptors.');
      for (const buffer of buffers) {
        const file = descriptor.FileDescriptorProto.decode(
          buffer,
        ) as descriptor.IFileDescriptorProto;
        if (!file.name)
          throw new Error('Reflected file descriptor has no name.');
        files.set(file.name, file);
      }
    };
    for (const name of names) {
      const alreadyLoaded = [...files.values()].some((file) =>
        file.service?.some(
          (service) =>
            `${file.package ? `${file.package}.` : ''}${service.name}` === name,
        ),
      );
      if (!alreadyLoaded)
        addFiles(await this.reflectionRequest({ fileContainingSymbol: name }));
    }
    // Request dependencies explicitly too, for implementations that return
    // only the directly requested file rather than its transitive imports.
    const requested = new Set<string>();
    const missingDependencies = (): string[] =>
      [...files.values()]
        .flatMap((file) => (file.dependency ?? []) as string[])
        .filter((name) => !files.has(name));
    let missing = missingDependencies();
    while (missing.length) {
      for (const name of new Set(missing)) {
        if (files.has(name)) continue;
        if (requested.has(name))
          throw new Error(
            `Server reflection did not return dependency: ${name}`,
          );
        requested.add(name);
        addFiles(await this.reflectionRequest({ fileByFilename: name }));
      }
      missing = missingDependencies();
    }
    const set = { file: [...files.values()] };
    // protobufjs/ext/descriptor installs this static method at runtime.
    const root = (
      protobuf.Root as typeof protobuf.Root & {
        fromDescriptor(set: descriptor.IFileDescriptorSet): protobuf.Root;
      }
    ).fromDescriptor(set, { keepCase: true });
    for (const name of names) root.lookupService(name);
    this.packageDefinition = protoLoader.fromJSON(root.toJSON(), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: false,
    });
    this.root = root;
    this.reflectedServiceNames = names;
  }

  private async advertisedServices(): Promise<
    Map<string, descriptor.IServiceDescriptorProto>
  > {
    const list = await this.reflectionRequest({ listServices: '' });
    const names: string[] = (list.listServicesResponse?.service ?? []).map(
      (s: { name: string }) => s.name,
    );
    const services = new Map<string, descriptor.IServiceDescriptorProto>();
    for (const name of names) {
      if (
        !this.packageDefinition[name] ||
        !isServiceDefinition(this.packageDefinition[name])
      )
        continue;
      const response = await this.reflectionRequest({
        fileContainingSymbol: name,
      });
      const buffers: Buffer[] =
        response.fileDescriptorResponse?.fileDescriptorProto ?? [];
      let found: descriptor.IServiceDescriptorProto;
      for (const buffer of buffers) {
        const file = descriptor.FileDescriptorProto.decode(
          buffer,
        ) as descriptor.IFileDescriptorProto;
        const packageName = file.package ? `${file.package}.` : '';
        found = file.service?.find((s) => `${packageName}${s.name}` === name);
        if (found) break;
      }
      if (!found)
        throw new Error(
          `SCHEMA_MISMATCH: service ${name} has no reflected descriptor.`,
        );
      services.set(name, found);
    }
    return services;
  }

  private entryServices(): protobuf.Service[] {
    const services: protobuf.Service[] = [];
    const visit = (namespace: protobuf.Namespace): void => {
      for (const child of namespace.nestedArray) {
        if (child instanceof protobuf.Service) {
          if (
            this.reflectedServiceNames
              ? this.reflectedServiceNames.has(stripDot(child.fullName))
              : path.resolve(child.filename ?? '') === this.protoPath
          )
            services.push(child);
        } else if (child instanceof protobuf.Namespace) visit(child);
      }
    };
    visit(this.root);
    return services.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async getInfomationSchemasSub(): Promise<RpcDatabase[]> {
    if (!this.client || !this.root || !this.packageDefinition)
      throw new Error('RPC client is not connected.');
    const advertised =
      this.conRes.rpc.discovery === 'verify'
        ? await this.advertisedServices()
        : undefined;
    const database = new RpcDatabase(`${this.conRes.host}:${this.conRes.port}`);
    const packages = new Map<string, RpcPackage>();
    const messages = new Map<string, protobuf.Type>();
    const methodNodes: RpcMethod[] = [];
    const getPackage = (name: string): RpcPackage => {
      if (!packages.has(name))
        packages.set(name, new RpcPackage(name || '(default)'));
      return packages.get(name);
    };
    const collectMessage = (type: protobuf.Type): void => {
      const name = stripDot(type.fullName);
      if (messages.has(name)) return;
      messages.set(name, type);
      for (const field of type.fieldsArray) {
        field.resolve();
        if (field.resolvedType instanceof protobuf.Type)
          collectMessage(field.resolvedType);
      }
    };

    for (const service of this.entryServices()) {
      const fullName = stripDot(service.fullName);
      const runtime = this.packageDefinition[fullName];
      if (!runtime || !isServiceDefinition(runtime))
        throw new Error(
          `SCHEMA_MISMATCH: ${fullName} is missing from proto-loader.`,
        );
      if (advertised && !advertised.has(fullName)) continue;
      const reflected = advertised?.get(fullName);
      const node = new RpcService(
        service.name,
        fullName,
        advertised || this.reflectedServiceNames ? 'advertised' : 'declared',
      );
      for (const method of service.methodsArray.sort((a, b) =>
        a.name.localeCompare(b.name),
      )) {
        method.resolve();
        const inputType = stripDot(method.resolvedRequestType.fullName);
        const outputType = stripDot(method.resolvedResponseType.fullName);
        const rpcPath = `/${fullName}/${method.name}`;
        const runtimeMethod = Object.values(runtime).find(
          (m) => m.path === rpcPath,
        );
        if (!runtimeMethod)
          throw new Error(
            `SCHEMA_MISMATCH: ${rpcPath} is missing from proto-loader.`,
          );
        if (reflected) {
          const remote = reflected.method?.find((m) => m.name === method.name);
          if (
            !remote ||
            stripDot(remote.inputType ?? '') !== inputType ||
            stripDot(remote.outputType ?? '') !== outputType ||
            !!remote.clientStreaming !== !!method.requestStream ||
            !!remote.serverStreaming !== !!method.responseStream
          ) {
            throw new Error(
              `SCHEMA_MISMATCH: ${rpcPath} differs from server reflection.`,
            );
          }
        }
        const methodNode = node.addChild(
          new RpcMethod(
            method.name,
            rpcPath,
            inputType,
            outputType,
            !!method.requestStream,
            !!method.responseStream,
          ),
        );
        methodNodes.push(methodNode);
        collectMessage(method.resolvedRequestType);
        collectMessage(method.resolvedResponseType);
      }
      getPackage(packageOf(service)).addChild(node);
    }

    const definitions = [...messages.values()]
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((type) => {
        const node = new RpcMessage(type.name, stripDot(type.fullName));
        for (const field of type.fieldsArray.sort((a, b) => a.id - b.id)) {
          const typeInfo = fieldType(field);
          const proto3Optional = field.options?.proto3_optional === true;
          const presence: RpcField['presence'] = field.map
            ? 'map'
            : field.repeated
            ? 'repeated'
            : field.partOf ||
              field.required ||
              field.resolvedType instanceof protobuf.Type ||
              field.toJSON().rule === 'optional'
            ? 'explicit'
            : 'implicit';
          node.addChild(
            new RpcField(
              field.name,
              field.id,
              typeInfo,
              generalType(typeInfo),
              presence,
              proto3Optional ? undefined : field.partOf?.name,
              field.jsonName,
              {
                deprecated: field.options?.deprecated === true,
                proto3Optional,
                required: field.required,
                jsonNameOption:
                  field.jsonName !==
                  field.name.replace(/_([a-z0-9])/g, (_, character: string) =>
                    character.toUpperCase(),
                  )
                    ? field.jsonName
                    : undefined,
              },
            ),
          );
        }
        return node;
      });
    database.messageDefinitions = definitions;
    const definitionsByName = new Map(
      definitions.map((definition) => [definition.fullName, definition]),
    );
    for (const method of methodNodes) {
      for (const [direction, typeName] of [
        ['request', method.inputType],
        ['response', method.outputType],
      ] as const) {
        const definition = definitionsByName.get(typeName);
        if (!definition)
          throw new Error(`SCHEMA_MISMATCH: ${typeName} is not defined.`);
        const message = method.addChild(
          new RpcMessage(definition.name, definition.fullName, direction),
        );
        for (const field of definition.children) {
          message.addChild(field.clone());
        }
      }
    }
    for (const pkg of [...packages.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v))
      database.addChild(pkg);
    database.expandMessageReferences();
    return [database];
  }

  private unaryMethod(
    serviceName: string,
    methodName: string,
  ): protoLoader.MethodDefinition<object, object> {
    if (!this.isConnected || !this.client || !this.packageDefinition || !this.root)
      throw new Error('RPC client is not connected.');
    const service = this.packageDefinition[serviceName];
    if (!service || !isServiceDefinition(service))
      throw new Error(`Unknown RPC service: ${serviceName}`);
    const rpcPath = `/${serviceName}/${methodName}`;
    const method = Object.values(service).find((item) => item.path === rpcPath);
    if (!method) throw new Error(`Unknown RPC method: ${rpcPath}`);
    if (method.requestStream || method.responseStream)
      throw new Error(`Streaming RPC is not supported: ${rpcPath}`);
    return method;
  }

  private requestMetadata(values?: Record<string, string | string[]>): grpc.Metadata {
    const metadata = new grpc.Metadata();
    for (const [key, value] of Object.entries(parseRpcRequestMetadata(values))) {
      for (const item of Array.isArray(value) ? value : [value])
        metadata.add(key, item);
    }
    return metadata;
  }

  private async executeUnary<Request, Response, Contents>(
    path: string,
    serialize: (request: Request) => Buffer,
    deserialize: (buffer: Buffer) => Response,
    request: Request,
    metadata: grpc.Metadata,
    responseContents: (response: Response) => Contents,
  ): Promise<UnaryResult<Contents>> {
    const startedAt = performance.now();
    return new Promise<UnaryResult<Contents>>((resolve, reject) => {
      let headers: RpcTextMetadata | undefined;
      let callbackError: grpc.ServiceError | null = null;
      let conversionError: unknown;
      let contents: Contents | undefined;
      let callbackDone = false;
      let finalStatus: grpc.StatusObject | undefined;
      let settled = false;
      const finish = (): void => {
        if (settled || !callbackDone || !finalStatus) return;
        settled = true;
        const trailers = debugMetadata(finalStatus.metadata);
        if (conversionError) {
          reject(rpcInvokeError(conversionError, headers, trailers));
          return;
        }
        if (callbackError || finalStatus.code !== grpc.status.OK) {
          const error =
            callbackError ??
            new Error(
              `${finalStatus.code} ${grpc.status[finalStatus.code]}: ${finalStatus.details}`,
            );
          reject(rpcInvokeError(error, headers, trailers, finalStatus));
          return;
        }
        const result: UnaryResult<Contents> = {
          contents: contents ?? ({} as Contents),
          status: rpcStatus(finalStatus.code, finalStatus.details),
          elapsedMs: Math.max(0, Math.round(performance.now() - startedAt)),
        };
        if (headers) result.headers = headers;
        if (trailers) result.trailers = trailers;
        resolve(result);
      };
      const call = this.client.makeUnaryRequest(
        path,
        serialize,
        deserialize,
        request,
        metadata,
        { deadline: Date.now() + this.getTimeout('query') },
        (error, response) => {
          callbackError = error;
          if (response !== undefined) {
            try {
              contents = responseContents(response);
            } catch (cause) {
              conversionError = cause;
            }
          }
          callbackDone = true;
          finish();
        },
      );
      call.on('metadata', (value) => {
        headers = debugMetadata(value);
      });
      call.on('status', (value) => {
        finalStatus = value;
        finish();
      });
    });
  }

  async invokeUnary(params: RpcInvokeParams): Promise<UnaryResult> {
    try {
      const method = this.unaryMethod(params.service, params.method);
      if (!params.request || typeof params.request !== 'object' || Array.isArray(params.request))
        throw new Error('RPC request must be an object.');
      const requestType = this.root.lookupService(params.service).methods[
        params.method
      ].resolvedRequestType;
      const normalizedRequest = normalizeRequest(requestType, params.request);
      const validationError = requestType.verify(normalizedRequest);
      if (validationError)
        throw new Error(`Invalid RPC request: ${validationError}`);
      return await this.executeUnary(
        method.path,
        method.requestSerialize,
        method.responseDeserialize,
        normalizedRequest,
        this.requestMetadata(params.metadata),
        (response) => response as Record<string, unknown>,
      );
    } catch (error) {
      throw rpcInvokeError(error);
    }
  }

  async invokeUnaryProtoJson(
    params: RpcProtoJsonInvokeParams,
  ): Promise<UnaryResult<unknown>> {
    try {
      const method = this.unaryMethod(params.service, params.method);
      const reflectedMethod = this.root.lookupService(params.service).methods[
        params.method
      ];
      const requestType = reflectedMethod.resolvedRequestType;
      const responseType = reflectedMethod.resolvedResponseType;
      const request = parseRpcProtoJson(requestType, params.requestJson);
      return await this.executeUnary(
        method.path,
        (value) => Buffer.from(requestType.encode(value).finish()),
        (buffer) => responseType.decode(buffer),
        request,
        this.requestMetadata(params.metadata),
        (response) =>
          formatRpcProtoJson(
            responseType,
            response,
            this.conRes.rpc?.showDefaultValues === true,
          ),
      );
    } catch (error) {
      throw rpcInvokeError(error);
    }
  }

  openProtoJsonStream(params: RpcProtoJsonStreamParams): RpcStreamSession {
    try {
      if (!this.isConnected || !this.client || !this.root || !this.packageDefinition)
        throw new Error('RPC client is not connected.');
      const service = this.packageDefinition[params.service];
      if (!service || !isServiceDefinition(service))
        throw new Error(`Unknown RPC service: ${params.service}`);
      const path = `/${params.service}/${params.method}`;
      const method = Object.values(service).find((item) => item.path === path);
      const reflected = this.root.lookupService(params.service).methods[params.method];
      if (!method || !reflected) throw new Error(`Unknown RPC method: ${path}`);
      const kind = getRpcCallKind(method);
      if (kind === 'unary')
        throw new Error(`Not a streaming RPC method: ${path}`);
      if (kind !== 'serverStreaming' && params.requestJson !== undefined)
        throw new Error('The initial request is only supported for server streaming.');
      if (kind === 'serverStreaming' && params.requestJson === undefined)
        throw new Error('Server streaming requires an initial request.');
      const requestType = reflected.resolvedRequestType;
      const responseType = reflected.resolvedResponseType;
      const initialRequest =
        kind === 'serverStreaming'
          ? parseRpcProtoJson(requestType, params.requestJson)
          : undefined;
      const initialContents = initialRequest
        ? formatRpcProtoJson(requestType, initialRequest)
        : undefined;
      const metadata = this.requestMetadata(params.metadata);
      const timeout = this.getStreamTimeout();
      const options: grpc.CallOptions = timeout
        ? { deadline: Date.now() + timeout }
        : {};
      const queue = new RpcStreamEventQueue();
      const startedAt = performance.now();
      let resolveCompletion: (value: RpcStreamCompletion) => void;
      const completion = new Promise<RpcStreamCompletion>((resolve) => {
        resolveCompletion = resolve;
      });
      let headers: RpcTextMetadata | undefined;
      let finalStatus: grpc.StatusObject | undefined;
      let callError: unknown;
      let conversionError: unknown;
      let callbackDone = false;
      let settled = false;
      let explicitCancel = false;
      let sendingClosed = false;
      let sentCount = 0;
      let receivedCount = 0;
      let watchdog: NodeJS.Timeout | undefined;
      let writeChain = Promise.resolve();
      let readable:
        | grpc.ClientReadableStream<protobuf.Message>
        | grpc.ClientDuplexStream<protobuf.Message, protobuf.Message>;
      let writable:
        | grpc.ClientWritableStream<protobuf.Message>
        | grpc.ClientDuplexStream<protobuf.Message, protobuf.Message>;
      let call:
        | grpc.ClientReadableStream<protobuf.Message>
        | grpc.ClientWritableStream<protobuf.Message>
        | grpc.ClientDuplexStream<protobuf.Message, protobuf.Message>;

      const push = (event: RpcStreamEvent): void => {
        if (queue.push(event)) {
          if (readable && queue.size >= 128) readable.pause();
          return;
        }
        if (!settled && !conversionError) {
          conversionError = new Error('RPC stream event buffer is full.');
          call.cancel();
          armWatchdog();
        }
      };
      queue.onDrain = (): void => {
        if (readable && queue.size <= 64 && !settled) readable.resume();
      };

      const finish = (force = false): void => {
        if (settled) return;
        if (!force && (!finalStatus || (kind === 'clientStreaming' && !callbackDone)))
          return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        queue.close();
        const trailers = debugMetadata(finalStatus?.metadata);
        const status = finalStatus
          ? rpcStatus(finalStatus.code, finalStatus.details)
          : undefined;
        const sourceError =
          conversionError ??
          callError ??
          (force && kind === 'clientStreaming' && !callbackDone
            ? new Error('RPC stream ended without a response callback.')
            : undefined);
        const outcome: RpcStreamCompletion['outcome'] = explicitCancel
          ? 'cancelled'
          : status?.code === grpc.status.DEADLINE_EXCEEDED
          ? 'timeout'
          : sourceError || !status || status.code !== grpc.status.OK
          ? 'error'
          : 'success';
        const result: RpcStreamCompletion = {
          outcome,
          elapsedMs: Math.max(0, Math.round(performance.now() - startedAt)),
          sentCount,
          receivedCount,
        };
        if (status) result.status = status;
        if (trailers) result.trailers = trailers;
        if (outcome === 'error')
          result.error = rpcInvokeError(
            sourceError ?? new Error(status?.details || 'RPC stream failed.'),
            headers,
            trailers,
            finalStatus,
          );
        resolveCompletion(result);
      };
      const armWatchdog = (): void => {
        if (watchdog || settled) return;
        watchdog = setTimeout(() => finish(true), 1000);
        watchdog.unref?.();
      };
      const onResponse = (
        error: grpc.ServiceError | null,
        response?: protobuf.Message,
      ): void => {
        if (settled) return;
        if (error) callError = error;
        if (response !== undefined) {
          try {
            const contents = formatRpcProtoJson(
              responseType,
              response,
              this.conRes.rpc?.showDefaultValues === true,
            );
            receivedCount += 1;
            push({ type: 'received', index: receivedCount, at: Date.now(), contents });
          } catch (cause) {
            conversionError = cause;
          }
        }
        callbackDone = true;
        finish();
      };
      const serialize = (value: protobuf.Message): Buffer =>
        Buffer.from(requestType.encode(value).finish());
      const deserialize = (value: Buffer): protobuf.Message =>
        responseType.decode(value);

      if (kind === 'serverStreaming') {
        readable = this.client.makeServerStreamRequest(
          path,
          serialize,
          deserialize,
          initialRequest,
          metadata,
          options,
        );
        call = readable;
      } else if (kind === 'clientStreaming') {
        writable = this.client.makeClientStreamRequest(
          path,
          serialize,
          deserialize,
          metadata,
          options,
          onResponse,
        );
        call = writable;
      } else {
        const duplex = this.client.makeBidiStreamRequest(
          path,
          serialize,
          deserialize,
          metadata,
          options,
        );
        readable = duplex;
        writable = duplex;
        call = duplex;
      }

      call.on('metadata', (value: grpc.Metadata) => {
        headers = debugMetadata(value);
        if (headers) push({ type: 'headers', headers });
      });
      call.on('status', (value: grpc.StatusObject) => {
        finalStatus = value;
        finish();
        if (!settled) armWatchdog();
      });
      call.on('error', (error: Error) => {
        callError = error;
        finish();
        if (!settled) armWatchdog();
      });
      if (readable) {
        readable.on('data', (response: protobuf.Message) => {
          if (settled) return;
          try {
            const contents = formatRpcProtoJson(
              responseType,
              response,
              this.conRes.rpc?.showDefaultValues === true,
            );
            receivedCount += 1;
            push({ type: 'received', index: receivedCount, at: Date.now(), contents });
          } catch (cause) {
            conversionError = cause;
            call.cancel();
            armWatchdog();
          }
        });
        readable.on('end', () => {
          finish();
          if (!settled) armWatchdog();
        });
      }
      if (kind === 'serverStreaming') {
        sentCount = 1;
        push({ type: 'sent', index: 1, at: Date.now(), contents: initialContents });
      }

      const session: RpcStreamSession = {
        kind,
        events: queue,
        completion,
        cancel: () => {
          if (settled || explicitCancel) return;
          explicitCancel = true;
          sendingClosed = true;
          call.cancel();
          armWatchdog();
        },
      };
      if (writable) {
        session.send = (requestJson: string): Promise<void> => {
          if (sendingClosed || settled || explicitCancel)
            return Promise.reject(new Error('RPC stream is not accepting messages.'));
          let request: protobuf.Message;
          try {
            request = parseRpcProtoJson(requestType, requestJson);
          } catch (error) {
            return Promise.reject(rpcInvokeError(error));
          }
          const contents = formatRpcProtoJson(requestType, request);
          const task = writeChain.then(
            () =>
              new Promise<void>((resolve, reject) => {
                if (settled || explicitCancel) {
                  reject(new Error('RPC stream has ended.'));
                  return;
                }
                writable.write(request, (error?: Error) => {
                  if (error) reject(rpcInvokeError(error));
                  else {
                    sentCount += 1;
                    push({ type: 'sent', index: sentCount, at: Date.now(), contents });
                    resolve();
                  }
                });
              }),
          );
          writeChain = task.catch(() => undefined);
          return task;
        };
        session.finishSending = async (): Promise<void> => {
          if (sendingClosed || settled) return;
          sendingClosed = true;
          await writeChain;
          if (!settled && !explicitCancel) writable.end();
        };
      }
      return session;
    } catch (error) {
      throw rpcInvokeError(error);
    }
  }
}
