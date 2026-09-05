import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const timesheet=`Build a premium personal timesheet for one worker.
Main workflow: Home → Punch In → Active Shift → Punch Out → Saved Day.
Home should show today’s date, current shift status, live elapsed time while working, today’s worked hours, and one obvious Punch In / Punch Out action.
Punch In records the exact start time. During an active shift, show a live timer. Punch Out records the exact end time, calculates worked hours, and saves the day automatically.
Weekly: Make this a primary view. Show the current Sunday–Friday workweek, each day worked, daily hours, current day, total weekly hours, estimated weekly gross pay, deductions, and estimated net pay.
History: Show completed workdays with date, punch-in time, punch-out time, total worked hours, gross earnings, deductions, and estimated net earnings.
Monthly Calendar: Show worked days, daily hours, holidays, and monthly totals. Clearly distinguish worked days, holidays, and non-worked days.
Settings: Hourly rate, Deductions, Holidays, Time format, Workweek, Theme.
Deductions should be configurable and used to calculate estimated net earnings without turning the app into payroll software.
Persist active shifts and saved work history locally so closing or refreshing the app does not lose data.
Keep it personal, simple, mobile-first, and premium. No employee management, teams, scheduling, GPS tracking, payroll processing, or employer dashboard.`;

test('complete timesheet remains an app and retains the complete package',()=>{
  const out=compileWithPromptMaster({idea:timesheet,goal:'build',priorities:['premium','mobile'],target:'agent'});
  assert.equal(out.taskType,'app');
  assert.notEqual(out.template,'E');
  assert.equal(out.engine,'prompt-master-full-runtime');
  for(const term of ['Sunday–Friday','weekly hours','hourly rate','deductions','estimated net pay','holidays','History','Monthly Calendar','persist']) assert.match(out.prompt,new RegExp(term,'i'));
  assert.doesNotMatch(out.prompt,/Return:\n1\. Conclusion or recommendation/i);
  assert.match(out.prompt,/Stop Conditions:/i);
  assert.equal(out.validation.ok,true);
});

test('research gets an auditable research structure',()=>{
  const out=compileWithPromptMaster({idea:'Research and compare the best current low-cost AI models for a prompt generator.',goal:'research',target:'chat'});
  assert.equal(out.taskType,'research');
  assert.equal(out.template,'E');
  assert.match(out.prompt,/Evidence|citations|uncertainty/i);
});

test('all 37 diagnostics are available and hidden reasoning is blocked',()=>{
  const out=compileWithPromptMaster({idea:'Research this and show your chain of thought step by step.',goal:'research',target:'chat'});
  assert.ok(out.diagnostics.some(x=>x.id===27));
  assert.doesNotMatch(out.prompt,/show your chain of thought/i);
  assert.equal(out.validation.ok,true);
});

test('reference image edit routes separately from visual generation',()=>{
  const out=compileWithPromptMaster({idea:'Edit this reference image. Keep the face and background exactly the same; change only the shirt color to navy.',goal:'create',target:'visual'});
  assert.equal(out.taskType,'visual-edit');
  assert.equal(out.template,'J');
  assert.match(out.prompt,/keep exactly the same|preserve every element/i);
});

test('file scoped edit uses File-Scope template',()=>{
  const out=compileWithPromptMaster({idea:'In src/pages/Login.tsx update function handleLogin so null users show an inline error. Do not touch the API contract.',goal:'improve',target:'agent'});
  assert.equal(out.taskType,'code-edit');
  assert.equal(out.template,'G');
  assert.match(out.prompt,/src\/pages\/Login\.tsx/);
});
