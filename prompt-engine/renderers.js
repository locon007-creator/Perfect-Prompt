const bullets=items=>items.filter(Boolean).map(x=>`- ${x}`).join('\n');
const priorityMap={premium:'premium, production-quality polish',simple:'a focused experience with no unnecessary features',mobile:'mobile-first interaction and responsive behavior',privacy:'privacy-first behavior and minimal data collection',fast:'fast and efficient execution',exact:'strict adherence to stated workflow and constraints',versatile:'reusable behavior without becoming generic',commercial:'commercial-grade quality'};
const priors=p=>p.map(x=>priorityMap[x]||x);
const safeRules=route=>bullets(route.rules||[]);

function cleanTask(task=''){
  return String(task).replace(/^\s*(?:build|create|make|develop)\s+/i,'').trim();
}

function normalizedConstraints(intent){
  const priorityKeys=new Set(Object.keys(priorityMap));
  const items=[...(intent.constraints||[]).filter(x=>!priorityKeys.has(String(x).toLowerCase())),...priors(intent.priorities||[])];
  return [...new Set(items.map(x=>String(x).trim()).filter(Boolean))];
}

function workflowFor(intent){
  const s=intent.idea.toLowerCase();
  if(/\btimesheet\b|\bpunch in\b|\bpunch out\b/.test(s)){
    const primary=['Home'];
    if(/\bpunch in\b/.test(s)) primary.push('Punch In');
    if(/\blive shift|active shift|elapsed|live.*time\b/.test(s)) primary.push('Active Shift with live elapsed timer');
    if(/\bpunch out\b/.test(s)) primary.push('Punch Out');
    primary.push('Saved Day');
    const supporting=[];
    if(/\bhistory\b/.test(s)) supporting.push('History');
    if(/\bmonthly calendar\b|\bcalendar\b/.test(s)) supporting.push('Monthly Calendar');
    return `Primary: ${primary.join(' → ')}.${supporting.length?` Supporting views: ${supporting.join(' and ')}.`:''}`;
  }
  if(/\bbudget\b/.test(s) && /\bset|create|add\b/.test(s)) return 'Primary: Home → Set Budget → Budgets → Budget Detail/Edit. Keep any additional requested views secondary to this flow.';
  if(/\brecipe\b/.test(s) && /\bcook|cooking\b/.test(s)) return 'Primary: Home → Recipes/Search → Recipe → Start Cooking. Keep saved or supporting recipe views secondary to cooking.';
  if(/\btracker\b|\blog\b/.test(s) && /\badd|record|save|entry\b/.test(s)) return 'Primary: Home/List → Add or Record Entry → Saved Entry/Detail → Edit when needed. Add history only when requested.';
  return 'Define one primary start-to-finish workflow directly from the explicit actions and features in the idea. Keep screens sequential and purposeful, and do not replace the workflow with a dashboard unless explicitly required.';
}

function inferredBehaviorFor(intent){
  const s=intent.idea.toLowerCase();
  const rules=[];
  if(/\btimesheet\b|\bpunch in\b|\bpunch out\b/.test(s)){
    if(/\bpunch in\b/.test(s)) rules.push('Punch In records the current start time and immediately changes the shift into its active state.');
    if(/\blive shift|active shift|elapsed|live.*time\b/.test(s)) rules.push('While a shift is active, show a live elapsed work timer derived from the saved start time rather than a decorative counter.');
    if(/\bpunch out\b/.test(s)) rules.push('Punch Out records the end time, calculates the worked duration from start to end, and saves the completed shift/day.');
    if(/\bhistory\b/.test(s)) rules.push('History lists saved shifts/days with their recorded start time, end time, and worked duration.');
    if(/\bmonthly calendar\b|\bcalendar\b/.test(s)) rules.push('Monthly Calendar reflects saved worked days and their worked hours using the same stored shift data.');
  }
  return rules;
}

