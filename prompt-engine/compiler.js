import {extractIntent} from './intent.js';
import {routePrompt} from './router.js';
import {diagnose} from './diagnostics.js';
import {renderPrompt} from './renderers.js';

export function compilePerfectPrompt(input={}){
  const intent=extractIntent(input);
  const route=routePrompt(intent);
  const diagnostics=diagnose(intent,route);
  const prompt=renderPrompt(intent,route);
  return {
    prompt,
    targetLabel:route.profileLabel,
    profile:route.profile,
    template:route.template,
    diagnostics,
    intent
  };
}
