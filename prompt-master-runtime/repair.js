export function repairDraft(draft,findings,{intent,taskType,profile,contextBlock}={}){
  let p=String(draft||'');
  const ids=new Set((findings||[]).map(x=>x.id));
  if(ids.has(27)) p=p.replace(/(?:show|provide|reveal|include)[^\n.]{0,60}(?:chain[- ]of[- ]thought|private reasoning|hidden reasoning trace)[^\n.]*/gi,'Provide only concise conclusions, assumptions, evidence, rationale, and verification results');
  if(ids.has(7)||ids.has(8)||ids.has(28)||ids.has(29)) if(contextBlock&&!p.includes('Memory / Context:')) p=`${contextBlock}\n\n${p}`;
  if((ids.has(20)||ids.has(34))&&!/\bScope:/i.test(p)) p+=`\n\nScope:\n- Work only within the files, product behavior, and deliverables directly required by this request.\n- Do not modify unrelated files, architecture, services, or behavior.`;
  if(ids.has(22)&&!/\bStop Conditions:/i.test(p)) p+=`\n\nStop Conditions:\nStop before destructive or irreversible actions, new dependencies/services, schema changes, material scope expansion, or an unresolved architecture decision.`;
  if(ids.has(35)&&!/\bapproval|stop before|ask before/i.test(p)) p+=`\n\nApproval Boundaries:\nStop and ask before deleting files, adding dependencies/services, changing schemas, or making irreversible changes.`;
  if(ids.has(3)&&!/\bDone When:/i.test(p)) p+=`\n\nDone When:\n${intent?.successCriteria||'Every explicit requirement is complete, usable, and verified.'}`;
  if(ids.has(30)&&taskType==='research'&&!/\bGrounding Rules:/i.test(p)) p+=`\n\nGrounding Rules:\nUse reliable sources for factual claims, cite claims that depend on external information, and mark uncertainty instead of guessing.`;
  if(ids.has(33)&&taskType==='agentic'&&!/\bVerification:/i.test(p)) p+=`\n\nVerification:\nReport concrete changed-file, test, build, and tool evidence. Do not claim completion without verification.`;
  return p.replace(/\n{3,}/g,'\n\n').trim();
}
