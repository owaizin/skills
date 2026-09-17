---
name: storybook-architect
description: Help people maintain and use a Storybook component library. Use for Storybook health checks, clearer component documentation and stories, token or lifecycle conventions, and making existing components discoverable to AI agents through manifests and MCP. Prefer the project's existing checks; the bundled source scanner is an optional experimental fallback. Does not handle visual redesign or general UI reviews unrelated to a component library.
---

# Storybook Architect

Help consumers find the right component, understand its contract, and use it successfully. A useful result is a clearer example, a verified fix, or an evidence-backed decision someone can act on.

## Start with the person's request

People can invoke this skill directly or describe the work naturally:

| Where | Example |
|---|---|
| Codex | `$storybook-architect Check this project's Storybook and explain the three most useful improvements.` |
| Claude Code | `/storybook-architect Document the loading and error states of our search field.` |
| Natural language | “Help agents use our existing components without inventing props.” |

Invocation syntax belongs to the host application. These examples are prompts, not terminal commands. Users do not need to supply script paths, flags, framework names, or a phase number.

**When invoked without a task**, start a small, read-only orientation in the current project: find Storybook and its maintained checks, inspect a representative component and its docs, then explain up to three useful next steps. Do not launch a repository-wide scan or install tooling by default.

**When given a task**, go directly to the relevant work. A request to write one story does not require a system-wide audit. A review stays a review; a request to fix something includes implementing and verifying the fix within the authorized scope.

Say what you will do in one plain sentence, then proceed. For example: “I'll check how someone finds and uses this component, then fix the documentation gaps.” Avoid a setup questionnaire. Resolve routine details from the repository; ask one focused question only when a missing answer changes the work. If several Storybooks could own the requested component, investigate its imports and ownership first. If none exists, explain what you found and the smallest useful next step; installation is a separate scope decision.

## Orient quietly

Read the project's instructions, package scripts, Storybook configuration, and relevant component source. Locate the actual package in a monorepo. Look for existing audits, token checks, registries, test runners, and contribution rules before introducing another mechanism.

Use `scripts/detect.mjs <project-directory>` as a hint when useful. It reads package metadata and installed versions; it does not evaluate the configuration or prove feature support. Confirm the framework, imports, enabled addons, and runner against the installed project before emitting code. Do not ask the user to run detection for you when you can inspect it yourself.

**Use maintained project tooling first.** In Brilliance, use its Product System audit, registry, and readiness checks. The bundled scanner is retired from that project's recommended workflow: it duplicates less accurate versions of checks already there. Keep this skill's documentation, story, lifecycle, and agent-discovery guidance.

If a project lacks relevant tooling and a source survey would answer the request, read [the experimental scanner guide](references/metrics.md). Explain the bounded scope and limitations before running it. Broad adoption, quality, or readiness conclusions cannot come from its counts.

## Choose the smallest useful path

| The person needs | Work to do | Read as needed |
|---|---|---|
| “Can we trust these docs?” | Follow a consumer task through a representative example, source, and available checks; identify where they disagree. | [Lifecycle](references/component-lifecycle.md) |
| “Document or fix this component” | Use its actual API and local story conventions; add representative states and check the changed behavior. | [Lifecycle](references/component-lifecycle.md) |
| “Make our tokens consistent” | Establish meaning, theme behavior, and existing conventions before suggesting changes. | [Tokens](references/token-architecture.md) |
| “What should be shared or deprecated?” | Separate reproducible scenarios, consumer docs, and shared ownership; record the decision and migration responsibility. | [Lifecycle](references/component-lifecycle.md) |
| “Help agents reuse our components” | Verify generated component and documentation manifests, then the available MCP tools. | [Agent-readable docs](references/agent-readable-docs.md) |

Use [sourced patterns](references/elite-patterns.md) for relevant examples, not as a checklist to impose on every team.

## Ground decisions in consumer needs

