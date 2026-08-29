# RepoAssure Remaining Gated Product Work Direction Preparation v0.1

Status: decision_preparation_complete

Source inventory:
`docs/operations/repoassure-product-completion-gap-audit-refresh-v0.9.md`

Maintainer direction decision: pending

This package prepares the remaining product-work directions for one explicit
maintainer choice. It is advisory only: it does not record a direction
decision, issue an authorization receipt, or execute any gated work.

## Inventory Summary

- Blocked or manual-gated: 9
- External-input-gated: 3
- Deferred: 5
- Total inventoried items: 17

## Item-Level Decision Preparation

| Identifier | Consequence | Prerequisite | Evidence gap | Reversible next step |
| --- | --- | --- | --- | --- |
| `false_positive_detector_runtime_calibration` | Could reduce known false-positive risk, but would later change detector behavior if separately approved and implemented. | Explicit decisions for both calibration questions plus maintainer classification, fixture privacy, expected snapshot, confidence-threshold, and regression-artifact review. | Both calibration decision slots remain pending; ordinary Goal authorization is not detector authorization. | Record `approve`, `reject`, `defer`, or `accept-risk` for each existing question without changing code. |
| `npm_publication` | Would add an installable public package channel and a continuing release obligation. | Explicit publication decision, execution authorization, version and package review, rollback plan, and release evidence. | No publication authorization or execution receipt exists. | Record whether npm publication should enter a separately gated release plan; keep the package private meanwhile. |
| `github_release` | Would create a versioned public release artifact and public availability signal. | Explicit publication decision, release contents, tag and notes review, rollback plan, and execution authorization. | No GitHub Release authorization or approved release payload exists. | Record pursue, reject, or defer without creating a tag or release. |
| `public_launch` | Would change market-facing availability and product claims. | Owner-approved launch scope, claims review, support and operating readiness, rollback criteria, and execution authorization. | No public-launch decision, claim package, or launch receipt exists. | Record whether launch planning should begin; preserve no-launch state. |
| `final_product_acceptance` | Could close the product acceptance gate and change the declared completion state. | Current-version representative Web, Python/CLI, and MCP/Agent evidence plus explicit maintainer acceptance. | All representative acquisition and execution decisions remain `defer`, so current three-lane evidence is absent. | Keep `defer` or separately authorize a future evidence-acquisition decision cycle; do not infer acceptance. |
| `representative_multi_mode_acceptance_execution` | Would generate current evidence across the three representative lanes. | Explicit per-lane execution decisions, eligible acquired targets, valid receipts, stop conditions, isolation, and no-write controls. | Execution decisions are 3/3 `defer`; eligible acquired targets and receipts are 0/3. | Record whether any lane should be reconsidered, without running it. |
| `representative_target_acquisition` | Would make candidate targets locally available for later acceptance review. | Explicit per-lane acquisition decisions, source and revision review, privacy and license review, cleanup plan, and valid receipts. | Acquisition decisions are 3/3 `defer`; approved acquisitions and receipts are 0. | Record whether any lane should re-enter acquisition review, without accessing a source. |
| `workspace_summary_product_entrypoint` | Would expose the completed package-level summary through a product CLI or MCP surface. | Product decision on CLI, MCP, or neither; compatibility, security, UX, documentation, and acceptance plan. | The local package slice is complete, but no product-entrypoint decision exists. | Record the desired entrypoint direction or continue package-only use. |
| `team_cloud_enterprise` | Would open hosted collaboration, enterprise governance, privacy, security, and operating-model work. | Product strategy, customer evidence, tenancy and data policy, identity and access model, commercial plan, reliability model, and explicit authorization. | No accepted hosted-product decision or supporting operating evidence exists. | Decide whether to begin a bounded discovery Goal; do not implement or deploy hosted services. |
| `real_customer_workspace_evidence` | Could validate product behavior against more representative real-world conditions. | Authorized non-private or explicitly approved workspace, privacy and license review, target receipts, isolation, stop, and cleanup plans. | No authorized workspace or receipt exists. | Define acceptable evidence criteria or continue to defer; do not contact anyone or acquire a workspace. |
| `future_private_preview_feedback` | Could inform priorities with new reviewer evidence. | Feedback that actually exists, consent and provenance, bounded intake scope, and owner review. | No new feedback evidence exists; absence is not approval. | Define a future intake template or remain deferred without contacting reviewers. |
| `additional_security_provider_onboarding` | Could broaden security evidence coverage and provider interoperability. | Provider scope, credentials handling, legal and commercial approval, privacy review, compatibility contract, and integration authorization. | No approved provider, credentials, legal/commercial approval, or integration scope exists. | Record whether provider discovery is worth pursuing; do not obtain credentials or call a provider. |
| `workspace_summary_entrypoint_productization` | Could turn the completed local summary contract into a supported user workflow. | Confirmed user need, entrypoint decision, UX and compatibility contract, migration plan, and acceptance evidence. | Product demand and entrypoint ownership remain unconfirmed. | Choose package-only, CLI planning, MCP planning, or defer; do not add an entrypoint. |
| `website_design_follow_up` | Could refine product communication or usability on the existing site. | Owner-defined problem, current user or review evidence, accepted design scope, and visual acceptance criteria. | No current owner-directed follow-up scope or evidence is recorded. | Capture a bounded design question or keep the follow-up deferred. |
| `hosted_workspace_history_and_collaboration` | Could add persistent shared history and collaboration. | Accepted hosted-product direction, privacy and retention policy, identity model, operating plan, and deployment authorization. | Hosted-product and operating-model decisions do not exist. | Decide whether discovery should start; keep all hosted implementation disabled. |
| `packages_core_extraction` | Could simplify internal ownership boundaries but introduces migration and compatibility risk. | Concrete implementation pressure, dependency map, compatibility plan, migration sequence, and rollback evidence. | No current product pressure or acceptance blocker justifies the migration. | Revisit only when a named product change requires the extraction. |
| `benchmark_package_ownership_cleanup` | Could improve maintenance clarity for benchmark code and artifacts. | Defined ownership target, affected package contract, migration scope, and regression plan. | It is not a current product or acceptance blocker and has no approved priority. | Keep in backlog or promote later as a bounded maintenance Goal. |

