# Quickstart

This guide shows the shortest path to a successful OpenELD integration.

## Install

```sh
npm install @openeld/openeld
```

## First Success

Create a client and normalize a provider payload:

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
console.log(result.response.vehicles);
console.log(result.warnings);
```

## What You Get Back

Provider normalization returns a structured object with four important pieces:

- `payload`: the generated provider-native protobuf message
- `request`: the generated normalization request
- `response`: the generated canonical normalization response
- `warnings`: caveats about fixture quality, inferred mappings, or provider-specific limitations

This lets you start with a pleasant SDK call while still keeping access to the protobuf-level artifacts.

## Supported Local Providers

The strongest local normalization support today is:

- Samsara
- Motive
- Geotab

See the [Provider Index](../providers/README.md) for provider-specific expectations and caveats.

## What Happens Next

After your first successful normalization:

1. Read the [Normalization Guide](../guides/normalization.md) to understand provider namespaces, request building, and warnings.
2. Read [Schema And Generated Bindings](../concepts/schema-and-generated-bindings.md) if you want to work directly with protobuf messages.
3. Read [Transport And Remote Services](../guides/transports-and-remote-services.md) before using `client.query` or `client.sync`.
