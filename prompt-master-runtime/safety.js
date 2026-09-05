const SECRET_PATTERNS=[
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\b(?:api[_ -]?key|token|secret|password|connection string)\s*[:=]\s*[^\s,;]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}=*/gi
];

export function sanitizePromptInput(input={}){
  let idea=String(input.idea||''); let removed=false;
  for(const re of SECRET_PATTERNS){idea=idea.replace(re,m=>{removed=true;const label=/api|key/i.test(m)?'[API_KEY]':'[CREDENTIAL]';return label})}
  return {...input,idea,credentialNotice:removed?'Credentials removed. Set required secrets as environment variables or authenticated tool connections instead of embedding them in prompts.':''};
}

export function agenticAccessWarning(profile,taskType){
  const agentProfiles=new Set(['claude-code','codex','cursor-windsurf','cline','autonomous-agent','app-generator','browser-agent']);
  if(!agentProfiles.has(profile?.id)&&!['agentic','code-edit'].includes(taskType)) return '';
  return 'This prompt is for an agentic tool with real system access. Review the scope locks, forbidden actions, and stop conditions before pasting. Confirm file paths, directories, permissions, and approval boundaries match the actual project.';
}
