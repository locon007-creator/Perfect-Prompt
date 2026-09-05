const has=(s,r)=>r.test(s);
export function classifyPrimaryTask(intent){
  const s=(intent.idea||'').toLowerCase();
  if(has(s,/\b(comfyui|checkpoint|sampler|cfg scale|denoising)\b/)) return 'comfyui';
  if(has(s,/\b(reference image|edit (?:this|the) image|keep exactly the same|img2img|change only)\b/)) return 'visual-edit';
  if(has(s,/\b(adapt|decompile|simplify|split|break down)\b/) && has(s,/\bprompt\b/)) return 'decompiler';
  if(has(s,/\b(image|photo|portrait|illustration|video|cinematic|midjourney|dall[- ]?e|sora|runway|stable diffusion)\b/) && !has(s,/\bapp|website|web app|screen|workflow|feature\b/)) return 'visual-generate';
  const appSignals=/\b(app|website|web app|mobile|screen|workflow|timesheet|calendar|budget|calculator|tracker|dashboard|form|login|navigation|punch in|punch out|route|history|settings|saved day|weekly|monthly)\b/;
  const buildSignals=/\b(build|create|make|develop|design|implement)\b/;
  if(has(s,appSignals) && (has(s,buildSignals)||intent.goal==='build'||/\bhome\s*→|main workflow|supporting views|settings\b/.test(s))) return 'app';
  if(has(s,/\b(?:in|file\s*[:=-]?)\s+[\w./-]+\.(?:tsx|ts|jsx|js|py|html|css)\b/)||has(s,/\b(function|component)\s+[A-Za-z_$]/)) return 'code-edit';
  if(intent.goal==='research'||has(s,/\b(research|compare|evaluate|best current|evidence|sources|citations|trade-offs|recommend)\b/) && !has(s,buildSignals)) return 'research';
  if(has(s,/\b(cold email|report|cover letter|proposal|memo|article|blog|copy|rewrite|proofread|business writing)\b/)) return 'writing';
  if(has(s,/\b(brand voice|headline|tagline|creative copy|story|script|campaign)\b/)) return 'creative';
  if(intent.targetTool==='agent'||intent.targetTool==='claude-code'||intent.targetTool==='codex'||has(s,/\b(agent|repo|codebase|deploy|implementation)\b/)) return 'agentic';
  return 'general';
}
