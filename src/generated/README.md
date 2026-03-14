# Generated TypeScript

This directory documents the generated protobuf bindings that are re-exported through the package entrypoint.

Runtime code under `src/` imports generated schemas and generated message types directly instead of defining parallel handwritten domain types.

Consumers can access these bindings from the root package, from the `schemas` namespace on `createOpenEldClient()`, or through the `@openeld/openeld/generated` subpath.
