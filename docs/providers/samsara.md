# Samsara

## Summary

- Regulatory scope: U.S. ELD / compliance capable
- Target maturity: Wave 1
- Current status: Planned

## Auth

- Bearer API token

## Sync Model

- Feed endpoints with cursor semantics
- Webhook support is available
- Best fit checkpoint types: cursor and time watermark

## Supported Domains To Target

- Driver
- Vehicle
- HOS events
- HOS clocks
- GPS
- DVIR

## Known Mapping Notes

- `driver.name` may need splitting into first and last name
- speed may be reported in mph and should normalize to km/h
- HOS logs expose native `hosStatusType`, `origin`, `remark`, and location details

## Verification Priority

- capture official or sandbox HOS log examples
- capture clock examples
- capture feed pagination examples with cursors
