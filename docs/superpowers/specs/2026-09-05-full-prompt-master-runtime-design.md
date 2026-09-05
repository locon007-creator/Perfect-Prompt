# Full Prompt Master Runtime Replacement — Design

## Goal
Keep the existing Perfect Prompt product shell and user experience, but replace the current partial hand-written compiler with a browser-safe runtime that faithfully implements the complete cloned Prompt Master behavior as the authoritative prompt engine.

## Source of truth
The runtime must be derived from the cloned/upstream Prompt Master materials already present in the project and its MIT-licensed source: `SKILL.md`, `references/patterns.md`, and `references/templates.md`. Preserve MIT attribution and do not remove the upstream license notice.

## Non-goals
- Do not redesign Perfect Prompt’s UI.
- Do not add an AI API, database, auth, analytics, cloud prompt storage, or paid dependency.
- Do not keep timesheet-, budget-, trucking-, recipe-, or other product-specific compiler hacks as authoritative routing logic.
- Do not require hidden chain-of-thought from target models.

## Architecture

### 1. UI shell remains unchanged
The existing Home → Wizard → Result experience remains the presentation layer. Wizard selections are input signals only; they may refine intent but must not override stronger primary-task evidence.

### 2. Prompt Master becomes the only compiler authority
The runtime pipeline becomes:

`User idea + wizard context → normalize → 9-dimension intent extraction → critical-gap analysis → primary task classification → target/model routing → template/technique selection → context/memory assembly → draft render → 37-pattern diagnostics → repair pass → final validation → one paste-ready prompt`

No older partial router/renderer may bypass this pipeline.

### 3. Nine intent dimensions
The runtime must represent all Prompt Master intent dimensions:
1. Task
2. Target tool
3. Output format
4. Constraints
5. Input
6. Context
7. Audience
8. Success criteria
9. Examples

Missing critical dimensions may create at most three clarification questions. In the current Perfect Prompt one-pass UI, non-critical gaps should be inferred conservatively; only genuinely blocking gaps should surface as clarification requirements.

### 4. Primary-intent precedence
Primary task intent outranks keywords, secondary domain concepts, and target profile. Example: “build a timesheet with deductions” remains an app/product build; “deductions” must not route it to research. Tool choice adapts the prompt architecture but does not replace the task architecture.

### 5. Full template library
Implement Prompt Master Templates A–M as runtime-selectable structures:
- A RTF
- B CO-STAR
- C RISEN
- D CRISPE
- E Auditable Reasoning
- F Few-Shot
- G File-Scope
- H ReAct + Stop Conditions
- I Visual Descriptor
- J Reference Image Editing
- K ComfyUI
- L Prompt Decompiler
- M Current Claude Task Brief

Framework names stay internal unless the user asks for them.

### 6. Full tool/model routing
Represent all durable Prompt Master routes described in `SKILL.md`, including at minimum:
- General AI
- ChatGPT/OpenAI GPT models
- OpenAI reasoning models
- Claude consumer/API/current models
- Claude Code
- Codex/ChatGPT Work/Codex IDE
- Gemini
- Antigravity
- Grok/xAI
- Qwen 2.5
- Qwen3 thinking/non-thinking
- Ollama
- Llama/Mistral/open-weight LLMs
- DeepSeek-R1
- MiniMax
- Cursor/Windsurf
- Cline
- Visual-generation routes
- Image-editing routes
- ComfyUI

Model-specific claims that are inherently time-sensitive must be marked as requiring current verification rather than hard-coded as eternal truth.

### 7. Full 37-pattern diagnostic engine
Implement every pattern in `references/patterns.md` as a named runtime rule with:
- stable id 1–37
- category
- detection predicate
- severity
- repair action or routing consequence

Diagnostics run after drafting and before final output. A repair pass must correct detectable problems automatically. Blocking contradictions must prevent finalization until resolved.

### 8. Context and Memory Block behavior
When prior project decisions materially matter, the engine should assemble a compact Memory/Context block so the generated prompt does not rely on invisible inter-session knowledge. It must include only relevant established decisions, not unrelated history.

