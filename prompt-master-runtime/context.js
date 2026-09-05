export function buildContextBlock(intent,sessionContext=''){
  const source=String(sessionContext||intent.context||'').trim();
  if(!source) return '';
  const idea=(intent.idea||'').toLowerCase();
  const keywords=new Set(idea.match(/[a-z0-9][a-z0-9-]{3,}/g)||[]);
  const lines=source.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const relevant=lines.filter(line=>{
    const words=line.toLowerCase().match(/[a-z0-9][a-z0-9-]{3,}/g)||[];
    return words.some(w=>keywords.has(w))||/\b(stack|workflow|must|do not|theme|mobile|repo|file|prior|failed|decision|constraint)\b/i.test(line);
  }).slice(0,12);
  if(!relevant.length) return '';
  return `Memory / Context:\n${relevant.map(x=>`- ${x}`).join('\n')}`;
}
