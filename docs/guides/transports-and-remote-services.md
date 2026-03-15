# Transport And Remote Services

OpenELD has two kinds of SDK behavior:

- local in-process normalization
- transport-backed service calls

That distinction matters most for `client.query` and `client.sync`.

## When You Need A Transport

You do not need a transport invoker for:

- `client.providers.*.normalize(...)`
- `client.normalization.normalize(...)`

You do need a transport invoker for:

- `client.query.*`
- `client.sync.*`

Those namespaces are facades over protobuf service methods. They intentionally require you to inject the transport boundary rather than pretending a local implementation exists.

## The Invoker Model

OpenELD accepts a unary method invoker that receives:

- the protobuf method descriptor
- the generated request message

Your invoker returns the generated response message.

At a high level, your transport layer is responsible for:

- turning the request into an HTTP, gRPC, Connect, or internal RPC call
- routing it to a server that implements the OpenELD protobuf contracts
- returning the matching protobuf response type

## Minimal Shape

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient({
  queryInvoker: async (method, request) => {
    return sendRequestToRemoteOpenEldService(method, request);
  },
  syncInvoker: async (method, request) => {
    return sendRequestToRemoteOpenEldService(method, request);
  },
});
```

The exact implementation depends on your transport stack.

## Common Error

If you call `client.query` or `client.sync` without configuring an invoker, OpenELD throws an error that explicitly tells you a transport invoker is required.

That is expected behavior.

## Good Uses For Transport-Backed Services

Use remote query and sync calls when you want:

- a centralized normalization or ingestion service behind the SDK
- shared server-side credentials for provider access
- a stable protobuf API boundary across multiple clients
- consistent pagination, checkpoint, or sync orchestration outside the application process

## What OpenELD Does Not Promise

OpenELD does not currently promise:

- a built-in hosted backend
- local query persistence
- local sync execution behind `client.query` or `client.sync`

Read [Query And Sync](query-and-sync.md) for the current intended usage pattern.
