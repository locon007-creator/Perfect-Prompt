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
import {sanitizePromptInput,agenticAccessWarning} from './safety.js';
import {resolveAppRole} from './app-role.js';
import {buildAppDesignLayer} from './app-design.js';

function agentBlock(taskType,profile){
  const agentProfiles=new Set(['codex','claude-code','cline','autonomous-agent','app-generator','browser-agent']);
  if(!['app','agentic'].includes(taskType)&&!agentProfiles.has(profile.id)) return '';
  return `Allowed Actions:\n- Inspect only relevant in-scope files/configuration.\n- Make reversible changes required by this specification.\n- Run relevant tests, builds, and checks.\n\nForbidden Actions:\n- Do not modify unrelated files, architecture, services, schemas, or behavior.\n- Do not delete files or add dependencies/services without approval.\n- Do not expose credentials.\n\nStop Conditions:\nStop before destructive/irreversible actions, dependency/service additions, schema changes, material scope expansion, or unresolved architecture decisions.\n\nVerification:\nProvide concrete test/build/tool evidence and a concise changed-file summary.`;
}

const sectionFallbacks={
  'Role':[
    '- Stay within the role that best matches the requested product and target platform.',
    '- Make product, UX, and implementation decisions that support the stated job only.',
    '- Prefer clear production-ready choices over unnecessary complexity.',
    '- Preserve all explicit constraints and exclusions while improving execution.',
    '- Treat usability, state correctness, and implementation quality as shared responsibilities.'
  ],
  'Product Mission':[
    '- Keep the product centered on its stated primary job.',
    '- Make the main user outcome obvious from the first screen.',
    '- Remove or avoid anything that does not directly support that outcome.',
    '- Preserve the intended user, context, and operating environment.',
    '- Optimize for a complete usable product rather than a feature showcase.'
  ],
  'Idea Lock':[
    '- Do not reinterpret the source idea into a different product.',
    '- Preserve the named workflow, required features, and explicit exclusions.',
    '- Infer only details that are necessary to make the requested flow work.',
    '- Keep supporting features secondary to the main job.',
    '- Reject additions that create unrelated scope or dashboard clutter.'
  ],
  'Target User':[
    '- Design for the stated real-world user and their immediate task.',
    '- Minimize cognitive load, unnecessary setup, and repeated data entry.',
    '- Use labels and actions that match the user’s natural workflow.',
    '- Prioritize fast scanning and obvious next actions on primary screens.',
    '- Keep accessibility, readability, and touch usability production-ready.'
  ],
  'Main Workflow':[
    '- Preserve the requested start-to-finish order.',
    '- Make each transition lead clearly to the next required action.',
    '- Keep secondary screens from interrupting the primary flow.',
    '- Persist required state so navigation does not reset active work.',
    '- Ensure the workflow can be completed end to end without placeholder steps.'
  ],
  'Screen Architecture':[
    '- Give every screen one clear responsibility.',
    '- Keep the primary action visually dominant on workflow screens.',
    '- Use the smallest navigation model that supports the requested destinations.',
    '- Keep settings, history, and other secondary views subordinate to the main job.',
    '- Avoid duplicate screens, redundant cards, and invented dashboard surfaces.'
  ],
  'Required Product Behavior':[
    '- Implement every explicit feature as working behavior rather than static UI.',
    '- Keep shared values synchronized from one source of truth.',
    '- Handle active, empty, completed, edited, and error states where relevant.',
    '- Preserve user-entered information through normal navigation and refresh where required.',
    '- Make calculations, transitions, and saved-state changes immediately consistent.'
  ],
  'Constraints / Scope Lock':[
    '- Do not add unrelated pages, metrics, fields, services, or workflows.',
    '- Do not introduce a backend, account system, or external dependency unless required.',
    '- Preserve explicit exclusions even when a common app pattern would normally include them.',
    '- Prefer the simplest architecture that fully satisfies the requested product.',
    '- Stop scope growth before it changes the app’s one clear job.'
  ],
  'Interaction Rules':[
    '- Every visible control must perform its stated action.',
    '- Make destructive actions deliberate and reversible where practical.',
    '- Use immediate feedback for saves, state changes, validation, and completion.',
    '- Keep forms short and request information only when it becomes necessary.',
    '- Preserve entered state through normal back, forward, and edit flows.'
  ],
  'Allowed Actions':[
    '- Inspect only relevant in-scope files and configuration.',
    '- Make reversible changes required by the specification.',
    '- Reuse existing project patterns before introducing new structure.',
    '- Run relevant tests, builds, and functional checks.',
    '- Report concrete evidence for the completed change.'
  ],
  'Forbidden Actions':[
    '- Do not modify unrelated files, architecture, services, schemas, or behavior.',
    '- Do not delete files or add dependencies/services without approval.',
    '- Do not expose or hard-code credentials.',
    '- Do not replace working behavior with placeholders or mock-only interactions.',
    '- Do not expand the product beyond its locked purpose.'
  ],
  'Stop Conditions':[
    '- Stop before destructive or irreversible actions.',
    '- Stop before adding dependencies, services, or schema changes not explicitly required.',
    '- Stop before materially expanding product scope.',
    '- Stop when an unresolved architecture decision could change the requested product.',
    '- Preserve the current working state rather than guessing through a blocking ambiguity.'
  ],
  'Verification':[
    '- Run the most relevant build or syntax check available.',
    '- Exercise the primary workflow and any changed interaction.',
    '- Confirm required persistence, calculations, and state transitions.',
    '- Confirm explicit exclusions remain excluded.',
    '- Provide concise evidence of what was verified.'
  ],
  'Tool Guidance':[
    '- Follow the target tool’s native conventions and supported capabilities.',
    '- Prefer simple durable implementation patterns over tool-specific tricks.',
    '- Do not invent unsupported APIs, integrations, or behaviors.',
    '- Keep the output directly usable in the selected target tool.',
    '- Preserve all product requirements when adapting syntax or structure.'
  ],
  'Done When':[
    '- The complete primary workflow works end to end.',
    '- Every explicitly requested supporting view and setting is usable.',
    '- Required calculations, persistence, and state transitions are correct.',
    '- The visual result passes the premium first-screen quality gate.',
    '- No unrelated features or placeholder interactions remain.'
  ]
};

