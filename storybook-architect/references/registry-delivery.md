# Deliver an AI-readable component catalog

Use when asked to make a library usable by agents, provide a component registry, or deliver catalog access comparable to Kumo. The deliverable is a maintained discovery path that a consumer can actually use, with verified scope. The skill itself is not a hosted registry or a universal source-code extractor.

Start with the person's intended use: choosing components, writing valid compositions, or installing source files. A metadata catalog describes APIs; an installable source registry distributes code and dependencies. Do not imply installation support from metadata alone. Source distribution needs its own explicit scope.

## Choose and implement the appropriate path

Inspect the library's public exports, package version, docs/stories, existing metadata generator, and intended consumer environment. Recommend the simplest sufficient path in plain language. Resolve technical details from the project; ask only for missing access, audience, or distribution decisions.

| Existing situation | Delivery |
|---|---|
| Maintained registry already exists | Check coverage and consumer access; repair the specific gaps instead of creating another catalog. |
| Supported Storybook manifests meet the need | Configure, generate, and inspect them using [agent-readable docs](agent-readable-docs.md). Deliver actual artifact locations and retrieval instructions. |
| Native output lacks necessary information or cannot reach consumers | Extend maintained metadata or implement a small project-owned adapter/exporter from verified inputs. Explain the specific gap before adding a format. |

An implementation request includes the generator/configuration, generated artifacts, retrieval path, and relevant checks within scope. Do not stop after recommending manifests or writing a JSON sample. Conversely, a registry review does not authorize implementation or deployment.

## Define what consumers need to receive

Use the existing schema when possible. Document these capabilities and their verified coverage rather than imposing new field names:

- A discoverable index with stable identities, names, and concise descriptions that distinguish alternatives; detail can be retrieved without loading every example.
- Valid package/subpath imports, supported export names, required providers, and relevant composition constraints.
- Props or equivalent framework API: types, requiredness, documented defaults and valid variants. Preserve unknown or unsupported information explicitly; missing metadata does not mean an empty API.
- Useful examples grounded in maintained stories/source, including required setup. Compound component relationships and usage guidance where needed.
- Semantic tokens and variant relationships when supported by maintained inputs. Do not infer a token's purpose from its color or invent values to complete the catalog.
- Library version/revision, generator/schema version where applicable, and source provenance sufficient to assess alignment and freshness. Keep machine-local paths out of distributed artifacts.

Reconcile inventory against the intended public exports and declared exclusions. Story coverage alone does not prove API coverage. Handle aliases, subpath exports, internal components, deprecated APIs, compound children, and legitimate zero-prop components deliberately. Keep migration guidance reachable without recommending deprecated APIs for new work.

## Generate from maintained inputs

Reuse the framework's supported extractor, compiler metadata, token source, and story/documentation output. Do not build a regex parser and call it a complete type extractor. Preserve referenced payloads or resolve them with an adapter tested against the installed format. Storybook's manifest schema is in preview; pin supported versions and surface unsupported shapes rather than silently dropping data.

Keep editorial metadata with its owner and merge it by stable identity; report collisions and dangling references. Add the generation command to the project's existing scripts. Generation should be reproducible for the same inputs, with volatile timestamps handled deliberately. Replace output only after validation succeeds; never destroy hand-maintained files or serve partial generation as a valid empty catalog.

## Make it reachable

Choose local files, package artifacts, a static JSON route, an existing CLI, or available MCP tools according to the consumer. Neither MCP nor a custom website is mandatory. If a registry UI is requested, drive it from the same generated data; do not create a second manual catalog.

Use actual paths and commands in the normal contributor/agent entry point. Verify list/search and detail access through the selected interface. An HTTP path must return the intended data rather than an HTML fallback; resolve its links from the consumer's location. Check the intended access controls and package version. A local build does not establish that a published endpoint works. Prepare deployable artifacts within scope; publication follows the user's authorization and project's release process.

## Prove discovery and use

Choose a bounded sample that represents the library's risks, such as a confusing component pair, a compound API, required setup, a zero-prop component, and a subpath export. State what the sample does and does not cover.

1. Generate and retrieve the catalog using the actual delivery path. Validate its structure, referenced payloads, imports, and inventory/exclusion accounting.
2. Give a consumer task starting from the normal project instructions and catalog entry point. Retrieve candidates, choose a component with reasons, and write a minimal usage example from the retrieved guidance. Prefer fresh context when available; record whether the participant was a person or agent and any additional source lookup or correction required.
3. Compile/typecheck the example against the matching library and render it with required setup. Exercise the relevant interaction if the claim includes behavior. Retrieval alone does not prove correct use; successful compilation alone does not prove rendering or accessibility.
4. In isolated fixtures or a disposable copy, introduce a missing required prop description, broken reference/import, or incompatible schema and observe the appropriate failure or explicit incomplete result. Do not claim these checks ran unless executed.
5. Change a documented API or example in isolation and regenerate. Confirm the expected update reaches retrieval, a repeat generation is stable, and failures do not replace valid output. Remove demonstration-only changes.

Reuse maintained checks in the build/release path when authorized. Give regeneration and review responsibility to the existing owner. Return the entry point, one working retrieval example, coverage/exclusions, version alignment, executed checks, and unresolved limits. Report local, published, and live-tool verification separately.

## Provenance and evaluation limits

The delivery pattern is informed by [Kumo's registry](https://kumo-ui.com/registry/), which documents generated component metadata with CLI and HTTP access. [Storybook manifests](https://storybook.js.org/docs/ai/manifests) provide another structured source; neither source implies schema equivalence. Reviewed on 3 October 2026.

This workflow has received structural/editorial checks only. Its consumer-use, failure, freshness, and publication checks above are acceptance instructions, not completed evaluations. Earlier manifest trials do not establish end-to-end registry delivery.
