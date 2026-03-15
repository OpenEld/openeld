# OpenELD Docs

Use this documentation set when you want to integrate OpenELD as an SDK consumer.

OpenELD has two layers:

- a recommended OO SDK for common provider normalization workflows
- protobuf-generated contracts for teams that want tighter control over requests, responses, and transports

## Start Here

If you are new to the package:

1. Read the [Quickstart](getting-started/quickstart.md).
2. Follow the [Normalization Guide](guides/normalization.md).
3. Check the [Provider Guides](providers/README.md) for current runtime support and provider-specific caveats.

## Choose A Workflow

### I want the fastest path to value

Use the OO SDK:

- [Quickstart](getting-started/quickstart.md)
- [Normalization Guide](guides/normalization.md)

### I need to understand `query` and `sync`

Use these guides:

- [Transport And Remote Services](guides/transports-and-remote-services.md)
- [Query And Sync](guides/query-and-sync.md)

`client.query` and `client.sync` require a configured transport invoker. They do not provide local in-process query or sync behavior on their own.

### I want to work directly with generated protobuf contracts

Read:

- [Schema And Generated Bindings](concepts/schema-and-generated-bindings.md)

## Current Runtime Reality

Local normalization support is currently strongest for:

- Samsara
- Motive
- Geotab

KeepTruckin remains a limited legacy compatibility path.

The protobuf surface is broader than the local runtime. Treat the provider guides as the truth source for what is consumer-ready today.

## Provider Docs

- [Provider Index](providers/README.md)
- [Samsara](providers/samsara.md)
- [Motive](providers/motive.md)
- [Geotab](providers/geotab.md)
- [KeepTruckin](providers/keeptruckin.md)

## Reference And Contributor Notes

These pages are still useful, but they are not the recommended first stop for SDK consumers:

- [Architecture Notes](architecture/README.md)
- [Service Notes](services/README.md)
- [Decision Records](decisions/README.md)
- [Internal Protobuf Notes](protobuf/README.md)
- [Capability Matrix](providers/capability-matrix.md)
- [Verification Matrix](providers/verification-matrix.md)
