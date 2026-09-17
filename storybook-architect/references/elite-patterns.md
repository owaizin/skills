# Patterns Worth Stealing — With Sources

Every claim here carries a URL and the date it was verified. Cite the source when you propose the pattern; a recommendation a user can check is worth more than one they must trust. Re-verify before quoting — these systems ship weekly.

Survey figures come from *State of AI in Design Systems* (Kaelig Deloumeau-Prigent, CC BY 4.0), a July 2026 field study of 21 design systems and 6 platforms — 200 affordances, 165 coercion techniques. Snapshot 2026-07-28. https://state-of-ai-in-design-systems.netlify.app · methodology: /report/methodology.md

## Enforcement beats instruction (the study's headline)

- **Validation loops are the most common technique: 31 of 165, in 21 of 21 systems.** A loop "turns a guideline into a failure the model has to fix, which is the only category here that keeps working after the model stops reading the instructions." Next: prohibition (28), curated context (23), tool-gating (22).
  https://state-of-ai-in-design-systems.netlify.app/questions/validation-loops.md
- **Token adherence is enforced, not requested: 15 token-enforcement techniques across 13 systems**, working "mostly by making the raw value fail rather than by asking the model not to write it" — typed token vocabularies, lint rules rejecting literal colors, token lookup exposed as a tool.
  https://state-of-ai-in-design-systems.netlify.app/questions/design-tokens.md

This supports investing in reliable checks for explicit obligations. It does not validate this skill's experimental scanner or justify converting uncertain signals into gates.

## Atlassian Design System — https://atlassian.design (verified 2026-09-17)

- **Token grammar** `category.subcategory.attribute.modifier.intensity[.state]`, e.g. `color.background.accent.red.bolder.hovered`. Interaction state is a name segment, not a layer or a runtime transform.
  https://atlassian.design/components/tokens/all-tokens
- **Topic-split machine-readable docs.** `llms.txt` (a curated index, not a link dump) plus `llms-components.txt`, `llms-primitives.txt`, `llms-tokens.txt`, `llms-styling.txt`, `llms-a11y.txt`, `llms-content.txt`. Splitting by concern is the point: an agent asking about Button props shouldn't have to load the token set.
  https://atlassian.design/llms.txt
- **Lint plugins as the enforcement layer, surfaced to agents twice** — the recommended ESLint config is embedded directly in `llms.txt` so an agent wiring up a repo installs the guardrail, and the MCP server exposes `ads_get_lint_rules` so a model can fix a lint error without leaving the loop. Copy the shape: ship the rule *and* make the rule's docs reachable from inside the agent's session.
- **Generated from one source.** Skill, `llms.txt` and MCP catalogs are generated from the same structured content. For a small team the lesson is narrower and cheaper: do not maintain a second hand-written agent format alongside the docs — generate it, or use Storybook's manifests.
- **Migration codemods handed over as a command**, not described in prose (`@hypermod/cli` invocation published in `llms.txt`).

## GitHub Primer — https://primer.style (verified 2026-09-17)

- **Storybook itself as the queryable source.** `packages/react/.storybook` serves an MCP endpoint at `/mcp` (list-all-documentation, get-documentation, get-storybook-story-instructions, preview-stories), registered in a committed `.vscode/mcp.json` — and the repo's Copilot instructions *forbid answering about components from model memory until that server has been queried*. This informs the agent-readable documentation workflow.
  https://github.com/primer/react/tree/main/packages/react/.storybook
- **Component review as a machine-readable rubric.** `.github/instructions/component-review.instructions.md` gives each rule a stable ID, a Check, a Prefer, and an **Authority** field pointing at the ADR it derives from. Reviews become checkable and arguable against a written decision instead of taste.
  https://github.com/primer/react/blob/main/.github/instructions/component-review.instructions.md
- **A self-check tool in the loop.** `@primer/brand-mcp` ships `primer_brand_review`, which scans generated JSX/CSS for unknown components, invalid props and hardcoded values. A lexical count ceiling is not an equivalent: checks need to understand the project's actual API and token policy.
- **Primer publishes no `llms.txt`** (`primer.style/llms.txt` 404s) — it bet entirely on MCP. Useful correction to the common claim that every elite system ships llms.txt: the study found 15 of 21 do. Don't cite it as universal.
- **Token repo uses a mandatory command chain.** `primer/primitives/AGENTS.md` specifies a required post-change build/test chain and marks generated files "do not edit."
  https://github.com/primer/primitives/blob/main/AGENTS.md

## Convergent across systems

- **Status labels** (deprecated / experimental / wip / ready, red-yellow-green) recur across systems with little else in common. Treat as a default rather than one option — but note this is convergence by mutual reading as much as independent discovery, so it's a strong prior, not proof.
- **Consumer-facing affordances outnumber builder-facing ones ~2.4:1** (131 vs 54 of 200). Systems are consumed by agents whether or not their maintainers planned for it. Budget maintenance accordingly.
- **MCP servers (37) and agent skills (33) are the two largest affordance types**, ahead of `llms-txt` (15) and Storybook integrations (14).
  https://state-of-ai-in-design-systems.netlify.app

## How to use this file

Cite the specific pattern and its URL in one line — "Atlassian encodes interaction state in the token name rather than deriving it, see atlassian.design/components/tokens/all-tokens" — not "best practices say". Two rules:

1. **Scale down before copying.** Atlassian runs 35+ designers on the core team with 550+ using contribution tooling. Their answer to a problem is not automatically a five-person team's answer. Steal the shape, not the staffing.
2. **A pattern with no source is a hunch.** If you can't produce the URL, say it's a hunch.
