# Install SDCoreJS Agent

The public npm package installs 25 skills and their shared references on explicit
request. Run from the target project's root for project scope. Use a supported
Node.js version (^22.22.3, ^24.15.0 or >=26.0.0). These commands apply once
version 1.0.0 is available.

| Agent | Project scope | User scope |
| --- | --- | --- |
| Codex | `.agents/skills/` | `~/.agents/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |

The user paths are relative to your local home directory. Project scope is
relative to the current directory. Trust the project according to your agent's
rules, restart the agent, and ask it to use `sdcorejs-explore` to summarize the
repository and its verification commands without editing files.

## Linux, macOS and WSL

```sh
npx sdcorejs-agent@1.0.0 list
npx sdcorejs-agent@1.0.0 install --agent codex --scope project --dry-run
npx sdcorejs-agent@1.0.0 install --agent codex --scope project
npx sdcorejs-agent@1.0.0 uninstall --agent codex --scope project
```

## PowerShell and Command Prompt

```bat
npx.cmd sdcorejs-agent@1.0.0 install --agent claude-code --scope user --dry-run
npx.cmd sdcorejs-agent@1.0.0 install --agent claude-code --scope user
npx.cmd sdcorejs-agent@1.0.0 uninstall --agent claude-code --scope user
```

## Collisions, updates and recovery

The installer prints the destination, skills, shared references and receipt.
A repeated install of the same package checks that the managed directories
are intact. Existing skills, `_refs` or links at a managed path block installation.
Use a different scope or back up and move the colliding directories before
retrying. Uninstall requires the original package version and verifies file
contents before moving anything. Back up edits before reconciling a modified
installation. For an upgrade, uninstall the original version and install the
new one. To roll back, repeat those steps in reverse.

If an interrupted command leaves a lock and a sibling staging directory, stop
other installer processes and back up both the destination and staging data
before moving files manually. Remove the stale lock only after recovery.
The installer leaves unrelated skills and project instruction files in place.

## Other adoption paths

- Claude Code can also load the separate Claude ZIP as a plugin, with its
  session hook, or use the repository marketplace. See the
  [plugin guide](PLUGIN_SUBMISSION.md).
- Codex and the ChatGPT desktop app can test the OpenAI ZIP through a local
  marketplace. Public ChatGPT directory distribution uses OpenAI review.
- Cursor documents `.cursor/skills` and `~/.cursor/skills`. GitHub Copilot CLI
  documents `.github/skills` and `~/.copilot/skills`. Gemini CLI documents
  `.gemini/skills` and `~/.gemini/skills`. Each also documents shared
  `.agents/skills` locations. These paths were researched. This release does
  not claim installer or live activation support for those hosts.

[OpenAI skills paths](https://developers.openai.com/api/reference/cli) ·
[Claude Code skills](https://code.claude.com/docs/en/skills) ·
[Cursor skills](https://cursor.com/docs/skills) ·
[Copilot CLI skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) ·
[Gemini CLI skills](https://geminicli.com/docs/cli/skills/)
