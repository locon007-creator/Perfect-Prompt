import {PATTERN_CATALOG} from './catalog.js';
const has=(s,r)=>r.test(s);
const finding=(id,severity,message,repair)=>({id,category:PATTERN_CATALOG[id-1].category,severity,message,repair});

export function runDiagnostics(draft,{intent,taskType,profile,template,strategy}={}){
  const p=String(draft||''), src=String(intent?.idea||''), low=p.toLowerCase(), s=src.toLowerCase(), out=[];
  const add=(cond,id,severity,msg,repair)=>{if(cond)out.push(finding(id,severity,msg,repair));};
  add(/\b(help|improve|fix|make it better)\b/i.test(intent?.task||'') && (intent?.task||'').split(/\s+/).length<8,1,'warning','Task verb is underspecified','precision-task');
  add(strategy?.split===true,2,'info','Request contains multiple independent tasks','split');
  add(!/\b(done when|acceptance criteria|end goal|target state|success)\b/i.test(p) && ['app','agentic','code-edit'].includes(taskType),3,'warning','Complex task lacks explicit success criteria','add-done');
  add(['agentic','app'].includes(taskType)&&/\bdo whatever it takes|anything necessary|full autonomy\b/i.test(p),4,'blocker','Agent scope is over-permissive','bound-agent');
  add(/\b(ridiculous|stupid|terrible|awful|broken as hell)\b/i.test(p),5,'warning','Emotional wording reduces task precision','neutralize');
  add(/\bbuild (?:my|the) entire app\b/i.test(s)&&s.length<120,6,'warning','Whole-product request lacks decomposition/context','add-structure');
  add(/\b(the thing|what we discussed|continue where we left off|same as before)\b/i.test(p),7,'warning','Implicit reference depends on hidden context','add-context');
  add(/\bcontinue where we left off|you already know\b/i.test(p),8,'warning','Prompt assumes prior-session knowledge','memory-block');
  add(['app','agentic','code-edit'].includes(taskType)&&!intent?.context&&!/\bidea lock|starting state|context:/i.test(p),9,'warning','Project context is thin','add-context');
  add(/\b(use the same stack|keep the stack)\b/i.test(p)&&!intent?.context,10,'warning','Stack is referenced but not specified','memory-block');
  add(/\bexperts say|according to experts|latest facts\b/i.test(p)&&!/[uncertain]|cite|source/i.test(p),11,'warning','Factual request invites unsupported claims','grounding');
  add(taskType==='writing'&&!/\baudience\b/i.test(p),12,'warning','User-facing writing lacks audience definition','add-audience');
  add(/\btried|failed|didn't work|did not work\b/i.test(s)&&!has(p,/\btried|failed|do not repeat/i),13,'warning','Prior failure context was dropped','retain-failure');
  add(!/\b(format|response|output|return)\b/i.test(p)&&!['app','agentic','code-edit','visual-generate','visual-edit','comfyui'].includes(taskType),14,'warning','Output shape is implicit','add-format');
  add(/\bsummary|description|report\b/i.test(s)&&!(/\b(?:word|sentence|paragraph|max|under)\b/i.test(s))&&taskType==='writing',15,'info','Requested length is implicit','add-length');
  add(['writing','creative'].includes(taskType)&&!has(p,/\b(role|capacity)\b/i),16,'warning','Prompt lacks a useful role/capacity','add-role');
  add(/\b(professional|premium|beautiful|modern|clean)\b/i.test(s)&&taskType==='visual-generate'&&!/\b(style|lighting|composition|palette|mood)\b/i.test(p),17,'warning','Visual aesthetic is vague','visual-specificity');
  add(taskType==='visual-generate'&&!/\b(exclude|negative prompt|no watermark)\b/i.test(p),18,'warning','Visual prompt lacks exclusions','visual-negative');
  add(/\bmidjourney\b/i.test(s)&&/[.!?]\s/.test(p)&&!(/--ar|comma-separated/i.test(p)),19,'warning','Midjourney route uses prose instead of descriptor syntax','midjourney-format');
  add(['code-edit','agentic'].includes(taskType)&&!has(p,/\b(scope|do not touch|work only)\b/i),20,'blocker','Code/agent task lacks scope boundary','add-scope');
  add(/\breact|typescript|python|node|framework\b/i.test(s)&&!has(p,/\bconstraints|stack|language|framework\b/i),21,'warning','Stack constraints were not made explicit','add-stack');
  add(['agentic','app'].includes(taskType)&&['codex','claude-code','cline'].includes(profile?.id)&&!has(p,/\bstop conditions|stop before|pause and ask\b/i),22,'blocker','Agent route lacks stop conditions','add-stop');
  add(taskType==='code-edit'&&!/[\w./-]+\.(?:tsx|ts|jsx|js|py|html|css)/i.test(p),23,'blocker','IDE edit lacks file path','add-file');
  add((taskType==='app'&&template==='E')||(taskType==='research'&&template==='C')||(taskType==='visual-edit'&&template==='I'),24,'blocker','Selected template conflicts with primary task','reroute');
  add(p.length>12000&&taskType==='code-edit',25,'warning','Prompt appears to include excessive codebase context','reduce-context');
  add(taskType==='research'&&!has(p,/\b(assumptions|evidence|verification|uncertainty)\b/i),26,'warning','Logic/research task lacks audit contract','audit-contract');
  add(/\b(chain of thought|chain-of-thought|show your reasoning step by step|private reasoning|hidden reasoning trace)\b/i.test(p),27,'blocker','Prompt requests hidden reasoning','remove-cot');
  add(/\bremember from last time|you already know my project\b/i.test(p),28,'warning','Prompt expects inter-session memory','memory-block');
  add(intent?.context&&/\barchitecture|stack|workflow\b/i.test(intent.context)&&!/\bmemory \/ context|context:/i.test(p),29,'warning','Established project decisions may be omitted','memory-block');
  add(taskType==='research'&&!has(p,/\b(source|cite|ground|uncertain)\b/i),30,'warning','Factual task lacks grounding rule','grounding');
  add(['agentic','code-edit'].includes(taskType)&&!has(p,/\b(starting state|current behavior|context)\b/i),31,'warning','Agent lacks starting state','add-start');
  add(['agentic','code-edit'].includes(taskType)&&!has(p,/\b(target state|desired change|done when|acceptance criteria)\b/i),32,'warning','Agent lacks target state','add-target');
  add(['agentic'].includes(taskType)&&!has(p,/\b(checkpoint|progress|summary|evidence)\b/i),33,'warning','Agent progress/evidence output is underspecified','add-checkpoints');
  add(['agentic','code-edit'].includes(taskType)&&!/\b(work only|do not modify|scope|only modify)\b/i.test(p),34,'blocker','Filesystem scope is unlocked','add-scope');
  add(['agentic','code-edit','app'].includes(taskType)&&['codex','claude-code','cline'].includes(profile?.id)&&!/\b(stop|ask|approval|before destructive|dependency|schema)\b/i.test(p),35,'blocker','Agent lacks human review triggers','approval-gates');
  add(taskType==='agentic'&&(intent?.task||'').split(/\s+/).length<10,36,'warning','First agent turn is too vague for autonomous work','agent-brief');
  add(/\bcontinue this long session|after many corrections|context is stale\b/i.test(s),37,'warning','Long-session context rot risk detected','compact-context');
  return out;
}

export const DIAGNOSTIC_RULE_COUNT=PATTERN_CATALOG.length;
