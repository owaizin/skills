# Evaluation and scope — 18 September 2026

This revision makes documentation and component use the main workflow. Brilliance keeps its maintained Product System audit, registry, and readiness checks. The bundled scanner is optional for projects without suitable tooling; the status classifier is retired from recommended use. Neither scanner accuracy nor overall design-system readiness is claimed.

## Provenance

- Skill base: `195ee719915c4a8f5bbc6a2f5ff437beb328c65d`, plus this revision's working-tree changes.
- Evaluated report generator SHA-256: `61e440c7ae5403c839e32d381bf4d6c6fbfb084f055c12f20ae4c54e2758d5c2`.
- Brilliance base: `25921b9222d9a22199168bdc55ac048398290597`. The checkout had existing changes; a disposable copy of `apps/product-system` used that working tree, not a clean-commit claim.
- Runtime: Node 22.17.1, Storybook 10.6.0, `@storybook/react-vite`, Vite 6.4.3. Installed dependencies and workspace source were reused; output and Vite cache were isolated.
- Six reports were generated from a tiny fixture. This checks integration, not scanning accuracy on Brilliance's component library.

## Reproduced in this revision

| Check | Observed result |
|---|---|
| Environment detection | Installed Storybook 10.6.0 and `@storybook/react-vite` identified; actual configuration inspected. |
| Static build | Successful; Vite reported 14.01s. Used the installed Storybook binary directly. |
| Resolved report entries | All six are `type: docs`, tagged `dev`, `sb-architect-audit`, and `unattached-mdx`; none retains `audit`, `manifest`, `autodocs`, or `test`. |
| Project tag preservation | All 16 source-backed generic `audit` entries in the comparison build retain their IDs and generic tag. The earlier report's count of 24 is not reproduced by this current snapshot. |
| Sidebar in Chromium | System health remains visible; generated Audit pages are hidden by default. Clearing the namespaced exclusion reveals them while preserving System health. |
| Report rendering | All six generated MDX pages load and display their expected content in the built Storybook. |
| Component manifest | Five component entries. EvidenceMatrix includes its description, `records` prop documentation, and JSDoc import guidance, checked against source. |
| Docs manifest | Included `Evaluation/Manifest control` is present; all six excluded report entries are absent. Both manifests were inspected. |
| Existing component smoke check | EvidenceMatrix's populated story renders; selecting its Easy/Single-answer MCQ cell reveals “Practice this group,” which can be clicked. This does not assert callback payload or replace its existing interaction tests. |
| Script fixtures | Pass, including all six report tags, missing-baseline exit 2 without creating a file, unsupported gate names, ratio gates, and missing-root exit 2, and increased-count exit 1. |
| Real-repository regression fixtures | `command-palette.tsx` is scanned, `[2px]` and `[3px]` are counted, ordinary CSS is counted, and token CSS remains excluded. |
| Source preservation | Brilliance's git status and hashes of main config, preview, and registry match the pre-evaluation snapshot. No source/config changes were made there. |

The first build attempt through `pnpm exec` failed because the locally selected pnpm binary could not execute. Calling the installed Storybook binary resolved that environment issue. The first copied workspace lacked its inherited TypeScript config; adding the source config to the isolated workspace resolved that setup error. Neither was a defect in the skill. Browser assertions were adjusted to the filter's accessible checkbox and the sidebar group's actual label before the final successful run.

## Corrections to previous conclusions

- **An implicit `test` tag does not establish test execution.** Brilliance's broad Playwright index sweep selects `type === "story"`; generated MDX entries have type `docs`. The reports now explicitly carry `!test` to state their intended exclusion. This does not substantiate the earlier claim that they had been running in Brilliance's suite.
- **Manual addon mode does not establish missing accessibility coverage.** The preview explains that manual audits avoid racing its Playwright axe runner; the tests actually invoke AxeBuilder. Runner behavior must be checked before changing addon settings.
- **Absence from the component manifest does not prove docs exclusion.** This revision checks `docs.json` with an included MDX control.
- **A working parser should not be replaced on reputation.** The existing `react-docgen` parser produced the documented descriptions, props, and import tags in this build.

