# Provider Verification Matrix

This matrix is internal reference material for maintainers. For consumer-facing support guidance, start with [`README.md`](README.md).

| Provider | Fixture Source | Last Verified | Auth Tested | Sync Tested | Driver | Vehicle | HOS Events | HOS Clocks | GPS | DVIR | Safety | IFTA | Assets | Inferred Mappings Remaining | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Samsara | Official docs examples and sync docs | 2026-03-14 | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | No | No | Yes | Doc-verified fixtures |
| Motive | Official docs examples | 2026-03-14 | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | No | No | Yes | Doc-verified fixtures |
| Geotab | Official object and method docs (schema-derived fixtures) | 2026-03-14 | No | Yes | Yes | Yes | Yes | Yes | Yes | No | No | No | No | Yes | Doc-verified fixtures |
| KeepTruckin | Not captured yet | Not verified | No | No | No | No | No | No | No | No | No | No | No | Yes | Planned |
| TT ELD | Not captured yet | Not verified | No | No | No | No | No | No | No | No | No | No | No | Yes | Planned |
| EZLOGZ | Not captured yet | Not verified | No | No | No | No | No | No | No | No | No | No | No | Yes | Planned |
| Verizon Connect | Not captured yet | Not verified | No | No | No | No | No | No | No | No | No | No | No | Yes | Planned |

A provider must not be promoted to production-ready if the fixture source is inferred-only or if core supported domains remain unverified.
