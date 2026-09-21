# Diagnose, deliver, and continue Storybook work

Use for uncertain problems, broad reference work, or returning contributions. Match the depth to the decision. A small settled repair can express its goal, check, and result in a few sentences. These are agent practices, not new commands, required document names, or a prerequisite for every story edit.

## Find the problem behind the request

Recover the user's intended outcome and constraints. Read the existing task, relevant project instructions, component source, examples, and checks before asking for technical facts. Follow a concrete task: find a component, choose a variant, recover from an error, or add a missing state.

“Our Storybook is a mess” can describe different problems:

| Possible obstacle | Evidence to inspect |
|---|---|
| Broken rendering | Reproduce the affected story; inspect providers, fixtures, and runtime errors. |
| Unusable examples | Try the consumer task with representative content and constraints. |
| Incorrect API guidance | Compare documented imports and props with the package/source actually used. |
| Missing states | Follow a relevant loading, empty, error, permission, or recovery scenario. |
| Poor discovery | Start where a contributor starts and try to find the appropriate component and example. |
| Unclear ownership | Inspect contribution and decision records; identify who resolves a shared change. |
| Agent-retrieval failure | Compare source, resolved metadata, and the actual tool response where available. |

Treat these as possible explanations, not a mandatory seven-part audit. Distinguish repository observations, executed runtime checks, team reports, and hypotheses. A green build cannot disprove a contributor's discovery problem. Similar examples may serve different contracts; verify that before proposing consolidation.

Ask only for missing information that changes the intervention: a recent blocked task, who was affected, what should become easier, or a compatibility/ownership decision not recorded in the project. Do not make the user classify the problem first. If they are unsure, recommend the next bounded observation and explain what it will decide. An unknown blocks only dependent work.

Explain the connection from reported problem to observation, plausible cause, affected people, and recommended action. Check a competing explanation before a consequential recommendation. Guidance, ownership clarification, preserving a justified difference, or further investigation may be better than code changes. Leave causes unresolved when evidence does not establish them.

## Make the recommendation useful

Meet the person at their level of familiarity. Explain a component choice in terms of the task it supports, and an organizational choice in terms of what someone can find or understand. Introduce a technical term only when it helps them act. When context is sufficient, recommend a direction rather than asking the person to choose an internal workflow. If they are unsure, offer a concrete example to make the choice understandable.

For organization, trace a real discovery path and compare confusable components before proposing categories. For component selection, compare the actual interaction, content, accessibility obligations, and composition constraints; similar names or appearances are not enough. Preserve intentional differences. These questions may need an explanation or an example rather than a defect report or a new tool.

Keep the customer goal stable as evidence changes. A recent bug, successful check, or newly available integration can inform the recommendation; it should not displace the person’s broader reason for coming. Apply the same discipline when describing the skill: explain whom it helps and what becomes possible, with recent fixes and evaluation details as supporting evidence.

## Keep the whole outcome visible

Adapt these fields to the existing conversation, issue, or plan; omit fields that add no value to a small task:

- **Outcome:** who needs to do what successfully, and what prompted this work.
- **Evidence and diagnosis:** observed gap, scope, alternative explanation, and missing evidence.
- **Recommendation:** intervention and why it addresses that gap.
- **Delivery scope:** all requested deliverables, preserved behavior, explicit exclusions, and shared decisions needing an owner.
- **First checkpoint:** what will be demonstrated first and what remains afterward.
- **Finish and continuation:** checks establishing completion, where decisions live, and how the next contributor finds them.

For example, making a reference usable for forms and overlays might begin with one recovery story. That proves the approach for one case; it does not finish documentation and contribution guidance for both areas. Keep a short list of agreed deliverables and continue after the checkpoint. A request only to diagnose the problem ends with a supported recommendation.

Keep updates compact: the goal, work completed, current action, next checkpoint, and any blocker are enough. Update when evidence or scope changes. Do not introduce percentages, dashboards, mandatory presentations, or repeated approval ceremonies.

Existing authorization carries through its scope. Respect stopped or deferred work while continuing independent authorized work. Findings do not authorize wider migrations, publication, or changes to unrelated product code. If a necessary action exceeds the boundary, explain that decision and continue what is possible inside it.

## Prove use and maintenance

Choose checks from the requested outcome, using maintained project tooling and the installed version's actual capabilities. For a broad request for a usable, maintainable library reference, demonstrate the relevant paths:

1. **Use:** find the right component from the normal entry point, follow its import/usage guidance, and exercise the requested states or interactions.
2. **Adapt:** follow a documented public option, fixture/provider setting, or supported theme setup. Verify the example still represents the real component without copying its implementation or inventing props.
3. **Extend:** add a relevant story/state through the documented contribution path and run the applicable checks. Keep this within the authorized Storybook scope.

These are acceptance paths, not a mandate to redesign components or create new themes. Use isolated or reversible probes where needed and remove demonstration-only changes. Check every agreed deliverable; a sampled example does not prove full coverage. Name unrun or failed checks and what they prevent claiming. Do not substitute an isolated story for a requested production-consumer check.

## Leave a path for the next contributor

Update the existing usage guide, contribution instructions, decision record, or task with consequential choices and their rationale. Preserve the team's named owner, or identify ownership as unresolved. Link from the entry point contributors already use; a hidden document is not a working handoff. Record remaining work, the next action, and any stop/defer reason or trigger for revisiting it. Do not imply background follow-up.

For broad enablement, test a realistic follow-on task in fresh context when available: start at the normal repository entry point without supplying the decision's location or answer. Observe whether the participant finds and applies it. Record whether the participant was a person or an agent. Agent success is not a human usability study; one success is not a reliability rate. If unavailable, report that limit instead of certifying independent use. Ordinary repairs need only the relevant link and decision checks.

When another specialist is needed, check availability and carry the goal, owning package, versions, authorization, evidence, decisions, and acceptance criteria into the handoff. Do not make the person repeat discovery. Inspect the returned work and integrate its evidence and limits before reporting completion. Storybook remains responsible for structure, examples, documentation, supported checks, discoverability, and maintenance; wider product or design-system work requires its own scope.
