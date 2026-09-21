# Guidance update evaluation — 21 September 2026

This update implements the reviewed merge plan while preserving plain-language invocation, read-only orientation, existing project tooling, and narrow task scope. It does not change the scanner or status classifier.

## Method and provenance

Source repository base: `1b554b582f12ce6aacbc32cde3ed4d5519dec8a6`, plus this update. Four independent Codex collaboration task executions used isolated fixtures: a manifest review, a novice usage/accessibility question, a one-story fix, and a fresh manifest recheck. Reviewers received the candidate skill, their request, and raw fixture files, without prior conversation, expected answers, or sibling fixtures. They inherited the parent model with no explicit override; an exact provider model identifier was not exposed.

Eight planned acceptance scenarios were represented across three prompts, with manifest cases repeated in the fourth execution. This is a bounded forward check, not eight independent trials or a reliability estimate. The manifest schema is a reduced fixture, not validation of Storybook's complete schema. The story fixture uses Node 22.17.1 and React/ReactDOM 19.2.0 server rendering.

Raw fixtures, candidate/input hashes, requests, observations, reported test output, and packaging receipts are retained in local maintainer records, excluded from the public repository and distribution. This document is a summary of those observations; the raw record is not publicly reproducible from this package.

## Observed behavior

| Scenario | Observation |
|---|---|
| Legitimate zero-prop component | Both manifest reviewers accepted Mark's empty prop map and reported the scoped match. |
| Expected metadata missing | Both identified SaveButton's documented callback absent from the manifest. The first prematurely called this extraction failure; the recheck explicitly left the pipeline cause unverified. See the limitation below. |
| Reference-based payload | Both resolved Caption's separate payload before comparing its documented required prop. |
| Static snapshot without a live endpoint | Both used supplied manifests and explicitly withheld live retrieval/build claims. |
| Playwright axe suite alongside manual addon mode | The consumer reviewer identified the automated test, without recommending another addon or claiming it passed or ran in CI. |
| Sparse, valuable stories | The story reviewer preserved the default and long-label examples, along with the component source. Parent hash comparison confirmed only the requested story file changed. |
| Novice usage question | The answer supplied a complete pending/done example, import, required inputs, visible-label guidance, and relevant announcement constraints. |
| Fix only one story | Only `Disabled.args.disabled` changed. The existing `npm test` command passed three server-rendered output checks; no Storybook startup, package installation, broad audit, or review page was introduced. |
| Source documentation gap | Both manifest reviewers identified Stage's missing semantics in source rather than diagnosing extraction loss or inventing an enum. |

The first manifest response shows that the skill does not eliminate diagnostic overstatement. After that response, the agent-readable reference was sharpened to distinguish an observed mismatch from its cause. The fresh recheck met that distinction, but reported reading only `SKILL.md`, not the sharpened reference. Do not attribute the improved answer to that edit or treat it as a deterministic repair.

The story reviewer ran the tests once after its edit; no pre-edit failing run was observed. The checks cover rendered HTML, not keyboard behavior, interaction execution, or a real Storybook build.

## Structural and distribution checks

- Skill frontmatter validated with the skill-creator validator; UI metadata and implicit invocation policy retained.
- Relative Markdown links and target headings checked; changed text checked for whitespace errors.
- Scripts unchanged from the base revision; their fixture suite was not rerun for this documentation-only update.
- Distribution rebuilt from intended skill contents, excluding raw research notes and review fixtures. Archive entries and installed files compared byte-for-byte with source; results are retained in a local packaging receipt.
- The Codex installation resolves to the shared Claude Code skill directory. This checks installed bytes, not whether an already-open session reloads them.

## Not established

- Fresh-session invocation or skill discovery in both desktop hosts. The earlier [invocation scenarios](evaluation-2026-09-18.md#human-and-agent-usage-acceptance-scenarios) remain relevant and are not newly claimed as executed.
- Live MCP list/detail retrieval, a reference-format Storybook build, or CLI Vitest execution. Their distinctions were checked against current official documentation during review. The executed no-server fixture used Node tests instead.
- New token-theme behavior, alternative-pointer effectiveness, scanner accuracy, accessibility completeness, or production readiness.
- Independent verification of webinar recordings, benchmark methodology, or numerical success claims. Those claims were omitted from operating instructions.
