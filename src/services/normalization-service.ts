import type { NormalizeProviderPayloadRequest } from "../../gen/ts/services/normalization/service_pb";
import {
  defaultProviderRegistry,
  type ProviderRegistry,
} from "../registry/provider-registry";

export function normalizeProviderPayload(
  request: NormalizeProviderPayloadRequest,
  registry: ProviderRegistry = defaultProviderRegistry,
) {
  return registry.normalize(request);
}

export function createNormalizationService(
  registry: ProviderRegistry = defaultProviderRegistry,
) {
  return {
    normalizeProviderPayload(request: NormalizeProviderPayloadRequest) {
      return registry.normalize(request);
    },
  };
}
