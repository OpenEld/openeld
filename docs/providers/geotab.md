# Geotab

## Summary

- Regulatory scope: U.S. ELD / compliance capable
- Target maturity: Planned
- Current status: Doc-verified fixtures and contract tests committed

## Auth

- Session-style authenticate flow

## Sync Model

- `GetFeed` and `fromVersion` style incremental sync
- Best fit checkpoint types: version token and watermark

## Supported Domains To Target

- Driver
- Vehicle
- HOS events
- HOS clocks / driver regulation
- GPS

## Known Mapping Notes

- HOS data centers on `DutyStatusLog` and related types
- event semantics are richer and more system-oriented than some other providers
- license number availability may depend on custom fields or account configuration
- initial committed fixtures are schema-derived from official object and method docs because public static payload examples are limited

## Verification Priority

- committed fixtures: `users`, `devices`, `duty-status-logs`, `driver-regulations`, `log-records`, `getfeed`
- test coverage: fixture provenance, provider contract shape, canonical golden normalization, version-token sync semantics
- remaining upgrade path: replace schema-derived fixtures with recorded `Get` and `GetFeed` payloads from a sandbox or live tenant
