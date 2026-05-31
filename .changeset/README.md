# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

When you make a change that should be released, run:

```bash
npm run changeset
```

Answer the prompts to declare whether the change is a `major`, `minor`, or
`patch`, and write a short summary. This creates a markdown file in this folder
describing the change.

On release, `npm run changeset:version` consumes those files to bump the version
and update `CHANGELOG.md`, and `npm run changeset:publish` publishes to npm.

See the [Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
for the full workflow.
