# ADR-0008: Repository Acceptance Scope

- Status: Accepted
- Date: 2026-06-21
- Deciders: hardening-mcp maintainers

## Context

`hardening-mcp` v0.1 was built around a browser-first hardening loop:

1. analyze a local repo;
2. start or connect to a Web App;
3. explore reachable UI paths with Playwright;
4. generate findings, browser artifacts, reports, generated Playwright specs, repair plans, and repair task packages;
5. validate the generated Playwright spec during user acceptance.

This loop depends on a target that can expose a browser-accessible URL. The current `user:accept` runner therefore performs repo preflight around a Node/Web App shape: a real repo directory plus a file-based, JSON-object `package.json` manifest.

Testing `Panniantong/Agent-Reach` exposed a product boundary rather than a product regression. Agent-Reach is a Python CLI and Agent capability package: it has `pyproject.toml`, a Python CLI entrypoint, and no root `package.json`. Running the current browser acceptance flow against it produces the correct preflight failure, but the failure should be documented as an intentional scope boundary instead of being treated as a bug waiting to be patched.

## Decision

MVP v0.1 and the current v0.2 repair-plan increment keep `user:accept` scoped to automatically startable Web App repos or Web Apps with an explicitly supplied running URL.

Python CLI and Agent capability packages such as `Panniantong/Agent-Reach` are explicit out-of-scope targets for the current browser acceptance flow. They should fail repo preflight clearly when they do not provide the required Web App manifest and should produce structured acceptance records that explain the missing `package.json` requirement, preserve lifecycle next steps, and avoid attempting browser exploration.

The current product should not silently downgrade Python CLI, library-only, backend-only, mobile, or Agent capability repos into browser acceptance. Those repo types require a separate acceptance mode with different preflight, execution, evidence, and repair-task semantics.

## Current Scope

In scope for the current browser acceptance flow:

- Web App repos with a valid root `package.json`.
- Web App subprojects inside larger repos when the user points `--repo` at the Web App directory.
- Web Apps that can be started by detected or supplied start commands.
- Web Apps already running at a user-supplied `--url`.
- Browser evidence, generated Playwright specs, hardening reports, repair plans, repair task packages, and run manifests.

Out of scope for the current browser acceptance flow:

- Python CLI repos that only expose `pyproject.toml`.
- Agent capability packages without a browser UI.
- Library-only packages.
- Backend-only services without a browser-accessible UI path.
- Mobile, desktop, smart contract, or data-pipeline repos that require non-browser execution harnesses.

## Consequences

### Positive

- The product keeps a coherent MVP promise: diagnose and package fixes for Web Apps through browser-observed behavior.
- `user:accept` failures for non-Web repos become explainable scope boundaries instead of ambiguous test failures.
- Generated Playwright spec validation remains meaningful because accepted records continue to require browser-test execution.
- Repair plans and repair task packages stay grounded in browser findings, screenshots, traces, and Web App repro steps.

### Negative

- Users cannot currently validate Python CLI or Agent capability repos such as Agent-Reach through `user:accept`.
- Some repositories with useful agent-facing functionality will be rejected until a dedicated non-browser acceptance mode exists.
- The repo preflight requirement may feel strict when a repo is valuable but not a Web App.

### Follow-up

- Design a Future Python/CLI acceptance mode before supporting Agent-Reach-like repos.
- The future mode should detect `pyproject.toml`, package metadata, CLI entrypoints, and optional pytest/ruff/mypy configuration.
- It should run CLI smoke tests, deterministic command invocations, optional unit/static checks, network-access mocks where relevant, and Agent tool invocation checks when a repo exposes agent capabilities.
- It should output CLI-oriented findings, logs, repair plans, repair task packages, and verification commands instead of browser screenshots and generated Playwright specs.
- If the future mode is accepted into scope, add a new product spec section and dedicated `user:accept --mode cli` or equivalent mode instead of weakening the existing Web App preflight.

### Follow-up Implementation Note - 2026-06-21

The dedicated mode has entered the product as an explicit `user:accept --mode cli` path. This does not weaken the browser preflight: default browser acceptance still requires a Web App `package.json` manifest. CLI mode uses `pyproject.toml` preflight, Python/CLI profile generation, CLI smoke/static/test check execution results, a CLI-oriented report, run manifest, repair plan, and repair task package. Accepted CLI records still require concrete user notes, but they do not require generated Playwright spec validation.
