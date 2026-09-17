---
name: storybook-architect
description: Maintains a Storybook as a design system of record — measures decay with a re-runnable audit script, renders findings as disposable Storybook pages, enforces token/status/inclusion decisions as CI gates instead of prose, and exposes the whole system to AI agents through Storybook's official manifests and MCP server. Use when the user wants a Storybook audit or health check, describes messy/inconsistent/undocumented components, asks how to organize design tokens, asks whether something should get a story, wants component status or deprecation rules, wants to stop a component library from rotting, or wants agents to stop hallucinating component props — even if they never say "Storybook".
---

# Storybook Architect

Scope: **maintenance of the system of record.** Not visual design, not Figma, not picking brand colors. This skill keeps a component library from rotting, and makes its rules answerable from the system rather than from one senior dev's memory.

Operating principle, and the reason this skill is script-first:

> Validation loops are the most common technique across surveyed design systems — 31 of 165 techniques, present in 21 of 21 systems. "A validation loop is a check the agent is told to run: a lint rule, a type error, an audit script, a CI gate. It turns a guideline into a failure the model has to fix, which is the only category here that keeps working after the model stops reading the instructions."
> — *State of AI in Design Systems*, July 2026 · https://state-of-ai-in-design-systems.netlify.app/questions/validation-loops.md

So: **every rule in this skill must end as a script, a tag, or a CI gate.** A rule that exists only as prose in this file has already failed. If you find yourself writing guidance a human must remember, stop and write the check instead.

## Step 0 — Detect before you generate

Run this first, always. Never emit story or config code before you know these four things.

```bash
node scripts/detect.mjs          # prints version, framework pkg, renderer, config paths
```

It reports: Storybook major version, the correct framework import path, whether `.storybook/` exists, and whether the manifests/MCP features are available. **Storybook API names moved across majors** — `@storybook/react` → `@storybook/react-vite`, `@storybook/test` → `storybook/test`. Emitting an import you did not verify is the fastest way to lose the team's trust in everything else you say.

Then route:

| State | Go to |
|---|---|
| Components exist, never measured | Phase 1 |
| Storybook exists but is stale/distrusted | Phase 1, scoped to decay |
| Greenfield | Phase 2, skip the audit (nothing to measure yet) |
| Rules agreed, just write/fix a story | Phase 2 § Writing stories |
| "Should X get a story?" / "which addon?" / day-2 call | Phase 3 |
| Agents hallucinate props / reinvent components | Phase 3 § Agent-readable |

---

## Phase 1 — Measure

The audit is a script, not a reading of the codebase. Same input must give the same output next month, or you cannot show decay.

```bash
node scripts/audit.mjs --root src --out .storybook-audit
```

It writes `findings.json` (machine-readable, four metrics + per-finding detail) and one MDX page per finding category under `.storybook-audit/`. It detects:

1. **Hardcoded values** — raw hex, rgb/hsl literals, and px outside a tokens/theme file. Each hit is a token that doesn't exist yet.
2. **Duplicate components** — clustered by normalized name and prop-shape overlap. Two `Button`-ish components sharing 80% of props is a finding, not a coincidence.
3. **Story coverage** — component files with no story, and which are highest-traffic (import count) among them.
4. **Stale stories** — story file older than the component it documents. This is decay, measured.
5. **Naming drift** — the same concept under different names (`primary` / `brand` / `accent`). Report it; **never silently pick a winner** — that's a decision for the team, and picking one quietly is how a system loses consent.

### Make the mess visible without becoming the mess

Findings render as Storybook pages so people click through them instead of ignoring a report. Three rules keep audit output from turning into the next generation of rot:

- **Generated only.** Everything under `.storybook-audit/` is written by the script and regenerated from scratch each run. Never hand-edit it. A fixed finding disappears on the next run with no cleanup ritual.
- **Tagged and quarantined.** Every audit page carries `tags={['audit', '!manifest']}`. `manifest` is applied to all stories and docs pages by default; `!manifest` removes it, keeping audit findings out of the agent-facing manifest so agents never learn from the anti-patterns you're documenting (Storybook's own best practice: remove the `manifest` tag from stories demonstrating anti-patterns or deprecated components).
- **Hidden by default.** In `.storybook/main.ts`:

