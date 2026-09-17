---
name: storybook-architect
description: Maintenance helper for a Storybook-based component library. Surveys a codebase for review candidates (literal values, likely duplicate components, components without stories), proposes token and lifecycle conventions that fit the project's existing ones, and exposes the system to AI agents through Storybook's official manifests and MCP server. Its scans are discovery signals for humans to judge, not quality verdicts. Use when the user wants a Storybook health check, describes messy or undocumented components, asks how to organize design tokens, asks whether something should get a story, wants component status or deprecation conventions, or wants agents to stop hallucinating component props — even if they never say "Storybook".
---

# Storybook Architect

Scope: **maintenance of a component library's documentation and conventions.** Not visual design, not Figma, not brand decisions.

## What this skill can and cannot tell you

It reads source text. It can find literal colour values, components with no story file, names and prop shapes that look alike, and file timestamps.

It cannot tell you whether a dialog restores focus when dismissed, whether a layout survives translated content, whether a published example matches the installed package, or whether a deprecated component has a workable migration. **Those are the obligations a design system actually owes its consumers.** Everything this skill measures is a proxy that may or may not correlate with them.

So the order of work is:

1. **Name the consumer obligation** — what must be true for someone to use this component safely.
2. **Identify what evidence would show it holds.**
3. **Decide which of that evidence can be checked reliably.**
4. **Automate only that**, and report the rest as signals with their limitations attached.

Skipping to step 4 — picking an observable proxy, assuming it represents quality, and enforcing it — produces gates that fail the right changes for the wrong reasons. Automate verifiable invariants. Report uncertain signals with evidence and confidence. Record judgment with rationale and an owner.

