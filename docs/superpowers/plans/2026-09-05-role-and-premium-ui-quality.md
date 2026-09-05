# Role Selection + Automatic Premium UI/UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional app-build Role selector while making concrete premium UI/UX, purposeful animation, and first-screen quality requirements automatic for every app/product prompt.

**Architecture:** Keep `prompt-master-runtime` as the only compiler authority. Add a focused role resolver module, pass `role` from the wizard into intent/runtime context, render one mandatory app-only `Role` section plus a generated `Design & UX Standard`, and enforce both through final validation. Non-app routes remain unchanged.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, ES modules, Node `node:test`, GitHub Actions, Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-09-05-role-and-premium-ui-quality-design.md`

## Global Constraints

- Role selector is optional and defaults to `auto`.
- Supported roles: `auto`, `android`, `ios`, `web`, `full-stack`, `ui-ux`.
- Role selection may influence platform conventions but never product purpose, workflow, requested features, or exclusions.
- Every `app` task receives a concrete Design & UX Standard even if the user never says “premium.”
- Every `app` task includes the first-screen quality gate rejecting prototype-quality output.
- No separate premium/visual-quality selector.
- Non-app tasks receive neither app role guidance nor app design boilerplate.
- Do not add dependencies, AI APIs, databases, authentication, analytics, billing, or services.
- `prompt-master-runtime` remains the sole compiler authority.
- Completion requires passing CI on `main` and a Vercel production deployment in `READY` state on the exact merged SHA.

---

### Task 1: Lock Runtime Role Behavior With Failing Tests

**Files:**
- Create: `tests/app-role-design-quality.test.mjs`
- Read: `prompt-master-runtime/compiler.js`

**Interfaces:**
- Consumes: `compileWithPromptMaster(input)`.
- Produces: regression expectations for `role`, automatic app design quality, first-screen gate, and non-app isolation.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const app=(extra={})=>compileWithPromptMaster({
  idea:'Build a simple personal timesheet with punch in, punch out, history, and calendar.',
  goal:'build',target:'auto',...extra
});

test('app prompts always receive premium design contract and first-screen gate',()=>{
  const result=app();
  assert.equal(result.taskType,'app');
  assert.match(result.prompt,/Design & UX Standard:/i);
  assert.match(result.prompt,/functional prototype is not complete/i);
  assert.match(result.prompt,/first main screen.*finished premium product/i);
  assert.match(result.prompt,/purposeful.*animation|micro-interactions/i);
});

test('supported roles normalize and add platform-specific guidance without changing the product',()=>{
  const cases=[
    ['android','android',/Android/i],['ios','ios',/iOS/i],['web','web',/responsive web/i],
    ['full-stack','full-stack',/Full-Stack Product Engineer/i],['ui-ux','ui-ux',/UI\/UX Product Designer/i]
  ];
  for(const [role,id,needle] of cases){
    const result=app({role});
    assert.equal(result.role.id,id);
    assert.match(result.prompt,needle);
    assert.match(result.prompt,/personal timesheet/i);
  }
});

test('auto role resolves explicit platform and otherwise stays neutral',()=>{
  assert.equal(compileWithPromptMaster({idea:'Build an Android habit tracker',goal:'build',role:'auto'}).role.id,'android');
  assert.equal(compileWithPromptMaster({idea:'Build an iOS habit tracker',goal:'build',role:'auto'}).role.id,'ios');
  assert.equal(compileWithPromptMaster({idea:'Build a responsive web habit tracker',goal:'build',role:'auto'}).role.id,'web');
  assert.equal(app({role:'auto'}).role.id,'full-stack');
});

test('non-app prompts do not receive app role or design boilerplate',()=>{
  const result=compileWithPromptMaster({idea:'Research current battery technologies and compare trade-offs.',goal:'research',role:'android'});
  assert.notEqual(result.taskType,'app');
  assert.doesNotMatch(result.prompt,/Design & UX Standard:/i);
  assert.doesNotMatch(result.prompt,/functional prototype is not complete/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app-role-design-quality.test.mjs`
