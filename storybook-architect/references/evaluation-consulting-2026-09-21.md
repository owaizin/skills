# Consulting and continuation evaluation — 21 September 2026

## What changed and what was preserved

The skill already supported plain-language invocation, focused repairs, source-aware verification, maintained project tooling, explicit uncertainty, and readable handoffs. This update addresses three remaining gaps: diagnosing broad complaints before prescribing changes; keeping the full requested outcome distinct from a first checkpoint; and recovering decisions through the normal contributor entry point.

`references/engagement.md` adapts Design System Loop's maintained discovery, engagement, scope, and establishment practices to Storybook. The entry skill routes uncertain and multi-step work there while keeping narrow repairs direct. README and the draft PR/FAQ describe the intended experience. No DS Loop commands, configuration, taxonomy, or product implementation mandate is imported.

Existing Storybook technical references, scripts, invocation metadata, scanner retirement, and version-specific checks are unchanged by this pass. Shared policy and release authority remain with the team. The skill is an agent procedure; it is not an executable consulting service or a guarantee of agent behavior.

## Method

Three independent Codex collaboration agents received the candidate skill and a synthetic project, without prior conversation, assessment criteria, or sibling fixtures. Each inherited the parent model without an override; the exact provider model revision was not exposed. The returning agent received only the project root, not a decision-file path or the prior decision content.

The parent recorded baseline checks, inspected returned files, and compared complete fixture hashes for changes, additions, and removals. Inputs, outputs, protocol, hashes, observations, and packaging receipt are retained in local maintainer records, excluded from the public repository and distribution. The earlier skill snapshot is retained there too. This summary does not make the raw evidence publicly reproducible. Repository base remains `1b554b582f12ce6aacbc32cde3ed4d5519dec8a6` plus the previously completed guidance work and this revision.

## Observations

| Request | Observed outcome | Evidence and limit |
|---|---|---|
| “Our Storybook is a mess,” with green CI and new-joiner difficulty; diagnosis only | Followed the README's usage path, reproduced an unsupported package import, and recommended repairing the guide and adding a public-import check. Distinguished this from a component defect or a need to reorganize stories. | The agent ran the existing passing test and an import probe. The parent confirmed no fixture files changed or appeared. The original human incident was a supplied report; no human onboarding or browser task was run. |
| Fix only the Disabled story | Changed only its disabled argument, preserved other examples and source, and reported the appropriate check scope without an interview or broad plan. | Parent baseline: 2 passed, 1 failed. Agent after edit: 3 passed. Hash comparison confirmed exactly one story file changed. Checks render React to HTML; they do not exercise browser behavior. |
| Return to finish agreed Upload and Toast reference work | Located the prior task through README → contributor guide, completed the remaining stories for both components, expanded public API/usage/adaptation/extension guidance, and retained sidebar and MCP deferrals. | Parent baseline: 1 passed, 4 failed. Agent after edits: 5 passed, plus an additional initial-render assertion. Parent inspected both story files and both documentation changes; source, tests, manifests, and entry guide remained unchanged. |

The returning task did not stop at the already-completed Upload Idle checkpoint. It added Uploading and ErrorRetry plus informational and success Toast examples. The guidance explains caller-owned request state, the simulated retry, actual public exports, and the next story contribution. It explicitly distinguishes rendered markup from interaction, keyboard, focus, and assistive-technology checks.

The task record retains its original “Remaining” list above a dated completion section. The completion section explains delivery and next use, but that stale label could confuse later readers. No second continuation trial was performed against the newly generated handoff. This trial establishes that one fresh agent recovered and applied seeded existing decisions; it does not establish the discoverability or human usability of every new handoff it wrote.

## Structural and distribution verification

The skill validator, local Markdown links and heading targets, UI invocation metadata, and changed-file whitespace checks pass. Previously shipped scripts and technical references remain byte-identical to this pass's baseline. The evaluated operating instructions match the packaged source. The updated ZIP excludes raw research notes, evaluation fixtures, and DS Loop source files; both installed hosts resolve to matching skill files. The local packaging receipt records hashes and archive entries.

## Limits

- These are three bounded tasks, not a comparison against the prior skill, a reliability rate, or evidence of universal superiority.
- The fixtures are synthetic. Their Node checks use React/ReactDOM 19.2.0 server rendering; there was no new real Storybook build, browser interaction check, or live MCP query.
- The returned retry simulation was inspected and initially rendered, but its click transition was not executed. Described future checks remain unrun.
- No human usability study or fresh desktop-host skill-discovery test was performed. Agent continuation is a different kind of evidence.
- No client/product repository, DS Loop implementation, release, deployment, or external communication was changed to demonstrate the approach.

Earlier technical integration and guidance evidence remains in the [September 18 record](evaluation-2026-09-18.md) and [September 21 guidance record](evaluation-2026-09-21.md).