Validation loops are worth building where the invariant is real: they are the most common technique across surveyed systems (31 of 165 techniques, in 21 of 21), because a check "keeps working after the model stops reading the instructions" ([source](https://state-of-ai-in-design-systems.netlify.app/questions/validation-loops.md)). That is an argument for automating what can be checked — not for converting every guideline into an exit code.

## Step 0 — Detect before you generate

```bash
node <skill-dir>/scripts/detect.mjs <project-dir>
```

Reports Storybook major version, framework package, config paths, installed addons. **Storybook API names moved across majors** (`@storybook/react` → `@storybook/react-vite`, `@storybook/test` → `storybook/test`), so never emit an import you have not verified. Treat its output as *declared* facts from package.json — confirm against the actual config before relying on it.

| State | Go to |
|---|---|
| Components exist, never surveyed | Phase 1 |
| Storybook exists but is distrusted | Phase 1, scoped to what people distrust |
| Greenfield | Phase 2 |
| Conventions agreed, just write a story | Phase 2 § Writing stories |
| "Should X get a story?" / day-2 call | Phase 3 |
| Agents hallucinate props | Phase 3 § Agent-readable |

---

## Phase 1 — Survey

```bash
node <skill-dir>/scripts/audit.mjs --root src --out ../audit-report
```

`--out` must sit outside `--root`: the report directory is deleted and rewritten on every run. It writes `findings.json` plus one MDX page per category.

What it reports, and what each is worth:

| Signal | Method | Trust it for |
|---|---|---|
| Literal value matches | regex over source text | finding review candidates; **not** a token-compliance number |
| Components without stories | files this scanner can parse a component export from | a gap list; the denominator excludes Vue/Svelte SFCs and anything it cannot parse |
| Candidate duplicate pairs | name similarity + shared prop *names* | starting an investigation; it compares neither types nor behaviour |
| Stories older than component | file mtime | prioritising review; mtime is checkout time on a fresh clone |

A literal value is **not** automatically a missing token. It may already have a token, be an implementation constant, be asset geometry, or deserve a documented exception. Minting a token per hit converts scattered constants into a centralised collection of scattered constants.

Similarly, competing vocabulary (`primary` / `brand` / `accent`) is an observation, not a proven conflict — those can name different axes: action priority, identity, emphasis. Report what you found; establish scope and role before proposing consolidation, and never pick a winner silently.

### Keeping the report from becoming the mess

- **Generated only.** Regenerated from scratch each run, so a resolved finding disappears with no cleanup ritual. Never hand-edit.
- **Quarantined.** Pages carry `tags={['audit', '!manifest', '!autodocs']}`. `manifest` is applied by default; `!manifest` removes the page from the agent-facing manifest, per [Storybook's guidance](https://storybook.js.org/docs/ai/best-practices) on excluding anti-pattern and deprecated examples from retrieval.
- **Hidden by default** via `tags: { audit: { defaultFilterSelection: 'exclude' } }` in `main.ts`.

Report the numbers with their method attached, then stop. The survey's job is visibility, not permission to rewrite components.

---

## Phase 2 — Decide

### Tokens

Read `references/token-architecture.md`. Two things override everything in it:

1. **Conform to the project's existing convention.** A Tailwind project's `text-md` is correct in that project.
2. **Semantic aliasing is required where meaning changes with theme or mode** — colour roles above all. It is not automatically required for every spacing, radius or duration value; Atlassian itself documents direct scale consumption (`token('space.200')`). Specify which categories need semantic naming and why.

### Writing stories

1. **One concept per story.** Storybook's AI guidance: a `SizesAndVariants` story "demonstrates too many concepts at once."
2. **Document the *why*** in JSDoc on the component and its props, and in each story's description. This text lands in the manifest agents read.
3. **Maturity, audience and test inclusion are separate decisions.** A harness story can become a valuable regression fixture; an experimental component can have a well-documented contract with limited support. Tag them independently rather than sorting every story into one of two buckets. Note that `!autodocs`/`!manifest` do **not** remove Storybook's implicit `test` tag — decide test inclusion explicitly.
4. **Isolate at the boundary; don't restructure the product** to satisfy a documentation tool:

```ts
// .storybook/preview.ts — module mocks register at project level only
import { sb } from 'storybook/test';
sb.mock(import('../src/lib/session.ts'));
```

5. **Composition stories earn their place.** A field, button and dialog can each be correct in isolation while their composition fails on long content, focus order, error recovery or layering. [Storybook supports pages with controlled dependencies](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook), and representative content is how you test that the parts work together. Give them controlled providers and fixtures; put them in a separate area or Storybook if ownership differs. Depth-3 taxonomy is a default worth keeping until discovery suffers, not a rule.
6. **CSF3, with the import path from Step 0.**

```ts
import type { Meta, StoryObj } from '@storybook/your-framework'; // ← from detect.mjs
const meta = { component: Button, tags: ['autodocs', 'ready'] } satisfies Meta<typeof Button>;
export default meta;
/** Default call-to-action. Use for the single primary action on a surface. */
export const Default: StoryObj<typeof meta> = { args: { variant: 'primary', children: 'Action' } };
```

---

## Phase 3 — Enforce what is actually checkable

### Status conventions

Status lives as a Storybook tag; taxonomy and transitions in `references/component-lifecycle.md`.

`scripts/validate-status.mjs` **lints** those tags and must not gate CI as written. Storybook resolves tags per story across project → meta → story with `!tag` removing an inherited tag; the script flattens a file instead, so it misreads the documented `['!ready','experimental']` override, treats a workshop meta as a contract, and rejects legitimate custom tags. Transition checking is unimplemented. Real enforcement needs resolved per-story metadata from Storybook's index, not a file regex.

### Gates

Only two signals are gateable, and only as count ceilings that must not rise:

```bash
node <skill-dir>/scripts/audit.mjs --root src --out ../audit-report --init-baseline   # once, reviewed, committed
node <skill-dir>/scripts/audit.mjs --root src --out ../audit-report --gate literalValueMatches
```

A count ceiling is **not** "no new violations": removing one violation and adding another elsewhere passes. If you need that guarantee, compare stable violation identities, or use a real lint rule — `stylelint-declaration-strict-value`, an ESLint rule, or a typed token vocabulary the compiler checks. Prefer those; they beat this scanner on every axis. Ratios are deliberately not gateable — gating one inverts the policy the moment it improves.

Do **not** gate on story age. mtime is checkout time on a fresh clone, a behaviour-preserving refactor lands in the list, and a freshly edited story can still be wrong.

### Accessibility

`@storybook/addon-a11y` with `parameters.a11y.test: 'error'` on documented components, `'todo'` while bringing one up, `'off'` only with a written reason. Automated axe checks are useful evidence and **not** a completeness claim: focus management, keyboard operation, content extremes, forced colors and reduced motion need deliberate verification. Blanket `'error'` everywhere produces noise on token swatches, the team disables it globally, and you end up with less accessibility than a scoped rule would have given.

### Agent-readable

Humans and agents read the same stories. Do not hand-roll `llms-*.txt` when Storybook generates manifests natively:

```ts
// .storybook/main.ts
features: { componentsManifest: true },
typescript: { reactDocgen: 'react-docgen-typescript' },
```

```bash
npx storybook add @storybook/addon-mcp
```

Manifests: `/manifests/components.json`, `/manifests/docs.json`. Then **verify end to end** — build or start Storybook, fetch the manifest, find a known component, confirm a real prop and its description are present, and confirm intended exclusions are absent. Config snippets do not prove the contract reached the agent. Details in `references/agent-readable-docs.md`.

### Ownership

Different contributions need different review: a typo fix, a token adjustment, a new shared data grid and a breaking API change are not one workflow ([Curtis on contribution models](https://eightshapes.com/articles/defining-contributions/)). Define at minimum: accountable owner, release authority, acceptance evidence, exception process, migration responsibility, consumer support path. Link them where contributors actually work — `AGENTS.md` serves agents, not necessarily designers.

---

## Reference files

- `references/token-architecture.md` — layers, Atlassian grammar with source, migration order, a11y tokens
- `references/component-lifecycle.md` — status taxonomy, inclusion vs promotion, addon thresholds
- `references/metrics.md` — what each signal measures, gate wiring, limitations
- `references/agent-readable-docs.md` — manifests, MCP, verification, static fallback
- `references/elite-patterns.md` — sourced patterns with URLs and verification dates

## Scripts

- `scripts/detect.mjs` — version/framework/paths. Run before emitting code.
- `scripts/audit.mjs` — survey signals; `--init-baseline` / `--gate` for count ceilings.
- `scripts/validate-status.mjs` — status lint. Not CI-ready; see its header.
- `scripts/test-scripts.mjs` — fixture checks. Run after editing either script.

## Known limitations

Carry these into any report produced from this skill:

- Scanning is regex over source text, not AST or computed styles. A project with its own AST-based tooling (TypeScript compiler API, Style Dictionary, a token pipeline) should use that instead — it will be strictly better.
- Metrics are unvalidated proxies. No false-positive/false-negative rate has been measured against a curated sample.
- `validate-status.mjs` does not implement Storybook's tag semantics.
- The full path — detection → stories → generated docs → manifest contents → deliberate failures — has not been verified end to end on a supported project.
- Nothing here checks release/version alignment: a Storybook build can be perfectly current with an unreleased branch and still mislead someone about last month's package.

Verified against Storybook 10.6 documentation, September 2026. Re-verify with `detect.mjs`.