Expected: FAIL because role metadata/design standard are not implemented.

- [ ] **Step 3: Commit failing coverage**

```bash
git add tests/app-role-design-quality.test.mjs
git commit -m "test: define app role and premium design contract"
```

---

### Task 2: Add Focused Role Resolution

**Files:**
- Create: `prompt-master-runtime/app-role.js`
- Modify: `prompt-master-runtime/intent.js`
- Modify: `prompt-master-runtime/compiler.js`
- Test: `tests/app-role-design-quality.test.mjs`

**Interfaces:**
- Produces: `normalizeAppRole(value) -> roleId` and `resolveAppRole({intent,taskType,selectedRole}) -> {id,label,guidance}`.
- `extractIntent()` retains `role` as normalized raw wizard input.
- `compileWithPromptMaster()` exposes `role` metadata and passes it into runtime context only when `taskType==='app'`.

- [ ] **Step 1: Implement `app-role.js`**

```js
const ROLES={
  android:{label:'Android App Developer',guidance:'Favor Android/mobile conventions, thumb-friendly controls, appropriate app bars, bottom sheets/dialogs, responsive portrait layouts, and platform-appropriate interaction patterns.'},
  ios:{label:'iOS App Developer',guidance:'Favor iOS-native interaction conventions, hierarchy, sheets, navigation patterns, spacing, and restrained motion without cloning proprietary assets.'},
  web:{label:'Web App Developer',guidance:'Favor responsive web behavior, accessible browser controls, and multi-screen or state-driven navigation where appropriate.'},
  'full-stack':{label:'Full-Stack Product Engineer',guidance:'Balance product architecture, frontend behavior, state/data correctness, implementation constraints, and completion quality.'},
  'ui-ux':{label:'UI/UX Product Designer',guidance:'Prioritize information architecture, interaction hierarchy, screen composition, state design, visual coherence, and polish before implementation detail.'}
};

export function normalizeAppRole(value='auto'){
  const v=String(value||'auto').trim().toLowerCase();
  if(v==='android'||/android/.test(v)) return 'android';
  if(v==='ios'||/ios|iphone|ipad/.test(v)) return 'ios';
  if(v==='web'||/web/.test(v)) return 'web';
  if(v==='ui-ux'||/ui\/?ux|product designer/.test(v)) return 'ui-ux';
  if(v==='full-stack'||/full.?stack|product engineer/.test(v)) return 'full-stack';
  return 'auto';
}

export function resolveAppRole({intent,taskType,selectedRole='auto'}={}){
  if(taskType!=='app') return null;
  const explicit=normalizeAppRole(selectedRole);
  const text=`${intent?.idea||''} ${intent?.specificTool||''}`.toLowerCase();
  let id=explicit;
  if(id==='auto'){
    if(/android/.test(text)) id='android';
    else if(/\bios\b|iphone|ipad/.test(text)) id='ios';
    else if(/responsive web|web app|browser/.test(text)) id='web';
    else id='full-stack';
  }
  return {id,label:ROLES[id].label,guidance:ROLES[id].guidance};
}
```

- [ ] **Step 2: Pass role through intent/compiler**

Update `extractIntent()` signature to accept `role='auto'` and return `role:String(role||'auto')`.

In `compiler.js`, after task classification:

```js
const role=resolveAppRole({intent,taskType,selectedRole:intent.role});
```

