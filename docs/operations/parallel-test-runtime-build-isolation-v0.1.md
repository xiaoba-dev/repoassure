# Parallel Test Runtime Build Isolation v0.1

Status: implementation complete; independent review and delivery validation in progress

## Purpose

Make the standard parallel `pnpm test` command safe on a clean checkout and prevent integration child processes from rebuilding and reading the same `packages/acceptance/dist` tree concurrently.

## Root Cause

The previous `test` script started Vitest without first building package-owned runtime outputs. On a clean checkout, test collection therefore failed on missing `packages/*/dist` modules. After a manual prebuild, many parallel integration files invoked `playbook:*` and `goal:recover:*` package scripts; every command ran `build:acceptance` before loading its CLI module. Concurrent `tsc` writers could expose a partially rewritten ESM tree to other test and MCP child processes, producing moving `does not provide an export named` failures and 30-second resource-contention timeouts.

## Implementation

- `pnpm test` builds package and root runtime outputs once before Vitest starts file-parallel execution.
- Vitest keeps file parallelism enabled with a four-worker repository bound so nested CLI and MCP child processes cannot amplify to host-dependent concurrency.
- `build:acceptance` delegates to `scripts/build-acceptance.ts` through `node --import tsx`, avoiding the `tsx` CLI IPC listener.
- The coordinator hashes acceptance source, TypeScript configuration, root/package manifests, the lockfile, and the build/coordinator implementation.
- Processes with the same fingerprint publish one complete lease-token lock through an atomic same-filesystem hard link under `node_modules/.cache/repoassure` and reuse the successful state only after every expected JavaScript, declaration, and source-map output exists.
- A changed fingerprint rebuilds. The old success state is invalidated before rebuilding, so a failed build that writes partial output cannot become reusable.
- If a lock owner exits without running cleanup, the next process verifies the owner PID, atomically quarantines the orphaned lock, and continues. Malformed locks fail closed, and a live lock is never removed based on age alone.
- Cache state is local and ignored. It is not written to `packages/acceptance/dist`, committed, shared, or emitted as product evidence.

## Test Pyramid

- Contract tests verify the standard test entrypoint, coordinated acceptance build entrypoint, and documentation cascade.
- Integration tests start eight concurrent worker processes and prove one build for one fingerprint, rebuild on fingerprint change, rejection of partial failed rebuild output, recovery after normal failure, and recovery after process exit.
- Real stdio MCP tests retain redacted startup errors, bounded request timeouts, environment isolation, and deterministic child cleanup under parallel load.
- Final acceptance requires three consecutive standard parallel `pnpm test` passes, followed by typecheck, lint, repository hygiene, release check, goal audit, PR CI, and merged-main CI.

## Boundary

This is test and build runtime reliability work. It does not change recovery artifact schemas, execute recovery or resume commands, mutate target repositories, publish packages, launch the product, contact customers, change pricing/spend or repository visibility, or claim hosted/commercial availability.

## Final Local Evidence

Three consecutive standard four-worker file-parallel `pnpm test` runs passed on the final hard-link lock implementation after independent-review remediation. Every run reported 104 passed files, 1 optional skipped file, 853 passed tests, and 1 optional skipped test. No serialized fallback was used. PR CI and merged-main CI remain required before this goal is complete.

## Follow-up

After this reliability gate closes, the next execution goal is Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1. That goal requires a maintainer-controlled installed client and separate redacted manual evidence; automated SDK consumption is not a substitute for real IDE acceptance.
