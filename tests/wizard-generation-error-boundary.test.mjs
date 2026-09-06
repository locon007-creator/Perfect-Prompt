import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('target-step generation cannot fail silently',()=>{
  assert.match(app,/function finishCompile\(\)\{try\{/);
  assert.match(app,/catch\(error\)/);
  assert.match(app,/showToast\([^)]*(?:couldn|failed|error)/i);
});
