# Provider Notes

This directory is the source of truth for onboarding and maintaining direct U.S. ELD providers.

## Required Documents

Every provider should have:

- a provider note file describing auth, sync, supported domains, and quirks
- an entry in the capability matrix
- an entry in the verification matrix
- a fixture source record tied to authoritative API examples

## Provider Onboarding Playbook

For each provider, complete the same sequence:

1. Confirm provider relevance.
   Accept only providers that materially help U.S. FMCSA fleet coverage and expose enough API surface to justify direct support.
2. Capture authoritative API truth.
   Collect official docs, sandbox responses, or sanitized production payloads for the provider's key endpoints.
3. Define provider-native protobuf contracts.
   Represent native records faithfully before mapping them into the canonical logistics schema.
4. Write failing high-signal tests first.
   Start with provider contract tests, canonical normalization snapshot tests, and sync-state tests.
5. Implement normalization and sync logic.
   Convert provider-native payloads to canonical protobuf messages and model the provider's real checkpoint behavior.
6. Document fidelity and gaps.
   Record unsupported fields, inferred mappings, rate limits, auth caveats, and known differences from the canonical model.
7. Promote maturity deliberately.
   Move from `planned` to `experimental`, `beta`, and `production` only when the verification matrix supports it.

## High-Signal Fixture Policy

Fixture sources are ranked in this order:

1. official provider examples or schemas
2. sandbox responses
3. sanitized production captures
4. hand-crafted inferred fixtures only when clearly marked and scheduled for replacement

Every fixture set should carry metadata for:

- source URL or endpoint
- provider API version or doc version
- capture date
- auth context
- sanitization notes
- supported domains covered by the fixture

## Quality Gates

A provider is not production-ready until:

- provider-native protobuf contracts exist
- authoritative fixtures exist for the supported domains
- contract tests pass against those fixtures
- normalization golden tests pass for those fixtures
- sync behavior tests cover the provider's real pagination/checkpoint model
- unsupported or degraded fields are explicitly documented

## Matrix Files

- `capability-matrix.md` tracks what each provider supports and how it behaves operationally
- `verification-matrix.md` tracks how well each provider has been proven against real API truth
- `provider-template.md` is the template for adding new provider notes

## Wave 1 Notes

- `samsara.md`
- `motive.md`
- `geotab.md`
- `keeptruckin.md`
