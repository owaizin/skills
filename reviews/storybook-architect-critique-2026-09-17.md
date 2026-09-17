**Storybook Architect — critical review, 17 September 2026**

**Verdict: do not ship its CI gates in their current form.** The skill has useful maintenance instincts, but its confidence exceeds the reliability of its measurements. It promotes weak proxies into facts, facts into policy, and policy into automation without demonstrating that those steps preserve design-system quality. The resulting failure mode is predictable: false failures inconvenience contributors while false passes reassure maintainers.

Reviewed the complete package at `/Users/owais/Documents/GitHub/skills/storybook-architect`: SKILL.md, all five reference documents, and all four scripts. The installed `.claude` copy was identical; `.codex` links to that copy. Ran the bundled test suite successfully, then ran 15 independent disposable fixtures. The fixtures demonstrated the failures recorded in [the accompanying evidence JSON](/Users/owais/Documents/GitHub/skills/reviews/storybook-architect-evidence-2026-09-17.json). No skill implementation files were edited. This was script-level verification and documentation research; generated MDX and example stories were not compiled in a live Storybook installation.

The critical lenses are grounded in Brad Frost, Dan Mall, Nathan Curtis, and Storybook's published work. The judgments below are this review's conclusions, not attributed opinions from those people.

**1. The objective needs to begin with useful, trustworthy product decisions.**

A design system should help people deliver coherent, accessible products with less repeated work. A maintenance skill should preserve consumers' ability to find a supported solution, understand its limits, use it correctly, and upgrade safely. Storybook can provide executable evidence for those decisions.

The skill instead centers the absence of source-code symptoms. Its four headline metrics cannot tell a consumer whether a dialog restores focus, whether a layout survives translated content, whether a published example matches the installed package, or whether a deprecated component has a workable migration.

The limited maintenance scope is legitimate. A maintenance tool does not need to choose brand colors. However, that scope still requires a definition of what a trustworthy component contract contains. Preserving a system requires knowing what properties must be preserved.

Calling Storybook the system of record also needs an authority model: token definitions own token values; component source and types own implemented APIs; stories demonstrate selected behavior; documentation carries guidance; release records identify what consumers can install. Specify conflict resolution and version alignment among those artifacts. A Storybook build can be perfectly current with an unreleased branch and still mislead a consumer on last month's package.

Dan Mall frames system success around organizational efficiency, consistency, and burden, and questions treating adoption as the goal. That makes the skill's lack of consumer outcomes consequential. [Source](https://v5.danmall.com/posts/in-search-of-a-better-design-system-metric-than-adoption/)

**2. “Every rule must become a script, a tag, or a CI gate” is a category error.**

Location: [SKILL.md:15](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:15).

Some requirements are deterministic: a documented prop exists, a token reference resolves, a supported story renders. Some are candidates for investigation: two components have similar names. Others require judgment: whether a component expresses the right abstraction, whether a contribution belongs in the shared core, or whether a pattern fits a task.

A tag can record a decision; it cannot prove the decision was correct. A status of `ready` does not establish readiness. A script cannot make an ambiguous semantic question objective merely by returning an exit code.

The cited survey's prevalence figures support investigating validation loops. They do not establish that all guidance should become enforcement or that a particular heuristic produces useful failures. The study documents public affordances and explicitly limits what its observations establish. The skill extrapolates from agent tooling to human governance without evaluating contributor cost or outcomes. [Study methodology](https://state-of-ai-in-design-systems.netlify.app/methodology)

Replacement principle: automate verifiable invariants; report uncertain signals with evidence and confidence; record judgment with rationale and ownership. Keep exemptions explicit, reviewable, and scoped.

**3. The audit can delete the source it is auditing. Priority: P1.**

Location: [audit.mjs:217](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/audit.mjs:217).

The script recursively removes the user-supplied output directory without checking its relationship to the input or whether it is a directory owned by the generator. In a disposable fixture, `--root src --out src` exited successfully, deleted `Button.tsx`, and replaced the directory with reports. An ancestor output path is also dangerous by inspection.

