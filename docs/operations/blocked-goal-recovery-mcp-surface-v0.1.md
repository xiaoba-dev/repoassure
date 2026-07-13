# Blocked Goal Recovery MCP Surface v0.1

Status: Implemented

## Purpose

This surface lets an AI IDE discover and consume the complete local blocked-goal recovery evidence lifecycle over MCP. It does not execute recovery or resume commands.

## Tools And Read Order

1. `create_blocked_goal_recovery`
2. `consume_blocked_goal_recovery`
3. `record_blocked_goal_recovery_decision`
4. `prepare_blocked_goal_resume_attempt`
5. `intake_blocked_goal_resume_evidence`
6. `review_blocked_goal_resume_evidence`
7. `close_blocked_goal_resume_attempt`
8. `validate_blocked_goal_recovery_lifecycle`

Stages 3, 5, 6, and 7 require the documented maintainer decision or separately produced evidence input file. MCP does not invent those decisions or execute the task package.

## Input Contract

```json
{
  "inputDir": "/absolute/or/relative/local/artifact-directory",
  "outputDir": "/optional/existing/contained/output-directory"
}
```

- `inputDir` is required and must exist.
- Every fixed stage input artifact must resolve within `inputDir`; input-file symlink escape is rejected.
- Fixed inputs are opened with `O_NOFOLLOW | O_NONBLOCK`, must be regular files, are bound to the pre-open device/inode, and are read through an explicit 8 MiB + 1 byte bounded loop. FIFO, device, directory, growing/oversized-file, substituted-file, and final-file symlink inputs are rejected.
- Existing fixed-name output symlinks are rejected, and output files are replaced through same-directory temporary files plus atomic rename.
- MCP captures the validated `inputDir` and `outputDir` device/inode identity and revalidates directory identity and parent containment before and after low-level reads and atomic writes. A concurrent directory replacement aborts the call.
- Residual boundary: this local stdio surface does not provide OS isolation from a hostile concurrent process running as the same OS user and performing an unobservable ABA directory swap between syscalls. Use a separate OS account or sandbox for that threat model.
- Lifecycle validation accepts 1-32 scenarios, rejects duplicate `artifactDir` references, and runs no more than four scenario validators concurrently.
- Recovery tools advertise `destructiveHint: true` because they can replace their own local JSON/Markdown evidence files. This does not expand the no-command, no-external-state, or no-target-repo-mutation boundary.
- `outputDir` is optional, must already exist, and must resolve within `inputDir`.
- Additional arguments, including command or target-repository mutation fields, are rejected.

## Output Contract

Every successful tool call returns `repoassure.mcp-blocked-goal-recovery-tool-result.v1` with artifact paths, typed stage output, and this boundary:

```json
{
  "boundaryCompliance": {
    "commandsExecuted": false,
    "externalStateChanged": false,
    "targetRepoMutation": false
  }
}
```

Errors are returned as MCP tool errors with redacted client-readable messages. Output content and structured content use the same sanitized value tree; credential-like keys are redacted as a whole regardless of whether their value is a string, number, array, or object, while governance fields such as `authorizationStatus` and `nonAuthorizationBoundary` remain readable.

Every tool binds `toolName`, lifecycle `stage`, stage payload `schemaVersion`, expected JSON/Markdown artifact suffixes, and constant-false boundary flags in its advertised output schema. The full nested stage payload remains governed by the authoritative acceptance package validator for that stage.

## Boundary

These tools write local evidence only. They do not execute commands, upload target source, mutate target repos, create branches/commits/pull requests/issues/advisories, close external goals, publish, launch, contact customers, change pricing/spend or repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.
