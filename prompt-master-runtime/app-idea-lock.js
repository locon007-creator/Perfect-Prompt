const clean = value => String(value || '').replace(/\r/g, '').trim();
const bullet = value => `- ${clean(value).replace(/^[-•]\s*/, '')}`;

function explicitFlow(idea) {
  const match = clean(idea).match(/(?:main workflow|primary workflow|main flow|workflow)\s*:\s*([^\n.]+)/i);
  return match ? match[1].trim() : '';
}

function blockAfterLabel(idea, label) {
  const lines = clean(idea).split('\n').map(x => x.trim());
  const labelRx = new RegExp(`^${label}\\s*:?(?:\\s+(.*))?$`, 'i');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelRx);
    if (!match) continue;
    const out = [];
    if (match[1]) out.push(match[1]);
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (!line) {
        if (out.length) break;
        continue;
      }
      if (/^[A-Z][A-Za-z &/+()-]{2,36}:?$/.test(line) && !/^[-•]/.test(line)) break;
      out.push(line.replace(/^[-•]\s*/, ''));
      if (out.length >= 8) break;
    }
    return out.filter(Boolean);
  }
  return [];
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
    const fieldsMatch = text.match(/Fields:\s*([^\n]+)/i);
    const fields = fieldsMatch ? fieldsMatch[1].replace(/\.$/, '').trim() : 'Drop Trailer, Hook Trailer';
    const carry = sourceHas(text, /Hook Trailer[^\n.]*next stop[^\n.]*Drop Trailer|carry[^\n.]*Hook Trailer[^\n.]*Drop Trailer/i)
      ? ' Carry Hook Trailer forward as the next stop’s Drop Trailer.'
      : '';
    add(`Drop & Hook: keep the explicitly requested fields (${fields}) together in the active-stop workflow; suggest remembered trailer numbers when requested.${carry}`);
  }

  if (sourceHas(text, /\bOSM\b|search results?|location search/i)) {
    const onlySearch = sourceHas(text, /OSM[^\n.]*search only|use OSM for search only/i) ? 'Use OSM for search only; ' : '';
    const visible = sourceHas(text, /Business Name[^\n.]*Full Address/i) ? 'show only Business Name and Full Address; ' : '';
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
  for (const match of text.matchAll(/[^\n.]*\b(?:not |do not|don't|never|only|no )[^\n.]*/ig)) add(match[0]);
  if (!lines.length) add('Do not add product behavior that is not supported by the Idea Lock.');
  return lines.slice(0, 7);
}

function replaceSection(prompt, heading, lines) {
  if (!lines.length) return prompt;
  const body = lines.map(bullet).join('\n');
  const rx = new RegExp(`(^|\\n\\n)${heading}:\\n[\\s\\S]*?(?=\\n\\n[A-Za-z][A-Za-z &/()-]{1,48}:|$)`, 'm');
  const replacement = `$1${heading}:\n${body}`;
  return rx.test(prompt) ? prompt.replace(rx, replacement) : `${prompt}\n\n${heading}:\n${body}`;
}

export function applyAppIdeaLock(prompt, idea) {
  const source = clean(idea);
  if (!source) return prompt;
  const flow = explicitFlow(source);
  const states = flowStates(flow);
  const architecture = [];
  if (flow) architecture.push(`Workflow screens/states, in order: ${states.join(' · ')}.`);
  architecture.push('Keep supporting views secondary; do not invent destinations that are absent from the Idea Lock.');

  let out = clean(prompt);
  out = replaceSection(out, 'Product Mission', [purposeFromIdea(source)]);
  out = replaceSection(out, 'Target User', [targetUserFromIdea(source)]);
  if (flow) out = replaceSection(out, 'Main Workflow', [`Required flow: ${flow}.`, 'Keep this order unless the Idea Lock explicitly defines a branch.']);
  out = replaceSection(out, 'Screen Architecture', architecture);
  out = replaceSection(out, 'Required Product Behavior', productBehaviorFromIdea(source, flow));
  out = replaceSection(out, 'Constraints / Scope Lock', scopeFromIdea(source));
  return out;
}

export const _test = {explicitFlow, blockAfterLabel, purposeFromIdea, targetUserFromIdea, productBehaviorFromIdea};
