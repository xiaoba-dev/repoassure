# Security Assurance Lane Provider Import Ergonomics v0.1

Status: implemented_local_only
Date: 2026-07-14
Source ADR: `docs/adr/0013-codex-security-and-security-assurance-lane.md`
Source spec: `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`

## Purpose

Make the existing local security evidence import discoverable and safely diagnosable for maintainers and AI IDEs. This implementation does not run a scanner. It imports a RepoAssure normalized envelope, writes run-scoped artifacts, and returns a bounded repair-planning handoff.

## Supported Provider Catalog

The shared package catalog exposes these provider ids:

- `codex-security`
- `codeql`
- `semgrep`
- `gitleaks`
- `osv`
- `manual-import`

Every v0.1 entry has `supportStatus: normalized-envelope` and `nativeFormatSupport: false`. The input directory must contain a regular, non-symbolic-link `scan.json` no larger than 10 MiB, with an explicit `schema: repoassure.normalized-security-scan.v1`, an array-valued `findings` field, object-valued finding entries, recognized severity, non-empty `title`, `category`, and `path`, an `evidence` string array, and correctly typed optional fields on every finding.

Native provider formats are not accepted. A CodeQL SARIF file, Semgrep JSON file, Gitleaks report, or OSV response must not be passed directly to this importer until a later provider-format contract and adapter goal is completed.

## CLI Surface

Discover the exact catalog and input contract:

```bash
hardening security providers
```

Import normalized local evidence:

```bash
hardening security import --provider codex-security --scan-dir <dir> --repo <repo> --run-dir <repo>/.hardening/runs/<run-id>
```

CLI help states the normalized-envelope boundary. Missing options identify only the absent flags. Unsupported providers direct the caller to `hardening security providers`.

## MCP Surface

- `list_security_providers` is read-only, idempotent, and closed-world. It returns the same shared catalog as the CLI.
- `import_security_evidence` accepts `provider`, `sourcePath`, `repoRoot`, `runDir`, and optional `runId`.
- Import accepts only a real `runDir` below `<repo>/.hardening/`. Existing path components and artifact targets must not be symbolic links.
- Artifact files are create-only and use exclusive writes. Existing evidence is never overwritten, so the tool is non-destructive with respect to both target source and prior evidence.
- Import does not contact provider services.
- Failed imports return text-only MCP errors with `isError: true` and no `structuredContent`.

## Safe Preflight Errors

The importer validates all input before creating the output directory. Stable errors are:

| Code | Meaning | Recovery |
| --- | --- | --- |
| `provider_unsupported` | Provider id is outside the shared catalog. | List providers and use an exact id. |
| `scan_file_missing` | The input directory has no `scan.json`. | Create the normalized envelope. |
| `scan_file_unreadable` | `scan.json` exists but cannot be read as a regular input file. | Correct local file type or permissions without exposing the path. |
| `scan_file_too_large` | `scan.json` exceeds 10 MiB. | Remove raw provider output and retain normalized findings only. |
| `scan_json_invalid` | `scan.json` is not valid JSON. | Correct syntax without adding secrets. |
| `scan_root_invalid` | The root is not a JSON object. | Wrap metadata and findings in one object. |
| `scan_schema_invalid` | The declared schema is missing or unsupported. | Use `repoassure.normalized-security-scan.v1`. |
| `provider_mismatch` | Requested and declared provider ids differ. | Align the request and envelope. |
| `findings_invalid` | `findings` or a finding field violates the normalized contract. | Use normalized finding objects with required strings/arrays and correctly typed optional fields. |
| `severity_invalid` | A finding has no recognized severity. | Use P0-P3 or a documented provider severity synonym. |
| `run_dir_invalid` | Output is outside `.hardening/` or traverses a symbolic link. | Choose a real repo-local run directory. |
| `output_write_failed` | Output is not writable or an artifact already exists. | Use a new run directory; never overwrite prior evidence. |

Messages and guidance do not echo the full source path, provider report contents, or secret-bearing input. CLI and MCP use the same formatter.

## Untrusted Provider Content

Provider metadata, title, paths, evidence, attack path, remediation text, and verification suggestions are untrusted input. The importer redacts them before writing RepoAssure-owned artifacts. Every normalized provider id receives a content-derived digest so slug-equivalent ids remain distinct. Repair planning preserves provider provenance, maps P0-P3 into the task summary, derives task identity from the collision-resistant normalized `findingId`, uses a generic RepoAssure-owned title, exposes `trustBoundary` before provider content in JSON, escapes provider text as Markdown literals, and entity-neutralizes bare URL/email autolinks. It does not promote provider-supplied verification strings into `verification.commands` or AI IDE execution instructions. Such suggestions remain labeled evidence and require maintainer review; trusted verification must come from repo-owned scripts or an explicit maintainer decision.

## Repair Planning Handoff

A successful import adds machine-readable `repairPlanningHandoff` to the tool, CLI, and MCP result. It contains:

- the generated `securityFindingsPath`;
- CLI `hardening plan` command/argv for the same `repoRoot` and `runDir`;
- MCP `generate_repair_plan` tool and arguments;
- `autoApply: false`;
- `targetMutation: false`;
- `maintainerReviewRequired: true`.

This handoff makes the next read/plan action explicit. It does not apply a patch or authorize a target-repository repair goal.

## Verification Evidence

- Unit: provider catalog, strict schema/required-field/optional-field/severity validation, normalized P0-P3 task mapping, safe regular-file and 10 MiB input boundaries, collision-resistant finding/task ids, metadata redaction, `.hardening` containment, symbolic-link rejection, create-only artifacts, trust-boundary ordering, adversarial Markdown/HTML/prompt neutralization, untrusted provider suggestion handling, CLI help/list/errors, handoff, and MCP schemas/routing/errors.
- Integration: compiled CLI list/import, in-process MCP transport list/import, and real SDK stdio MCP client list/import.
- Package contract: root/subpath exports, compatibility inventory, and type-smoke coverage for `security-provider-contracts`.
- Final gates: typecheck, lint, unit/full test pyramid, repository hygiene, release check, goal audit, diff check, and independent review.

Final automated evidence after independent-review remediation: typecheck and lint passed; unit suite passed 67 files / 810 tests; full suite passed 106 files / 895 tests with one optional file/test skipped; repository hygiene and release check passed; goal audit passed 35/35 with zero missing or manual items.

Final delta review reported zero P0, P1, or P2 correctness findings. The documented parent-directory TOCTOU remains an accepted non-blocking residual only for the declared local, trusted-maintainer threat model.

Loopback MCP integration must run in an environment that permits local listeners; a sandbox denial is recorded as `listen EPERM`, not treated as a product failure.

## Non-Authorization Boundary

No Action Authorization Receipt was produced.

No scanner or provider service was executed or contacted. No source or provider report was uploaded. No target repository source was modified. No branch, commit, pull request, issue, advisory, npm publication, GitHub release, public launch, customer contact, pricing/spend change, repository visibility change, or commercial/hosted availability claim was executed or authorized.

## Next Goal

`Security Assurance Lane Provider Format Fixture Contracts v0.1` should define a sanitized, versioned fixture matrix for native provider formats before any native adapter implementation. It must remain local-only and must not run provider services or claim native format support prematurely.