### 9. Few-shot and prompt-splitting behavior
Use Few-Shot only when examples materially improve format/pattern reliability. If one prompt truly contains multiple independent tasks or exceeds a reliable single-prompt scope, use Prompt Master’s split/decompiler behavior rather than stuffing everything into one generic prompt. Preserve Perfect Prompt’s preference for concise, paste-ready output.

### 10. Agentic safety and completion rules
Agent routes must include starting state, target state, scope boundaries, allowed/forbidden actions, stop conditions, human review triggers, verification evidence, and Done/acceptance criteria when the upstream Prompt Master route calls for them.

### 11. Visual and editing distinction
Generation and editing are separate routes. Image editing must preserve reference-image constraints instead of redescribing the scene from scratch. ComfyUI requires checkpoint-aware handling.

### 12. Final validator
Before output, validate:
- task/template alignment
- target/tool alignment
- all critical explicit user requirements retained
- no contradictory instructions
- no hidden-CoT request
- no accidental research/citation contract on non-research tasks
- no unrelated feature invention
- required output contract present
- required Done/verification rules present for complex/agentic tasks
- diagnostic blockers resolved

If validation fails, repair and revalidate before showing the prompt.

## Runtime module boundaries
Create focused browser-native ES modules:
- `prompt-master-runtime/catalog.js` — canonical template/profile/pattern metadata
- `prompt-master-runtime/intent.js` — normalization + nine-dimension extraction
- `prompt-master-runtime/classifier.js` — primary-task classification
- `prompt-master-runtime/profiles.js` — complete target/model route rules
- `prompt-master-runtime/templates.js` — A–M render structures
- `prompt-master-runtime/clarify.js` — critical-gap/max-3 logic
- `prompt-master-runtime/context.js` — memory/context assembly
- `prompt-master-runtime/diagnostics.js` — all 37 pattern rules
- `prompt-master-runtime/repair.js` — deterministic repair actions
- `prompt-master-runtime/validator.js` — final alignment/coverage validation
- `prompt-master-runtime/compiler.js` — single public orchestration entry point

`app.js` must call only the new compiler entry point for generated prompts.

## Compatibility
Keep the current compile result shape where practical (`prompt`, `intent`, route/template metadata) so UI wiring changes stay minimal. Existing saved local UI state must continue to work.

## Test strategy
TDD and parity tests are mandatory.

### Structural parity
Tests must prove:
- all nine intent dimensions exist
- templates A–M are registered
- diagnostics 1–37 are registered
- expected model/tool route families are represented
- final validator and repair pass execute

### Golden prompt fixtures
At minimum:
1. Complete personal timesheet — app build with weekly/history/calendar/rate/deductions/holidays; must never become research.
2. Drop & Hook Assistant — exact workflow retention; no fleet/ELD/dashboard contamination.
3. Budget Flow — simple app workflow; no finance-analysis routing.
4. Research comparison — auditable/cited research structure.
5. File-scoped code edit — exact file/function constraints.
6. General coding agent build — agent boundaries and verification.
7. Professional writing — CO-STAR-style behavior.
8. Creative brand task — CRISPE-style behavior.
9. Visual generation — descriptor route.
10. Reference image edit — editing route, not generation.
11. ComfyUI — checkpoint gap handling.
12. Prompt adaptation/decompiler — source/target preservation.
13. Few-shot format-lock case.
14. Multi-task prompt that must split.

### Anti-regression
The current routing, duplicate-cleanup, and conservative inference tests remain passing unless superseded by stronger full-engine tests.

## Deployment acceptance
- Full test suite passes on GitHub Actions.
- Changes are committed and pushed to the connected GitHub repository.
- Vercel production deploys from the resulting `main` commit and reports READY.
- Live production assets confirm `app.js` uses `prompt-master-runtime/compiler.js` and the old partial compiler is no longer the active authority.
- Run the complete timesheet brief through the production compiler and inspect the final generated prompt for correct app routing, weekly behavior, deductions/rate/holidays retention, local persistence, anti-payroll scope, and agent/tool adaptation.
