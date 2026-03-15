# Provider Index

Use this directory to understand what OpenELD supports for each provider today.

The provider pages are written from a consumer point of view first:

- what input the SDK expects
- what local normalization is currently strong at
- how sync/checkpoint behavior is modeled
- where caveats or inferred mappings still exist

## Current Runtime Support

### Local normalization available now

- [Samsara](samsara.md)
- [Motive](motive.md)
- [Geotab](geotab.md)

### Limited or staged support

- [KeepTruckin](keeptruckin.md)

KeepTruckin should be treated as a legacy compatibility path rather than a recommended new integration target.

## How To Read Status

OpenELD uses support language conservatively:

- `local normalization available` means the SDK has a wired provider namespace today
- `limited or staged support` means the protobuf surface or documentation exists, but local runtime behavior is incomplete or intentionally narrow
- provider docs call out when fixtures are doc-verified, schema-derived, or still need stronger sandbox or production captures

## Best Starting Point

If you are deciding how to integrate:

1. Check whether your provider has local normalization today.
2. Read the provider-specific input expectations and caveats.
3. Confirm whether your workflow needs local normalization only or a transport-backed sync service later.

## Related Docs

- [Quickstart](../getting-started/quickstart.md)
- [Normalization Guide](../guides/normalization.md)
- [Transport And Remote Services](../guides/transports-and-remote-services.md)

## Internal Reference

These pages remain useful for contributors and maintainers:

- [Capability Matrix](capability-matrix.md)
- [Verification Matrix](verification-matrix.md)
- [Provider Template](provider-template.md)
