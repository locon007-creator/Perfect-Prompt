const family=(id,label,rules,extra={})=>({id,label,rules,...extra});
const BASE={
 general:family('general','General AI',['State the goal once','Make constraints explicit','Define what done looks like','Do not request hidden reasoning']),
 openai:family('openai','ChatGPT / OpenAI GPT',['Use lean Goal, Context, Constraints, and Done for complex work','Define approval boundaries and required tool evidence','Ask for conclusions, assumptions, evidence, and checks—not hidden reasoning'],{needsCurrentVerification:true}),
 'openai-reasoning':family('openai-reasoning','OpenAI reasoning model',['Use short clean instructions','Prefer zero-shot first','Do not add chain-of-thought scaffolding','State goal and done criteria directly'],{needsCurrentVerification:true}),
 claude:family('claude','Claude',['Be clear and direct','Use structured sections/XML only when mixed context benefits','Prefer positive instructions','Use scope, acceptance criteria, action boundaries, and evidence for complex work'],{needsCurrentVerification:true}),
 'claude-code':family('claude-code','Claude Code',['Anchor relevant files/directories','Include starting state and target state','Allowed/forbidden actions and stop conditions are mandatory','Stop before destructive actions, dependencies, or schema changes'],{needsCurrentVerification:true}),
 codex:family('codex','Codex / ChatGPT Work / Codex IDE',['Use Goal, Context, Scope, Constraints, Approval Boundaries, Done','Concrete verification commands when known','One primary agent owns synthesis; bounded subagents only when useful'],{needsCurrentVerification:true}),
 arena:family('arena','Arena AI',['Build the complete app now from this specification.','Do not ask product-design questions already answered by the Idea Lock; infer minor implementation details using the simplest production-ready choice.','Do not stop at a scaffold, wireframe, dashboard shell, or placeholder UI.','Every named screen, field, action, state transition, persistence rule, and calculation must work in the first build.','Only stop if an external credential, irreversible action, or genuinely missing requirement prevents implementation.','Inspect, build, test, fix, and verify the complete first version before presenting it.']),
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
 copilot:family('copilot','GitHub Copilot',['Provide exact signature/comment immediately before generation','Specify input and return types, edge cases, and forbidden behavior','Leave no ambiguity in the completion context']),
 'app-generator':family('app-generator','Bolt / v0 / Lovable / Figma Make / Google Stitch',['Specify stack/version and what not to scaffold','Define component boundaries and product scope','Prevent unrequested auth, dark mode, backends, or feature bloat','Use design-forward outcome language when the tool benefits']),
 'autonomous-agent':family('autonomous-agent','Devin / SWE-agent',['Explicit starting and target state are mandatory','Filesystem scope and forbidden actions are critical','Require tests and evidence before completion','Stop before infrastructure/config/CI changes outside scope']),
 'research-orchestration':family('research-orchestration','Perplexity / Manus',['Specify search vs analyze vs compare','Require citations and uncertainty flags','Describe the end artifact rather than micromanaging orchestration','Add verification checkpoints for long chained tasks']),
 'browser-agent':family('browser-agent','Computer-use / Browser Agent',['Describe the outcome rather than click-by-click navigation','State decision constraints explicitly','Do not purchase/send/submit without permission','Stop before irreversible form submission, transactions, or messages']),
 visual:family('visual','Image / Video AI',['Specify subject, action, setting, style, mood, lighting, composition, aspect ratio, exclusions','Use tool-specific syntax only for an explicit tool']),
 'image-edit':family('image-edit','Reference Image Editing',['Describe what stays exactly the same','Describe only the requested change','Preserve style/lighting/mood','Use editing route rather than generation']),
 comfyui:family('comfyui','ComfyUI',['Checkpoint model is required','Separate positive and negative prompts','Use checkpoint-appropriate syntax and settings']),
 '3d':family('3d','Text-to-3D / Game Asset AI',['Specify style, subject, features, primary material, texture detail, and technical/export use','Use negative constraints such as no background/base/floating parts','For riggable characters specify A-pose or T-pose when relevant']),
 'in-engine-3d':family('in-engine-3d','Unity / Blender AI',['State exact editor/scene outcome','Name geometry/material/selected-object scope explicitly','For generated scripts define where the operation applies and technical constraints']),
 video:family('video','Video AI',['Write like a shot brief','Camera movement, shot type, motion, lighting, and duration matter','Keep prompt visual and tool-appropriate']),
 voice:family('voice','Voice AI',['Specify emotion, pacing, emphasis, pauses, and speech rate directly','Use explicit performance direction rather than vague prose']),
 'workflow-ai':family('workflow-ai','Zapier / Make / n8n',['Define trigger app/event → action app/action → field mapping','State authentication assumptions without embedding credentials','Number multi-step workflows and specify data passed between steps'])
};

export function resolveProfile(intent,taskType){
  const t=(intent.targetTool||'auto').toLowerCase(); const s=(intent.idea||'').toLowerCase();
  if(taskType==='comfyui'||t==='comfyui') return BASE.comfyui;
  if(taskType==='visual-edit') return BASE['image-edit'];
  if(/\b(meshy|tripo|rodin|text[- ]to[- ]3d|3d asset)\b/.test(s)) return BASE['3d'];
  if(/\b(unity ai|blendergpt|blender ai)\b/.test(s)) return BASE['in-engine-3d'];
  if(/\b(elevenlabs|voice ai|voiceover|speech synthesis)\b/.test(s)) return BASE.voice;
  if(/\b(zapier|make\.com|n8n|workflow ai)\b/.test(s)) return BASE['workflow-ai'];
  if(/\b(sora|runway|kling|ltx video|dream machine|luma)\b/.test(s)) return BASE.video;
  if(taskType==='visual-generate'||t==='visual') return BASE.visual;
  if(t==='agent') return BASE.codex;
  if(t==='chat') return BASE.general;
  if(BASE[t]) return BASE[t];
  if(/\barena(?: ai)?\b/.test(s)) return BASE.arena;
  if(/\bclaude code\b/.test(s)) return BASE['claude-code'];
  if(/\bclaude\b/.test(s)) return BASE.claude;
  if(/\b(codex|chatgpt work)\b/.test(s)) return BASE.codex;
  if(/\b(cursor|windsurf)\b/.test(s)) return BASE['cursor-windsurf'];
  if(/\bcline\b/.test(s)) return BASE.cline;
  if(/\bgithub copilot|copilot\b/.test(s)) return BASE.copilot;
  if(/\b(bolt|v0\b|lovable|figma make|google stitch|stitch)\b/.test(s)) return BASE['app-generator'];
  if(/\b(devin|swe-agent)\b/.test(s)) return BASE['autonomous-agent'];
  if(/\b(perplexity|manus)\b/.test(s)) return BASE['research-orchestration'];
  if(/\b(comet|openai atlas|claude in chrome|browser agent|computer-use|computer use|openclaw)\b/.test(s)) return BASE['browser-agent'];
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
