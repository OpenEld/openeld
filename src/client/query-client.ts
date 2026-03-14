import type {
  DescMethodUnary,
  MessageInitShape,
  MessageShape,
} from "@bufbuild/protobuf";

import { QueryService } from "../../gen/ts/services/query/service_pb";
import type { UnaryMethodInvoker } from "./invoker";
import { invokeUnary } from "./invoker";

function createQueryInvoker(invoker?: UnaryMethodInvoker) {
  return function call<Method extends DescMethodUnary>(
    method: Method,
    request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
  ) {
    return invokeUnary("query", method, request, invoker);
  };
}

export function createQueryClient(invoker?: UnaryMethodInvoker) {
  const call = createQueryInvoker(invoker);

  return {
    service: QueryService,
    async invoke<Method extends DescMethodUnary>(
      method: Method,
      request: MessageInitShape<Method["input"]> | MessageShape<Method["input"]>,
    ) {
      return call(method, request);
    },
    async getCarrier(request: MessageInitShape<typeof QueryService.method.getCarrier.input>) {
      return call(QueryService.method.getCarrier, request);
    },
    async getDataConsent(
      request: MessageInitShape<typeof QueryService.method.getDataConsent.input>,
    ) {
      return call(QueryService.method.getDataConsent, request);
    },
    async listDataConsents(
      request: MessageInitShape<typeof QueryService.method.listDataConsents.input>,
    ) {
      return call(QueryService.method.listDataConsents, request);
    },
    async listDrivers(
      request: MessageInitShape<typeof QueryService.method.listDrivers.input>,
    ) {
      return call(QueryService.method.listDrivers, request);
    },
    async listVehicles(
      request: MessageInitShape<typeof QueryService.method.listVehicles.input>,
    ) {
      return call(QueryService.method.listVehicles, request);
    },
    async listVehicleAssignments(
      request: MessageInitShape<typeof QueryService.method.listVehicleAssignments.input>,
    ) {
      return call(QueryService.method.listVehicleAssignments, request);
    },
    async listHosEvents(
      request: MessageInitShape<typeof QueryService.method.listHosEvents.input>,
    ) {
      return call(QueryService.method.listHosEvents, request);
    },
    async listHosDailySummaries(
      request: MessageInitShape<typeof QueryService.method.listHosDailySummaries.input>,
    ) {
      return call(QueryService.method.listHosDailySummaries, request);
    },
    async listGpsLocations(
      request: MessageInitShape<typeof QueryService.method.listGpsLocations.input>,
    ) {
      return call(QueryService.method.listGpsLocations, request);
    },
    async listSafetyEvents(
      request: MessageInitShape<typeof QueryService.method.listSafetyEvents.input>,
    ) {
      return call(QueryService.method.listSafetyEvents, request);
    },
    async listIftaTrips(
      request: MessageInitShape<typeof QueryService.method.listIftaTrips.input>,
    ) {
      return call(QueryService.method.listIftaTrips, request);
    },
    async getAsset(request: MessageInitShape<typeof QueryService.method.getAsset.input>) {
      return call(QueryService.method.getAsset, request);
    },
    async listAssets(
      request: MessageInitShape<typeof QueryService.method.listAssets.input>,
    ) {
      return call(QueryService.method.listAssets, request);
    },
    async listAssetLocations(
      request: MessageInitShape<typeof QueryService.method.listAssetLocations.input>,
    ) {
      return call(QueryService.method.listAssetLocations, request);
    },
    async listDvirs(
      request: MessageInitShape<typeof QueryService.method.listDvirs.input>,
    ) {
      return call(QueryService.method.listDvirs, request);
    },
  };
}
