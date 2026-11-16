# SDCoreJS Agent

The npm package `@sdcorejs/agent` contains 25 portable engineering skills,
shared references and local helpers from
[SDCoreJS](https://github.com/sdcorejs/sdcorejs-agent). The version in the
package manifest comes directly from its Git tag. `release-source.json` records
the source commit, input hash and whether this is a local preview.

## Install and activate

Installing this npm package only downloads the skill assets. It runs no install
hooks and does not modify project instructions or existing agent configuration.
From a reviewed version, copy the `skills/sdcorejs-*` directories together with
`skills/_refs` into the host's supported skill directory. For Codex native
skills, use `$CODEX_HOME/skills`, or `~/.codex/skills` when unset. Inspect the
destination first; preserve unrelated skills and review collisions in `_refs`.
Restart the host, then confirm activation in a fresh session:

```text
Use sdcorejs-explore to summarize this repository and its verification commands.
Stay read-only and report anything you cannot verify.
```

The companion OpenAI ZIP has a root `plugin.json` for skills-only plugin
installation/submission. Public ChatGPT/Codex listing requires OpenAI scans,
publisher verification and review; possessing a ZIP is not directory approval.
See the [release guide](https://github.com/sdcorejs/sdcorejs-agent/blob/main/docs/RELEASE_PROCESS.md).

## Capabilities and license

Your host supplies the model, tools and permissions. Local helpers require Node;
some optional workflows also need Python, a browser, Git or project tools.
Missing capabilities are reported rather than treated as successful checks.
Maintainer authoring packs, evaluation runtimes and credentials are not bundled.

MIT; preserve LICENSE and the third-party license/provenance files under
`skills/_refs`. Updates never authorize overwriting user-authored instructions.
