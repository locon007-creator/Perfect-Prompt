const uniq=a=>[...new Set((a||[]).map(x=>String(x).trim()).filter(Boolean))];
const rx=(s,r)=>(String(s).match(r)||[])[1]||'';

export function extractIntent({idea='',goal='build',priorities=[],target='auto',sessionContext='',examples=[]}={}){
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
  let targetTool=target||'auto';
  if(targetTool==='auto'){
    if(/\b(cursor|windsurf)\b/i.test(text)) targetTool='cursor-windsurf';
    else if(/\bclaude code\b/i.test(text)) targetTool='claude-code';
    else if(/\b(codex|chatgpt work)\b/i.test(text)) targetTool='codex';
    else if(/\bcomfyui\b/i.test(text)) targetTool='comfyui';
    else if(/\b(midjourney|dall[- ]?e|sora|runway|stable diffusion)\b/i.test(text)) targetTool='visual';
  }
  return {
    idea:text,goal,targetTool,outputFormat,constraints:uniq(constraints),input,context,audience,
    successCriteria,examples:Array.isArray(examples)?examples:[],task,priorities:uniq(priorities),raw:lower
  };
}
