# RepoAssure Representative Multi-Mode Acceptance Campaign Plan v0.1

Status: planning_complete_execution_not_authorized
Date: 2026-07-26

## Purpose

Define one current-version representative acceptance campaign across the
three product shapes required by the maintainer's explicit `defer` decision.
This plan is execution-ready only after a separate target and execution
authorization decision is recorded for every lane.

Current RepoAssure version required: yes

Pinned target revision or fixture digest required: yes

Original target repository writes: prohibited

## Shared Eligibility Rules

A target or fixture is eligible only when all of the following are true:

- It represents the lane's actual product shape and expected operator flow.
- It is public and non-private, or owner-supplied with explicit permission.
- Its source, owner, license, revision, and acquisition method are recorded.
- A commit SHA or deterministic fixture digest pins the tested input.
- It contains no credentials, customer data, private source, production
  configuration, or unreviewed personal data.
- Its required runtime and dependency prerequisites are reproducible and
  bounded; paid services and production credentials are prohibited.
- The campaign runs in a disposable isolated copy. The original repository is
  read-only.
- Source content, tracked-file hashes, modification times, and directory
  inventory are captured before and after execution.
- Generated output is restricted to the isolated copy's `.hardening/`
  directory and an ignored local campaign evidence directory.
- The exact RepoAssure commit, package digest, Node/Python/runtime versions,
  command line, environment-key names, and redaction status are recorded.

## Lane W — Web

### Representative Shape

A browser-based Web application with a deterministic package manifest, a
repeatable local boot command or an explicitly supplied local URL, and at
least one meaningful user route and interaction.

### Required Flow

1. Validate repository and `package.json` preflight.
2. Run the current installed RepoAssure browser acceptance flow.
3. Boot or attach to the application without production credentials.
4. Explore at least one meaningful route and one state-changing interaction.
5. Generate and, when authorized, validate Playwright specifications.
6. Produce findings, hardening report, repair plan, repair task package,
   manifest, screenshots/traces when applicable, and a pending acceptance
   record.
7. Verify source no-write and artifact integrity.

### Required Evidence

- Boot status and local URL evidence.
- Route and interaction coverage.
- Browser findings with reproduction evidence.
- Generated-test generation and validation result.
- Hardening, repair, manifest, integrity, redaction, and no-write evidence.

## Lane C — Python/CLI

### Representative Shape

A Python command-line product with a valid `pyproject.toml`, at least one
console-script entrypoint, deterministic help/smoke behavior, and locally
runnable tests or static checks.

### Required Flow

1. Validate repository and `pyproject.toml` preflight.
2. Run `pnpm user:accept -- --mode cli` through the current RepoAssure build.
3. Generate the Python/CLI profile and identify bounded smoke commands.
4. Run the accepted CLI smoke, pytest, ruff, and mypy checks when present.
5. Produce command result, profile, hardening report, repair plan, repair task
   package, manifest, and pending acceptance record.
6. Verify source no-write and artifact integrity.

### Required Evidence

- Parsed project metadata and console entrypoints.
- Per-command exit code, timeout, stdout/stderr redaction, and skipped reason.
- Python/CLI profile, report, repair artifacts, integrity, and no-write proof.
- Explicit evidence that no browser flow was silently selected.

## Lane M — MCP/Agent

### Representative Shape

An isolated AI IDE or deterministic MCP client consumes the current packed
RepoAssure MCP server over stdio and uses an authorized, current-version run
bundle from Lane W or Lane C. This lane validates RepoAssure's MCP/Agent
product interface; it does not claim comprehensive acceptance of arbitrary
agent frameworks.

### Required Flow

1. Pack and install the current RepoAssure package into an isolated consumer.
2. Start `hardening-mcp` over stdio and validate protocol initialization.
3. Validate `tools/list` and the expected twelve-tool registry.
4. Consume an authorized run bundle through the artifact-only repair tools:
   handoff, execution preview, patch plan, and evidence package.
5. Confirm command non-execution, patch non-application, bounded output,
   redaction, maintainer-review boundary, and deterministic shutdown.
6. Verify source no-write and artifact integrity.

### Required Evidence

- Package digest and isolated installation evidence.
- MCP initialization, tool registry, call, result-schema, and shutdown
  evidence.
- AI IDE read order and artifact-only repair-loop evidence.
- Command non-execution, patch non-application, redaction, and no-write proof.

## Campaign Result Rules

Each lane result is exactly one of `passed`, `blocked`, or `failed`.

- `passed`: every required check ran or has an approved not-applicable reason;
  artifacts are readable and integrity-valid; redaction and source no-write
  checks pass; no required blocker remains.
- `blocked`: execution cannot complete because an authorization, prerequisite,
  supported environment, or required maintainer decision is missing. Blocked
  is not a product pass or failure.
- `failed`: the product flow ran but a required contract, command, artifact,
  integrity, redaction, protocol, or no-write check failed.

All three lanes must pass before a new final product acceptance decision may be requested.

A lane pass proves that RepoAssure completed that representative delivery
workflow. It does not automatically accept the target product and does not
infer RepoAssure's final product acceptance.

## False-Positive And Manual-Decision Closure

Every P0/P1 finding and every suspected false positive must have one explicit
classification: `confirmed_product_defect`, `confirmed_target_defect`,
`confirmed_false_positive`, `environment_blocker`, `accepted_risk`, or
`needs_more_evidence`.

The following existing detector-calibration questions remain manual gates:

- `conditional_dead_control_should_consider_form_dirty_prerequisites`
- `auth_redirect_route_should_preserve_maintainer_review_boundary`

Before a future final `accepted` decision, both questions and every campaign
false positive must be closed by an explicit maintainer decision, an accepted
risk record, or verified remediation evidence. Goal execution authorization
is not a calibration decision.

## Campaign Sequence

1. Record target selection and execution decisions for all three lanes.
2. Prepare isolated pinned inputs and pre-execution no-write baselines.
3. Execute one lane at a time; do not reuse a failed lane's authorization for
   another target or revision.
4. Produce lane evidence conforming to the evidence contract.
5. Review false positives, blockers, and manual decisions.
6. Produce a campaign summary only after all lane records exist.
7. Request a new final product acceptance decision only when all prerequisites
   are satisfied.

## Current Boundary

- Representative target selected: no.
- Representative target execution authorized: no.
- Representative target executed: no.
- Original target repository writes: no.
- Detector or acceptance behavior changed: no.
- Final product acceptance inferred: no.
- Publication, deployment, launch, contact, pricing, or spend authorized: no.
