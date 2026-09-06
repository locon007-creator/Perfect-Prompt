import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const idea = `Drop & Hook Assistant
Product Brief
Its purpose is to keep the driver’s equipment, route, stops, trailer changes, arrival/departure times, mileage, and daily progress organized with as little friction as possible.
It is not fleet management, dispatch software, GPS tracking, payroll, or an ELD.
Target User
One truck driver working a daily multi-stop route.
Main Workflow: Home → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Day Complete → Navigate Home or Finish Day → Ending Mileage → Finish Day
Create Route
Primary action: + Add Stop
Use OSM for search only. Search results display only Business Name and Full Address.
Work Mode
Do not show an OSM map, embedded map, map preview, coordinates, or location graphics.
Active Stop Card
Show Business Name, Full Address, Arrival, Departure, and Drop & Hook.
Drop & Hook Info
Fields: Drop Trailer, Hook Trailer, Loaded / Empty, Seal Number, Reference / Load Number.
Main action workflow: Navigate → Arrive → Depart → Next Stop.
When Arrive is pressed, record arrival time. When Depart is pressed, record departure time, complete the stop, and activate the next stop.
Persist active route, active stop, arrival/departure times, trailer data, saved stops, recent searches, and daily history locally.`;

function section(text, heading) {
  const match = text.match(new RegExp(`${heading}:\\n([\\s\\S]*?)(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`));
  return match ? match[1] : '';
}

test('Drop & Hook brief drives workflow architecture and behavior instead of generic filler', () => {
  const {prompt} = compileWithPromptMaster({idea, goal:'build', target:'agent', role:'ui-ux'});
  const architecture = section(prompt, 'Screen Architecture');
  const behavior = section(prompt, 'Required Product Behavior');

  assert.match(architecture, /Home/);
  assert.match(architecture, /Day Setup/);
  assert.match(architecture, /Create Route/);
  assert.match(architecture, /Work Mode/);
  assert.match(behavior, /Navigate/);
  assert.match(behavior, /Arrive/);
  assert.match(behavior, /Depart/);
  assert.match(behavior, /Drop Trailer/);
  assert.match(behavior, /Hook Trailer/);
  assert.doesNotMatch(prompt, /habit|streak|weekly target|Punch In|Punch Out/i);
});
