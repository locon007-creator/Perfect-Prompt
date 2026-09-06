const clean = value => String(value || '').replace(/\r/g, '').trim();
const bullet = value => `- ${clean(value).replace(/^[-•]\s*/, '')}`;

function linesOf(idea) {
  return clean(idea).split('\n').map(x => x.trim());
}

function labeledValues(idea, label, max = 12) {
  const lines = linesOf(idea);
  const labelRx = new RegExp(`^${label}\\s*:?(?:\\s+(.*))?$`, 'i');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelRx);
    if (!match) continue;
    const out = [];
    if (match[1]) out.push(match[1].replace(/^[-•]\s*/, ''));
    for (let j = i + 1; j < lines.length && out.length < max; j++) {
      const line = lines[j];
      if (!line) {
        if (out.length) break;
        continue;
      }
      if (/^[A-Z][A-Za-z &/+()-]{2,40}:?$/.test(line) && !/^[-•]/.test(line)) break;
      if (/^[-•]\s*/.test(line)) {
        out.push(line.replace(/^[-•]\s*/, ''));
        continue;
      }
      if (!out.length) out.push(line);
      else break;
    }
    return out.filter(Boolean);
  }
  return [];
}

function explicitFlow(idea) {
  const inline = clean(idea).match(/(?:main workflow|primary workflow|main flow|workflow)\s*:\s*([^\n.]+)/i);
  if (inline) return inline[1].trim();
  const block = labeledValues(idea, '(?:Main Workflow|Primary Workflow|Main Flow|Workflow)', 2);
  return block.find(value => /(?:→|->|>)/.test(value)) || '';
}

function blockAfterLabel(idea, label) {
  return labeledValues(idea, label, 8);
}

function purposeFromIdea(idea) {
  const text = clean(idea);
  const match = text.match(/(?:its\s+)?purpose\s+(?:is|:)\s*([^\n]+?)(?=\n|$)/i);
  if (match) return match[1].trim();
  const first = text.split('\n').map(x => x.trim()).find(x => x && !/^(product brief|idea lock|target user|main workflow)$/i.test(x));
  return first || 'Build the product described in the Idea Lock without changing its purpose.';
}

function targetUserFromIdea(idea) {
  const block = blockAfterLabel(idea, 'Target User');
  if (block.length) return block[0];
  const inline = clean(idea).match(/\bfor\s+(one|a|an|the)\s+([^.,\n]+)/i);
  return inline ? `${inline[1]} ${inline[2]}` : 'Use only the real-world user explicitly described in the Idea Lock.';
}

function flowStates(flow) {
  return flow.split(/\s*(?:→|->|>)\s*/).map(x => x.trim()).filter(Boolean);
}

function sourceHas(text, pattern) {
  return pattern.test(text);
}

function productBehaviorFromIdea(idea, flow) {
  const text = clean(idea);
  const lines = [];
  const add = value => {
    const v = clean(value).replace(/^[-•]\s*/, '');
    if (v && !lines.some(x => x.toLowerCase() === v.toLowerCase())) lines.push(v);
  };

  if (flow) add(`Preserve this exact state progression: ${flow}.`);

  if (sourceHas(text, /\bNavigate\b/i) && sourceHas(text, /\bArrive\b/i) && sourceHas(text, /\bDepart\b/i)) {
    add('Primary action: Navigate opens external navigation and advances to Arrive; Arrive records the arrival time and changes to Depart; Depart records departure, completes the stop, and activates the next stop at Navigate.');
  }

  const hasDropHook = sourceHas(text, /\bDrop Trailer\b/i) || sourceHas(text, /\bHook Trailer\b/i);
  if (hasDropHook) {
    const listFields = labeledValues(text, 'Fields', 12);
    const inlineFields = text.match(/Fields:\s*([^\n.]+)/i);
    const fields = listFields.length ? listFields.join(', ') : (inlineFields ? inlineFields[1].trim() : 'Drop Trailer, Hook Trailer');
    const carry = sourceHas(text, /Hook Trailer[^\n.]*next stop[^\n.]*Drop Trailer|carry[^\n.]*Hook Trailer[^\n.]*Drop Trailer/i)
      ? ' Carry Hook Trailer forward as the next stop’s Drop Trailer.'
      : '';
    add(`Drop & Hook: keep the explicitly requested fields (${fields}) together in the active-stop workflow; suggest remembered trailer numbers when requested.${carry}`);
  }

  if (sourceHas(text, /\bOSM\b|search results?|location search/i)) {
    const onlySearch = sourceHas(text, /OSM[^\n.]*search only|use OSM for search only/i) ? 'Use OSM for search only; ' : '';
    const visibleList = labeledValues(text, 'Search results display only', 8);
    const visible = visibleList.length
      ? `show only ${visibleList.join(' and ')}; `
      : (sourceHas(text, /Business Name[^\n.]*Full Address/i) ? 'show only Business Name and Full Address; ' : '');
    const hidden = sourceHas(text, /never display coordinates|do not show[^\n.]*(?:map|coordinates)|coordinates[^\n.]*internally/i) ? 'keep coordinates and technical location data internal; ' : '';
    const stable = sourceHas(text, /debounce|flicker|layout jumping/i) ? 'debounce result updates without flicker, focus loss, or layout jumps.' : 'keep search interaction stable and task-focused.';
    add(`Location search: ${onlySearch}${visible}${hidden}${stable}`);
  }

  if (sourceHas(text, /\bRecent\b|frequently used|Saved Stops|search memory/i)) {
    add('Search memory: prioritize Recent, frequently used locations, and Saved Stops when requested; avoid duplicates and persist selections locally.');
  }

  if (sourceHas(text, /\bpersist\b|refreshing|reopening|locally/i)) {
    add('Persistence: preserve every explicitly named active-workday value and saved record locally so refresh, close, or reopen never resets required progress.');
  }

  if (sourceHas(text, /final stop|Work Complete|Home Base|Navigate Home|Ending Mileage|Finish Day/i)) {
    const parts = [];
    if (sourceHas(text, /Work Complete/i)) parts.push('show Work Complete after the final stop');
    if (sourceHas(text, /Home Base|Navigate Home/i)) parts.push('offer Navigate Home when Home Base exists without forcing it');
    if (sourceHas(text, /Ending Mileage/i)) parts.push('collect Ending Mileage before the day is saved');
    if (sourceHas(text, /Finish Day/i)) parts.push('keep Finish Day as the completion action');
    add(`Completion: ${parts.join('; ')}.`);
  }

  if (lines.length < 3) {
    for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
      if (lines.length >= 5) break;
      if (/\b(?:must|should|when|persist|remember|save|record|show|open|enable|disable|update|calculate)\b/i.test(sentence)) add(sentence);
    }
  }

  return lines.filter(Boolean).slice(0, 7);
}

