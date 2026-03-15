# TypeScript Examples

The recommended path starts with the OO SDK and local provider normalization.

Local normalization is currently available for:

- Samsara
- Motive
- Geotab

## Recommended Example

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

## Advanced Protobuf-First Example

If you want to stay closer to generated protobuf contracts, use the normalization namespace:

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

## Query And Sync

`client.query` and `client.sync` match the protobuf service contracts, but they require a configured transport invoker.

They are transport-backed namespaces, not local in-process query or sync implementations.

## Related Docs

- [`README.md`](../../README.md)
- [`docs/README.md`](../../docs/README.md)
- [`docs/guides/normalization.md`](../../docs/guides/normalization.md)
- [`docs/guides/transports-and-remote-services.md`](../../docs/guides/transports-and-remote-services.md)
