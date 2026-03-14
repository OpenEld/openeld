# Changesets

Use Changesets to manage package versioning, changelog entries, and release metadata.

## Create a release note

Run:

```sh
bun run changeset
```

Then:

- choose the package to release
- choose `patch`, `minor`, or `major`
- describe the change in plain English

Commit the generated markdown file with your code change.

## Release flow

- pull requests add changeset files
- merges to `main` update or create a release PR
- merging the release PR publishes to npm and creates the corresponding release tag
