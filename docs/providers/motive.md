# Motive

## Summary

- Regulatory scope: U.S. ELD / compliance capable
- Target maturity: Wave 1
- Current status: Planned

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

- capture official or sandbox log payloads
- capture page-based pagination examples
- verify unit conversion assumptions against real payloads
