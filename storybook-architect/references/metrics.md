# Signals, Baselines & Gates

These are **discovery signals**, not quality measures. Each is a proxy scanned from source text; none establishes that a component meets its consumer contract. Report them with their method attached, and never as a grade.

## The signals

`scripts/audit.mjs` emits all of them into `findings.json` on every run.

| Signal | What it literally counts | What it does NOT establish |
|---|---|---|
| `literalValueMatches` / `filesWithLiteralValues` | regex hits for hex/rgb/hsl/px in scanned source | token compliance — a component importing a stylesheet of raw values counts clean |
| `storiedComponentRatio` (+ `componentsScanned`) | parsed component exports that have a matching story | documentation quality; the denominator excludes anything the regex cannot parse (Vue/Svelte SFCs → `null`) |
| `candidateDuplicatePairs` | pairs sharing a name or ≥60% prop *names* | duplication — it compares neither types nor behaviour, and N similar components produce N(N−1)/2 pairs |
| `storiesOlderThanComponent` | file mtime comparison | decay — mtime is checkout time on a fresh clone, and a behaviour-preserving refactor lands here |

Coverage is the weakest of the four on its own — 100% coverage of stale stories is worse than 60% of fresh ones. Read coverage and staleness together, always.

## Targets — direction, not absolutes

There is no industry number to hit, and any skill that hands you one is inventing it. Set the target from your own baseline:

- **First run = the baseline.** Commit it. `.storybook-audit.baseline.json` lives outside the report directory precisely because the report is wiped each run.
- **Only violation counts are gateable**, and only upward: `literalValueMatches`, `candidateDuplicatePairs`. Ratios are rejected by the script — gating one inverts the policy the moment it improves.
- **Baselines are explicit.** `--init-baseline` is a separate, reviewable command. `--gate` with no baseline fails; a gate must never mint its own baseline from the change it is checking.
- **A count ceiling is not "no new violations."** Removing one and adding another elsewhere passes. For that guarantee, compare stable violation identities, or use a real lint rule instead.
- **Re-baseline deliberately.** Raising a baseline is a commit someone reviews, with a reason in the message. Silent baseline drift is the failure mode to watch for — if baselines move every sprint, the gate is theatre.
- Only after the ratchet holds for a quarter is it worth naming an absolute target (say, token adoption ≥90% in `components/`).

## Trend, not snapshot

Commit `findings.json` per run, or append the metrics block to a CSV. Two runs make a delta; a delta is the only thing that answers "is this getting better?" — which is the question the audit exists to answer.

## CI wiring

```yaml
# .github/workflows/design-system.yml
name: design system
on: [pull_request]
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci

      # NOTE: validate-status.mjs is NOT in this workflow. It does not resolve
      # Storybook's tag inheritance and reports false findings. Run it by hand.

      # count ceiling on literal values. Prefer a real lint rule where the stack
      # supports one: stylelint-declaration-strict-value, an ESLint rule, or a typed
      # token vocabulary the compiler checks. All three beat this scanner.
      - run: node scripts/audit.mjs --root src --out ../audit-report --gate literalValueMatches

      # NOTE: no `--gate stale`. Staleness is mtime-based; a fresh clone or a
      # repo-wide reformat manufactures it, and a behaviour-preserving refactor
      # is not decay. Use it to prioritise review, never to fail a build.

      # stories as component tests, a11y errors included
      - run: npm run test-storybook
```

Add gates one at a time. Three gates introduced in one PR get disabled in one PR.

## Why gates and not guidance

Across 21 surveyed design systems, validation loops are the most common technique — 31 of 165, present in every system studied — because a loop "turns a guideline into a failure the model has to fix, which is the only category here that keeps working after the model stops reading the instructions."
Source: https://state-of-ai-in-design-systems.netlify.app/questions/validation-loops.md (July 2026 snapshot)

That applies equally to humans. Every rule in this skill that isn't a gate is a rule with a decay half-life.

## What the audit does not measure

Say this out loud when reporting, so the numbers aren't over-trusted:

- **Prop extraction is regex, not AST.** Duplicate detection is a strong hint, not proof. Confirm before merging two components.
- **Import counting misses dynamic imports, barrel-file re-exports, and non-PascalCase components.**
- **Staleness uses file mtime**, which is checkout time on a fresh clone — not authoring history. It is a review-prioritisation hint, never a gate.
- **"Duplicate pairs" counts pairs, not clusters.** Four similar components produce six pairs.
- **Token adoption counts files without literal matches**, not styled declarations or semantic-token usage. A component importing a CSS file full of raw hex still scores as clean. Treat it as a discovery signal, not a compliance number.
- **A null metric means unknown** (nothing measurable found, or a framework whose component exports this scanner cannot parse — Vue and Svelte SFCs among them). Never read it as 100%.
- **Nothing here measures quality.** A well-covered, fully tokenized system can still be badly designed. These four numbers measure rot, not craft.
