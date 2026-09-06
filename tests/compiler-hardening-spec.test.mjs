import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler-sealed.js';

const budget='Build a personal budgeting app for one person. Main flow: Home → Set Budget → Add Spending → Budget Detail. Show amount spent, amount remaining, monthly history, and save everything locally. No bank connections, investments, loans, trucking, or team features.';
const trucking='Build a personal Drop & Hook Assistant for one truck driver. Main flow: Home → Day Setup → Create Route → Work Mode → Finish Day. Track truck number, trailer number, saved stops, arrival, departure, drop trailer, hook trailer, starting mileage, and ending mileage.';
const timesheet='Build a personal timesheet for one worker. Main flow: Home → Punch In → Active Shift → Punch Out → Saved Day. Track worked hours and hourly rate locally. No budgeting, loans, trucking, GPS, or teams.';

function compile(idea){
  return compileWithPromptMaster({idea,goal:'build',priorities:['simple','mobile'],target:'agent',role:'android'}).prompt;
}

test('back-to-back unrelated generations cannot contaminate each other',()=>{
  const firstBudget=compile(budget);
  const truck=compile(trucking);
  const secondBudget=compile(budget);
  assert.equal(firstBudget,secondBudget);
  assert.match(truck,/Drop & Hook|truck number|trailer number/i);
  assert.doesNotMatch(secondBudget,/Drop & Hook|truck number|trailer number|Saved Stops|mileage/i);
});

test('same input compiles deterministically',()=>{
  assert.equal(compile(timesheet),compile(timesheet));
});

test('timesheet does not inherit finance or trucking behavior',()=>{
  const out=compile(timesheet);
  assert.match(out,/Punch In|Punch Out|worked hours/i);
  assert.doesNotMatch(out,/remaining budget|monthly income|Saved Stops|Drop Trailer|Hook Trailer|starting mileage/i);
});

test('generic persistence language stays domain-neutral',()=>{
  assert.doesNotMatch(compile(budget),/active-workday|workday value/i);
  assert.doesNotMatch(compile(timesheet),/active-workday value/i);
});

test('sealed compiler keeps final purifier assertion mandatory',()=>{
  const sealed=fs.readFileSync(new URL('../prompt-master-runtime/compiler-sealed.js',import.meta.url),'utf8');
  const purifier=fs.readFileSync(new URL('../prompt-master-runtime/purifier.js',import.meta.url),'utf8');
  assert.match(sealed,/PURIFIER_SEALED!==true/);
  assert.match(sealed,/purifyPrompt/);
  assert.match(sealed,/assertPromptPure/);
  assert.match(purifier,/PURIFIER_SEALED=true/);
  assert.match(purifier,/cross-domain contamination/i);
});
