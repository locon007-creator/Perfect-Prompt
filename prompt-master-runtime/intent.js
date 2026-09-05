const uniq=a=>[...new Set((a||[]).map(x=>String(x).trim()).filter(Boolean))];
const rx=(s,r)=>(String(s).match(r)||[])[1]||'';

const TOOL_ALIASES=[
  [/^chatgpt$|^openai$|^gpt(?:-|\s)?/i,'openai'],[/^claude$/i,'claude'],[/^claude code$/i,'claude-code'],
  [/^codex$|^chatgpt work$/i,'codex'],[/^gemini$/i,'gemini'],[/^grok$|^xai$/i,'grok'],
  [/^cursor$|^windsurf$/i,'cursor-windsurf'],[/^cline$/i,'cline'],[/^antigravity$/i,'antigravity'],
  [/^qwen\s*2\.5$/i,'qwen25'],[/^qwen\s*3$/i,'qwen3'],[/^ollama$/i,'ollama'],[/^deepseek(?:-|\s)?r1$/i,'deepseek-r1'],[/^minimax/i,'minimax'],
  [/^midjourney$|^dall[- ]?e(?:\s*3)?$|^stable diffusion$|^sora$|^runway$|^kling$|^ltx video$|^dream machine$/i,'visual'],
  [/^comfyui$/i,'comfyui'],[/^copilot$|^github copilot$/i,'copilot'],[/^bolt$|^v0$|^lovable$|^figma make$|^google stitch$|^stitch$/i,'app-generator'],
  [/^devin$|^swe-agent$/i,'autonomous-agent'],[/^perplexity$|^manus$/i,'research-agent'],[/^zapier$|^make$|^n8n$/i,'workflow-ai']
];
const normalizeTool=value=>{
  const v=String(value||'').trim();
  if(!v) return '';
  for(const [pattern,id] of TOOL_ALIASES) if(pattern.test(v)) return id;
  return v.toLowerCase().replace(/\s+/g,'-');
};

export function extractIntent({idea='',goal='build',priorities=[],target='auto',specificTool='',sessionContext='',examples=[]}={}){
  const text=String(idea).trim();
  const lower=text.toLowerCase();
  const outputFormat=rx(text,/\b(?:return|output|format)\s*[:=-]\s*([^\n]+)/i)||(
    /\bjson\b/i.test(text)?'JSON':/\b(table|bullets?|list|email|report|prompt)\b/i.test(text)?(text.match(/\b(table|bullets?|list|email|report|prompt)\b/i)||[])[1]:'complete usable result'
  );
  const constraints=[];
  for(const sentence of text.split(/(?<=[.!?])\s+|\n+/)){
    if(/\b(must|must not|do not|don't|only|no\s|without|keep|preserve|under \d+|max(?:imum)?|minimum|mobile-first|premium|private|local)\b/i.test(sentence)) constraints.push(sentence.trim());
  }
  const audience=rx(text,/\b(?:for|aimed at|target(?: user| audience)?[:=-]?)\s+([^.,\n]+)/i);
  const successCriteria=rx(text,/\b(?:done when|success(?: criteria)?|acceptance criteria)\s*[:=-]\s*([^\n]+)/i);
  const input=rx(text,/\b(?:input|source|given|provided)\s*[:=-]\s*([^\n]+)/i);
  const context=String(sessionContext||'').trim()||rx(text,/\bcontext\s*[:=-]\s*([^\n]+)/i);
  const task=text.replace(/^\s*(task\s*:\s*)?/i,'').split(/\n{2,}/)[0].trim()||text;
  let targetTool=normalizeTool(specificTool)||target||'auto';
  if(targetTool==='auto'){
    if(/\b(cursor|windsurf)\b/i.test(text)) targetTool='cursor-windsurf';
    else if(/\bclaude code\b/i.test(text)) targetTool='claude-code';
    else if(/\bclaude\b/i.test(text)) targetTool='claude';
    else if(/\b(codex|chatgpt work)\b/i.test(text)) targetTool='codex';
    else if(/\b(chatgpt|openai|gpt[- ]?5|gpt[- ]?4)\b/i.test(text)) targetTool='openai';
    else if(/\bgemini\b/i.test(text)) targetTool='gemini';
    else if(/\bgrok\b|\bxai\b/i.test(text)) targetTool='grok';
    else if(/\bcomfyui\b/i.test(text)) targetTool='comfyui';
    else if(/\b(midjourney|dall[- ]?e|sora|runway|stable diffusion|kling|ltx video|dream machine)\b/i.test(text)) targetTool='visual';
  }
  return {
    idea:text,goal,targetTool,outputFormat,constraints:uniq(constraints),input,context,audience,
    successCriteria,examples:Array.isArray(examples)?examples:[],task,priorities:uniq(priorities),raw:lower,specificTool:String(specificTool||'').trim()
  };
}
