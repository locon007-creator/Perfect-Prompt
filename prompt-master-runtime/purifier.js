export const PURIFIER_VERSION='1.2.0';
export const PURIFIER_SEALED=true;

const DOMAIN_SIGNATURES=Object.freeze([
  {id:'trucking',re:/\b(?:drop\s*&\s*hook|drop trailer|hook trailer|trailer number|truck number|unit number|starting mileage|ending mileage|saved stops?|saved routes?|route\s*&\s*equipment|equipment edit|facility search|home base|work mode)\b/i},
  {id:'timesheet',re:/\b(?:punch in|punch out|clock in|clock out|active shift|timesheet|hourly rate|gross pay|overtime|worked hours|monthly calendar)\b/i},
  {id:'prompting',re:/\b(?:prompt generator|prompt compiler|prompt station|copy prompt|arena ai|openrouter|model selector|prompt strategies)\b/i},
  {id:'finance',re:/\b(?:available balance|remaining budget|monthly income|budget categories?|savings goals?|recurring bills?|income transaction|expense transaction|merchant\/description|amount remaining|add spending)\b/i},
  {id:'loan',re:/\b(?:borrower|loan balance|payment arrangement|repayment schedule|payment schedule|remaining loan)\b/i},
  {id:'fitness',re:/\b(?:workout|exercise log|sets and reps|rest timer|personal record|training session)\b/i},
  {id:'health',re:/\b(?:hydration|water intake|symptom log|medication log|blood pressure|glucose|health tracker)\b/i},
  {id:'habits',re:/\b(?:habit tracker|daily habits?|streaks?|tap-to-complete|weekly target|habit check-in)\b/i},
  {id:'flashcards',re:/\b(?:flashcards?|study deck|self-grade|hard\s*\/\s*good\s*\/\s*easy|mastery meter)\b/i},
  {id:'recipes',re:/\b(?:recipe app|ingredients?|start cooking|cooking mode|meal plan|prep time)\b/i},
  {id:'focus',re:/\b(?:focus timer|focus session|break length|focused minutes|countdown timer|pomodoro)\b/i}
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

function neutralizeKnownGeneratorLeak(line,sourceIdea){
  let text=String(line||'');
  const source=normalize(sourceIdea).toLowerCase();
  text=text.replace(/\bactive work\b/gi,'active progress');
  if(/Search memory:/i.test(text)&&/Saved Stops/i.test(text)&&! /\bSaved Stops?\b/i.test(source)){
    text=text.replace(/,?\s*and Saved Stops when requested/gi,' when requested')
      .replace(/Recent, frequently used locations\s+when requested/gi,'Recent and frequently used locations when requested');
  }
  return text;
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

function assertSingleCanonicalSections(lines){
  const counts=new Map();
  for(const line of lines){
    const t=line.trim();
    if(!HEADINGS.has(t)) continue;
    counts.set(t,(counts.get(t)||0)+1);
  }
  const duplicates=[...counts].filter(([,count])=>count>1).map(([name])=>name);
  if(duplicates.length) throw new Error(`Perfect Prompt purifier blocked duplicate canonical sections: ${duplicates.join(', ')}`);
}

function assertSingleNavigationDeclaration(lines){
  const nav=lines.filter(line=>/^\s*[-*•]\s+Primary supporting destinations:/i.test(line));
  if(nav.length>1) throw new Error('Perfect Prompt purifier blocked conflicting navigation declarations.');
}

function assertNoOrphanFragments(lines){
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!/^\s*[-*•]\s+.+:\s*$/.test(line)) continue;
    let j=i+1;
    while(j<lines.length&&!lines[j].trim()) j++;
    const a=bulletIndent(line),b=j<lines.length?bulletIndent(lines[j]):null;
    if(j>=lines.length||HEADINGS.has(lines[j]?.trim())||(a!==null&&b!==null&&b<=a)){
      throw new Error('Perfect Prompt purifier blocked an orphaned requirement lead-in.');
    }
  }
}

export function assertPromptPure(output,sourceIdea){
  if(PURIFIER_SEALED!==true) throw new Error('Perfect Prompt purifier seal is invalid.');
  const allowed=activeDomains(sourceIdea);
  const lines=normalize(output).split('\n');
  const leaked=[];
  for(const line of lines){
    const domain=foreignDomain(line,allowed);
    if(domain) leaked.push(domain);
  }
  if(leaked.length) throw new Error(`Perfect Prompt purifier blocked cross-domain contamination: ${[...new Set(leaked)].join(', ')}`);
  assertSingleCanonicalSections(lines);
  assertSingleNavigationDeclaration(lines);
  assertNoOrphanFragments(lines);
  return true;
}

export function purifyPrompt(output,sourceIdea){
  if(PURIFIER_SEALED!==true) throw new Error('Perfect Prompt sealed purifier is unavailable. Generation is blocked.');
  const allowed=activeDomains(sourceIdea);
  let lines=normalize(output).split('\n').map(line=>neutralizeKnownGeneratorLeak(line,sourceIdea));
  lines=lines.filter(line=>HEADINGS.has(line.trim())||!foreignDomain(line,allowed));
  lines=removeOrphanLeadIns(lines);
  lines=removeExactDuplicates(lines);
  lines=compactBlankLines(lines);
  const cleaned=lines.join('\n').trim();
  assertPromptPure(cleaned,sourceIdea);
  return cleaned;
}

export const purifierInfo=Object.freeze({version:PURIFIER_VERSION,sealed:PURIFIER_SEALED});
