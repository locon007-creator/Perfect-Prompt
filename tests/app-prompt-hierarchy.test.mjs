import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const result=compileWithPromptMaster({
  idea:'Build a premium personal timesheet for one worker. Main flow: Home → Punch In → Active Shift → Punch Out → Saved Day. Home shows today’s date, shift status, a real live elapsed timer, today’s hours, and one large Punch In or Punch Out action. Weekly is a primary view for the Sunday–Friday workweek with daily hours, total hours, hourly rate, gross pay, configurable deductions, and estimated net pay. Include History, Monthly Calendar, holidays, and local persistence. Keep it personal: no teams, GPS, scheduling, employer dashboard, or payroll processing.',
  goal:'build',
  target:'auto',
  role:'android'
});

const pos=heading=>result.prompt.indexOf(`${heading}:`);

test('app prompt hierarchy puts identity and design authority before implementation detail',()=>{
  assert.equal(result.taskType,'app');
  assert.equal(result.prompt.startsWith('Role:\n'),true);
  for(const heading of ['Role','Product Mission','Idea Lock','Design & UX Standard','Target User','Main Workflow','Screen Architecture','Required Product Behavior','Constraints / Scope Lock','Verification','Done When']){
    assert.ok(pos(heading)>=0,`missing ${heading}`);
  }
  const ordered=['Role','Product Mission','Idea Lock','Design & UX Standard','Target User','Main Workflow','Screen Architecture','Required Product Behavior','Constraints / Scope Lock','Verification','Done When'];
  for(let i=1;i<ordered.length;i++) assert.ok(pos(ordered[i-1])<pos(ordered[i]),`${ordered[i-1]} must appear before ${ordered[i]}`);
});

test('screen architecture makes primary destinations and secondary configuration explicit',()=>{
  assert.match(result.prompt,/Screen Architecture:/);
  assert.match(result.prompt,/Home/);
  assert.match(result.prompt,/Weekly/);
  assert.match(result.prompt,/History/);
  assert.match(result.prompt,/Monthly Calendar/);
  assert.match(result.prompt,/Settings.*secondary|secondary.*Settings/i);
  assert.match(result.prompt,/hourly rate/i);
  assert.match(result.prompt,/deductions/i);
  assert.match(result.prompt,/holidays/i);
});

test('all app builds use the app hierarchy even for a coding-agent target',()=>{
  const agent=compileWithPromptMaster({idea:'Build a mobile habit tracker with Today, History, and Settings.',goal:'build',target:'agent',specificTool:'Claude Code',role:'android'});
  assert.equal(agent.taskType,'app');
  assert.equal(agent.prompt.startsWith('Role:\n'),true);
  assert.match(agent.prompt,/Screen Architecture:/);
  assert.ok(agent.prompt.indexOf('Design & UX Standard:')<agent.prompt.indexOf('Main Workflow:'));
});
