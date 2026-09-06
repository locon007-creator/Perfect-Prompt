import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const block = `Drop & Hook Assistant is a simple personal work app for a truck driver completing multiple drop-and-hook stops during one workday.
It is not fleet management, dispatch, GPS tracking, or an ELD. Its job is to keep the driver’s equipment, route, stops, trailer changes, arrival/departure times, and daily workflow organized with as little friction as possible.
Main Workflow
Home → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Day Complete → Navigate Home or Finish Day → Ending Mileage → Finish Day
Day Setup
Collect only what is needed to start:
- Truck / Unit Number — required
- Starting Mileage — required
- Current Trailer Number — optional
Create Route
Search results show only:
Business Name
Full Address
Never expose latitude, longitude, OSM IDs, coordinates, or other technical information.
Drop & Hook Information
Each value gets one clean row:
Drop Trailer
Hook Trailer
Loaded / Empty
Seal Number
Reference / Load Number
State 3 — Depart
When pressed:
- Record the departure time
- Save all Drop & Hook information
- Mark the stop C`;

const idea = `Drop & Hook Assistant\n${block}\n${block}`;

function section(text, heading) {
  const match = text.match(new RegExp(`${heading}:\\n([\\s\\S]*?)(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`));
  return match ? match[1] : '';
}

test('compiler quality pass removes duplicate source, preserves loose lists, and rejects truncated fragments', () => {
  const {prompt} = compileWithPromptMaster({idea, goal:'build', target:'agent', role:'full-stack'});
  const mission = section(prompt, 'Product Mission');
  const behavior = section(prompt, 'Required Product Behavior');
  const scope = section(prompt, 'Constraints / Scope Lock');
  const lock = section(prompt, 'Idea Lock');

  assert.match(mission, /keep the driver.?s equipment|daily workflow organized/i);
  assert.doesNotMatch(mission, /^- Drop & Hook Assistant\s*$/m);
  assert.equal((lock.match(/Drop & Hook Assistant is a simple personal work app/g) || []).length, 1);
  for (const field of ['Drop Trailer','Hook Trailer','Loaded / Empty','Seal Number','Reference / Load Number']) assert.match(behavior, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
  assert.match(scope, /Collect only:.*Truck \/ Unit Number.*Starting Mileage.*Current Trailer/i);
  assert.match(scope, /Search results (?:show|display) only:.*Business Name.*Full Address/i);
  assert.doesNotMatch(prompt, /Mark the stop C(?:\n|$)/i);
});