```ts
tags: {
  audit: { defaultFilterSelection: 'exclude' },
}
```

The tag becomes a sidebar filter that is off until someone asks for it. Findings are one click away, not in everyone's face forever.

Point `stories` at the audit directory only when you want it built:

```ts
stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)', '../.storybook-audit/**/*.mdx'],
```

Keep `.storybook-audit/` out of the production build and out of git (`.gitignore`) unless the team wants the trend committed.

### Report the four numbers

End every audit with the metrics block from `findings.json`, not prose:

| Metric | This run |
|---|---|
| Token adoption (styled values via tokens) | `x%` |
| Story coverage (components with a story) | `x%` |
| Duplicate clusters | `n` |
| Stale stories | `n` |

Commit `findings.json` to a known path so the next run can print the delta. **Without a baseline, "we stopped the decay" is unfalsifiable.** See `references/metrics.md` for targets and for wiring the gate.

On a large codebase, sample the highest-traffic shared component directories first and say plainly it is a sample.

Then stop. The audit's job is visibility. Do not start rewriting components unless asked.

---

## Phase 2 — Decide

### Tokens

Read `references/token-architecture.md` before proposing any token scheme. Two things override everything in it:

1. **Conform to the project's existing convention if one exists.** A Tailwind project's `text-md` is correct in that project. Overwriting a working local grammar with a famous external one is vandalism with a citation.
2. **Three layers by default: Primitive → Semantic → Component**, and a component never references a Primitive directly. Add component-scoped tokens only when a real override case appears — see the reference for why a per-component layer is a bloat vector, and why interaction state belongs in the token *name* rather than in a fourth layer.

### Writing stories

Non-negotiable, because each one is a measured decay cause:

1. **One concept per story.** Storybook's own AI guidance: a `SizesAndVariants` story "demonstrates too many concepts at once, making it less clear and less useful as a reference for agents." Split it.
2. **Document the *why*.** JSDoc on the component and its props, plus a description on each story explaining why you'd use what it shows. This text is what lands in the manifest that agents read — undocumented props are what agents hallucinate around.
3. **Two kinds of story, marked as such.** This distinction prevents most rot:
   - **Workshop** (`tags: ['!autodocs', '!manifest']`) — a build harness for a component still in motion. Cheap, disposable, nobody's contract.
   - **Contract** (`tags: ['autodocs']`) — the documented API. Maintained, status-tagged, covered by tests.
   Collapsing the two is why teams end up maintaining throwaway stories and distrusting the whole tool.
4. **Isolate at the boundary, don't restructure the product.** Stories depending on a router, a store, or a fetch are the classic break. Mock the module — do not force an app-architecture refactor to satisfy a documentation tool:

```ts
// .storybook/preview.ts  — module mocks register at project level only
import { sb } from 'storybook/test';
sb.mock(import('../src/lib/session.ts'));
sb.mock(import('uuid'), { spy: true });
```

```ts
// Component.stories.ts
const meta = {
  component: AuthButton,
  beforeEach: async () => {
    mocked(getUserFromSession).mockReturnValue({ name: 'John Doe' });
  },
} satisfies Meta<typeof AuthButton>;
```

Extract a pure presenter when the component is genuinely doing two jobs — as a design call, not as a tax the tool imposes.

5. **CSF3, with the import path from Step 0.** Do not paste `@storybook/react` from memory.

```ts
import type { Meta, StoryObj } from '@storybook/your-framework'; // ← from detect.mjs
import { Button } from './Button';

const meta = {
  title: 'Components/Inputs/Button',
  component: Button,
  tags: ['autodocs', 'ready'],
  argTypes: { variant: { control: 'select', options: ['primary', 'secondary'] } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default call-to-action. Use for the single primary action on a surface. */
export const Default: Story = { args: { variant: 'primary', children: 'Action' } };
```

6. **Taxonomy `[Category]/[Group]/[Component]`, depth 3.** Group by what a consumer searches for. Do not ship a `Pages` layer of whole-screen stories — those are exactly the context-coupled stories rule 4 exists to contain.

---

## Phase 3 — Enforce

The rules only count once they can fail a build.

### Status is an enum, not a vibe

