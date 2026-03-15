# Normalization Guide

OpenELD normalization turns provider-native records into the canonical protobuf logistics model.

For most consumers, the recommended entrypoint is the provider namespace on `createOpenEldClient()`.

## Recommended Pattern

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

This pattern is ideal when you want:

- provider-specific input ergonomics
- a generated provider payload behind the scenes
- a generated canonical response without hand-building protobuf messages

## Understanding The Result

A provider normalization call returns:

- `payload`: the generated provider payload message
- `request`: the generated normalization request message
- `response`: the generated normalized response message
- `warnings`: caveats that help you understand staging gaps or inferred behavior

Treat `warnings` as part of the contract. They are how OpenELD tells you where provider behavior is still partially inferred, fixture-backed, or otherwise worth manual review.

## Provider Namespaces

The client exposes provider-specific namespaces for the local runtime paths that exist today:

- `client.providers.samsara`
- `client.providers.motive`
- `client.providers.geotab`

You can inspect what is wired in locally with:

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient();

console.log(client.providers.supported());
```

## Preparing Requests

If you want to separate request construction from execution, use `prepare()` when the provider namespace exposes it, or use the normalization namespace directly.

That is useful when you want to:

- inspect the generated provider payload before normalizing
- pass the request across process boundaries
- log or persist canonical request artifacts

## Advanced Path: `client.normalization`

Use `client.normalization` when you need protobuf-first control:

```ts
import {
  createOpenEldClient,
  buildGeotabPayload,
} from "@openeld/openeld";

const client = createOpenEldClient();
const payload = buildGeotabPayload({
  users,
  devices,
  dutyStatusLogs,
  driverRegulations,
  logRecords,
  getFeed,
});

const request = client.normalization.toRequest("geotab", payload, {
  tenantId: "tenant-123",
});

const response = await client.normalization.normalize(request);
```

Use this path when you want to stay close to generated message types instead of the higher-level provider helper methods.

## Provider Caveats

Current guidance:

- Samsara support is strong around drivers, vehicles, HOS, GPS, DVIR, feed cursor normalization, and raw geofence entry or exit webhook projection into canonical `geofenceEvents`
- Motive support is strong around drivers, vehicles, HOS, GPS, and documented page-based sync semantics
- Geotab support is strong around schema-backed duty status and feed/version-token workflows, with some fixtures derived from official object docs rather than static payload examples
- KeepTruckin should be treated as a limited legacy compatibility path, not the default choice for new integrations

For provider-specific caveats, read the pages in [`../providers`](../providers/README.md).
