import {
  create,
  toJson,
  type MessageInitShape,
} from "@bufbuild/protobuf";

import {
  NormalizationService,
  NormalizeProviderPayloadRequestSchema,
  NormalizeProviderPayloadResponseSchema,
  type NormalizeProviderPayloadRequest,
} from "../../gen/ts/services/normalization/service_pb";
import {
  createNormalizationService,
  normalizeProviderPayload as normalizeProviderPayloadSync,
} from "../services/normalization-service";
import type {
  ProviderPayloadCase,
  ProviderPayloadFor,
} from "../adapters/provider-adapter";
import type { ProviderRegistry } from "../registry/provider-registry";
import type { UnaryMethodInvoker } from "./invoker";
import { invokeUnary } from "./invoker";

export type NormalizeRequestOptions = Pick<
  NormalizeProviderPayloadRequest,
  "tenantId"
>;

export function toNormalizeProviderPayloadRequest<TCase extends ProviderPayloadCase>(
  provider: TCase,
  payload: ProviderPayloadFor<TCase>,
  options: NormalizeRequestOptions = {},
) {
  const providerPayload = {
    case: provider,
    value: payload,
  } as Extract<NormalizeProviderPayloadRequest["providerPayload"], { case: TCase }>;

  return create(NormalizeProviderPayloadRequestSchema, {
    tenantId: options.tenantId,
    providerPayload,
  });
}

export function createNormalizationClient(
  registry: ProviderRegistry,
  invoker?: UnaryMethodInvoker,
) {
  const service = createNormalizationService(registry);

  return {
    service,
    toRequest: toNormalizeProviderPayloadRequest,
    normalizeSync(
      request:
        | MessageInitShape<typeof NormalizeProviderPayloadRequestSchema>
        | NormalizeProviderPayloadRequest,
    ) {
      return normalizeProviderPayloadSync(
        create(NormalizeProviderPayloadRequestSchema, request),
        registry,
      );
    },
    async normalize(
      request:
        | MessageInitShape<typeof NormalizeProviderPayloadRequestSchema>
        | NormalizeProviderPayloadRequest,
    ) {
      const normalizedRequest = create(NormalizeProviderPayloadRequestSchema, request);
      if (invoker) {
        return invokeUnary(
          "normalization",
          NormalizationService.method.normalizeProviderPayload,
          normalizedRequest,
          invoker,
        );
      }

      return service.normalizeProviderPayload(normalizedRequest);
    },
    toJson(response: ReturnType<typeof normalizeProviderPayloadSync>) {
      return toJson(NormalizeProviderPayloadResponseSchema, response);
    },
  };
}
