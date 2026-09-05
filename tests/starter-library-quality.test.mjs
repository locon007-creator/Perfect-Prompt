import test from 'node:test';
import assert from 'node:assert/strict';
import {ideas,templates} from '../product-data.js';

const allIdeas=Object.values(ideas).flat();
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;

test('starter library keeps all 42 app ideas and makes each a compact product brief',()=>{
  assert.equal(allIdeas.length,42);
  for(const item of allIdeas){
    assert.ok(words(item.prompt)>=55,`${item.title} is still too vague (${words(item.prompt)} words)`);
    assert.match(item.prompt,/workflow|flow:|main flow|primary view|main screen|home/i,`${item.title} needs product structure`);
    assert.match(item.prompt,/persist|save|history|stored|local|record/i,`${item.title} needs concrete state/data behavior`);
    assert.match(item.prompt,/keep|do not|no |avoid|only/i,`${item.title} needs a scope/exclusion lock`);
  }
});

test('Smart Timesheet starter is a complete intentional product brief',()=>{
  const t=ideas.Productivity.find(x=>x.title==='Smart Timesheet');
  assert.ok(t);
  for(const phrase of ['Punch In','Active Shift','Punch Out','Saved Day','Weekly','History','Monthly Calendar','hourly rate','deductions','holidays','Sunday–Friday','locally']){
    assert.match(t.prompt,new RegExp(phrase.replace(/[–-]/g,'[–-]'),'i'),`missing ${phrase}`);
  }
  assert.match(t.prompt,/no teams|no employee|do not.*team/i);
  assert.match(t.prompt,/no .*payroll|do not.*payroll/i);
});

test('templates are implementation-ready recipes rather than one-line prompts',()=>{
  assert.equal(templates.length,8);
  for(const t of templates) assert.ok(words(t.prompt)>=30,`${t.title} needs more guidance`);
  const build=templates.find(x=>x.title==='Build a focused app');
  for(const phrase of ['workflow','screens','behavior','persistence','visual','scope']) assert.match(build.prompt,new RegExp(phrase,'i'));
});
