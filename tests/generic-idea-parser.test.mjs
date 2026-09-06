import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const idea = `Sample Field App
Product Brief
A focused mobile work app for one user.

Main Workflow
Home → Setup → Work → Finish

Setup
Collect only:
- Unit Number — required
- Starting Mileage — required
- Current Trailer — optional

Search
Search results display only:
- Business Name
- Full Address
Never display coordinates.

Work
Fields:
- Drop Trailer
- Hook Trailer
- Loaded / Empty
- Seal Number
- Reference / Load Number

Depart
Automatically:
- Rec
`;

function section(text, heading) {
  const match = text.match(new RegExp(`${heading}:\\n([\\s\\S]*?)(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`));
  return match ? match[1] : '';
}

test('generic app parser preserves multiline workflow and complete labeled lists', () => {
  const {prompt} = compileWithPromptMaster({idea, goal:'build', target:'agent', role:'full-stack'});
  const workflow = section(prompt, 'Main Workflow');
  const behavior = section(prompt, 'Required Product Behavior');
  const scope = section(prompt, 'Constraints / Scope Lock');

  assert.match(workflow, /Home → Setup → Work → Finish/);
  for (const field of ['Drop Trailer','Hook Trailer','Loaded \/ Empty','Seal Number','Reference \/ Load Number']) {
    assert.match(behavior, new RegExp(field));
  }
  assert.match(scope, /Collect only:.*Unit Number.*Starting Mileage.*Current Trailer/is);
  assert.match(scope, /Search results display only:.*Business Name.*Full Address/is);
  assert.doesNotMatch(prompt, /^- Rec$/m);
});
