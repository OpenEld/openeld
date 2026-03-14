# TypeScript Examples

The default experience should start with the OO SDK:

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient();

const result = await client.providers.samsara.normalize({
  drivers,
  vehicles,
  hosLogs,
  hosClocks,
  vehicleLocations,
  dvirs,
  feedCursor,
});

console.log(result.response.drivers);
console.log(result.warnings);
```

If you want to stay close to generated protobuf contracts, use the normalization namespace:

```ts
import {
  createOpenEldClient,
  buildSamsaraPayload,
} from "@openeld/openeld";

const client = createOpenEldClient();

const samsaraPayload = buildSamsaraPayload({
  drivers,
  vehicles,
  hosLogs,
  hosClocks,
  vehicleLocations,
  dvirs,
  feedCursor,
});

const request = client.normalization.toRequest("samsara", samsaraPayload);
const response = await client.normalization.normalize(request);
```

For `query` and `sync`, the SDK already exposes OO namespaces that match the protobuf contracts, but those methods require a configured transport invoker because local query/sync runtime behavior is not implemented yet.
