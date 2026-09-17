# Optional source survey

Use this experimental fallback only when a bounded source survey helps answer the request and the project lacks a maintained check for it. Do not run it merely because the skill was invoked. In Brilliance, use the Product System tooling instead; this scanner adds no demonstrated scanning value there.

Explain the purpose in ordinary language: “I'll look for a few possible documentation gaps and repeated implementations, then check the candidates against the source.” Run the commands yourself when you have access. The user should not have to interpret `findings.json`.

## Run and interpret

From the target project, with the skill's actual location substituted:

```bash
node <skill-directory>/scripts/audit.mjs --root src --out .storybook-audit
```

Keep `--out` inside the repository but outside the scan root. It is regenerated each run; the script refuses overlapping roots and existing directories without its generated marker. Do not put hand-written work there. A normal run does not change the baseline.

| Field | What it measures | Important limit |
|---|---|---|
| `literalValueMatches` / `filesWithLiteralValues` | Regex matches for selected color and pixel syntax in scanned source files | Candidates, not missing tokens; constants, geometry, and intentional exceptions also match. Imported styles count in their own scanned files, not against the component using them. |
| `storiedComponentRatio` / `componentsScanned` | Files with a recognized component export and a matching story name | One component record per file, not one per exported component. Basename matching can confuse different components; unsupported or unparsed files are excluded. |
| `candidateDuplicatePairs` | Name similarity and overlap in prop names | Does not compare prop types, semantics, behavior, or wrapping. Counts pairs, not groups. |
| `storiesOlderThanComponent` | File modification times | Checkout and formatting change these. Does not measure correctness or decay. |

`usedIn` only sees selected imports under the scanned root. It misses external consumers and some import forms, includes test/story imports, and can conflate equal names. Do not use it to decide shared-library promotion. A null metric is unknown, not a perfect score.

Inspect candidates before recommending changes. Report the affected consumer task and source evidence; keep raw counts secondary. There is no curated multi-repository false-positive or false-negative rate for this scanner. The [bounded evaluation](evaluation-2026-09-18.md) is not a general accuracy claim.

## Optional Storybook report pages

The six generated MDX pages use:

```mdx
<Meta title="Audit/Overview" tags={['sb-architect-audit', '!manifest', '!autodocs', '!test']} />
```

The namespaced tag avoids claiming a project's generic `audit` tag. Inspect existing use even of this namespace before integrating. The docs-block import targets Storybook 10.6; generation does not dynamically adapt to the detector. Verify compatibility before adding a report to another version.

If Storybook pages are useful, merge the report glob and this filter into the existing `main.ts` configuration, preserving other entries:

```ts
// Paths are relative to .storybook/main.ts; adapt to the actual configuration.
stories: [/* existing globs */, '../.storybook-audit/**/*.mdx'],
tags: {
  // existing tag settings
  'sb-architect-audit': { defaultFilterSelection: 'exclude' },
},
```

Reports are hidden by default. To read them, open Storybook's tag filters and clear the exclusion for `sb-architect-audit`. Do not exclude generic `audit`: it may already label the project's own health stories.

Build and check all six entries in `index.json`, preserve existing tagged entries, and confirm report exclusion from **both** `/manifests/components.json` and `/manifests/docs.json`. Include a known consumer MDX page as a positive control for the docs manifest. `!manifest` and `!autodocs` do not remove the implicit `test` tag; the generated pages explicitly use `!test` to express intent. Test execution still depends on entry type and the actual runner: an MDX `type: 'docs'` entry carrying `test` alone does not prove it will run.

## Count ceilings: explicit opt-in only

Do not add the scanner to CI by default. Prefer a maintained parser, typed token vocabulary, or lint rule tied to an actual policy. A user who deliberately wants a coarse ceiling can initialize a reviewed baseline separately:

```bash
node <skill-directory>/scripts/audit.mjs --root src --out .storybook-audit --baseline .storybook-audit-baseline.json --init-baseline
node <skill-directory>/scripts/audit.mjs --root src --out .storybook-audit --baseline .storybook-audit-baseline.json --gate literalValueMatches
```

Only `literalValueMatches` and `candidateDuplicatePairs` are supported ceilings. They count uncertain candidates, not established violations. Removing one match while adding another passes. They cannot enforce “no new violations.” Ratio and timestamp gates are refused. Missing baselines, missing scan roots, and unsupported gate names exit 2; an increased count exits 1. Keep the baseline outside the regenerated report directory and review deliberate baseline changes.

`validate-status.mjs` is retired from recommended workflows, including manual review. Its flattened tag regex has known false positives and false negatives. Use a project checker that understands Storybook's effective per-story tags instead.
