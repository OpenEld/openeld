# Provider Capability Matrix

| Provider | Auth | Sync Model | Rate Limits | Driver | Vehicle | HOS Events | HOS Clocks | GPS | DVIR | Safety | IFTA | Assets | Maturity | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Samsara | Bearer token | Feed + webhook + cursor | Documented | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Unknown | Unknown | Planned | Priority direct provider |
| Motive | API key / OAuth | Page-based polling | Partially documented | Planned | Planned | Planned | Unknown | Planned | Unknown | Unknown | Unknown | Unknown | Planned | Priority direct provider |
| Geotab | Session auth | `GetFeed` + version token | Documented per database | Planned | Planned | Planned | Planned | Planned | Unknown | Unknown | Unknown | Unknown | Planned | Priority direct provider |
| KeepTruckin | Legacy compatibility | Legacy polling | Legacy / variable | Planned | Planned | Planned | Unknown | Planned | Unknown | Unknown | Unknown | Unknown | Planned | Maintain only where legacy data matters |
| TT ELD | API key | Time-window polling | Unknown | Planned | Planned | Planned | Unknown | Planned | Unknown | Unknown | Unknown | Unknown | Planned | Candidate for later expansion |
| EZLOGZ | API key | Unknown | Unknown | Planned | Planned | Planned | Unknown | Planned | Unknown | Unknown | Unknown | Unknown | Planned | Candidate for later expansion |
| Verizon Connect | OAuth | Unknown | Unknown | Partial | Partial | Partial | Unknown | Planned | Unknown | Unknown | Unknown | Planned | Planned | Verify ELD/HOS depth before prioritizing |

Update this file as soon as a provider moves beyond planning. Replace `Unknown` and `Partial` with documented facts backed by provider notes and fixtures.
