# Component Lifecycle & Maintenance Decisions

The judgment calls that normally live in one senior dev's head. Every rule here has a mechanism — a tag, a filter, or a CI check. A rule with no mechanism is a rule that will be ignored by the third new hire.

## Status is a tag, validated in CI

Storybook tags are "any static (i.e. not created dynamically) string", settable at project, component or story level, and custom tags become sidebar filters. That is the whole mechanism — no addon needed.

```ts
// Component.stories.ts
const meta = {
  component: Button,
  tags: ['autodocs', 'ready'],
} satisfies Meta<typeof Button>;

// one story can override the inherited status
export const NewVariant: Story = { tags: ['!ready', 'experimental'] };
```

```ts
// .storybook/main.ts — everything but `ready` is hidden until asked for
tags: {
  deprecated:   { defaultFilterSelection: 'exclude' },
  experimental: { defaultFilterSelection: 'exclude' },
  wip:          { defaultFilterSelection: 'exclude' },
  audit:        { defaultFilterSelection: 'exclude' },
},
```

Source: https://storybook.js.org/docs/writing-stories/tags and https://storybook.js.org/docs/api/main-config/main-config-tags (verified 2026-09-17, Storybook 10.6)

| Status | Meaning |
|---|---|
| `wip` | Being built. Not for any use. |
| `experimental` | Usable, API still moving. Expect breakage. |
| `ready` | Stable API. Safe to build on. |
| `deprecated` | Do not use in new work. Must name its replacement. |

`node scripts/validate-status.mjs` **lints** these tags. **Do not wire it into CI.** It flattens every tag array in a file rather than resolving Storybook's per-story inheritance (project → meta → story, `!tag` removing an inherited tag), so it misreports the `['!ready','experimental']` override shown above, treats a workshop meta as a contract, and rejects legitimate custom tags. Its deprecation check is a prose regex that accepts "use caution". Read its findings; do not treat them as verdicts. Enforcement needs resolved per-story metadata from Storybook's index.

**Transitions**
- `experimental → ready` only once the API has stopped changing **and** it's used in a real production surface, not just in Storybook.
- `ready → deprecated` ships with migration guidance in the same commit. Usually that is "use X instead". Sometimes there is legitimately no successor — a capability being retired — and then the guidance is the retirement rationale and what consumers should do instead. Do not force a fictional replacement to satisfy a checker.
- A lifecycle needs an end: track retirement and consumer-upgrade completion, not an eternally `deprecated` entry.
- No jumping straight to `deprecated` without a `ready` period, unless the component was broken or unsafe from the start.
- Deprecated components also get `!manifest`, so agents stop suggesting them: Storybook's own guidance is to remove the `manifest` tag from stories demonstrating anti-patterns or deprecated components.

## Two kinds of story

Collapsing these is the most common source of story rot — teams end up maintaining throwaway harnesses as if they were contracts, then stop trusting the whole tool.

Rather than two buckets, decide each axis explicitly:

| Axis | Options | Notes |
|---|---|---|
| Maturity | `wip` / `experimental` / `ready` / `deprecated` | one per story, after inheritance |
| Docs | `autodocs` or not | generated docs cost nothing to keep current |
| Agent retrieval | `manifest` or `!manifest` | exclude anti-patterns; deprecated APIs may still need to be findable by migration agents |
| Tests | Storybook's `test` tag is implicit | `!autodocs`/`!manifest` do **not** remove it — a harness story still runs in CI unless you say otherwise |

A harness story often becomes a valuable regression fixture; don't delete it merely because it started as scaffolding. An experimental component can carry a well-documented contract with limited support. Define promotion and retirement criteria rather than inferring them from tags.

## Three separate questions

Conflating these is why libraries end up both over- and under-documented:

1. **Does this need a reproducible scenario?** Driven by failure risk and the number of states worth exercising — not by reuse. A one-off screen with complex error recovery may need one badly; a widely reused component with one visual state may not.
2. **Does this need consumer documentation?** Driven by how many people build against it and whether they can read the source. A layout primitive every product depends on needs docs precisely *because* everything depends on it — "no real props" is not "no contract": responsive behaviour, spacing, width and nesting rules are all consumer commitments.
3. **Does this deserve shared-library ownership?** Driven by product demand, semantic stability, accessibility maturity and the team's capacity to maintain it. This is a promotion decision with an owner, not a computed one.

Reuse evidence informs all three and settles none. Treat the scanner's `usedIn` count as a weak hint: it includes stories and tests, merges unrelated same-name imports, counts repeated imports from one file separately, and misses consumers outside the scanned root.

When genuinely unsure whether something is ready to be documented as a contract, say so in the story rather than shipping an implied guarantee.

## Docs level

- `tags: ['autodocs']` is the default for contract stories — it generates from the story plus prop types, so it costs nothing to keep current.
- Hand-written MDX only when the component needs prose stories can't express: design rationale, do/don't, when to use this versus a neighbor. If the MDX would restate autodocs, skip it.
- Write JSDoc on the component and on each prop. It lands in the agent-facing manifest, and undocumented props are exactly what agents hallucinate around.

## Addon thresholds

- **`@storybook/addon-a11y`** — `parameters.a11y.test: 'error'` on contract stories (violations fail in CLI/CI), `'todo'` while bringing a component up (warns, doesn't fail), `'off'` only with a written reason. `globals.a11y.manual: true` disables automated checks on a specific story. Do not set `'error'` globally and unconditionally: token swatches and layout pages generate noise, the team disables the addon wholesale, and the net result is less accessibility than a scoped rule would have delivered.
  Source: https://storybook.js.org/docs/writing-tests/accessibility-testing
- **`@storybook/addon-vitest`** — turns stories into real-browser component tests (smoke render + any play function) via portable stories. Requires Vite; `@storybook/test-runner` remains supported and works with any framework. Pass `storybookUrl` so CI failures link to the published Storybook.
  Source: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- **Play functions** — follow observable obligations and failure risk, not a "has state" rule. A stateless component can still owe an accessible name, native keyboard behaviour, a disabled state, or event forwarding, and those are worth asserting. Skip tests that merely mirror the implementation.
- **Visual regression (Chromatic/Percy)** — when risk and maintenance economics justify it, independent of catalog size: five heavily reused primitives can warrant it immediately. Decide who approves an intentional visual change and how flaky evidence is handled before turning it on.

## Context-coupled stories

Stories depending on a router, a store, or a fetch break silently when app context changes, accumulate mocking, and end with the team ignoring failures. The fix is to mock the module, not to restructure the product:

```ts
// .storybook/preview.ts — project level only
import { sb } from 'storybook/test';
sb.mock(import('../src/lib/session.ts'));
sb.mock(import('uuid'), { spy: true });
```

Source: https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules

Extract a pure presenter when the component is honestly doing two jobs. That's a design call you can defend on its own merits — not a tax the documentation tool imposes on the application.

## Ownership

Contribution types need different paths: a typo fix, a token adjustment, a new shared data grid and a breaking API change are not one workflow ([Curtis](https://eightshapes.com/articles/defining-contributions/)). Define, at a scale that fits the team: accountable owner, release authority, acceptance evidence, exception process, migration responsibility, consumer support path. Put them where contributors actually look — `AGENTS.md` addresses agents, and is not automatically the right interface for designers or product teams. Gates without an owner get disabled the first time they're inconvenient.
