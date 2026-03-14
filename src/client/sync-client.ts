import type {
  DescMethodUnary,
  MessageInitShape,
  MessageShape,
} from "@bufbuild/protobuf";

import { SyncService } from "../../gen/ts/services/sync/service_pb";
import type { UnaryMethodInvoker } from "./invoker";
import { invokeUnary } from "./invoker";

function createSyncInvoker(invoker?: UnaryMethodInvoker) {
  return function call<Method extends DescMethodUnary>(
    method: Method,
    request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
  ) {
    return invokeUnary("sync", method, request, invoker);
  };
}

export function createSyncClient(invoker?: UnaryMethodInvoker) {
  const call = createSyncInvoker(invoker);

  return {
    service: SyncService,
    async invoke<Method extends DescMethodUnary>(
      method: Method,
      request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
    ) {
      return call(method, request);
    },
    async getCheckpoint(
      request: MessageInitShape<typeof SyncService.method.getSyncCheckpoint.input>,
    ) {
      return call(SyncService.method.getSyncCheckpoint, request);
    },
    async updateCheckpoint(
      request: MessageInitShape<typeof SyncService.method.updateSyncCheckpoint.input>,
    ) {
      return call(SyncService.method.updateSyncCheckpoint, request);
    },
  };
}
