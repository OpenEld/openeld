# KeepTruckin

## Summary

- Regulatory scope: Legacy compatibility for the Motive lineage
- Target maturity: Legacy compatibility path
- Current status: Planned

## Auth

- Legacy behavior may differ by account age and migration path

## Sync Model

- Treat as a legacy polling integration unless verified otherwise
- Best fit checkpoint types: page-based or watermark-based depending on recovered API behavior

## Supported Domains To Target

- Driver
- Vehicle
- HOS events
- GPS
- limited DVIR and clock support where verified

## Known Mapping Notes

- use only where customer data or migration scenarios require it
- prefer compatibility rules and fixtures over broad new feature expansion

## Verification Priority

- capture authentic legacy payloads
- distinguish legacy KeepTruckin behavior from modern Motive behavior
- mark all inferred mappings clearly until verified
