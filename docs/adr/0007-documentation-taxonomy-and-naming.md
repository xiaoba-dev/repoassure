# ADR-0007: Documentation Taxonomy and Naming

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

The `docs/` tree grew from product planning, architecture decisions, user acceptance, long-running Codex goals, testing strategy, and generated acceptance records. The resulting structure is usable, but naming is not consistent enough for maintainers, AI IDEs, or automation to reliably distinguish stable documents from generated or historical records.

The main problems are:

- Stable specs, guides, generated outputs, historical records, logs, and goal contracts share similar naming depth.
- Some files use versions, some use repo names, some use dates, and some rely only on natural-language titles.
- Repo-specific acceptance records used extra dots in filenames, which makes automated grouping and matching harder.
- Existing commands already depend on several acceptance output paths, so an immediate full rename would break compatibility.

## Decision

Adopt a typed documentation taxonomy:

1. Use directories to express document class: `specs`, `guides`, `checklists`, `records`, `strategy`, `samples`, `spikes`, and `completed`.
2. Use version suffixes for stable evolving documents, such as `*-spec-v0.1.md` or `*-v0.1.md`.
3. Use date-prefixed filenames for historical records and completed goals, such as `2026-06-20-after-repair.md`.
4. Keep ADR filenames in the existing numbered format: `0007-documentation-taxonomy-and-naming.md`.
5. Avoid extra dot-separated metadata in filenames except the `.md` extension and intentional version tokens such as `v0.1`.
6. Keep generated acceptance outputs at their current default paths until the owning commands support compatibility paths.
7. Maintain a taxonomy spec that lists canonical directories, naming patterns, migration map, and exceptions.

The canonical executable spec is `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`.

## Consequences

### Positive

- Maintainers and agents can infer document purpose from path alone.
- Future documentation migrations can be tested instead of performed as ad hoc renames.
- Historical records become easier to group by target repo and date.
- Runtime-generated acceptance outputs stay compatible while the target taxonomy is documented.

### Negative

- Existing links and tests must be updated when stable documents move.
- Some legacy generated output paths remain temporarily outside the ideal taxonomy.
- The docs tree has more directories, so index documents and README references must stay current.

### Follow-up

- Add structure tests for the taxonomy and key canonical paths.
- Update code references for moved stable documents.
- Move generated acceptance outputs only after `acceptance`, `goal:audit`, `user:accept`, and `user:handoff` support compatibility redirects or configured output paths.
