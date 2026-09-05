# Perfect Prompt Wizard Design

## Goal
Build **Perfect Prompt** as a premium, mobile-first prompt generator deployed on Vercel. The product must feel like a focused wizard, not a dashboard. The cloned Prompt Master skill remains the prompt-engineering foundation, while the web app presents a compact step-by-step experience for everyday use and premium app-building prompts.

## Product Principles
- One job: turn a rough idea into a strong, production-ready prompt.
- Mobile-first target: 360–430 CSS px portrait, while still scaling cleanly to desktop.
- No long dashboard with all controls visible at once.
- One clear next action per screen.
- Infer as much as possible instead of forcing the user through long forms.
- Keep the first main screen premium, calm, and immediately usable.
- Generated prompts are not publicly stored by default.
- GitHub is the source of truth; completed changes are committed and pushed so linked Vercel deployments update.

## Primary Flow
**Home → Describe Idea → Smart Wizard → Generate → Prompt Result**

### Home
The first screen is intentionally minimal.
- Top-left: Perfect Prompt brand mark/name.
- Top-right: burger button.
- Center: concise headline and medium-sized idea input.
- Primary CTA: **Generate Prompt**.
- Optional small smart starters below the input; they must not overwhelm the screen.
- No analytics cards, counters, dashboards, model grids, or settings panels on Home.

### Smart Wizard
After the user enters an idea, move to a focused wizard rather than expanding Home.
- Use 3–4 short stages maximum.
- Show a compact progress indicator.
- Ask only questions that materially improve the prompt.
- Prefer tap choices/chips over typing where practical.
- Example stages: purpose/target, important features or constraints, output/tool preference, review.
- If the engine can confidently infer a value, do not ask for it.
- Allow Back without losing entered data.

### Generate State
When generation begins, keep the interface compact.
- Replace the wizard content with a focused generation state.
- Avoid showing hidden framework details or internal routing.
- No fake progress percentages.

### Prompt Result
The generated prompt gets its own dedicated screen.
- Large readable prompt surface with proper spacing.
- Primary action: **Copy Prompt**.
- Secondary actions: **Start New** and **Clear**.
- Optional edit/refine action may be added only if it stays simple and does not turn the page into a prompt-management dashboard.
- Do not automatically publish or publicly persist prompt contents.

## Burger Menu
The top-right burger opens a compact sheet or dedicated menu screen. It must not expose all menu content on Home.

### Prompt Ideas
A functional library of everyday app and prompt starters.
- Categories should include practical groups such as Productivity, Utility, Finance, Personal, Work, Health, Tracking, and similar everyday-use categories.
- Each category contains useful starter ideas rather than generic filler.
- Tapping an idea loads it into the generator so the user can customize and generate immediately.

### Prompt Templates
Provide ready-to-use everyday prompt-generator examples.
- Templates are selectable and load into the wizard/input.
- Keep them practical and concise.
- Do not duplicate Prompt Ideas with different labels; Ideas are concepts, Templates are structured starting requests.

### Theme
Provide **System / Light / Dark**.
- System follows the device setting.
- Theme choice persists locally.
- Dark mode should be deep navy/charcoal rather than pure black.

### Settings
Only include genuinely useful preferences.
- Keep settings collapsed/secondary.
- No large settings dashboard.
- Do not add accounts, analytics, billing, notifications, or cloud history unless explicitly requested later.

### About
Small informational screen for Perfect Prompt version/project details and upstream attribution where needed.

## Visual Direction
- Premium, calm, Apple-level polish without copying Apple UI literally.
- Strong hierarchy, generous spacing, restrained borders, soft elevation, purposeful micro-interactions.
- Large thumb-friendly controls.
- Avoid excessive gradients, glass effects, neon accents, or decorative cards.
- Use motion only for navigation, menu sheets, wizard transitions, and state changes.
- No phone/device mockup frames.

## Prompt Engine Integration
The existing `SKILL.md`, `references/templates.md`, and `references/patterns.md` remain the knowledge foundation.

The app-facing prompt compiler should:
1. Capture the user idea and wizard answers.
2. Preserve the user's core intent instead of inventing a different product.
3. Infer missing non-critical details.
4. Apply relevant Prompt Master rules for intent extraction, constraint locking, failure-pattern removal, and success criteria.
5. Produce one clean prompt ready to copy.
6. Avoid exposing internal framework names unless the user explicitly asks.

For app-building prompts, prioritize:
- clear app purpose,
- target user,
- main workflow,
- screen hierarchy,
- interaction logic,
- core features,
- technical constraints,
- visual direction,
- completion criteria,
- no feature contamination.

## Privacy and Storage
- Repository visibility and prompt privacy are separate concerns.
- Do not commit generated prompts or user-entered prompt history to GitHub.
- Do not add analytics that capture prompt text.
- Do not add a public database for prompt history.
- Local in-browser state may be used for current wizard progress, theme, and optional last selections.
- Any future external AI/API integration must keep credentials in environment variables and must never expose secrets in client code.

## Technical Direction
- Keep the implementation lightweight and Vercel-friendly.
- Prefer a simple frontend architecture with minimal dependencies.
- Use focused modules/components rather than one giant file if a framework is selected.
- Avoid unnecessary backend services for the first version.
- The first deploy must work without requiring a database.
- If prompt generation can run deterministically from local compiler rules for the initial version, prefer that over adding an AI API prematurely.

## Navigation
Primary app navigation is state-driven:
- Home
- Wizard
- Generating
- Result
- Burger destinations: Prompt Ideas, Prompt Templates, Settings, About

Do not add persistent bottom navigation unless a later feature genuinely requires it.

## Error Handling
- Empty idea: keep user on Home and show a concise inline validation message.
- Invalid/insufficient wizard state: block progression only for genuinely required input.
- Generation failure: preserve all entered data and show a retry action.
- Copy failure: retain prompt and show a clear manual-copy fallback.
- Never wipe user input because of a navigation or generation error.

## Acceptance Criteria
The build is complete when:
- Home is premium, compact, and clearly not a dashboard.
- Burger opens and includes Prompt Ideas, Prompt Templates, Theme/Settings, and About.
- Prompt Ideas and Templates load selected content into the generator.
- Wizard uses no more than 4 focused stages.
- User input survives Back/Next navigation.
- Generate leads to a dedicated prompt-result screen.
- Copy Prompt, Clear, and Start New work.
- System/Light/Dark theme works and persists locally.
- Layout is polished at 360, 390, and 430 px portrait widths and scales cleanly to desktop.
- No generated prompts are publicly stored or committed.
- No unnecessary dashboard, backend, authentication, analytics, or feature bloat is introduced.
- Changes are committed and pushed to `locon007-creator/Perfect-Prompt` so the linked Vercel deployment can update.
