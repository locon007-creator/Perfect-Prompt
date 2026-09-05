import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const root=new URL('..',import.meta.url);

test('live UI uses only the full Prompt Master runtime compiler',()=>{
  assert.match(app,/\.\/prompt-master-runtime\/compiler\.js/);
  assert.match(app,/compileWithPromptMaster/);
  assert.doesNotMatch(app,/\.\/prompt-engine\/compiler\.js/);
  assert.doesNotMatch(app,/compilePerfectPrompt/);
});

test('legacy prompt-engine implementation is physically removed',()=>{
  assert.equal(fs.existsSync(new URL('prompt-engine/',root)),false,'legacy prompt-engine directory must not exist');
});

test('UI can collect a specific target tool and surface critical clarifications',()=>{
  assert.match(app,/specificTool/);
  assert.match(app,/clarifications/);
  assert.match(app,/clarification/i);
});