Include `role` in runtime context and returned metadata.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/app-role-design-quality.test.mjs`
Expected: role-resolution assertions pass; design-standard assertions still fail.

- [ ] **Step 4: Commit**

```bash
git add prompt-master-runtime/app-role.js prompt-master-runtime/intent.js prompt-master-runtime/compiler.js tests/app-role-design-quality.test.mjs
git commit -m "feat: resolve optional app build roles"
```

---

### Task 3: Generate Mandatory Premium App Design Standard

**Files:**
- Create: `prompt-master-runtime/app-design.js`
- Modify: `prompt-master-runtime/templates.js`
- Test: `tests/app-role-design-quality.test.mjs`

**Interfaces:**
- Produces: `buildAppDesignStandard(role) -> string`.
- `renderApp(context)` consumes `context.role` and inserts `Role` and `Design & UX Standard` sections.

- [ ] **Step 1: Implement design-standard generator**

```js
export function buildAppDesignStandard(role){
  return `Design & UX Standard:\n- Treat production-ready visual hierarchy as a requirement, not decoration. Use intentional spacing, typography, density, grouping, and coherent component hierarchy.\n- Make one next primary action unmistakable on workflow screens. Use navigation and controls appropriate to ${role?.label||'the target platform'}.\n- Design polished empty, active, loading, completed, saved, edited, disabled, and error states only where relevant.\n- Use a consistent visual language with restrained surfaces, borders, elevation, and color; do not fall back to unrelated cards or default generated UI.\n- Add purposeful micro-interactions and restrained animation for navigation, state changes, sheets/dialogs, button feedback, progress, and completion. Respect reduced-motion behavior when supported.\n- Avoid random motion, excessive glass, neon, gradients, or effects that slow the task.\n- A functional prototype is not complete. The first main screen must look like a finished premium product. If the result resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting the build.`;
}
```

- [ ] **Step 2: Insert role/design sections into app renderer**

Add after Required Product Behavior:

```js
Role:\n${c.role?.label||'Full-Stack Product Engineer'}\n${c.role?.guidance||''}

${buildAppDesignStandard(c.role)}
```

Do not add this to non-app renderers.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/app-role-design-quality.test.mjs`
Expected: PASS.

- [ ] **Step 4: Run complete suite**

Run: `npm test`
Expected: all existing Prompt Master parity, safety, compiler authority, starter-library, and UI tests pass.

- [ ] **Step 5: Commit**

```bash
git add prompt-master-runtime/app-design.js prompt-master-runtime/templates.js tests/app-role-design-quality.test.mjs
git commit -m "feat: enforce premium app design and UX standard"
```

---

### Task 4: Enforce the Quality Contract in Final Validation

**Files:**
- Modify: `prompt-master-runtime/validator.js`
- Test: `tests/app-role-design-quality.test.mjs`

**Interfaces:**
- `validateFinal(prompt, context)` adds app-only errors `app-missing-design-standard` and `app-missing-first-screen-gate`.

- [ ] **Step 1: Add failing validator assertions**

Extend test file to import `validateFinal` and assert an app prompt without the standard fails while a research prompt does not require it.

- [ ] **Step 2: Run focused test to verify failure**

Run: `node --test tests/app-role-design-quality.test.mjs`
Expected: FAIL because validator does not enforce the new contract.

- [ ] **Step 3: Implement validation**

