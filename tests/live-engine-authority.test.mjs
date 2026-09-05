import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('live UI uses only the full Prompt Master runtime compiler',()=>{
  assert.match(app,/\.\/prompt-master-runtime\/compiler\.js/);
  assert.match(app,/compileWithPromptMaster/);
  assert.doesNotMatch(app,/\.\/prompt-engine\/compiler\.js/);
  assert.doesNotMatch(app,/compilePerfectPrompt/);
});
