# Metrics & Gates

"We cleaned up the component library" is unfalsifiable. Four numbers, tracked over time, are not.

## The four numbers

`scripts/audit.mjs` emits all of them into `findings.json` on every run.

| Metric | Definition | Read it as |
|---|---|---|
| **Token adoption** | % of component files with no raw hex/rgb/px outside token files | Is the semantic layer actually used, or just documented? |
| **Story coverage** | % of components with a story | How much of the system is visible |
| **Duplicate clusters** | Pairs with similar names and ≥60% prop overlap | Consolidation debt |
| **Stale stories** | Stories older than the component they document | Decay, directly measured |

Coverage is the weakest of the four on its own — 100% coverage of stale stories is worse than 60% of fresh ones. Read coverage and staleness together, always.

## Targets — direction, not absolutes

There is no industry number to hit, and any skill that hands you one is inventing it. Set the target from your own baseline:

- **First run = the baseline.** Commit it. `.storybook-audit.baseline.json` lives outside the report directory precisely because the report is wiped each run.
- **Ratchet, don't leap — and mind the direction.** Two metrics are violation counts that must not rise (hardcoded hits, duplicate pairs). Two are percentages that must not fall (token adoption, story coverage). A single "nothing may increase" rule is wrong: it would forbid coverage improving. Only the violation-count metrics have a `--gate`.
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

      # status enum, one status per story, deprecations name a replacement
      - run: node scripts/validate-status.mjs --root src

      # no new raw values (prefer a lint rule where the stack supports one)
      - run: node scripts/audit.mjs --root src --gate hardcoded

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
