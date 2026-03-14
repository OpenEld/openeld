import { create } from "@bufbuild/protobuf";

import {
  NormalizeProviderPayloadResponseSchema,
  type NormalizeProviderPayloadRequest,
} from "../../gen/ts/services/normalization/service_pb";
import type {
  ProviderAdapter,
  ProviderPayloadCase,
} from "../adapters/provider-adapter";
import { geotabProviderAdapter } from "../adapters/providers/geotab";
import { motiveProviderAdapter } from "../adapters/providers/motive";
import { samsaraProviderAdapter } from "../adapters/providers/samsara";

export class ProviderRegistry {
  readonly #adapters = new Map<ProviderPayloadCase, ProviderAdapter<any>>();

  constructor(adapters: readonly ProviderAdapter<any>[] = []) {
    adapters.forEach((adapter) => {
      this.register(adapter);
    });
  }

  register(adapter: ProviderAdapter<any>) {
    this.#adapters.set(adapter.provider, adapter);
    return this;
  }

  get(provider: ProviderPayloadCase) {
    return this.#adapters.get(provider);
  }

  has(provider: ProviderPayloadCase) {
    return this.#adapters.has(provider);
  }

  list() {
    return [...this.#adapters.keys()];
  }

  normalize(request: NormalizeProviderPayloadRequest) {
    if (!request.providerPayload.case) {
      return create(NormalizeProviderPayloadResponseSchema, {
        warnings: ["NormalizeProviderPayloadRequest.provider_payload must be set."],
      });
    }

    const adapter = this.get(request.providerPayload.case);
    if (!adapter) {
      return create(NormalizeProviderPayloadResponseSchema, {
        warnings: [
          `No provider adapter is registered for ${request.providerPayload.case}.`,
        ],
      });
    }

    return adapter.normalize(request.providerPayload.value as never);
  }
}

export function createDefaultProviderRegistry() {
  return new ProviderRegistry([
    samsaraProviderAdapter,
    motiveProviderAdapter,
    geotabProviderAdapter,
  ]);
}

export const defaultProviderRegistry = createDefaultProviderRegistry();
