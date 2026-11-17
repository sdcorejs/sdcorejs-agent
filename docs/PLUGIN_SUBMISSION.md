# Test and submit the OpenAI plugin

Use `sdcorejs-agent-openai-<version>.zip` and verify its SHA-256 checksum against
`SHA256SUMS`. It contains the portable Agent Plugins manifest at `plugin.json`,
25 public skills, the shared references in `skills/_refs/`, a logo and the
license. This is a skills-only package. The current workflows use capabilities
supplied by the agent host and do not require a bundled MCP server. Revisit
that decision before submitting if any required feature needs a remote tool.
OpenAI currently does not support adding MCP later to an existing skills-only listing.

## Local or private testing

1. Extract the OpenAI ZIP into an isolated directory as `./plugin/` next to
   the local marketplace's `.agents/` directory. Use a repo marketplace at
   `.agents/plugins/marketplace.json` or an isolated Codex configuration.
2. Save the following catalog as `.agents/plugins/marketplace.json`:

   ```json
   {
     "name": "sdcorejs-preview",
     "interface": { "displayName": "SDCoreJS Preview" },
     "plugins": [{
       "name": "sdcorejs-agent",
       "source": { "source": "local", "path": "./plugin" }
     }]
   }
   ```

3. From the marketplace root, run `codex plugin marketplace add ./` and
   `codex plugin add sdcorejs-agent@sdcorejs-preview`. Alternatively, open the
   catalog in the ChatGPT desktop app's Plugins Directory. In a fresh session,
   ask `sdcorejs-explore` for a read-only repository summary. Record the client
   version, artifact checksum and outcome. Repeat after an update.
4. For Claude Code, extract `sdcorejs-agent-claude-<version>.zip` separately.
   Run `claude plugin validate <extracted-folder>`, then
   `claude --plugin-dir <extracted-folder>` in an isolated project. Check
   the session hook and discoverable skills.

A local Codex catalog is suitable for private testing or distribution and does
not create a public ChatGPT directory listing. The npm installer writes local
skill files. It has no account-level ChatGPT installation step.

## Public directory submission

1. Sign in to the [OpenAI Plugins portal](https://platform.openai.com/plugins)
   and select the organization and project that will own the plugin. Use an
   organization owner account or a role with Apps Management Write. Complete
   individual or business verification in the organization settings, then
   select the verified Developer identity for SDCoreJS. The selected identity determines the
   publisher name displayed in the directory.
2. Choose **Upload new or existing plugin**, then the skills-only track.
   Upload the OpenAI ZIP. Keep the identity and plugin name stable for updates.
3. Resolve automated validation findings. Confirm the display name, description,
   category, logo, support URL and sample prompt. Fill in any additional fields
   flagged by the portal with the organization's verified information.
4. Test the uploaded draft in the portal's available preview surface. Provide
   review instructions with a safe sample project and the expected read-only
   workflow. Submit for review, address feedback, and publish only once approved.
5. For metadata or skill changes, upload a new ZIP to the existing plugin
   entry, re-run checks and follow the portal's update instructions. Record the
   ZIP version and checksum next to the portal's review/publication status.

[OpenAI package layout and local marketplaces](https://developers.openai.com/plugins/build/plugins) Â·
[OpenAI submission and updates](https://developers.openai.com/plugins/deploy/submission) Â·
[OpenAI validation errors](https://developers.openai.com/plugins/deploy/submission-errors) Â·
[Claude Code plugins](https://code.claude.com/docs/en/plugins)
