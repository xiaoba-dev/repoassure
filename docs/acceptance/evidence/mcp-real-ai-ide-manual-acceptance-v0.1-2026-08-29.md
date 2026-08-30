# MCP Real AI IDE Manual Acceptance Evidence v0.1

Status: accepted

Decision: accepted

> **Attribution.** This check was performed and this decision was made by Claude (an AI agent),
> at the maintainer's explicit delegation. Discovery was verified in the maintainer's installed
> Cursor desktop client through operating-system automation; the bounded call was made by
> Cursor's own agent CLI (`cursor-agent` 2026.08.25), the vendor's client implementation reading
> the same user-level MCP configuration. This is delegated evidence, not independent human
> verification, and is labeled as such.

## Context

- Date: 2026-08-29 (local)
- Operator: Claude, delegated by the repository maintainer
- AI IDE client: Cursor (installed desktop client) for discovery; Cursor Agent CLI
  `2026.08.25-3e8eec8` (same vendor, same user-level configuration) for the bounded call
- RepoAssure commit: the then-current main head, built from a clean detached checkout
- Configuration scope: user-level; the `repoassure` entry was merged into the existing client
  configuration without touching the four unrelated servers already present
- Configuration decision after the check: removed after the check completed, together with the
  temporary checkout it pointed at

## Tool Discovery Evidence

- The client showed a `repoassure` MCP server as available: yes (desktop UI: Connected,
  "13 tools enabled"; vendor CLI `mcp list`: `repoassure: ready`)
- The client listed exactly the product tools the registry advertises (currently thirteen):
  `analyze_repo`, `boot_app`, `stop_app`, `explore_app`, `generate_tests`,
  `generate_repair_plan`, `prepare_repair_handoff`, `preview_repair_execution`,
  `generate_repair_patch_plan`, `list_security_providers`, `import_security_evidence`,
  `harden_report`, `run_hardening` — confirmed twice: by scrolling the desktop client's own MCP
  settings surface, and by the vendor CLI's `mcp list-tools repoassure`, which also reported the
  argument names for each tool
- No `blocked_goal` tool was listed: yes, in both views
- Evidence summary: the first discovery pass found the then-documented tool list stale — the
  runbook said eleven while the client showed thirteen, because ADR-0045's two security tools
  had never entered the acceptance documents. That drift is corrected in the change carrying
  this record.

## Bounded Call Evidence

- Used a disposable throwaway web project (a minimal `package.json` plus one static page,
  created for this check under the system temporary directory) as the call target: yes
- Called only `analyze_repo` with that directory as `root`: yes, by Cursor's own agent under a
  single-purpose instruction. The desktop chat flow could not be used because the
  operating-system automation could click but not type; two earlier headless attempts were
  auto-rejected by the CLI's approval gate before one run with MCP approval enabled completed
  the call. An SDK-harness call had been made earlier the same day as interim evidence and is
  superseded by the vendor-client call for this criterion.
- The only file written was `.hardening/run/repo-profile.json` inside the disposable directory:
  yes (full file listing compared before and after; the baseline was reset before the
  vendor-client run so the artifact is attributable to that call alone)
- The RepoAssure source checkout was left unchanged: yes (clean `git status` after the call)
- No `boot_app` or `run_hardening` call was made during this gate: yes
- Evidence summary: discovery and the bounded call were both exercised end to end by the
  vendor's own software against the user-level configuration. Nothing in this record rests on
  the repository's own SDK harness.

## Boundary and Follow-up

- The generated configuration was not committed or shared: yes
- No absolute paths, environment values, tokens, or target repository data are recorded above: yes
- Observation or issue: the acceptance documents had drifted (eleven vs thirteen tools);
  corrected alongside this record. The CLI permission entry added temporarily for the call was
  reverted immediately after it.
- Decision rationale: `accepted`, as delegated. Every criterion is met by vendor software:
  discovery in the installed desktop client matches the registry exactly with no removed-surface
  tool advertised, and the single bounded call — made by the vendor's own agent through the same
  user-level configuration — wrote only its documented artifact and left the source checkout
  untouched. The scope limit is stated rather than hidden: the decision is Claude's under
  explicit maintainer delegation, and the desktop chat UI itself was not the vehicle for the
  call.
- Next action: none for this gate. A future maintainer-typed run remains a strictly stronger
  form of the same evidence if ever wanted.
