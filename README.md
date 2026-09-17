# skills

Claude Code skills.

## storybook-architect

Maintains a Storybook as a design system of record: measures decay with a re-runnable audit, renders findings as disposable Storybook pages, enforces token/status/inclusion decisions as CI gates, and exposes the system to AI agents through Storybook's official manifests and MCP server.

Scope is maintenance, not visual design.

```
storybook-architect/
├── SKILL.md
├── references/
│   ├── token-architecture.md      layers, Atlassian grammar (sourced), migration order, a11y tokens
│   ├── component-lifecycle.md     status enum, transitions, inclusion rules, addon thresholds
│   ├── metrics.md                 the four numbers, ratchet policy, CI wiring
│   ├── agent-readable-docs.md     manifests, MCP, static fallback, agent instruction text
│   └── elite-patterns.md          sourced patterns, each with a URL and verification date
└── scripts/
    ├── detect.mjs                 Storybook version / framework package / config paths
    ├── audit.mjs                  four metrics + finding MDX; --gate mode for CI
    ├── validate-status.mjs        status enum and deprecation-pointer CI check
    └── test-scripts.mjs           fixture check for both scripts
```

### Use

```bash
node storybook-architect/scripts/detect.mjs            # before emitting any story code
node storybook-architect/scripts/audit.mjs --root src  # findings.json + 6 MDX pages
node storybook-architect/scripts/validate-status.mjs   # CI gate
node storybook-architect/scripts/test-scripts.mjs      # verify the scripts themselves
```

No dependencies. Node 22+.

### Install

Unpack `storybook-architect/` into `~/.claude/skills/` for global use, or `.claude/skills/` in a project.

### Verified against

Storybook 10.6 documentation, September 2026 — [tags](https://storybook.js.org/docs/writing-stories/tags), [manifests](https://storybook.js.org/docs/ai/manifests), [MCP](https://storybook.js.org/docs/ai/mcp/overview), [module mocking](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules), [a11y](https://storybook.js.org/docs/writing-tests/accessibility-testing), [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), [AI best practices](https://storybook.js.org/docs/ai/best-practices).

Design-system figures from [State of AI in Design Systems](https://state-of-ai-in-design-systems.netlify.app) (July 2026, CC BY 4.0). Token grammar from [Atlassian](https://atlassian.design/components/tokens/all-tokens).

Storybook APIs move across majors. Re-verify with `detect.mjs` before trusting any API name.
