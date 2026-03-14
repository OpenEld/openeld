import type {
  NormalizeProviderPayloadRequest,
  NormalizeProviderPayloadResponse,
} from "../../gen/ts/services/normalization/service_pb";

export type ProviderPayloadCase = Exclude<
  NormalizeProviderPayloadRequest["providerPayload"]["case"],
  undefined
>;

export type ProviderPayloadFor<TCase extends ProviderPayloadCase> = Extract<
  NormalizeProviderPayloadRequest["providerPayload"],
  { case: TCase }
>["value"];

export interface ProviderAdapter<TCase extends ProviderPayloadCase = ProviderPayloadCase> {
  readonly provider: TCase;
  normalize(payload: ProviderPayloadFor<TCase>): NormalizeProviderPayloadResponse;
}
