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

`node scripts/validate-status.mjs` fails the build on: an unknown status string (catches `redy`), more than one status on a story, a contract story with no status, and a `deprecated` story with no "use X instead" pointer. Wire it into CI — the enum only means something once a typo breaks a build.

**Transitions**
- `experimental → ready` only once the API has stopped changing **and** it's used in a real production surface, not just in Storybook.
- `ready → deprecated` ships with the replacement pointer in the same commit. A deprecation with no pointer is a warning nobody can act on — which is why it's a hard CI failure here, not a convention.
- No jumping straight to `deprecated` without a `ready` period, unless the component was broken or unsafe from the start.
- Deprecated components also get `!manifest`, so agents stop suggesting them: Storybook's own guidance is to remove the `manifest` tag from stories demonstrating anti-patterns or deprecated components.

## Two kinds of story

Collapsing these is the most common source of story rot — teams end up maintaining throwaway harnesses as if they were contracts, then stop trusting the whole tool.

| | Workshop | Contract |
|---|---|---|
| Purpose | Build harness while the component moves | The documented API |
| Tags | `['!autodocs', '!manifest', 'wip']` | `['autodocs', 'ready']` |
| Maintained? | No. Delete freely. | Yes. Status-tagged, tested. |
| In agent manifest? | No | Yes |

A churning component **should** get a workshop story — that's where duplicates get prevented. What it should not get is an autodocs contract nobody can honor yet.

## Does this component belong in Storybook?

Most of this is computed, not argued. `findings.json` already carries `usedIn` per component.

**Contract story if:**
- Used in 2+ places (read the number; don't debate it), **or**
- It has states worth previewing — loading, error, empty, disabled, **or**
- Other developers or designers will reference it without opening the source.

**Not yet if:**
- One-off composition for a single screen.
- A layout wrapper with no real props (`<Container>` that is `max-width` plus padding).

When genuinely unsure, default to **workshop, not contract**. An honest gap beats a stale contract.

## Docs level

- `tags: ['autodocs']` is the default for contract stories — it generates from the story plus prop types, so it costs nothing to keep current.
- Hand-written MDX only when the component needs prose stories can't express: design rationale, do/don't, when to use this versus a neighbor. If the MDX would restate autodocs, skip it.
- Write JSDoc on the component and on each prop. It lands in the agent-facing manifest, and undocumented props are exactly what agents hallucinate around.

## Addon thresholds

- **`@storybook/addon-a11y`** — `parameters.a11y.test: 'error'` on contract stories (violations fail in CLI/CI), `'todo'` while bringing a component up (warns, doesn't fail), `'off'` only with a written reason. `globals.a11y.manual: true` disables automated checks on a specific story. Do not set `'error'` globally and unconditionally: token swatches and layout pages generate noise, the team disables the addon wholesale, and the net result is less accessibility than a scoped rule would have delivered.
  Source: https://storybook.js.org/docs/writing-tests/accessibility-testing
- **`@storybook/addon-vitest`** — turns stories into real-browser component tests (smoke render + any play function) via portable stories. Requires Vite; `@storybook/test-runner` remains supported and works with any framework. Pass `storybookUrl` so CI failures link to the published Storybook.
  Source: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- **Play functions** — once a component has real logic: validation, toggles, multi-step state, conditional rendering. Not on presentational components; that's maintenance with no bug-catching value.
- **Visual regression (Chromatic/Percy)** — when manual review of every PR's visual diff stops being realistic. Unnecessary at 5 components, overdue well before 50.

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

Record in `AGENTS.md`, in three lines: who reviews a new shared component, how a contribution enters, and how long the deprecation window is. Gates without an owner get disabled the first time they're inconvenient.
