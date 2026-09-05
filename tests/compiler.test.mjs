import test from 'node:test';
import assert from 'node:assert/strict';
import { compilePerfectPrompt } from '../prompt-engine/compiler.js';

const compile=(idea, extras={})=>compilePerfectPrompt({
  idea,
  goal:'build',
  priorities:[],
  target:'auto',
  ...extras
});

test('extracts all nine Prompt Master intent dimensions',()=>{
  const out=compile('Build a mobile timesheet for hourly workers. Output a working web app. Keep it private, simple, and under one main workflow. Audience is non-technical workers. Done when punch in/out and history work.');
  const keys=['task','targetTool','outputFormat','constraints','input','context','audience','successCriteria','examples'];
  for(const key of keys) assert.ok(Object.hasOwn(out.intent,key),`missing ${key}`);
});

test('routes non-app coding agents to an agent template with stop conditions and verification',()=>{
  const out=compile('Use Codex to inspect my existing repo and refactor the deployment script. Do not change unrelated files.',{target:'agent',goal:'improve'});
  assert.equal(out.template,'agent-stop');
  assert.match(out.prompt,/Stop Conditions:/);
  assert.match(out.prompt,/Verification:/);
  assert.match(out.prompt,/Forbidden Actions:/);
});

test('routes file-scoped IDE edits to file-scope behavior',()=>{
  const out=compile('In Cursor, update handleLogin in src/pages/Login.tsx only. Keep the API contract unchanged. Done when null users no longer crash.');
  assert.equal(out.template,'file-scope');
  assert.match(out.prompt,/src\/pages\/Login\.tsx/);
  assert.match(out.prompt,/Do NOT touch/i);
});

test('research output requires grounding, citations, uncertainty, and verification',()=>{
  const out=compile('Research the best current low-cost AI models and recommend one for a prompt generator.',{goal:'research',target:'chat'});
  assert.equal(out.template,'auditable');
  assert.match(out.prompt,/cit/i);
  assert.match(out.prompt,/uncertain/i);
  assert.match(out.prompt,/Verification/i);
});

test('visual generation uses a visual descriptor route with exclusions',()=>{
  const out=compile('Create a cinematic image of a red semi truck on a mountain highway at sunrise, 16:9, no text or watermark.',{goal:'create',target:'visual'});
  assert.equal(out.template,'visual');
  assert.match(out.prompt,/Subject:/);
  assert.match(out.prompt,/Composition:/);
  assert.match(out.prompt,/Exclude:/);
});

test('app builds preserve Idea Lock and contamination prevention',()=>{
  const out=compile('Build Drop & Hook Assistant for one truck driver completing multiple stops in a day. No fleet dashboard.',{target:'agent',priorities:['exact','mobile']});
  assert.equal(out.template,'risen');
  assert.match(out.prompt,/Idea Lock:/);
  assert.match(out.prompt,/unrelated features|do not add/i);
  assert.match(out.prompt,/Main Workflow:/);
  assert.match(out.prompt,/Done When:/);
  assert.match(out.prompt,/Stop Conditions:/);
  assert.match(out.prompt,/Verification:/);
});

test('prompt adaptation uses the decompiler route',()=>{
  const out=compile('Adapt this existing Claude prompt for ChatGPT while preserving its intent and constraints: Write a PRD using XML sections.');
  assert.equal(out.template,'decompiler');
  assert.match(out.prompt,/preserve/i);
  assert.match(out.prompt,/target tool/i);
});

test('hidden chain-of-thought requests are removed and replaced with safe verification language',()=>{
  const out=compile('Analyze this bug. Think step by step and show your chain of thought, then give the fix.',{goal:'improve',target:'chat'});
  assert.doesNotMatch(out.prompt,/show your chain of thought|think step by step/i);
  assert.match(out.prompt,/concise rationale|evidence|verification/i);
});

test('explicit tool names produce tool-specific profiles',()=>{
  assert.equal(compile('Write a prompt for Claude to review a large codebase.').profile,'claude');
  assert.equal(compile('Write a prompt for Gemini to summarize a long document.').profile,'gemini');
  assert.equal(compile('Write a prompt for ChatGPT to compare two options.').profile,'openai');
  assert.equal(compile('Write a prompt for Grok to research current news.').profile,'grok');
});

test('same input compiles deterministically',()=>{
  const a=compile('Build a simple private budget tracker for one person.',{priorities:['simple','privacy']});
  const b=compile('Build a simple private budget tracker for one person.',{priorities:['simple','privacy']});
  assert.deepEqual(a,b);
});
