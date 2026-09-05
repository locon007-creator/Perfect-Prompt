const family=(id,label,rules,extra={})=>({id,label,rules,...extra});
const BASE={
 general:family('general','General AI',['State the goal once','Make constraints explicit','Define what done looks like','Do not request hidden reasoning']),
 openai:family('openai','ChatGPT / OpenAI GPT',['Use lean Goal, Context, Constraints, and Done for complex work','Define approval boundaries and required tool evidence','Ask for conclusions, assumptions, evidence, and checks—not hidden reasoning'],{needsCurrentVerification:true}),
 'openai-reasoning':family('openai-reasoning','OpenAI reasoning model',['Use short clean instructions','Prefer zero-shot first','Do not add chain-of-thought scaffolding','State goal and done criteria directly'],{needsCurrentVerification:true}),
 claude:family('claude','Claude',['Be clear and direct','Use structured sections/XML only when mixed context benefits','Prefer positive instructions','Use scope, acceptance criteria, action boundaries, and evidence for complex work'],{needsCurrentVerification:true}),
 'claude-code':family('claude-code','Claude Code',['Anchor relevant files/directories','Include starting state and target state','Allowed/forbidden actions and stop conditions are mandatory','Stop before destructive actions, dependencies, or schema changes'],{needsCurrentVerification:true}),
 codex:family('codex','Codex / ChatGPT Work / Codex IDE',['Use Goal, Context, Scope, Constraints, Approval Boundaries, Done','Concrete verification commands when known','One primary agent owns synthesis; bounded subagents only when useful'],{needsCurrentVerification:true}),
 gemini:family('gemini','Gemini',['Use explicit format locks','Ground factual tasks','If uncertain say [uncertain]','Use long context only when relevant'],{needsCurrentVerification:true}),
 antigravity:family('antigravity','Antigravity',['Describe outcomes, not low-level steps','Request an artifact/plan before execution when review is useful','Include browser verification for UI work','Ask before destructive terminal commands'],{needsCurrentVerification:true}),
 grok:family('grok','Grok / xAI',['Use Goal, Context/Input, Constraints, Tools/Permissions, Done','Require search/citations for current facts','Define stop conditions and approval boundaries for tool-heavy work'],{needsCurrentVerification:true}),
 qwen25:family('qwen25','Qwen 2.5',['Use explicit role and output format','Keep prompts focused','Leverage structured/JSON output when relevant']),
 qwen3:family('qwen3','Qwen3',['Thinking mode: short clean instructions and no CoT scaffolding','Non-thinking mode: explicit role and output format','Ask mode only when it materially changes the prompt'],{needsCurrentVerification:true}),
 ollama:family('ollama','Ollama',['Model identity materially matters; ask which model when unknown','Include system prompt guidance','Keep prompts short and flat']),
 'open-weight':family('open-weight','Llama / Mistral / open-weight',['Use a short flat structure','Be more explicit than with frontier hosted models','Include a role/system instruction']),
 'deepseek-r1':family('deepseek-r1','DeepSeek-R1',['Use short clean instructions','Do not request chain-of-thought','Request final answer without reasoning tags when needed']),
 minimax:family('minimax','MiniMax',['Use explicit role and structured output','Avoid unsupported parameter claims','Request no visible reasoning tags when final-only output is needed'],{needsCurrentVerification:true}),
 'cursor-windsurf':family('cursor-windsurf','Cursor / Windsurf',['Exact file path and function/component when known','Current behavior and desired change','Do-not-touch list','Done When is required']),
 cline:family('cline','Cline',['Match prompting to underlying model when known','Starting/target state plus file scope','Stop conditions and approval gates','Bound tool actions']),
 visual:family('visual','Image / Video AI',['Specify subject, action, setting, style, mood, lighting, composition, aspect ratio, exclusions','Use tool-specific syntax only for an explicit tool']),
 'image-edit':family('image-edit','Reference Image Editing',['Describe what stays exactly the same','Describe only the requested change','Preserve style/lighting/mood','Use editing route rather than generation']),
 comfyui:family('comfyui','ComfyUI',['Checkpoint model is required','Separate positive and negative prompts','Use checkpoint-appropriate syntax and settings'])
};

export function resolveProfile(intent,taskType){
  const t=(intent.targetTool||'auto').toLowerCase(); const s=(intent.idea||'').toLowerCase();
  if(taskType==='comfyui'||t==='comfyui') return BASE.comfyui;
  if(taskType==='visual-edit') return BASE['image-edit'];
  if(taskType==='visual-generate'||t==='visual') return BASE.visual;
  if(t==='agent') return BASE.codex;
  if(t==='chat') return BASE.general;
  if(BASE[t]) return BASE[t];
  if(/\bclaude code\b/.test(s)) return BASE['claude-code'];
  if(/\bclaude\b/.test(s)) return BASE.claude;
  if(/\b(codex|chatgpt work)\b/.test(s)) return BASE.codex;
  if(/\b(cursor|windsurf)\b/.test(s)) return BASE['cursor-windsurf'];
  if(/\bcline\b/.test(s)) return BASE.cline;
  if(/\b(gpt|chatgpt|openai)\b/.test(s)) return /\bo[134]\b|reasoning model/.test(s)?BASE['openai-reasoning']:BASE.openai;
  if(/\bgemini\b/.test(s)) return BASE.gemini;
  if(/\bantigravity\b/.test(s)) return BASE.antigravity;
  if(/\bgrok\b|\bxai\b/.test(s)) return BASE.grok;
  if(/\bqwen\s*3\b/.test(s)) return BASE.qwen3;
  if(/\bqwen\s*2\.5\b/.test(s)) return BASE.qwen25;
  if(/\bollama\b/.test(s)) return BASE.ollama;
  if(/\bdeepseek[- ]?r1\b/.test(s)) return BASE['deepseek-r1'];
  if(/\bminimax\b/.test(s)) return BASE.minimax;
  if(/\b(llama|mistral)\b/.test(s)) return BASE['open-weight'];
  return taskType==='agentic'||taskType==='code-edit'?BASE.codex:BASE.general;
}

export const PROFILE_RULES=BASE;
