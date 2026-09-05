import {profiles} from './profiles.js';

const has=(s,re)=>re.test(s);
function explicitProfile(text,target){
  const s=text.toLowerCase();
  if(has(s,/\bclaude\b/)) return 'claude';
  if(has(s,/\bgemini\b/)) return 'gemini';
  if(has(s,/\bgrok\b|\bxai\b/)) return 'grok';
  if(has(s,/\bchatgpt\b|\bopenai\b|\bgpt[- ]?\d/)) return 'openai';
  if(has(s,/\bcursor\b|\bwindsurf\b|\bcopilot\b/)) return 'ide';
  if(has(s,/\bcodex\b|\bclaude code\b|\bcline\b|\bdevin\b|\bagent mode\b|\barena\b|\blovable\b/)) return 'agent';
  if(target==='visual') return 'visual';
  if(target==='agent') return 'agent';
  if(target==='chat') return 'general';
  return 'general';
}
function taskType(text,goal){
  const s=text.toLowerCase();
  if(has(s,/\badapt\b.*\bprompt\b|\brewrite\b.*\bprompt\b.*\bfor\b|\bdecompile\b.*\bprompt\b/)) return 'decompiler';
  if(has(s,/\bimage\b|\bphoto\b|\billustration\b|\bvideo\b|\brender\b|\bmidjourney\b|\bdall[- ]?e\b|\bsora\b/)) return 'visual';
  if(has(s,/\bresearch\b|\bcompare\b|\brecommend\b|\bcurrent\b|\blatest\b/)||goal==='research') return 'research';
  if(has(s,/\b(src\/|\.tsx\b|\.jsx\b|\.js\b|\.ts\b|function\b|component\b|handle[A-Z]\w*|cursor\b|windsurf\b)/)) return 'code-edit';
  if(has(s,/\bapp\b|\bwebsite\b|\bweb app\b|\bmobile\b|\bscreen\b|\bworkflow\b|\btracker\b|\bdashboard\b|\bfeature\b|\btimesheet\b|\bcalendar\b|\bbudget\b|\bcalculator\b|\bform\b|\blogin\b|\bnavigation\b|\bpunch in\b|\bpunch out\b/)) return 'app';
  if(goal==='build' && has(s,/\b(build|create|make|develop)\b/) && has(s,/\b(tool|system|product|utility|portal|interface|page|site)\b/)) return 'app';
  if(has(s,/\bemail\b|\barticle\b|\bcopy\b|\bcaption\b|\bpost\b|\breport\b|\bproposal\b|\bwrite\b/)) return 'writing';
  return 'general';
}
function templateFor(type,profile,text){
  if(type==='decompiler') return 'decompiler';
  if(type==='visual') return 'visual';
  if(type==='research') return 'auditable';
  if(type==='code-edit' && (profile==='ide'||profile==='agent')) return 'file-scope';
  if(type==='app') return 'risen';
  if(profile==='agent') return 'agent-stop';
  if(profile==='claude' && /complex|multi-step|repo|codebase|agent/i.test(text)) return 'claude-task-brief';
  if(type==='writing') return 'costar';
  return 'rtf';
}
export function routePrompt(intent){
  const profile=explicitProfile(intent.idea,intent.targetTool);
  const type=taskType(intent.idea,intent.goal);
  const template=templateFor(type,profile,intent.idea);
  return {taskType:type,profile,profileLabel:profiles[profile].label,template,rules:profiles[profile].rules};
}
