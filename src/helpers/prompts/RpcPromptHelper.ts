import {
  buildRpcRequestTemplate,
  buildRpcResponseDescription,
} from '../../resource/rpcRequestTemplate';
import { getRpcCallKind, RpcDatabase } from '../../resource/rpc';

/** Render the discovered RPC contract without exposing connection credentials. */
export function createRpcSchemaDefinitionsForPrompt(
  databases: RpcDatabase[],
  serviceName?: string,
  methodName?: string,
): string | undefined {
  const lines: string[] = [];
  for (const database of databases) {
    for (const pkg of database.children) {
      for (const service of pkg.children) {
        if (
          serviceName &&
          service.fullName !== serviceName &&
          service.name !== serviceName
        )
          continue;
        for (const method of service.children) {
          if (methodName && method.name !== methodName) continue;
          const request = buildRpcRequestTemplate(
            method,
            database.messageDefinitions,
          );
          const example = method.requestStream
            ? JSON.stringify([JSON.parse(request.data)], null, 2)
            : request.data;
          lines.push(
            [
              `RPC ${method.path} (${getRpcCallKind(method)})`,
              `Request (${method.inputType}):`,
              request.description,
              `ProtoJSON request example${
                method.requestStream ? ' (notebook cell array)' : ''
              }:\n${example}`,
              `Response (${method.outputType}):`,
              buildRpcResponseDescription(method, database.messageDefinitions),
            ].join('\n'),
          );
        }
      }
    }
  }
  return lines.length ? lines.join('\n\n') : undefined;
}