function agentLayer(route){if(route.profile!=='agent'&&route.profile!=='ide')return'';return `\n\nAllowed Actions:\n- Inspect only the relevant in-scope files and project configuration before editing.\n- Make reversible changes required by this product specification.\n- Run relevant tests, build checks, and verification.\n\nForbidden Actions:\n- Do NOT change unrelated files, architecture, dependencies, services, schemas, or behavior.\n- Do NOT delete files or make destructive/irreversible changes unless explicitly authorized.\n- Do NOT expose secrets or credentials.\n\nStop Conditions:\nStop before destructive or irreversible actions, material scope expansion, a new paid/external dependency, or an architecture decision not determined by this specification.\n\nVerification:\nRun the relevant tests/build/checks and report concrete evidence of what passed. Do not claim completion without verification.`}

function appPrompt(intent,route){const constraints=normalizedConstraints(intent);const inferred=inferredBehaviorFor(intent);return `Objective:\nBuild ${cleanTask(intent.task)} as a complete, production-ready product.\n\nIdea Lock:\n${intent.idea}\nPreserve this core idea. Improve execution and usability without changing the product into something else or adding unrelated features.\n\nTarget User:\n${intent.audience||'Infer the primary real-world user from the idea and optimize for that user.'}\n\nMain Workflow:\n${workflowFor(intent)}\n\nCore Features & Constraints:\n${bullets(constraints)||'- Include every explicitly requested feature and only necessary supporting behavior.'}\n\nProduct Behavior:\n${inferred.length?`${bullets(inferred)}\n`:''}- Translate every explicit feature into working behavior, not labels or placeholders.\n- Define the active, completed, empty, saved, and error states needed for the core workflow.\n- Preserve user-entered data during normal navigation and persist only what the product actually needs.\n\nInteraction Rules:\n- Every visible control must work.\n- Make the next action obvious.\n- Do not invent pages, metrics, settings, operational fields, or secondary workflows that conflict with the idea.\n- Keep the interface focused on the product's one main job.${agentLayer(route)}\n\nTool Profile:\n${route.profileLabel}\n${safeRules(route)}\n\nDone When:\n- The full primary workflow works end to end.\n- Every requested feature is implemented and usable.\n- Required states, persistence, navigation, and calculations behave correctly.\n- No unrelated features or placeholder interactions remain.\n- The finished product has been verified before presentation.`}

function agentPrompt(intent,route){return `Objective:\n${intent.idea}\n\nStarting State:\nUse the user's stated existing project/repo context. Inspect only what is necessary before editing.\n\nTarget State:\nDeliver the requested outcome completely without broadening scope.\n\nAllowed Actions:\n- Inspect relevant in-scope files and project configuration.\n- Make reversible edits needed for the requested result.\n- Run relevant tests, checks, and build verification.\n\nForbidden Actions:\n- Do NOT change unrelated files or behavior.\n- Do NOT delete files, add external services, change database schemas, or make destructive changes unless explicitly authorized.\n- Do NOT expose secrets or credentials.\n\nStop Conditions:\nStop and ask before any destructive/irreversible action, material scope expansion, new paid/external dependency, or unresolved architecture choice.\n\nVerification:\nRun the relevant tests/build/checks and report concrete evidence of what passed. Do not claim completion without verification.\n\nTool Profile:\n${route.profileLabel}\n${safeRules(route)}\n\nDone When:\nThe requested behavior works, constraints are preserved, verification passes, and no unrelated changes remain.`}

function filePrompt(intent,route){const file=(intent.idea.match(/(?:in|file\s*[:=-]?)\s+([\w./-]+\.(?:tsx|ts|jsx|js|py|html|css))/i)||[])[1]||'[exact file path]';const fn=(intent.idea.match(/\b(handle[A-Z]\w*|[A-Za-z_$][\w$]*\(\))/)||[])[1]||'[function/component]';return `File: ${file}\nFunction/Component: ${fn}\n\nCurrent Behavior:\nUse the user's description and inspect only this scope to confirm the current behavior.\n\nDesired Change:\n${intent.idea}\n\nScope:\nOnly modify the smallest section required for this change.\nDo NOT touch unrelated files, API contracts, styles, dependencies, or behavior.\n\nConstraints:\n${bullets(intent.constraints)||'- Preserve existing contracts and project conventions.'}\n\nVerification:\nRun the most relevant existing tests/checks for this scope.\n\nDone When:\n${intent.successCriteria||'The requested behavior works and existing related behavior remains intact.'}\n\nTool Profile:\n${route.profileLabel}`}

