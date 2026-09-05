import test from 'node:test';
import assert from 'node:assert/strict';
import { compilePerfectPrompt } from '../prompt-engine/compiler.js';

const run=(idea,target='auto',goal='build',priorities=[])=>compilePerfectPrompt({idea,target,goal,priorities});

for (const target of ['auto','agent','chat']) {
  test(`app + ${target} preserves product architecture`,()=>{
    const out=run('Build a simple personal timesheet for one worker with punch in, punch out, live shift time, history, and monthly calendar.',target);
    assert.equal(out.intent.targetTool,target);
    assert.equal(out.route?.taskType ?? out.intent?.taskType ?? 'app','app');
    assert.match(out.prompt,/Idea Lock:/);
    assert.match(out.prompt,/Main Workflow:/);
    assert.match(out.prompt,/Core Features/i);
    assert.match(out.prompt,/Interaction Rules:/);
    assert.match(out.prompt,/Done When:/);
    if(target==='agent') {
      assert.match(out.prompt,/Stop Conditions:/);
      assert.match(out.prompt,/Verification:/);
      assert.match(out.prompt,/Forbidden Actions:/);
    }
  });
}

test('app objective does not duplicate the build verb',()=>{
  const out=run('Build a simple personal timesheet for one worker with punch in and punch out.','agent');
  assert.doesNotMatch(out.prompt,/Objective:\s*\nBuild Build\b/i);
});

test('wizard priorities are normalized without raw duplicate labels',()=>{
  const out=run('Build a simple personal timesheet for one worker.','agent','build',['premium']);
  const section=out.prompt.split('Core Features & Constraints:')[1]?.split('Product Behavior:')[0]||'';
  assert.match(section,/premium, production-quality polish/i);
  assert.doesNotMatch(section,/^- premium\s*$/mi);
});

test('timesheet workflow is derived into concrete steps instead of delegated back to the builder',()=>{
  const out=run('Build a simple personal timesheet for one worker with punch in, punch out, live shift time, history, and monthly calendar.','agent');
  const section=out.prompt.split('Main Workflow:')[1]?.split('Core Features & Constraints:')[0]||'';
  assert.match(section,/Punch In/i);
  assert.match(section,/Active Shift/i);
  assert.match(section,/Punch Out/i);
  assert.match(section,/History/i);
  assert.match(section,/Monthly Calendar/i);
  assert.doesNotMatch(section,/Derive one primary/i);
});

test('research keeps auditable structure when chat target is selected',()=>{
  const out=run('Research and compare the best current low-cost AI models for a prompt generator.','chat','research');
  assert.equal(out.template,'auditable');
  assert.match(out.prompt,/cit/i);
  assert.match(out.prompt,/uncertain/i);
});

test('visual keeps visual structure when visual target is selected',()=>{
  const out=run('Create a cinematic image of a red semi truck at sunrise, 16:9, no text.','visual','create');
  assert.equal(out.template,'visual');
  assert.match(out.prompt,/Subject:/);
  assert.match(out.prompt,/Exclude:/);
});

test('file scoped edits keep file-scope behavior',()=>{
  const out=run('In Cursor, update handleLogin in src/pages/Login.tsx only and keep the API contract unchanged.','agent','improve');
  assert.equal(out.template,'file-scope');
  assert.match(out.prompt,/src\/pages\/Login\.tsx/);
});
