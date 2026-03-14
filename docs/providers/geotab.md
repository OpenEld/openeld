# Geotab

## Summary

- Regulatory scope: U.S. ELD / compliance capable
- Target maturity: Wave 1
- Current status: Planned

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

## Verification Priority

- capture `DutyStatusLog` examples
- capture `DriverRegulation` or clock-related examples
- capture `GetFeed` pagination/version examples
