# Motive

## Status

- Runtime support: local normalization available
- Fixture quality: doc-verified fixtures and contract tests are committed
- Best fit: teams normalizing Motive driver, vehicle, HOS, GPS, and documented page-sync inputs

## What Input The SDK Expects

The local SDK path is centered on Motive-native record groups such as:

- `drivers`
- `vehicles`
- `hosLogs`
- `vehicleLocations`
- `pageSync`

Typical usage:

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient();

const result = await client.providers.motive.normalize({
  drivers,
  vehicles,
  hosLogs,
  vehicleLocations,
  pageSync,
});
```

## What Is Strong Today

Current local normalization is strongest for:

- driver records
- vehicle records
- HOS events
- GPS location records
- page-based sync context

DVIR handling depends more heavily on what the provider exposes for the account and captured fixtures.

## Sync Model Summary

Motive is modeled around page-based polling.

Important notes:

- checkpoint handling typically fits a page token or page counter plus watermark
- transport-backed `client.sync` still requires your own configured invoker
- local normalization can include sync context, but it does not replace a full remote sync service

## Caveats And Warnings

- odometer values may require miles-to-meters conversion
- engine hours may require hours-to-seconds conversion
- log records use native `status`, `annotation`, and coordinate fields that may need careful interpretation downstream
- current fixture quality is good for documented examples, but unit-conversion assumptions should still be validated against sandbox or sanitized production captures

## Related Docs

- [Normalization Guide](../guides/normalization.md)
- [Query And Sync](../guides/query-and-sync.md)
