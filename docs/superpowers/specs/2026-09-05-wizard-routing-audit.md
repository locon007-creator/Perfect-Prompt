# Perfect Prompt Wizard Routing Audit

## Goal
Make every wizard selection modify the prompt in the correct way without replacing the core task structure.

## Root cause
The third wizard step correctly passes `target` into the Prompt Master compiler, but `templateFor()` currently gives the generic agent template priority over the app template. As a result, an app request + Coding / agent tool becomes an agent-control prompt and loses the richer product workflow/screen/behavior structure.

## Routing principle
Task type owns the base structure. Target selection adds a tool profile/optimization layer.

- App + Auto → app/product structure + best inferred profile.
- App + Agent → app/product structure + agent scope, stop conditions, verification.
- App + Chat → app/product structure optimized for general chat/build instruction; no unnecessary agent-only controls.
- Visual task → visual descriptor structure regardless of target mismatch; target may tune syntax.
- Research task → grounded/auditable structure regardless of target.
- File-scoped code edit → file-scope structure for IDE/agent workflows.
- General agentic coding task that is not an app build → agent task brief.
- Writing → writing structure with target-specific profile layered on top.

## Wizard semantics
Step 1 defines user intent category and should never erase a more specific task type detected from the idea.
Step 2 priorities become constraints/quality modifiers.
Step 3 selects destination/profile only; it must not downgrade the task-specific prompt architecture.

## Verification
Add a routing matrix test covering all Step 3 options against representative app, research, visual, writing, code-edit, and general requests. App + Agent must contain Product Purpose/Idea Lock, Main Workflow, Core Features, interaction rules, agent boundaries, stop conditions, verification, and task-specific Done When criteria.
