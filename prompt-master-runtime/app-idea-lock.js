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

function matches(text, pattern) {
  return [...text.matchAll(pattern)].map(match => clean(match[0]).replace(/^[-•]\s*/, '')).filter(Boolean);
}

function compact(label, items) {
  const unique = [...new Set(items.map(clean).filter(Boolean))];
  return unique.length ? `${label}: ${unique.join(' ')}` : '';
}

function productBehaviorFromIdea(idea, flow) {
  const text = clean(idea);
  const lines = [];
  const add = value => {
    const v = clean(value).replace(/^[-•]\s*/, '');
    if (v && !lines.some(x => x.toLowerCase() === v.toLowerCase())) lines.push(v);
  };

  if (flow) add(`Preserve this exact state progression: ${flow}.`);

  const fields = blockAfterLabel(text, 'Fields');
  if (fields.length) add(`Required operational fields: ${fields.join(' · ')}.`);

  add(compact('Primary action state rules', matches(text, /[^\n.]*\b(?:Navigate|Arrive|Depart)\b[^\n.]*/ig)));
  add(compact('Equipment and trailer rules', matches(text, /[^\n.]*\b(?:Drop Trailer|Hook Trailer|Seal Number|Reference \/ Load Number|current trailer|trailer fields?)\b[^\n.]*/ig)));
  add(compact('Location and search rules', matches(text, /[^\n.]*\b(?:OSM|coordinates?|latitude|longitude|search results?|search behavior|Recent|Saved Stops)\b[^\n.]*/ig)));
  add(compact('Persistence rules', matches(text, /[^\n.]*\b(?:persist|remember|refreshing|reopening|saved routes|recent searches|daily history|locally)\b[^\n.]*/ig)));
  add(compact('Completion rules', matches(text, /[^\n.]*\b(?:final stop|Work Complete|Home Base|Navigate Home|Ending Mileage|Finish Day)\b[^\n.]*/ig)));

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
