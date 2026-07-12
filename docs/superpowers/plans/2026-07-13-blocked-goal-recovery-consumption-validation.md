# Blocked Goal Recovery Consumption Validation v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make blocked-goal recovery packages directly consumable by an AI IDE while preserving maintainer, external-prerequisite, redaction, and non-authorization boundaries.

**Architecture:** Add a pure typed consumption-report builder beside the existing recovery-package writer, then expose file and CLI adapters. Reuse the existing recovery package as the only source input and keep all generated decisions report-only.

**Tech Stack:** TypeScript 6, Node.js 22, pnpm 10, Vitest, JSON and Markdown artifacts.

## Global Constraints

- Work only in the isolated campaign worktree based on latest `origin/main`.
- Apply Red-Green-Refactor to every behavior change.
- Do not execute recovery commands, target-repo mutations, releases, launch, customer contact, pricing/spend changes, or availability claims.
- Preserve local-first output and redact secret-like path material.
- Complete unit, integration, E2E, type-smoke, structure, lint, typecheck, hygiene, release, and goal-audit gates.

---

### Task 1: Stabilize the repair-evidence campaign baseline

**Files:**
- Modify: `tests/integration/playbook-e2e-repair-evidence.test.ts`

**Interfaces:**
- Consumes: package scripts and `scripts/*.mjs` command entrypoints.
- Produces: a full-chain E2E test that builds `@hardening-mcp/acceptance` once and invokes each Node script without redundant compilation.

- [x] **Step 1: Confirm the existing Red**

Run: `pnpm build && pnpm test`

Expected: the full repair-evidence E2E test exceeds `120000ms` after the new recovery stage.

- [x] **Step 2: Add the minimal execution helper**

Replace the per-stage package-script invocation with a one-time build and direct script mapping:

```ts
const SCRIPT_PATHS = {
  'playbook:generate': 'scripts/generate-ai-ide-repair-playbook.mjs',
  'playbook:consume': 'scripts/generate-ai-ide-playbook-consumption-report.mjs',
  'playbook:decide': 'scripts/generate-ai-ide-repair-decision-package.mjs',
  'playbook:approve': 'scripts/generate-ai-ide-repair-approval-receipt.mjs',
  'playbook:plan-approved': 'scripts/generate-ai-ide-approved-repair-execution-plan.mjs',
  'playbook:evidence': 'scripts/generate-ai-ide-repair-execution-evidence-report.mjs',
  'playbook:bundle': 'scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs',
  'playbook:contract': 'scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs',
  'playbook:replay': 'scripts/generate-ai-ide-repair-execution-replay-readiness.mjs',
  'playbook:proposal': 'scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs',
  'playbook:authorize': 'scripts/generate-ai-ide-target-repo-repair-goal-authorization-receipt.mjs',
  'playbook:target-repair-goal': 'scripts/generate-ai-ide-authorized-target-repo-repair-goal-task-package.mjs',
  'playbook:target-repair-evidence': 'scripts/generate-ai-ide-target-repo-repair-goal-execution-evidence-intake-report.mjs',
  'playbook:target-repair-review': 'scripts/generate-ai-ide-target-repair-evidence-review-decision-package.mjs',
  'goal:recover': 'scripts/generate-blocked-goal-recovery-package.mjs'
} as const;
```

Call `pnpm build:acceptance` once before the first stage, then call `node SCRIPT_PATHS[command]` with the original arguments after removing the package-script `--` separator.

- [x] **Step 3: Verify Green**

Run: `pnpm exec vitest run tests/integration/playbook-e2e-repair-evidence.test.ts --maxWorkers=1`

Expected: 1 test passes within 120 seconds and all artifact assertions remain unchanged.

### Task 2: Define recovery-package consumption behavior

**Files:**
- Create: `packages/acceptance/src/blocked-goal-recovery-consumption-report.ts`
- Create: `tests/unit/blocked-goal-recovery-consumption-report.test.ts`

**Interfaces:**
- Consumes: `BlockedGoalRecoveryPackage` from `blocked-goal-recovery-package.ts`.
- Produces: `buildBlockedGoalRecoveryConsumptionReport`, `buildBlockedGoalRecoveryConsumptionReportMarkdown`, and `writeBlockedGoalRecoveryConsumptionReport`.

- [x] **Step 1: Write the failing unit test**

```ts
const report = buildBlockedGoalRecoveryConsumptionReport({
  generatedAt: '2026-07-13T00:30:00.000Z',
  packagePath: '/private/tmp/goal-TOKEN=secret/recovery.json',
  recoveryPackage
});

expect(report.schemaVersion).toBe('repoassure.blocked-goal-recovery-consumption-report.v1');
expect(report.resumeReadiness).toBe('waiting_for_maintainer_or_external_action');
expect(report.actionQueue.map((item) => item.actionType)).toEqual([
  'automatic_retry_candidate',
  'maintainer_decision_required',
  'external_prerequisite_required'
]);
expect(report.boundaryCompliance.recoveryCommandsExecuted).toBe(false);
expect(report.blockedActions).toContain('target_repo_file_mutation_by_repoassure');
expect(JSON.stringify(report)).not.toContain('secret');
```

