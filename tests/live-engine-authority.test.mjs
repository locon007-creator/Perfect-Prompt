import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const compiler=fs.readFileSync(new URL('../prompt-master-runtime/compiler.js',import.meta.url),'utf8');
const sealed=fs.readFileSync(new URL('../prompt-master-runtime/compiler-sealed.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const root=new URL('..',import.meta.url);

test('live UI resolves the Prompt Master compiler through the sealed purifier route',()=>{
  assert.match(app,/\.\/prompt-master-runtime\/compiler\.js/);
  assert.match(app,/compileWithPromptMaster/);
  assert.match(html,/"\.\/prompt-master-runtime\/compiler\.js"\s*:\s*"\.\/prompt-master-runtime\/compiler-sealed\.js"/);
  assert.match(sealed,/purifyPrompt/);
  assert.match(sealed,/assertPromptPure/);
  assert.match(sealed,/PURIFIER_SEALED!==true/);
  assert.doesNotMatch(app,/\.\/prompt-engine\/compiler\.js/);
  assert.doesNotMatch(app,/compilePerfectPrompt/);
});

test('legacy prompt-engine implementation is physically removed',()=>{
  assert.equal(fs.existsSync(new URL('prompt-engine/',root)),false,'legacy prompt-engine directory must not exist');
});

test('Prompt Master exposes one core compiler entry point with no legacy alias',()=>{
  assert.match(compiler,/export function compileWithPromptMaster/);
  assert.doesNotMatch(compiler,/compilePerfectPrompt/);
});

test('UI can collect a specific target tool and surface critical clarifications',()=>{
  assert.match(app,/specificTool/);
  assert.match(app,/clarifications/);
  assert.match(app,/clarification/i);
});
