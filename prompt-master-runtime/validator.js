const has=(s,r)=>r.test(String(s||''));
export function validateFinal(prompt,{intent,taskType,profile,template,diagnostics=[]}={}){
  const errors=[],warnings=[]; const p=String(prompt||'');
  if(!p.trim()) errors.push('empty-prompt');
  if(has(p,/\b(chain of thought|chain-of-thought|private reasoning|hidden reasoning trace)\b/i)) errors.push('hidden-reasoning-request');
  if(taskType==='app' && template==='E') errors.push('app-routed-as-research');
  if(taskType==='research' && !has(p,/\b(evidence|sources?|citations?|grounding|uncertainty)\b/i)) errors.push('research-missing-audit-contract');
  if(['agentic','code-edit'].includes(taskType) && !has(p,/\b(scope|only modify|work only|do not touch)\b/i)) errors.push('agent-missing-scope');
  if(['agentic','app'].includes(taskType) && ['codex','claude-code','cline'].includes(profile?.id) && !has(p,/\b(stop conditions|stop before|ask before|approval boundaries)\b/i)) errors.push('agent-missing-stop-conditions');
  if(taskType==='visual-edit' && !has(p,/\bkeep exactly the same|preserve every element|what to keep/i)) errors.push('image-edit-missing-preservation');
  if(taskType==='comfyui' && !has(p,/\bpositive prompt\b/i)) errors.push('comfyui-missing-positive');
  const blockerIds=diagnostics.filter(x=>x.severity==='blocker').map(x=>x.id);
  if(blockerIds.length) warnings.push(`diagnostic-blockers:${blockerIds.join(',')}`);
  const src=(intent?.idea||'').toLowerCase();
  if(taskType==='app'){
    if(!has(p,/Design & UX Standard:/i)) errors.push('app-missing-design-standard');
    if(!has(p,/functional prototype is not complete/i)||!has(p,/first main screen.*finished premium product/i)) errors.push('app-missing-first-screen-gate');
    const explicit=['weekly','history','monthly calendar','hourly rate','deductions','holidays','punch in','punch out'];
    for(const term of explicit) if(src.includes(term) && !p.toLowerCase().includes(term)) errors.push(`missing-explicit:${term}`);
    if(/no employee management|no teams|no scheduling|no gps tracking|no payroll processing|no employer dashboard/.test(src)){
      const exclusions=['employee management','teams','scheduling','gps tracking','payroll processing','employer dashboard'];
      for(const term of exclusions) if(src.includes(`no ${term}`) && !p.toLowerCase().includes(term)) warnings.push(`exclusion-not-restated:${term}`);
    }
  }
  return {ok:errors.length===0,errors,warnings};
}
