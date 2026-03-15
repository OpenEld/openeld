# Geotab

## Status

- Runtime support: local normalization available
- Fixture quality: contract and normalization coverage is committed, with some fixtures derived from official schemas and object docs
- Best fit: teams normalizing Geotab users, devices, duty status, regulation, and feed/version-token workflows

## What Input The SDK Expects

The local SDK path is designed around Geotab-native record groups such as:

- `users`
- `devices`
- `dutyStatusLogs`
- `driverRegulations`
- `logRecords`
- `getFeed`

Typical usage:

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient();

const result = await client.providers.geotab.normalize({
  users,
  devices,
  dutyStatusLogs,
  driverRegulations,
  logRecords,
  getFeed,
});
```

## What Is Strong Today

Current local normalization is strongest for:

- user-to-driver mapping
- device-to-vehicle mapping
- duty status and HOS-related records
- version-token sync context

Geotab exposes rich system-oriented event semantics, so the canonical model is often a carefully normalized view over a more complex native structure.

## Sync Model Summary

Geotab is modeled around `GetFeed` and `fromVersion` style incremental sync.

Important notes:

- version tokens are the primary checkpoint concept
- watermarks can complement version-based progress tracking
- transport-backed `client.sync` still requires your own configured invoker

## Caveats And Warnings

- HOS flows center on `DutyStatusLog` and related native objects
- event semantics are richer and more system-oriented than in some other providers
- license number availability may depend on custom fields or account configuration
- current fixtures are useful and high-signal, but some are schema-derived because public static payload examples are limited
- the strongest next validation step is replacing schema-derived fixtures with recorded sandbox or live-tenant `Get` and `GetFeed` payloads

## Related Docs

- [Normalization Guide](../guides/normalization.md)
- [Schema And Generated Bindings](../concepts/schema-and-generated-bindings.md)