1. Name the obligation: for example, a dialog restores focus, a form explains recovery, or a published example matches the installed package.
2. Identify evidence that would demonstrate it: an interaction check, a rendered scenario, a consumer reproduction, or a release comparison.
3. Automate only what can be checked reliably. Keep human decisions explicit, with rationale and an owner where needed.

A story count cannot establish documentation quality. A literal value cannot establish a missing token. A file timestamp cannot establish decay. Similar prop names cannot establish interchangeable components. Confirm a candidate before recommending a change.

### Stories people can use

Use the project's story format and verified framework imports. Give each example a clear purpose and representative content. Document when to use it, important constraints, and recovery behavior; put API descriptions near the component and props so generated docs can reuse them.

Composition stories are useful for focus order, long content, error recovery, and layering. Supply controlled providers and fixtures at the boundary. Do not restructure the product merely to make Storybook convenient. See [Storybook's page guidance](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook).

Keep maturity, documentation visibility, agent retrieval, and test selection separate. Resolve tags across project → component → story before interpreting them. The retained `scripts/validate-status.mjs` is **retired from all recommended workflows**: its file-level regex cannot resolve that inheritance. Do not run it to make project decisions or add it to CI. Prefer the project's checker over Storybook's resolved index.

### Tokens and accessibility

Preserve the project's token vocabulary. Semantic aliases matter where a role changes with theme or mode; direct spacing or radius scales can be appropriate. A new token needs a reusable meaning, not just a scanner hit.

Inspect the actual accessibility runner before changing addon settings. `a11y.manual: true` can coexist with separate Playwright axe tests; it is not evidence that accessibility goes untested. Verify automated failures through the runner the project uses, and check relevant keyboard, focus, and content behavior separately.

### Agent discovery

Prefer documentation generated from the same source humans use. Preserve a working docgen parser unless observed missing information warrants changing it. Verify a real component, prop, description, and import guidance in the built component manifest. Check generated MDX exclusions in **the docs manifest**, too. A page absent from `components.json` proves nothing about `docs.json`.

A configured feature is not an observed result. When claiming the live agent path works, retrieve the known component through the actual MCP tools. If only the build was checked, say so. Built manifests can be consumed without a live MCP server.

## Deliver a result people can understand

Lead with the outcome and the next useful action. For reviews, prioritize by consumer impact and start with at most three findings unless the person asks for a full critique. Link the evidence and fuller detail rather than opening with metrics or logs.

For each finding, explain **what happens → why it matters → what to do**, with a source or example. Use plain labels when confidence needs clarification:

- **Confirmed:** reproduced or directly observed. State the scope of the check.
- **Needs review:** a candidate with a concrete reason to investigate.
- **Not checked:** unavailable evidence or work outside the request; name what would establish it.

For example: “**Confirmed:** the search field has no loading example, so consumers cannot see whether typing stays available during a request. Add a controlled loading story alongside its existing error example. [Evidence: story file.]” This identifies a documentation gap; it does not claim the component itself is broken.

After changes, say what changed, how it was checked, and any remaining limitation. Explain unfamiliar terms on first use. Keep JSON, counts, command transcripts, and implementation details in supporting artifacts unless requested. Use the project's existing place for findings; do not create a parallel report hierarchy by default. Avoid invented quality scores and repeated approval prompts for work already authorized.

## Maintenance and evidence limits

- `scripts/detect.mjs`: optional environment hint; confirm against the real configuration.
- `scripts/audit.mjs`: optional experimental source survey, not the default entry point. See [limitations and safe use](references/metrics.md).
- `scripts/validate-status.mjs`: retained for compatibility and regression study only; unsupported for decisions.
- `scripts/test-scripts.mjs`: fixture checks for maintainers after script edits; these do not validate a design system.

Storybook examples target 10.6; check other versions before using them. The scanner has no curated multi-repository accuracy evaluation, counts component files rather than every export, and cannot prove release alignment or consumer readiness. The [evaluation record](references/evaluation-2026-09-18.md) separates reproduced results, previously reported observations, and unverified claims.
