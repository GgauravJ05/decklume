# Roadmap and task briefs

Each file here is a self-contained brief for one piece of planned work. To start
one, open a Claude Code session in this repo and say, for example:

> Read `docs/roadmap/phase-2-signature-themes.md` and do the Folio part.

Claude also reads [`CLAUDE.md`](../../CLAUDE.md) automatically, which carries the
commands, quality gates and the small-commit → PR → merge-commit workflow, so
the briefs don't repeat them.

## Status

| Brief | Status | Notes |
| --- | --- | --- |
| Phase 0: guardrails (13-theme QA in CI, `dead-space` check, theme matrix) | Done | PR #12 |
| Phase 4: one source for version and counts | Done | `scripts/site/facts.mjs` + test |
| Phase 1: shared engine fixes (space, type size, charts, artwork, titles) | Done | PR #13 |
| [Phase 2: signature compositions for five themes](phase-2-signature-themes.md) | Next | One PR per theme |
| [Phase 3: SEO](phase-3-seo.md) | Planned | Independent, can run any time |
| [Demo video pipeline](demo-video.md) | Working | Recorder + soundtrack in `scripts/demo/`; voice-over next |
| [Known issues and leftovers](known-issues.md) | Open | Small fixes worth picking up between phases |

Update this table in the same PR that finishes a brief.

## Writing a new brief

Keep the same shape so any session can pick it up cold:

1. **Goal**: one paragraph, what is true when it's done.
2. **Context**: the files involved and the facts a newcomer would get wrong.
3. **Work**: ordered steps, each small enough for one commit.
4. **Acceptance**: checkable boxes, including the quality gates.
5. **Prompt**: a paragraph the user can paste to start the session.
