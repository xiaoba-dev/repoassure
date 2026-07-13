# ADR-0041: Blocked Goal Recovery MCP Surface

Status: Accepted
Date: 2026-07-13

## Context

The blocked-goal recovery lifecycle is implemented as typed local artifact writers and CLI entry points. AI IDE clients currently need shell-specific knowledge to consume the lifecycle, weakening discovery, argument validation, and consistent non-execution evidence.

## Decision

Expose eight explicit MCP tools, one for each lifecycle stage:

- `create_blocked_goal_recovery`
- `consume_blocked_goal_recovery`
- `record_blocked_goal_recovery_decision`
- `prepare_blocked_goal_resume_attempt`
- `intake_blocked_goal_resume_evidence`
- `review_blocked_goal_resume_evidence`
- `close_blocked_goal_resume_attempt`
- `validate_blocked_goal_recovery_lifecycle`

Each tool accepts only `inputDir` and optional `outputDir`. Additional arguments are rejected. Every fixed stage input artifact must resolve within `inputDir`; an explicit output directory must already exist and its real path must also remain within the input directory. The adapter delegates to existing `@hardening-mcp/acceptance` writers rather than duplicating lifecycle logic.

Every successful call emits `repoassure.mcp-blocked-goal-recovery-tool-result.v1` with artifact paths, the typed stage output, and explicit `commandsExecuted: false`, `externalStateChanged: false`, and `targetRepoMutation: false` evidence. MCP output redaction operates recursively on values so secret-like paths are sanitized without erasing legitimate `nonAuthorizationBoundary` fields.

The tools are marked `destructiveHint: true` because a repeated stage call may replace its own fixed-name local JSON and Markdown evidence files. This local overwrite capability is not authorization to execute a recovery command or mutate a target repository. Fixed inputs are opened non-blocking with no-follow semantics, must be regular files no larger than 8 MiB, are bound to the pre-open device/inode, and are read through an explicit `MAX + 1` byte loop. Fixed output symlinks are rejected at the MCP boundary, and output bytes are committed through an identity-checked same-directory temporary file plus atomic rename. MCP calls retain validated directory device/inode identities and revalidate them around low-level I/O.

The local stdio MCP threat model rejects untrusted path expansion, symlink escape, file substitution, persistent directory replacement, FIFO/device input, and resource-amplifying input size. It does not claim OS-level isolation from a malicious process running concurrently as the same operating-system user and repeatedly performing an ABA directory swap between individual syscalls; Node.js 22 does not expose portable `openat`-style descriptor-relative file operations. Environments requiring protection from a hostile same-user process must place the MCP server and artifact directory in a separate OS account or sandbox. The tools fail closed when their observable file or directory identity changes.

Lifecycle campaign validation accepts at most 32 scenarios, requires each scenario to reference a distinct relative artifact directory, and validates at most four scenarios concurrently. These limits prevent a bounded campaign input from amplifying into unbounded file-open, parsing, or memory pressure.

## Consequences

AI IDE clients can discover and call each stage through `tools/list` and `tools/call` while preserving the CLI trust chain. The MCP surface writes local evidence but does not execute recovery or resume commands, mutate target repos, close external goals, publish, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.
