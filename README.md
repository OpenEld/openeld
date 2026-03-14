# openeld

`openeld` is a protobuf-first package for a universal logistics data interface across ELD and telematics providers.

## Repository Shape

- `proto/` contains the canonical message and service definitions.
- `src/` contains the thin TypeScript package surface and hand-written integration scaffolding.
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

## Next Steps

- Refine provider-native record coverage as more provider field mappings are confirmed.
- Widen normalization outputs for consent, safety, IFTA, and asset tracking once provider mappings for those domains are mature.
- Add validation and contract tests around the `v1` schema.
- Decide whether query and sync service APIs should remain generic or split further by domain area.
