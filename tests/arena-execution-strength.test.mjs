import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler-sealed.js';

const idea=`Build a premium personal budgeting app for one person. Main Workflow: Home → Set Monthly Income → Create Budget → Add Categories → Add Transaction → Budget Updates Automatically → Review Activity. Home shows Available Balance, Monthly Income, Total Spent, Remaining Budget, Savings Progress, Upcoming Bills, Recent Transactions, and one obvious + Add Transaction action. Persist budgets, categories, transactions, bills, savings goals, settings, and active data locally. No bank connections, investing, stocks, crypto, credit scores, payroll, tax preparation, shared household accounts, team features, ads, or spreadsheet-style dashboard clutter.`;

function assertExecutionFirst(out){
  assert.equal(out.validation.ok,true);
  assert.match(out.prompt,/Build the complete app now/i);
  assert.match(out.prompt,/Do not ask product-design questions/i);
  assert.match(out.prompt,/Infer minor implementation details/i);
  assert.match(out.prompt,/Do not stop at (?:a )?(?:scaffold|wireframe)/i);
  assert.match(out.prompt,/Every named screen, field, action, state transition, persistence rule, and calculation/i);
  assert.match(out.prompt,/Only stop if .*credential.*irreversible.*missing requirement/i);
  assert.doesNotMatch(out.prompt,/request an artifact\/plan before execution/i);
}

test('Arena app prompts are execution-first and do not invite product clarification',()=>{
  const out=compileWithPromptMaster({idea,goal:'build',priorities:['mobile','exact','commercial'],target:'agent',specificTool:'Arena',role:'android'});
  assert.equal(out.targetLabel,'Arena AI');
  assertExecutionFirst(out);
});

test('generic coding-agent app destination is execution-first even when Arena is not typed',()=>{
  const out=compileWithPromptMaster({idea,goal:'build',priorities:['mobile','exact','commercial'],target:'agent',role:'android'});
  assert.equal(out.targetLabel,'App Builder / Coding Agent');
  assertExecutionFirst(out);
});