function scopeFromIdea(idea) {
  const text = clean(idea);
  const lines = [];
  const add = value => {
    const v = clean(value).replace(/^[-•]\s*/, '');
    if (v && !lines.includes(v)) lines.push(v);
  };

  const collectOnly = labeledValues(text, 'Collect only', 12);
  if (collectOnly.length) add(`Collect only: ${collectOnly.join(' · ')}`);
  const searchOnly = labeledValues(text, 'Search results display only', 12);
  if (searchOnly.length) add(`Search results display only: ${searchOnly.join(' · ')}`);

  for (const match of text.matchAll(/[^\n.]*\b(?:not |do not|don't|never|only|no )[^\n.]*/ig)) {
    const value = match[0].trim();
    if (/^(?:Collect only|Search results display only):?$/i.test(value)) continue;
    add(value);
  }
  if (!lines.length) add('Do not add product behavior that is not supported by the Idea Lock.');
  return lines.slice(0, 7);
}

function isLikelyTruncatedBullet(line) {
  const match = clean(line).match(/^[-•]\s*([A-Za-z]{1,4})$/);
  if (!match) return false;
  const keep = new Set(['add','edit','save','open','show','hide','run','stop','done','yes','no','on','off','gps','ui']);
  return !keep.has(match[1].toLowerCase());
}

function sanitizeIdeaSource(idea) {
  const lines = String(idea || '').replace(/\r/g, '').split('\n');
  return lines.filter(line => !isLikelyTruncatedBullet(line)).join('\n').trim();
}

function replaceSection(prompt, heading, lines) {
  if (!lines.length) return prompt;
  const body = lines.map(bullet).join('\n');
  const rx = new RegExp(`(^|\\n\\n)${heading}:\\n[\\s\\S]*?(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`, 'm');
  const replacement = `$1${heading}:\n${body}`;
  return rx.test(prompt) ? prompt.replace(rx, replacement) : `${prompt}\n\n${heading}:\n${body}`;
}

function replaceIdeaLock(prompt, source) {
  const rx = /(^|\n\n)Idea Lock:\n[\s\S]*?(?=\n\nDesign & UX Standard:|\n\nTarget User:|$)/m;
  const replacement = `$1Idea Lock:\n${source}`;
  return rx.test(prompt) ? prompt.replace(rx, replacement) : prompt;
}

export function applyAppIdeaLock(prompt, idea) {
  const source = sanitizeIdeaSource(idea);
  if (!source) return prompt;
  const flow = explicitFlow(source);
  const states = flowStates(flow);
  const architecture = [];
  if (flow) architecture.push(`Workflow screens/states, in order: ${states.join(' · ')}.`);
  architecture.push('Keep supporting views secondary; do not invent destinations that are absent from the Idea Lock.');

  let out = clean(prompt);
  out = replaceIdeaLock(out, source);
  out = replaceSection(out, 'Product Mission', [purposeFromIdea(source)]);
  out = replaceSection(out, 'Target User', [targetUserFromIdea(source)]);
  if (flow) out = replaceSection(out, 'Main Workflow', [`Required flow: ${flow}.`, 'Keep this order unless the Idea Lock explicitly defines a branch.']);
  out = replaceSection(out, 'Screen Architecture', architecture);
  out = replaceSection(out, 'Required Product Behavior', productBehaviorFromIdea(source, flow));
  out = replaceSection(out, 'Constraints / Scope Lock', scopeFromIdea(source));
  return out;
}

export const _test = {explicitFlow, blockAfterLabel, purposeFromIdea, targetUserFromIdea, productBehaviorFromIdea, scopeFromIdea, sanitizeIdeaSource, labeledValues};
