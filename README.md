# Perfect Prompt

Perfect Prompt is a local, deterministic prompt-generation product built on the MIT-licensed Prompt Master project by Nidhin Joseph Nelson.

## Runtime authority

`prompt-master-runtime/` is the **only live compiler implementation** in this repository. The previous partial `prompt-engine/` implementation has been removed and must not be restored or referenced by application code or tests.

The browser runtime owns the complete compilation path:

1. intent extraction
2. critical-gap clarification
3. primary-task classification
4. model/tool profile routing
5. Prompt Master template selection (A–M)
6. 37-pattern diagnostics
7. deterministic repair
8. credential and agentic safety handling
9. final validation
10. one paste-ready result

The Perfect Prompt UI in `app.js` calls `compileWithPromptMaster()` directly. The wizard can pass a specific target tool, and critical Prompt Master clarifications are surfaced in the product before final output.

## Canonical Prompt Master sources

- `SKILL.md` — upstream Prompt Master rules and routing guidance
- `references/templates.md` — full prompt architecture/template library
- `references/patterns.md` — 37 prompt failure patterns
- `prompt-master-runtime/` — browser-safe executable implementation
- `docs/superpowers/specs/2026-09-05-full-prompt-master-runtime-design.md` — current architecture
- `docs/superpowers/plans/2026-09-05-full-prompt-master-runtime.md` — current implementation plan
- `LICENSE` — original MIT license and copyright notice

## Upstream

Original project: `nidhinjs/prompt-master`

Perfect Prompt carries the Prompt Master foundation locally so it does not depend on the upstream repository at runtime.

## License

The imported Prompt Master foundation is used under the MIT License. See `LICENSE` for the original copyright and license terms.
