# openeld

`@openeld/openeld` is a protobuf-first SDK for normalizing ELD and telematics data into a shared logistics model.

It is designed for teams that want:

- one canonical schema across providers
- a pleasant TypeScript SDK for day-to-day integration work
- generated protobuf bindings as the source of truth for runtime types
- a path toward transport-backed query and sync APIs without changing the package shape later

## Install

```sh
npm install @openeld/openeld
```

```sh
bun add @openeld/openeld
```

## Quickstart

The fastest way to get value from OpenELD today is local provider normalization through the OO SDK:

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

The provider method returns:

- `payload`: the generated provider payload message
- `request`: the generated normalization request
- `response`: the generated canonical normalization response
- `warnings`: provider-specific caveats and staging notes

## Choose Your Path

### Recommended: OO SDK

Use `createOpenEldClient()` when you want the cleanest consumer experience.

- `client.providers.samsara.normalize(...)`
- `client.providers.motive.normalize(...)`
- `client.providers.geotab.normalize(...)`
- `client.providers.supported()`

### Advanced: Protobuf-First Normalization

Use the normalization namespace when you want to stay closer to generated request and response types:

```ts
import {
  createOpenEldClient,
  buildSamsaraPayload,
} from "@openeld/openeld";

const client = createOpenEldClient();
const payload = buildSamsaraPayload({
  drivers,
  vehicles,
  hosLogs,
  hosClocks,
  vehicleLocations,
  dvirs,
  feedCursor,
});

const request = client.normalization.toRequest("samsara", payload, {
  tenantId: "tenant-123",
});

const response = await client.normalization.normalize(request);
```

### Staged: Query And Sync

`client.query` and `client.sync` already match the intended protobuf service boundaries, but they require a configured transport invoker.

They are useful when you are:

- calling a remote service that implements the protobuf contracts
- standardizing your own transport layer around OpenELD request and response types

They are not local in-process data stores or built-in hosted APIs.

## SDK Scope Today

What works locally right now:

- provider payload building and normalization for `samsara`, `motive`, and `geotab`
- advanced in-process normalization through `client.normalization`
- generated protobuf bindings through the root package, `client.schemas`, and `@openeld/openeld/generated`

What is transport-ready but not locally implemented:

- `client.query.*`
- `client.sync.*`

## Supported Providers

Current consumer-ready local normalization support:

- Samsara
- Motive
- Geotab

Limited or staged provider support:

- KeepTruckin is documented as a legacy compatibility path
- additional provider contracts exist in the protobuf surface, but not all are wired into the local runtime yet

See the provider guides in [`docs/providers/README.md`](docs/providers/README.md).

## Documentation

Start here:

- [Documentation Home](docs/README.md)
- [Quickstart](docs/getting-started/quickstart.md)
- [Normalization Guide](docs/guides/normalization.md)
- [Transport And Remote Services](docs/guides/transports-and-remote-services.md)
- [Query And Sync Guide](docs/guides/query-and-sync.md)
- [Schema And Generated Bindings](docs/concepts/schema-and-generated-bindings.md)
- [Provider Guides](docs/providers/README.md)

## Source Of Truth

`proto/` is the only source of structural types.

That means:

- canonical logistics entities are defined in protobuf
- provider-native payload contracts are defined in protobuf
- generated TypeScript bindings in `gen/ts` are the runtime type surface
- handwritten TypeScript in `src/` focuses on behavior, orchestration, and transport boundaries

The aggregate import surface is `proto/v1/openeld.proto`.

## Package Layout

- `src/` contains the SDK, runtime services, adapters, and client facades
- `proto/` contains canonical and provider-native protobuf definitions
- `gen/ts` contains generated TypeScript bindings that ship with the package
- `docs/` contains consumer and contributor documentation
- `examples/` contains focused usage examples

## Packaging

- `bun run build` emits the ESM bundle and `.d.ts` types
- `@openeld/openeld/client` and `@openeld/openeld/generated` provide clearer import intent while resolving to the published bundle
- `npm pack --dry-run` validates publish contents locally

## Versioning And Release

This repository uses Changesets for semantic versioning, changelog entries, and release tagging.

- run `bun run changeset` when a change should affect the published package version
- commit the generated file under `.changeset/`
- merge to `main` to let the release workflow open or update the version PR
- merging the version PR publishes to npm and creates the corresponding release tag

GitHub Actions handles validation and release automation:

- `.github/workflows/ci.yml` runs build, tests, and package validation
- `.github/workflows/publish.yml` opens version PRs and publishes tagged releases through Changesets
