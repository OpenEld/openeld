# Motive

## Summary

- Regulatory scope: U.S. ELD / compliance capable
- Target maturity: Wave 1
- Current status: Doc-verified Wave 1 fixtures and contract tests committed

## Auth

- API key or OAuth 2.0 depending on account/application path

## Sync Model

- Page-based polling is the documented baseline
- Best fit checkpoint types: page token or page counter plus watermark

## Supported Domains To Target

- Driver
- Vehicle
- HOS events
- GPS
- DVIR where available

## Known Mapping Notes

- odometer may require miles-to-meters conversion
- engine hours may require hours-to-seconds conversion
- logs use native `status`, `annotation`, and coordinate fields

## Verification Priority

- committed fixtures: `drivers`, `vehicles`, `hos-logs`, `vehicle-locations`, `page-sync`
- test coverage: fixture provenance, provider contract shape, canonical golden normalization, page-based sync semantics
- remaining upgrade path: validate unit conversion assumptions against sandbox or production captures
