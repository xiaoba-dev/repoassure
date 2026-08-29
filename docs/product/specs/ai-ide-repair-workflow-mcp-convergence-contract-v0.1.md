# AI IDE Repair Workflow MCP Convergence Contract v0.1

Status: accepted
Schema: `repoassure.mcp-repair-convergence-contract@1`
ADR: `docs/adr/0024-ai-ide-repair-workflow-mcp-convergence.md`

## Baseline

- Existing MCP registry tools: 8
- Candidate artifact-only tools: 4
- Existing `generate_repair_plan`: unchanged
- Validation-only MCP exposure: false
- Target repository writes: false
- Automatic patch application: false

This document is implementation-ready but does not itself authorize registry changes.

## Shared Contract

All candidate tools:

- reuse package-owned runners;
- validate required inputs before the first artifact write;
- write only to the explicit `outputDir` or the source artifact directory selected by the runner;
- return generated paths plus bounded counts/status;
- redact text and `structuredContent`, including failure paths;
- return failures with `isError: true` and a sanitized `structuredContent.error`;
- do not execute commands, access the network, modify source files, or apply patches;
- preserve the maintainer review boundary and no automatic patch application rule.

Common annotations:

```yaml
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

`idempotentHint` is false because timestamps and generated evidence may change and explicit output paths may be replaced.

## Candidate Tool Schemas

### `prepare_repair_handoff`

Purpose: transform an existing run manifest into AI IDE handoff and verification-plan artifacts.

Input:

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `runDir` | string | yes | Directory containing `manifest.json` |
| `outputDir` | string | no | Explicit local artifact destination |

Output:

| Field | Type |
| --- | --- |
| `packagePath` | string |
| `markdownPath` | string |
| `verificationPlanPath` | string |
| `taskCount` | number |
| `highestPriority` | string |
| `status` | string |

### `preview_repair_execution`

Purpose: produce a dry-run report for selected handoff tasks. This tool never accepts a validation mode.

Input:

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `packagePath` | string | yes | Repair handoff package |
| `taskIds` | string[] | conditional | Non-empty selection |
| `all` | boolean | conditional | Must be `true` |
| `outputDir` | string | no | Explicit local artifact destination |

Exactly one of `taskIds` or `all: true` is required. Validation commands are not run.

Output:

| Field | Type |
| --- | --- |
| `reportPath` | string |
| `markdownPath` | string |
| `taskCount` | number |
| `status` | string |

### `generate_repair_patch_plan`

Purpose: convert a repair execution report into reviewable patch-plan artifacts.

Input:

| Field | Type | Required |
| --- | --- | --- |
| `reportPath` | string | yes |
| `outputDir` | string | no |

Output:

| Field | Type |
| --- | --- |
| `planPath` | string |
| `markdownPath` | string |
| `actionCount` | number |
| `autoFixCandidates` | number |
| `status` | string |

The result must include a maintainer review boundary, verification checklist, and no-write proof in the generated artifacts.

### `assemble_repair_evidence_package`

Purpose: assemble existing handoff, dry-run, validation, and patch-plan evidence without executing any of those stages.

Input:

| Field | Type | Required |
| --- | --- | --- |
| `handoffPackagePath` | string | yes |
| `dryRunReportPath` | string | yes |
| `validationReportPath` | string | yes |
| `patchPlanPath` | string | yes |
| `outputDir` | string | no |

`validationReportPath` may reference evidence produced by the installed CLI. Its presence does not authorize MCP to execute validation commands.

Output:

| Field | Type |
| --- | --- |
| `packagePath` | string |
| `markdownPath` | string |
| `taskCount` | number |
| `status` | string |

## Error and Redaction Contract

| Condition | Required behavior |
| --- | --- |
| Missing required field | Fail closed before writing |
| Invalid selection | Fail closed before writing |
| Missing or malformed artifact | Sanitized `isError: true` response |
| Path or filesystem failure | Redact sensitive path/text before MCP response |
| Runner failure | Preserve no-write boundary and return bounded error |

Raw secrets, credentials, tokens, private source, command environment values, and unbounded artifact content must not be copied into tool results.

## Compatibility Matrix

| Surface | v0.1 rule |
| --- | --- |
| Existing eight MCP tools | No rename, removal, schema change, or behavior change |
| `generate_repair_plan` | Remains the repair-plan generator |
| Installed `hardening repair` CLI | Remains compatible and complete |
| Repository `pnpm repair:*` scripts | Remain compatible |
| MCP resources | Deferred |
| MCP prompts | Deferred |
| Validation-only execution | CLI-only |

## Contract Test Matrix

Each later implementation must include:

1. Unit tests for schema validation, selection rules, runner mapping, summaries, and fail-closed errors.
2. Integration tests for real MCP `tools/list` and `tools/call`, annotations, `structuredContent`, redaction, and protocol framing.
3. Package/consumer smoke tests proving the installed MCP bin can call the added tool without source-workspace dependencies.
4. No-write tests comparing target source content, timestamps, and directory listing.
5. Regression tests proving all previously registered tools remain unchanged.

## Implementation Order

1. `prepare_repair_handoff` — implemented and accepted
2. `preview_repair_execution` — implemented and accepted
3. `generate_repair_patch_plan` — implemented and accepted
4. `assemble_repair_evidence_package` — implemented and accepted

RepoAssure AI IDE Repair Handoff MCP Tool Implementation v0.1 added only `prepare_repair_handoff`, bringing the registry from eight to nine tools. RepoAssure AI IDE Repair Execution Preview MCP Tool Implementation v0.1 added only dry-run `preview_repair_execution`, bringing the registry from nine to ten tools. RepoAssure AI IDE Repair Patch Plan MCP Tool Implementation v0.1 then added only `generate_repair_patch_plan`, bringing the registry to eleven tools. RepoAssure AI IDE Repair Evidence Package MCP Tool Implementation v0.1 added only `assemble_repair_evidence_package`, bringing the registry to twelve tools while preserving every earlier contract.

Completion audit: accepted

RepoAssure AI IDE Repair Workflow MCP Convergence Completion Audit v0.1 closed the current artifact-only convergence slice with conclusion `repair_workflow_mcp_convergence_slice_closed_without_command_execution_or_target_repo_writes`. The registry remains at twelve tools. Validation-only execution remains CLI-only, and MCP resources, prompts, arbitrary command execution, patch application, and target repository writes remain outside this contract. The next Goal is RepoAssure Product Completion Gap Audit Refresh v0.6.
