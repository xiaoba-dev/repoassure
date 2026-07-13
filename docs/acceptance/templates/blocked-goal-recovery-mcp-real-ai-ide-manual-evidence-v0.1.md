# Blocked Goal Recovery MCP Real AI IDE Manual Acceptance Evidence v0.1

Status: template

Decision: pending | accepted | changes_requested | deferred

## Context

- Date and time (with timezone):
- Maintainer role:
- AI IDE client and version:
- RepoAssure commit or release identifier:
- Configuration scope: user-level | untracked project-level
- Configuration decision after the check: retained | removed

## Tool Discovery Evidence

- The client showed a `repoassure` MCP server as available: yes | no
- The client listed these eight recovery tools:
  - `create_blocked_goal_recovery`
  - `consume_blocked_goal_recovery`
  - `record_blocked_goal_recovery_decision`
  - `prepare_blocked_goal_resume_attempt`
  - `intake_blocked_goal_resume_evidence`
  - `review_blocked_goal_resume_evidence`
  - `close_blocked_goal_resume_attempt`
  - `validate_blocked_goal_recovery_lifecycle`
- Evidence summary:

## Non-executing Fixture Evidence

- Used a disposable copy of `examples/mcp-manual-acceptance` as the input directory: yes | no
- Called only `create_blocked_goal_recovery` with that absolute disposable input directory: yes | no
- The client response reported `commandsExecuted: false`, `externalStateChanged: false`, and `targetRepoMutation: false`: yes | no
- No recovery or resume command was executed: yes | no
- Evidence summary:

## Boundary and Follow-up

- The generated configuration was not committed or shared: yes | no
- No absolute paths, environment values, tokens, or target repository data were recorded below: yes | no
- Observation or issue:
- Decision rationale:
- Next action:

Do not include absolute paths, environment values, tokens, or target repository data.
