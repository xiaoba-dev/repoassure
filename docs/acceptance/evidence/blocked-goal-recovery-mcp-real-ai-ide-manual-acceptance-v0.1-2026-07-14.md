# Blocked Goal Recovery MCP Real AI IDE Manual Acceptance Evidence v0.1

Status: accepted

Decision: accepted

## Context

- Date: 2026-07-14 Asia/Shanghai
- Maintainer role: repository maintainer
- AI IDE client: Codex Desktop session, Codex CLI 0.144.2
- RepoAssure commit: `37ca6cf39424e96091fa96d52fd08cf15cf6c546`
- Configuration scope: temporary user-level entry used only for this acceptance check
- Configuration decision after the check: removed

## Tool Discovery Evidence

The Codex session discovered the eight RepoAssure blocked-goal recovery tools:

- `create_blocked_goal_recovery`
- `consume_blocked_goal_recovery`
- `record_blocked_goal_recovery_decision`
- `prepare_blocked_goal_resume_attempt`
- `intake_blocked_goal_resume_evidence`
- `review_blocked_goal_resume_evidence`
- `close_blocked_goal_resume_attempt`
- `validate_blocked_goal_recovery_lifecycle`

## Non-executing Fixture Evidence

The maintainer instructed Codex to call only `create_blocked_goal_recovery` using the disposable committed fixture. The call succeeded and wrote only local recovery-package evidence. The generated package contained an empty `resumeCommands` list.

- `commandsExecuted: false`
- `externalStateChanged: false`
- `targetRepoMutation: false`

No recovery or resume command was executed, and no other RepoAssure tool was called for this manual acceptance step.

## Decision and Boundary

The maintainer explicitly accepted the manual Codex result and chose to remove the temporary RepoAssure MCP configuration after the check. This acceptance proves one installed Codex client can discover and consume the bounded local MCP fixture. It does not authorize target-repository mutation, package publication, product launch, customer contact, repository visibility changes, pricing/spend changes, or hosted/commercial availability claims.
