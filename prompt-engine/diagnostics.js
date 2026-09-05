export function diagnose(intent,route){
  const issues=[];const t=intent.idea;
  if(!intent.successCriteria) issues.push({code:'missing-success',fix:'Add explicit done/acceptance criteria.'});
  if(!intent.outputFormat && !/app|website|image|video|email|report/i.test(t)) issues.push({code:'missing-format',fix:'Specify the output shape.'});
  if(/help me|make it better|fix everything/i.test(t)) issues.push({code:'vague-task',fix:'Replace vague task language with a specific operation and target.'});
  if(route.profile==='agent' && !/do not|don't|only|scope/i.test(t)) issues.push({code:'agent-scope',fix:'Add explicit scope and forbidden actions.'});
  if(route.taskType==='research' && !/cite|source|evidence/i.test(t)) issues.push({code:'grounding',fix:'Require reliable sources, citations, and uncertainty disclosure.'});
  if(/chain[- ]of[- ]thought|think step by step|hidden reasoning/i.test(t)) issues.push({code:'cot',fix:'Request conclusions, concise rationale, evidence, and verification instead.'});
  return issues;
}
