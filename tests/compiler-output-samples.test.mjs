import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler-sealed.js';

const budget=`Build a calm personal budgeting app for one person. Main flow: Home → Set Budget → Add Spending → Budgets → Budget Detail. Home should show the current budget, amount spent, amount remaining, and one obvious Add Spending action. Budget Detail lists transactions and updates totals immediately after add, edit, or delete. Save budgets and spending locally and provide a simple monthly history. Use clear money formatting and prevent totals from disagreeing across views. Keep it simple: no bank connections, investment tracking, credit scoring, tax tools, shared household accounts, or spreadsheet-style dashboard clutter.`;

const focus=`Build a calm personal focus timer for one person. Main flow: Home → Choose Session → Focus → Break → Saved Session. Home shows the next session, today’s focused minutes, and one large Start control. The active screen needs a real countdown, pause/resume, finish-early confirmation, and clear work/break state. Save completed sessions locally and provide Daily History plus a simple Weekly summary. Keep settings limited to focus length, break length, sound, and theme. Avoid task-management, social, team, analytics-dashboard, or account features.`;

test('show sealed Budget Flow compiler output',()=>{
  const out=compileWithPromptMaster({idea:budget,goal:'build',priorities:['simple','mobile'],target:'agent',role:'android'});
  assert.equal(out.validation.ok,true);
  assert.equal(out.purifier?.sealed,true);
  assert.doesNotMatch(out.prompt,/Saved Stops|Drop Trailer|Hook Trailer|truck number|starting mileage/i);
  console.log('\n=== PERFECT PROMPT / BUDGET FLOW OUTPUT ===\n');
  console.log(out.prompt);
  console.log('\n=== END BUDGET FLOW OUTPUT ===\n');
});

test('show sealed Focus Timer compiler output',()=>{
  const out=compileWithPromptMaster({idea:focus,goal:'build',priorities:['simple','mobile'],target:'agent',role:'android'});
  assert.equal(out.validation.ok,true);
  assert.equal(out.purifier?.sealed,true);
  assert.doesNotMatch(out.prompt,/budget|Saved Stops|Drop Trailer|truck number|borrower/i);
  console.log('\n=== PERFECT PROMPT / FOCUS TIMER OUTPUT ===\n');
  console.log(out.prompt);
  console.log('\n=== END FOCUS TIMER OUTPUT ===\n');
});
