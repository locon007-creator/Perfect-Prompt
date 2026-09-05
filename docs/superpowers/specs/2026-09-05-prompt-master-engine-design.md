# Perfect Prompt — Prompt Master Engine Integration

## Goal
Make the cloned Prompt Master knowledge the actual deterministic compiler behind the live Perfect Prompt web app, while preserving the current three-step UI and privacy-first browser-only architecture.

## Architecture
The compiler is split into focused browser modules: intent extraction, task/tool routing, template selection, diagnostics, and final rendering. `app.js` remains the UI controller and calls one compiler API rather than containing prompt-engine logic.

## Compiler Pipeline
1. Normalize the user's idea and wizard choices.
2. Extract the nine Prompt Master intent dimensions: task, target tool, output format, constraints, input, context, audience, success criteria, examples.
3. Classify task type: app/product, code edit/debug, agentic build, research/analysis, writing/business, visual generation/editing, prompt adaptation, or general.
4. Resolve target profile from explicit wizard choice and text signals. Profiles must distinguish general chat, OpenAI/ChatGPT, Claude, Gemini, Grok, coding agents, Cursor/Windsurf-style IDE tools, and image/video tools. If no specific product is known, use a durable family-level route and do not invent current model details.
5. Select the smallest suitable Prompt Master template: RTF, CO-STAR, RISEN, Auditable Reasoning, File-Scope, Agent + Stop Conditions, Visual Descriptor, Prompt Decompiler, or Current Claude Task Brief.
6. Run diagnostics based on the 37 failure patterns. The compiler must correct high-confidence defects such as vague verbs, missing success criteria, absent output format, missing scope/stop conditions for agents, hidden-chain-of-thought requests, and missing grounding rules for factual work.
7. Render one paste-ready prompt optimized for the resolved tool/profile.
8. Preserve the user's intent and explicit constraints. Never broaden the product or introduce unrelated features.

## Reliability Rules
- Never request hidden chain-of-thought. Ask for conclusions, assumptions, evidence, concise rationale, and verification instead.
- No more than three clarification needs may be surfaced; because this app is deterministic, unresolved non-critical fields are inferred conservatively and critical ambiguity is represented in the generated prompt as an explicit ask-before-action condition.
- Agentic prompts require scope, allowed/forbidden actions, verification, stop conditions, and done criteria.
- Code-edit prompts prefer exact file/function scope when supplied and must include a do-not-touch boundary.
- Factual/research prompts require evidence/citation/uncertainty rules.
- Visual prompts require subject, setting/style/composition fields where inferable and explicit exclusions/negative constraints.
- Prompt-adaptation requests preserve intent while changing tool-specific structure.
- App-building prompts use Idea Lock and contamination prevention as Perfect Prompt extensions on top of Prompt Master.

## UI Integration
The existing Home → 3-step Wizard → Result flow remains. The final wizard step's target choice influences routing. The Result screen receives compiler output plus a compact target label. No new dashboard, backend, authentication, database, or AI API is introduced.

## Privacy
All analysis and compilation happen in-browser. No prompt text is logged, persisted publicly, or sent to an external model.

## Testing
Use Node's built-in test runner. Tests must cover nine-dimension extraction, tool/profile routing, template selection, diagnostics, agent stop conditions, research grounding, visual formatting, app Idea Lock, prompt adaptation, and deterministic output stability.

## Acceptance Criteria
- `app.js` no longer owns core compilation logic.
- One exported compiler function accepts idea + wizard state and returns a paste-ready prompt and metadata.
- At least eight task/template routes are exercised by tests.
- Agentic output includes stop conditions and verification boundaries.
- Research output includes grounding/citation uncertainty rules.
- App output retains Idea Lock and contamination prevention.
- Hidden chain-of-thought instructions are removed/replaced.
- Existing UI/product tests continue to pass.
- GitHub Actions and Vercel build are green before merge to `main`.