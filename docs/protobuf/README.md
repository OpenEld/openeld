# Protobuf Notes

This page is internal reference material for contributors and maintainers.

If you are using the package as an SDK consumer, read [`../concepts/schema-and-generated-bindings.md`](../concepts/schema-and-generated-bindings.md) first.

`proto/` is the source of truth for the package.

## Package Layout

- `common/` contains reusable primitives, units, source metadata, and audit metadata
- `logistics/` contains the normalized canonical model for carriers, drivers, vehicles, assignments, HOS, GPS, DVIR, consent, safety, IFTA, assets, and geofence events
- `providers/` contains provider-native payload contracts grouped by ELD and telematics source
- `services/` contains RPC-ready ingestion, normalization, query, and sync APIs
- `v1/openeld.proto` is the aggregate import surface for the current schema version

## Generation

`buf/buf.gen.yaml` is configured to generate:

- TypeScript via `buf.build/bufbuild/es` into `gen/ts`
- Python message types via `buf.build/protocolbuffers/python` into `gen/py`
- Python gRPC stubs via `buf.build/grpc/python` into `gen/py`

## Design Rules

- all identifiers are modeled as strings for cross-language ergonomics
- provider payloads stay separate from normalized logistics messages
- source metadata is attached to records for traceability back to native provider payloads
- distances, speed, engine hours, timestamps, and coordinates use normalized units defined in the schema
- consent, safety, IFTA, and asset tracking are part of the canonical `v1` model
- raw provider geofence webhook events stay separate from canonical `GeofenceEvent` messages and preserve source payload JSON in `SourceRecord.raw_payload_json`
- Catena-inspired domains are exposed through the canonical schema and query APIs without implying broad local provider runtime coverage
