export const PURIFIER_VERSION='1.0.0';
export const PURIFIER_SEALED=true;

const DOMAIN_SIGNATURES=Object.freeze([
  {id:'trucking',re:/\b(?:drop\s*&\s*hook|drop trailer|hook trailer|trailer number|truck number|unit number|starting mileage|ending mileage|saved stops?|saved routes?|route\s*&\s*equipment|equipment edit|facility search)\b/i},
  {id:'timesheet',re:/\b(?:punch in|punch out|clock in|clock out|active shift|timesheet|hourly rate|gross pay|overtime|worked hours|monthly calendar)\b/i},
  {id:'prompting',re:/\b(?:prompt generator|prompt compiler|prompt station|copy prompt|arena ai|openrouter|model selector|prompt strategies)\b/i},
  {id:'finance',re:/\b(?:available balance|remaining budget|monthly income|budget categories?|savings goals?|recurring bills?|income transaction|expense transaction|merchant\/description)\b/i},
  {id:'loan',re:/\b(?:borrower|loan balance|payment arrangement|repayment schedule)\b/i},
  {id:'fitness',re:/\b(?:workout|exercise log|sets and reps|rest timer|personal record)\b/i},
  {id:'habits',re:/\b(?:habit tracker|daily habits?|streaks?|tap-to-complete|weekly target)\b/i},
  {id:'flashcards',re:/\b(?:flashcards?|study deck|self-grade|hard\s*\/\s*good\s*\/\s*easy|mastery meter)\b/i},
  {id:'recipes',re:/\b(?:recipe app|ingredients?|start cooking|cooking mode|meal plan)\b/i}
]);

const HEADINGS=new Set([
  'Role:','Product Mission:','Idea Lock:','Design & UX Standard:','Target User:',
  'Main Workflow:','Screen Architecture:','Required Product Behavior:','Constraints / Scope Lock:',
  'Interaction Rules:','Tool Guidance:','Allowed Actions:','Forbidden Actions:','Stop Conditions:',
  'Verification:','Done When:'
]);

const normalize=text=>String(text||'').replace(/\r\n?/g,'\n');

function activeDomains(sourceIdea){
  const source=normalize(sourceIdea);
  const active=new Set();
  for(const sig of DOMAIN_SIGNATURES){
    sig.re.lastIndex=0;
    if(sig.re.test(source)) active.add(sig.id);
  }
  return active;
}

function foreignDomain(line,allowed){
  for(const sig of DOMAIN_SIGNATURES){
    sig.re.lastIndex=0;
    if(!allowed.has(sig.id)&&sig.re.test(line)) return sig.id;
  }
  return null;
}

function bulletIndent(line){
  const m=String(line||'').match(/^(\s*)[-*•]\s+/);
  return m?m[1].length:null;
}

function removeOrphanLeadIns(lines){
  return lines.filter((line,i)=>{
    if(!/^\s*[-*•]\s+.+:\s*$/.test(line)) return true;
    let j=i+1;
    while(j<lines.length&&!lines[j].trim()) j++;
    if(j>=lines.length) return false;
    if(HEADINGS.has(lines[j].trim())) return false;
    const a=bulletIndent(line),b=bulletIndent(lines[j]);
    return !(a!==null&&b!==null&&b<=a);
  });
}

function removeExactDuplicates(lines){
  const seen=new Set();
  return lines.filter(line=>{
    const trimmed=line.trim();
    if(!trimmed||HEADINGS.has(trimmed)) return true;
    const key=trimmed.toLowerCase().replace(/\s+/g,' ');
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactBlankLines(lines){
  const out=[];
  for(const line of lines){
    if(!line.trim()&&(!out.length||!out[out.length-1].trim())) continue;
    out.push(line.replace(/[ \t]+$/g,''));
  }
  while(out.length&&!out[out.length-1].trim()) out.pop();
  return out;
}

export function assertPromptPure(output,sourceIdea){
  if(PURIFIER_SEALED!==true) throw new Error('Perfect Prompt purifier seal is invalid.');
  const allowed=activeDomains(sourceIdea);
  const leaked=[];
  for(const line of normalize(output).split('\n')){
    const domain=foreignDomain(line,allowed);
    if(domain) leaked.push(domain);
  }
  if(leaked.length) throw new Error(`Perfect Prompt purifier blocked cross-domain contamination: ${[...new Set(leaked)].join(', ')}`);

  const lines=normalize(output).split('\n');
  for(let i=0;i<lines.length;i++){
    if(!/^\s*[-*•]\s+.+:\s*$/.test(lines[i])) continue;
    let j=i+1;
    while(j<lines.length&&!lines[j].trim()) j++;
    const a=bulletIndent(lines[i]),b=j<lines.length?bulletIndent(lines[j]):null;
    if(j>=lines.length||HEADINGS.has(lines[j]?.trim())||(a!==null&&b!==null&&b<=a)){
      throw new Error('Perfect Prompt purifier blocked an orphaned requirement lead-in.');
    }
  }
  return true;
}

export function purifyPrompt(output,sourceIdea){
  if(PURIFIER_SEALED!==true) throw new Error('Perfect Prompt sealed purifier is unavailable. Generation is blocked.');
  const allowed=activeDomains(sourceIdea);
  let lines=normalize(output).split('\n');
  lines=lines.filter(line=>HEADINGS.has(line.trim())||!foreignDomain(line,allowed));
  lines=removeOrphanLeadIns(lines);
  lines=removeExactDuplicates(lines);
  lines=compactBlankLines(lines);
  const cleaned=lines.join('\n').trim();
  assertPromptPure(cleaned,sourceIdea);
  return cleaned;
}

export const purifierInfo=Object.freeze({version:PURIFIER_VERSION,sealed:PURIFIER_SEALED});