- [x] **Step 2: Verify Red**

Run: `pnpm exec vitest run tests/unit/blocked-goal-recovery-consumption-report.test.ts`

Expected: fail because the consumption-report module does not exist.

- [x] **Step 3: Implement the minimal typed report**

Implement these stable interfaces:

```ts
export type BlockedGoalResumeReadiness =
  | 'ready_to_resume_after_review'
  | 'automatic_retry_candidates_available'
  | 'waiting_for_maintainer_or_external_action';

export type BlockedGoalRecoveryActionType =
  | 'automatic_retry_candidate'
  | 'maintainer_decision_required'
  | 'external_prerequisite_required';

export interface BlockedGoalRecoveryConsumptionReport {
  schemaVersion: 'repoassure.blocked-goal-recovery-consumption-report.v1';
  generatedAt: string;
  sourceRecoveryPackage: { path: string; sha256: string };
  resumeReadiness: BlockedGoalResumeReadiness;
  evidenceReadOrder: Array<{ label: string; path: string }>;
  actionQueue: Array<{ blockerId: string; actionType: BlockedGoalRecoveryActionType; instruction: string }>;
  resumeChecklist: string[];
  resumeCommands: Array<{ command: string; purpose: string }>;
  boundaryCompliance: { recoveryCommandsExecuted: false; blockedActionsPreserved: boolean };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}
```

- [x] **Step 4: Verify Green and refactor**

Run: `pnpm exec vitest run tests/unit/blocked-goal-recovery-consumption-report.test.ts`

Expected: all tests pass with no secret-like values in JSON or Markdown.

### Task 3: Add CLI, package contracts, and real-chain validation

**Files:**
- Create: `scripts/generate-blocked-goal-recovery-consumption-report.mjs`
- Create: `tests/integration/goal-recover-consume.test.ts`
- Modify: `package.json`
- Modify: `packages/acceptance/package.json`
- Modify: `packages/acceptance/src/index.ts`
- Modify: `packages/acceptance/src/compatibility.ts`
- Modify: `tests/type-smoke/acceptance-package-subpaths.ts`
- Modify: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Modify: `tests/unit/project-structure.test.ts`

**Interfaces:**
- Consumes: `blocked-goal-recovery-package.json` through `--package` or `--from-dir`.
- Produces: `pnpm --silent goal:recover:consume`, JSON/Markdown reports, package subpath export, and E2E evidence.

- [x] **Step 1: Write failing integration and contract tests**

Assert that:

```ts
expect(report.schemaVersion).toBe('repoassure.blocked-goal-recovery-consumption-report.v1');
expect(stdout).toContain('blocked-goal-recovery-consumption-report.json');
expect(markdown).toContain('## Recovery Action Queue');
expect(markdown).toContain('## Resume Checklist');
expect(json).not.toContain('secret-value');
```

- [x] **Step 2: Verify Red**

Run: `pnpm exec vitest run tests/integration/goal-recover-consume.test.ts tests/unit/project-structure.test.ts --testNamePattern "blocked goal recovery consumption"`

Expected: fail because the CLI, export, contract, and E2E output do not exist.

- [x] **Step 3: Implement adapters and exports**

Add:

```json
"goal:recover:consume": "pnpm build:acceptance && node scripts/generate-blocked-goal-recovery-consumption-report.mjs"
```

Expose `./blocked-goal-recovery-consumption-report` from `@hardening-mcp/acceptance`, include it in compatibility/type-smoke contracts, and extend the E2E artifact inventory.

- [x] **Step 4: Verify Green**

Run focused unit, integration, type-smoke, E2E, and structure tests.

Expected: all targeted tests pass.

### Task 4: Cascade source-of-truth documents and complete quality gates

**Files:**
- Create: `docs/operations/blocked-goal-recovery-consumption-validation-v0.1.md`
- Modify: `docs/PRD.md`
- Modify: `docs/SPEC.md`
- Modify: `docs/PLAN.md`
- Modify: `README.md`
- Modify: `docs/testing/strategy/test-strategy-v0.1.md`
- Modify: `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- Modify: `docs/logs/decision-log.md`
- Modify: `docs/logs/dev-log.md`

**Interfaces:**
- Consumes: verified implementation and test evidence.
- Produces: synchronized product intent, solution contract, execution state, operating guide, testing evidence, and next-goal state.

- [x] **Step 1: Add a failing structure cascade assertion**

Require every listed document to contain `Blocked Goal Recovery Consumption Validation v0.1`, the schema id, CLI command, or the relevant boundary statement.

- [x] **Step 2: Verify Red, then update documents**

Run the focused structure test, update only the required sections, and rerun until Green.

- [x] **Step 3: Run the testing pyramid**

Run in this order:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

Expected: all automated gates pass; release check may continue reporting public-release no-go if that is the accepted boundary, but the command itself must complete successfully.

- [ ] **Step 4: Review, commit, PR, CI, and return to Autopilot**

Review the diff for secrets and scope, commit the child goal, push the campaign branch, create a PR, wait for CI, merge only after successful checks, verify `main` CI, then return evidence to Project Autopilot for next-goal derivation.
