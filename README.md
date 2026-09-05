# Perfect Prompt

Perfect Prompt is a local, deterministic prompt-generation product built on the MIT-licensed Prompt Master project by Nidhin Joseph Nelson.

## Runtime authority

`prompt-master-runtime/` is the **only live compiler implementation** in this repository. The previous partial `prompt-engine/` implementation has been removed and must not be restored or referenced by application code or tests.

The browser runtime owns the complete compilation path:

1. intent extraction
2. critical-gap clarification
3. primary-task classification
4. optional app-role resolution
5. model/tool profile routing
6. Prompt Master template selection (A–M)
7. automatic app Design & UX Standard injection when the task is an app/product build
8. 37-pattern diagnostics
9. deterministic repair
10. credential and agentic safety handling
11. final validation
12. one paste-ready result

The Perfect Prompt UI in `app.js` calls `compileWithPromptMaster()` directly. The wizard can pass a specific target tool, and critical Prompt Master clarifications are surfaced in the product before final output.

For app/product builds, Role is optional and defaults to Auto. Supported user-facing roles are Android App Developer, iOS App Developer, Web App Developer, Full-Stack Product Engineer, and UI/UX Product Designer. Role guidance may change platform conventions and implementation emphasis but must not change the product purpose, workflow, requested features, or exclusions.

Premium UI/UX is **automatic for every app/product prompt**, not a user-selectable quality level. The runtime requires production-ready hierarchy, coherent components, purposeful micro-interactions/animation, relevant polished states, and a first-screen quality gate that rejects generic prototype, dashboard, card-stack, or placeholder output.

## Canonical Prompt Master sources

- `SKILL.md` — upstream Prompt Master rules and routing guidance
- `references/templates.md` — full prompt architecture/template library
- `references/patterns.md` — 37 prompt failure patterns
- `prompt-master-runtime/` — browser-safe executable implementation
- `docs/superpowers/specs/2026-09-05-full-prompt-master-runtime-design.md` — full runtime architecture
- `docs/superpowers/specs/2026-09-05-role-and-premium-ui-quality-design.md` — app role and automatic UI/UX quality design
- `docs/superpowers/plans/2026-09-05-full-prompt-master-runtime.md` — full runtime implementation plan
- `docs/superpowers/plans/2026-09-05-role-and-premium-ui-quality.md` — app role and automatic UI/UX implementation plan
- `LICENSE` — original MIT license and copyright notice

## Upstream

Original project: `nidhinjs/prompt-master`

Perfect Prompt carries the Prompt Master foundation locally so it does not depend on the upstream repository at runtime.

## License

The imported Prompt Master foundation is used under the MIT License. See `LICENSE` for the original copyright and license terms.
