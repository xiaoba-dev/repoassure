# RepoAssure Packed MCP Server Installation and Protocol Validation v0.1

Status: completed
Date: 2026-07-25
Conclusion: `packed_mcp_installed_and_protocol_validated_without_registry_expansion_or_target_writes`

## Scope

This Goal validates the package's existing `hardening-mcp` distribution
boundary. It creates a local tarball, installs it into an isolated consumer,
starts the installed `node_modules/.bin/hardening-mcp` entrypoint, and uses the
official MCP SDK over stdio.

It does not publish the package, expand or rename the MCP registry, productize
repair MCP commands, change detector or acceptance behavior, write a target
repository, or apply a patch.

## TDD and 5A Record

| Phase | Evidence |
| --- | --- |
| Arrange | Create isolated pack, extract, consumer, and untouched target-repo directories. |
| Act | Pack and install the local tarball, then start the installed MCP bin through `StdioClientTransport`. |
| Assert | Validate package boundaries, MCP responses, redaction, shutdown, and no-write evidence. |
| Assess | The initial sandbox run stalled at dependency installation; the same test outside the restricted network boundary reached the protocol contract. |
| Adapt | Canonicalize macOS temporary paths and align the expected error field with the existing redaction contract. No production runtime change was required. |

The structure cascade also followed Red then Green: the structure test first
failed because this record and the next Goal did not exist, then passed after
the bounded documentation and Autopilot update.

## Package Installation Evidence

- Tarball: `hardening-mcp-0.1.0.tgz`
- Installed bin: `node_modules/.bin/hardening-mcp`
- Source-workspace `node_modules` dependency: no
- Internal `workspace:` dependency references in the packed manifest: none
- MCP distribution files present: yes

## Protocol Evidence

- MCP transport: stdio through the official SDK
- `initialize`: passed
- server info: `hardening-mcp@0.1.0`
- `tools/list`: passed
- MCP registry tools: 8
- tool names: `analyze_repo`, `boot_app`, `stop_app`, `explore_app`,
  `generate_tests`, `generate_repair_plan`, `harden_report`, `run_hardening`
- bounded `tools/call`: `stop_app` with an unknown synthetic session
- protocol framing: passed; stdout remained protocol-only and stderr remained
  empty
- schema compatibility: passed
- redaction: passed; the unknown-session error returned
  `Unknown boot session: [REDACTED]`
- deterministic shutdown: passed

The selected `stop_app` call does not boot an application, inspect private
source, create evidence, or write the target repository. It returns a
structured non-error result for the unknown synthetic session.

## No-Write Evidence

The isolated untouched repository was measured before and after the protocol
sequence:

- source contents unchanged
- source file mtime unchanged
- recursive directory listing unchanged
- no target repository writes
- no patch application

Target repository writes: no

npm publication: no

## Boundaries Preserved

| Boundary | Result |
| --- | --- |
| Existing eight-tool registry only | preserved |
| MCP tool additions or renames | not performed |
| Repair MCP productization | not performed |
| Detector runtime or finding policy changes | not performed |
| Target repository writes | not performed |
| Automatic patch application | not performed |
| npm publication | not performed |
| Deployment or public release | not performed |
| Customer contact, pricing, or spend changes | not performed |

## Selected Next Goal

RepoAssure Product Completion Gap Audit Refresh v0.5

The packed CLI and packed MCP entrypoints now both have isolated consumer
evidence. The next bounded Goal will reconcile `docs/PLAN.md`,
`docs/SPEC.md`, `docs/PRD.md`, code, tests, package boundaries, manual gates,
and external-input state before selecting any further implementation work.

## Verification

- TDD Red: the packed MCP test initially exposed restricted dependency
  installation behavior, macOS temporary-path canonicalization, and the
  established redaction result.
- TDD Green:
  `pnpm exec vitest run tests/integration/packed-mcp-server-protocol.test.ts`
  passed 1/1.
- Documentation Red:
  `pnpm exec vitest run tests/unit/project-structure.test.ts` failed because
  this operation record did not yet exist.
- Documentation Green:
  `pnpm exec vitest run tests/unit/project-structure.test.ts` passed 107/107.
- Concurrent package regression:
  the packed CLI and packed MCP tests passed 2/2 after package preparation was
  made idempotent.
- `pnpm typecheck`, `pnpm lint`, and `pnpm repo:hygiene` passed.
- `pnpm autopilot:progress:check -- --json` passed 8/8 consistency checks.
- `pnpm release:check` passed automated prerequisites and correctly retained
  `public release ready: no`.
- `pnpm goal:audit` passed 34/35 automated checks and retained one manual user
  acceptance item.
- `pnpm test` passed 78 test files and 743 tests; 1 optional test file / test
  was skipped.
