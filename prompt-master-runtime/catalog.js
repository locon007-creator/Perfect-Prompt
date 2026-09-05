export const INTENT_DIMENSIONS=[
  {id:'task',critical:true},{id:'targetTool',critical:true},{id:'outputFormat',critical:true},
  {id:'constraints',critical:false},{id:'input',critical:false},{id:'context',critical:false},
  {id:'audience',critical:false},{id:'successCriteria',critical:false},{id:'examples',critical:false}
];

export const TEMPLATE_CATALOG={
  A:{name:'RTF',bestFor:'simple one-shot tasks'},
  B:{name:'CO-STAR',bestFor:'professional documents and business writing'},
  C:{name:'RISEN',bestFor:'complex multi-step projects'},
  D:{name:'CRISPE',bestFor:'creative work and brand voice'},
  E:{name:'Auditable Reasoning',bestFor:'logic, math, analysis and debugging'},
  F:{name:'Few-Shot',bestFor:'format-critical pattern replication'},
  G:{name:'File-Scope',bestFor:'IDE code editing'},
  H:{name:'ReAct + Stop Conditions',bestFor:'autonomous agents'},
  I:{name:'Visual Descriptor',bestFor:'image/video generation'},
  J:{name:'Reference Image Editing',bestFor:'editing an existing image'},
  K:{name:'ComfyUI',bestFor:'node-based image workflows'},
  L:{name:'Prompt Decompiler',bestFor:'breaking down/adapting/splitting prompts'},
  M:{name:'Current Claude Task Brief',bestFor:'complex current-Claude agentic work'}
};

const patternNames=[
'Vague task verb','Two tasks in one prompt','No success criteria','Over-permissive agent','Emotional task description','Build-the-whole-thing','Implicit reference',
'Assumed prior knowledge','No project context','Forgotten stack','Hallucination invite','Undefined audience','No mention of prior failures',
'Missing output format','Implicit length','No role assignment','Vague aesthetic adjectives','No negative prompts for image AI','Prose prompt for Midjourney',
'No scope boundary','No stack constraints','No stop condition for agents','No file path for IDE AI','Wrong template for tool','Pasting entire codebase',
'No audit contract for logic task','Requesting hidden reasoning','Expecting inter-session memory','Contradicting prior work','No grounding rule for factual tasks',
'No starting state','No target state','Silent agent','Unlocked filesystem','No human review trigger','Vague first turn for an agentic model','Context rot on long sessions'
];
const categories=['task','task','task','task','task','task','task','context','context','context','context','context','context','format','format','format','format','format','format','scope','scope','scope','scope','scope','scope','reasoning','reasoning','reasoning','reasoning','reasoning','agentic','agentic','agentic','agentic','agentic','agentic','agentic'];
export const PATTERN_CATALOG=patternNames.map((name,i)=>({id:i+1,name,category:categories[i]}));

export const PROFILE_FAMILIES={
  general:{label:'General AI'},
  openai:{label:'ChatGPT / OpenAI GPT'},
  'openai-reasoning':{label:'OpenAI reasoning model'},
  claude:{label:'Claude'},
  'claude-code':{label:'Claude Code'},
  codex:{label:'Codex / ChatGPT Work / Codex IDE'},
  gemini:{label:'Gemini'},
  antigravity:{label:'Antigravity'},
  grok:{label:'Grok / xAI'},
  qwen25:{label:'Qwen 2.5'},
  qwen3:{label:'Qwen3'},
  ollama:{label:'Ollama'},
  'open-weight':{label:'Llama / Mistral / open-weight'},
  'deepseek-r1':{label:'DeepSeek-R1'},
  minimax:{label:'MiniMax'},
  'cursor-windsurf':{label:'Cursor / Windsurf'},
  cline:{label:'Cline'},
  copilot:{label:'GitHub Copilot'},
  'app-generator':{label:'Bolt / v0 / Lovable / Figma Make / Google Stitch'},
  'autonomous-agent':{label:'Devin / SWE-agent'},
  'research-orchestration':{label:'Perplexity / Manus'},
  'browser-agent':{label:'Computer-use / Browser Agent'},
  visual:{label:'Image / Video AI'},
  'image-edit':{label:'Reference Image Editing'},
  comfyui:{label:'ComfyUI'},
  '3d':{label:'Text-to-3D / Game Asset AI'},
  'in-engine-3d':{label:'Unity / Blender AI'},
  video:{label:'Video AI'},
  voice:{label:'Voice AI'},
  'workflow-ai':{label:'Zapier / Make / n8n'}
};
