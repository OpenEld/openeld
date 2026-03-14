# openeld

`openeld` is a protobuf-first package for a universal logistics data interface across ELD and telematics providers.

## Repository Shape

- `proto/` contains the canonical message and service definitions.
- `src/` contains behavior-only runtime modules that consume generated protobuf types.
- `gen/` is reserved for generated language bindings.
- `buf/` contains protobuf linting and generation configuration.
- `docs/`, `examples/`, and `tests/fixtures/` support schema evolution and provider onboarding.

## Source Of Truth

All shared types are intended to be defined in Protocol Buffers so TypeScript and Python bindings can be generated from the same contracts.

## Current Schema Coverage

The `v1` schema currently includes:

- common primitives for IDs, dates, time ranges, locations, measurements, source metadata, and audit metadata
- normalized logistics entities for carriers, drivers, vehicles, vehicle assignments, HOS events, HOS daily summaries, GPS locations, DVIRs, data consents, safety events, IFTA trips, assets, and asset locations
- provider payload contracts for Samsara, Motive, Geotab, KeepTruckin, Project44, FourKites, Verizon Connect, and Fleet Complete
- service definitions for ingestion, normalization, query, and sync workflows

The aggregate import surface is `proto/v1/openeld.proto`.

## Generation

The default Buf generation template produces:

- TypeScript output in `gen/ts`
- Python output in `gen/py`

## Packaging

The npm package is built from `src/index.ts` into `dist/` before publishing.

- `bun run build` emits the ESM bundle and `.d.ts` types
- `src/index.ts` re-exports the runtime normalization service and selected generated protobuf bindings
- `gen/ts` ships alongside `dist/` so generated schemas remain part of the package contract
- `npm pack --dry-run` validates the published package contents locally

## Runtime Usage

The TypeScript runtime is now protobuf-first end to end:

- build provider payload messages with the generated schemas or the fixture-loading helpers
- pass a generated `NormalizeProviderPayloadRequest` to `normalizeProviderPayload()`
- consume the generated `NormalizeProviderPayloadResponse` or serialize it with the protobuf runtime

## Versioning

This repository uses Changesets for semver, changelog entries, and release tagging.

- run `bun run changeset` when a change should affect the published package version
- commit the generated file under `.changeset/`
- merge to `main` to let the release workflow open or update the version PR
- merging the version PR publishes to npm and creates the corresponding release tag

## Release Automation

GitHub Actions handles validation and npm publishing:

- `.github/workflows/ci.yml` runs install, build, tests, and `npm pack --dry-run`
- `.github/workflows/publish.yml` uses Changesets on `main` to open version PRs and publish/tag releases after merge

For npm publishing, configure npm trusted publishing for this repository and workflow, or update the workflow if you prefer token-based publishing.

## Next Steps

- Refine provider-native record coverage as more provider field mappings are confirmed.
- Widen normalization outputs for consent, safety, IFTA, and asset tracking once provider mappings for those domains are mature.
- Add validation and contract tests around the `v1` schema.
- Decide whether query and sync service APIs should remain generic or split further by domain area.
