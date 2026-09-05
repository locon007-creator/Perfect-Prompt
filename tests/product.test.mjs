import test from 'node:test';
import assert from 'node:assert/strict';
import { ideas, templates, typeScale, buildResultActions } from '../product-data.js';

test('supporting text never drops below readable mobile sizes', () => {
  assert.ok(typeScale.body >= 16);
  assert.ok(typeScale.secondary >= 14);
  assert.ok(typeScale.label >= 12);
  assert.ok(typeScale.button >= 15);
  assert.ok(typeScale.prompt >= 14);
});

test('prompt ideas feel like a real library, not a demo', () => {
  const categories = Object.keys(ideas);
  assert.ok(categories.length >= 7);
  for (const category of categories) assert.ok(ideas[category].length >= 6, `${category} needs at least 6 ideas`);
});

test('templates are clearly distinct from ideas', () => {
  assert.ok(templates.length >= 8);
  for (const template of templates) {
    assert.ok(template.title);
    assert.ok(template.category);
    assert.ok(template.prompt.includes('['), `${template.title} should remain customizable`);
  }
});

test('result screen keeps one dominant action and restrained refinement', () => {
  assert.deepEqual(buildResultActions(), ['Copy Prompt', 'Refine', 'Start New']);
});
