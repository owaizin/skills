# Token Architecture

## Rule zero: conform before you propose

If the project already has a working token convention, adopt it. A Tailwind project's `text-md` is correct *in that project*. Replacing a functioning local grammar with a famous external one costs every consumer a migration and buys nothing. Propose a grammar only where none exists, or where the audit shows the existing one has already fractured (see naming drift in `findings.json`).

## Layers — three by default

1. **Primitive** (Core/Global/Base) — raw values, no meaning. `blue-500: #3B82F6`, `space-4: 16px`
2. **Semantic** — purpose, references a Primitive. This is what components consume. `color.background.brand.bold → {blue-500}`
3. **Component** — scoped to one component, references Semantic. **Add only when a real override exists.** `button.primary.background`

**The one hard rule:** a component never references a Primitive directly. `color: blue-500` in a component is an audit finding, not a style choice — it means the semantic layer is missing or was skipped.

### Why component tokens are opt-in, not a default layer

A component layer multiplies with component count × property count, and every one is a name someone must learn and a value someone must keep in sync. Teams that mint them by default end up with thousands of aliases that all point at the same semantic token. Mint one only when a component genuinely needs to diverge from the semantic value — and when it does, that divergence is worth a name.

### State is a name segment, not a fourth layer

Interaction state belongs in the token name. Atlassian's public token set encodes it exactly this way — `color.background.accent.red.bolder.hovered` — rather than as a separate layer or a runtime transform.
Source: https://atlassian.design/components/tokens/all-tokens (verified 2026-09-17)

Do **not** derive states by transforming a value at runtime ("darken 10%"). It inverts in dark mode, silently breaks the contrast ratios documented below, and behaves differently across sRGB/P3/OKLCH. Name the state; give it a value.

## Naming grammar

When proposing one, the segment order that scales is `category.subcategory.attribute.modifier.intensity[.state]`:

| Example | Segments |
|---|---|
| `border.width` | category.subcategory |
| `color.background.accent.lime.subtlest` | category.subcategory.attribute.modifier.intensity |
| `color.background.accent.red.bolder.hovered` | …intensity.state |

Same source as above. What makes it work is not the segment count — it's that the name says *where the token is used*, so swapping the underlying value never touches component code. `brand-blue-2` fails that test; `color.text.danger` survives a rebrand.

## Migration order (retrofitting)

1. **Colour first**, then spacing. Highest blast radius and, for colour, the clearest theming justification. The scanner ranks files by literal-match count; treat that ranking as a worklist of candidates, each of which still needs a decision: existing token, new token, implementation constant, or documented exception.
2. **Typography next**, once spacing/color conventions have survived contact with real PRs.
3. **Component tokens last**, and only per the rule above.

Never propose a big-bang migration across all layers at once unless the user asks for one and names the risk themselves.

## Enforcement — the part that actually holds

Documenting a token grammar does not produce adoption; making the raw value fail does. Across 21 surveyed design systems, 15 token-enforcement techniques in 13 systems work "mostly by making the raw value fail rather than by asking the model not to write it" — a typed token vocabulary the compiler checks, a lint rule rejecting literal colors and spacing, and a token lookup exposed as a tool so an agent must ask what "danger red" is called instead of guessing.
Source: https://state-of-ai-in-design-systems.netlify.app/questions/design-tokens.md (July 2026 snapshot)

In order of preference:

1. **Types** — a union of token names, so a raw hex is a compile error.
2. **Lint** — `stylelint-declaration-strict-value` for CSS, or an ESLint `no-restricted-syntax` rule for style objects.
3. **The audit gate** — `node scripts/audit.mjs --gate hardcoded` when neither fits the stack. Weakest of the three; it catches regressions instead of preventing them.

## Output formats — ask, don't assume

- **Markdown docs** — fine when nothing is built yet.
- **CSS custom properties** — `--token-name: value`.
- **W3C Design Tokens JSON** — feeds Style Dictionary and similar pipelines.
- **Framework config** (Tailwind theme, etc.) — only when the project already uses that system.

## Accessibility tokens

- **Contrast**: document which token *pairs* meet AA/AAA. A contrast target on a single token is meaningless — contrast is a relationship.
- **Focus ring**: width, color, offset as first-class tokens, not per-component afterthoughts.
- **Motion**: every duration needs a reduced-motion counterpart (`duration.normal: 200ms` / `duration.reduced: 0ms`).
- **Touch targets**: 44px (iOS HIG) / 48px (Material) if the project ships mobile web.