## Primary Recommendation

Primary recommendation: `false_positive_detector_runtime_calibration`

Recommend resolving the two existing detector-calibration decision slots before
opening a new product implementation direction. The local evidence and intake
already exist, the missing input is explicit maintainer classification, and
the next step is decision-only and reversible. This recommendation does not
preselect `approve`, `reject`, `defer`, or `accept-risk`, and it does not
authorize detector design or implementation.

## Alternatives Kept Visible

| Direction family | Included items | Current state |
| --- | --- | --- |
| Representative acceptance evidence | Final acceptance, three-lane execution, target acquisition, real customer evidence, future preview feedback | Existing `defer` states and zero-target boundary remain unchanged. |
| Distribution and launch | npm publication, GitHub Release, public launch | No publication or launch authorization exists. |
| Local summary productization | Workspace-summary product entrypoint and entrypoint productization | Package-only local slice remains complete; entrypoint decision is pending. |
| Hosted product discovery | Team Cloud Enterprise and hosted workspace history/collaboration | No hosted-product decision or operating model exists. |
| Maintenance and extension | Website follow-up, additional security provider, packages/core extraction, benchmark ownership cleanup | No item is currently authorized for implementation. |

## Direction Choice for the Next Goal

The maintainer may explicitly select one of these direction families or
`defer_all_remaining_gated_work`. Selecting a family only records priority; it
does not approve its underlying actions. Any implementation, target,
publication, external-input, hosted, or runtime step still requires its own
prerequisites and authorization.

## Preserved State and Boundaries

- Representative acquisition decisions: 3/3 defer
- Representative execution decisions: 3/3 defer
- Final acceptance decision: defer
- Action Authorization Receipts issued: 0
- Target repositories acquired: 0
- Target repositories executed: 0
- Target repository writes: 0
- No target or external system was accessed.
- No dependency was installed and no target was cloned, analyzed, started, or
  run.
- No runtime detector, finding suppression, severity, confidence threshold,
  acceptance policy, final acceptance status, package entrypoint, or product
  entrypoint changed.
- No publication, deployment, launch, repository-control change, contact,
  pricing, spend, history rewrite, or force push occurred.

