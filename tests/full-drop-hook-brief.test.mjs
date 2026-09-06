import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const idea = `Drop & Hook Assistant

Product Brief
Drop & Hook Assistant is a premium personal work app for one truck driver completing multiple drop-and-hook stops during a single workday.
Its purpose is to keep the driver’s equipment, route, stops, trailer changes, arrival/departure times, mileage, and daily progress organized with as little friction as possible.
It is not fleet management, dispatch software, GPS tracking, payroll, or an ELD.
The app should always make the driver’s next action obvious and keep the entire workday moving through one simple flow.

Target User
One truck driver working a daily multi-stop route.

Main Workflow: Home → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Complete Stops → Work Complete → Navigate Home or Finish Day → Ending Mileage → Finish Day

Home
Show Drop & Hook Assistant branding, a top-right menu, and one dominant Start My Day button. Menu: Saved Routes, Saved Stops, Home Base, Truck Profiles, Daily History.

Day Setup
Collect only Truck / Unit Number required, Starting Mileage required, Current Trailer Number optional. Remember previously used truck and trailer numbers and suggest them automatically. Format mileage with comma separators. The current trailer becomes the first stop’s Drop Trailer when applicable.

Create Route
Primary action: + Add Stop. Pressing Add Stop opens location search. Use OSM for search only. Search results display only Business Name and Full Address. Never display coordinates, latitude, longitude, OSM IDs, or technical location data. Search behavior: debounce requests, keep the input focused, never flicker while typing, update only the results area, and do not cause layout jumping.

Search Memory
Remember recently selected and frequently used locations locally. When search opens with an empty field, show Recent. Prioritize Recent locations, Frequently used stops, and Saved Stops. Store coordinates internally only when needed for navigation. Avoid duplicate saved locations. Allow route stops to be added, edited, removed, and reordered.

Start Route
Once at least one stop exists, enable Start Route. Starting the route opens Work Mode with Stop 1 active.

Work Mode
Do not show an OSM map, embedded map, map preview, coordinates, or location graphics. Show the active stop clearly.
Header top-left: Work Mode and Active Stop. Top-right: Route & Equipment. Route & Equipment opens a compact bottom sheet for route timeline/editing and equipment editing.

Active Stop Card
Show Business Name, Full Address, and a top-right Drop & Hook label. Below the address show Arrival: — and Departure: —. Times update automatically as the stop progresses.

Drop & Hook Info
Attach a collapsible Drop & Hook section directly to the active stop card. Fields: Drop Trailer, Hook Trailer, Loaded / Empty, Seal Number, Reference / Load Number. Each field stays on one clean row. Trailer fields suggest previously used trailer numbers. When a Hook Trailer is entered, automatically carry it forward as the Drop Trailer for the next stop. Do not require Drop & Hook information before arrival.

Main Action Workflow
Use one primary action button that changes with the current stop state.
Navigate: opens external navigation to the active stop using internally stored location data, then changes to Arrive.
Arrive: record arrival time, display arrival time, mark stop arrived, enable Drop & Hook workflow, then change main action to Depart.
Depart: record departure time, save Drop & Hook information, mark stop completed. If another stop exists, activate next stop and reset action to Navigate. Repeat Navigate → Arrive → Drop & Hook → Depart → Next Stop.

Completed Stops
Move completed stops into a collapsible Completed section preserving Business name, Address, Arrival time, Departure time, Drop Trailer, Hook Trailer, Loaded / Empty, Seal Number, and Reference / Load Number.

Final Stop
After departing the final stop, show Work Complete and ask Ready to head home? If Home Base exists show Navigate Home. Also show Finish Day. The driver is never required to navigate home.

End of Day
Before completing the day collect Ending Mileage, then Finish Day. Save the completed daily log locally.

Persistence
Persist Truck / Unit Number, Starting Mileage, Current Trailer, Route, Stop order, Active stop, Navigate / Arrive / Depart state, Arrival times, Departure times, Drop & Hook information, Completed stops, Saved stops, Saved routes, Recent searches, Saved trailer numbers, Home Base, Ending Mileage, and Daily History. Refreshing or reopening must never reset an active workday.

Visual Direction
Design for 360–430 px portrait mobile screens. Use premium dark navy and light themes, strong contrast, clear hierarchy, large thumb-friendly controls, clean cards, comfortable spacing, subtle borders and shadows, smooth restrained micro-interactions, no fake phone frame, no unnecessary dashboards, and no in-app map during Work Mode.`;

function section(text, heading) {
  const match = text.match(new RegExp(`${heading}:\\n([\\s\\S]*?)(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`));
  return match ? match[1] : '';
}

test('full Drop & Hook brief compiles without contamination and preserves critical detail', () => {
  const result = compileWithPromptMaster({idea, goal:'build', target:'agent', role:'ui-ux'});
  const p = result.prompt;
  const architecture = section(p, 'Screen Architecture');
  const behavior = section(p, 'Required Product Behavior');
  const scope = section(p, 'Constraints / Scope Lock');

  console.log('\n--- FULL DROP & HOOK COMPILED PROMPT ---\n');
  console.log(p);

  for (const term of ['Home','Day Setup','Create Route','Work Mode']) assert.match(architecture, new RegExp(term, 'i'));
  for (const term of ['Navigate','Arrive','Depart','Drop Trailer','Hook Trailer','Home Base','Ending Mileage']) assert.match(behavior, new RegExp(term, 'i'));
  assert.match(p, /End of Day/i);
  assert.match(p, /Saved Routes/i);
  assert.match(p, /Saved Stops/i);
  assert.match(p, /Recent/i);
  assert.match(p, /Route & Equipment/i);
  assert.match(p, /Business Name/i);
  assert.match(p, /Full Address/i);
  assert.match(p, /Seal Number/i);
  assert.match(p, /Reference \/ Load Number/i);
  assert.match(p, /360.?430/i);
  assert.match(scope, /fleet|dispatch|ELD|GPS/i);
  assert.doesNotMatch(p, /habit|streak|weekly target|Punch In|Punch Out|calculator|converter|recipe/i);
});
