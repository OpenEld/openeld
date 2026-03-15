# KeepTruckin

## Status

- Runtime support: limited or staged
- Recommended use: legacy compatibility and migration scenarios
- Current quality level: planned support with explicit need for authentic legacy payload capture

## What To Expect

KeepTruckin is not positioned as a first-choice new integration target.

Use it when you need to:

- preserve compatibility for older customer environments
- interpret historical data from pre-migration systems
- bridge legacy KeepTruckin behavior that is distinct from modern Motive behavior

## Input And Runtime Reality

The protobuf surface leaves room for provider-native support, but local runtime behavior is intentionally limited compared with Samsara, Motive, and Geotab.

Treat any KeepTruckin integration as a staged path that should be validated against real captured payloads before broad rollout.

## Sync Model Summary

Until verified with authentic captures, treat KeepTruckin as a legacy polling integration.

The likely checkpoint models are:

- page-based progression
- watermark-based progression

The exact behavior can vary by account history and migration path.

## Caveats And Warnings

- legacy behavior may differ significantly from modern Motive accounts
- limited DVIR and clock coverage should not be assumed without fixture evidence
- inferred mappings should be treated as temporary until replaced by stronger captures
- if you need new feature depth, prioritize Motive unless a customer requirement forces legacy compatibility

## Recommended Next Step

If you must support KeepTruckin, capture authentic legacy payloads first and design your rollout around explicit verification gates.
