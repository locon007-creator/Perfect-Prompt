import {extractIntent} from './intent.js';
import {findCriticalGaps} from './clarify.js';
import {classifyPrimaryTask} from './classifier.js';
import {resolveProfile} from './profiles.js';
import {buildContextBlock} from './context.js';
import {chooseStrategy} from './strategy.js';
import {selectTemplate,renderTemplate} from './templates.js';
import {runDiagnostics} from './diagnostics.js';
import {repairDraft} from './repair.js';
import {validateFinal} from './validator.js';

function agentBlock(taskType,profile){
  if(!['app','agentic'].includes(taskType)||!['codex','claude-code','cline'].includes(profile.id)) return '';
  return `Allowed Actions:\n- Inspect only relevant in-scope files/configuration.\n- Make reversible changes required by this specification.\n- Run relevant tests, builds, and checks.\n\nForbidden Actions:\n- Do not modify unrelated files, architecture, services, schemas, or behavior.\n- Do not delete files or add dependencies/services without approval.\n- Do not expose credentials.\n\nStop Conditions:\nStop before destructive/irreversible actions, dependency/service additions, schema changes, material scope expansion, or unresolved architecture decisions.\n\nVerification:\nProvide concrete test/build/tool evidence and a concise changed-file summary.`;
}

export function compileWithPromptMaster(input={}){
  const intent=extractIntent(input);
  const taskType=classifyPrimaryTask(intent);
  const clarifications=findCriticalGaps(intent,taskType);
  const profile=resolveProfile(intent,taskType);
  const strategy=chooseStrategy(intent,taskType);
  const contextBlock=buildContextBlock(intent,input.sessionContext||'');
  if(contextBlock&&!intent.context) intent.context=contextBlock.replace(/^Memory \/ Context:\n?/,'');
  const template=selectTemplate({intent,taskType,profile,strategy});
  const runtimeContext={intent,taskType,profile,template,strategy,contextBlock,agentBlock:agentBlock(taskType,profile)};
  const draft=renderTemplate(template,runtimeContext);
  const diagnostics=runDiagnostics(draft,runtimeContext);
  let prompt=repairDraft(draft,diagnostics,runtimeContext);
  let validation=validateFinal(prompt,{...runtimeContext,diagnostics});
  if(!validation.ok){
    prompt=repairDraft(prompt,diagnostics,runtimeContext);
    validation=validateFinal(prompt,{...runtimeContext,diagnostics});
  }
  return {
    prompt,intent,taskType,profile:profile.id,targetLabel:profile.label,profileLabel:profile.label,
    template,templateId:template,diagnostics,validation,clarifications,strategy,
    engine:'prompt-master-full-runtime',version:'1.8-compatible'
  };
}

export const compilePerfectPrompt=compileWithPromptMaster;
