export function chooseStrategy(intent,taskType){
  const text=intent.idea||'';
  const explicitExamples=Array.isArray(intent.examples)&&intent.examples.length>=2;
  const formatCritical=/\bexact format|same pattern|match (?:this|the) format|schema|json shape|repeat this pattern\b/i.test(text);
  const clauses=text.split(/\b(?:and also|also|plus|then separately|in addition)\b/i).map(x=>x.trim()).filter(Boolean);
  const independent=/\b(?:two separate|separate tasks|split into|first .* then .* unrelated)\b/i.test(text);
  return {
    useFewShot:explicitExamples||formatCritical,
    split:independent&&clauses.length>1,
    splitTasks:independent?clauses:[],
    reason:explicitExamples||formatCritical?'format reliability':independent?'multiple independent tasks':'single coherent task'
  };
}
