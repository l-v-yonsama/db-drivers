import { GeneralColumnType } from '@l-v-yonsama/rdh';
import { ResourceType } from '../types';
import { DbResource } from './base';

export type RpcScalarType =
  | 'double'
  | 'float'
  | 'int32'
  | 'int64'
  | 'uint32'
  | 'uint64'
  | 'sint32'
  | 'sint64'
  | 'fixed32'
  | 'fixed64'
  | 'sfixed32'
  | 'sfixed64'
  | 'bool'
  | 'string'
  | 'bytes';

export type RpcFieldType =
  | { kind: 'scalar'; scalar: RpcScalarType }
  | { kind: 'message'; typeName: string }
  | { kind: 'enum'; typeName: string; values: Record<string, number> }
  | { kind: 'repeated'; element: RpcFieldType }
  | { kind: 'map'; key: RpcScalarType; value: RpcFieldType };

export function formatRpcFieldType(type: RpcFieldType): string {
  switch (type.kind) {
    case 'scalar':
      return type.scalar;
    case 'message':
    case 'enum':
      return type.typeName;
    case 'repeated':
      return `repeated ${formatRpcFieldType(type.element)}`;
    case 'map':
      return `map<${type.key}, ${formatRpcFieldType(type.value)}>`;
  }
}

function referencedMessageName(type: RpcFieldType): string | undefined {
  switch (type.kind) {
    case 'message':
      return type.typeName;
    case 'repeated':
      return referencedMessageName(type.element);
    case 'map':
      return referencedMessageName(type.value);
    default:
      return undefined;
  }
}

export class RpcDatabase extends DbResource<RpcPackage> {
  public messageDefinitions: RpcMessage[] = [];

  constructor(name: string) {
    super(ResourceType.RpcDatabase, name);
  }

  /** Materialize one level of Message references for every method's request and response. */
  expandMessageReferences(): void {
    const definitions = new Map(
      this.messageDefinitions.map((message) => [message.fullName, message]),
    );
    for (const pkg of this.children) {
      for (const service of pkg.children) {
        for (const method of service.children) {
          for (const message of method.children) {
            for (const field of message.children) {
              field.clearChildren();
              const typeName = referencedMessageName(field.fieldType);
              const definition = typeName && definitions.get(typeName);
              if (definition) {
                definition.children.forEach((source) => field.addChild(source.clone()));
              }
            }
          }
        }
      }
    }
  }
}

export class RpcPackage extends DbResource<RpcService> {
  constructor(name: string) {
    super(ResourceType.RpcPackage, name);
  }
}

export class RpcService extends DbResource<RpcMethod> {
  public fullName: string;
  public discovery: 'declared' | 'advertised';
  constructor(
    name: string,
    fullName: string,
    discovery: 'declared' | 'advertised' = 'declared',
  ) {
    super(ResourceType.RpcService, name);
    this.fullName = fullName;
    this.discovery = discovery;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      fullName: this.fullName,
      discovery: this.discovery,
    };
  }
}

export class RpcMethod extends DbResource<RpcMessage> {
  public path: string;
  public inputType: string;
  public outputType: string;
  public requestStream: boolean;
  public responseStream: boolean;
  constructor(
    name: string,
    path: string,
    inputType: string,
    outputType: string,
    requestStream = false,
    responseStream = false,
  ) {
    super(ResourceType.RpcMethod, name);
    this.path = path;
    this.inputType = inputType;
    this.outputType = outputType;
    this.requestStream = requestStream;
    this.responseStream = responseStream;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      path: this.path,
      inputType: this.inputType,
      outputType: this.outputType,
      requestStream: this.requestStream,
      responseStream: this.responseStream,
    };
  }
}

export class RpcMessage extends DbResource<RpcField> {
  public fullName: string;
  public direction?: 'request' | 'response';
  constructor(
    name: string,
    fullName: string,
    direction?: 'request' | 'response',
  ) {
    super(ResourceType.RpcMessage, name);
    this.fullName = fullName;
    this.direction = direction;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      fullName: this.fullName,
      ...(this.direction ? { direction: this.direction } : {}),
    };
  }
}

export type RpcFieldDeclarationOptions = {
  deprecated?: boolean;
  proto3Optional?: boolean;
  required?: boolean;
  jsonNameOption?: string;
};

export class RpcField extends DbResource<RpcField> {
  public fieldNumber: number;
  public fieldType: RpcFieldType;
  public jsonName: string;
  public generalType: GeneralColumnType;
  public presence: 'implicit' | 'explicit' | 'repeated' | 'map';
  public oneofGroup?: string;
  public deprecated?: boolean;
  public proto3Optional?: boolean;
  public required?: boolean;
  public jsonNameOption?: string;
  constructor(
    name: string,
    fieldNumber: number,
    fieldType: RpcFieldType,
    generalType: GeneralColumnType,
    presence: RpcField['presence'],
    oneofGroup?: string,
    jsonName?: string,
    declaration: RpcFieldDeclarationOptions = {},
  ) {
    super(ResourceType.RpcField, name);
    this.fieldNumber = fieldNumber;
    this.fieldType = fieldType;
    this.jsonName = jsonName ?? name;
    this.generalType = generalType;
    this.presence = presence;
    this.oneofGroup = oneofGroup;
    this.deprecated = declaration.deprecated || undefined;
    this.proto3Optional = declaration.proto3Optional || undefined;
    this.required = declaration.required || undefined;
    this.jsonNameOption = declaration.jsonNameOption;
  }

  clone(): RpcField {
    return new RpcField(
      this.name,
      this.fieldNumber,
      this.fieldType,
      this.generalType,
      this.presence,
      this.oneofGroup,
      this.jsonName,
      {
        deprecated: this.deprecated,
        proto3Optional: this.proto3Optional,
        required: this.required,
        jsonNameOption: this.jsonNameOption,
      },
    );
  }

  getDisplaySummary(): string {
    return `#${this.fieldNumber} ${formatRpcFieldType(this.fieldType)}${
      this.deprecated ? ' (deprecated)' : ''
    }`;
  }

  getDisplayDetails(): string {
    return `${this.name}: ${formatRpcFieldType(this.fieldType)} (${this.presence})${
      this.deprecated ? '\nDeprecated' : ''
    }`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      fieldNumber: this.fieldNumber,
      type: formatRpcFieldType(this.fieldType),
      jsonName: this.jsonName,
      presence: this.presence,
      ...(this.oneofGroup ? { oneofGroup: this.oneofGroup } : {}),
      deprecated: this.deprecated === true,
      proto3Optional: this.proto3Optional === true,
      required: this.required === true,
      ...(this.jsonNameOption ? { jsonNameOption: this.jsonNameOption } : {}),
    };
  }
}
