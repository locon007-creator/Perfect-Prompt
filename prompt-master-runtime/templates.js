import {buildAppDesignStandard} from './app-design.js';

const bullets=(xs=[])=>xs.filter(Boolean).map(x=>`- ${x}`).join('\n');
const clean=s=>String(s||'').trim();
const done=intent=>intent.successCriteria||'The requested outcome is complete, usable, and verified against every explicit requirement.';

export function selectTemplate({intent,taskType,profile,strategy={}}){
  if(taskType==='decompiler'||strategy.split) return 'L';
  if(taskType==='comfyui') return 'K';
  if(taskType==='visual-edit') return 'J';
  if(taskType==='visual-generate') return 'I';
  if(taskType==='app') return 'C';
  if(strategy.useFewShot) return 'F';
  if(taskType==='code-edit') return 'G';
  if(taskType==='research') return 'E';
  if(taskType==='creative') return 'D';
  if(taskType==='writing') return 'B';
  if((profile.id==='claude'||profile.id==='claude-code')&&taskType==='agentic') return 'M';
  if(taskType==='agentic') return 'H';
  return 'A';
}

function inferredAppBehavior(text){
  const s=text.toLowerCase(), out=[];
  if(/\bpunch in\b/.test(s)) out.push('Punch In records the exact current start time and changes the shift to active immediately.');
  if(/\blive (?:shift )?time|elapsed/.test(s)) out.push('While active, calculate the live elapsed time from the persisted start timestamp; do not use a decorative timer.');
  if(/\bpunch out\b/.test(s)) out.push('Punch Out records the exact end time, calculates worked duration, and saves the completed day automatically.');
  if(/\bweekly\b/.test(s)) out.push('Weekly uses the requested workweek boundaries, identifies the current day, lists each worked day and daily hours, and calculates total weekly hours from saved day records.');
  if(/\bhourly rate\b/.test(s)) out.push('Use the configured hourly rate to calculate estimated gross earnings from worked hours.');
  if(/\bdeductions?\b/.test(s)) out.push('Apply only the user-configured deductions to estimated earnings and show estimated net pay; do not turn the product into payroll processing.');
  if(/\bholidays?\b/.test(s)) out.push('Store configured holidays and distinguish them clearly from worked and non-worked days in calendar views.');
  if(/\bhistory\b/.test(s)) out.push('History uses the same saved work records and shows the explicit fields requested in the brief.');
  if(/\bmonthly calendar|calendar\b/.test(s)) out.push('Monthly Calendar is derived from the same saved work records and holiday settings so totals remain consistent across views.');
  if(/\bpersist|locally|refresh|closing/.test(s)) out.push('Persist the active shift and saved records locally so normal refresh/close/reopen does not lose required state.');
  return out;
}
function explicitFlow(text){
  const m=text.match(/(?:main workflow|workflow|main flow)\s*:\s*([^\n.]+)/i);
  return m?m[1].trim():'';
}
function screenArchitecture(text,flow){
  const views=[];
  const add=v=>{if(v&&!views.includes(v)) views.push(v)};
  const s=text.toLowerCase();
  if(/\btoday\b/.test(s)) add('Today');
  if(/\bweekly\b/.test(s)) add('Weekly');
  if(/\bhistory\b/.test(s)) add('History');
  if(/\bmonthly calendar\b/.test(s)) add('Monthly Calendar');
  else if(/\bcalendar\b/.test(s)) add('Calendar');
  const settingsItems=[];
  if(/\bhourly rate\b/.test(s)) settingsItems.push('hourly rate');
  if(/\bdeductions?\b/.test(s)) settingsItems.push('deductions');
  if(/\bholidays?\b/.test(s)) settingsItems.push('holidays');
  if(/\btime format\b/.test(s)) settingsItems.push('time format');
  if(/\btheme\b/.test(s)) settingsItems.push('theme');
  if(/\bworkweek\b|\bwork week\b/.test(s)) settingsItems.push('workweek');
  const hasSettings=/\bsettings\b/.test(s)||settingsItems.length>0;
  const lines=[];
  if(flow) lines.push(`- Primary workflow screens/states: ${flow}`);
  if(views.length) lines.push(`- Primary supporting destinations: ${views.join(' · ')}.`);
  if(hasSettings) lines.push(`- Keep Settings secondary to the main workflow${settingsItems.length?`; place ${settingsItems.join(', ')} configuration there`:''}.`);
  lines.push('- Use the smallest navigation structure that makes the main workflow and explicitly requested supporting views obvious; do not invent a dashboard or extra destinations.');
  return lines.join('\n');
}
function renderApp(c){
  const flow=explicitFlow(c.intent.idea);
  const behavior=inferredAppBehavior(c.intent.idea);
  const roleLabel=c.role?.label||'Full-Stack Product Engineer';
  const roleGuidance=c.role?.guidance||'Balance product architecture, frontend behavior, state/data correctness, implementation constraints, and completion quality.';
  return `Role:\n${roleLabel}\n${roleGuidance}\n\nProduct Mission:\n${c.intent.task}\n\nIdea Lock:\n${c.intent.idea}\nPreserve the stated product, workflow, requested features, exclusions, and one-job focus. Improve execution without changing the product into something else.\n\n${buildAppDesignStandard(c.role)}\n\nTarget User:\n${c.intent.audience||'Infer the primary real-world user only from the stated product and optimize for that user.'}\n\nMain Workflow:\n${flow||'Derive the primary start-to-finish workflow from the explicit actions in the brief. Preserve stated ordering and keep supporting views secondary to the main job.'}\n\nScreen Architecture:\n${screenArchitecture(c.intent.idea,flow)}\n\nRequired Product Behavior:\n${bullets(behavior)||'- Implement every explicit feature as working behavior, not a label or placeholder.'}\n- Implement every explicit feature and calculation in the brief.\n- Use one source of truth for shared saved data so views cannot disagree.\n- Define active, empty, completed, saved, edited, and error states only where the product requires them.\n\nConstraints / Scope Lock:\n${bullets(c.intent.constraints)||'- Do not invent unrelated pages, metrics, fields, services, or workflows.'}\n- Do not infer a dashboard, team system, analytics suite, or backend unless the brief requires one.\n\nInteraction Rules:\n- Every visible control must perform its stated action.\n- Make the next primary action obvious.\n- Preserve user-entered state through normal navigation.\n${c.agentBlock||''}\n\nTool Guidance:\n${bullets(c.profile.rules)}\n\nDone When:\n- The complete primary workflow works end to end.\n- Every explicitly requested supporting view and setting is usable.\n- Required calculations, persistence, state transitions, and exclusions are correct.\n- The visual result passes the Design & UX Standard and first-screen quality gate.\n- No unrelated features or placeholder interactions remain.\n- Verification evidence supports completion.`;
}

