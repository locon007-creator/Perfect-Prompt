# Perfect Prompt Commercial Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a premium, sellable, mobile-first Perfect Prompt web app that turns rough ideas into production-ready prompts through a compact wizard.

**Architecture:** Static, Vercel-friendly HTML/CSS/JavaScript with a deterministic in-browser prompt compiler. The UI is state-driven (Home, Wizard, Generating, Result, menu destinations); no database, authentication, analytics, or server-side prompt storage.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, browser localStorage/Clipboard API, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-09-05-perfect-prompt-wizard-design.md`

## Global Constraints
- Mobile-first target: 360–430 CSS px portrait; desktop must scale cleanly.
- Home must stay compact and must not become a dashboard.
- Wizard uses no more than 4 focused stages.
- Generated prompt contents stay local by default and are not logged or persisted publicly.
- System / Light / Dark theme must persist locally.
- Prompt Ideas and Prompt Templates must be functional and load into the generator.
- Preserve the cloned Prompt Master license and knowledge files.
- No backend, auth, analytics, billing, notifications, or cloud history in this release.

---

### Task 1: Commercial App Shell and Visual System

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `vercel.json`

**Interfaces:**
- Produces DOM IDs consumed by `app.js`: `app`, `screen`, `menuButton`, `menuSheet`, `toast`.

- [ ] Build semantic single-page shell with top brand bar, menu sheet, main screen container, and toast region.
- [ ] Implement responsive design tokens, deep navy dark theme, clean light theme, 44px+ touch targets, subtle motion, safe-area handling, and 360/390/430px support.
- [ ] Add `vercel.json` for static clean routing.
- [ ] Verify there is no dashboard grid, persistent bottom navigation, or unnecessary decorative UI.

### Task 2: State-Driven Wizard and Libraries

**Files:**
- Modify: `app.js`

**Interfaces:**
- Produces `state`, `render()`, `goTo(screen)`, `loadStarter(text)`, and local theme preference.

- [ ] Implement Home with idea textarea, Generate Prompt CTA, and three restrained smart starters.
- [ ] Implement 3-step wizard: prompt goal, priorities/constraints, target/output preference; infer defaults when user skips optional choices.
- [ ] Preserve input across Back/Next transitions.
- [ ] Implement burger sheet destinations: Prompt Ideas, Prompt Templates, Settings, About.
- [ ] Add categorized practical ideas (Productivity, Utility, Finance, Personal, Work, Health, Tracking) and distinct structured templates.
- [ ] Make every idea/template load directly into Home and retain selected text.

### Task 3: Deterministic Prompt Compiler

**Files:**
- Modify: `app.js`

**Interfaces:**
- Produces `compilePrompt(state): string`.

- [ ] Classify likely request type from the idea (app build, coding change, writing/content, research/analysis, image/video, general task).
- [ ] Extract user intent, target, constraints, output form, success criteria, and relevant context without inventing a different product.
- [ ] For app-building requests, emit: Objective, Product Lock, Target User, Main Workflow, Core Features, Experience/UI, Technical Constraints, Interaction Rules, Done When.
- [ ] For general requests, emit a compact Goal / Context / Requirements / Output / Done structure.
- [ ] Remove vague filler and duplicated requirements; never expose internal framework names.
- [ ] Keep generated content only in memory until user explicitly copies it.

### Task 4: Generation, Result, Copy and Theme Behavior

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Uses `compilePrompt`; produces result-screen actions.

- [ ] Show a brief honest generation state with no fake percentage.
- [ ] Render generated prompt on a dedicated result screen.
- [ ] Implement Copy Prompt with Clipboard API and manual fallback.
- [ ] Implement Start New and Clear without accidental data loss.
- [ ] Implement System/Light/Dark theme control and local persistence.
- [ ] Add concise inline validation and toast feedback.

### Task 5: Commercial Polish, Verification and Release

**Files:**
- Modify: `README.md`
- Verify: all app files.

**Interfaces:**
- Final artifact deployable directly by Vercel.

- [ ] Update README with product purpose, privacy behavior, local development instructions, deployment notes, and upstream attribution.
- [ ] Validate HTML/JS syntax and inspect mobile layouts at 360, 390, and 430px.
- [ ] Verify menu, ideas/templates loading, wizard Back/Next, compilation, copy, clear, start-new, and theme persistence.
- [ ] Confirm no prompt text is sent to a network endpoint or committed to the repo.
- [ ] Commit and push the completed branch, merge into `main`, then deploy/verify through Vercel.
