# Project Intelligence ADR Cascade Remediation Closure v0.1

Status: completed
Date: 2026-07-19

## Purpose

Rerun the Project Intelligence freshness and ADR cascade backlog checks after the controlled remediation execution, confirm whether the original 11 `missing_cascade` findings are closed, and classify anything that remains.

## Result

**The 11 `missing_cascade` findings are closed.**

```
pnpm project:intelligence          findings.total: 0
pnpm project:intelligence:backlog  Items: 0 · Missing cascade findings: 0
pnpm project:intelligence:view     verdict: clear
```

Code graph: 316 nodes, 575 edges. Docs, code, and progress graphs are internally consistent.

## Residual findings and classification

One finding surfaced during closure that had not appeared in any previous run. It is now also closed.

| Finding | Category | Classification |
| --- | --- | --- |
| `orphan-code:apps/website` — app entry lacks local ownership documentation | `orphan_code` | **Legitimate follow-up work, previously masked by a detection defect** |

### Why it appeared only now

The finding is real and was real all along. `apps/website` was the only one of ten apps and packages without a README.

It went undetected because of how the check is written and what the scanner was traversing. `findOrphanCode` passes an app node if any path it contains ends in `/README.md`:

```ts
.filter((node) => !(outgoingContains.get(node.id) ?? []).some((path) => path.endsWith('/README.md')))
```

Before the ignore filter was corrected, the scanner walked `apps/website/node_modules`. pnpm materialises that tree with symlinks, and the scanner uses `stat`, which follows them — so `apps/website/node_modules/typescript/README.md`, `lucide-react/README.md`, `react-dom/README.md` and six others were all in the graph as paths the app "contained". Any one of them satisfied the check.

**The vendored dependency noise was not only cosmetic. It was suppressing a genuine detection.** The 85.9% of the code graph that was dependency files did not just fill the viewer's display window; it made a real documentation gap invisible to the rule designed to catch it.

### Resolution

`apps/website/README.md` was written, covering run commands, the information architecture and the two distinctions it deliberately encodes, the requirement that all copy stay in `i18n.ts` so the forbidden-claim guard keeps reaching it, the two substring traps in those patterns, the content-hashed-not-signed boundary, and the theme split. Re-running the snapshot returns `findings.total: 0`.

### Rule calibration note, not actioned here

`findOrphanCode` matches any contained path ending in `/README.md`, at any depth. With the ignore filter corrected this is no longer exploitable by dependency trees, but the rule would still pass an app whose only README sits several directories down rather than at its root. Tightening it to the app's own root README is a candidate follow-up. It is recorded rather than changed, because altering detection rules during a closure run makes the closure evidence unreadable.

## Verification

- `pnpm project:intelligence` — 481 nodes, 1121 edges, 0 findings
- `pnpm project:intelligence:backlog` — 0 items, 0 missing cascade findings
- `pnpm project:intelligence:view` — verdict `clear`, output contains no external reference
- `npx vitest run tests/unit` — 48 files, 642 tests passed

## Boundary

- No ADR, spec, or documentation was rewritten by an automated rule. The one documentation file added is an app README, written directly.
- No detection rule was changed during closure.
- No hosted dashboard, cloud sync, telemetry, or deployment work was performed.
- No public release, repository visibility change, npm publication, GitHub release, public custom domain decision, target repo write, pricing change, or customer contact was performed.
