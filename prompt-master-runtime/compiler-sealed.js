import {compileWithPromptMaster as compileCore} from './compiler.js?core=1';
import {purifyPrompt,assertPromptPure,purifierInfo,PURIFIER_SEALED} from './purifier.js';

if(PURIFIER_SEALED!==true) throw new Error('Perfect Prompt sealed purifier is unavailable. Generation is blocked.');

export function compileWithPromptMaster(rawInput={}){
  const result=compileCore(rawInput);
  const sourceIdea=result?.intent?.idea??rawInput?.idea??'';
  const prompt=purifyPrompt(result?.prompt??'',sourceIdea);
  assertPromptPure(prompt,sourceIdea);
  return {...result,prompt,purifier:purifierInfo};
}
