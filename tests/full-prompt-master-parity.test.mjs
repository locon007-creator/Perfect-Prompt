import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTENT_DIMENSIONS,
  TEMPLATE_CATALOG,
  PATTERN_CATALOG,
  PROFILE_FAMILIES
} from '../prompt-master-runtime/catalog.js';

test('full Prompt Master runtime exposes all nine intent dimensions',()=>{
  assert.deepEqual(INTENT_DIMENSIONS.map(x=>x.id),['task','targetTool','outputFormat','constraints','input','context','audience','successCriteria','examples']);
});

test('full Prompt Master runtime registers templates A through M',()=>{
  assert.deepEqual(Object.keys(TEMPLATE_CATALOG),['A','B','C','D','E','F','G','H','I','J','K','L','M']);
});

test('full Prompt Master runtime registers all 37 diagnostic patterns',()=>{
  assert.equal(PATTERN_CATALOG.length,37);
  assert.deepEqual(PATTERN_CATALOG.map(x=>x.id),Array.from({length:37},(_,i)=>i+1));
});

test('full Prompt Master runtime covers all upstream route families',()=>{
  const required=['general','openai','openai-reasoning','claude','claude-code','codex','gemini','antigravity','grok','qwen25','qwen3','ollama','open-weight','deepseek-r1','minimax','cursor-windsurf','cline','visual','image-edit','comfyui'];
  for(const id of required) assert.ok(PROFILE_FAMILIES[id],`missing profile family ${id}`);
});
