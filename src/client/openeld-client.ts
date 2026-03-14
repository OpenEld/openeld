import * as schemas from "../generated";
import {
  defaultProviderRegistry,
  type ProviderRegistry,
} from "../registry/provider-registry";
import { createNormalizationClient } from "./normalization-client";
import { createProvidersClient } from "./providers";
import { createQueryClient } from "./query-client";
import { createSyncClient } from "./sync-client";
import type { UnaryMethodInvoker } from "./invoker";

export type OpenEldClientOptions = {
  registry?: ProviderRegistry;
  transports?: {
    normalization?: UnaryMethodInvoker;
    query?: UnaryMethodInvoker;
    sync?: UnaryMethodInvoker;
  };
};

export function createOpenEldClient(options: OpenEldClientOptions = {}) {
  const registry = options.registry ?? defaultProviderRegistry;
  const normalization = createNormalizationClient(
    registry,
    options.transports?.normalization,
  );
  const query = createQueryClient(options.transports?.query);
  const sync = createSyncClient(options.transports?.sync);
  const providers = createProvidersClient(registry, normalization);

  return {
    registry,
    providers,
    normalization,
    query,
    sync,
    schemas,
  };
}
