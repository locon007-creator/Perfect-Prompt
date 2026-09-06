const clean = value => String(value || '').replace(/\r/g, '').trim();
const bullet = value => `- ${clean(value).replace(/^[-•]\s*/, '')}`;

function linesOf(idea) {
  return clean(idea).split('\n').map(x => x.trim());
}

function isSentenceLike(line) {
  return /[.!?]$/.test(line) || /^(?:never|do not|don't|remember|when|pressing|use|allow|include|keep|store|avoid|the |its |it )\b/i.test(line);
}

function labeledValues(idea, label, max = 12) {
  const lines = linesOf(idea);
  const starts = new RegExp(`^(${label})\\b(.*)$`, 'i');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(starts);
    if (!match) continue;
    const out = [];
    const rest = (match[2] || '').trim();
    if (rest) {
      const colon = rest.indexOf(':');
      if (colon >= 0) {
        const after = rest.slice(colon + 1).trim();
        if (after) out.push(after.replace(/^[-•]\s*/, ''));
      } else {
        out.push(rest.replace(/^[-•]\s*/, ''));
      }
    }
    for (let j = i + 1; j < lines.length && out.length < max; j++) {
      const line = lines[j];
      if (!line) {
        if (out.length) break;
        continue;
      }
      if (/^[^:]{2,60}:$/.test(line) && !/^[-•]/.test(line)) break;
      if (/^[-•]\s*/.test(line)) {
        out.push(line.replace(/^[-•]\s*/, ''));
        continue;
      }
      if (isSentenceLike(line)) break;
      if (/^(?:State\s+\d|Button|Navigate|Arrive|Depart|Setup|Work Mode|Create Route|Search Memory|Start Route|Final Stop|End of Day|Persistence|Visual Direction)\b/i.test(line)) break;
      if (line.length <= 64) {
        out.push(line);
        continue;
      }
      break;
    }
    return out.filter(Boolean);
  }
  return [];
}

function explicitFlow(idea) {
  const text = clean(idea);
  const inline = text.match(/(?:main workflow|primary workflow|main flow|workflow)\s*:\s*([^\n.]+)/i);
  if (inline) return inline[1].trim();
  const lines = linesOf(text);
  const heading = /^(?:Main Workflow|Primary Workflow|Main Flow|Workflow)$/i;
  for (let i = 0; i < lines.length; i++) {
    if (!heading.test(lines[i])) continue;
    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j]) continue;
      if (/(?:→|->|>)/.test(lines[j])) return lines[j].trim();
      break;
    }
  }
  return '';
}

function blockAfterLabel(idea, label) {
  return labeledValues(idea, label, 8);
}

