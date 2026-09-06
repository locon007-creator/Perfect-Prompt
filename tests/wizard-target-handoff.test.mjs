import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler-sealed.js';

const budgetFinancialAdministration=`Budget Financial Administration

Build a premium personal financial administration app for one person.

Purpose:
Help the user organize monthly income, spending, bills, budgets, savings, and overall available money in one calm place without spreadsheets or accounting complexity.

Main Workflow:
Home → Set Monthly Income → Create Budget → Add Categories → Add Transaction → Budget Updates Automatically → Review Activity

Home:
Show Available Balance, Monthly Income, Total Spent, Remaining Budget, Savings Progress, Upcoming Bills, Recent Transactions, and one obvious + Add Transaction action.

Budget:
Create monthly budgets with categories. Each category shows Budgeted, Spent, Remaining, and progress. Totals must update immediately after transactions are added, edited, or deleted.

Transactions:
Expense: Amount → Category → Merchant / Description → Date → Save.
Income: Amount → Source → Date → Save.

Bills:
Save bill name, amount, due date, recurring status, and Paid / Unpaid state. Marking a bill Paid may create one matching expense, but never create duplicates.

Savings:
Create savings goals with Target Amount, Current Amount, Remaining Amount, progress, and quick contributions.

Activity:
Provide transaction history with search, filters, and monthly views.

Navigation:
Home · Budget · Activity · Savings

Settings:
Currency, Month Start Date, Categories, Recurring Bills, Theme, Backup / Export, Reset Data.

Data Rules:
Use one source of truth for all balances and calculations. Enter money once and automatically recalculate every affected total.

Persist all budgets, categories, transactions, bills, savings goals, settings, and active data locally.

Design:
Premium Android mobile app for 360–430 px portrait screens. Calm financial styling, strong hierarchy, large thumb-friendly controls, polished dark and light themes, restrained animation, clean spacing, no fake phone frame.

Do Not Add:
Bank connections, investing, stocks, crypto, credit scores, payroll, tax preparation, shared household accounts, team features, advertisements, or spreadsheet-style dashboard clutter.`;

test('budget financial administration can compile from every target-step choice',()=>{
  for(const target of ['auto','agent','chat','visual']){
    const out=compileWithPromptMaster({idea:budgetFinancialAdministration,goal:'build',priorities:['mobile','simple'],target,role:'auto'});
    assert.ok(out?.prompt?.length>100,`expected prompt for target ${target}`);
    assert.equal(out.purifier?.sealed,true);
  }
});
