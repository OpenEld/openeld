# Query And Sync

`client.query` and `client.sync` are part of the public SDK surface because they match the protobuf service contracts and shape the long-term platform boundary.

They should be treated as transport-backed namespaces, not as local runtime features.

## Current Status

Today:

- the method surfaces exist
- the request and response types are generated and stable enough to integrate against
- you must inject a transport invoker to use them

OpenELD does not currently provide built-in local implementations for these namespaces.

## Intended Usage Pattern

Use `query` and `sync` when your architecture includes a remote service that implements the OpenELD protobuf APIs.

Examples:

- a backend service that normalizes and stores provider data
- an internal gateway that speaks protobuf contracts to multiple apps
- a transport adapter around Connect, gRPC, or another RPC mechanism

## Query

Treat `query` as the read boundary for canonical data and related remote operations.

It is appropriate when you want:

- canonical data retrieval
- cross-provider access through one contract family
- a stable client surface even if the backend evolves

## Sync

Treat `sync` as the orchestration boundary for provider synchronization and checkpoint advancement.

It is appropriate when you want:

- remote execution of provider sync workflows
- checkpoint handling outside the client process
- consistent sync semantics across providers

## Recommendation

If your immediate goal is to normalize payloads inside the same process, stay with:

- `client.providers.*.normalize(...)`
- `client.normalization.normalize(...)`

Move to `query` and `sync` only when your system genuinely needs a transport boundary.

## Related Guides

- [Transport And Remote Services](transports-and-remote-services.md)
- [Schema And Generated Bindings](../concepts/schema-and-generated-bindings.md)