function normalizeAppInstructionSections(prompt){
  const lines=String(prompt||'').split('\n');
  const sections=[];
  let current=null;
  for(const line of lines){
    const trimmed=line.trim();
    const isHeading=/^[A-Za-z][A-Za-z &/()-]{1,48}:$/.test(trimmed);
    if(isHeading){
      if(current) sections.push(current);
      current={heading:trimmed.slice(0,-1),lines:[]};
    }else if(current){
      if(trimmed) current.lines.push(line);
    }
  }
  if(current) sections.push(current);
  if(!sections.length) return prompt;

  return sections.map(section=>{
    let body=section.lines.filter(line=>line.trim());
    const fallbacks=sectionFallbacks[section.heading]||[
      '- Preserve the explicit requirement represented by this section.',
      '- Keep the instruction directly tied to the product’s primary job.',
      '- Prefer simple production-ready execution over unnecessary complexity.',
      '- Do not invent unrelated scope, data, screens, or behavior.',
      '- Verify the section is fully satisfied in the finished result.'
    ];
    for(const fallback of fallbacks){
      if(body.length>=5) break;
      if(!body.some(line=>line.trim()===fallback)) body.push(fallback);
    }
    if(body.length>7){
      const kept=body.slice(0,6);
      const overflow=body.slice(6).map(line=>line.replace(/^\s*-\s*/, '').trim()).filter(Boolean).join(' ');
      kept.push(`- ${overflow}`);
      body=kept;
    }
    return `${section.heading}:\n${body.join('\n')}`;
  }).join('\n\n');
}

export function compileWithPromptMaster(rawInput={}){
  const input=sanitizePromptInput(rawInput);
  const intent=extractIntent(input);
  const taskType=classifyPrimaryTask(intent);
  const role=resolveAppRole({intent,taskType,selectedRole:intent.role});
  const clarifications=findCriticalGaps(intent,taskType);
  const profile=resolveProfile(intent,taskType);
  const strategy=chooseStrategy(intent,taskType);
  const contextBlock=buildContextBlock(intent,input.sessionContext||'');
  if(contextBlock&&!intent.context) intent.context=contextBlock.replace(/^Memory \/ Context:\n?/, '');
  const template=selectTemplate({intent,taskType,profile,strategy});
  const runtimeContext={intent,taskType,role,profile,template,strategy,contextBlock,agentBlock:agentBlock(taskType,profile)};
  let draft=renderTemplate(template,runtimeContext);
  if(taskType==='app'&&!/Design & UX Standard:/i.test(draft)) draft=`${draft}\n\n${buildAppDesignLayer(role)}`;
  if(contextBlock&&!draft.startsWith('Memory / Context:')) draft=`${contextBlock}\n\n${draft}`;
  const diagnostics=runDiagnostics(draft,runtimeContext);
  let prompt=repairDraft(draft,diagnostics,runtimeContext);
  if(input.credentialNotice) prompt=`${input.credentialNotice}\n\n${prompt}`;
  const warning=agenticAccessWarning(profile,taskType);
  if(warning&&!prompt.includes(warning)) prompt=`${prompt}\n\n${warning}`;
  if(taskType==='app') prompt=normalizeAppInstructionSections(prompt);
  let validation=validateFinal(prompt,{...runtimeContext,diagnostics});
  if(!validation.ok){
    prompt=repairDraft(prompt,diagnostics,runtimeContext);
    if(taskType==='app') prompt=normalizeAppInstructionSections(prompt);
    validation=validateFinal(prompt,{...runtimeContext,diagnostics});
  }
  return {
    prompt,intent,taskType,role,profile:profile.id,targetLabel:profile.label,profileLabel:profile.label,
    template,templateId:template,diagnostics,validation,clarifications,strategy,
    engine:'prompt-master-full-runtime',version:'1.8-compatible',credentialsRemoved:Boolean(input.credentialNotice)
  };
}