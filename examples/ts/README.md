# TypeScript Examples

The package exports both the runtime normalization service and the generated protobuf schemas.

Example shape:

```ts
import { create } from "@bufbuild/protobuf";
import {
  NormalizeProviderPayloadRequestSchema,
  buildSamsaraPayload,
  normalizeProviderPayload,
} from "@openeld/openeld";

const samsaraPayload = buildSamsaraPayload({
  drivers,
  vehicles,
  hosLogs,
  hosClocks,
  vehicleLocations,
  dvirs,
  feedCursor,
});

const request = create(NormalizeProviderPayloadRequestSchema, {
  providerPayload: {
    case: "samsara",
    value: samsaraPayload,
  },
});

const response = normalizeProviderPayload(request);
```

Consumers should treat the generated protobuf messages as the only structural types and keep handwritten TypeScript focused on behavior, orchestration, and IO.
