# Audit archive — point-in-time documents

Historical snapshots only. Every file here describes the repository **as it
was on the date in its filename**, was deliberately left unedited afterwards,
and is superseded by later work. Do not treat anything in this folder as a
description of the current codebase — the living documentation is `README.md`
(entry point), `ARCHITECTURE.md`, and the `docs/` guides.

| File                              | What it is                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2026-07-foundation-review.md`    | Formal architecture review before the foundation freeze. Most of its findings have since been implemented.                                                                  |
| `2026-07-foundation-audit.md`     | Read-only audit that drove the testing, layout, data-layer, and template-readiness phases. Likewise implemented.                                                            |
| `2026-07-health-audit.md`         | Repository health pass; source of the env/Zod bundle split and several other decisions cited from code comments.                                                            |
| `2026-07-comprehensive-review.md` | Read-only review of the frozen foundation across correctness, docs, security, a11y, tests, and bundle/CWV performance. Findings actioned on `chore/foundation-audit-fixes`. |

New audits and reviews land here with a `YYYY-MM-` prefix and are never
updated after the fact — corrections belong in the living docs. Add the row
here when a new one lands: a file the index denies exists undermines every
code comment that cites it.
