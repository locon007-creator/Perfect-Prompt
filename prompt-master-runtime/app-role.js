const ROLES={
  android:{label:'Android App Developer',guidance:'Favor Android/mobile conventions, thumb-friendly controls, appropriate app bars, bottom sheets/dialogs, responsive portrait layouts, and platform-appropriate interaction patterns.'},
  ios:{label:'iOS App Developer',guidance:'Favor iOS-native interaction conventions, hierarchy, sheets, navigation patterns, spacing, and restrained motion without cloning proprietary assets.'},
  web:{label:'Web App Developer',guidance:'Favor responsive web behavior, accessible browser controls, and multi-screen or state-driven navigation where appropriate.'},
  'full-stack':{label:'Full-Stack Product Engineer',guidance:'Balance product architecture, frontend behavior, state/data correctness, implementation constraints, and completion quality.'},
  'ui-ux':{label:'UI/UX Product Designer',guidance:'Prioritize information architecture, interaction hierarchy, screen composition, state design, visual coherence, and polish before implementation detail.'}
};

export function normalizeAppRole(value='auto'){
  const v=String(value||'auto').trim().toLowerCase();
  if(v==='android'||/android/.test(v)) return 'android';
  if(v==='ios'||/\bios\b|iphone|ipad/.test(v)) return 'ios';
  if(v==='web'||/web/.test(v)) return 'web';
  if(v==='ui-ux'||/ui\/?ux|product designer/.test(v)) return 'ui-ux';
  if(v==='full-stack'||/full.?stack|product engineer/.test(v)) return 'full-stack';
  return 'auto';
}

function explicitPlatform(text=''){
  const v=String(text).toLowerCase();
  if(/\bandroid\b/.test(v)) return 'android';
  if(/\bios\b|\biphone\b|\bipad\b/.test(v)) return 'ios';
  if(/\bresponsive web\b|\bweb app\b|\bbrowser app\b/.test(v)) return 'web';
  return '';
}

export function resolveAppRole({intent,taskType,selectedRole='auto'}={}){
  if(taskType!=='app') return null;
  const productPlatform=explicitPlatform(intent?.idea||'');
  const selected=normalizeAppRole(selectedRole);
  const context=`${intent?.idea||''} ${intent?.specificTool||''}`;
  let id=productPlatform||selected;
  if(id==='auto') id=explicitPlatform(context)||'full-stack';
  return {id,label:ROLES[id].label,guidance:ROLES[id].guidance};
}
