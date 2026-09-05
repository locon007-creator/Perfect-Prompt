import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

test('obsolete partial prompt-engine tree is absent',()=>{
  assert.equal(existsSync(new URL('../prompt-engine',import.meta.url)),false);
});

test('UI imports only the Prompt Master compiler and exposes clarification flow',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/from '\.\/prompt-master-runtime\/compiler\.js'/);
  assert.doesNotMatch(app,/\.\/prompt-engine\//);
  assert.match(app,/state\.screen='clarify'/);
  assert.match(app,/clarificationSubmit/);
  assert.match(app,/critical question/i);
});

test('critical target-tool gaps are surfaced and resolved by an explicit target',()=>{
  const first=compileWithPromptMaster({
    idea:'Adapt this existing prompt for another AI tool while preserving its intent.',
    goal:'improve',target:'auto'
  });
  assert.ok(first.clarifications.some(x=>x.dimension==='targetTool'));
  const resolved=compileWithPromptMaster({
    idea:'Adapt this existing prompt for another AI tool while preserving its intent.',
    goal:'improve',target:'openai',sessionContext:'Original tool: Claude. Target tool: ChatGPT.'
  });
  assert.equal(resolved.clarifications.length,0);
  assert.equal(resolved.profile,'openai');
});

test('complete timesheet still routes as an app after authority cleanup',()=>{
  const out=compileWithPromptMaster({
    idea:'Build a premium personal timesheet for one worker. Main workflow: Home → Punch In → Active Shift → Punch Out → Saved Day. Weekly is primary with Sunday–Friday days, daily hours, current day, weekly hours, hourly rate, gross pay, deductions and estimated net pay. Include History, Monthly Calendar, holidays, and local persistence. No payroll processing, teams, GPS, scheduling, or employer dashboard.',
    goal:'build',target:'agent',priorities:['premium','mobile']
  });
  assert.equal(out.taskType,'app');
  assert.equal(out.engine,'prompt-master-full-runtime');
  assert.equal(out.validation.ok,true);
  assert.doesNotMatch(out.prompt,/Return:\n1\. Conclusion or recommendation/i);
});
