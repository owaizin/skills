# Storybook Architect

Help people find, understand, and use an existing component library. This skill reviews Storybook documentation, writes useful examples, clarifies token and lifecycle conventions, and helps AI agents discover real component APIs.

## Use it in conversation

In **Codex**, type:

```text
$storybook-architect Check this project's Storybook and explain the three most useful improvements.
```

In **Claude Code**, type:

```text
/storybook-architect Document the loading and error states of our search field.
```

These are chat prompts, not terminal commands. You can also ask naturally: “Help agents reuse our existing components without inventing props.” Automatic selection depends on the host; naming the skill explicitly selects it directly.

You do not need to know script paths or Storybook versions. The agent finds the relevant project, reads its conventions, and uses its existing tools. If you invoke only the skill name, it starts with a small read-only orientation and suggests useful next steps. A focused request stays focused.

Other examples:

- “Review whether a new teammate could use our dialog correctly.”
- “Add a story that shows what happens when saving fails.”
- “Help us decide whether these two cards should share an implementation.”
- “Make our component documentation available to agents, and verify what they receive.”

## What to expect

Results explain what happens, why it matters, and what to do, with links to evidence. Confirmed problems are separated from candidates that need review. After a fix, you get the changed behavior, verification result, and remaining limits. Technical logs stay in supporting material.

The skill prefers maintained project checks. In Brilliance, that means the existing Product System audit, registry, and readiness tooling. The bundled scanner is an **optional experimental first pass** for projects without suitable tooling; its counts are not quality scores. The old status classifier is retained for compatibility, but is **retired from recommended use**.

## Install

Install the `storybook-architect/` folder, keeping `SKILL.md`, `agents/`, `references/`, and `scripts/` together. The repository's `storybook-architect.skill` is a ZIP archive containing that folder.

- **Codex:** use the app's skill installer, or place the folder in a skill location your installation discovers. This workspace uses `~/.codex/skills/storybook-architect/`.
- **Claude Code:** place it in `~/.claude/skills/` for personal use, or `.claude/skills/` inside a project. See [Claude Code's skill guide](https://code.claude.com/docs/en/skills).

If it does not appear, check that the folder contains `SKILL.md` directly, without a second nested `storybook-architect/` folder, and reload the host's skill list or start a new session. Keep one authoritative copy when using multiple hosts.

## For maintainers

The agent's workflow is in [SKILL.md](storybook-architect/SKILL.md). References hold [lifecycle decisions](storybook-architect/references/component-lifecycle.md), [token conventions](storybook-architect/references/token-architecture.md), [manifest and MCP setup](storybook-architect/references/agent-readable-docs.md), and [experimental scanner use](storybook-architect/references/metrics.md).

The scripts need Node 22+ and no additional dependencies. To verify script changes:

```bash
node storybook-architect/scripts/test-scripts.mjs
```

See the [dated evaluation](storybook-architect/references/evaluation-2026-09-18.md) for tested versions, known limits, and invocation acceptance scenarios. Storybook guidance targets 10.6; compatibility with another version must be checked in that project.
