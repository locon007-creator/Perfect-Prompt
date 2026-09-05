import test from 'node:test';
import assert from 'node:assert/strict';
import {compileWithPromptMaster} from '../prompt-master-runtime/compiler.js';

const app=(extra={})=>compileWithPromptMaster({
  idea:'Build a simple personal timesheet with punch in, punch out, history, and calendar.',
  goal:'build',target:'auto',...extra
});

test('app prompts always receive premium design contract and first-screen gate',()=>{
  const result=app();
  assert.equal(result.taskType,'app');
  assert.match(result.prompt,/Design & UX Standard:/i);
  assert.match(result.prompt,/functional prototype is not complete/i);
  assert.match(result.prompt,/first main screen.*finished premium product/i);
  assert.match(result.prompt,/purposeful.*animation|micro-interactions/i);
});

test('supported roles normalize and add platform-specific guidance without changing the product',()=>{
  const cases=[
    ['android','android',/Android/i],
    ['ios','ios',/iOS/i],
    ['web','web',/responsive web/i],
    ['full-stack','full-stack',/Full-Stack Product Engineer/i],
    ['ui-ux','ui-ux',/UI\/UX Product Designer/i]
  ];
  for(const [role,id,needle] of cases){
    const result=app({role});
    assert.equal(result.role.id,id);
    assert.match(result.prompt,needle);
    assert.match(result.prompt,/personal timesheet/i);
  }
});

test('auto role resolves explicit platform and otherwise stays neutral',()=>{
  assert.equal(compileWithPromptMaster({idea:'Build an Android habit tracker',goal:'build',role:'auto'}).role.id,'android');
  assert.equal(compileWithPromptMaster({idea:'Build an iOS habit tracker',goal:'build',role:'auto'}).role.id,'ios');
  assert.equal(compileWithPromptMaster({idea:'Build a responsive web habit tracker',goal:'build',role:'auto'}).role.id,'web');
  assert.equal(app({role:'auto'}).role.id,'full-stack');
});

test('non-app prompts do not receive app role or design boilerplate',()=>{
  const result=compileWithPromptMaster({idea:'Research current battery technologies and compare trade-offs.',goal:'research',role:'android'});
  assert.notEqual(result.taskType,'app');
  assert.equal(result.role,null);
  assert.doesNotMatch(result.prompt,/Design & UX Standard:/i);
  assert.doesNotMatch(result.prompt,/functional prototype is not complete/i);
});
