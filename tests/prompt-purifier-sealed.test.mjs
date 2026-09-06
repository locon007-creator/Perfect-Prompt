import test from 'node:test';
import assert from 'node:assert/strict';
import {purifyPrompt,PURIFIER_SEALED,PURIFIER_VERSION} from '../prompt-master-runtime/purifier.js';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler-sealed.js';

const budgetIdea=`Build a premium personal finance and budgeting app named Budget Flow.
The app helps one person understand their money, control spending, and stay within a monthly budget.
Home shows Available Balance, Monthly Income, Total Spent, Remaining Budget, Savings progress, Upcoming bills, Recent transactions, and + Add Transaction.
Budget categories show Budgeted, Spent, and Remaining.
Transactions support income and expenses. Bills, savings goals, history, settings, and local persistence are required.`;

test('purifier removes foreign trucking leakage from a finance prompt',()=>{
  const dirty=`Required Product Behavior:\n- Home updates budget totals automatically.\n- Search memory: prioritize Recent, frequently used locations, and Saved Stops when requested.\n- Trailer number becomes the next Drop Trailer.\n- Income and expense transactions persist locally.\n- Home must immediately show:\n- Expense flow: Amount → Category → Merchant/Description → Date → Save`;
  const clean=purifyPrompt(dirty,budgetIdea);
  assert.match(clean,/budget totals automatically/i);
  assert.match(clean,/income and expense transactions persist locally/i);
  assert.doesNotMatch(clean,/Saved Stops|Trailer number|Drop Trailer/i);
  assert.doesNotMatch(clean,/Home must immediately show:\s*$/m);
});

test('purifier keeps domain terms when they belong to the source idea',()=>{
  const truckingIdea='Build Drop & Hook Assistant for one truck driver. Track truck number, trailer number, mileage, Saved Stops, drop trailer, hook trailer, seal and reference.';
  const prompt='Required Product Behavior:\n- Saved Stops persist locally.\n- Current trailer becomes Stop 1 Drop Trailer.';
  const clean=purifyPrompt(prompt,truckingIdea);
  assert.match(clean,/Saved Stops/);
  assert.match(clean,/Drop Trailer/);
});

test('sealed compiler always returns a purified prompt',()=>{
  const out=compileWithPromptMaster({idea:budgetIdea,goal:'build',priorities:['mobile','simple'],target:'agent'});
  assert.equal(PURIFIER_SEALED,true);
  assert.equal(PURIFIER_VERSION,'1.1.0');
  assert.doesNotMatch(out.prompt,/Saved Stops|Drop Trailer|Hook Trailer|starting mileage|ending mileage/i);
  assert.equal(out.purifier?.sealed,true);
});
