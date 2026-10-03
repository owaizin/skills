# Storybook Architect

**Your go-to Storybook specialist, right where you work.**

Bring a question, a task, or a Storybook you don't know how to improve. Storybook Architect helps you make sense of your component library, decide what it needs, and turn it into a reference your team and AI agents can use.

It works inside your coding agent. It looks at your project, explains the choices, recommends a direction, and carries the agreed work through. You don't need to know Storybook terminology or arrive with a plan.

## Start wherever you are

| You might ask | What it helps you work through |
|---|---|
| “Our Storybook is confusing. Where do we start?” | Follow how someone finds and uses a component, then recommend a useful starting point. |
| “How should we organize this library?” | Make naming, grouping, navigation, and documentation fit the people using it. |
| “Which component should I use here?” | Compare purpose, behavior, constraints, and alternatives against your actual task. |
| “What examples should this component have?” | Choose meaningful states and compositions, including loading, errors, and recovery. |
| “Can we see these components in our actual product screens?” | Build representative Storybook examples, explain what is live or simulated, and check their rendering and isolation. |
| “Help our agents use the right components.” | Deliver a maintained component catalog and access path, then check that a consumer can discover and use a component. |
| “How do we keep this useful?” | Clarify contribution, ownership, and maintenance practices that fit your team. |

A focused request works too: “Add a story showing what happens when saving fails.”

## Use it in conversation

After [installing the skill](#install), open your project and enter a chat prompt.

**Codex**

```text
$storybook-architect Help me make sense of our Storybook and decide what would help our team.
```

**Claude Code**

```text
/storybook-architect Help me make sense of our Storybook and decide what would help our team.
```

You can replace the request with your own question or task. Invoking just the skill name starts a small, read-only orientation and a recommended next step. These are chat prompts, not terminal commands.

Natural-language selection depends on the host; naming the skill explicitly makes your intention clear. You don't need to supply script paths, versions, or a technical workflow.

## What working with it should feel like

**You get help making the decision.** The agent inspects the project before asking for information it can find itself. It explains what it recommends and why, asking focused questions when your context changes the answer. An uncertain starting point is welcome.

**The work fits your request.** A review gives you supported recommendations. An implementation request includes changes and relevant checks. A small repair stays focused; broader work continues through the agreed outcome, with checkpoints that make progress understandable.

**Your existing work matters.** Useful conventions, tooling, and team decisions provide the starting point. Returning work picks up from recorded decisions and respects what you stopped or deferred.

**You can understand and inspect the result.** Expect relevant examples, clear explanations, and an honest account of what was checked and what remains uncertain. Decisions belong where the next contributor can find them.

The skill supports your team's judgment. It does not certify accessibility or documentation completeness, and visual redesign is outside its core scope. The specialist experience is the intended standard; current evaluations cover bounded integration and agent tasks, not a human-usability study.

## Install

Install the `storybook-architect/` folder, keeping `SKILL.md`, `agents/`, `references/`, and `scripts/` together. The repository's `storybook-architect.skill` is a ZIP archive containing that folder.

- **Codex:** use the app's skill installer, or place the folder in a skill location your installation discovers. A personal installation can use `~/.codex/skills/storybook-architect/`.
- **Claude Code:** place it in `~/.claude/skills/` for personal use, or `.claude/skills/` inside a project. See [Claude Code's skill guide](https://code.claude.com/docs/en/skills).

If it does not appear, check that the folder contains `SKILL.md` directly, without a second nested `storybook-architect/` folder, and reload the host's skill list or start a new session. Keep one authoritative copy when using multiple hosts.

## For maintainers

The skill prefers maintained project tooling. Its bundled scanner is an **optional experimental source survey** for projects without suitable checks; its counts are not quality scores. The old status classifier is retained for compatibility and is **retired from recommended use**. Project-specific guidance remains in the operating instructions.

The agent's workflow is in [SKILL.md](storybook-architect/SKILL.md). References hold [lifecycle decisions](storybook-architect/references/component-lifecycle.md), [token conventions](storybook-architect/references/token-architecture.md), [manifest and MCP setup](storybook-architect/references/agent-readable-docs.md), and [experimental scanner use](storybook-architect/references/metrics.md).

For AI-readable catalogs, see [registry delivery](storybook-architect/references/registry-delivery.md). It covers existing registries, native manifests, and project-specific exporters when needed. The skill does not ship a hosted registry or universal generator; this end-to-end workflow has not yet received a consumer evaluation.

For product-screen representation and drift checks, see [product contexts](storybook-architect/references/product-context.md). This workflow has not yet had an end-to-end product evaluation.

The scripts need Node 22+ and no additional dependencies. To verify script changes:

```bash
node storybook-architect/scripts/test-scripts.mjs
```

Read the [integration evaluation](storybook-architect/references/evaluation-2026-09-18.md), [guidance evaluation](storybook-architect/references/evaluation-2026-09-21.md), and [consulting evaluation](storybook-architect/references/evaluation-consulting-2026-09-21.md) for observed results and limits. Storybook guidance targets 10.6; compatibility with another version must be checked in that project.

The [PR/FAQ](docs/PR-FAQ.md) describes the customer promise and validation plans. The [changelog](storybook-architect/CHANGELOG.md) records changes to the skill.
