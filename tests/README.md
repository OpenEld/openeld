# Test Layout

- `unit/` is reserved for package-level unit tests.
- `integration/` is reserved for provider and generation flow tests.
- `contract/` is reserved for schema compatibility and contract tests.
- `fixtures/` is reserved for provider payloads, normalized snapshots, and protobuf fixtures.

## Testing Standard

This package uses high-signal TDD for provider onboarding and normalization work.

## High-Signal Rules

- prefer tests built from authoritative provider payloads over synthetic payloads
- allow doc-verified fixtures when sandbox or live captures are not yet available, but mark schema-derived cases explicitly
- start with failing provider contract and normalization tests before implementation
- keep a small number of golden fixtures that reflect real provider behavior
- avoid tests that only restate implementation details or validate trivial getters and setters
- require sync-state tests for cursor, page, version-token, or time-window behavior where the provider uses them

## Directory Intent

- `fixtures/providers/` stores raw provider responses and fixture metadata
- `fixtures/normalized/` stores canonical golden outputs derived from provider fixtures
- `contract/` validates provider-native contracts and canonical mapping snapshots
- `integration/` validates client, auth, and sync behavior using recorded responses or sandbox-backed flows

## Provider TDD Flow

1. add or update provider fixtures and fixture metadata
2. write failing provider contract tests against those fixtures
3. write failing canonical normalization snapshot tests
4. implement provider-native contracts, mapping logic, and sync behavior
5. add regression tests for edge cases found during integration work
