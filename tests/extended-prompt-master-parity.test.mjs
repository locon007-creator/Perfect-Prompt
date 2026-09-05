import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFILE_FAMILIES} from '../prompt-master-runtime/catalog.js';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const extra=['copilot','app-generator','autonomous-agent','research-orchestration','browser-agent','3d','in-engine-3d','video','voice','workflow-ai'];
test('extended upstream Prompt Master tool families are registered',()=>{for(const id of extra) assert.ok(PROFILE_FAMILIES[id],`missing ${id}`)});

test('credentials are stripped from generated prompts',()=>{
  const out=compileWithPromptMaster({idea:'Write a coding-agent prompt using API key sk-proj-1234567890abcdefghijklmnop to update my app.',goal:'improve',target:'agent'});
  assert.doesNotMatch(out.prompt,/sk-proj-1234567890abcdefghijklmnop/);
  assert.match(out.prompt,/Credentials removed|environment variable/i);
});

test('agentic prompts include the real-system-access warning',()=>{
  const out=compileWithPromptMaster({idea:'Use Devin to update the authentication flow in the repo and run tests.',goal:'improve',target:'auto'});
  assert.match(out.prompt,/agentic tool with real system access/i);
  assert.match(out.prompt,/scope locks|stop conditions/i);
});