function purposeFromIdea(idea) {
  const text = clean(idea);
  const purpose = text.match(/(?:its\s+)?purpose\s+(?:is|:)\s*([^\n]+?)(?=\n|$)/i);
  if (purpose) return purpose[1].trim();
  const job = text.match(/(?:its|the app(?:'s)?)\s+job\s+(?:is|:)\s*([^\n.]+(?:\.)?)/i);
  if (job) return job[1].trim();
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
  const descriptive = lines.find((x, i) => i > 0 && x.length > 28 && /\b(?:is|helps?|keeps?|organizes?|tracks?|manages?|allows?|lets?)\b/i.test(x));
  if (descriptive) return descriptive;
  const first = lines.find(x => x && !/^(product brief|idea lock|target user|main workflow)$/i.test(x));
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

function operationalFields(text) {
  const candidates = [
    ...labeledValues(text, 'Fields', 12),
    ...labeledValues(text, 'Each value gets one clean row', 12)
  ];
  const filtered = candidates.filter(value =>
    value.length <= 64 &&
    !/^(?:State\s+\d|Button|When pressed|Navigate|Arrive|Depart)\b/i.test(value)
  );
  return [...new Map(filtered.map(v => [v.toLowerCase(), v])).values()];
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
    const listFields = operationalFields(text);
    const inlineFields = text.match(/Fields:\s*([^\n.]+)/i);
    const fields = listFields.length ? listFields.join(', ') : (inlineFields ? inlineFields[1].trim() : 'Drop Trailer, Hook Trailer');
    const carry = sourceHas(text, /Hook Trailer[^\n.]*next stop[^\n.]*Drop Trailer|carry[^\n.]*Hook Trailer[^\n.]*Drop Trailer/i)
      ? ' Carry Hook Trailer forward as the next stop’s Drop Trailer.'
      : '';
    add(`Drop & Hook: keep the explicitly requested fields (${fields}) together in the active-stop workflow; suggest remembered trailer numbers when requested.${carry}`);
  }

  if (sourceHas(text, /\bOSM\b|search results?|location search/i)) {
    const onlySearch = sourceHas(text, /OSM[^\n.]*search only|use OSM for search(?: and location selection)?/i) ? 'Use OSM for search only; ' : '';
    const visibleList = [
      ...labeledValues(text, 'Search results display only', 8),
      ...labeledValues(text, 'Search results show only', 8)
    ];
    const visibleUnique = [...new Map(visibleList.map(v => [v.toLowerCase(), v])).values()];
    const visible = visibleUnique.length
      ? `show only ${visibleUnique.join(' and ')}; `
      : (sourceHas(text, /Business Name[^\n.]*Full Address/i) ? 'show only Business Name and Full Address; ' : '');
    const hidden = sourceHas(text, /never (?:display|expose) coordinates|never expose[^\n.]*latitude|do not show[^\n.]*(?:map|coordinates)|coordinates[^\n.]*internally/i) ? 'keep coordinates and technical location data internal; ' : '';
    const stable = sourceHas(text, /debounce|flicker|layout jumping|page jumping/i) ? 'debounce result updates without flicker, focus loss, or layout jumps.' : 'keep search interaction stable and task-focused.';
    add(`Location search: ${onlySearch}${visible}${hidden}${stable}`);
  }

  if (sourceHas(text, /\bRecent\b|frequently used|Saved Stops|search memory/i)) {
    add('Search memory: prioritize Recent, frequently used locations, and Saved Stops when requested; avoid duplicates and persist selections locally.');
  }

  if (sourceHas(text, /\bpersist\b|refreshing|reopening|locally/i)) {
    add('Persistence: preserve every explicitly named active value and saved record locally so refresh, close, or reopen never resets required progress.');
  }

  if (sourceHas(text, /final stop|Work Complete|Day Complete|Home Base|Navigate Home|Ending Mileage|Finish Day/i)) {
    const parts = [];
    if (sourceHas(text, /Work Complete|Day Complete/i)) parts.push('show the requested completion state after the final stop');
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
    if (!v) return;
    if (/^(?:Collect only|Search results (?:display|show) only):?$/i.test(v)) return;
    if (v && !lines.includes(v)) lines.push(v);
  };

  const collectOnly = labeledValues(text, 'Collect only', 12);
  if (collectOnly.length) add(`Collect only: ${collectOnly.join(' · ')}`);
  const searchOnly = [
    ...labeledValues(text, 'Search results display only', 12),
    ...labeledValues(text, 'Search results show only', 12)
  ];
  const searchUnique = [...new Map(searchOnly.map(v => [v.toLowerCase(), v])).values()];
  if (searchUnique.length) add(`Search results display only: ${searchUnique.join(' · ')}`);

  for (const match of text.matchAll(/[^\n.]*\b(?:not |do not|don't|never|only|no )[^\n.]*/ig)) {
    const value = match[0].trim();
    if (/^(?:Collect only|Search results (?:display|show) only):?$/i.test(value)) continue;
    if (/^Collect only\b[^:]*:?$/i.test(value)) continue;
    if (/^Search results (?:display|show) only\b[^:]*:?$/i.test(value)) continue;
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

function isLikelyTruncatedLine(line) {
  const value = clean(line).replace(/^[-•]\s*/, '');
  if (isLikelyTruncatedBullet(line)) return true;
  if (/\b(?:mark|record|save|set|change|show|open|enable|disable|update|collect|store)\b[^\n]*\s[A-Za-z]$/i.test(value)) return true;
  return false;
}

function collapseAdjacentDuplicateBlocks(lines) {
  let out = [...lines];
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let start = 0; start < out.length; start++) {
      for (let size = Math.floor((out.length - start) / 2); size >= 3; size--) {
        const a = out.slice(start, start + size);
        const b = out.slice(start + size, start + size * 2);
        if (a.length === b.length && a.every((line, i) => line === b[i])) {
          out.splice(start + size, size);
          changed = true;
          break outer;
        }
      }
    }
  }
  return out;
}

export function sanitizeIdeaSource(idea) {
  const raw = String(idea || '').replace(/\r/g, '').split('\n');
  const filtered = raw.filter(line => !isLikelyTruncatedLine(line));
  return collapseAdjacentDuplicateBlocks(filtered).join('\n').trim();
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
  out = out.split('\n').filter(line => !isLikelyTruncatedLine(line)).join('\n');
  return out;
}

export const _test = {explicitFlow, blockAfterLabel, purposeFromIdea, targetUserFromIdea, productBehaviorFromIdea, scopeFromIdea, sanitizeIdeaSource, labeledValues, operationalFields};