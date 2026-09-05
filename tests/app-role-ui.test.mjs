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

test('role selector is gated by app classification rather than shown for every prompt',()=>{
  assert.match(app,/function isAppBuild\(\)/);
  assert.match(app,/isAppBuild\(\).*role/i);
});

test('role resets to auto for new and loaded starter sessions',()=>{
  assert.match(app,/loadStarter[\s\S]{0,500}state\.role='auto'/);
  assert.match(app,/startNew[\s\S]{0,500}state\.role='auto'/);
});

test('premium app quality is automatic rather than an optional priority chip',()=>{
  assert.doesNotMatch(app,/\['premium','Premium polish'\]/);
  assert.match(app,/Premium UI\/UX.*automatic|premium UI\/UX.*automatic/i);
});

test('home starter shortcuts reuse the canonical full starter briefs',()=>{
  assert.match(app,/ideas\.Productivity\.find/);
  assert.match(app,/ideas\.Finance\.find/);
  assert.doesNotMatch(app,/data-quick="Build a simple personal timesheet for one worker with punch in, punch out, live shift time, history, and monthly calendar\."/);
});
