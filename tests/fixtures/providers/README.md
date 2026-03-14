# Provider Fixtures

Store raw provider responses grouped by provider and endpoint.

## Required Structure

Each provider fixture set should include:

- the raw response payload
- a metadata file describing where the payload came from
- the canonical golden output file when normalization coverage exists

## Metadata Fields

Each fixture metadata record should capture:

- provider name
- endpoint or resource
- source type: official docs, sandbox, sanitized production, or inferred
- source URL when available
- capture date
- API version or doc version
- auth context
- sanitization notes

## Quality Rule

Do not treat inferred fixtures as sufficient for production-ready provider coverage.
