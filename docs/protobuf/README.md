# Protobuf Notes

`proto/` is the source of truth for the package.

## Package Layout

- `common/` contains reusable primitives, units, source metadata, and audit metadata.
- `logistics/` contains the normalized canonical model for carriers, drivers, vehicles, assignments, HOS, GPS, DVIR, consent, safety, IFTA, and assets.
- `providers/` contains provider-native payload contracts grouped by ELD and telematics source.
- `services/` contains RPC-ready ingestion, normalization, query, and sync APIs.
- `v1/openeld.proto` is the aggregate import surface for the current schema version.

## Generation

`buf/buf.gen.yaml` is configured to generate:

- TypeScript via `buf.build/bufbuild/es` into `gen/ts`
- Python message types via `buf.build/protocolbuffers/python` into `gen/py`
- Python gRPC stubs via `buf.build/grpc/python` into `gen/py`

## Design Rules

- All identifiers are modeled as strings for cross-language ergonomics.
- Provider payloads stay separate from normalized logistics messages.
- Source metadata is attached to records for traceability back to native provider payloads.
- Distances, speed, engine hours, timestamps, and coordinates use normalized units defined in the schema.
- Consent, safety, IFTA, and asset tracking are part of the canonical `v1` model.
- The new Catena-inspired domains are currently exposed through the canonical schema and query APIs without widening provider normalization responses yet.
