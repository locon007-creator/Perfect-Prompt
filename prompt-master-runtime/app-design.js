export function buildAppDesignStandard(role){
  return `Design & UX Standard:\n- Treat production-ready visual hierarchy as a requirement, not decoration. Use intentional spacing, typography, density, grouping, and coherent component hierarchy.\n- Make one next primary action unmistakable on workflow screens. Use navigation and controls appropriate to ${role?.label||'the target platform'}.\n- Design polished empty, active, loading, completed, saved, edited, disabled, and error states only where relevant.\n- Use a consistent visual language with restrained surfaces, borders, elevation, and color; do not fall back to unrelated cards or default generated UI.\n- Add purposeful micro-interactions and restrained animation for navigation, state changes, sheets/dialogs, button feedback, progress, and completion. Respect reduced-motion behavior when supported.\n- Avoid random motion, excessive glass, neon, gradients, or effects that slow the task.\n- A functional prototype is not complete. The first main screen must look like a finished premium product. If the result resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting the build.`;
}

export function buildAppDesignLayer(role){
  const label=role?.label||'Full-Stack Product Engineer';
  const guidance=role?.guidance||'Balance product architecture, frontend behavior, state/data correctness, implementation constraints, and completion quality.';
  return `Role:\n${label}\n${guidance}\n\n${buildAppDesignStandard(role)}`;
}
