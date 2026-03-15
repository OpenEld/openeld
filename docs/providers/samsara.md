# Samsara

## Status

- Runtime support: local normalization available
- Fixture quality: doc-verified fixtures and contract tests are committed
- Best fit: teams normalizing Samsara drivers, vehicles, HOS, GPS, DVIR, feed cursor data, and raw geofence webhook transitions into the canonical model

## What Input The SDK Expects

The local SDK path is designed around Samsara-native record groups such as:

- `drivers`
- `vehicles`
- `hosLogs`
- `hosClocks`
- `vehicleLocations`
- `dvirs`
- `feedCursor`
- `geofenceWebhookEvents`

Typical usage:

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
```

## What Is Strong Today

Current local normalization is strongest for:

- driver records
- vehicle records
- HOS event and clock workflows
- GPS location records
- DVIR records
- cursor-based feed sync context
- raw geofence entry and exit webhook payloads projected into canonical `geofenceEvents`

## Sync Model Summary

Samsara is modeled around feed endpoints with cursor semantics.

Important notes:

- cursor checkpoints map well to incremental sync behavior
- webhook support exists on the provider side, but OpenELD does not turn that into a hosted sync product
- doc-backed geofence entry and exit webhook examples can be modeled in the provider payload and projected locally, but that is not the same as a built-in webhook receiver or remote sync service
- transport-backed `client.sync` still requires your own configured invoker

## Caveats And Warnings

- `driver.name` may need splitting into first and last name depending on your downstream canonical needs
- speed values may arrive in mph and normalize into canonical units
- HOS logs carry provider-native semantics such as `hosStatusType`, `origin`, `remark`, and detailed location context that may not map one-to-one into simplified consumer views
- current geofence webhook support is centered on raw event modeling plus canonical transition projection, with the original webhook JSON preserved in `source.rawPayloadJson`
- current fixture coverage is strong, but the next quality step is replacing doc-derived inputs with sandbox or sanitized production captures

## Related Docs

- [Normalization Guide](../guides/normalization.md)
- [Transport And Remote Services](../guides/transports-and-remote-services.md)