This is a release blocker for an agent-facing tool. Resolve canonical paths, reject input/output overlap and dangerous ancestors, identify generated directories with an ownership marker, and remove only artifacts the generator owns. Test these guards using temporary directories.

**4. The status validator does not implement Storybook's tag semantics. Priority: P1.**

Location: [validate-status.mjs:35](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/validate-status.mjs:35).

It collects all tag arrays in a file, flattens them, and strips `!`. Storybook applies tags at project, component, and story levels; the `!` prefix removes an inherited tag. Those operations are not equivalent. [Storybook tag semantics](https://storybook.js.org/docs/writing-stories/tags)

Demonstrated failures:

- The reference's own `ready` meta plus `['!ready', 'experimental']` story fails with three statuses: `ready, ready, experimental`.
- The main skill's workshop example `['!autodocs', '!manifest']` is treated as a contract and rejected for having no status.
- A legitimate `team-checkout` custom tag is rejected as an invalid status.
- A deprecated component with the comment `use caution` passes the replacement check. The case-insensitive regex accepts generic prose as a component reference.

Additionally, the validator reads no previous state. The claim that it rejects illegal transitions is unimplemented. It does not verify the required `!manifest` on deprecated components either.

Use resolved per-story metadata, a configurable status namespace, and structured deprecation data with an actual target. A transition rule needs an explicit previous version and stable component identity. If those inputs do not exist, report that transition validation is unavailable.

**5. The four metrics are not valid as currently named. Priority: P1.**

Locations: [audit.mjs:185](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/audit.mjs:185) and [metrics.md:9](/Users/owais/Documents/GitHub/skills/storybook-architect/references/metrics.md:9).

| Claimed measure | Actual implementation | Consequence |
| --- | --- | --- |
| Token adoption | Percentage of candidate component files without selected literal matches | It measures neither styled declarations nor semantic-token usage. |
| Story coverage | Global filename/export-name matching over a partial component inventory | Unrelated components with the same name can share one story's credit. |
| Duplicate clusters | Number of matching pairs | A cluster of four components can yield six reported “clusters.” |
| Stale stories | Filesystem modification times and basename matching | A timestamp change can manufacture decay without changing source. |

Reproductions: a component importing CSS containing raw color and spacing gets **100% token adoption**, even while the same report lists the CSS violations. Two distinct `Button` files with one story get **100% coverage**. Ordinary Vue and Svelte components with no stories get **100% coverage** because their implicit component exports do not enter the regex-derived denominator.

The duplicate comparator divides shared prop names by the smaller prop set. A tiny API that is a subset of a large API gets 100% overlap, regardless of the larger API's extra responsibilities. It does not compare prop types or behavior. The main document mentions 80%, while the implementation and metrics reference use 60%.

Rename the current outputs as heuristic signals, define denominators, resolve actual module identities, and report unsupported or empty inventories as unknown. A zero denominator should not automatically become a perfect score.

**6. File age is not evidence of story decay. Priority: P1 for CI.**

Location: [audit.mjs:165](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/audit.mjs:165).

The fixture changed only the component's filesystem timestamp and moved stale-story count from zero to one. Source contents were identical. A fresh checkout records checkout activity, not authoring history; having Git history available does not repair filesystem modification times.

More fundamentally, even accurate commit dates would not prove mismatch. A performance refactor may preserve the story contract. A newly edited story may remain wrong. The present rule rewards touching files and punishes implementation changes that preserve behavior.

Remove this gate. Use story execution, type checking, intentional visual review, and API/behavior changes as evidence. Change history can prioritize review, but should not automatically classify a story as stale.

**7. The gates fail open and do not enforce “no new violations.” Priority: P1.**

Location: [audit.mjs:199](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/audit.mjs:199).

The reproduced behavior is:

- Missing baseline: create one from the current candidate and pass.
- Misspelled gate: write `undefined` as the reported metric and pass.
- Missing source directory: scan nothing, initialize zero, and pass.
- Remove one existing raw-value violation and introduce another elsewhere: unchanged total, so pass.

A count ceiling can be a valid policy, but it cannot be described as preventing new violations. Separate an explicit baseline initialization command from read-only CI checks. Validate roots, metric names, baseline schema, and scan completeness. Compare stable violation identities against an approved baseline when the policy is “no new violations.”

The four-metric ratchet is also literally reversed for half its metrics: [metrics.md:23](/Users/owais/Documents/GitHub/skills/storybook-architect/references/metrics.md:23) says none may increase. That forbids improving token adoption and story coverage while allowing them to decline. The generic gate likewise treats all increases as failure. Metric direction must be explicit.

**8. The framework detector still guesses. Priority: P2.**

Location: [detect.mjs:13](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/detect.mjs:13).

In one fixture, a package.json with a declared dependency but no installation produced `storybookInstalled: true` and manifest support. In another, config selected `@storybook/nextjs-vite`, but the detector returned `@storybook/react` because it was first in dependency insertion order. It did warn about multiple candidates, but still supplied a supposed import path without reading the config.

Manifest availability is reduced to major version >=10. Official support is framework-dependent, and the AI APIs are in preview. Addon dependencies are also treated as support evidence without verifying active config. [Storybook framework support](https://storybook.js.org/docs/ai/mcp/overview)

Separate declared, resolved, configured, and verified facts. Resolve packages from the relevant workspace, inspect the actual Storybook configuration, and preserve unknown states. Prefer Storybook's own detected project instructions when supported. The generated audit MDX also hardcodes a docs-block import independently of detection, so the claimed version-aware pipeline is not end-to-end.

**9. Banning page stories removes a crucial validation surface.**

Location: [SKILL.md:159](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:159).

Brad Frost treats pages containing representative content as a way to test whether the parts work together. Storybook explicitly supports both presentational pages and connected pages with controlled dependencies. The blanket prohibition conflicts with both sources. [Frost's Atomic Design methodology](https://atomicdesign.bradfrost.com/chapter-2/), [Storybook's page guidance](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook)

In isolation, a field, error message, button, and dialog may all look correct. Their composition can still fail on long content, focus order, error recovery, layering, or constrained space. Removing compositions hides those failures.

A shared component catalog may reasonably keep product screens in a separate Storybook or navigation area. That is an ownership and information-architecture decision. Establish controlled providers, network fixtures, and representative scenarios instead of treating all page context as contamination. Similarly, a fixed three-level taxonomy needs a demonstrated discovery benefit before it becomes policy.

**10. Token guidance confuses semantic intent with universal aliasing.**

Locations: [SKILL.md:50](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:50) and [token-architecture.md:13](/Users/owais/Documents/GitHub/skills/storybook-architect/references/token-architecture.md:13).

“Each hit is a token that doesn't exist yet” is unjustified. A literal may already have a suitable token, be an implementation constant, represent asset geometry, or require a documented exception. Minting a token per hit converts scattered constants into a centralized collection of scattered constants.

Semantic color roles are valuable. That does not prove every spacing, radius, or duration value requires a purpose-specific alias. Atlassian itself exposes direct spacing-scale consumption, including `space.200`. Use the project's intended public token interface; specify semantic requirements by category and theming need. [Atlassian token usage](https://atlassian.design/foundations/tokens/use-tokens-in-code)

The prose also says three layers by default while making the component layer opt-in. Say precisely which layers exist and which are required for a given category. Establish theme/mode behavior, aliases, fallback semantics, and migration compatibility before proposing a naming grammar.

The scanner compounds the conceptual issue: 2–9px values are missed by its two-to-four-digit regex, numeric JSX styles and .ts styling modules fall outside its advertised detection, and any matching `theme` or `token` path can suppress findings. It scans source text rather than styling semantics. Those limitations are acceptable for discovery if they are explicit; they are poor foundations for universal CI enforcement.

**11. The naming-drift rule erases potentially useful distinctions.**

Location: [audit.mjs:179](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/audit.mjs:179).

`primary`, `brand`, and `accent` can describe different axes: action priority, identity, and emphasis. `danger` can describe destructive intent while `error` describes validation feedback. Their coexistence is not evidence that one concept has competing names.

The script reports no semantic mapping and searches broadly through source text. “Never silently choose a winner” is good advice, but the report has already assumed that a contest exists. Report vocabulary observations, then establish scope, role, context, and actual duplication before recommending consolidation.

**12. Story inclusion and promotion into a shared library are different decisions.**

Locations: [SKILL.md:183](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:183) and [component-lifecycle.md:60](/Users/owais/Documents/GitHub/skills/storybook-architect/references/component-lifecycle.md:60).

A one-off screen may need a story because its failure risk is high. A widely used layout primitive may need documentation precisely because every product depends on it. “No real props” is not evidence that a layout wrapper has no contract: responsive behavior, spacing, width, and nesting rules are consumer commitments.

Import counts are also an unreliable proxy for use. This implementation includes stories and tests, merges unrelated same-name imports, misses consumers outside the scanned root, and exposes `usedIn` only for uncovered components. Its own fixture counts two repeated import statements from one file as two uses. “Used in two places” has not been established.

Decide separately: does this need a reproducible scenario, does it need consumer documentation, and does it deserve shared-library ownership? Use risk, product demand, semantic stability, accessibility, and maintenance capacity alongside reuse evidence.

**13. Workshop versus contract is a useful distinction implemented as a false binary.**

Location: [component-lifecycle.md:47](/Users/owais/Documents/GitHub/skills/storybook-architect/references/component-lifecycle.md:47).

A workshop story can become an important regression fixture. An experimental component can have a well-documented contract with limited support. A ready component can contain a newly experimental variant. Maturity, audience, testing, support, and discoverability are related but separate concerns.

The suggested workshop tags remove autodocs and manifest inclusion, but leave Storybook's implicit `test` tag intact. “Cheap, disposable, nobody's contract” therefore does not mean excluded from CI. Explicitly choose test inclusion and define promotion and retirement criteria. Avoid automatic deletion merely because a story began as a harness. [Storybook built-in tags](https://storybook.js.org/docs/writing-stories/tags)

Hiding all work in progress may also hide the very work collaborators should discover before building duplicates. Curate visibility for the audience and workflow.

**14. The quality contract is too thin to justify “ready.”**

Locations: [component-lifecycle.md:32](/Users/owais/Documents/GitHub/skills/storybook-architect/references/component-lifecycle.md:32) and [SKILL.md:193](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:193).

The skill gives no sufficient acceptance criteria for semantics, keyboard operation, focus management, content extremes, localization, responsive constraints, theme behavior, forced colors, or reduced motion. Automated accessibility checks are useful evidence, but cannot by themselves establish complete accessibility. Storybook's own testing guidance distinguishes multiple kinds of verification. [Storybook testing](https://storybook.js.org/docs/writing-tests)

“No play functions on presentational components” is too categorical. A component with no application state can still have a meaningful accessible-name, native keyboard, disabled-state, or event-forwarding contract. Tests should follow observable obligations and failure risk, with unnecessary implementation-mirroring tests omitted.

Likewise, “unnecessary at five components” is an invented threshold for visual regression. Five heavily reused primitives can warrant it immediately. Require representative visual baselines when risk and maintenance economics justify them, independent of catalog size. Define who approves intentional visual change and how flaky evidence is handled.

**15. Governance cannot be reduced to three lines and a status enum.**

Location: [component-lifecycle.md:105](/Users/owais/Documents/GitHub/skills/storybook-architect/references/component-lifecycle.md:105).

Short documentation is desirable. Missing decisions are costly. A new shared data grid, a typo correction, a token adjustment, and a breaking API change need different levels of review and support. Nathan Curtis explicitly discusses varying contribution workflows by type and scale. [Defining design-system contributions](https://eightshapes.com/articles/defining-contributions/)

At minimum, define the accountable owner, release authority, acceptance evidence, exception process, migration responsibility, and consumer support path. Link these decisions from the places contributors actually use. AGENTS.md is useful for agents but is not automatically the right primary interface for designers or product teams.

A deprecation can also legitimately have no direct successor. Support a structured retirement rationale and migration guidance rather than forcing a fictional replacement. A lifecycle needs retirement and consumer-upgrade completion, not just an eternally deprecated entry.

**16. Agent-readable documentation is a strong idea with an incomplete verification loop.**

Location: [agent-readable-docs.md:7](/Users/owais/Documents/GitHub/skills/storybook-architect/references/agent-readable-docs.md:7).

Using native manifests and shared source artifacts is one of the strongest parts of the skill. Current Storybook docs support this approach. However, installation and config snippets do not establish that the intended component contract reached the agent. [Storybook AI setup](https://storybook.js.org/docs/ai)

Add an end-to-end acceptance check: start/build the supported project, fetch the manifest, locate a known component, verify a real prop and description, verify intended exclusions, and execute a representative test. Check revision and package compatibility where published artifacts are involved.

Excluding a deprecated example from recommendation is sensible, but migration agents still need an accessible record of the old API and its replacement or retirement guidance. Manifest exclusion affects retrieval; saying agents are “trained on” these pages misdescribes the mechanism.

The static fallback section also names a published static reference without a dev server as a reason manifests might be unavailable, although the same file and official documentation say manifests exist in built Storybooks. Missing live MCP and missing static manifests are separate situations. [Manifest documentation](https://storybook.js.org/docs/ai/manifests)

**17. The skill needs a reliable installation and execution contract.**

Location: [SKILL.md:22](/Users/owais/Documents/GitHub/skills/storybook-architect/SKILL.md:22).

`node scripts/detect.mjs` is relative to the shell's working directory. The script belongs to an installed skill, while its default scan target is the current project. Running in the project may not find the script; running inside the skill may scan the skill itself. CI examples assume those scripts have been copied into the application, but no installation/versioning step is specified.

Define an absolute skill script location, explicit project root, explicit output path, supported frameworks, and how CI receives a pinned version of the tools. Distinguish audit-only, implementation, and enforcement setup requests. Broad triggers such as “messy components” should not silently impose Storybook on projects that use another documentation strategy.

**18. The tests validate selected assumptions, not the package's promises.**

Location: [test-scripts.mjs:14](/Users/owais/Documents/GitHub/skills/storybook-architect/scripts/test-scripts.mjs:14).

The suite passes. That result must be interpreted narrowly. Some fixtures are source fragments rather than complete compilable stories. The suite endorses the timestamp heuristic and duplicate-import counting, while omitting documented tag inheritance, output safety, missing inputs, unknown gates, framework differences, and false-positive cases. It never tests the detector or compiles generated MDX.

Add behavior-level fixtures for the documented examples, one supported real Storybook integration, and negative controls. Measure false-positive and false-negative behavior against a curated sample before making heuristics blocking. Keep the version/API claims within the verified support matrix.

**What should survive the rewrite**

- Inspect the actual project before emitting framework-specific code.
- Respect existing token conventions unless there is evidence they are failing.
- Preserve the separation between an audit request and permission to rewrite components.
- Generate disposable reports and keep them out of inappropriate agent retrieval.
- Explain component intent and use generated documentation from shared sources.
- Make decisions owned, exceptions visible, and reliable checks repeatable.

**Repair order**

1. Stop recommending the current scripts as blocking CI policy. Fix recursive deletion, invalid-input handling, baseline initialization, and tag semantics first.
2. Remove the timestamp gate; correct metric direction and names; expose unknown/unsupported scan states. Use precise module identities and violation records.
3. Reframe the objective around trustworthy consumer contracts. Separate deterministic checks, review candidates, and human decisions.
4. Replace the page-story ban, universal token layering, rigid story binary, and reuse-only inclusion language with contextual decisions.
5. Define readiness evidence, release/version alignment, contribution paths, and migration ownership at a scale appropriate to the project.
6. Verify the complete path on a supported real project: detection, stories, generated docs, tests, manifests, and deliberate failures. Publish the limitations alongside the results.

**The standard to hold this skill to:** can a team rely on its findings to make better decisions, and do its gates reject the right changes for defensible reasons? At present, the evidence does not support that trust.
