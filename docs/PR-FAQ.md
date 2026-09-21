# Storybook Architect — PR/FAQ

Draft product narrative · 21 September 2026

This document describes the customer promise and intended experience. It is draft press-release copy, not a public launch announcement. Evidence and validation limits appear after the product narrative.

## Press release

### Your go-to Storybook specialist, right where you work

**Make sense of your component library, decide what it needs, and turn it into a reference your team and AI agents can use.**

A good Storybook specialist makes the work feel approachable. You can arrive with a specific question or simply say, “Our Storybook needs help.” They look at what you have, understand who needs to use it, explain the choices, and help you move forward. They know when a better example is enough and when the organization, documentation, or contribution process needs attention.

Storybook Architect brings that kind of specialist support into your coding agent. It helps you organize Storybook, decide which components and states to document, clarify when to choose one component over another, and make the library useful to both people and AI agents.

You can start without a plan. Ask, “Can you help us make sense of our Storybook?” The agent explores your existing project, follows a real usage or contribution task, and explains what it finds in plain language. It asks for missing context when that context changes the recommendation. You get a reasoned path forward, with the important decisions made understandable.

When you are ready to make changes, the work can include clearer stories, meaningful loading and error states, better navigation and usage guidance, appropriate checks, or a reliable path for agents to discover your components. Existing conventions and useful tooling provide the starting point. The depth follows your request: a small repair stays focused, while a broader reference project continues through the agreed outcome.

The handoff explains what you can now do, shows relevant examples, and identifies what was checked. Decisions remain where the team can find them. When someone returns to add the next state or document another component, they have a path to continue.

The promise is a Storybook you can understand, use, and maintain—with specialist guidance throughout the work.

## Customer FAQ

### 1. What is Storybook Architect?

It is your go-to Storybook specialist inside a coding agent. You can turn to it for help understanding an existing library, organizing its reference, improving examples and documentation, and making its component knowledge available to agents.

It is delivered as a skill for hosts such as Codex and Claude Code. The agent applies that guidance to your project using the files and tools available to it.

### 2. Who is it for?

People responsible for making a component library useful: developers building with it, maintainers supporting it, and teams helping agents reuse it. The intended experience also welcomes designers and other collaborators bringing questions about component purpose, states, and usage.

You can begin with the problem you are experiencing. You should not need to understand Storybook's configuration or know the name of the feature that might solve it. Evaluations so far have used developer-oriented tasks; designer workflows remain to be tested.

### 3. What if I don't know what is wrong or where to start?

That is a valid starting point. Try:

> Help me understand our Storybook and what would make it more useful to the team.

The agent should first look at the project and follow a representative task, such as finding a field, using its example, or adding an error state. It can then explain whether the obstacle appears to be broken behavior, unclear guidance, missing examples, difficult discovery, or something else.

You should receive a recommendation with reasons. If an important choice depends on information the project cannot supply, the agent asks a focused question and helps you understand the tradeoff. You do not have to diagnose the problem for it.

### 4. What kinds of work can it help with?

| Your question | How it should help |
|---|---|
| “How should we organize this?” | Understand the audience and component relationships, then recommend useful naming, grouping, navigation, and documentation structure. |
| “What belongs in our Storybook?” | Choose meaningful component and composition examples, including the states people need to understand or check. |
| “Which component should I use?” | Explain the actual contracts and when to choose one alternative over another. |
| “How do we make these examples useful?” | Improve realistic content, loading/error/recovery states, usage advice, and relevant behavior checks. |
| “How should we maintain this?” | Clarify contribution, ownership, lifecycle, and review conventions using the team's existing process. |
| “How can our agents use the library?” | Examine what component knowledge is available, improve its discoverability, and verify the supported retrieval path. |

These are starting points for a conversation. The work follows your project's needs.

### 5. How do I invoke it?

With the skill installed and the project open, enter a chat prompt:

**Codex**

```text
$storybook-architect Help us make our Storybook useful to new contributors.
```

**Claude Code**

```text
/storybook-architect Help me understand how we should organize this library.
```

For a precise task, ask directly:

> Add a story showing what happens when saving fails.

