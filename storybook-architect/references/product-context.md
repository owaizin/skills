# Components in real product contexts

Use when someone wants existing product screens represented in Storybook, wants to examine a system change in context, or asks whether captured screens still reflect the product. Ordinary component documentation does not need this workflow.

The outcome is a useful set of product examples with clear provenance and verified limits. Reuse the project's stories, fixtures, documentation, and comparison tools. Keep decisions in its existing contribution path; no special folder hierarchy or intake form is required.

## Establish what the examples need to show

Inspect the product source and destination Storybook, including imports, story conventions, providers, styles, package boundaries, and available checks. With only a rendered site, mark component identity and template grouping as inferred; appearance does not prove library usage.

Explain the purpose in the person's terms: “I'll bring the checkout states into Storybook so you can inspect how the shared fields and buttons behave together.” Establish whether they need a visual reference, an interactive example, or a comparison of a proposed system change. This determines the version and behavior to preserve.

Record the product's actual dependency resolution and the library revision used in Storybook. Do not assume the local checkout is newer. Use local components for an authorized change-impact experiment; use the relevant product version when fidelity to the shipped product is the goal. Explain unresolved version or API differences instead of silently adapting them away.

Group screens by meaningful structure and behavior. Select states that change what the library must support; neither URL count nor a fixed template quota determines coverage. Show the proposed coverage and why it matters. Ask only when an unresolved scope or ownership choice changes the work; existing authorization does not need another ceremonial approval.

## Choose content that exercises the design

Include a typical example plus relevant awkward cases: long and short labels, crowded collections, missing fields, errors and recovery, varied media, and realistic number/date widths. Record why each case was selected. Keep examples deterministic using the project's fixture conventions and controlled dependencies.

Record source provenance, capture date or revision, represented state, and any sanitization alongside the fixture. Omit credentials, signed URLs, private identifiers, and account data from files and screenshots. For private screens, use invented values preserving useful shapes and lengths. Public content still needs permission appropriate to its reuse; when uncertain, use synthetic content and label it. Record external asset dependencies; bundle permitted assets when offline or reproducible rendering matters.

## Represent the product honestly

Import actual components and supported composition wherever practical. Isolate network, routing, authentication, and other dependencies at established boundaries. Avoid copying component implementations just to produce a screenshot. Match the destination renderer and verified public API.

For each meaningful region, distinguish shared-library UI, product-owned composition, substituted content, and unknown origin. Use existing documentation or a lightweight legend; add visible markers only when they help the task. Namespace any new attributes, tags, or globals and check for collisions. Product ownership is not a defect or evidence that something should become shared. Recommend promotion only after establishing recurring consumer needs, a useful contract, and ownership.

Preserve product-owned UI where authorized. Changing it to use different shared components is a separate migration decision. If an incompatible API or unavailable component prevents faithful representation, identify the affected region and agree on a useful approximation or omission; label it in the story. Do not silently repair the production application.

State which interactions work, which are simulated, and which are absent. A visual-only example must not imply behavioral parity. For an interactive example, retain the relevant event flow and verify it; do not indiscriminately drop handlers. A captured template is evidence about that scenario, not a prediction of every production consequence.

Keep product styles and providers confined to their stories using a mechanism supported by the project. Check theme cleanup, fonts, portals, global selectors, and behavior when switching stories; a scoped wrapper alone is not proof of isolation. Keep fixtures and copied assets outside published library outputs unless their inclusion is intentional.

## Verify the result people will use

Render the selected stories at viewports relevant to the task. Compare against available product evidence under comparable viewport, theme, content, and state conditions. Label differences as observed mismatches, intentional substitutions, or established version differences; a version mismatch alone does not explain a visual difference.

For interaction work, exercise the promised transitions and relevant keyboard/focus behavior. Use the maintained accessibility runner. Attribute findings only after diagnosis; product ownership alone does not justify exclusions or weakening checks. A necessary exception needs a bounded reason and the team's applicable review policy.

Check representative existing system stories before and after introducing product styles/providers, including navigation from product to system stories. Choose examples that could plausibly be affected. Investigate differences rather than treating a screenshot comparison as proof of the cause. Fix introduced leakage within scope and rerun affected checks.

If browser access or product evidence is unavailable, state exactly what was inspected and what remains unverified. Source checks and a successful build cannot establish rendered fidelity or interaction behavior.

Deliver story links with what to inspect, coverage and omissions, library/product revisions, supported behavior, and executed checks. Reuse an existing review surface; create a comparison report when its value warrants it within the request. The person should understand what these examples let them decide.

## Return without losing intentional work

When asked to check currency, compare product structure, content shapes, dependencies, and behaviors with the recorded fixture provenance and current stories. Separate upstream changes from intentional Storybook experiments. Report drift with affected examples and a recommendation; checking does not authorize overwriting them.

When updates are authorized, preserve intentional edits and refresh only the agreed scope. Record new provenance and rerun affected checks. Unclear intent blocks the conflicting change, not independent work. File external issues only when explicitly requested; a list of product-owned regions is not automatically a backlog.

## Origin and validation

This workflow was informed by Brad Frost's [Product to Storybook](https://github.com/bradfrost/skills/tree/main/skills/product-design/product-to-storybook), reviewed on 3 October 2026. It applies product-context representation within Storybook Architect's broader specialist role. It does not require that skill or its companion tools.

This addition has received structural and editorial checks, not a new end-to-end product capture or human-usability evaluation. Do not attribute earlier component or consulting evaluations to this workflow.
