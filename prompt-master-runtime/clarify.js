export function findCriticalGaps(intent,taskType='general'){
  const gaps=[];
  if(!intent.task) gaps.push({dimension:'task',question:'What exactly should the target AI produce?'});
  if((taskType==='visual-edit'||taskType==='comfyui'||taskType==='decompiler') && (!intent.targetTool||intent.targetTool==='auto')) gaps.push({dimension:'targetTool',question:'Which AI tool will receive this prompt?'});
  if(taskType==='comfyui' && !/\b(sd\s*1\.5|sdxl|flux|checkpoint|model)\b/i.test(intent.idea)) gaps.push({dimension:'input',question:'Which ComfyUI checkpoint/model are you using?'});
  if(taskType==='decompiler' && /\badapt\b/i.test(intent.idea) && !intent.context && !/\b(?:from|original).*\b(?:to|for)\b/i.test(intent.idea)) gaps.push({dimension:'context',question:'What tool is the original prompt from, and what tool should it be adapted for?'});
  return gaps.slice(0,3);
}
