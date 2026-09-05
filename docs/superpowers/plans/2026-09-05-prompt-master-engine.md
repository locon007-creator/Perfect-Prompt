# Prompt Master Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simplified live compiler with a deterministic Prompt Master-based engine while preserving the existing Perfect Prompt UI.

**Architecture:** Add focused ES modules for intent extraction, routing/templates, diagnostics, and prompt rendering. `app.js` imports one `compilePerfectPrompt()` API. The engine remains browser-only and zero-dependency.

**Tech Stack:** Vanilla HTML/CSS/ES modules, Node built-in `node:test`, GitHub Actions, Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-09-05-prompt-master-engine-design.md`

## Global Constraints
- No backend, database, authentication, analytics, or external AI API.
- Preserve the current Home → 3-step Wizard → Result flow.
- Keep prompt contents private/local.
- Never request hidden chain-of-thought.
- Preserve Idea Lock and contamination prevention for app-building prompts.
- Commit and push completed work so the connected Vercel project updates.

---

### Task 1: Define compiler behavior with failing tests

**Files:**
- Create: `tests/compiler.test.mjs`

**Interfaces:**
- Consumes: future `compilePerfectPrompt(input)` from `prompt-engine/compiler.js`
- Produces: regression contract for all compiler routes

- [ ] Write tests for nine intent dimensions, route/template selection, agent stop conditions, research grounding, visual formatting, app Idea Lock, prompt adaptation, CoT sanitization, and deterministic output.
- [ ] Run `node --test tests/*.test.mjs` and verify the new compiler tests fail because the module does not exist.
- [ ] Commit tests.

### Task 2: Build intent extraction and diagnostics

**Files:**
- Create: `prompt-engine/intent.js`
- Create: `prompt-engine/diagnostics.js`
- Test: `tests/compiler.test.mjs`

**Interfaces:**
- `extractIntent({idea, goal, priorities, target}) -> IntentProfile`
- `diagnose(intent) -> Diagnostic[]`
- `sanitizeReasoningRequests(text) -> string`

- [ ] Implement deterministic extraction for task, target tool, output format, constraints, input, context, audience, success criteria, and examples.
- [ ] Implement high-confidence Prompt Master failure-pattern diagnostics.
- [ ] Replace hidden-chain-of-thought wording with concise rationale/evidence/verification wording.
- [ ] Run tests and keep existing product tests green.
- [ ] Commit.

### Task 3: Build task/tool routing and template selection

**Files:**
- Create: `prompt-engine/router.js`
- Create: `prompt-engine/profiles.js`
- Test: `tests/compiler.test.mjs`

**Interfaces:**
- `routePrompt(intent) -> {taskType, profile, template}`
- Profiles: `general`, `openai`, `claude`, `gemini`, `grok`, `agent`, `ide`, `visual`
- Templates: `rtf`, `costar`, `risen`, `auditable`, `file-scope`, `agent-stop`, `visual`, `decompiler`, `claude-task-brief`

- [ ] Add text-signal routing for explicit tool names and durable family-level fallback.
- [ ] Map task types to the smallest suitable Prompt Master template.
- [ ] Ensure agent/IDE routes require scope and stop behavior.
- [ ] Run tests.
- [ ] Commit.

### Task 4: Build final compiler/renderers

**Files:**
- Create: `prompt-engine/renderers.js`
- Create: `prompt-engine/compiler.js`
- Test: `tests/compiler.test.mjs`

**Interfaces:**
- `compilePerfectPrompt({idea, goal, priorities, target}) -> {prompt, targetLabel, template, diagnostics, intent}`

- [ ] Render app/product prompts with Idea Lock, user, workflow, features, constraints, interaction rules, and Done criteria.
- [ ] Render agent prompts with Starting State, Target State, Allowed/Forbidden Actions, Stop Conditions, verification, and Done criteria.
- [ ] Render IDE edits with file/function scope and do-not-touch rules when supplied.
- [ ] Render research prompts with assumptions, evidence, citations, uncertainty, and verification.
- [ ] Render writing prompts with CO-STAR-style audience/tone/output controls.
- [ ] Render visual prompts with subject/style/lighting/composition/aspect/exclusions.
- [ ] Render prompt adaptation/decompiler prompts that preserve intent across tools.
- [ ] Run full tests.
- [ ] Commit.

### Task 5: Wire engine into the live UI

**Files:**
- Modify: `app.js`
- Test: `tests/compiler.test.mjs`, `tests/product.test.mjs`

**Interfaces:**
- Replace local `compilePrompt()` implementation with imported `compilePerfectPrompt()`.
- Result metadata uses `targetLabel` without changing the primary workflow.

- [ ] Import compiler module.
- [ ] Replace simplified compilation call.
- [ ] Keep Refine behavior and local state intact.
- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Commit.

### Task 6: Verify and release

**Files:** no new production files expected.

- [ ] Confirm GitHub Actions succeeds on the feature branch.
- [ ] Confirm Vercel preview build is READY with no build errors.
- [ ] Open PR to `main` and merge after checks are green.
- [ ] Confirm production Vercel deployment source is GitHub `main` and state is READY.
- [ ] Fetch the production page to confirm the new ES module graph is served successfully.