function researchPrompt(intent,route){return `Task:\n${intent.idea}\n\nReturn:\n1. Conclusion or recommendation\n2. Assumptions and decision criteria\n3. Evidence from reliable sources with citations\n4. Trade-offs and important counter-evidence\n5. Verification checks performed\n6. Remaining uncertainty, if any\n\nGrounding Rules:\n- Use current reliable sources when the question is time-sensitive.\n- Cite factual claims that depend on external information.\n- If evidence is uncertain or conflicting, say [uncertain] rather than guessing.\n- Do not fabricate citations, model names, prices, capabilities, or dates.\n- Do not reveal hidden chain-of-thought; provide only concise rationale, evidence, and verification.\n\nTool Profile:\n${route.profileLabel}\n${safeRules(route)}`}

function visualPrompt(intent,route){return `Subject:\n${intent.idea}\n\nAction/Pose:\nInfer only if clearly implied; otherwise keep natural and unobtrusive.\n\nSetting:\nUse the setting stated in the request or a context-appropriate setting.\n\nStyle:\nMatch the requested style; if unspecified, use a coherent high-quality visual style.\n\nMood & Lighting:\nPreserve any stated mood/time-of-day/lighting cues.\n\nComposition:\nUse a clear focal subject, balanced framing, and the requested aspect ratio when stated.\n\nAspect Ratio:\n${(intent.idea.match(/\b(\d{1,2}:\d{1,2})\b/)||[])[1]||'[infer from intended use]'}\n\nExclude:\nNo watermark, unintended text, distortion, duplicate subjects, or low-quality artifacts. Preserve any explicit exclusions from the request.\n\nTool Profile:\n${route.profileLabel}\n${safeRules(route)}`}

function writingPrompt(intent,route){return `Context:\n${intent.context||intent.idea}\n\nObjective:\n${intent.task}\n\nStyle:\nInfer the most suitable style from the request without adding a different brand voice.\n\nTone:\nUse the tone stated by the user; otherwise keep it clear and natural.\n\nAudience:\n${intent.audience||'Infer the intended reader from context.'}\n\nResponse:\n${intent.outputFormat||'Return the finished copy in the most useful format and appropriate length.'}\n\nConstraints:\n${bullets(intent.constraints)||'- Avoid filler and preserve the user’s intended message.'}\n\nTool Profile:\n${route.profileLabel}`}

function decompilerPrompt(intent,route){return `Objective:\nAdapt the supplied prompt for the target tool while preserving its original intent, constraints, required output, and success criteria.\n\nSource Request:\n${intent.idea}\n\nTarget Tool:\n${route.profileLabel}\n\nAdaptation Rules:\n- Preserve meaning; change structure and syntax only where the target tool benefits.\n- Remove redundant or conflicting instructions.\n- Replace hidden chain-of-thought requests with concise rationale, evidence, and verification requirements.\n- Keep all hard constraints and output-format requirements.\n- Do not invent capabilities or settings the target tool may not support.\n\nOutput:\nReturn one clean, paste-ready adapted prompt followed by a short list of material changes only if needed.`}

function generalPrompt(intent,route){return `Role:\nUse the most relevant expert role for this request.\n\nTask:\n${intent.idea}\n\nConstraints:\n${bullets(intent.constraints)||'- Preserve the user’s intent and avoid unnecessary scope.'}\n\nFormat:\n${intent.outputFormat||'Return a complete, immediately usable result in the most suitable format.'}\n\nDone:\n${intent.successCriteria||'The request is satisfied completely, important assumptions are explicit, and unsupported claims are avoided.'}\n\nTool Profile:\n${route.profileLabel}\n${safeRules(route)}`}

export function renderPrompt(intent,route){
  if(route.template==='decompiler') return decompilerPrompt(intent,route);
  if(route.template==='visual') return visualPrompt(intent,route);
  if(route.template==='auditable') return researchPrompt(intent,route);
  if(route.template==='file-scope') return filePrompt(intent,route);
  if(route.taskType==='app') return appPrompt(intent,route);
  if(route.template==='agent-stop'||route.template==='claude-task-brief') return agentPrompt(intent,route);
  if(route.template==='costar') return writingPrompt(intent,route);
  return generalPrompt(intent,route);
}