## Earlier observations supplied in the conversation

The preceding evaluation reported 48 component files and 148 exported components in `packages/ui`; literal matches rising from 57 to 101 across 9 to 18 files after matcher repairs; and seven useful comparisons among eight flagged duplicate pairs. Those historical counts were not rerun here. They are a bounded sample, not a corpus-wide precision or recall estimate. The implementation and fixtures support the reported path-matching and small-pixel failure mechanisms.

The earlier comparison found Brilliance's own audit more useful for this project. The resulting decision is to reuse that maintained pipeline, not keep a second scanner in its normal workflow. No scanner installation or CI integration was added to Brilliance in this revision.

## Human and agent usage acceptance scenarios

These are expected behavior and review criteria, not a claim of completed live-host usability testing. The instructions and metadata were checked for consistency; the Codex skill validator checks structure, not model behavior.

| Request | Expected experience |
|---|---|
| `$storybook-architect` in Codex, or `/storybook-architect` in Claude Code | A short introduction and useful read-only orientation in the current project. No mandatory flags, questionnaire, broad scan, or installation. |
| “Document loading and errors for this search field” | Find its owner and existing story conventions, make the requested change, and verify it. No unrelated system-wide audit. |
| “Review our Storybook” in Brilliance | Use existing Product System evidence; explain prioritized consumer impact without running the redundant bundled scanner. |
| “Help agents stop inventing props” | Inspect current manifests and source; use the existing MCP connection where available, and distinguish static-build checks from live retrieval. |
| No Storybook found, or ownership genuinely ambiguous | Explain the discovered state and ask only the focused question needed to proceed. No silent framework choice or unsolicited installation. |
| A source scanner flags an inline value | Present a candidate with source context. Do not call it a policy violation or mint a token without establishing meaning. |
| “Fix the issues you confirmed” after an authorized review | Implement the agreed scope and verify it without asking again for routine permission. |

User-facing results explain what happens, why it matters, and the next action, with evidence. “Confirmed,” “Needs review,” and “Not checked” make uncertainty legible. Technical logs and raw JSON stay secondary.

## Not established

- A curated multi-repository false-positive/false-negative rate for the scanner.
- Correctness of the retired status classifier; it remains unrepaired and unsupported for decisions.
- Live MCP tool retrieval or the full Brilliance browser/a11y suite. Only the bounded checks above ran.
- Cross-version or cross-framework MDX compatibility; its docs-block import still targets Storybook 10.6.
- Published-package alignment, accessibility completeness, production readiness, or fresh-session invocation behavior in both hosts.

## Repeat the bounded integration check

1. Copy Product System to a disposable workspace that retains its dependency, package, sibling-app, and TypeScript configuration resolution. Put caches and build output there. Do not run its audit-generation command against the original source tree.
2. Generate reports from a small fixture with this skill. Merge their MDX glob and the `sb-architect-audit` default exclusion into the copied config. Add an included MDX control tagged `manifest`.
3. Run the installed Storybook build. Inspect `index.json`, both manifests, a known real prop, and all existing project `audit` entries.
4. Serve the build; check default sidebar visibility, remove the report exclusion, render every report, and exercise a representative existing component.
5. Run `node storybook-architect/scripts/test-scripts.mjs` from the skills repository. Validate the skill and its relative links; compare installed files and the distribution archive against the source.

Documentation sources: [Storybook tags](https://storybook.js.org/docs/writing-stories/tags), [manifests](https://storybook.js.org/docs/ai/manifests), [MCP](https://storybook.js.org/docs/ai/mcp/overview), and [Claude Code skill invocation](https://code.claude.com/docs/en/skills). Runtime observations above take precedence over configuration-only assumptions.
