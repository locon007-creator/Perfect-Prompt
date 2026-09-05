export const profiles={
  general:{label:'General AI',rules:['State the goal once','Make constraints explicit','Define what done looks like','Do not request hidden reasoning']},
  openai:{label:'ChatGPT / OpenAI',rules:['Use Goal, Context, Constraints, and Done for complex work','Keep instructions lean','Define tool-use evidence when needed','Do not request hidden reasoning']},
  claude:{label:'Claude',rules:['Be clear and direct','Use structured sections for complex work','Prefer positive instructions','For agentic work include scope, action boundaries, acceptance criteria, and evidence']},
  gemini:{label:'Gemini',rules:['Use explicit format locks','For factual work require grounded sources','If uncertain, say so instead of fabricating','Use long context only when relevant']},
  grok:{label:'Grok',rules:['Use outcome-focused Goal, Context, Constraints, Tools/Permissions, and Done','Require web/search citations for current facts','Define stop conditions for long tool loops','Do not request hidden reasoning']},
  agent:{label:'Coding / Agent Tool',rules:['Define starting and target state','Set allowed and forbidden actions','Add stop conditions','Require verification evidence','Keep scope bounded']},
  ide:{label:'IDE Coding Assistant',rules:['Anchor edits to exact files/functions when known','Include current and desired behavior','Add a do-not-touch boundary','Define Done When','Avoid unrelated refactors']},
  visual:{label:'Image / Video AI',rules:['Specify subject, setting, style, mood, lighting, composition, aspect ratio, and exclusions','Use tool-specific syntax only when the tool is explicit']}
};
