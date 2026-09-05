const find=(text,re)=>{const m=text.match(re);return m?m[1]?.trim()||m[0].trim():''};
const collect=(text,patterns)=>patterns.flatMap(re=>[...text.matchAll(re)].map(m=>(m[1]||m[0]).trim())).filter(Boolean);

export function sanitizeReasoningRequests(text=''){
  return String(text)
    .replace(/show\s+(?:me\s+)?(?:your\s+)?chain[- ]of[- ]thought/gi,'provide a concise rationale, evidence, and verification checks')
    .replace(/think\s+step\s+by\s+step/gi,'analyze carefully and provide only the conclusion, assumptions, concise rationale, evidence, and verification checks')
    .replace(/reveal\s+(?:your\s+)?(?:hidden\s+)?reasoning/gi,'provide a concise rationale and verification results');
}

function detectAudience(text){
  return find(text,/audience\s+(?:is|:)?\s*([^.!?]+)/i)||find(text,/for\s+(non-technical[^.!?]+|developers?[^.!?]*|drivers?[^.!?]*|workers?[^.!?]*|customers?[^.!?]*)/i)||'';
}
function detectOutput(text){
  return find(text,/output\s+(?:a|an|the)?\s*([^.!?]+)/i)||find(text,/(?:return|produce|create|build|write)\s+(a\s+working\s+web app|a\s+working\s+app|a\s+json[^.!?]*|a\s+table[^.!?]*|an?\s+email[^.!?]*|an?\s+image[^.!?]*)/i)||'';
}
function detectSuccess(text){
  return find(text,/(done when[^.!?]*|success(?: criteria)?[^.!?]*|complete when[^.!?]*|finished when[^.!?]*)/i)||'';
}
function detectExamples(text){
  const vals=collect(text,[/(?:example|e\.g\.)\s*[:=-]\s*([^.!?]+)/gi]);
  return vals;
}
function detectConstraints(text){
  return collect(text,[/(?:do not|don't|must not|never|only|keep|without|under|no\s+)[^.!?]+/gi]);
}
function detectContext(text){
  return find(text,/(?:existing|current|already|in my|for my)\s+([^.!?]+)/i)||'';
}
function detectInput(text){
  return find(text,/(?:input|using|from)\s*[:=-]?\s*([^.!?]+)/i)||'';
}

export function extractIntent({idea='',goal='build',priorities=[],target='auto'}={}){
  const sanitized=sanitizeReasoningRequests(idea).trim();
  const first=sanitized.split(/[.!?]/)[0]?.trim()||sanitized;
  return {
    task:first,
    targetTool:target==='auto'?'auto':target,
    outputFormat:detectOutput(sanitized),
    constraints:[...detectConstraints(sanitized),...priorities],
    input:detectInput(sanitized),
    context:detectContext(sanitized),
    audience:detectAudience(sanitized),
    successCriteria:detectSuccess(sanitized),
    examples:detectExamples(sanitized),
    idea:sanitized,
    goal,
    priorities:[...priorities]
  };
}
