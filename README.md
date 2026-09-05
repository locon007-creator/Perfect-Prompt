# Perfect Prompt

Perfect Prompt is a local, deterministic prompt-generation app built on the MIT-licensed Prompt Master foundation by Nidhin Joseph Nelson.

## Runtime authority

`prompt-master-runtime/` is the **only live prompt compiler** in this repository. The earlier partial `prompt-engine/` implementation has been removed and must not be reintroduced as a fallback, compatibility layer, test dependency, or alternate route.

The browser flow is:

**Idea + Wizard → 9-dimension intent extraction → critical clarification when required → primary-task classification → tool/model routing → Prompt Master template selection → 37-pattern diagnostics → repair → safety checks → final validation → result**

Critical questions are shown only when Prompt Master cannot safely infer required information, with a maximum of three questions. Clarification answers are fed back into the same Prompt Master runtime before final compilation.

## Prompt Master foundation

- `SKILL.md` — imported Prompt Master knowledge and routing guidance
- `references/templates.md` — complete Prompt Master template/reference library
- `references/patterns.md` — all 37 failure-pattern references
- `prompt-master-runtime/` — browser-safe executable Prompt Master runtime used by Perfect Prompt
- `tests/` — parity, routing, safety, authority, and regression coverage
- `LICENSE` — original MIT license and copyright notice

Perfect Prompt does not require an external AI call, database, or cloud prompt-history service for compilation. Prompt ideas, wizard choices, clarification answers, diagnostics, repairs, and final prompt generation stay in the browser.

## Upstream

Original project: `nidhinjs/prompt-master`

Perfect Prompt may add product-specific UI and deterministic integration behavior, but Prompt Master remains the sole prompt-engineering runtime authority.

## License

The Prompt Master foundation is used under the MIT License. See `LICENSE` for the original copyright and license terms.
