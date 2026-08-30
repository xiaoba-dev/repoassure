# MCP Real AI IDE Manual Acceptance Evidence v0.1

Status: template

Decision: pending | accepted | changes_requested | deferred

> Historically titled *Blocked Goal Recovery MCP Real AI IDE Manual Acceptance Evidence v0.1*.
> The eight blocked-goal recovery MCP tools this template used to record were removed by PR #71
> (commit `6b78bf9`); see
> [ADR-0044](../../adr/0044-blocked-goal-recovery-mcp-surface-removal.md). The file name is kept
> so existing links resolve. Use with
> [the manual acceptance runbook](../../operations/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1.md).

## Context

- Date and time (with timezone):
- Maintainer role:
- AI IDE client and version:
- RepoAssure commit or release identifier:
- Configuration scope: user-level | untracked project-level
- Configuration decision after the check: retained | removed

## Tool Discovery Evidence

- The client showed a `repoassure` MCP server as available: yes | no
- The client listed exactly the product tools the registry advertises (currently thirteen):
  - `analyze_repo`
  - `boot_app`
  - `stop_app`
  - `explore_app`
  - `generate_tests`
  - `generate_repair_plan`
  - `prepare_repair_handoff`
  - `preview_repair_execution`
  - `generate_repair_patch_plan`
  - `list_security_providers`
  - `import_security_evidence`
  - `harden_report`
  - `run_hardening`
- No `blocked_goal` tool was listed: yes | no
- Evidence summary:

## Bounded Call Evidence

- Used a disposable copy of a throwaway web project as the call target: yes | no
- Called only `analyze_repo` with that absolute disposable directory as `root`: yes | no
- The only file written was `.hardening/run/repo-profile.json` inside the disposable directory: yes | no
- The RepoAssure source checkout was left unchanged: yes | no
- No `boot_app` or `run_hardening` call was made during this gate: yes | no
- Evidence summary:

## Boundary and Follow-up

- The generated configuration was not committed or shared: yes | no
- No absolute paths, environment values, tokens, or target repository data were recorded below: yes | no
- Observation or issue:
- Decision rationale:
- Next action:

Do not include absolute paths, environment values, tokens, or target repository data.
