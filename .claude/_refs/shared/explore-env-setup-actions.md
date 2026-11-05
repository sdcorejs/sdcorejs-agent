# Explore: Env Setup Actions

## Env Setup Actions

`env-setup-readonly` is the default. It may read README, package manifests,
lockfiles, Docker Compose, devcontainer files, env examples, and scripts. It
outputs setup commands/instructions and required env key names only.

It must not create `.env`, `.env.local`, config files, or secrets by default.
It must never overwrite existing env files. It must never insert real secret
values. It must not install packages, download tools, or start services unless
explicitly requested.

`env-setup-write-approved` may create a safe env file from an example only after
explicit approval. Use placeholders only, preserve existing files, and record
the write in `explore_context`.