Invoking just the skill name starts a small, read-only orientation and suggests useful next steps. Natural-language selection depends on the host; naming the skill explicitly makes your intention clear. These are conversation prompts. See the [installation guide](../README.md#install) for setup.

### 6. Will it only advise, or will it do the work?

It can do both, according to your request. A review produces findings and recommendations. A request to implement includes making the authorized changes and checking the result with the available tools.

A specific story repair should proceed directly. Broader work should have a clear outcome and useful checkpoints, so you can understand progress without managing every technical step. One working example completes a one-example request; it does not silently complete a larger library-reference project.

### 7. What if we already have a well-established setup?

It starts by understanding what already works: your story conventions, component registry, tests, documentation, and ownership decisions. Those assets should make the work easier.

The right result may be a small correction, a clearer explanation, or preserving an intentional difference. Existing policies should not be replaced simply because the skill carries another example convention. Returning work should recover prior decisions and respect work you stopped or deferred.

### 8. Do I need to understand manifests, MCP, or testing addons?

You can describe the outcome you need—for example, “Help our agents use the right components.” The agent should inspect the available setup, explain relevant choices in plain language, and use the simplest sufficient approach.

The requirement depends on the task and existing setup. Source files and published documentation can answer many questions. Built manifests can provide structured component knowledge without a live MCP connection.

Some previews and tools require a running server; other project checks do not. The skill should use your existing runner and available connections. A manual accessibility-addon setting alone does not establish that automated accessibility tests are missing.

### 9. How does it help both humans and agents use the same library?

People need to find the right component, understand its purpose, and see how it behaves. Agents need accurate descriptions, public APIs, examples, and import guidance. Both benefit when those answers come from maintained source and documentation.

Storybook Architect helps connect those paths. For example, when a docs page looks complete but an agent still gets the props wrong, it can compare the actual agent-facing output with the component source and investigate the mismatch. That is one part of making the reference useful, alongside organization, component choice, examples, and maintenance.

### 10. What does a good result look like?

You understand what was recommended and why. The agreed work is delivered, with examples you can inspect and checks whose scope is clear. A teammate can find the relevant guidance and see what to do next.

For a broader reference project, the finish line can include using a component, adapting its documented options, and adding another state through the contribution path. The result should explain what remains incomplete or unverified. A green build alone cannot establish that someone can use the library successfully.

### 11. How does it fit with our team's judgment and other design-system work?

It supplies specialist guidance and hands-on assistance for Storybook structure, examples, documentation, supported checks, discoverability, and maintenance. Your team retains ownership of shared policy, design direction, and releases.

Visual redesign is outside its core scope. It should preserve working conventions and recommend changes when consumer needs justify them. A raw value is not automatically a missing token, and adding a second theme does not require every property to gain another alias.

When broader work needs another specialist, the handoff should carry the context already gathered. You should not have to repeat the conversation.

### 12. What should I trust, and what should I review?

Expect explanations supported by source, examples, and checks. The skill distinguishes confirmed findings, candidates needing review, and things not checked. It should say when it does not know.

Agent judgment can still be wrong. Documentation may omit something a particular consumer needs, and automated checks do not establish complete accessibility. Review consequential decisions and the actual behavior relevant to your task. The current examples target Storybook 10.6; support must be checked in your project's framework and version.

If Storybook is absent, the agent should explain the situation and recommend a useful next step. Installation is a scope decision. Ongoing maintenance resumes when someone invokes the skill or separately configures automation.

### 13. What happens to our source code?

The agent needs access to the files and tools required for the task. Data handling follows the agent host and any connected services you use. This skill does not define a separate hosting, retention, or confidentiality policy.

It also does not grant permission to publish code or send messages to other people. Those actions remain subject to the user's request and the host's controls.

## Internal FAQ

### 1. What is the central product promise?

A person can arrive with a Storybook question—even an unclear one—and receive the judgment, guidance, and follow-through they would seek from a thoughtful specialist.

The experience should take them from “I need help with this library” to an understood problem, a useful decision, completed work within scope, and a path for the next contribution. The product narrative should remain about that relationship and outcome as individual features change.

### 2. What makes it feel like a good specialist?

It is curious about the person's actual difficulty, takes the initiative to inspect the project, explains choices without overwhelming them, and offers a recommendation instead of handing back a menu of technical categories. It remembers existing decisions through project records and follows through on the agreed outcome.

Expertise includes knowing what to check and when to ask. The human-specialist analogy describes the quality of the interaction; it does not promise exhaustive knowledge, infallible diagnosis, or autonomous authority over the team's decisions.

### 3. Why a skill when Storybook already has documentation and agent tools?

Storybook supplies examples, metadata, previews, and tools. The skill supplies guidance for choosing and checking the work: which evidence matters, when existing tooling is sufficient, how to keep the task bounded, and how to explain the result to a person.

That value must be demonstrated through better task outcomes. Repackaging official instructions or duplicating an existing scanner is insufficient differentiation.

### 4. What should the experience avoid?

An intake questionnaire before looking at the project; an unexplained pile of findings; a forced technical setup for a simple question; repeated requests to continue already-authorized work; or a confident declaration of completion after the first successful example of a broader task.

It should also avoid turning every conversation into a formal engagement. A person asking for one story should get focused help with that story. The same specialist judgment determines when deeper diagnosis is worthwhile.

### 5. How do we know whether the promise is working?

Observe the whole customer task: can a first-time user get help without knowing the internal process, make a sound choice, use the result, and return to continue? Record where they needed clarification, intervention, or correction. Test experienced contributors, novices, and intended non-engineering users separately.

Then inspect the supporting evidence: actual component behavior, preserved scope, accurate claims, useful documentation, and whether the next contributor can find the decisions. Quantitative comparisons and failure criteria belong in the validation plan below. They support the customer promise; they do not define the product's personality.

### 6. What is demonstrated today, and what remains an ambition?

Current evaluations show bounded technical and contributor tasks, including diagnosis, a focused story repair, and continuation from existing decisions. They do not establish the full specialist experience across real teams or prove human usability.

The evidence record below retains unsuccessful behavior and untested claims. The next validation should include people arriving with unclear needs, using the delivered reference, and returning for another contribution. Improved instructions are a change to the product; whether people experience better guidance still needs observation.

## Evidence and validation notes

These notes support the product promise. They are not launch claims, customer testimonials, or a substitute for the customer experience.

### Current evidence

The [September 18 evaluation](../storybook-architect/references/evaluation-2026-09-18.md) records bounded integration checks against a real Storybook project. The [September 21 evaluation](../storybook-architect/references/evaluation-2026-09-21.md) records independent fixture-based agent tasks covering manifest interpretation, novice guidance, accessibility-runner interpretation, and a narrow story fix.

In that September 21 guidance evaluation, the story fix passed three React server-rendering checks after the edit. No pre-edit failing run was observed. That run establishes the post-edit result, not an observed fail-to-pass change or the skill's contribution relative to another approach.

The skill does not eliminate diagnostic overstatement. One manifest response named extraction failure before its cause was established. After the reference was sharpened, a fresh reviewer kept the cause unresolved—but reported reading only `SKILL.md`, not the sharpened reference. The improved answer cannot be attributed to that edit. More detailed instructions may not be consulted at all.

The later [consulting evaluation](../storybook-architect/references/evaluation-consulting-2026-09-21.md) is separate. It did record failing baselines for a narrow story repair and a returning contributor task, followed by passing checks. It also demonstrated diagnosis of a broken public import despite a passing existing test. Its returning agent preserved seeded decisions and completed work for both components, but left a stale “Remaining” label above a completion record. No further contributor tested that newly written handoff.

These are synthetic agent tasks plus bounded earlier integration checks. They do not establish a success rate, human usability, lower context cost, fresh-session invocation in both hosts, or superiority over the previous skill or a general coding agent.

### Proposed evaluation measures

**Proposed pilot decision rules—not measured results or an approved release policy:** compare the skill with the team's current workflow on matched tasks, using the same model, tools, project revision, and acceptance criteria. Include component selection, API use, state documentation, diagnosis, narrow repair, and returning contribution. Record people and agents separately.

| Measure | Definition | Proposed threshold or stop rule |
|---|---|---|
| Critical errors | Unsupported verification or consequential causal claims, unauthorized changes, or ignored explicit deferrals. | Target **0**. One occurrence pauses expansion of the affected workflow until investigation and a fresh retest. |
| Verified task completion | Tasks meeting their predeclared consumer acceptance criteria, including full requested scope, without manual rescue. | At least the baseline count in each matched task category. A lower count pauses expansion pending diagnosis. Report rescues separately. |
| Human correction effort | Median reviewer time needed to reach an acceptable result, on matched successful tasks. | Claim reduced effort only if the median falls without worse correctness. An increase with no completion benefit is a reason to revise the workflow. |
| Context and execution cost | Input tokens, elapsed time, and tool calls per matched task, including reference loading. | A higher median without better completion or lower correction effort triggers trimming or better routing before expansion. No cost saving is claimed today. |

These are cautious pilot rules, not statistical proof of reliability. Preserve failures and uncertain results; a subsequent clean run does not erase them. Equal outcomes do not establish differentiation. Story counts, prose volume, and scanner totals are not substitutes for consumer outcomes.

### Failure risks to investigate

- The agent keeps turning observed mismatches into unsupported causal diagnoses.
- It fails to load the skill or skips the reference containing the consequential instruction.
- Added guidance consumes more context and review time without improving task completion. References grew in these revisions; that cost has not been measured.
- A broad request ends after one successful example, or a narrow repair expands into an unnecessary engagement.
- Documentation appears complete but omits a specific consumer's constraints, or a returning contributor cannot find and apply the decisions.
- Users must repeatedly correct the agent to preserve scope, run checks, or report limits honestly.

These failures call for investigating the actual execution path, simplifying or rerouting instructions, and sometimes retaining the team's existing workflow. Adding more prose is not automatically a remedy. Persistent critical errors should block expansion of the affected use case, even when package validation passes.
