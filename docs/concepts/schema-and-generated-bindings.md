# Schema And Generated Bindings

OpenELD is protobuf-first.

That is not just a generation detail. It is the main contract design rule for the package.

## Source Of Truth

`proto/` is the only source of structural types.

In practice, that means:

- canonical logistics entities are defined in protobuf
- provider-native payload contracts are defined in protobuf
- service request and response shapes are defined in protobuf
- generated bindings are the runtime type surface used by the SDK

Handwritten TypeScript in `src/` is responsible for behavior, orchestration, and ergonomics. It is not where domain types originate.

## What The Package Exports

Most consumers can stay at the root package:

```ts
import { createOpenEldClient } from "@openeld/openeld";
```

If you want direct access to generated bindings, you can also use:

```ts
import * as schemas from "@openeld/openeld/generated";
```

Or read them through the client:

```ts
import { createOpenEldClient } from "@openeld/openeld";

const client = createOpenEldClient();

console.log(client.schemas);
```

## When To Use The OO SDK

Prefer the OO SDK when you want:

- the shortest path to provider normalization
- cleaner provider-specific input helpers
- transport injection handled at client construction time

## When To Use Generated Bindings Directly

Prefer generated bindings when you want:

- explicit control over request construction
- protobuf-native interoperability with other services
- code that mirrors the underlying message contracts as closely as possible
- lower-level testing around exact message shapes

## Generated Output

The repository currently generates:

- TypeScript bindings into `gen/ts`
- Python bindings into `gen/py`

That shared schema boundary is the reason OpenELD can support multiple language clients without forking the data model.

## Related Guides

- [Quickstart](../getting-started/quickstart.md)
- [Normalization Guide](../guides/normalization.md)
- [Query And Sync](../guides/query-and-sync.md)
