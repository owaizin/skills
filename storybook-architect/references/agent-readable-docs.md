# Make existing component knowledge available to agents

Keep human documentation and agent retrieval grounded in the same source. Start by checking what the project already publishes. A manifest is a structured catalog of component APIs or documentation; MCP lets an agent query that knowledge through tools. Explain that distinction when it helps the user choose what they need.

Guidance below targets Storybook 10.6. Its AI APIs are in preview. Confirm installed versions and framework support; the detector's major-version flag alone is not proof of compatibility.

## Generate and inspect the manifests

Merge the supported feature into the existing configuration:

```ts
// .storybook/main.ts — retain the project's other features and settings
features: { componentsManifest: true },
```

Preserve a working docgen parser. Storybook recommends `react-docgen-typescript` for many React projects, but changing the parser without inspecting its output can lose needed information. In the integration evaluation, the existing `react-docgen` setup retained component descriptions and `@import` guidance. Vue and Angular support has additional framework-specific requirements; consult the installed version's [manifest documentation](https://storybook.js.org/docs/ai/manifests).

| Artifact | Path relative to the Storybook root | Verify |
|---|---|---|
| Components | `/manifests/components.json` | A known component's expected public API, descriptions, and intended import guidance |
| Documentation | `/manifests/docs.json` | Intended MDX pages present; excluded report pages absent |

Both are available in a supported static build. Some docgen-server configurations assemble the development manifest on demand and do not expose those JSON routes; use the build or the manifest debugger. A missing dev route is not sufficient evidence that generation failed.

**Verification sequence:**

1. Build with the project's command and inspect the resolved `index.json` entries. Check the intended story or docs entry type and effective tags.
2. Match a known component's resolved manifest entry to its source. Verify its expected public API, useful descriptions, and import guidance; a component with no configurable props can be valid. Report what matched, what is missing, and the scope of the check. Diagnose missing information only as far as the evidence supports, using the distinctions below.
3. Check `docs.json` independently. Use a known included MDX page as a positive control, then check that excluded reports are absent. Their absence from the component manifest alone establishes nothing about docs retrieval.
4. Check the actual runner and a meaningful changed scenario if the task includes behavior or test enforcement. Do not infer execution from a `test` tag alone.
5. When claiming live agent retrieval, query the same example through the available MCP tools. A successful build does not establish this step.

### Inspect the output the consumer actually receives

A populated docs page does not establish that the manifest entry is usable. Inspect the entry itself and resolve any referenced payload before comparing it with the source.

- **Expected metadata missing:** distinguish missing source documentation from information lost during extraction. A required prop whose description is absent from both source and manifest needs authoring guidance, not a new parser. Explain its semantics and constraints rather than restating its type.
- **Broken component pointers:** verify the target of a description's component or story link, especially after a rename. A dangling link can mislead both people and agents.
- **Unknown cause:** report the observed mismatch and what would establish its cause. A prop present in source but absent from the manifest confirms a mismatch; it does not by itself identify the extraction mechanism as the cause. Use “expected metadata missing; cause unresolved” until configuration, logs, or a reproduction establish more. Intentional exclusion, unsupported extraction, unresolved referenced data, and confirmed extraction failure are possible diagnoses, not an exhaustive result schema. A successful comparison is also a valid result, scoped to what was checked.

## Choose the connection the task needs

Inspect what the project already has, then take the smallest sufficient path:

- **Knowledge retrieval:** accessible manifests from a supported built or published Storybook can be read directly. A live MCP server is not required. Check version alignment with the package the consumer uses.
- **Existing tools:** use the available connection and its actual tool list. A static Storybook does not itself expose a live MCP endpoint; a separate service may consume its artifacts, but that service must exist and support the requested operation.
- **Authoring and verification:** use existing source files and project check commands. Start a local Storybook only when the selected preview, runner, or local MCP tool requires it. Vitest can test stories without running Storybook; the test runner can target a deployed build. Testing a published revision does not verify an unbuilt local edit.

When startup is needed, coordinate the port and connection explicitly. Verify availability, host support, and installed versions before recommending a plugin that manages startup. Prefer current official setup instructions to commands from a recording.

Sources: [MCP setup](https://storybook.js.org/docs/ai/mcp/overview), [Vitest comparison](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon#comparison-to-the-test-runner), [deployed test runner](https://storybook.js.org/docs/writing-tests/integrations/test-runner#run-tests-against-a-deployed-storybook), [CLI options](https://storybook.js.org/docs/api/cli-options).

### Connect a live MCP server when needed

For a requested setup on a supported project without a suitable connection, Storybook documents installing `@storybook/addon-mcp` using the project's package manager, then adding its development endpoint to the agent host:

```bash
npx storybook add @storybook/addon-mcp
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

Adapt the package manager, port, and host configuration. A static build serves manifests but does not run the live MCP endpoint. Inspect the actual exposed tools and framework capabilities; tool names and availability may change. For 10.6 the documentation toolset includes `docs-list` and `docs-show`; `test-run` requires the project's testing setup. Do not report the connection as working until a real query returns the expected component.

Source: [Storybook MCP setup and framework support](https://storybook.js.org/docs/ai/mcp/overview).

## Give agents a short project pointer

Merge guidance into the project's existing agent instructions, using the real connection name and check command. Do not create a second handbook. For example:

```text
Before using a shared UI component, read its current usage guidance and API
through our Storybook connection. Verify props and import paths against the
installed package. If the connection is unavailable or stale, inspect the
component source and existing stories, and say which evidence you used.
After a change, run the project's relevant story or component checks.
```

Keep version alignment explicit: docs for an unreleased branch may describe a different API from the package a consumer has installed.

## Curate retrieval deliberately

Use `!manifest` to remove examples that should not guide new implementation. This skill's generated reports carry it. Choose whether an experimental example is useful based on its documented contract, not its origin as a harness. Keep retirement and migration guidance discoverable through an appropriate consumer page even when deprecated component examples are excluded.

Prefer a focused example, describe when it is useful, and keep API descriptions near the source. This improves retrieved context; it does not train a model or guarantee correct generation. See [Storybook's AI documentation guidance](https://storybook.js.org/docs/ai/best-practices).

Write a short description that distinguishes each component from alternatives. When the available tools support it, retrieve an index first and fetch component or story detail as the task requires; `docs-list` and `docs-show` provide this pattern. Include essential usage constraints without waiting for the user to know which question to ask.

Separately, React's reference-based manifest format requires `experimentalDocgenServer` with `componentsManifest`. Inspect the installed output and resolve payload references when present. Progressive tool retrieval does not require changing a working docgen mode. See [framework requirements](https://storybook.js.org/docs/ai/mcp/overview#framework-support) and [the feature configuration](https://storybook.js.org/docs/api/main-config/main-config-features#experimentaldocgenserver).

## When native manifests are unavailable

Use the project's existing generated API reference or component source. A separate machine-readable export is a compatibility option only when it solves a real access problem; generate it from maintained inputs and give it an owner. Split large catalogs by consumer need rather than making every query load the entire library. A published static Storybook can already contain manifests and is not, by itself, a reason to invent a parallel format.
