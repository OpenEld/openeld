import type {
  NormalizeProviderPayloadResponse,
} from "../../gen/ts/services/normalization/service_pb";
import type {
  ProviderPayloadCase,
  ProviderPayloadFor,
} from "../adapters/provider-adapter";
import { buildGeotabPayload } from "../adapters/providers/geotab";
import { buildMotivePayload } from "../adapters/providers/motive";
import { buildSamsaraPayload } from "../adapters/providers/samsara";
import type { ProviderRegistry } from "../registry/provider-registry";
import type {
  createNormalizationClient,
  NormalizeRequestOptions,
} from "./normalization-client";

type NormalizationClient = ReturnType<typeof createNormalizationClient>;

export type ProviderPreparation<TCase extends ProviderPayloadCase> = {
  provider: TCase;
  payload: ProviderPayloadFor<TCase>;
  request: ReturnType<NormalizationClient["toRequest"]>;
};

export type ProviderNormalizationResult<TCase extends ProviderPayloadCase> =
  ProviderPreparation<TCase> & {
    response: NormalizeProviderPayloadResponse;
    warnings: readonly string[];
  };

function createProviderClient<
  TCase extends ProviderPayloadCase,
  TBuilder extends (...args: never[]) => ProviderPayloadFor<TCase>,
>(
  provider: TCase,
  builder: TBuilder,
  normalization: NormalizationClient,
) {
  return {
    provider,
    buildPayload(input: Parameters<TBuilder>[0]) {
      return builder(input as never);
    },
    prepare(input: Parameters<TBuilder>[0], options: NormalizeRequestOptions = {}) {
      const payload = builder(input as never);
      const request = normalization.toRequest(provider, payload, options);

      return {
        provider,
        payload,
        request,
      } as ProviderPreparation<TCase>;
    },
    normalizeSync(input: Parameters<TBuilder>[0], options: NormalizeRequestOptions = {}) {
      const prepared = this.prepare(input, options);
      const response = normalization.normalizeSync(prepared.request);

      return {
        ...prepared,
        response,
        warnings: response.warnings,
      } as ProviderNormalizationResult<TCase>;
    },
    async normalize(
      input: Parameters<TBuilder>[0],
      options: NormalizeRequestOptions = {},
    ) {
      const prepared = this.prepare(input, options);
      const response = await normalization.normalize(prepared.request);

      return {
        ...prepared,
        response,
        warnings: response.warnings,
      } as ProviderNormalizationResult<TCase>;
    },
  };
}

export function createProvidersClient(
  registry: ProviderRegistry,
  normalization: NormalizationClient,
) {
  return {
    supported() {
      return registry.list();
    },
    has(provider: ProviderPayloadCase) {
      return registry.has(provider);
    },
    samsara: createProviderClient("samsara", buildSamsaraPayload, normalization),
    motive: createProviderClient("motive", buildMotivePayload, normalization),
    geotab: createProviderClient("geotab", buildGeotabPayload, normalization),
  };
}