Status lives as a Storybook tag, validated in CI. `references/component-lifecycle.md` has the taxonomy and transition rules; `scripts/validate-status.mjs` is what makes them real — it fails on an unknown or missing status tag, on a `deprecated` component with no replacement pointer, and on an illegal transition.

```ts
// .storybook/main.ts — status tags become sidebar filters
tags: {
  deprecated:   { defaultFilterSelection: 'exclude' },
  experimental: { defaultFilterSelection: 'exclude' },
  wip:          { defaultFilterSelection: 'exclude' },
  audit:        { defaultFilterSelection: 'exclude' },
},
```

Now "what's deprecated and what replaces it" is a sidebar filter and a CI check, not tribal knowledge.

### Inclusion is computed, not argued

"Used in 2+ places" is a fact the audit already counts. Don't debate it — read it off `findings.json` and put the number in the story description. The judgment left for a human is narrow: is this shared vocabulary, or one screen's furniture? Rules in `references/component-lifecycle.md`.

### Gates that stop decay at the source

An audit finds rot; a gate prevents it. Wire these in CI (details and sample workflow in `references/metrics.md`):

- **No new raw values.** `node scripts/audit.mjs --gate hardcoded` fails when hardcoded hex/px in component directories exceeds the committed baseline. Surveyed systems overwhelmingly enforce tokens by making the raw value *fail* — 15 token-enforcement techniques across 13 systems, "mostly by making the raw value fail rather than by asking the model not to write it" (https://state-of-ai-in-design-systems.netlify.app/questions/design-tokens.md). Prefer a real lint rule (`stylelint-declaration-strict-value`, an ESLint no-restricted-syntax rule, or a typed token vocabulary the compiler checks) over the script when the stack supports one.
- **Status validity.** `node scripts/validate-status.mjs`.
- **Accessibility, scaled deliberately.** `@storybook/addon-a11y` with `parameters.a11y.test: 'error'` on contract stories; `'todo'` while a component is being brought up. `'off'` only with a written reason. Blanket `'error'` everywhere produces noise on token swatches and layout pages, the team disables it globally, and you end up with less a11y than a scoped rule would have given you.
- **Tests, scoped to logic.** `@storybook/addon-vitest` turns stories into browser-run component tests. Play functions once a component has real logic — validation, toggles, multi-step state — not on presentational ones. Pass `storybookUrl` so CI failures link to the published Storybook.

### Agent-readable — same artifacts, no parallel format

Humans and agents read the **same** stories. Do not hand-roll `llms-*.txt` when Storybook generates manifests natively.

```ts
// .storybook/main.ts
features: { componentsManifest: true },
```

```bash
npx storybook add @storybook/addon-mcp
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

Manifests are served at `/manifests/components.json` and `/manifests/docs.json` (debugger at `/manifests/components.html`). React prop extraction is more complete with `reactDocgen: 'react-docgen-typescript'`. Then add the pointer to `AGENTS.md`/`CLAUDE.md` — without it agents keep guessing out of habit. Full setup, the static fallback for published docs, and the instruction text: `references/agent-readable-docs.md`.

### Ownership

A gate without an owner gets disabled the first time it's inconvenient. Record in the repo: who reviews a new shared component, how a contribution enters, and the deprecation window length. One short section in `AGENTS.md` beats a wiki nobody opens.

---

## Reference files

Read only what the current phase needs.

- `references/token-architecture.md` — layers, real Atlassian grammar with source, migration order, a11y tokens
- `references/component-lifecycle.md` — status enum, transitions, inclusion rules, addon thresholds
- `references/metrics.md` — the four numbers, targets, CI wiring
- `references/agent-readable-docs.md` — manifests, MCP, static fallback, agent instruction text
- `references/elite-patterns.md` — sourced patterns, each with a URL and date verified

## Scripts

- `scripts/detect.mjs` — version/framework/paths. Run before emitting code.
- `scripts/audit.mjs` — the four metrics + finding MDX. Re-runnable, gate mode.
- `scripts/validate-status.mjs` — status enum and deprecation-pointer CI check.
- `scripts/test-scripts.mjs` — fixture check for both. Run it after editing either script.

Verified against Storybook 10.6 documentation, September 2026. Re-verify with `detect.mjs` before trusting any API name here.