const renderers={
 A:c=>`Role:\nUse the most relevant expert role for this request.\n\nTask:\n${c.intent.idea}\n\nFormat:\n${c.intent.outputFormat||'Return one complete, immediately usable result.'}\n\nConstraints:\n${bullets(c.intent.constraints)||'- Preserve the user’s exact intent and avoid unnecessary scope.'}\n\nDone When:\n${done(c.intent)}\n\nTool Guidance:\n${bullets(c.profile.rules)}`,
 B:c=>`Context:\n${c.intent.context||c.intent.idea}\n\nObjective:\n${c.intent.task}\n\nStyle:\nUse the style implied by the request; do not invent a conflicting brand voice.\n\nTone:\nUse the requested tone or a clear natural professional tone.\n\nAudience:\n${c.intent.audience||'Infer the intended reader from the request.'}\n\nResponse:\n${c.intent.outputFormat||'Return the finished copy in the most useful format and appropriate length.'}\n\nConstraints:\n${bullets(c.intent.constraints)||'- Preserve the intended message and avoid filler.'}`,
 C:renderApp,
 D:c=>`Capacity:\nUse expert creative capability appropriate to the request.\n\nRole:\nAdopt the brand/creative role implied by the brief.\n\nInsight:\n${c.intent.context||'Use only the stated audience, product, and creative constraints as shaping context.'}\n\nStatement:\n${c.intent.task}\n\nPersonality:\nPreserve the requested tone and brand voice; do not add generic marketing language.\n\nExperiment:\nProvide alternatives only if the user requested variants.\n\nConstraints:\n${bullets(c.intent.constraints)}`,
 E:c=>`${c.intent.task}\n\nReturn:\n1. Conclusion or recommendation\n2. Assumptions and decision criteria\n3. Evidence or intermediate results needed to audit the conclusion\n4. Trade-offs and important counter-evidence\n5. Verification checks performed\n6. Remaining uncertainty, if any\n\nGrounding Rules:\n- Use current reliable sources when the task is time-sensitive.\n- Cite factual claims that depend on external information.\n- If evidence is uncertain or conflicting, say [uncertain] rather than guessing.\n- Do not fabricate citations, capabilities, prices, dates, or model details.\n- Do not reveal hidden chain-of-thought; provide concise rationale, evidence, and checks.`,
 F:c=>`${c.intent.task}\n\nApply the exact demonstrated pattern to the actual input.\n\nExamples:\n${(c.intent.examples||[]).map((e,i)=>`<example index="${i+1}">\n<input>${clean(e.input)}</input>\n<output>${clean(e.output)}</output>\n</example>`).join('\n')}\n\nConstraints:\n${bullets(c.intent.constraints)}\n\nOutput only the requested result in the demonstrated format.`,
 G:c=>{const file=(c.intent.idea.match(/(?:in|file\s*[:=-]?)\s+([\w./-]+\.(?:tsx|ts|jsx|js|py|html|css))/i)||[])[1]||'[exact file path]';const fn=(c.intent.idea.match(/\b(?:function|component)\s+([A-Za-z_$][\w$]*)/i)||[])[1]||'[function/component]';return `File: ${file}\nFunction/Component: ${fn}\n\nCurrent Behavior:\nInspect only this scope to confirm the current behavior described by the user.\n\nDesired Change:\n${c.intent.idea}\n\nScope:\nOnly modify the smallest section required for this change.\nDo NOT touch unrelated files, API contracts, dependencies, styles, or behavior.\n\nConstraints:\n${bullets(c.intent.constraints)||'- Preserve existing contracts and project conventions.'}\n\nVerification:\nRun the most relevant existing tests/checks for this scope.\n\nDone When:\n${done(c.intent)}`},
 H:c=>`Objective:\n${c.intent.task}\n\nStarting State:\n${c.intent.context||'Inspect the relevant in-scope project state before editing.'}\n\nTarget State:\n${done(c.intent)}\n\nAllowed Actions:\n- Inspect relevant in-scope files/configuration.\n- Make reversible changes required by the request.\n- Run relevant tests/build checks.\n\nForbidden Actions:\n- Do not modify unrelated files or behavior.\n- Do not delete files, add external services/dependencies, or change schemas without approval.\n- Do not expose credentials.\n\nStop Conditions:\nStop before destructive/irreversible actions, material scope expansion, unresolved architecture choices, or repeated unresolved failures.\n\nCheckpoints / Verification:\nReport concrete changed-file and verification evidence; do not claim completion without it.`,
 I:c=>`Subject:\n${c.intent.idea}\n\nAction/Pose:\nInfer only when clearly implied.\nSetting:\nUse the stated setting or a context-appropriate unobtrusive setting.\nStyle:\nPreserve the requested visual style.\nMood & Lighting:\nPreserve stated mood/time/lighting cues.\nComposition:\nClear focal subject and intended framing.\nAspect Ratio:\n${(c.intent.idea.match(/\b(\d{1,2}:\d{1,2})\b/)||[])[1]||'[infer from intended use]'}\nExclude:\nNo watermark, unintended text, duplicate subjects, distortion, or low-quality artifacts. Preserve explicit exclusions.\n\nTool Guidance:\n${bullets(c.profile.rules)}`,
 J:c=>`Reference image: attached to the target tool before running this prompt.\n\nWhat to keep exactly the same:\nPreserve every element not explicitly requested to change, including identity, composition, lighting, mood, and style where applicable.\n\nWhat to change:\n${c.intent.task}\n\nHow much to change:\nUse the smallest change that satisfies the request.\n\nStyle consistency:\nMaintain the reference image’s existing visual language unless the user explicitly requests a style change.\n\nNegative prompt:\nDo not introduce new objects, identity changes, unwanted text, distortion, or unrelated edits.`,
 K:c=>`POSITIVE PROMPT:\n${c.intent.task}\n\nNEGATIVE PROMPT:\nblurry, low quality, watermark, unintended text, duplicate limbs, bad anatomy, distortion\n\nCHECKPOINT:\n${(c.intent.idea.match(/\b(?:checkpoint|model)\s*[:=-]?\s*([^,\n]+)/i)||[])[1]||'[checkpoint required before use]'}\n\nSETTINGS:\nUse checkpoint-appropriate sampler, CFG/guidance, steps, denoise strength, and resolution. Do not invent incompatible values when the checkpoint is unknown.`,
 L:c=>c.strategy.split?`This request contains multiple independent tasks. Run these sequentially as separate prompts:\n\n${c.strategy.splitTasks.map((x,i)=>`Prompt ${i+1}:\n${x}`).join('\n\n')}\n\nKeep each prompt scoped to its own deliverable.`:`Objective:\nAdapt, simplify, split, or analyze the supplied prompt while preserving its original task, constraints, required output, and success criteria.\n\nSource Request:\n${c.intent.idea}\n\nTarget Tool:\n${c.profile.label}\n\nAdaptation Rules:\n- Preserve meaning and hard constraints.\n- Change structure/syntax only where the target tool benefits.\n- Remove redundancy and conflicts.\n- Replace hidden chain-of-thought requests with concise rationale/evidence/verification requirements.\n- Do not invent tool capabilities.\n\nOutput:\nReturn one clean paste-ready prompt; include material change notes only when useful.`,
 M:c=>taskM(c)
};
function taskM(c){return `Objective:\n${c.intent.task}\n\nContext:\n${c.intent.context||'Inspect only the relevant project state needed for this task.'}\n\nTarget State:\n${done(c.intent)}\n\nScope:\n- Work only in files/directories directly relevant to the request.\n- Do NOT touch unrelated files, secrets, lockfiles/configuration, services, or schemas unless explicitly required.\n\nConstraints:\n${bullets(c.intent.constraints)||'- Only make changes directly requested. Do not add features, abstractions, or files beyond the task.'}\n\nAcceptance Criteria:\n- Every explicit requirement is implemented.\n- Existing related behavior remains intact.\n- Relevant tests/build checks pass.\n\nAction Boundaries:\n- Proceed with reversible in-scope inspection, edits, and validation.\n- Stop before destructive actions, new dependencies/services, schema changes, or material scope expansion.\n\nVerification:\nProvide concrete test/build evidence and a concise changed-file summary. Do not claim completion without verification.\n\nTool Guidance:\n${bullets(c.profile.rules)}`}

export function renderTemplate(templateId,context){
  const fn=renderers[templateId]; if(!fn) throw new Error(`Unknown Prompt Master template ${templateId}`); return fn(context).replace(/\n{3,}/g,'\n\n').trim();
}
