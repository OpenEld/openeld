import { create, type DescMethodUnary, type MessageInitShape, type MessageShape } from "@bufbuild/protobuf";

export type UnaryMethodInvoker = <Method extends DescMethodUnary>(
  method: Method,
  request: MessageShape<Method["input"]>,
) => Promise<MessageShape<Method["output"]>>;

export function toUnaryRequest<Method extends DescMethodUnary>(
  method: Method,
  request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
) {
  return create(method.input, request) as MessageShape<Method["input"]>;
}

export async function invokeUnary<Method extends DescMethodUnary>(
  namespace: string,
  method: Method,
  request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
  invoker?: UnaryMethodInvoker,
) {
  if (!invoker) {
    throw new Error(
      `OpenELD ${namespace}.${method.localName} requires a configured ${namespace} transport invoker.`,
    );
  }

  return invoker(method, toUnaryRequest(method, request));
}