```js
if(taskType==='app'){
  if(!has(p,/Design & UX Standard:/i)) errors.push('app-missing-design-standard');
  if(!has(p,/functional prototype is not complete/i)||!has(p,/first main screen.*finished premium product/i)) errors.push('app-missing-first-screen-gate');
}
```

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/app-role-design-quality.test.mjs && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prompt-master-runtime/validator.js tests/app-role-design-quality.test.mjs
git commit -m "test: validate mandatory app design quality"
```

---

### Task 5: Add App-Only Role Selector to the Wizard

**Files:**
- Modify: `app.js`
- Modify: `prompt-master-runtime/ui.css` only if compact role-control styling is not already covered by existing choice styles.
- Test: create `tests/app-role-ui.test.mjs`

**Interfaces:**
- UI state: `state.role` with default `'auto'`.
- Compiler call: `compileWithPromptMaster({... role:state.role})`.
- Role choices use `data-role` values exactly matching runtime IDs.

- [ ] **Step 1: Write failing UI source test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('app wizard carries optional role state and compiler input',()=>{
  assert.match(app,/role:'auto'/);
  for(const id of ['android','ios','web','full-stack','ui-ux']) assert.match(app,new RegExp(`data-role=["']${id}["']`));
  assert.match(app,/role:state\.role/);
  assert.match(app,/Premium UI\/UX.*automatic|premium UI\/UX.*automatic/i);
});
```

- [ ] **Step 2: Run source test to verify failure**

Run: `node --test tests/app-role-ui.test.mjs`
Expected: FAIL because role UI/state is absent.

- [ ] **Step 3: Implement role state and app-only control**

Add `role:'auto'` to state/reset paths.

Add role options:

```js
const roleOptions=[
 ['auto','Auto — Perfect Prompt chooses'],['android','Android App Developer'],['ios','iOS App Developer'],
 ['web','Web App Developer'],['full-stack','Full-Stack Product Engineer'],['ui-ux','UI/UX Product Designer']
];
```

On the build/app wizard path, render a compact Role section before final generation with `data-role` buttons. Keep Auto selected by default and add helper copy: `Premium UI/UX and purposeful animation are automatic for app builds.`

Bind role buttons and include `role:state.role` in `compile()`.

If the user changes goal away from build, retain state harmlessly but compiler ignores role for non-app classifications.

- [ ] **Step 4: Run UI and full tests**

Run: `node --test tests/app-role-ui.test.mjs && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js prompt-master-runtime/ui.css tests/app-role-ui.test.mjs
git commit -m "feat: add optional app build role selector"
```

---

### Task 6: Update Product Copy and Regression Fixtures

**Files:**
- Modify: `app.js` About/generating copy where needed.
- Modify: `tests/live-engine-authority.test.mjs` only if authority/source assertions need to cover role/design runtime files.
- Modify: `README.md` only if current architecture description omits the new app-quality contract.

**Interfaces:**
- Public product explanation states role is optional and premium UI/UX is automatic for app builds.

- [ ] **Step 1: Add source assertions**

Assert About or wizard copy contains the automatic app-quality statement and the live compiler still imports only from `prompt-master-runtime`.

- [ ] **Step 2: Run tests to verify any missing copy fails**

Run: `npm test`
Expected: FAIL only if required product copy is absent.

- [ ] **Step 3: Make minimal copy updates**

Explain in one concise line that app prompts receive automatic production-grade UI/UX and purposeful motion; avoid adding a user-facing premium setting.

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js README.md tests
git commit -m "docs: describe automatic app design quality"
```

---

### Task 7: Production Verification and Merge

**Files:**
- No new production files.

**Interfaces:**
- GitHub `main` and Vercel production must point to the exact merged SHA.

- [ ] **Step 1: Run final branch verification**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Open PR and inspect changed files**

Confirm only planned runtime/UI/tests/docs files changed and no retired compiler path exists.

- [ ] **Step 3: Merge to `main`**

Use squash or normal merge according to repository convention; record final SHA.

- [ ] **Step 4: Verify `main` CI**

Confirm GitHub Actions `npm test` succeeds on the exact final `main` SHA.

- [ ] **Step 5: Verify Vercel production**

Confirm deployment state `READY`, target `production`, GitHub branch `main`, and GitHub commit SHA exactly equals the merged SHA.

- [ ] **Step 6: Fetch production assets**

Verify live `app.js` contains role state/selector and passes `role` into the compiler. Verify live `prompt-master-runtime/templates.js` contains `Design & UX Standard` and the first-screen quality gate. Verify live compiler still exposes only `compileWithPromptMaster`.

- [ ] **Step 7: Report completion**

Report changed behavior, tests, final SHA, production deployment state, and any intentionally unchanged behavior.