# Full Prompt Master Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Perfect Prompt’s partial hand-written compiler with a faithful browser-safe implementation of the complete cloned Prompt Master capability set while preserving the existing UI shell.

**Architecture:** Keep `app.js` and the current product flow as the presentation layer, but route every generation through a new `prompt-master-runtime/compiler.js`. Decompose Prompt Master into canonical catalogs, intent extraction, classification, profiles, templates, clarification, context, diagnostics, repair, validation, and orchestration modules. Remove the old partial engine from the active path only after parity and golden tests pass.

**Tech Stack:** Vanilla ES modules, browser JavaScript, Node built-in test runner, GitHub Actions, Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-09-05-full-prompt-master-runtime-design.md`

## Global Constraints

- Preserve the current Perfect Prompt UI/body; this is an engine replacement, not a redesign.
- Preserve Prompt Master MIT attribution/license.
- No AI API, database, auth, analytics, cloud prompt storage, or paid dependency.
- All 9 intent dimensions, Templates A–M, and diagnostic patterns 1–37 must be represented in runtime code.
- Primary user intent outranks keywords and target profile.
- Never request hidden chain-of-thought.
- Commit and push completed changes to the connected GitHub repository so linked Vercel production updates.

---

### Task 1: Canonical Prompt Master catalog and parity tests

**Files:**
- Create: `prompt-master-runtime/catalog.js`
- Create: `tests/prompt-master-parity.test.mjs`

**Interfaces:**
- Produces: `INTENT_DIMENSIONS`, `TEMPLATE_CATALOG`, `PATTERN_CATALOG`, `PROFILE_FAMILIES` arrays/objects used by all later modules.

- [ ] **Step 1: Write failing structural parity tests** asserting 9 intent dimensions, template ids A–M, pattern ids 1–37, and the required profile families.
- [ ] **Step 2: Run `npm test`** and verify the new parity tests fail because the runtime catalog does not exist.
- [ ] **Step 3: Implement `catalog.js`** with canonical metadata derived from `SKILL.md`, `references/templates.md`, and `references/patterns.md`.
- [ ] **Step 4: Run `npm test`** and verify structural parity passes without weakening existing tests.
- [ ] **Step 5: Commit** `test/feat: add full Prompt Master runtime catalog`.

### Task 2: Nine-dimension intent extraction and critical-gap logic

**Files:**
- Create: `prompt-master-runtime/intent.js`
- Create: `prompt-master-runtime/clarify.js`
- Modify: `tests/prompt-master-parity.test.mjs`

**Interfaces:**
- Produces: `extractIntent(input)` returning `{task,targetTool,outputFormat,constraints,input,context,audience,successCriteria,examples,idea,goal,priorities}`.
- Produces: `findCriticalGaps(intent)` returning at most 3 blocking clarification objects.

- [ ] Add failing tests for all nine dimensions and max-three clarification behavior.
- [ ] Run tests and confirm failure.
- [ ] Implement normalization/extraction using deterministic text heuristics plus wizard context.
- [ ] Implement blocking-vs-inferable gap rules; target tool is blocking only when the selected output truly depends on a specific tool and no safe generic route exists.
- [ ] Run full tests.
- [ ] Commit.

### Task 3: Primary-task classifier with precedence rules

**Files:**
- Create: `prompt-master-runtime/classifier.js`
- Create: `tests/primary-intent.test.mjs`

**Interfaces:**
- Produces: `classifyPrimaryTask(intent)` returning one of `app`, `code-edit`, `agentic`, `research`, `writing`, `creative`, `visual-generate`, `visual-edit`, `comfyui`, `decompiler`, `general`.

- [ ] Add failing tests proving “build timesheet with deductions” = `app`, “budget app” = `app`, actual research = `research`, image edit ≠ image generate, and file-scoped edit = `code-edit`.
- [ ] Implement weighted task evidence so action verbs/workflow phrases outrank domain nouns such as deductions, calendar, compare, or current.
- [ ] Run full tests and commit.

### Task 4: Complete profile/model routing

**Files:**
- Create: `prompt-master-runtime/profiles.js`
- Create: `tests/profile-routing.test.mjs`

**Interfaces:**
- Produces: `resolveProfile(intent, taskType)` with stable family id, label, durable rules, and `needsCurrentVerification` flag for time-sensitive model specifics.

- [ ] Add failing route coverage tests for General, OpenAI/GPT, OpenAI reasoning, Claude, Claude Code, Codex/Work/IDE, Gemini, Antigravity, Grok, Qwen2.5, Qwen3, Ollama, Llama/Mistral, DeepSeek-R1, MiniMax, Cursor/Windsurf, Cline, visual tools, and ComfyUI.
- [ ] Implement durable prompting guidance from upstream Prompt Master; mark volatile exact-model facts as verification-gated metadata rather than unconditional truth.
- [ ] Run tests and commit.

### Task 5: Templates A–M as runtime renderers

**Files:**
- Create: `prompt-master-runtime/templates.js`
- Create: `tests/templates.test.mjs`

**Interfaces:**
- Produces: `selectTemplate({intent,taskType,profile,diagnosticHints})` and `renderTemplate(templateId, context)`.

- [ ] Add failing tests covering A RTF, B CO-STAR, C RISEN, D CRISPE, E Auditable, F Few-Shot, G File-Scope, H ReAct+Stop, I Visual Descriptor, J Reference Edit, K ComfyUI, L Decompiler, M Claude Task Brief.
- [ ] Implement template selection by task first, profile second; never expose framework names in user-facing prompt output unless explicitly requested.
- [ ] Run tests and commit.

### Task 6: Context/Memory Block and few-shot/splitting decisions

**Files:**
- Create: `prompt-master-runtime/context.js`
- Create: `prompt-master-runtime/strategy.js`
- Create: `tests/context-strategy.test.mjs`

**Interfaces:**
- Produces: `buildContextBlock(intent, sessionContext)`.
- Produces: `chooseStrategy(intent)` returning `{useFewShot, split, splitTasks}`.

- [ ] Add failing tests proving relevant established decisions are retained, unrelated history is omitted, format-critical examples can trigger few-shot, and truly independent tasks trigger splitting.
- [ ] Implement compact context selection and conservative split/few-shot rules from Prompt Master.
- [ ] Run tests and commit.

### Task 7: All 37 diagnostic patterns

**Files:**
- Create: `prompt-master-runtime/diagnostics.js`
- Create: `tests/diagnostics-37.test.mjs`

**Interfaces:**
- Produces: `runDiagnostics(draft, runtimeContext)` returning findings `{id,category,severity,message,repair}`.

- [ ] Generate one failing test per pattern id 1–37 using the upstream bad/fixed behavior as fixtures.
- [ ] Confirm all diagnostic tests fail before implementation.
- [ ] Implement every named rule with stable ids and deterministic detection.
- [ ] Run tests and confirm exactly 37 registered rules and expected findings.
- [ ] Commit.

### Task 8: Deterministic repair pass and final validator

**Files:**
- Create: `prompt-master-runtime/repair.js`
- Create: `prompt-master-runtime/validator.js`
- Create: `tests/repair-validator.test.mjs`

**Interfaces:**
- Produces: `repairDraft(draft, findings, context)`.
- Produces: `validateFinal(prompt, context)` returning `{ok,errors,warnings}`.

- [ ] Add failing tests for wrong research structure on an app, hidden-CoT language, missing explicit feature retention, missing agent stop conditions, invented unrelated features, and template/tool mismatch.
- [ ] Implement deterministic repairs for fixable issues and blocking validation for unresolved contradictions.
- [ ] Require a repair→revalidate cycle before final output.
- [ ] Run tests and commit.

### Task 9: New full compiler orchestration

**Files:**
- Create: `prompt-master-runtime/compiler.js`
- Create: `tests/full-compiler.test.mjs`

**Interfaces:**
- Produces: `compileWithPromptMaster({idea,goal,priorities,target,sessionContext,examples})` returning `{prompt,intent,taskType,profile,template,diagnostics,validation,clarifications}`.

- [ ] Add failing end-to-end compiler tests proving the full pipeline executes in order and no legacy renderer is required.
- [ ] Implement orchestration: extract → gaps → classify → profile → strategy/context → template → draft → diagnostics → repair → validation.
- [ ] Preserve the current UI-compatible result shape where practical.
- [ ] Run tests and commit.

### Task 10: Golden regression suite

**Files:**
- Create: `tests/golden-prompts.test.mjs`

**Interfaces:**
- Consumes: `compileWithPromptMaster`.

- [ ] Add golden tests for complete Timesheet, Drop & Hook Assistant, Budget Flow, research comparison, file edit, coding agent build, professional writing, creative brand task, visual generation, reference edit, ComfyUI, decompiler/adaptation, few-shot format lock, and multi-task split.
- [ ] For the timesheet fixture assert retention of Sunday–Friday weekly view, daily/current-day state, weekly hours, hourly rate, gross pay, deductions, estimated net, holidays, History, Monthly Calendar, local persistence, and explicit exclusion of payroll/team/GPS/employer dashboard.
- [ ] Verify no app fixture gets research/citation output unless research is explicitly requested.
- [ ] Run full tests and commit.

### Task 11: Switch the live UI to the new engine

**Files:**
- Modify: `app.js`
- Modify: existing compiler tests as needed

**Interfaces:**
- `app.js` imports only `compileWithPromptMaster` from `./prompt-master-runtime/compiler.js` for generation.

- [ ] Add/adjust a failing integration test proving `app.js` references the new compiler and not `prompt-engine/compiler.js`.
- [ ] Update the import and generation call while preserving wizard state/result UI.
- [ ] Run all tests.
- [ ] Commit.

### Task 12: Retire legacy partial engine from authority

**Files:**
- Modify or remove active references to `prompt-engine/*`
- Preserve files temporarily only if needed for migration/history; they must not be on the live generation path.
- Modify: `README.md` if compiler architecture is documented there.

- [ ] Add test/static scan confirming live app code has no runtime dependency on legacy partial routing/renderers.
- [ ] Remove obsolete imports and document the new Prompt Master runtime architecture plus MIT attribution.
- [ ] Run full tests and commit.

### Task 13: Production verification

**Files:** none unless verification exposes a defect.

- [ ] Push completed branch and open PR to `main`.
- [ ] Confirm GitHub Actions full suite passes.
- [ ] Merge only after green verification.
- [ ] Confirm Vercel production deployment for the merge SHA reports READY.
- [ ] Fetch live `app.js` and `prompt-master-runtime/compiler.js` to verify production is serving the new engine.
- [ ] Run the complete personal-timesheet brief through the production compiler path and inspect the generated result against the golden expectations.
- [ ] If a defect appears, add a failing regression test first, fix it, rerun, recommit/push, and reverify production.
