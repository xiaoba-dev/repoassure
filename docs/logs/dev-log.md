# 开发日志

## 2026年7月2日 - Target Repo Acceptance Feedback Loop Spec v0.1

### 完成内容

- 新增 `docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md`。
- 记录 status `target_repo_feedback_loop_specified_not_implemented`。
- 记录 source priority `Product Backlog Prioritization v0.1 / Priority 1`、implementation authorization `spec_only` 和 launch authorization status `not_authorized`。
- 定义 future acceptance feedback summary contract：`runStatus`、`targetRepoMetadataClass`、`acceptanceResult`、`blockerCategory`、`nextRecommendedProductAction`、`artifactLinks`、`redactionBoundary` 和 `maintainerTriageGuidance`。
- 定义 AI IDE consumption order 和后续 TDD implementation order。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Target Repo Acceptance Feedback Loop Spec v0.1 文档和级联记录存在；测试因 `docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md` 缺失按预期失败。
- Green：新增 spec 文档和级联记录，明确本轮只锁定 contract，不实现 runtime。

### 边界

- No runtime implementation was executed。
- No target repo material was uploaded。
- No secrets or raw private repo content may be stored。
- No Action Authorization Receipt was produced。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月2日 - Product Backlog Prioritization v0.1

### 完成内容

- 新增 `docs/operations/product-backlog-prioritization-v0.1.md`。
- 记录 status `product_backlog_prioritized_launch_deferred`。
- 记录 source backlog `Product / Website / User Validation Backlog Planning v0.1`、prioritization decision `prioritize_product_validation_before_launch` 和 launch authorization status `not_authorized`。
- 明确后续 TDD 执行顺序：Priority 1: Target repo acceptance feedback loop、Priority 2: AI IDE handoff material quality、Priority 3: Repair task actionability、Priority 4: User validation evidence loop、Priority 5: Release readiness hygiene automation。
- 明确本轮排序不重新打开 public launch gate，不生成 Action Authorization Receipt。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Product Backlog Prioritization v0.1 文档和级联记录存在；测试因 `docs/operations/product-backlog-prioritization-v0.1.md` 缺失按预期失败。
- Green：新增 product backlog prioritization 文档和级联记录，明确后续开发优先从真实目标 repo 验收反馈闭环开始。

### 边界

- No Action Authorization Receipt was produced。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Product / Website / User Validation Backlog Planning v0.1

### 完成内容

- 新增 `docs/operations/product-website-user-validation-backlog-v0.1.md`。
- 记录 status `backlog_planned_launch_deferred`。
- 记录 source closure `Public Launch Defer Closure v0.1` 和 launch authorization status `not_authorized`。
- 拆分 product backlog、public website backlog、user validation backlog、release readiness hygiene backlog 和 future launch reopening criteria。
- 明确 backlog 不重新打开 public launch gate，不生成 Action Authorization Receipt。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Product / Website / User Validation Backlog Planning v0.1 文档和级联记录存在；测试因 `docs/operations/product-website-user-validation-backlog-v0.1.md` 缺失按预期失败。
- Green：新增 backlog planning 文档和级联记录，明确后续 workstream 转向产品、官网、用户验证和 release hygiene。

### 边界

- No Action Authorization Receipt was produced。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Public Launch Defer Closure v0.1

### 完成内容

- 新增 `docs/operations/public-launch-defer-closure-v0.1.md`。
- 记录 status `launch_gate_closed_deferred`。
- 记录 closure decision `close_public_launch_gate_as_deferred` 和 launch authorization status `not_authorized`。
- 明确 Do not continue repeating launch authorization gates。
- 记录 future launch entry `new_future_launch_authorization_packet_required`。
- 记录 next workstream `product_website_user_validation_backlog`。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Launch Defer Closure v0.1 文档和级联记录存在；测试因 `docs/operations/public-launch-defer-closure-v0.1.md` 缺失按预期失败。
- Green：新增 closure 文档和级联记录，明确 public launch gate 已关闭为 deferred，后续转向产品、官网和用户验证 backlog。

### 边界

- No Action Authorization Receipt was produced。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Explicit Launch Authorization or Defer Decision v0.1

### 完成内容

- 新增 `docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md`。
- 记录 status `explicit_defer_decision_recorded_launch_not_authorized`。
- 记录 launch authorization status `not_authorized` 和 explicit launch decision `defer_public_launch`。
- 记录 decision source `goal_execution_authorization_only`，来源为 `Maintainer Launch Decision Input v0.1`。
- 将 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 和 final launch approval 均记录为 `not_provided`。
- 明确 No Action Authorization Receipt was produced，下一步 gate 为 `future_launch_authorization_packet`。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Explicit Launch Authorization or Defer Decision v0.1 文档和级联记录存在；测试因 `docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md` 缺失按预期失败。
- Green：新增 explicit defer decision 文档和级联记录，明确 public launch 继续 deferred，launch 未授权。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Maintainer Launch Decision Input v0.1

### 完成内容

- 新增 `docs/operations/maintainer-launch-decision-input-v0.1.md`。
- 记录 status `decision_input_recorded_launch_not_authorized`。
- 记录 launch authorization status `not_authorized`、maintainer input decision `not_supplied` 和 launch decision `defer_launch`。
- 明确 Goal execution authorization is not launch authorization。
- 将 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 和 final launch approval input 均记录为 `not_supplied`。
- 明确 No Action Authorization Receipt was produced，下一步 gate 为 `explicit_launch_authorization_or_defer_decision`。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Maintainer Launch Decision Input v0.1 文档和级联记录存在；测试因 `docs/operations/maintainer-launch-decision-input-v0.1.md` 缺失按预期失败。
- Green：新增 maintainer launch decision input 文档和级联记录，明确本轮 goal 授权不等于 launch 授权，launch 继续 deferred。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Public Launch Authorization Packet Completion v0.1

### 完成内容

- 新增 `docs/operations/public-launch-authorization-packet-completion-v0.1.md`。
- 记录 status `completion_recorded_launch_not_authorized`。
- 记录 launch authorization status `not_authorized` 和 completion decision `defer_launch_authorization`。
- 将 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 和 maintainer approval 均记录为 `defer`。
- 明确 No Action Authorization Receipt was produced，下一步 gate 为 `maintainer_launch_decision_input`。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Launch Authorization Packet Completion v0.1 文档和级联记录存在；测试因 `docs/operations/public-launch-authorization-packet-completion-v0.1.md` 缺失按预期失败。
- Green：新增 completion 文档和级联记录，明确所有 launch completion fields 继续 deferred，launch 未授权。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Public Launch Authorization Packet v0.1

### 完成内容

- 新增 `docs/operations/public-launch-authorization-packet-v0.1.md`。
- 记录 launch authorization status `not_authorized`。
- 建立 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 和 maintainer approval 字段。
- 明确该 packet 不是 Action Authorization Receipt，不授权 launch execution。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Launch Authorization Packet v0.1 文档和级联记录存在；测试因 `docs/operations/public-launch-authorization-packet-v0.1.md` 缺失按预期失败。
- Green：新增 authorization packet 文档和级联记录，明确 `authorization_packet_prepared` 状态与 launch 未授权边界。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Public Launch Boundary Decision v0.1

### 完成内容

- 新增 `docs/operations/public-launch-boundary-decision-v0.1.md`。
- 记录当前模式 `source_public_website_live`。
- 记录决策 `do_not_launch_yet` 和下一步 gate `public_launch_authorization`。
- 明确源码公开和官网在线不等于 public launch。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Launch Boundary Decision v0.1 文档和级联记录存在；测试因 `docs/operations/public-launch-boundary-decision-v0.1.md` 缺失按预期失败。
- Green：新增 launch boundary 文档和级联记录，明确 `launch_not_authorized` 状态与非执行边界。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No customer contact was executed。
- No pricing change or spend was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Public Release Post-Merge Hygiene v0.1

### 完成内容

- 新增 `docs/operations/public-release-post-merge-hygiene-v0.1.md`。
- 复核 repository visibility `PUBLIC`、default branch `main` 和 branch protection profile `solo_maintainer`。
- 记录 required status check `Quality Gates`、main CI run `28511247860` 和 main head `477cca98160bf47d407baa180154bb6c368ace8f`。
- 验证 `package.json` 仍保持 `"private": true`，GitHub release list 为空、remote tags 为空、npm registry 中不存在 `hardening-mcp` package。
- 验证 `repoassure.com` 和 `www.repoassure.com` 均通过 `pnpm verify:website`。
- 复核 secret/customer data exposure scan、`pnpm repo:hygiene` 和 `pnpm release:check`。
- 级联更新 README、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Post-Merge Hygiene v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-post-merge-hygiene-v0.1.md` 缺失按预期失败。
- Green：新增 hygiene 文档和级联记录，明确 `hygiene_verified` 状态与非执行边界。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。
- No external customer logo、case study 或 production customer claim was executed。

## 2026年7月1日 - Solo Maintainer Branch Protection Adjustment v0.1

### 完成内容

- 新增 ADR-0023：`docs/adr/0023-solo-maintainer-branch-protection.md`。
- 新增 `docs/operations/solo-maintainer-branch-protection-adjustment-v0.1.md`。
- 新增 `docs/operations/protected-pr-workflow-closure-v0.1.md`。
- 记录独立开发者维护模式下的 branch protection 调整：required approving reviews `1 -> 0`。
- 明确保留 `Quality Gates`、strict status checks、admin enforcement、conversation resolution、linear history、禁用 force pushes 和 branch deletion。
- 合并 PR #3，merge commit `c522f3c180ea642d4c531f97ecb287aa061d060f`。
- 确认 main CI run `28510634551` 已通过。
- 级联更新 README、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 ADR-0023、Solo Maintainer Branch Protection Adjustment v0.1 文档和级联记录存在；测试因 ADR 文档缺失按预期失败。
- Green：新增 ADR、operation 文档和级联记录，明确 solo maintainer profile 与非执行边界。

### 边界

- No CI gate weakening was authorized。
- No direct push to `main` was executed。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Protected PR Workflow Verification v0.1

### 完成内容

- 创建验证分支 `codex/protected-pr-workflow-v0.1`。
- 创建 PR #3：`https://github.com/xiaoba-dev/repoassure/pull/3`。
- 新增 `docs/operations/protected-pr-workflow-verification-v0.1.md`。
- 记录 protected PR workflow contract：branch protection remains enabled、required status check `Quality Gates`、PR workflow、review gate、merge gate、禁止直推 `main`。
- 验证 PR CI 已通过；最新具体 run ID 由 GitHub PR status 和 PR evidence comment 记录，避免 evidence-only commit 触发新 CI 后造成 tracked docs stale。
- 验证 GitHub 拒绝 self-approval：`Review Can not approve your own pull request`。
- 级联更新 README、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Protected PR Workflow Verification v0.1 文档和级联记录存在；测试因 `docs/operations/protected-pr-workflow-verification-v0.1.md` 缺失按预期失败。
- Green：新增 verification 文档和级联记录，明确 PR workflow 验证范围和非执行边界。

### 边界

- No branch protection weakening was executed。
- No direct push to `main` was executed。
- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。

## 2026年7月1日 - Native Branch Protection Enablement v0.1

### 完成内容

- 新增 `docs/operations/native-branch-protection-enablement-v0.1.md`。
- 采用 GitHub branch protection 保护 `main`。
- 配置 required status check：`Quality Gates`。
- 配置 strict status checks：`true`。
- 配置 PR merge、1 个 approving review、stale review dismissal 和 conversation resolution。
- 禁用 force pushes 和 branch deletion。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Native Branch Protection Enablement v0.1 文档和级联记录存在；测试因 `docs/operations/native-branch-protection-enablement-v0.1.md` 缺失按预期失败。
- Green：新增 execution 文档和级联记录，明确 native branch protection 目标状态与非执行边界。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。
- 后续 `main` 更新应走受保护 PR 流程。

## 2026年7月1日 - Public Source Release Execution v0.1

### 完成内容

- 执行 `gh repo edit xiaoba-dev/repoassure --visibility public --accept-visibility-change-consequences`。
- 新增 `docs/operations/public-source-release-execution-v0.1.md`。
- Post-release GitHub visibility verification：`PUBLIC`，`isPrivate: false`。
- Public read access verification：执行时 `git ls-remote https://github.com/xiaoba-dev/repoassure.git HEAD` 返回 `1593cfb36871ceef08c9711fd21bc59ebcee6bc8`。
- 复核最新 pre-execution `RepoAssure CI` run `28492994026` 为 success。
- 验证 `pnpm release:check` 报告 `public release ready: yes`。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Source Release Execution v0.1 文档和级联记录存在；测试因 `docs/operations/public-source-release-execution-v0.1.md` 缺失按预期失败。
- Green：执行 repository visibility change 后新增 execution 文档和级联记录，明确 repository public verified 且只执行 visibility change。

### 边界

- No npm publication was executed。
- No GitHub release was executed。
- No public launch or production marketing announcement was executed。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was executed。
- 下一步建议配置 native branch protection / repository ruleset。

## 2026年7月1日 - Equivalent Release Control Closure v0.1

### 完成内容

- 新增 `docs/operations/equivalent-release-control-closure-v0.1.md`。
- 新增 `docs/product/strategy/public-release-authorization-v0.1.md`。
- 固定 release candidate SHA：`589bd9eb83bd6cd185f28d029732ee6b98027873`。
- 复核 GitHub `RepoAssure CI` run `28492402257`，结论为 success。
- 记录 maintainer approval for equivalent control closure 和 residual risk accepted。
- 验证 `pnpm release:check` 当前报告 `public release ready: yes`。
- 验证 `pnpm test` 当前 609 passed / 1 skipped。
- 级联更新 README、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts` 和 `tests/unit/public-release-readiness.test.ts`，要求 closure 文档、authorization record 和 authorization record 存在时 `releaseReady` 为 true；结构测试因 `docs/operations/equivalent-release-control-closure-v0.1.md` 缺失按预期失败。
- Green：新增 closure 文档、authorization record 和级联记录；最终门禁验证 `pnpm release:check` 报告 `public release ready: yes`。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。
- Public Source Release Execution v0.1 必须作为单独 goal 获得明确执行授权。

## 2026年7月1日 - Equivalent Release Control Design v0.1

### 完成内容

- 新增 `docs/adr/0022-equivalent-release-control.md`。
- 新增 `docs/operations/equivalent-release-control-design-v0.1.md`。
- 定义 branch protection gate 的替代证据包候选：exact release commit SHA、RepoAssure CI / Quality Gates、local full test、`pnpm build`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm repo:hygiene`、`pnpm release:check`、secret/customer-data exposure scan、diff review 和 maintainer approval for equivalent control closure。
- 明确 equivalent release control 当前状态为 `designed_not_executed`，不关闭 branch protection gate，不执行 Public Source Release Execution v0.1。
- 级联更新 ADR index、README、architecture overview、public release checklist、acceptance checklist、testing strategy 和 decision log。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 ADR-0022、Equivalent Release Control Design v0.1 文档和级联记录存在；测试因 `docs/adr/0022-equivalent-release-control.md` 缺失按预期失败。
- Green：新增 ADR、operation packet 和级联记录，保持 public release remains no-go。

### 边界

- Public Source Release Execution v0.1 remains blocked。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Release Manual Decision Input Review v0.2

### 完成内容

- 新增 `docs/operations/public-release-manual-decision-input-review-v0.2.md`。
- 复核 `docs/operations/public-release-manual-decision-intake-v0.2.md` 中的 7 项 maintainer manual gate 决策。
- 确认 legal review approve、trademark/name accept risk、final maintainer publication authorization approve、private preview reviewer feedback accept risk、dependency/license risk accept risk、secret/customer data exposure approve 均已记录且可审阅。
- 确认 branch protection or equivalent repository ruleset 仍为 defer，且是当前唯一 blocking manual gate。
- 明确本 review 不定义 equivalent release control，不通过公开仓库解锁 branch protection，不授权 Public Source Release Execution v0.1。
- 更新 `pnpm release:check` 的 not_ready 说明，避免继续提示 legal/trademark/final authorization 仍缺失；当前说明收敛为 branch protection or equivalent repository ruleset remains required。
- 级联更新 README、public release checklist、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Decision Input Review v0.2 文档和级联记录存在；测试因 `docs/operations/public-release-manual-decision-input-review-v0.2.md` 缺失按预期失败。
- Green：新增 v0.2 review 文档和级联记录，明确 public release remains no-go，当前阻塞项是 branch protection or equivalent repository ruleset。

### 边界

- Public Source Release Execution v0.1 remains blocked。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Release Manual Decision Intake v0.2

### 完成内容

- 新增 `docs/operations/public-release-manual-decision-intake-v0.2.md`。
- 记录当前状态：`Status: decisions_recorded_release_execution_blocked`。
- 正式落档 maintainer 明确给出的 7 项 manual gate 决策：
  - Legal review: approve。
  - Trademark/name review: accept risk。
  - Branch protection or equivalent repository ruleset: conditional approve fallback defer，当前最终为 defer。
  - Final maintainer publication authorization: approve，但被 deferred branch protection gate 阻塞。
  - Private preview reviewer feedback decision: accept risk。
  - Dependency/license risk confirmation: accept risk。
  - Secret/customer data exposure confirmation: approve，基于自动核验。
- 只读核验 GitHub repository state：repo 仍为 `PRIVATE`，branch protection API 和 repository rulesets API 仍返回 `HTTP 403`。
- 复核 `pnpm repo:hygiene`、`pnpm release:check` 和 scoped sensitive account scan。
- 级联更新 README、public release checklist、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Decision Intake v0.2 文档和级联记录存在；测试因 `docs/operations/public-release-manual-decision-intake-v0.2.md` 缺失按预期失败。
- Green：新增 v0.2 decision intake 文档和级联记录，明确 final authorization 已记录但 release execution 仍因 deferred branch protection gate 阻塞。

### 边界

- Public Source Release Execution v0.1 remains blocked。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Release Manual Decision Input Completion v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-decision-input-completion-v0.1.md`。
- 记录当前状态：`Status: not_completed_missing_explicit_decisions`。
- 明确本轮 goal execution authorization 不是 manual release decision。
- 确认未收到任何 approve / reject / defer / accept risk decision、evidence、decision date、notes 或 scope。
- 为 maintainer 保留可填写的 manual decision input template。
- 级联更新 README、public release checklist、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Decision Input Completion v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-decision-input-completion-v0.1.md` 缺失按预期失败。
- Green：新增 completion attempt 文档和级联记录，明确所有 manual gates 仍为 not_completed / missing_decision。

### 边界

- No gate was approved, rejected, deferred, risk-accepted, closed, passed, or completed。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Release Manual Gate Closure v0.2

### 完成内容

- 新增 `docs/operations/public-release-manual-gate-closure-v0.2.md`。
- 记录当前状态：`Status: not_closed_after_fresh_evidence_review`。
- 只读核验 GitHub repository state：`xiaoba-dev/repoassure` 仍为 `PRIVATE`，default branch 为 `main`。
- 只读核验最新 CI：`RepoAssure CI` run `28486178718` 为 `success`，head SHA 为 `bd7da4d696c13ff2959c47c05f3a8293409768e9`。
- 只读核验 branch protection 和 repository rulesets：两个 GitHub API 仍返回 `HTTP 403`，原因仍为当前 private repo plan 限制。
- 更新 `docs/operations/branch-protection-release-boundary-v0.1.md`，记录 2026-07-01 recheck。
- 级联更新 README、public release checklist、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Gate Closure v0.2 文档和级联记录存在；测试因 `docs/operations/public-release-manual-gate-closure-v0.2.md` 缺失按预期失败。
- Green：新增 v0.2 closure review 文档和级联记录，明确 fresh evidence 已复核但 manual gates 仍未关闭。

### 边界

- Goal execution authorization is not final publication authorization。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Website Post-Domain Polish & Launch Boundary Review v0.1

### 完成内容

- 新增 `docs/operations/public-website-post-domain-polish-v0.1.md`。
- 记录当前状态：`Status: verified_post_domain_polish`。
- 为 `apps/website/index.html` 补齐 canonical URL、robots meta、theme color、Open Graph metadata、Twitter metadata、favicon link 和 web manifest link。
- 新增 `apps/website/public/favicon.svg`、`og-image.svg`、`robots.txt`、`site.webmanifest` 和 `sitemap.xml`。
- 将 `scripts/verify-website.mjs` 扩展为同时验证 SEO metadata、Open Graph/Twitter metadata、favicon、manifest、robots.txt、sitemap.xml 和 OG image。
- 记录 redirect policy：`repoassure.com` 与 `www.repoassure.com` 当前均直接 HTTP/2 200 服务，不配置 apex/www canonical redirect。
- 级联更新 README、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先更新 `tests/unit/public-website.test.ts` 和 `tests/unit/project-structure.test.ts`，要求 post-domain SEO/discoverability assets 和 operation 级联记录存在；测试因缺少 `apps/website/public/robots.txt` 和 `docs/operations/public-website-post-domain-polish-v0.1.md` 按预期失败。
- Green：新增静态 metadata/assets、扩展 verifier，并新增 post-domain operation record 与级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年7月1日 - Public Website Custom Domain Deployment v0.1 verification closure

### 完成内容

- 将 `docs/operations/public-website-custom-domain-deployment-v0.1.md` 状态更新为 `Status: verified_custom_domain_active`。
- 确认 Cloudflare Pages custom domains API 返回 `repoassure.com` 和 `www.repoassure.com` 均为 active。
- 确认 DNS 已通过 Cloudflare proxied CNAME 指向 `repoassure-preview.pages.dev`。
- 确认 `https://repoassure.com` 和 `https://www.repoassure.com` 均返回 HTTP/2 200 over HTTPS。
- 执行 `REPOASSURE_WEBSITE_URL=https://repoassure.com REPOASSURE_WEBSITE_QA_DIR=/private/tmp/repoassure-custom-domain-qa pnpm verify:website` 并通过。
- 执行 `REPOASSURE_WEBSITE_URL=https://www.repoassure.com REPOASSURE_WEBSITE_QA_DIR=/private/tmp/repoassure-custom-domain-www-qa pnpm verify:website` 并通过。
- 验证英文默认、Simplified Chinese 语言切换、desktop/mobile smoke、Trust Ledger、Assurance Graph、artifact tabs、private preview form 和 forbidden-claim custom-domain boundary。
- 将 README、acceptance checklist、testing strategy 和 blockers 从 DNS blocked 状态级联更新为 verified/resolved。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月30日 - Public Website Custom Domain Deployment v0.1

### 完成内容

- 新增 `docs/operations/public-website-custom-domain-deployment-v0.1.md`。
- 记录当前状态：`Status: blocked_dns_cname_not_set`。
- 在用户授权部署 `RepoAssure.com` 后，执行 `pnpm build:website` 并通过。
- 执行 `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch main --commit-dirty=true --commit-message "RepoAssure custom domain deployment"` 并通过。
- 记录最新 deployment URL：`https://9dc5dd8b.repoassure-preview.pages.dev`。
- Cloudflare Pages custom domain API 已接受 `repoassure.com` 和 `www.repoassure.com` 两个域名绑定。
- 当前 Cloudflare Pages domain verification 返回 `CNAME record not set`，HTTPS verification、页面内容 smoke、语言切换和 forbidden-claim custom-domain verification 仍未完成。
- 当前 `CLOUDFLARE_API_TOKEN` 写 DNS 记录返回 `Authentication error`，需要通过 Cloudflare Dashboard 或具备 DNS Edit 权限的 token 添加 CNAME。
- 级联更新 README、acceptance checklist、testing strategy 和 blockers。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Website Custom Domain Deployment v0.1 文档和级联记录存在；测试因 `docs/operations/public-website-custom-domain-deployment-v0.1.md` 缺失按预期失败。
- Green：新增 custom domain deployment operation record，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月28日 - Private Preview External Reviewer Selection v0.1

### 完成内容

- 新增 `docs/operations/private-preview-external-reviewer-selection-v0.1.md`。
- 选择 first-batch 匿名 slots：`external-reviewer-1`、`external-reviewer-2`。
- 将 `external-reviewer-1` 定义为 developer builder archetype。
- 将 `external-reviewer-2` 定义为 engineering lead archetype。
- 选择 first-batch dispatch channel：manual maintainer email。
- 记录 `Access update decision: required_before_dispatch`。
- 明确下一步必须另开 `Private Preview External Reviewer Access Update v0.1`，并由 maintainer 通过非 Git 渠道提供真实 reviewer emails 后才能更新 Cloudflare Access。
- 级联更新 recruitment plan、dispatch readiness、package-and-dispatch、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 Private Preview External Reviewer Selection 文档和级联记录存在；测试因 `docs/operations/private-preview-external-reviewer-selection-v0.1.md` 缺失按预期失败。
- Green：新增 selection 文档并补齐级联。

### 边界

- 不发送 reviewer invitation。
- 不新增 Cloudflare Access reviewer。
- 不记录真实 reviewer email 到 Git tracked docs。
- 不创建 external issue。
- 不编造 reviewer feedback。
- 不把 maintainer-owned access smoke test identities 视为 external reviewers。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月28日 - Private Preview External Reviewer Recruitment and Dispatch Plan v0.1

### 完成内容

- 新增 `docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md`。
- 定义 external reviewer 必须 not maintainer-owned、不是 maintainer test mailbox、能从真实潜在用户/买方/技术评估者视角审查 RepoAssure。
- 定义 minimum reviewer count: 2。
- 定义推荐 reviewer mix：developer builder、engineering lead、security-minded reviewer。
- 定义 dispatch channel options：manual maintainer email、private maintainer-managed chat/DM、Resend。
- 将第一批推荐 channel 记录为 manual maintainer email；Resend 需要另开 channel decision 后才能使用。
- 定义 slot-level privacy record、dispatch gate 和 feedback intake gate。
- 明确 No invitation was sent，且不新增 Cloudflare Access reviewer。
- 级联更新 identity correction、dispatch readiness、package-and-dispatch、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 Private Preview External Reviewer Recruitment and Dispatch Plan 文档和级联记录存在；测试因 `docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md` 缺失按预期失败。
- Green：新增 recruitment/dispatch plan 文档并补齐级联。

### 边界

- 不发送 reviewer invitation。
- 不新增 Cloudflare Access reviewer。
- 不记录真实 reviewer email 到 Git tracked docs。
- 不创建 external issue。
- 不编造 reviewer feedback。
- 不把 maintainer-owned access smoke test identities 视为 external reviewers。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月28日 - Private Preview Reviewer Identity Correction v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-identity-correction-v0.1.md`。
- 将此前 `confirmed-reviewer-1`、`confirmed-reviewer-2` 的当前语义纠正为 `maintainer-test-email-1`、`maintainer-test-email-2`。
- 明确这两个身份是 maintainer-owned access smoke test identities，只用于 Cloudflare Access/OTP smoke 和私测入口验证。
- 明确它们 not external reviewers，也 does not count as external reviewer feedback。
- 明确 No outbound reviewer invitation was sent。
- 将 dispatch readiness 当前状态调整为 `waiting_for_external_reviewer_identity`。
- 级联更新 real reviewer replacement、identity reconciliation、reviewer handoff、dispatch readiness、package-and-dispatch、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 Private Preview Reviewer Identity Correction 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-identity-correction-v0.1.md` 缺失按预期失败。
- Green：新增 identity correction 文档并补齐级联，将旧的 external reviewer 解释纠偏为 maintainer-owned access smoke test identities。

### 边界

- 不记录真实 reviewer email 到 Git tracked docs。
- 不把 maintainer-owned test emails 视为 independent external reviewers。
- 不把 maintainer-owned smoke 结果视为 external reviewer feedback。
- 不解锁 Private Preview Feedback Triage Execution。
- 不发送 reviewer invitation。
- 不创建 external issue。
- 不编造 reviewer feedback。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Reviewer Handoff Package and Dispatch Execution v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md`。
- Stage 1：生成标准 reviewer handoff package，包含 review URL、review focus、feedback template 和敏感信息边界。
- Stage 2：dispatch execution 记录为 `pending_channel_confirmation`，因为本轮没有明确发送渠道，也没有可审计 outbound dispatch evidence。
- 记录 reviewer slots 为 `confirmed-reviewer-1`、`confirmed-reviewer-2`，不在 Git tracked docs 记录 reviewer PII。
- 明确 No outbound message was sent。
- 级联更新 reviewer handoff、dispatch readiness、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 Private Preview Reviewer Handoff Package and Dispatch Execution 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md` 缺失按预期失败。
- Green：新增 package-and-dispatch 文档并补齐级联。

### 边界

- 不记录真实 reviewer email 到 Git tracked docs。
- No outbound message was sent。
- Do not create external issues from this goal。
- Do not invent reviewer feedback。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不分享 deployment subdomains 或 branch aliases。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Real Reviewer Replacement v0.1

### 完成内容

- 用户提供真实 reviewer emails：`confirmed-reviewer-1`、`confirmed-reviewer-2`。
- 在用户明确回复“确认保存”后，通过 Cloudflare Dashboard UI 保存 `RepoAssure reviewer allow` policy。
- 从 active allow list 移除 placeholder reviewer emails：`reviewer1@example.com`、`reviewer2@example.com`。
- 保存后打开 Cloudflare policy details panel，确认 Include `Emails` value 为 `confirmed-reviewer-1 , confirmed-reviewer-2`。
- 新增 `docs/operations/private-preview-real-reviewer-replacement-v0.1.md`。
- 级联更新 identity reconciliation、handoff dispatch readiness、second reviewer access execution、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 Private Preview Real Reviewer Replacement 文档和级联记录存在；测试因 `docs/operations/private-preview-real-reviewer-replacement-v0.1.md` 缺失按预期失败。
- Green：新增 replacement 文档并补齐级联；随后运行 structure test 和质量门禁。

### 边界

- Do not send reviewer invitations from this goal。
- Do not create external issues from this goal。
- Do not invent reviewer feedback。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不分享 deployment subdomains 或 branch aliases。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Reviewer Identity Reconciliation v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md`。
- 澄清 Maintainer / user 负责 reviewer selection、authorization 和 product decisions。
- 澄清 `maintainer-authenticated-smoke-identity` 是已完成 authenticated reviewer smoke 的 identity path，不等同于外部 reviewer feedback。
- 澄清 `reviewer1@example.com` 和 `reviewer2@example.com` 当前为 placeholder only，必须替换为真实 reviewer emails 后才能作为外部 reviewer feedback 输入。
- 将状态记录为 `waiting_for_real_reviewer_identity`。
- 级联更新 second reviewer access execution、handoff dispatch readiness、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 identity reconciliation 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md` 缺失按预期失败。
- Green：新增 identity reconciliation 文档并补齐级联。

### 边界

- No Cloudflare Access policy change is authorized by this reconciliation。
- 不发送 reviewer invitation。
- 不创建 external issue。
- 不编造 reviewer feedback。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md`。
- 为 `reviewer1@example.com` 和 `reviewer2@example.com` 准备 reviewer handoff message template。
- 新增 feedback intake record template，用于真实反馈到达后的脱敏、记录和后续 triage。
- 将当前状态明确为 `waiting_for_reviewer_feedback`。
- 级联更新 reviewer handoff、feedback triage/backlog、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 dispatch readiness 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md` 缺失按预期失败。
- Green：新增 dispatch readiness 文档并补齐级联。

### 边界

- Do not send email from this goal。
- Do not create external issues from this goal。
- Do not invent reviewer feedback。
- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material may be recorded。
- 不新增 reviewer，不修改 Cloudflare Access policy，不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Second Reviewer Access Execution v0.1

### 完成内容

- 按用户明确授权，将 `reviewer1@example.com` 和 `reviewer2@example.com` 加入 Cloudflare Access policy `RepoAssure reviewer allow`。
- 先用 Cloudflare CLI / API context 复查可用性；Access API returned `Authentication error`，因此没有通过 token 调用修改 Access 配置。
- 切换到 Cloudflare Dashboard UI，在 `RepoAssure reviewer allow` policy 的 Include `Emails` rule 中新增两个授权 reviewer。
- 保存后重新打开 policy edit page，确认 `maintainer-authenticated-smoke-identity`、`reviewer1@example.com`、`reviewer2@example.com` 三个 email chip 均存在。
- 复跑 `pnpm verify:cloudflare-preview`，结果为预期 `manual_required`；自动门禁继续覆盖未登录 Cloudflare Access boundary，登录后 smoke 仍需人工 email/OTP。
- 新增 `docs/operations/private-preview-second-reviewer-access-execution-v0.1.md`，并级联更新 Cloudflare Access preflight handoff、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 second reviewer access execution 文档和级联记录存在；测试因 `docs/operations/private-preview-second-reviewer-access-execution-v0.1.md` 缺失按预期失败。
- Green：新增 execution 文档并补齐级联。

### 边界

- No OTP, cookie, Access token, login query-state, raw Access redirect URL or reviewer credential material was recorded in Git-tracked documentation。
- 不新增除 `reviewer1@example.com` 和 `reviewer2@example.com` 之外的 reviewer。
- 不把 deployment subdomain 或 branch alias 作为 accepted review surface。
- 不授权 public launch、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Reviewer Expansion Readiness v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-expansion-readiness-v0.1.md`。
- 定义第二批 reviewer 扩大私测前的 Readiness Checklist。
- Readiness Checklist 包含 Access Boundary Checklist、Feedback Operations Checklist、Content and UX Checklist 和 Maintainer Decision Checklist。
- 定义 Expansion Decision：`ready_to_expand`、`hold_for_fixes`、`pause_private_preview`。
- 明确 ready 后仍需要单独 execution goal，并且必须先获得 allowed reviewer email 授权，才能修改 Cloudflare Access policy。
- 级联更新 feedback triage/backlog、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 expansion readiness 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-expansion-readiness-v0.1.md` 缺失按预期失败。
- Green：新增 expansion readiness 文档并补齐文档级联。

### 边界

- 本轮不新增 reviewer。
- 不扩大 Cloudflare Access policy。
- 不发送 reviewer invitation。
- 不修改 Cloudflare Pages 或 Access 配置。
- 不授权 public launch、repo public、npm publication、GitHub release、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Feedback Triage & Website Polish Backlog v0.1

### 完成内容

- 新增 `docs/operations/private-preview-feedback-triage-backlog-v0.1.md`。
- 定义 reviewer feedback 的 P0/P1/P2/P3 severity rules。
- 定义 Backlog Item Template 和 Triage Workflow。
- 定义 Expand Private Preview、Pause Private Preview、Enter Public Launch Preparation 三个决策门槛。
- 定义 Website Polish Backlog Policy，覆盖 homepage clarity、security-grade visual polish、mobile density、Assurance Graph、Trust Ledger、localization、accessibility、claim-boundary wording 和 private preview form clarity。
- 明确 backlog item 不得存储 OTP、cookie、Access token、login query-state、raw Cloudflare Access redirect URL、reviewer credentials 或无关个人数据。
- 级联更新 reviewer handoff、public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 triage/backlog 文档和级联记录存在；测试因 `docs/operations/private-preview-feedback-triage-backlog-v0.1.md` 缺失按预期失败。
- Green：新增 triage/backlog 文档并补齐文档级联。

### 边界

- 本轮不发送外部 reviewer 邀请。
- 不扩大 Cloudflare Access policy。
- 不创建外部 issue 或反馈渠道。
- 不授权 public launch、repo public、npm publication、GitHub release、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Reviewer Handoff & Feedback Intake v0.1

### 完成内容

- 新增 `docs/operations/private-preview-reviewer-handoff-v0.1.md`，作为受邀 reviewer 私测交接包。
- 明确 accepted private preview URL 为 `https://repoassure-preview.pages.dev`，访问对象为 allowed reviewers only。
- 明确禁止分享 deployment subdomains or branch aliases。
- 提供 reviewer instructions、allowed review scope、out-of-scope claims、acceptance questions、Feedback Template、Feedback Intake Workflow 和 Rollback and Shutdown。
- 明确反馈中不得记录 OTP、cookie、Access token、login query-state 或无关个人数据。
- 级联更新 public website release candidate handoff、acceptance checklist 和 testing strategy。

### TDD 记录

- Red：先扩展 `tests/unit/project-structure.test.ts`，要求 reviewer handoff 文档和级联记录存在；测试因 `docs/operations/private-preview-reviewer-handoff-v0.1.md` 缺失按预期失败。
- Green：新增 reviewer handoff 文档并补齐文档级联。

### 边界

- 本轮不发送外部 reviewer 邀请。
- 不扩大 Cloudflare Access policy。
- 不创建 GitHub issue 或外部反馈渠道。
- 不授权 public launch、production marketing announcement、repo public、npm publication、GitHub release、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Cloudflare Access Private Preview Authenticated Reviewer Acceptance Closure v0.1

### 完成内容

- 使用已在 Cloudflare Access `RepoAssure reviewer allow` policy 中允许的 Chrome profile `Web3coderman` 访问 `https://repoassure-preview.pages.dev`。
- 完成登录后 desktop authenticated content smoke；页面标题为 RepoAssure，内容树包含 hero、language selector、private preview CTA、Assurance Graph、Trust Ledger、proof artifact tabs、trust boundary 和 private preview form。
- 将浏览器窗口调整为移动宽度，完成 mobile-width authenticated responsive smoke；汉堡菜单、language selector、hero、CTA、Assurance Graph、Trust Ledger 和后续内容仍可访问。
- 未扩大 Access policy，未添加额外 reviewer email。
- 未脚本化、导出、保存或提交 OTP、cookie、Access token 或 Cloudflare Access 登录 query-state。

### 已验证

- `pnpm verify:cloudflare-preview`：未登录访问 protected review URL 会重定向到 Cloudflare Access，并包含 `www-authenticate: Cloudflare-Access`。
- Desktop authenticated content smoke：通过。
- Mobile-width authenticated responsive smoke：通过。

### 边界

- `pnpm verify:cloudflare-preview` 仍只作为自动化未登录边界 verifier；authenticated content smoke 必须由 allowed reviewer 通过 email/OTP browser flow 完成。
- rollback/shutdown 仍是人工运维动作：关闭 private preview 时禁用/删除 Access application、移除 reviewer allow policy 或删除 Cloudflare Pages deployment/project。
- accepted private preview URL 仍仅为 `https://repoassure-preview.pages.dev`；不得分享 deployment subdomain 或 branch alias。
- 本闭环不授权 public launch、production marketing announcement、repo public、npm publication、GitHub release、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Cloudflare Pages + Access Private Preview Execution v0.1 Blocked

### 完成内容

- 用户明确授权创建 Cloudflare Pages private preview、上传 RepoAssure 官网构建产物，并使用 Cloudflare Access 保护 reviewer 访问。
- 确认 `wrangler whoami --json` 登录态可用，账号为 `Web3coderman`。
- 确认 `wrangler pages project list` 中此前没有 `repoassure-preview`。
- Successfully created the `repoassure-preview` Pages project，目标域名为 `repoassure-preview.pages.dev`。
- 按 ADR-0021 安全顺序，在上传 website build output 前尝试配置 Access。
- `accounts/.../access/apps` Access API returned `Authentication error`，判断当前 token 缺少 Zero Trust Access application / policy 管理权限或需要 dashboard 配置。
- `wrangler pages deployment list --project-name repoassure-preview` 返回空列表；No website source or build output was uploaded。
- 已将 blocker 写入 `docs/logs/blockers.md`，并级联更新 public website handoff、acceptance checklist 和 testing strategy。

### 边界

- 已创建空 Cloudflare Pages project，但没有 deployment。
- 没有执行 `wrangler pages deploy`。
- 没有上传 website source/build output。
- 没有 accepted preview URL。
- 继续前必须先配置并验证 Cloudflare Access policy。
- 不授权 public launch、production deployment、public custom domain、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Cloudflare Access Remote Preview Preflight v0.1

### 完成内容

- Red：扩展 `tests/unit/project-structure.test.ts`，要求 Cloudflare Access remote preview preflight root script、preflight script、operations handoff、public website handoff、acceptance checklist、testing strategy 和 dev log 完成级联；测试因 `scripts/preflight-cloudflare-preview.mjs` 缺失按预期失败。
- 新增 `pnpm preflight:cloudflare-preview`。
- 新增 `scripts/preflight-cloudflare-preview.mjs`，生成本地 `artifacts/public-website-preview/cloudflare-access-preflight/preflight-report.json` 和 `review-guide.md`。
- 预检检查 `REPOASSURE_CLOUDFLARE_ACCOUNT_ID`、`REPOASSURE_CLOUDFLARE_PAGES_PROJECT`、`REPOASSURE_CLOUDFLARE_ACCESS_POLICY` 和 `REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED` 是否具备，但不打印敏感值。
- 新增 `docs/operations/cloudflare-access-preview-preflight-v0.1.md`，并级联更新 public website handoff、acceptance checklist 和 testing strategy。

### 边界

- No website source or build output is uploaded by this preflight。
- 不调用 Cloudflare API，不创建 preview URL，不创建或修改 Cloudflare Pages project。
- Cloudflare Pages preview deployments are public by default；Cloudflare Access policy must be enabled before any preview URL is shared。
- 不恢复 Vercel Git integration。
- 不授权 public launch、production deployment、public custom domain、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Local Static Preview Package v0.1

### 完成内容

- Red：扩展 `tests/unit/project-structure.test.ts`，要求本地静态官网预览包脚本、root script、`.gitignore`、handoff、acceptance checklist、testing strategy 和 dev log 完成级联；测试因 `scripts/package-website-preview.mjs` 缺失按预期失败。
- 新增 `pnpm package:website-preview`。
- 新增 `scripts/package-website-preview.mjs`，从 `apps/website/dist` 复制本地 static preview package 到 `artifacts/public-website-preview/local-static-preview`。
- 输出 `dist/`、`manifest.json`、`forbidden-claims.json` 和 `review-guide.md`。
- `.gitignore` 新增 `artifacts/public-website-preview/`，避免提交本地构建预览产物。
- 新增 `docs/operations/local-static-preview-package-v0.1.md`，并级联更新 public website handoff、acceptance checklist 和 testing strategy。

### 边界

- No remote hosting provider is used。
- 不创建 preview URL。
- 不上传 website source/build output 到 Cloudflare、Vercel 或其他 provider。
- 不恢复 Vercel Git integration。
- 不授权 public launch、production deployment、public custom domain、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月27日 - Private Preview Hosting Fallback Decision v0.1

### 完成内容

- Red：扩展 `tests/unit/project-structure.test.ts`，要求 ADR-0021、ADR index、public website spec、release candidate handoff、README、architecture overview、acceptance checklist、testing strategy、decision log、dev log 和 blockers 记录 private preview hosting fallback decision；测试因 ADR-0021 缺失按预期失败。
- 新增 `ADR-0021: Private Preview Hosting Fallback Decision`。
- 决策：现有 Vercel project 在 target mismatch 修复前暂停用于官网 private preview；local static preview bundle 是临时 review surface；远程 fallback 优先选择 Cloudflare Pages preview deployments with Cloudflare Access 或等效访问受控静态托管。
- 记录 Cloudflare Pages preview deployments are public by default，必须先启用 Cloudflare Access 或等效 access policy 再分享任何 remote preview URL。
- 级联更新 ADR index、README、architecture overview、public website spec、release candidate handoff、acceptance checklist、testing strategy、decision log 和 blockers。

### 边界

- 本轮只做 fallback decision，不执行 Cloudflare deployment。
- 不创建 preview URL，不上传 website source/build output 到新 hosting provider。
- 不恢复 Vercel Git integration。
- 不授权 public launch、production deployment、public custom domain、repo public、npm publication、GitHub release、外部公告、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

## 2026年6月26日 - Public Website Private Preview Deployment Execution v0.1 Blocked

### 完成内容

- 审计 `main`：worktree clean，repo visibility 仍为 `PRIVATE`，最新 `RepoAssure CI` 为 success。
- 确认本地 `pnpm build:website` 通过。
- 检查 Vercel CLI：当前无可用登录态，`vercel whoami` 无法继续。
- 尝试 Vercel MCP deployment tool：被拒绝，原因是缺少对 Vercel 这一第三方目的地和 private repository website code/build output 上传风险的明确确认。
- 补充 `vercel.json` 部署前置配置，明确 private preview execution 的 build command、install command 和 website output directory。
- 已将 blocker 写入 `docs/logs/blockers.md`。
- 用户随后明确授权将 RepoAssure 官网代码和构建产物上传到 Vercel，用于 private preview deployment；Vercel data-export 授权已满足。
- 完成 `vercel login`，`vercel whoami` 返回 `web3coderman-dev`。
- 运行 `vercel link --yes --project repoassure`，链接到 `web3coderman-devs-projects/repoassure`；本地 `.vercel/` 已写入 `.gitignore`，不提交项目 ID。
- 首次真实部署因上传文件数超过限制失败；新增 `.vercelignore`，排除 `node_modules`、构建输出、本地 artifacts、`.git`、env 和 key 文件。
- 多次尝试 `vercel --yes`、`vercel --target preview`、`vercel deploy --target=preview` 和临时分支部署后，Vercel 仍返回 production target 或不可验证的 UNKNOWN preview。
- Git push to `main` triggered a Vercel production deployment through Vercel Git integration；该 deployment 和 main alias 已移除。
- 运行 `vercel git disconnect --yes`；CLI 返回 `Disconnected xiaoba-dev/repoassure`，后续 push 不应再自动创建 Vercel deployments。
- unintended production deployments and aliases were removed；清理后 `vercel ls repoassure` 返回 `No deployments found`。
- Resolve Vercel Preview Target Blocker v0.1：恢复执行后，确认 `main` clean、latest `RepoAssure CI` success、Vercel project framework/build/output/install settings 正确、Git integration disconnected、Vercel deployments empty。
- Red：扩展 `tests/unit/project-structure.test.ts`，要求 blocker、dev log 和 handoff 记录 Resolve Vercel Preview Target Blocker v0.1、Vercel preview deployment retry 和 Preview Deployment Retry Status；测试按预期失败。
- Retry：`vercel deploy --yes --force --logs` 在 `main` 上仍创建 production deployment；已移除 aliases 和 deployment `dpl_6qQkuqRBRtGtS3Y1zvJK8AwGyiLG`。
- Retry：`vercel deploy --yes --target preview --skip-domain --force --logs` 在 `main` 上仍创建 production deployment；已移除 aliases 和 deployment `dpl_5n9tj9sHgRQLvRLHvWEnNopDBDbc`。
- Retry：在临时非 main 分支 `codex/vercel-preview-target-retry` 上执行 `vercel deploy --yes --force --logs` 仍创建 production deployment；已移除 aliases 和 deployment `dpl_3DrDKRnDrjH8yUpBuXDZn718eAyM`。
- 清理后 `vercel ls repoassure` 返回 `No deployments found`。

### 边界

- 已执行真实 Vercel 上传尝试，但没有 accepted private preview deployment。
- 没有 active preview URL 可以交付。
- 没有保留 production deployment 或 public production alias。
- 后续继续前需要解决 Vercel project / CLI target mismatch 或选择等效 access-controlled static host；Vercel Git integration 已断开，不能在未重新评估 private preview 边界前恢复；通过后再完成 smoke/content/screenshot/forbidden-claim verification。

### 认证更新

- 用户授权执行 Vercel 登录。
- `vercel login` OAuth device flow 已完成。
- `vercel whoami` 返回 `web3coderman-dev`。
- 用户已补充对“将 RepoAssure 官网代码和构建产物上传到 Vercel”的明确 data-export 授权。

## 2026年6月26日 - Public Website Private Preview Deployment Planning v0.1

### 完成内容

- 新增 `ADR-0020: Public Website Private Preview Deployment Boundary`。
- 明确 private preview deployment、production deployment 和 public launch 是三个独立 gate。
- 级联更新 public website spec、release candidate handoff、README、architecture overview、acceptance checklist、testing strategy、decision log 和本 dev log。
- 用 TDD 扩展 `tests/unit/project-structure.test.ts`，先验证 ADR-0020 缺失导致 Red，再补齐文档进入 Green。

### 边界

- 本 goal 只做部署规划，不执行真实部署。
- 后续 deployment execution requires a separate Codex goal。
- 不公开 repo、不发布 npm package、不创建 GitHub release、不发布公开公告、不声明 SaaS/Team Cloud/Enterprise/hosted dashboard availability。

## 2026年6月26日 - Public Website PR #2 Merge Closure v0.1

### 完成内容

- 复查 PR #2：`OPEN`、非 Draft、`RepoAssure CI / Quality Gates` passed、merge state `CLEAN`、No GitHub PR comments、No GitHub PR reviews。
- 确认远端仓库 `xiaoba-dev/repoassure` visibility 仍为 `PRIVATE`。
- 使用 squash merge 将 PR #2 合并进 `main`。
- 记录 merge commit：`b2de16afb42e3afcaa586c8f6edda43c8b64c442`。
- 同步本地 `main`，确认主线已包含 `apps/website`、public website tests、design QA、ADR、spec 和 handoff 文档。
- 用 TDD 扩展 `tests/unit/project-structure.test.ts`，要求 handoff 和 dev log 记录 merge closure、PR `MERGED`、merge commit 和 main branch verification。

### 边界

- 本 goal 只授权 merge，不授权官网部署、不公开 repo、不发布 npm package、不创建 GitHub release、不发布公开公告。
- 后续 deployment 必须作为独立 goal 执行。

## 2026年6月26日 - Public Website PR #2 Review Closure v0.1

### 完成内容

- 审计 PR #2：状态为 `OPEN`，base 为 `main`，head 为 `codex/public-website-v0.1`，repo visibility 为 `PRIVATE`。
- 确认 `RepoAssure CI / Quality Gates` 已 passed，merge state 为 `CLEAN`。
- 确认 No GitHub PR comments，No GitHub PR reviews。
- 用 TDD 扩展 `tests/unit/project-structure.test.ts`，要求 handoff 和 dev log 记录 review closure、Ready for Review、无 comments/reviews 和不 merge 边界。
- 更新 `docs/operations/public-website-release-candidate-handoff-v0.1.md`，记录 `PR Review Closure Status`。
- 将 PR #2 转为 Ready for Review。

### 边界

- Do not merge without explicit merge authorization.
- 本 goal 不部署官网、不公开 repo、不发布 npm package、不创建 GitHub release、不发布公开公告。

## 2026年6月26日 - Public Website Private PR Review v0.1

### 完成内容

- 确认本地分支 `codex/public-website-v0.1` worktree clean，最新 commit 为 `0c8a661 feat: add public website release candidate`。
- 确认远端仓库 `xiaoba-dev/repoassure` visibility 为 `PRIVATE`。
- Push `codex/public-website-v0.1` 到 private GitHub remote。
- 创建 Draft PR：[#2 `[codex] Add public website release candidate`](https://github.com/xiaoba-dev/repoassure/pull/2)。
- PR body 引用 public website handoff、design QA、验证命令、截图证据和非授权边界。
- 轮询 PR checks，`RepoAssure CI / Quality Gates` 已 passed。
- 更新 `docs/operations/public-website-release-candidate-handoff-v0.1.md`，记录 PR URL、Draft 状态、CI 状态和仍未授权事项。
- 补充文档状态记录提交 `02a0297 docs: record public website draft PR review` 并推送到 PR 分支；最新 head commit 以 `gh pr view 2 --json headRefOid` 为准。

### TDD 记录

- Red：扩展 `tests/unit/project-structure.test.ts`，要求 public website handoff 记录 `Private Draft PR Status`、PR #2 URL、`RepoAssure CI / Quality Gates` 和 `passed`，并要求 dev log 记录本目标；测试因文档尚未记录 PR 状态按预期失败。
- Green：更新 handoff 和 dev log 后，targeted structure test 通过。

### 已验证

- `gh repo view --json nameWithOwner,visibility,url,defaultBranchRef`：确认仓库为 `PRIVATE`。
- `git push -u origin codex/public-website-v0.1`：通过。
- `gh pr create --draft --base main --head codex/public-website-v0.1 --title "[codex] Add public website release candidate"`：通过，创建 PR #2。
- `gh pr view 2 --json number,title,state,isDraft,url,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup,reviewDecision`：确认 PR #2 为 `OPEN` + Draft；最新 head commit 需以 PR metadata 为准。
- `gh pr checks 2 --watch --interval 10`：`RepoAssure CI / Quality Gates` passed。

### 边界

- 当前不 merge PR、不部署官网、不公开 repo、不发布 npm package、不创建 GitHub release、不发布公开公告。
- 当前不声明 SaaS、Team Cloud、Enterprise、hosted dashboard 或 product artifact localization 已可用。
- PR #2 仅用于 private maintainer review。

## 2026年6月25日 - Public Website Release Candidate Closure v0.1

### 完成内容

- 为 public website 单独新增 release candidate closure 交接文档：`docs/operations/public-website-release-candidate-handoff-v0.1.md`。
- 交接文档汇总 website change scope、review package、screenshot evidence、final verification gates、remaining P3 backlog 和 non-authorization boundary。
- 级联更新 README 和 acceptance checklist，使官网 RC 审查入口可从项目入口和验收入口发现。
- 明确该 closure 不授权部署官网、公开仓库、npm publish、GitHub release、SaaS、Team Cloud、Enterprise、hosted dashboard 或 product artifact localization。

### TDD 记录

- Red：先在 `tests/unit/project-structure.test.ts` 新增 `records public website release candidate closure without publishing or deploying`，要求 handoff 文档和 README / acceptance checklist / dev log 级联；测试因 `docs/operations/public-website-release-candidate-handoff-v0.1.md` 缺失按预期失败。
- Green：新增 public website RC handoff，并完成 README、acceptance checklist 和 dev log 级联后，targeted structure test 通过。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "public website release candidate closure"`：通过。
- `pnpm vitest run tests/unit/public-website.test.ts tests/unit/project-structure.test.ts`：通过，2 个 test files / 67 个 tests。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，生成 desktop、zh-CN desktop、mobile、mobile menu、comparison、`desktop-focus-dark.png` 和 `desktop-focus-light.png`。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，36 个 test files / 541 个 tests。
- `pnpm build`：通过。
- `pnpm repo:hygiene`：通过。
- `pnpm goal:audit`：通过，35/35。
- `git diff --check`：通过。

### 边界

- 当前不 push、不创建 PR、不部署官网、不公开 repo、不发布 npm package、不创建 GitHub release。
- 当前只整理 public website 本地审查包；public release 仍需法律、商标、branch protection / repository ruleset 和最终 maintainer publication authorization。

## 2026年6月25日 - Maintainer Decision Execution v0.1

### 完成内容

- 按用户授权执行 maintainer decision：将 PR #1 从 Draft 标记为 Ready for review。
- 执行前确认 PR #1 为 `OPEN` + `Draft`，仓库 visibility 为 `PRIVATE`，`RepoAssure CI / Quality Gates` 已通过，merge state 为 `CLEAN`。
- 执行 `gh pr ready 1 --repo xiaoba-dev/repoassure`。
- 更新 release candidate handoff，将 Maintainer Decision checklist 中 “Mark PR Ready for review” 标记为完成。
- 新增 completed goal：`docs/goals/completed/2026-06-25-maintainer-decision-execution-v0.1.md`。

### 验证

- `gh pr view 1 --repo xiaoba-dev/repoassure --json ...`：执行前确认 Draft/Open、CI success、merge state clean。
- `gh repo view xiaoba-dev/repoassure --json visibility`：确认 `PRIVATE`。

### 阻塞

- 无新增自动化阻塞。PR #1 已进入 Ready for review；merge 和 public release 仍未授权。

## 2026年6月25日 - Maintainer Merge Decision v0.1

### 完成内容

- 读取 PR #1 当前 metadata、comments、reviews、review threads、CI 和 repository visibility。
- 确认 PR #1 为 `OPEN` + `Draft`，base 为 `main`，head 为 `codex/release-candidate-packaging-v0.1`。
- 确认 latest head commit 为 `5aa151a`，merge state 为 `CLEAN`，`RepoAssure CI / Quality Gates` 已通过。
- 确认仓库 visibility 仍为 `PRIVATE`，没有 unresolved review threads，也没有 reviewer-requested changes。
- 在 `docs/operations/release-candidate-handoff-v0.1.md` 新增 Maintainer Merge Decision checklist。
- 新增 completed goal：`docs/goals/completed/2026-06-25-maintainer-merge-decision-v0.1.md`。

### 验证

- `gh pr view 1 --repo xiaoba-dev/repoassure --json ...`：确认 PR 状态、CI、merge state 和 head commit。
- `gh api graphql ... reviewThreads`：确认无 review threads。
- `gh repo view xiaoba-dev/repoassure --json visibility`：确认 `PRIVATE`。

### 阻塞

- 无新增自动化阻塞。当前状态是等待 maintainer decision：保持 Draft、标记 Ready、请求人工 review、merge 或 close。公开发布仍未授权。

## 2026年6月25日 - Draft PR Review Closure v0.1

### 完成内容

- 读取 PR #1 当前 metadata、diff、comments、reviews、review threads、CI 和 repository visibility。
- 确认 PR #1 为 `OPEN` + `Draft`，仓库 visibility 仍为 `PRIVATE`，merge state 为 `CLEAN`。
- 确认没有 reviewer comments、没有 unresolved review threads，`RepoAssure CI / Quality Gates` 已通过。
- 识别一个可自动处理的 review-readiness 问题：GitHub Actions 对 `actions/checkout@v4`、`actions/setup-node@v4` 和 `pnpm/action-setup@v4` 发出 Node.js 20 runtime deprecation annotation。
- Red：更新 structure test，要求 CI 使用当前 action release major 并拒绝 v4 action runtime surface；测试因 workflow 仍使用 v4 失败。
- Green：升级 `.github/workflows/ci.yml` 到 `actions/checkout@v7`、`pnpm/action-setup@v6`、`actions/setup-node@v6`。
- 新增 completed goal：`docs/goals/completed/2026-06-25-draft-pr-review-closure-v0.1.md`，并在 release candidate handoff 中记录 review closure 结论。

### 验证

- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "private GitHub engineering baseline"`：Red 阶段失败，Green 阶段通过。
- `pnpm test:unit`：通过，35 个测试文件、534 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm release:check`：自动 prerequisites 通过，并按边界报告 `public release ready: no`。
- `pnpm repo:hygiene`：通过。
- `pnpm goal:audit`：通过，35 项检查、35 项已通过、0 missing、0 需要人工确认。
- `pnpm user:handoff`：通过，自动证据通过 35、自动证据缺失 0、需要人工确认 0。
- `git diff --check`：通过。

### 阻塞

- 无新增产品阻塞。PR #1 可进入 maintainer review；公开发布仍未授权，仍需法律 review、商标/name review、branch protection 或等效 repository ruleset、最终 maintainer publication authorization。

## 2026年6月25日 - Release Candidate Packaging v0.1

### 完成内容

- Red：新增 `project-structure` 测试，要求 release candidate handoff 明确 review branch、commit packaging plan、final verification gates、manual gates 和 no-publication boundary；测试因 `docs/operations/release-candidate-handoff-v0.1.md` 缺失失败。
- Green：新增 `docs/operations/release-candidate-handoff-v0.1.md`，将 v0.3 distribution/repair loop、public-release readiness 和 release candidate handoff 拆成可审查提交计划，并记录 `public release ready: no` 是当前正确发布边界。
- 级联更新 README 和 public release checklist，确保 review 入口指向 release candidate handoff，且不把本地打包误解为 push、PR、GitHub release、npm publish 或仓库公开授权。
- 本地创建 review commit `72f3228 feat: package release candidate readiness`，并在 release candidate handoff 中记录 commit package；未执行 push、PR、GitHub release、npm publish 或仓库公开。

### 验证

- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "release candidate handoff"`：Red 阶段因 handoff 文档缺失失败；修正后 Green 阶段通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，60 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm release:check`：自动 prerequisites 通过，并按边界报告 `public release ready: no`。
- `pnpm test:unit`：通过，35 个测试文件、534 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm acceptance -- --full --browser`：提权环境通过，full 模式 17/17 项检查通过，包含 integration、benchmark 5/5 Go 和 Real Chromium trace E2E。
- `pnpm goal:audit`：通过，35 项检查、35 项已通过、0 missing、0 需要人工确认。
- `pnpm user:handoff`：通过，自动证据通过 35、自动证据缺失 0、需要人工确认 0。
- `git diff --check`：通过。

### 阻塞

- 无新增产品阻塞。公开发布仍受法律 review、商标/name review、branch protection 或等效 repository ruleset、最终 maintainer publication authorization 阻塞。

## 2026年6月25日 - Private GitHub PR Readiness v0.1

### 完成内容

- 确认当前分支为 `codex/release-candidate-packaging-v0.1`，工作树干净。
- 确认 remote 为 `https://github.com/xiaoba-dev/repoassure.git`。
- 确认 GitHub 仓库 `xiaoba-dev/repoassure` visibility 为 `PRIVATE`，default branch 为 `main`。
- Push release candidate 分支到 private remote。
- 创建 Draft PR：`https://github.com/xiaoba-dev/repoassure/pull/1`。
- 在 release candidate handoff 中记录 PR URL、private visibility、base/head、Draft 状态和 CI 初始状态。

### 验证

- `gh auth status`：已登录 `xiaoba-dev`，具备 `repo` 和 `workflow` scope。
- `gh repo view xiaoba-dev/repoassure --json nameWithOwner,visibility,defaultBranchRef,url`：visibility 为 `PRIVATE`，default branch 为 `main`。
- `git push -u origin codex/release-candidate-packaging-v0.1`：通过。
- `gh pr create --draft`：创建 PR #1。
- `gh pr view 1 --json ...`：PR 为 `OPEN` + `Draft`，`RepoAssure CI / Quality Gates` 初始状态为 `IN_PROGRESS`。

### 阻塞

- 无新增产品阻塞。公开发布仍未授权；PR 是 private review surface，不代表 public release。

## 2026年6月25日 - Public Release Readiness v0.1

### 完成内容

- Red：新增 `public-release-readiness.test.ts` 用例，要求 `pnpm release:check` 检查 Apache-2.0 `LICENSE`、贡献政策、安全披露、dependency license audit、release notes draft 和 manual publication authorization gate；旧 checker 在材料齐全时会误判 `releaseReady: true`。
- Green：扩展 `scripts/check-public-release-readiness.mjs`，新增 `repository-license`、`contribution-policy`、`security-policy`、`dependency-license-audit`、`public-release-notes-draft` 和 `manual-publication-authorization` 检查；自动项通过但缺人工授权时继续报告 `public release ready: no`。
- Red：更新 `project-structure` 测试，要求 public release readiness boundary 由 ADR-0015 固化，并级联到 README、PR 模板、private readiness、operations guide、release checklist、CONTRIBUTING、SECURITY 和 LICENSE。
- Green：新增 `ADR-0015: Public Release Readiness Boundary`、Apache-2.0 `LICENSE`、`CONTRIBUTING.md`、`SECURITY.md`、dependency license audit 和 public release notes draft；同步 README、PR 模板、private readiness、operations guide、public release checklist、architecture overview 和 decision log。
- Red：新增 `goal-audit-public-release-readiness` 测试，要求 public release readiness materials 进入 `pnpm goal:audit`；测试因模块和 source keys 缺失失败。
- Green：新增 `packages/acceptance/src/goal-audit-public-release-readiness.ts`，接入 goal audit source collection、current item composer、package export contract 和 type-smoke。
- 新增 completed goal 文档 `docs/goals/completed/2026-06-25-public-release-readiness-v0.1.md`，记录自动可执行范围完成，公开发布仍需人工授权。

### 验证

- `pnpm vitest run tests/unit/public-release-readiness.test.ts`：通过，4 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "branch protection and public release boundary"`：通过。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "public release readiness|current goal audit item composer|current goal audit items"`：通过，3 个测试。
- `pnpm build`：通过。
- `pnpm vitest run tests/unit/public-release-readiness.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts`：通过，4 个测试文件、201 个测试。
- `pnpm test:unit`：通过，35 个测试文件、533 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm release:check`：自动 public-release prerequisites 通过，`manual-publication-authorization` 为 not_ready，整体仍报告 `public release ready: no`。
- `pnpm repo:hygiene`：通过。
- `pnpm acceptance -- --full --browser`：提权环境通过，full 模式 17/17 项检查通过；包含 unit、E2E smoke、typecheck、lint、build、package subpath smoke、integration、benchmark 和 Real Chromium trace E2E。
- `pnpm goal:audit`：通过，35 项检查、35 项已通过、0 missing、0 需要人工确认。
- `pnpm user:handoff`：通过，自动证据通过 35、自动证据缺失 0、需要人工确认 0。

### 阻塞

- 公开发布仍需人工/外部 gate：法律 review、商标/name review、branch protection 或等效 repository ruleset、最终 maintainer publication authorization。已记录到 `docs/logs/blockers.md`。

## 2026年6月25日 - v0.3 Distribution and Repair Loop Implementation

### 完成内容

- Red：新增 `project-structure` 测试，要求本地优先 GitHub Action wrapper、safe example workflow、README/user guide 入口存在；测试因 `.github/actions/repoassure/action.yml` 缺失失败。
- Green：新增 `.github/actions/repoassure/action.yml` 和 `examples/github-actions/repoassure-local-first.yml`，Action 复用本地 CLI，不依赖 hosted service，默认不上传目标 repo source、logs、screenshots、traces、env values 或 private artifacts。
- Red：为 `repair-handoff-package.json`、`repair-execution-report.json` 和 `patch-plan.json` 增加 `agentContract` 单元测试；测试因字段缺失失败。
- Green：补齐 `repoassure.repair-handoff.v1`、`repoassure.repair-execution-report.v1` 和 `repoassure.patch-plan.v1` contract，包含 read order、next commands、result semantics 和 no-auto-edit boundaries。
- Red：新增 `public-release-readiness.test.ts` 和 structure 断言，要求 `pnpm release:check` 存在；测试因脚本缺失失败。
- Green：新增 `scripts/check-public-release-readiness.mjs` 和 `release:check` script。该检查通过 private pre-release boundary 时退出 0，但报告 `public release ready: no`；tracked generated artifacts、env files、private keys 或 logs 会失败。
- Red：新增 goal audit v0.3 测试，要求 Action wrapper、agent contract 和 release check 进入自动审计；测试因 `goal-audit-v03-distribution` 缺失失败。
- Green：新增 `packages/acceptance/src/goal-audit-v03-distribution.ts`，纳入 goal audit source plan、package export contract 和 type-smoke。
- 更新 README、user acceptance guide、MVP spec v0.3、testing strategy、public release checklist、examples README 和 acceptance checklist。

### 验证

- `pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/repair-execute.test.ts tests/unit/repair-patch-plan.test.ts tests/unit/public-release-readiness.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts`：通过，6 个测试文件、176 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm release:check`：通过 private pre-release boundary，并报告 `public release ready: no`。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，35 个测试文件、531 个测试。
- `pnpm test:integration`：提权环境通过，11 个测试文件、27 个测试。
- `pnpm test:e2e`：通过 1 个测试文件、1 个测试；跳过 1 个环境条件测试。
- `pnpm acceptance -- --full --browser`：提权环境通过，full 模式 17/17 项检查通过；Unit、E2E smoke、typecheck、lint、build、package subpath smoke、integration、benchmark 和 Real Chromium trace E2E 全部通过。
- `pnpm goal:audit`：通过，34 项检查、34 项已通过、0 missing、0 需要人工确认。

### 阻塞

- 无新增产品阻塞。Public release 仍未授权；`pnpm release:check` 当前只证明 private pre-release boundary 安全，不代表可以公开发布。

## 2026年6月25日 - Monorepo Readiness Audit

### 完成内容

- 扫描当前 monorepo 结构，确认 repo 已具备 `apps/*`、`packages/*`、package-first build、package-owned acceptance/shared/security/browser/repair 模块、CI、repo hygiene 和 goal audit。
- 判定当时 repo 是可运行的分阶段 monorepo，不是成熟完成态 monorepo：`packages/core` 仍为空壳，`apps/cli` 与 `apps/mcp-server` 仍为 compatibility shells，`examples/` 当时未承载真实示例，GitHub Action wrapper 当时尚未实现。
- 新增 `docs/architecture/specs/monorepo-readiness-audit-v0.1.md`，将 v0.3 前置结构判断、P0/P1/P2 缺口和非目标落档。
- 新增并归档 completed goal：`docs/goals/completed/2026-06-25-monorepo-readiness-audit.md`，记录 TDD、测试金字塔和完成证据。
- 更新 v0.3 goal，将 `monorepo readiness audit` 设为启动 v0.3 前置条件。
- 级联更新 monorepo structure spec、testing strategy 和 decision log。
- 新增 structure test，防止后续跳过 monorepo readiness 直接执行 v0.3 distribution work。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "monorepo readiness"` 因 `docs/architecture/specs/monorepo-readiness-audit-v0.1.md` 缺失按预期失败。
- Green：补齐 audit 文档、active goal 和级联文档后复跑同一 focused test 通过，1 个测试通过、57 个跳过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，58 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm goal:audit`：通过，33 项检查、33 项已通过、0 missing、0 需要人工确认。
- `git diff --check`：通过。
- 本 goal 已从 active 归档到 completed；v0.3 distribution and repair loop readiness 已在后续 goal 中完成并归档。

### 阻塞

- 无新增产品阻塞。

## 2026年6月25日 - v0.3 Documentation Cascade

### 完成内容

- 扫描当前 `docs/` taxonomy、ADR、MVP spec、strategy、acceptance、testing、goal 和 blocker 文档。
- 判断下一个 goal “RepoAssure v0.3 Distribution and Repair Loop Readiness”会改变产品阶段、分发入口和 repair loop 边界，因此需要级联写入，而不是只作为临时执行目标。
- 新增 `ADR-0014: Distribution and Repair Loop Readiness`，明确 v0.3 聚焦 GitHub Action wrapper、CLI/MCP 分发示例、AI IDE repair loop、public-release readiness，同时保持 local-first、不默认自动改代码、不上传目标 repo、不实现 hosted dashboard。
- 新增 `docs/product/specs/mvp-spec-v0.3.md`，定义 v0.3 TL;DR、目标用户、核心工作流、P0/P1、非目标和验收标准。
- 新增并归档 completed goal：`docs/goals/completed/2026-06-25-v0.3-distribution-repair-loop-readiness.md`。
- 修正 `docs/product/specs/mvp-spec-v0.2.md` 状态为“已实现；真实项目用户验收已通过”。
- 级联更新 ADR index、architecture overview、README、commercialization strategy、open-core packaging spec、public release checklist、testing strategy、user acceptance guide、acceptance checklist 和 blockers。
- 更新 docs taxonomy，将 `docs/goals/active/` 纳入规范目录和命名规则。

### 验证

- 本轮是文档治理变更，未修改运行时代码。
- 后续运行 `pnpm repo:hygiene`、focused project-structure tests、`pnpm lint`、`pnpm typecheck` 和 `pnpm goal:audit` 验证文档路径、引用和质量门禁。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - MVP v0.2 Remaining Auto-Executable Closure

### 完成内容

- 扫描 MVP v0.2 spec、goal audit、user acceptance handoff、user acceptance record、blockers、goal 文档和 TODO/follow-up 标记。
- 分类结论：当前没有未实现的本地自动可执行 MVP v0.2 Must Have 产品能力；自动可执行缺口是验收/goal 状态治理一致性。
- 将 `docs/goals/codex-goal.md` 状态从“已完成，真实项目用户验收已通过”修正为“自动证据已准备好请求用户验收，等待用户最终验收结论”，与当前 `docs/acceptance/user-acceptance-record.md` 和 `pnpm goal:audit` 的人工验收边界保持一致。
- 刷新 `docs/acceptance/acceptance-run.md`、`docs/acceptance/goal-completion-audit.md`、`docs/acceptance/user-acceptance-handoff.md` 和 `docs/logs/spike-results.md`。
- 新增结构测试，防止后续在用户验收记录未 accepted 时把长期 goal 文档标成完成，并约束 handoff 自动证据数不能落后于当前 goal audit。

### 剩余任务分类

| 类型 | 任务 | 状态 |
| --- | --- | --- |
| Must / 自动可执行 | 验收状态文档一致性、handoff 刷新、acceptance-run freshness、goal audit freshness | 已完成 |
| Must / 人工或外部条件 | 用户对真实项目验收给出 `accepted` 或 `changes_requested` 结论 | 未完成；不能由自动脚本替代 |
| Must / 外部权限 | GitHub private repo branch protection / rulesets | 被 GitHub plan 权限阻塞，已记录在 `docs/logs/blockers.md` |
| Should / 后续产品增强 | 更多 Security Assurance provider 格式、SARIF 兼容、provider coverage audit | v0.2 之后 |
| Could / 后续商业化 | public release、客户访谈、商业推广、团队模式 | v0.2 之后 |

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "MVP closure documents"` 因 handoff 仍显示 30 项自动证据通过而失败。
- Green：刷新 handoff 并修正 goal 状态后，同一 focused test 通过。
- `pnpm acceptance -- --full --browser`：首次运行因新测试对 acceptance 中间态过度严格而失败；将断言修正为 handoff 自动证据数不得低于当前 goal audit 自动通过数后复跑通过，17/17 检查通过。
- `pnpm goal:audit`：通过，33 项检查、32 项已通过、0 missing、1 项需要人工确认。
- `pnpm user:handoff`：通过，自动证据通过 32、自动证据缺失 0、需要人工确认 1。
- `pnpm repo:hygiene`：通过。
- `pnpm build`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，34 个测试文件、525 个测试。
- 最终复跑 `pnpm goal:audit`：通过，33 项检查、32 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。剩余 `用户确认 MVP 符合预期` 是既有人工验收边界；GitHub branch protection 仍受 private repo plan 权限限制。

## 2026年6月23日 - Security Assurance Lane Phase 1 Local Import

### 完成内容

- 新增 `@hardening-mcp/security-assurance` / `packages/security-assurance`，实现 local-first provider security evidence import。
- 新增 Codex Security fixture-style scan directory：`fixtures/security/codex-security-basic/scan.json`。
- 新增 `hardening security import --provider codex-security --scan-dir <dir> --repo <repo> --run-dir <dir>`，通过 `src/tools/security-import-tool.ts` 调用 package importer。
- security import 生成 run-scoped `security/security-summary.json`、`security/security-findings.json`、provider `import-manifest.json` 和 `normalized-findings.json`。
- repair-planner 读取 `security/security-findings.json`，将 security findings 转成 repair plan / repair task package tasks，保留 provider provenance、file target areas、verification commands 和 redacted security evidence。
- 级联更新 README、monorepo spec、architecture overview、MVP spec、Security Assurance Lane spec、open-core packaging spec 和 decision log。
- 本轮不调用 Codex Security plugin/runtime、不运行 scanner、不联网、不上传目标 repo、不创建 issue/PR/advisory、不修改目标 repo，不把 security import 变成 MVP 必需验收门槛。

### 验证

- Red：`pnpm vitest run tests/unit/security-assurance.test.ts` 因 `packages/security-assurance/src/import-security-evidence.js` 缺失按预期失败。
- Green：`pnpm vitest run tests/unit/security-assurance.test.ts` 通过，2 个测试。
- Red：`pnpm vitest run tests/unit/cli-options.test.ts --testNamePattern "security|imports local security"` 因 `security` CLI command 缺失按预期失败。
- Green：同一 CLI focused test 通过，3 个相关测试。
- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "Security Assurance Lane Phase 1"` 因 monorepo / docs 级联尚未完成按预期失败。
- Green：`pnpm vitest run tests/unit/security-assurance.test.ts tests/unit/cli-options.test.ts tests/unit/repair-plan.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts` 通过，5 个测试文件、200 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm build`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：首次完整运行因 acceptance package 旧数量契约仍为 3/9/31 而失败；同步为 Security Assurance Lane 后的 4/10/33 后复跑通过，34 个测试文件、524 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm test:e2e`：通过 1 个测试文件、1 个测试；跳过 1 个环境条件测试。
- `pnpm goal:audit`：通过，33 项检查、32 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - Governance Cleanup and Security Assurance Lane Spec

### 完成内容

- 新增 `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`，定义 provider interface、Codex Security preferred provider、provider provenance、local-first evidence handling、redaction requirements、artifact layout、repair plan / repair task package integration 和 non-goals。
- 将已完成的 `acceptance-package-migration` 与 `python-cli-acceptance-mode` goal 从 `docs/goals/active/` 归档到 `docs/goals/completed/`，并补充完成证据。
- 更新 `docs/product/strategy/open-core-packaging-spec-v0.1.md`，将 `packages/browser-explorer` 与 `packages/repair-planner` 标记为已实现 open-core packages，并新增 Security Assurance Lane packaging boundary TBD。
- 级联更新 README、架构概览和 decision log；本轮不实现 Codex Security provider runtime import、不抽取 `packages/core`、不修改目标 repo。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "post-ADR-0013"` 因 `docs/architecture/specs/security-assurance-lane-spec-v0.1.md` 缺失按预期失败。
- Green：同一 focused test 通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、55 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，33 个测试文件、518 个测试。
- `pnpm goal:audit`：通过，31 项检查、30 项已通过、0 missing、1 项需要人工确认。
- `pnpm user:handoff`：通过，刷新 `docs/acceptance/user-acceptance-handoff.md` 和 `docs/acceptance/goal-completion-audit.md`，当前结论仍为自动证据已齐、等待用户验收结论。
- 本轮只修改文档、goal 状态和结构约束测试，未改运行时 acceptance/explore/repair 行为；未重复运行 integration/E2E。
- GitHub CI 首次运行失败暴露远端 checkout 中空目录 `docs/goals/active/` 不会被 Git 保留；新增 `docs/goals/active/.gitkeep` 固化 active goal 目录存在性。
- 修复后复跑 `pnpm vitest run tests/unit/project-structure.test.ts` 通过，1 个测试文件、55 个测试；复跑 `pnpm goal:audit` 通过，31 项检查、30 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - Codex Security Strategy ADR

### 完成内容

- 新增 `ADR-0013: Codex Security and Security Assurance Lane`，明确 RepoAssure 不与 Codex Security 正面竞争为通用安全扫描器。
- 将 Security Assurance Lane 定义为 future provider-backed evidence lane；Codex Security 是优先 provider，但不是唯一依赖。
- 级联更新 ADR 索引、架构概览、MVP v0.2、竞品调研、商业化策略、README 和 decision log。
- 明确当前 v0.2 仍聚焦 acceptance、repair plan、repair handoff、repair execution 和 patch plan，不启动自研 deep vulnerability scanner。

### 验证

- 文档-only 决策变更；未修改运行时代码。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、54 个测试。
- `pnpm repo:hygiene`：通过。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - Browser Explorer Package Phase 2e Extraction

### 完成内容

- 新增 `@hardening-mcp/browser-explorer` / `packages/browser-explorer`，由 package-owned `src` 承载 `explore-app` 和 `playwright-driver` 实现。
- 将 `src/domain/explore/*` 收缩为 `packages/browser-explorer/dist/*` compatibility wrappers，保留 legacy source 路径和 `dist/domain/explore/*` 输出面。
- 将根构建脚本拆分为 `build:shared`、`build:browser-explorer`、`build:repair-planner`、`build:acceptance` 和 `build:src`，保证 package-first build order。
- 新增 browser-explorer package compatibility contract、typed package exports、type-smoke、project structure 测试、legacy/package route exploration parity 测试和 Playwright driver parity 测试，约束 source、exports、dist outputs、wrapper drift 和 artifact 行为稳定。
- 级联更新 README、monorepo spec、ADR-0006、架构概览、decision log 和 goal audit，使 Phase 2e browser-explorer package 状态进入自动验收摘要。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/explore-app.test.ts tests/unit/playwright-driver.test.ts` 因 `packages/browser-explorer/src/index.js`、`packages/browser-explorer/src/explore-app.js` 和 `packages/browser-explorer/src/playwright-driver.js` 尚不存在按预期失败。
- Green：同一最小集合通过，3 个测试文件、81 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：初次完整运行仅因本条 dev log 尚未写入完整门禁统计失败；写入后复跑通过，33 个测试文件、516 个测试。
- `pnpm test:integration`：普通沙箱下因本地 dev server 无法进入 running 状态失败；提升权限后通过，11 个测试文件、27 个测试。
- `pnpm test:e2e`：通过 1 个、跳过 1 个环境条件测试。
- `pnpm goal:audit`：通过，31 项检查、30 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - Repair Planner Package Phase 2d Extraction

### 完成内容

- 新增 `@hardening-mcp/repair-planner` / `packages/repair-planner`，由 package-owned `src` 承载 `generate-repair-plan` 和 `repair-plan` 实现。
- 将 `src/domain/repair-plan/*` 与 `src/types/repair-plan.ts` 收缩为 `packages/repair-planner/dist/*` compatibility wrappers，保留 legacy source 路径和 `dist/domain/repair-plan/*`、`dist/types/repair-plan.*` 输出面。
- 将根构建脚本拆分为 `build:shared`、`build:repair-planner`、`build:acceptance` 和 `build:src`，保证 package-first build order。
- 新增 repair-planner package compatibility contract、typed package exports、type-smoke、project structure 测试和 legacy/package 行为 parity 测试，约束 source、exports、dist outputs、wrapper drift 和 artifact 行为稳定。
- 级联更新 README、monorepo spec、ADR-0006、架构概览、decision log 和 goal audit，使 Phase 2d repair-planner package 状态进入自动验收摘要。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/repair-plan.test.ts` 因 `packages/repair-planner/src/index.js` 与 `packages/repair-planner/src/generate-repair-plan.js` 尚不存在按预期失败。
- Green：同一最小集合通过，2 个测试文件、52 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，33 个测试文件、510 个测试。
- `pnpm test:integration`：普通沙箱下因本地 dev server 无法进入 running 状态失败；提升权限后通过，11 个测试文件、27 个测试。
- `pnpm test:e2e`：通过 1 个、跳过 1 个环境条件测试。
- `pnpm goal:audit`：通过，30 项检查、29 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。

## 2026年6月23日 - Shared Package Phase 2c Extraction

### 完成内容

- 新增 `@hardening-mcp/shared` / `packages/shared`，由 package-owned `src` 承载 `privacy-redaction`、`shell-quote` 和 `shell-words` 实现。
- 将 `src/shared/*` 收缩为 `packages/shared/dist/*` compatibility wrappers，保留 legacy source 路径和 `dist/shared/*` 输出面。
- 将根构建脚本拆分为 `build:shared`、`build:acceptance` 和 `build:src`，保证 package-first build order。
- 新增 shared package compatibility contract、typed package exports、type-smoke 和 project structure 测试，约束 source、exports、dist outputs 和 wrapper drift。
- 级联更新 README、monorepo spec、ADR-0006、架构概览、decision log 和 goal audit，使 Phase 2c shared package 状态进入自动验收摘要。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/privacy-redaction.test.ts tests/unit/shell-quote.test.ts tests/unit/shell-words.test.ts` 因 `packages/shared` 尚不存在按预期失败。
- Green：同一最小集合通过，4 个测试文件、69 个测试。
- `pnpm repo:hygiene`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，33 个测试文件、505 个测试。
- `pnpm test:integration`：普通沙箱下因本地端口监听权限失败；提升权限后通过，11 个测试文件、27 个测试。
- `pnpm test:e2e`：通过 1 个、跳过 1 个环境条件测试。
- `pnpm goal:audit`：通过，29 项检查、28 项已通过、0 missing、1 项需要人工确认。

### 阻塞

- 无新增产品阻塞。integration 普通沙箱下的 `listen` 权限失败是既有环境限制，提升权限后通过。

## 2026年6月21日 - Acceptance Package Phase 2de Auto Patch Plan Prototype

### 完成内容

- 新增 `pnpm repair:patch-plan -- --report <repair-execution-report.json>`，从 repair execution report 生成 `patch-plan.json` 和 `patch-plan.md`。
- 新增 `packages/acceptance/src/run-repair-patch-plan.ts`，将失败 verification evidence 分类为可审查 patch actions，包含 actionType、targetFiles、errorCode、recommendedChange、suggestedCommands、autoFixCandidate、risk 和 reviewNotes。
- 首批规则覆盖 `ruff I001` import-sort 自动修复候选，以及 mypy `[index]`、`[return-value]`、`[attr-defined]` 等类型修复候选；未匹配规则会降级为 manual investigation。
- 将 `run-repair-patch-plan` 纳入 `@hardening-mcp/acceptance` package exports、compatibility contract、type-smoke 和 root script，保证 package 子路径与 dist 输出持续可验证。
- 级联更新 README、用户验收指南和 MVP spec v0.2，明确 patch plan 只生成可审查计划，不写目标 repo 源码、不运行 formatter、不创建 PR。

### 验证

- Red：`pnpm vitest run tests/unit/repair-patch-plan.test.ts` 因 `run-repair-patch-plan` 模块尚不存在按预期失败。
- Green：`pnpm vitest run tests/unit/repair-patch-plan.test.ts` 通过，1 个测试文件、3 个测试。
- Green：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、66 个测试。
- `pnpm repair:execute -- --package /private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z/repair-handoff-package.json --all --validation-only`：通过，生成包含 `ruff check .` 和 `mypy .` 两个失败 task 的 `repair-execution-report.json`。
- `pnpm repair:patch-plan -- --report /private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z/repair-execution-report.json`：通过，生成 `patch-plan.json` / `.md`，共 `18` 个 patch actions，其中 `4` 个 ruff import-sort auto-fix candidates，`14` 个 mypy 类型修复 actions 需要人工审查。

### 阻塞

- 无新增阻塞。Panniantong/Agent-Reach 的 ruff/mypy 失败继续作为目标 repo 待修复任务；本轮只生成可审查 patch plan，不自动修改目标 repo。

## 2026年6月21日 - Acceptance Package Phase 2dd Auto Repair Execution Prototype

### 完成内容

- 新增 `pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run|--validation-only`，将 repair handoff package 进入可控执行阶段。
- 新增 `packages/acceptance/src/run-repair-execute.ts`，支持显式 task selection、`--all`、`--dry-run`、`--validation-only`、`--timeout-ms` 和 `--max-output-chars`。
- `--dry-run` 只生成 `repair-execution-report.json` 和 `repair-execution-report.md`，不执行验证命令；`--validation-only` 只复跑 task 的 verification commands，记录 exit code、stdout/stderr 和 timeout，不自动修改目标 repo 代码。
- validation-only 会优先把目标 repo 的 `.venv/bin` 放到 PATH 前面，便于 Python/CLI repo 使用本地虚拟环境中的 `ruff`、`mypy` 等命令。
- 将 `run-repair-execute` 纳入 `@hardening-mcp/acceptance` package exports、compatibility contract、type-smoke 和 root script，保证 package 子路径与 dist 输出持续可验证。
- 级联更新 README、用户验收指南和 MVP spec v0.2，明确 repair execute v0.1 是 dry-run / validation-only 原型，不自动改代码。

### 验证

- Red：`pnpm vitest run tests/unit/repair-execute.test.ts` 因 `run-repair-execute` 模块尚不存在按预期失败。
- Green：`pnpm vitest run tests/unit/repair-execute.test.ts` 通过，1 个测试文件、3 个测试。
- Green：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、65 个测试。
- `pnpm repair:execute -- --package /private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z/repair-handoff-package.json --task pycli-failed-ruff-check --dry-run`：通过，生成 planned `repair-execution-report.json` / `.md`。
- `pnpm repair:execute -- --package /private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z/repair-handoff-package.json --task pycli-failed-ruff-check --validation-only`：通过，生成 failed execution report；`ruff check .` exit code 为 `1`，失败证据写入报告。

### 阻塞

- 无新增阻塞。Panniantong/Agent-Reach 的 `ruff check .` 仍失败，属于目标 repo 待修复任务；本轮只建立执行框架和验证复跑证据，不自动修改目标 repo。

## 2026年6月21日 - Acceptance Package Phase 2dc Repair Handoff Loop

### 完成内容

- 新增 `pnpm repair:handoff -- --run <run-dir>`，从指定 run bundle 的 `manifest.json` 读取失败命令和失败验收项，生成 `repair-handoff-package.json`、`repair-handoff-package.md` 和 `verification-plan.md`。
- 新增 `packages/acceptance/src/run-repair-handoff.ts`，定义 Repair Handoff v0.1 schema，将 command failure 标准化为包含 objective、evidence、impact、recommendedFix、verification、risks 和 handoffPrompt 的 AI IDE / Agent 可执行任务。
- 将 `run-repair-handoff` 纳入 `@hardening-mcp/acceptance` package exports、compatibility contract 和 root script，保证 package subpath smoke 与 dist 输出可持续验证。
- 针对 Python/CLI mode 去重：当同一失败同时存在于 `commandResults` 和 `Python CLI check 执行: <command>` acceptance check 时，只生成一个 command failure 修复任务。
- 级联更新 README、用户验收指南和 MVP spec v0.2，补齐 repair handoff 命令、输出物料和 AI IDE 消费入口。

### 验证

- Red：`pnpm vitest run tests/unit/repair-handoff.test.ts` 因 `run-repair-handoff` 模块尚不存在按预期失败。
- Green：`pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/acceptance-package.test.ts` 通过，2 个测试文件、31 个测试。
- `pnpm typecheck`：通过。
- `pnpm repair:handoff -- --run /private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z`：通过，生成 2 个 P1 repair handoff 任务，分别对应 `ruff check .` 和 `mypy .`；输出路径为 `/private/tmp/agent-reach/.hardening/runs/run-2026-06-21T08-47-32-667Z/repair-handoff-package.json`、`repair-handoff-package.md` 和 `verification-plan.md`。

### 阻塞

- 无新增阻塞。Panniantong/Agent-Reach 的 ruff/mypy 失败继续作为目标 repo 待修复任务，不是产品 repair handoff 阻塞。

## 2026年6月21日 - Acceptance Package Phase 2db Python/CLI Check Execution

### 完成内容

- 将 Python/CLI acceptance mode 从“生成 check plan”升级为“执行 check 并记录结果”：runner 会执行 CLI smoke、pytest、ruff 和 mypy 等命令，捕获 exit code、stdout/stderr、timeout，并统一脱敏和截断输出。
- `pnpm user:accept -- --mode cli` 现在会把 `Python CLI check 执行: <command>` 写入 user acceptance record；required smoke check 失败会导致验收失败，optional static/test check 失败会作为失败项记录但不触发必需项失败。
- CLI artifact writer 现在会把 command execution results 写入 `hardening-report.md`、run `manifest.json`、`repair-plan.json` 和 `repair-task-package.json` / `.md`，便于 AI IDE 直接读取失败命令和证据。
- 执行命令时自动把目标 repo 的 `.venv/bin` 放到 PATH 前面，兼容 Agent-Reach 这类本地 venv 安装后的 console script、pytest、ruff 和 mypy。

### 验证

- Red：`pnpm vitest run tests/unit/python-cli-checks.test.ts tests/unit/python-cli-artifacts.test.ts` 因缺少 execution summarizer 和 artifact command results 按预期失败。
- Green：同一组测试通过，2 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/python-cli-checks.test.ts tests/unit/python-cli-artifacts.test.ts`：通过，3 个测试文件、63 个测试。
- `pnpm typecheck`：通过。
- Panniantong/Agent-Reach 手动验证基线：`.venv/bin/agent-reach --help` 通过；隔离 `HOME` 并清空常见 API key 后，`.venv/bin/python -m pytest` 通过，162 passed；`.venv/bin/python -m ruff check .` 失败，46 项；`.venv/bin/python -m mypy .` 失败，15 项。
- `pnpm user:accept -- --mode cli --repo /private/tmp/agent-reach --decision pending --output artifacts/acceptance/agent-reach-user-acceptance.md`：升级后复验通过，17 项检查中 15 项通过、2 项失败、0 项必需失败；pytest 执行结果自动转为通过，ruff/mypy 失败自动写入验收记录、report、manifest、repair plan 和 repair task package。

### 阻塞

- 无新增阻塞。Panniantong/Agent-Reach 的 ruff/mypy 失败属于目标 repo 代码质量问题，已进入产品物料；不是 Python/CLI acceptance runner 阻塞。

## 2026年6月21日 - Acceptance Package Phase 2da Python/CLI Acceptance Mode

### 完成内容

- 按 ADR-0008 后续决议新增显式 `--mode cli`，默认 browser mode 仍要求 Web App `package.json`，不会把 Python CLI repo 静默降级到 browser flow。
- 为 `packages/acceptance` 增加 Python/CLI preflight、`pyproject.toml` profile、CLI smoke/static check plan、CLI-oriented report、run manifest、repair plan 和 repair task package 输出。
- `pnpm user:accept -- --mode cli --repo <python-cli-repo>` 现在会写出 `.hardening/run/python-cli-profile.json`、run-scoped `python-cli-profile.json`、`hardening-report.md`、`repair-plan.json` / `repair-plan.md`、`repair-task-package.json` / `repair-task-package.md` 和验收记录；accepted CLI mode 不要求 generated Playwright spec validation，但仍要求具体 `--notes`。
- `pnpm user:handoff -- --mode cli --repo <python-cli-repo>` 现在会显示 repo root / `pyproject.toml` 前置检查，并渲染 CLI mode 的 pending、accepted 和 changes_requested 命令。
- 新增 `fixtures/python-cli-basic` 作为可复现 Python/CLI fixture，覆盖 `pyproject.toml`、console script 和 optional `pytest`/`ruff` 配置。
- 级联更新 README、用户验收指南、验收清单、MVP spec v0.2 和 ADR-0008 follow-up implementation note，明确 browser mode 与 CLI mode 的边界。

### 验证

- Red/Green：新增 `tests/unit/python-cli-profile.test.ts`、`tests/unit/python-cli-checks.test.ts`、`tests/unit/python-cli-artifacts.test.ts`，覆盖 profile 解析、命令安全策略、static/test 命令检测、stdout/stderr 脱敏截断和 CLI artifact 写入。
- Red/Green：扩展 `tests/unit/user-acceptance.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts`，覆盖 `--mode cli` 参数、`pyproject.toml` preflight、CLI mode 不调用 web hardening、mode-aware 下一步和 handoff 命令。
- `pnpm vitest run tests/unit/python-cli-profile.test.ts tests/unit/python-cli-checks.test.ts tests/unit/python-cli-artifacts.test.ts tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts`：通过，7 个测试文件、158 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/user-acceptance-handoff.test.ts`：通过，3 个测试文件、170 个测试。
- `pnpm typecheck`：通过。
- `pnpm user:accept -- --mode cli --repo fixtures/python-cli-basic --decision pending --output artifacts/acceptance/python-cli-basic-user-acceptance.md`：通过，13/13 检查通过，生成 CLI profile、hardening report、manifest、repair plan 和 repair task package。
- `pnpm user:handoff -- --mode cli --repo fixtures/python-cli-basic --output artifacts/acceptance/python-cli-basic-user-handoff.md`：通过，显示 `pyproject.toml` preflight 通过并生成 CLI mode 验收命令。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 阻塞

- 本轮未重新克隆真实 `Panniantong/Agent-Reach`；当前 workspace 内没有该 repo，网络受限环境下不主动执行远程 clone。已用 `fixtures/python-cli-basic` 完成可复现 CLI mode 验证；真实 Agent-Reach 复验需要用户授权网络/克隆或提供本地路径。

## 2026年6月21日 - Acceptance Package Phase 2cz Repository Acceptance Scope ADR

### 完成内容

- 将 `Panniantong/Agent-Reach` 暴露的产品边界从普通 blocker 升级为持久架构/产品决策，新增 `ADR-0008: Repository acceptance scope`。
- ADR-0008 明确当前 `user:accept` browser acceptance flow 只覆盖可自动启动的 Web App repo 或已通过 `--url` 提供运行地址的 Web App；Python CLI / Agent capability repo、纯库、后端服务和移动端等非浏览器 UI 项目不应被静默降级到 browser acceptance。
- ADR-0008 明确 Agent-Reach 这类只有 `pyproject.toml`、没有根目录 `package.json` 的 repo 应在 repo preflight 阶段生成结构化失败记录；当前失败项仍是 `missing package.json`。
- 级联更新 `docs/adr/README.md`、`README.md`、`docs/acceptance/guides/user-acceptance-guide.md`、`docs/acceptance/checklists/acceptance-checklist-v0.1.md` 和 `docs/product/specs/mvp-spec-v0.2.md`，让 Repository acceptance scope 在产品规格、验收入口和清单中都可发现。
- 未来支持方向记录为独立 Python/CLI acceptance mode，而不是放宽现有 Web App preflight；候选证据包括 `pyproject.toml`、CLI smoke、pytest/ruff/mypy、网络 mock 和 Agent tool invocation。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "repository acceptance scope"` 因 `docs/adr/0008-repository-acceptance-scope.md` 尚未存在按预期失败。
- Green：同一聚焦 repository acceptance scope 结构测试通过。
- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "latest dev log entry"` 因 Phase 2cz 顶部日志尚未写入按预期失败。
- `pnpm user:accept -- --repo /private/tmp/agent-reach --browser --validate-generated-tests --decision pending`：当前记录保持预期未通过，失败原因是 `missing package.json`，未进入 browser/generated Playwright spec 执行验证阶段。
- 最近一次 `pnpm acceptance -- --full --browser`：提权重跑通过，17/17，包含 unit 25/456、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- 最近一次 `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- 最近一次 `pnpm user:handoff`：通过，交接包架构迁移状态仍显示 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。

### 阻塞

- Agent-Reach 仍是当前 browser acceptance flow 的范围外 repo；若要支持它，应进入 Python/CLI acceptance mode 的产品规格和实现设计，而不是修改当前 Web App 验收边界。

## 2026年6月21日 - Acceptance Package Phase 2cy Agent-Reach Scope Boundary Validation

### 完成内容

- 使用用户指定的真实项目 `Panniantong/Agent-Reach` 继续做真实 repo 验收边界测试；`gh repo view Panniantong/Agent-Reach` 确认该 repo 为公开仓库，默认分支为 `main`。
- 通过 `git clone --depth 1 https://github.com/Panniantong/Agent-Reach.git /private/tmp/agent-reach` 成功拉取目标项目。
- 检查目标 repo 后确认其是 Python CLI/capability package：存在 `pyproject.toml`，项目名为 `agent-reach`，入口为 `agent-reach = "agent_reach.cli:main"`，依赖包含 `requests`、`feedparser`、`yt-dlp`，但仓库根目录没有 `package.json`。
- `pnpm user:handoff -- --repo /private/tmp/agent-reach --output /private/tmp/agent-reach-user-handoff-preflight.md` 按预期未通过 repo preflight：repo root 有效，但 `package.json` 必需项失败。
- `pnpm user:accept -- --repo /private/tmp/agent-reach --browser --validate-generated-tests --decision pending` 已写出 `docs/acceptance/user-acceptance-record.md`：2 项 artifact 检查中 1 项通过、1 项失败，必需失败项为 `missing package.json: /private/tmp/agent-reach/package.json`。
- 本轮没有放宽当前 Web App repo preflight 边界：该失败证明当前 MVP 的真实项目验收入口仍以 Web App repo 为边界，不应把 Python CLI package 误判为可运行浏览器验收目标。若要支持 Agent-Reach 这类 repo，应进入 Spec v0.2 增加 Python/CLI repo acceptance mode。
- 单元测试全集随后暴露一个文案缺口：失败的 pending 验收记录没有提示“用户需要将结论更新为 `accepted` 或 `changes_requested`”以及“不能仅凭该记录标记长期 goal complete”。已按 TDD 修复 `packages/acceptance/src/user-acceptance.ts`，让 preflight 失败记录也保留用户验收生命周期边界。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "latest dev log entry"` 因 Phase 2cy 顶部日志尚未写入按预期失败。
- Red：`pnpm vitest run tests/unit/user-acceptance.test.ts --testNamePattern "failed acceptance records"` 因失败 pending 验收记录缺少 lifecycle next steps 按预期失败。
- Green：同一聚焦 user acceptance 测试通过。
- `pnpm user:accept -- --repo /private/tmp/agent-reach --browser --validate-generated-tests --decision pending`：按预期未通过，失败原因是 `missing package.json`，未进入 browser/generated Playwright spec 执行验证阶段；重新生成后的 `docs/acceptance/user-acceptance-record.md` 已包含 accepted/changes_requested lifecycle next steps。
- `pnpm acceptance -- --full --browser`：默认沙箱首次补跑因本地监听和 Chromium MachPort 权限失败，属于已记录环境限制；提权重跑通过，17/17，包含 unit 25/456、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- 最近一次 `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- 最近一次 `pnpm user:handoff`：通过，交接包架构迁移状态仍显示 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。

### 阻塞

- `Panniantong/Agent-Reach` 不是当前 MVP 可自动验收的 Web App repo；它是 Python CLI package，根目录没有 `package.json`，因此当前 `user:accept` 只能给出 repo preflight 失败记录，不能生成 browser artifact 或 generated Playwright spec 执行验证结果。
- 这不影响 `openclaw/openclaw` 已通过的 pending 真实 Web App 验收结论；长期 goal 仍需要用户对符合范围的 pending 验收记录给出 `accepted` 或 `changes_requested`。

## 2026年6月21日 - Acceptance Package Phase 2cx OpenClaw Real Project Validation

### 完成内容

- 使用用户指定的真实项目 `openclaw/openclaw` 继续解除长期 goal 的真实项目验收阻塞；首次完整 `gh repo clone` 因网络传输中断失败，随后用 `git clone --depth 1 https://github.com/openclaw/openclaw.git /private/tmp/openclaw-openclaw-shallow` 成功拉取。
- `pnpm user:handoff -- --repo /private/tmp/openclaw-openclaw-shallow --output /private/tmp/openclaw-user-handoff-preflight.md` 通过 repo preflight，确认 repo root 和 `package.json` 有效。
- 首次 `pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --validate-generated-tests --decision pending` 失败于目标 repo 未安装依赖，`pnpm ui:dev`/root boot 需要的 `json5` 不存在。
- 在目标 repo 执行 `pnpm install --frozen-lockfile` 后，用 `--start-command "pnpm ui:dev"` 补跑真实项目验收；该轮暴露生成测试对 `/` 到 `/chat?session=main` 这类合法 SPA 重定向过于严格，`generated Playwright spec 执行验证` 因 exact `toHaveURL("/")` 失败。
- 按 TDD 修复 `src/domain/tests/generate-tests.ts`：生成的 Playwright spec 保留 `page.goto(targetURL)` 和 body 可见性检查，但把 exact URL 断言改为同源断言，避免真实 Web App 合法重定向被误判为生成测试失败。
- `docs/acceptance/user-acceptance-record.md` 已刷新为 openclaw pending 验收记录：12 项 artifact 检查全部通过，`generated Playwright spec 执行验证` 通过，browser artifact 已生成；用户结论仍为待确认。

### 验证

- Red：`pnpm vitest run tests/unit/generate-tests.test.ts --testNamePattern "creates a Playwright spec from findings"` 因生成器仍输出 `await expect(page).toHaveURL(targetURL);` 按预期失败。
- Green：同一聚焦生成测试通过。
- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，27 个测试。
- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "latest dev log entry"` 因 Phase 2cx 顶部日志尚未写入按预期失败。
- `pnpm test:unit`：通过，25 个测试文件、456 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm user:accept -- --repo /private/tmp/openclaw-openclaw-shallow --browser --validate-generated-tests --start-command "pnpm ui:dev" --boot-timeout-ms 120000 --decision pending`：真实项目验收记录通过，12/12；`generated Playwright spec 执行验证` 通过；browser artifact `/private/tmp/openclaw-openclaw-shallow/.hardening/artifacts/localhost-5173-root.png` 已生成。
- `pnpm acceptance -- --full --browser`：首次补跑因本条 dev-log 缺少精确 `pnpm goal:audit` 统计短语导致 unit gate 失败；修正后再次补跑通过，17/17，包含 unit 25/456、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；openclaw pending 验收记录已通过，但用户结论仍待确认。
- `pnpm user:handoff -- --repo /private/tmp/openclaw-openclaw-shallow`：通过，交接包显示 repo preflight 通过、自动质量门禁通过、架构迁移状态通过，并继续提示用户验收结论待确认。
- `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`：本轮未改变 acceptance package/legacy dist 合同，既有架构迁移证据应保持。

### 阻塞

- 真实项目 pending 验收已经通过，但长期 goal 仍不能 complete：当前用户验收记录的用户结论是“待用户确认”，仍需用户明确 `accepted` 或 `changes_requested`。
- `pnpm user:accept` 在输出验收记录后，目标 Vite dev server 子进程没有自然释放，当前通过手动中断会话结束；验收记录和 artifacts 已写出。后续如需要把该行为产品化，应单独加固 managed boot cleanup。

## 2026年6月21日 - Acceptance Package Phase 2cw Final Auto Evidence Recheck

### 完成内容

- 继续按 active goal 做 completion audit，没有扩大迁移范围或改动产品实现；当前 `packages/acceptance` 仍是 acceptance implementation owner，`src/internal/acceptance/*` 仍仅作为 compatibility wrappers。
- 重新核对 `docs/goals/active/2026-06-20-acceptance-package-migration.md`、`docs/acceptance/goal-completion-audit.md`、`docs/acceptance/acceptance-run.md` 和当前 package/legacy 文件集合，确认自动可验证迁移范围没有缺失项。
- 刷新 `docs/acceptance/user-acceptance-handoff.md`，保持最终交接包和最新 goal audit 一致；剩余项仍是用户验收结论，不能由自动脚本替代。
- `tests/unit/project-structure.test.ts` 的最新 dev-log 结构测试推进到本条 Phase 2cw，防止后续审计收口记录与顶部日志漂移。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "latest dev log entry"` 因 Phase 2cw 顶部日志尚未写入按预期失败。
- Green：同一聚焦结构测试通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，34 个结构测试。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；架构迁移项仍覆盖 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- `pnpm user:handoff`：通过，交接包刷新到最新 goal audit 状态，并继续显示 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- 最近一次 `pnpm acceptance -- --full --browser`：通过，17/17；当前 goal audit 判定该 full mode 结果对当前 goal update date 仍 fresh。

### 阻塞

- 长期 goal 仍不能标记 complete：`docs/goals/codex-goal.md` Success Definition 要求用户确认 MVP 符合预期，当前 `docs/logs/blockers.md` 已记录“长期 goal 等待真实项目用户验收”。

## 2026年6月21日 - Acceptance Package Phase 2cv Legacy Source Map Goal Audit Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 legacy dist source map specs 显式写入 goal audit 和 user handoff 的架构迁移证据。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的 `Legacy acceptance dist compatibility outputs` 证据现在同时引用 `legacyAcceptanceDistOutputEntries.sourceMapPath` 和 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- `tests/unit/goal-audit.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts` 增加断言，确保 goal audit 输出和 handoff 架构迁移状态都显示 legacy source map specs 的证据。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts --testNamePattern "process governance goal audit items|architecture migration status"` 因 process governance 证据尚未引用 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、4 个测试。
- `pnpm test:unit`：通过，25 个测试文件、456 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/456、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；`Legacy acceptance dist compatibility outputs` 证据已显示 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- `pnpm user:handoff`：通过，交接包架构迁移状态已显示 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。

## 2026年6月21日 - Acceptance Package Phase 2cu Legacy Source Map Smoke Documentation

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 package README 和 monorepo structure spec 中 package subpath smoke gate 的合同说明。
- `packages/acceptance/README.md` 现在明确 all-subpath package import smoke 会校验 root 与 `goal-audit-sources` subpath 暴露一致的 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` runtime contract。
- `packages/acceptance/README.md` 和 `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 现在都明确 package subpath type-resolution smoke 覆盖 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- `tests/unit/project-structure.test.ts` 增加结构断言，防止 README/spec 再漏写 legacy source map specs 的 runtime/type smoke 覆盖边界。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection"` 因 README 尚未说明 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` runtime/type smoke contract 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试文件、1 个测试。

## 2026年6月21日 - Acceptance Package Phase 2ct Legacy Source Map Governance Wording

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 active migration goal、monorepo structure spec 和 ADR-0006 中 legacy dist 兼容输出证据的滞后表述。
- `docs/goals/active/2026-06-20-acceptance-package-migration.md` 现在明确 `dist/internal/acceptance/*` 的 `.js` runtime wrappers、`.d.ts` declaration re-exports 和 `.js.map` source maps 都由 goal audit 检查。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 与 `docs/adr/0006-package-build-strategy.md` 已同步说明 legacy `.js.map` source maps 属于 compatibility output evidence，而不是未治理的构建副产物。
- `tests/unit/project-structure.test.ts` 增加治理文档结构测试，防止后续再把 legacy dist source map evidence 从迁移文档中漏掉。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "legacy dist source map compatibility evidence"` 因 active migration goal 尚未把 `.js.map` 纳入 legacy dist goal audit 文案按预期失败。
- Green：同一聚焦结构测试通过，1 个测试文件、1 个测试。

## 2026年6月21日 - Acceptance Package Phase 2cs Goal Audit Source Map Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package 与 legacy dist `.js.map` source map 文件纳入 goal audit source collection 和 process governance evidence。
- `packages/acceptance/src/goal-audit-sources.ts` 现在从 `acceptancePackageDistOutputEntries` 派生 `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`，并从 `legacyAcceptanceDistOutputEntries` 派生 `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`。
- `packages/acceptance/src/goal-audit-process-governance.ts` 现在显式检查 package dist source map source specs 是否可读，并验证 legacy dist `.js.map` 内容指向对应 `.js` 文件。
- `packages/acceptance/src/run-acceptance.ts` 的 package subpath import smoke 现在检查 root 与 `goal-audit-sources` subpath 暴露的 package/legacy source map specs 是否漂移。
- `packages/acceptance/README.md`、`docs/architecture/specs/monorepo-structure-spec-v0.1.md`、active migration goal 和 ADR-0006 已同步说明 source map specs 是 package/legacy dist output contract 的一部分。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts --testNamePattern "process governance goal audit items|architecture migration status|concise handoff"` 因 `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` 尚未实现按预期失败。
- Green：聚焦测试 `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts --testNamePattern "process governance goal audit items|architecture migration status|concise handoff|Package subpath import smoke|goal audit source collection|package export surface governance|every acceptance package source module"` 通过，3 个测试文件通过、1 个跳过、9 个测试通过。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cr Dist Source Map Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package 与 legacy dist 的 `.js.map` source map 输出纳入同一个兼容输出合同。
- `packages/acceptance/src/compatibility.ts` 的 `AcceptancePackageDistOutputEntry` 和 `LegacyAcceptanceDistOutputEntry` 现在都包含 `sourceMapPath`，分别由 package export contract 和 legacy compatibility module contract 派生。
- `tests/unit/project-structure.test.ts` 现在要求 package dist 与 legacy dist 文件集合同时覆盖 `.js`、`.d.ts` 和 `.js.map`，并验证 legacy source map 指向对应 legacy `.js` 文件。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在显式读取 package 与 legacy dist entry 的 `sourceMapPath`，确保 package root 和 `compatibility` subpath 的类型声明暴露 source map contract。
- `packages/acceptance/README.md` 与 `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 已同步说明 `.js.map` source map path 属于 package/legacy dist output contract。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "generated .* dist outputs|every acceptance package source module"` 因 dist output entries 尚无 `sourceMapPath` 且 type-smoke 未覆盖 source map contract 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试文件、3 个测试。
- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection"` 因 README/spec 尚未说明 `sourceMapPath` 文档合同按预期失败。
- Green：同一聚焦文档治理测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- Package subpath type-resolution smoke：通过，`sourceMapPath` 可通过 package root 与 `compatibility` subpath 类型解析。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cq Legacy Dist Compatibility Output Wording

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 `packages/acceptance/README.md` 末尾仍把 legacy `dist/internal/acceptance/*` 称为 “implementation outputs” 的滞后表述。
- `packages/acceptance/README.md` 现在统一称 legacy `dist/internal/acceptance/*` 为 compatibility outputs，明确 `.js` runtime wrappers 和 `.d.ts` declaration re-exports 是兼容输出，不是当前 implementation owner。
- `tests/unit/project-structure.test.ts` 增加反向断言，防止 README 再把 legacy dist 输出称为 implementation outputs。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "benchmark report ownership"` 因 README 缺少 “Preserve legacy compatibility outputs under `dist/internal/acceptance/*`” 按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- 文本检查：`rg -n 'Preserve legacy implementation outputs|compatibility implementation paths|implementation outputs under `dist/internal/acceptance' README.md docs packages tests` 仅命中反向断言。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cp Implementation Owner Wording Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 `packages/acceptance/README.md` 和 monorepo structure spec 中仍把 package 描述为 command entrypoint layer、package-owned wrapper 或 compatibility-wrapper pilot 的滞后表述。
- `packages/acceptance/README.md` 现在明确 `packages/acceptance` owns acceptance implementation modules and runner entrypoints；legacy `src/internal/acceptance/*` 是 compatibility wrapper surface，legacy `dist/internal/acceptance/*` 是 compatibility output surface。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 现在把 `packages/acceptance` 定义为 Phase 2 implementation-owner pilot，而不是 wrapper-only pilot。
- `tests/unit/project-structure.test.ts` 增加 README/spec 当前角色断言和反向断言；`tests/unit/acceptance-package.test.ts` 同步测试标题为 package runner calls，避免测试语义继续暗示 wrapper-only 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "extracts acceptance command ownership"` 因 README 仍缺少 “This package owns acceptance implementation modules and runner entrypoints” 按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，2 个测试文件、61 个测试。
- 文本检查：`rg -n 'compatibility-wrapper pilot|owns wrapper entrypoints|owns the acceptance command entrypoint layer|Build package-owned wrappers|package wrapper calls|wrapper-only|wrappers delegate to the existing|without moving implementation files' README.md docs packages tests` 仅命中历史日志和反向断言。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2co ADR-0005 Current State Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 ADR-0005 中仍把 Phase 2 描述为 “defer physical package extraction” 的过期决策文本。
- `docs/adr/0005-phased-monorepo-migration.md` 现在明确 Phase 2 acceptance package pilot 已实现：`packages/acceptance/src` 承载验收实现模块与 package runner，legacy `src/internal/acceptance/*` 和 `dist/internal/acceptance/*` 仅作为兼容 wrapper/output surface。
- `tests/unit/project-structure.test.ts` 增加 ADR-0005 当前状态断言和反向断言，防止 phased monorepo 决策回退到 acceptance package 尚未抽取的历史状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "phase 2 package split preconditions"` 因 ADR-0005 仍缺少 “Phase 2 acceptance package pilot is implemented” 且保留旧 Phase 2 deferred 说明按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新用户验收交接包，当前结论仍为自动证据已齐、需用户验收结论。

## 2026年6月21日 - Acceptance Package Phase 2cn ADR Current State Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 ADR-0006 中仍把 Phase 2 描述为 deferred、仍把 Phase 2a 描述为 package wrappers delegate to legacy `dist/internal/acceptance/*` 且未迁移 implementation files 的过期状态。
- `docs/adr/0006-package-build-strategy.md` 现在明确 acceptance package pilot 已不再 deferred：`packages/acceptance/src/*` 是当前实现 owner，`packages/acceptance/dist/*` 是当前 runner 执行目标，legacy `src/internal/acceptance/*` 和 `dist/internal/acceptance/*` 是兼容 wrapper/output surface。
- `tests/unit/project-structure.test.ts` 增加 ADR 当前状态反向断言，防止 ADR 回退到 Phase 2a wrapper-only 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "phase 2 package split preconditions"` 因 ADR-0006 缺少 “acceptance package pilot is no longer deferred” 且保留旧 Phase 2a delegate 说明按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cm Monorepo Spec Acceptance Criteria Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 monorepo structure spec 中 Phase 0 仍标记为 in progress、仍保留 “Do not move runtime code yet” 和只面向 Phase 0 的验收标准的问题。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 现在明确 Phase 0 scaffold 已完成，并把 Phase 2 acceptance package pilot 纳入当前 acceptance criteria：`packages/acceptance` 承载实现模块和 runner，legacy `src/internal/acceptance/*` / `dist/internal/acceptance/*` 作为兼容 wrapper/output，package subpath runtime/type smoke gates 必须通过。
- `tests/unit/project-structure.test.ts` 更新结构契约，防止 Phase 0 历史状态和当前 Phase 2 acceptance package pilot 状态再次混淆。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "completed phase 0 scaffold"` 因 monorepo spec 仍标记 Phase 0 in progress 且保留 “Do not move runtime code yet” 按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cl README Structure State Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，修正 README 与 monorepo spec 中仍把当前项目描述为单包 / Phase 0 scaffold 的过期状态。
- `README.md` 的项目结构说明现在明确当前是分阶段迁移中的 monorepo workspace，monorepo 迁移已进入 Phase 2 acceptance package pilot，`packages/acceptance/` 已承载验收实现模块、runner、goal audit 和 user handoff，`src/internal/acceptance/` 与 `dist/internal/acceptance/` 仅保留为兼容 wrapper/output。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 的 Current State 同步为 phased monorepo workspace，避免读者误以为 runtime 仍停留在 Phase 0 单包结构；同时移除 “internal acceptance tooling 仍耦合在单包” 和 “Move acceptance runners to packages/acceptance” 的过期表述。
- `tests/unit/project-structure.test.ts` 增加 README/spec 当前状态断言，防止后续文档回退到旧 Phase 0 描述。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "active acceptance package migration goal"` 因 README 仍写着 Phase 0 scaffold 按预期失败。
- Red：同一聚焦测试继续捕获 monorepo spec 中 “internal acceptance tooling 仍耦合在单包” 的残留过期表述。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、33 个测试。
- 文本检查：`rg -n '当前代码仍保持单包运行结构|The current implementation is still a single TypeScript package|internal acceptance tooling, and future package boundaries are still coupled inside one package|Move acceptance runners to|Phase 2a 验收命令 wrapper 包' README.md docs/architecture/specs/monorepo-structure-spec-v0.1.md docs/goals/active/2026-06-20-acceptance-package-migration.md packages/acceptance/README.md` 无匹配。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、E2E smoke、typecheck、lint、build、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2ck Goal Audit Source Specs Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package dist source specs 写入最终 `pnpm goal:audit` 和 `pnpm user:handoff` 的架构迁移通过证据。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的 `Acceptance package typed module exports` 通过证据现在明确声明 `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 与 `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS` 匹配 package dist source specs。
- `tests/unit/goal-audit.test.ts` 与 `tests/unit/user-acceptance-handoff.test.ts` 更新期望，防止最终审计报告和用户交接包回退到只说明 `acceptancePackageDistOutputEntries` 而不说明 source specs 合同。
- `tests/unit/project-structure.test.ts` 增加最新开发日志证据断言，要求 Phase 2ck 日志记录 full/browser acceptance、goal audit、user handoff 与 package dist source specs 的最终证据，避免收口日志落后于验收材料。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts --testNamePattern "process governance goal audit items|architecture migration status"` 因 goal audit evidence 尚未包含 package dist source specs 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、4 个测试。
- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "latest dev log entry"` 因最新开发日志尚未记录 full/browser acceptance、goal audit、user handoff 最终证据按预期失败。
- Green：同一开发日志聚焦测试通过，1 个测试文件、1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts` 通过，4 个测试文件、181 个测试。
- `pnpm test:unit`：通过，25 个测试文件、455 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:e2e`：通过，1 个测试文件通过、1 个测试文件跳过。
- `pnpm test:integration`：沙箱内因本地服务启动限制失败；沙箱外重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/455、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；最终 goal audit 与 handoff evidence 已包含 `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 与 `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；架构迁移表中的 `Acceptance package typed module exports` 已输出 package dist source specs 证据。
- `pnpm user:handoff`：通过，刷新用户验收交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1，并显示 package dist source specs 证据。

## 2026年6月21日 - Acceptance Package Phase 2cj Source Specs Documentation Governance

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package dist source specs 的 runtime/type smoke 合同同步进长期文档。
- `packages/acceptance/README.md` 现在明确 `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 与 `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS` 从 `acceptancePackageDistOutputEntries` 派生，并由 goal audit source collection、process governance、runtime smoke 和 type-resolution smoke 共同使用。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 现在记录 root 与 `goal-audit-sources` package subpath 必须暴露一致的 package dist source specs。
- `docs/adr/0006-package-build-strategy.md` 现在记录 package root、`./compatibility` 和 `./goal-audit-sources` declarations 的 smoke 覆盖边界。
- `docs/goals/active/2026-06-20-acceptance-package-migration.md` 的 current state 已同步新增 source specs 合同，避免目标文档落后于实际验收门禁。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection|package export surface governance"` 因 README、ADR、monorepo spec 和 active goal 尚未说明 package dist source specs smoke 合同按预期失败。
- Green：同一聚焦结构测试通过，1 个测试文件、2 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts` 通过，4 个测试文件、180 个测试。
- `pnpm test:unit`：通过，25 个测试文件、454 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

## 2026年6月21日 - Acceptance Package Phase 2ci Goal Audit Source Specs Smoke Contracts

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package dist source specs 纳入 package subpath import smoke 与 type-resolution smoke。
- `packages/acceptance/src/run-acceptance.ts` 的 package subpath import smoke 现在嵌入 `expectedPackageDistOutputSourceSpecs` 与 `expectedPackageDistDeclarationSourceSpecs`，并要求 package root 与 `@hardening-mcp/acceptance/goal-audit-sources` subpath 暴露的 source specs 完全一致。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 `goal-audit-sources` subpath 引用 `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 与 `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`，验证公开类型入口可解析这些 source specs。
- `tests/unit/project-structure.test.ts` 增加 type-smoke 内容断言，防止后续删除 package dist source specs 的公开合同验证。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 runtime smoke 尚未覆盖 package dist source specs 按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- Type smoke：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、75 个测试。
- `pnpm test:unit`：通过，25 个测试文件、454 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:e2e`：通过，1 个测试文件通过、1 个测试文件跳过。
- `pnpm test:integration`：沙箱内因本地服务启动限制失败；沙箱外重跑通过，11 个测试文件、27 个测试。

## 2026年6月21日 - Acceptance Package Phase 2ch Goal Audit Package Dist Source Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package-owned dist 输出纳入 `pnpm goal:audit` 的 source collection 与架构迁移门禁。
- `packages/acceptance/src/goal-audit-sources.ts` 新增 `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 与 `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`，从 `acceptancePackageDistOutputEntries` 派生 `packages/acceptance/dist/*.js` 与 `.d.ts` 读取清单。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的 `Acceptance package typed module exports` 现在要求 package dist 输出 source 非空，避免只验证 package.json exports 而遗漏实际 build 产物。
- `packages/acceptance/src/index.ts` 公开导出新的 package dist source specs，保持 package root 的可观察合同完整。
- `tests/unit/goal-audit.test.ts` 与 `tests/unit/project-structure.test.ts` 补齐 source collection、process governance 和结构治理断言，防止后续回退到手写路径或漏导出。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "reads goal audit text sources"` 因 package dist source specs 尚未导出和读取按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/user-acceptance-handoff.test.ts` 通过，3 个测试文件、165 个测试。
- `pnpm test:unit`：通过，25 个测试文件、454 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:e2e`：通过，1 个测试文件通过、1 个测试文件跳过。
- `pnpm test:integration`：沙箱内因本地服务启动限制失败；沙箱外重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/454、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cg Package Dist Output Contracts

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package-owned dist output 列表提升为公开 contract。
- `packages/acceptance/src/compatibility.ts` 新增 `acceptancePackageDistOutputEntries`，从 `acceptancePackageExportEntries` 派生 `packages/acceptance/dist/*.js` 与 `.d.ts` output paths。
- `packages/acceptance/src/run-acceptance.ts` 的 package subpath import smoke 现在嵌入 `expectedPackageDistOutputEntries`，并要求 package root 与 `@hardening-mcp/acceptance/compatibility` subpath 暴露的 `acceptancePackageDistOutputEntries` 与构建时合同完全一致。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 compatibility subpath 引用 `AcceptancePackageDistOutputEntry` 与 `acceptancePackageDistOutputEntries`，验证公开类型入口可解析 package dist output contract。
- `tests/unit/project-structure.test.ts` 新增 package dist 输出集合校验，要求 `packages/acceptance/dist/*.js` 与 `.d.ts` 文件集合完全匹配 `acceptancePackageDistOutputEntries`。
- 更新 package README、monorepo structure spec、ADR-0006 和 active migration goal，明确 package dist output contract 已被 runtime import smoke 和 type-resolution smoke 覆盖。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的架构迁移证据现在明确包含 `acceptancePackageDistOutputEntries`。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts --testNamePattern "package subpath import smoke|generated acceptance package dist outputs|every acceptance package source module"` 因 runtime smoke 与结构测试尚未覆盖 `acceptancePackageDistOutputEntries` 按预期失败。
- Red：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 因 package dist declaration 尚未导出 `AcceptancePackageDistOutputEntry` 与 `acceptancePackageDistOutputEntries` 按预期失败。
- Green：聚焦结构与 smoke 测试通过，2 个测试文件、5 个测试。
- Type smoke：重建 package 后同一 type-resolution smoke 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts` 通过，5 个测试文件、208 个测试。
- `pnpm test:unit`：通过，25 个测试文件、454 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/454、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedPackageDistOutputEntries` 和 `acceptancePackageDistOutputEntries drift` 检查。

## 2026年6月21日 - Acceptance Package Phase 2cf Goal Audit Source Contract Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 `acceptancePackageSourceEntries` 纳入 `pnpm goal:audit` 的架构迁移证据文本。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的 `Acceptance package typed module exports` 通过证据现在同时声明 exact package export surface 与 package source contract。
- `tests/unit/goal-audit.test.ts` 新增 Red/Green 断言，防止 goal audit 回退到只证明 `acceptancePackageExportEntries` 而不证明 `acceptancePackageSourceEntries`。
- `tests/unit/user-acceptance-handoff.test.ts` 的架构迁移示例证据同步为新的 source contract 表述，避免 handoff 示例继续传播旧证据。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "process governance goal audit items"` 因 goal audit evidence 尚未包含 `acceptancePackageSourceEntries` 按预期失败。
- Green：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "process governance goal audit items|architecture migration status"` 通过，1 个测试文件、3 个测试。
- Green：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts --testNamePattern "handoff package|architecture migration status"` 通过，1 个测试文件、5 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、164 个测试。
- `pnpm test:unit`：通过，25 个测试文件、453 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/453、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2ce Package Source Smoke Contracts

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 package-owned source module 列表提升为公开 contract。
- `packages/acceptance/src/compatibility.ts` 新增 `acceptancePackageSourceEntries`，从 `acceptanceCompatibilityContract.packageOwnedModules` 派生 `packages/acceptance/src/<module>.ts` source paths。
- `packages/acceptance/src/run-acceptance.ts` 的 package subpath import smoke 现在嵌入 `expectedPackageSourceEntries`，并要求 package root 与 `@hardening-mcp/acceptance/compatibility` subpath 暴露的 `acceptancePackageSourceEntries` 与构建时合同完全一致。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 compatibility subpath 引用 `AcceptancePackageSourceEntry` 与 `acceptancePackageSourceEntries`，验证公开类型入口可解析 package source contract。
- 更新 package README、monorepo structure spec、ADR-0006 和 active migration goal，明确 package source contract 已被 runtime import smoke 和 type-resolution smoke 覆盖。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts --testNamePattern "package subpath import smoke|every acceptance package source module"` 因 runtime smoke 尚未覆盖 `acceptancePackageSourceEntries` 且 contract 尚未导出按预期失败。
- Red：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 因 package dist declaration 尚未导出 `AcceptancePackageSourceEntry` 与 `acceptancePackageSourceEntries` 按预期失败。
- Green：聚焦结构与 smoke 测试通过，2 个测试文件、4 个测试。
- Type smoke：重建 package 后同一 type-resolution smoke 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、74 个测试。
- `pnpm test:unit`：通过，25 个测试文件、453 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/453、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedPackageSourceEntries` 和 `acceptancePackageSourceEntries drift` 检查。

## 2026年6月21日 - Acceptance Package Phase 2cd Wrapper Source Smoke Contracts

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 `legacyAcceptanceWrapperSourceEntries` 纳入标准 smoke gates。
- `packages/acceptance/src/run-acceptance.ts` 的 package subpath import smoke 现在嵌入 `expectedLegacyWrapperSourceEntries`，并要求 package root 与 `@hardening-mcp/acceptance/compatibility` subpath 暴露的 `legacyAcceptanceWrapperSourceEntries` 与构建时合同完全一致。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 compatibility subpath 引用 `LegacyAcceptanceWrapperSourceEntry` 与 `legacyAcceptanceWrapperSourceEntries`，验证公开类型入口可解析 wrapper-source contract。
- 更新 package README、monorepo structure spec、ADR-0006 和 active migration goal，明确 wrapper-source contract 已被 runtime import smoke 和 type-resolution smoke 覆盖。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts --testNamePattern "package subpath import smoke|every acceptance package source module"` 因 runtime smoke 与 type-smoke 尚未覆盖 `legacyAcceptanceWrapperSourceEntries` 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、2 个测试。
- Type smoke：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、74 个测试。
- `pnpm test:unit`：通过，25 个测试文件、453 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/453、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedLegacyWrapperSourceEntries` 和 `legacyAcceptanceWrapperSourceEntries drift` 检查。

## 2026年6月21日 - Acceptance Package Phase 2cc Legacy Wrapper Source Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 legacy wrapper source 文件列表提升为 package-owned compatibility contract。
- `packages/acceptance/src/compatibility.ts` 新增 `legacyAcceptanceWrapperSourceEntries`，从 `legacyAcceptanceCompatibilityModules` 派生 `src/internal/acceptance/<module>.ts` wrapper source paths。
- `packages/acceptance/src/goal-audit-sources.ts` 现在通过 `legacyAcceptanceWrapperSourceEntries` 构造 legacy wrapper source paths，不再在 source collection 内部手写 `src/internal/acceptance/${moduleName}.ts`。
- `tests/unit/project-structure.test.ts` 新增真实文件集合校验，要求 `src/internal/acceptance/*.ts` 与 `legacyAcceptanceWrapperSourceEntries` 完全一致。
- 更新 package README、monorepo structure spec、ADR-0006 和 active migration goal，明确 wrapper source entries 由 compatibility contract 派生。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection|legacy acceptance wrapper source contract"` 因 `legacyAcceptanceWrapperSourceEntries` 尚未导出按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、3 个测试。
- 文档同步后聚焦结构集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection|legacy acceptance wrapper source contract|package export surface governance"` 通过，2 个测试文件、4 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts` 通过，3 个测试文件、164 个测试。
- `pnpm test:unit`：通过，25 个测试文件、453 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/453、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2cb Handoff Architecture Migration Status

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，让 `pnpm user:handoff` 生成的最终交接包直接呈现 `架构迁移` 审计项。
- `packages/acceptance/src/user-acceptance-handoff.ts` 新增 `architectureItems` 输入，并用同一张 goal audit item 表渲染 `## 架构迁移状态`，保持证据和下一步字段一致。
- `packages/acceptance/src/run-user-acceptance-handoff.ts` 现在从 goal audit items 中筛选 `category === '架构迁移'` 的条目并传入 handoff builder。
- `packages/acceptance/src/goal-audit-user-acceptance-materials.ts` 将 `architectureItems`、`## 架构迁移状态` 和 handoff 架构迁移状态测试纳入用户验收交接包材料审计。
- 更新 README、用户验收指南和验收清单，说明交接包现在集中呈现自动质量门禁、架构迁移状态、当前用户验收状态和人工确认边界。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts --testNamePattern "architecture migration|handoff package"` 因 handoff 尚未渲染 `## 架构迁移状态` 按预期失败。
- Green：同一聚焦测试通过，1 个测试文件、5 个测试。
- 聚焦 goal audit：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "architecture migration status|material requirements"` 通过，1 个测试文件、2 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts` 通过，2 个测试文件、133 个测试。
- `pnpm test:unit`：通过，25 个测试文件、452 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/452、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2ca Goal Audit Exact Export Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，让 `pnpm goal:audit` 生成报告中的 `Acceptance package typed module exports` 证据直接说明 exact package export surface。
- `packages/acceptance/src/goal-audit-process-governance.ts` 的通过证据现在说明 root workspace dependency、`acceptancePackageExportEntries` 精确匹配、typed dist entrypoints 和 no unexpected package exports。
- `tests/unit/goal-audit.test.ts` 更新 process governance passed-path 断言，防止生成型 goal audit 报告回退到只描述 typed subpath exports 的旧证据。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "process governance"` 因实现仍输出旧 evidence 按预期失败。
- Green：同一聚焦测试通过，2 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、134 个测试。
- `pnpm test:unit`：通过，25 个测试文件、450 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/450、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；架构迁移表中的 `Acceptance package typed module exports` 已输出 exact package export surface 证据。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bz Export Surface Governance Document Sync

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 exact package export surface 审计语义同步到 active migration goal、monorepo structure spec、ADR-0006 和 package README。
- `docs/goals/active/2026-06-20-acceptance-package-migration.md` 现在记录 goal audit typed package export checks 由 `acceptancePackageExportEntries` 派生，并会拒绝缺失、路径不一致或 unexpected `packages/acceptance/package.json` exports。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 和 `docs/adr/0006-package-build-strategy.md` 现在明确 package export map 是 exact package export surface。
- `packages/acceptance/README.md` 统一使用 exact package export surface 表述，避免和 goal/spec/ADR 使用不同概念名。
- `tests/unit/project-structure.test.ts` 新增结构测试，要求 active goal、monorepo spec、ADR 和 package README 都记录 exact package export surface 与 unexpected export 审计边界。
- 同步当前用户验收指南和验收清单中的 unit 数量到 25 个测试文件、450 个测试。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "package export surface governance"` 因 active goal、monorepo spec、ADR 尚未记录 `exact package export surface` 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 聚焦文档结构集合：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection|package export surface governance|phase 2 package split"` 通过，3 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts` 通过，2 个测试文件、134 个测试。
- `pnpm test:unit`：通过，25 个测试文件、450 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/450、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2by Exact Package Export Surface Audit

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移治理收口，把 `packages/acceptance/package.json` 的 typed exports 审计从“只检查缺失或路径不匹配”加强为“精确 package surface”检查。
- `packages/acceptance/src/goal-audit-process-governance.ts` 现在会基于 `acceptancePackageExportEntries` 拒绝未纳入 compatibility contract 的额外 package export，并报告 `unexpected export <path>`。
- `tests/unit/goal-audit.test.ts` 新增 Red/Green 单元测试，证明 `./experimental` 这类未登记 export 会让 `Acceptance package typed module exports` 审计项变为 missing。
- `tests/unit/project-structure.test.ts` 新增结构约束，要求 process governance 保留 `unexpected export` 检查。
- `packages/acceptance/README.md` 明确 package typed export audit 是精确导出面检查：缺失、路径不一致或意外 export 都会让 goal audit 失败。
- 同步当前用户验收指南和验收清单中的 unit 数量到 25 个测试文件、449 个测试。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "outside the compatibility contract"` 因额外 `./experimental` export 仍被判定为通过按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 聚焦 process governance：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "process governance"` 通过，2 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、133 个测试。
- package subpath 聚焦 smoke：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath"` 通过，1 个测试文件、2 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、449 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/449、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bx Runner Main Specifier Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 runner `main()` smoke 需要导入的 runner subpath 列表从手写数组改为从 entrypoint contract 派生。
- `packages/acceptance/src/compatibility.ts` 的 `acceptanceRunnerMainSpecifiers` 现在从 `acceptanceEntrypointFiles` 的文件名派生 package specifier，避免 runner entrypoint 文件和 smoke 校验 specifier 分叉。
- `packages/acceptance/README.md` 新增说明，明确 `acceptanceRunnerMainSpecifiers` 由 `acceptanceEntrypointFiles` 派生。
- `tests/unit/project-structure.test.ts` 新增结构测试，要求 runner main smoke specifiers 使用 `Object.values(acceptanceEntrypointFiles)` 派生，并禁止重新引入手写 runner subpath 列表。
- 同步当前用户验收指南和验收清单中的 unit 数量到 25 个测试文件、448 个测试。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "runner main smoke specifiers"` 因 `acceptanceRunnerMainSpecifiers` 仍手写 runner subpath 数组按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 聚焦 package subpath smoke：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts` 通过，2 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、448 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/448、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bw Runtime Contract Specifiers

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 package runtime contract smoke 需要校验的 root/compatibility subpath 列表提升为 package compatibility contract。
- `packages/acceptance/src/compatibility.ts` 新增 `acceptanceRuntimeContractSpecifiers`，从 package name 派生 `@hardening-mcp/acceptance` 和 `@hardening-mcp/acceptance/compatibility`。
- `packages/acceptance/src/run-acceptance.ts` 的 runtime smoke script 现在嵌入 `runtimeContractSpecifiers`，不再手写 root/compatibility subpath 数组。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 compatibility subpath 引用 `acceptanceRuntimeContractSpecifiers`，验证公开类型入口可解析该 contract。
- 更新 package README 与结构测试，明确 runtime contract smoke 的校验 specifier 列表由 package contract 派生。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 smoke script 尚未包含 `runtimeContractSpecifiers` 且仍手写 root/compatibility 数组按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、43 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、447 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/447、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `runtimeContractSpecifiers`。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bv Runtime Smoke Legacy Dist Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 `legacyAcceptanceDistOutputEntries` 纳入 package subpath import smoke 的运行时校验。
- `packages/acceptance/src/run-acceptance.ts` 的 runtime smoke script 现在嵌入 `expectedLegacyDistOutputEntries`，并要求 package root 与 `@hardening-mcp/acceptance/compatibility` subpath 暴露的 `legacyAcceptanceDistOutputEntries` 与构建时合同完全一致。
- `tests/unit/acceptance-report.test.ts` 新增断言，要求 smoke script 保留 `expectedLegacyDistOutputEntries`、`mod.legacyAcceptanceDistOutputEntries` 和 `legacyAcceptanceDistOutputEntries drift` 漂移检查。
- 更新 package README 与结构测试，明确 all-subpath package import smoke 同时验证 `acceptancePackageExportEntries` 和 `legacyAcceptanceDistOutputEntries` runtime contracts。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 smoke script 尚未校验 `legacyAcceptanceDistOutputEntries` runtime contract 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、43 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、447 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/447、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedLegacyDistOutputEntries` 和 `legacyAcceptanceDistOutputEntries drift` 检查。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bu Legacy Dist Output Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 `dist/internal/acceptance/*` 兼容输出路径提升为 package compatibility contract。
- `packages/acceptance/src/compatibility.ts` 新增 `legacyAcceptanceDistOutputEntries`、`LegacyAcceptanceDistOutputEntry` 和 `LegacyAcceptanceCompatibilityModule`，从 `legacyAcceptanceCompatibilityModules` 与 `acceptanceCompatibilityContract.legacyDistRoot` 派生 legacy `.js` / `.d.ts` 输出路径。
- `packages/acceptance/src/goal-audit-sources.ts` 现在从 `legacyAcceptanceDistOutputEntries` 派生 legacy dist JavaScript 和 declaration source specs，避免 goal audit 继续手写 `dist/internal/acceptance/${moduleName}` 路径。
- `tests/type-smoke/acceptance-package-subpaths.ts` 现在通过 package root 和 compatibility subpath 引用 `legacyAcceptanceDistOutputEntries` 与 `LegacyAcceptanceDistOutputEntry`，验证公开类型入口可解析该 contract。
- 更新 package README 和结构测试，明确 generated legacy dist outputs 由 package compatibility contract 描述。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "legacy acceptance dist outputs"` 因 `legacyAcceptanceDistOutputEntries` 尚不存在按预期失败。
- Green：同一聚焦结构测试通过。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、159 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、447 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/447、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bt Runtime Smoke Specifier Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，补强 package subpath import smoke 的内部自检。
- `packages/acceptance/src/run-acceptance.ts` 的 runtime smoke script 现在从 `expectedExportEntries.map((entry) => entry.specifier)` 生成 `expectedSpecifiers`，并要求实际 `specifiers` 与其完全一致，避免 smoke 脚本内部 import 列表与 export entry contract 分叉。
- `tests/unit/acceptance-report.test.ts` 新增断言，要求 smoke script 保留 `expectedSpecifiers` 和 `specifier list drift` 检查。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 smoke script 尚未校验 specifier list drift 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedSpecifiers` 和 `specifier list drift` 检查。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bs Runtime Smoke Export Entry Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 package subpath import smoke 从“只验证 subpath 可导入和 runner `main()`”扩展为运行时校验 `acceptancePackageExportEntries` 合同值。
- `packages/acceptance/src/run-acceptance.ts` 现在把 `acceptancePackageExportEntries` 嵌入 runtime smoke script，并要求 package root 与 `@hardening-mcp/acceptance/compatibility` subpath 暴露的 `acceptancePackageExportEntries` 与构建时合同完全一致。
- `tests/unit/acceptance-report.test.ts` 新增断言，要求 smoke script 保留 `expectedExportEntries`、`mod.acceptancePackageExportEntries` 和 `acceptancePackageExportEntries drift` 漂移检查。
- 更新 package README，记录 package import smoke 同时验证 root 与 compatibility subpath 的 runtime contract。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 smoke script 尚未校验 `acceptancePackageExportEntries` runtime contract 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E；acceptance report 中的 package subpath import smoke 已包含 `expectedExportEntries` 和 `acceptancePackageExportEntries drift` 检查。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2br Type Smoke Export Entry Type Coverage

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，补强 `tests/type-smoke/acceptance-package-subpaths.ts` 对 `AcceptancePackageExportEntry` 类型导出的覆盖。
- type-smoke 文件现在同时通过 package root API 和 `@hardening-mcp/acceptance/compatibility` subpath 引用 `AcceptancePackageExportEntry` 类型，并用这些类型约束 `packageExportEntryContracts`。
- `tests/unit/project-structure.test.ts` 新增结构门禁，要求 type-smoke 保持 `acceptance.AcceptancePackageExportEntry` 和 `compatibility.AcceptancePackageExportEntry` 类型覆盖。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 因 type-smoke 尚未引用 `AcceptancePackageExportEntry` 类型按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- Type smoke：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts` 通过，2 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bq Type Smoke Export Entry Coverage

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，补强 `tests/type-smoke/acceptance-package-subpaths.ts` 对 `acceptancePackageExportEntries` typed export 的覆盖。
- type-smoke 文件现在同时通过 package root API 和 `@hardening-mcp/acceptance/compatibility` subpath 引用 `acceptancePackageExportEntries`，验证新 export entry contract 的声明可通过两个公开入口解析。
- `tests/unit/project-structure.test.ts` 新增结构门禁，要求 type-smoke 保持 `packageExportEntryContracts`、`acceptance.acceptancePackageExportEntries` 和 `compatibility.acceptancePackageExportEntries` 覆盖。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 因 type-smoke 尚未引用 `acceptancePackageExportEntries` 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- Type smoke：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 通过。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts` 通过，2 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bp Goal Audit Export Entry Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 goal audit 的 typed package export 审计从 `acceptanceCompatibilityContract.packageOwnedModules.map` 改为复用 `acceptancePackageExportEntries`。
- `packages/acceptance/src/goal-audit-process-governance.ts` 现在使用同一 export entry contract 检查 package export path、types path 与 runtime path，避免 goal audit、runtime smoke、type smoke 和 package.json 结构测试各自派生 export 规则。
- `tests/unit/project-structure.test.ts` 新增结构门禁，要求 process governance 使用 `acceptancePackageExportEntries`，并禁止回退到 `acceptanceCompatibilityContract.packageOwnedModules.map`。
- 更新 package README，记录 goal audit typed package export checks 使用 `acceptancePackageExportEntries`。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection"` 因 process governance 尚未引用 `acceptancePackageExportEntries` 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts` 通过，3 个测试文件、145 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bo Package Export Entry Contract

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 package subpath/export 的派生规则提升为 `acceptancePackageExportEntries` 共享契约。
- `acceptancePackageSubpathSpecifiers` 现在从 `acceptancePackageExportEntries` 派生，避免 package export path、types path、runtime path 与 runtime import smoke 分别维护。
- `tests/unit/acceptance-report.test.ts` 新增 package export entries 契约断言，要求该共享契约与 `packages/acceptance/package.json` exports 完全一致。
- `tests/unit/project-structure.test.ts` 新增精确结构门禁，要求 `package.json` exports 与 `acceptancePackageExportEntries` 一一对应，防止额外或遗漏的 package export 漂移。
- 更新 package README，记录 package export entries 与 package-owned module contract 共享同一兼容表面。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 `acceptancePackageExportEntries` 尚未存在按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 结构聚焦测试：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bn Typed Source Spec Indexing

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，移除 `goal-audit-process-governance.ts` 中对 legacy source spec key 的 `as GoalAuditTextSourceKey` 类型断言。
- `buildLegacyAcceptanceWrapperGoalAuditItem()` 和 `buildLegacyAcceptanceDistOutputGoalAuditItem()` 现在直接使用 typed source spec key 索引 `GoalAuditTextSources`，让 source spec key 的正确性由类型系统验证。
- `tests/unit/project-structure.test.ts` 新增结构门禁，禁止 process governance 重新引入 `as GoalAuditTextSourceKey`。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection"` 因 process governance 仍包含 `as GoalAuditTextSourceKey` 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- `pnpm typecheck`：通过。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、158 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm lint`：通过。
- `pnpm build`：通过。

## 2026年6月21日 - Acceptance Package Phase 2bm Legacy Text Source Path Contract Ratchet

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 `GOAL_AUDIT_TEXT_SOURCE_PATHS` 里的 legacy wrapper、legacy dist JavaScript、legacy dist declaration path entries 从手写字段改为从 `legacyAcceptanceCompatibilityModules` 派生。
- `packages/acceptance/src/goal-audit-sources.ts` 新增 `buildLegacyAcceptanceTextSourcePaths()`，通过 `legacyAcceptanceSourceKey()`、`legacyDistAcceptanceSourceKey()` 和 `legacyDistAcceptanceDeclarationSourceKey()` 生成 legacy path entries。
- 使用 template literal types 约束 legacy source key 形状，保留 `GOAL_AUDIT_TEXT_SOURCE_PATHS` 对 `legacyAcceptanceRunUserAcceptance` 等键的类型可见性。
- `tests/unit/project-structure.test.ts` 更新结构门禁，要求 legacy path entries 使用生成 helper，并禁止回退到手写 fatal-error legacy path entries。
- 更新 package README 和 active migration goal，记录 legacy text source paths、source specs 与 dist compatibility evidence 共享同一模块契约。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 因 `buildLegacyAcceptanceTextSourcePaths()` 尚未存在且 legacy path entries 仍为手写按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 受影响单元集合首次运行暴露旧结构断言仍期待手写 legacy path entries，更新断言后通过：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts`，3 个测试文件、158 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bl Legacy Source Spec Contract Ratchet

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 legacy wrapper、legacy dist JavaScript、legacy dist declaration 三组 source specs 从手写数组改为从共享 `legacyAcceptanceCompatibilityModules` 派生。
- `packages/acceptance/src/compatibility.ts` 新增 `legacyAcceptanceCompatibilityModules`，作为 `src/internal/acceptance/*` 兼容 wrapper 和 `dist/internal/acceptance/*` 兼容输出的单一模块契约。
- `packages/acceptance/src/goal-audit-sources.ts` 现在通过 `legacyAcceptanceSourceKey()`、`legacyDistAcceptanceSourceKey()` 和 `legacyDistAcceptanceDeclarationSourceKey()` 生成三组 source specs，并保持既有 source spec 顺序。
- `tests/unit/project-structure.test.ts` 新增结构门禁，要求 legacy source specs 从共享 contract 派生，并禁止回退到独立手写 legacy source tuple。
- 更新 package README 和 active migration goal，记录 legacy compatibility source specs 使用共同模块契约。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 因 `legacyAcceptanceCompatibilityModules` 尚未从 package root API 暴露按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 受影响单元集合首次运行暴露 source spec 顺序变化，调整 `legacyAcceptanceCompatibilityModules` 顺序以保持兼容后通过：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts`，3 个测试文件、158 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bk Goal Audit Export Contract Ratchet

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 goal audit 的 typed package export 审计从手写 export 清单改为从 `acceptanceCompatibilityContract.packageOwnedModules` 派生。
- `packages/acceptance/src/goal-audit-process-governance.ts` 现在只保留 package root export 作为固定项，其余 package-owned module exports 由共同模块契约生成。
- `tests/unit/project-structure.test.ts` 新增结构门禁，要求 process governance 审计引用 `acceptanceCompatibilityContract`，并禁止回退到独立手写 `./compatibility` export tuple。
- 更新 package README 和 active migration goal，记录 typed export 审计与 package subpath smoke 使用同一 package-owned module contract。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "goal audit source collection"` 因 process governance 尚未引用 `acceptanceCompatibilityContract` 按预期失败。
- Green：同一聚焦结构测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、158 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bj Subpath Contract Ratchet

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 package subpath import smoke 的手写 specifier 清单提升为 package 契约导出。
- `packages/acceptance/src/compatibility.ts` 新增 `acceptancePackageSubpathSpecifiers` 和 `acceptanceRunnerMainSpecifiers`，由 `acceptanceCompatibilityContract.packageOwnedModules` 生成 package root 与全部 package-owned subpath。
- `packages/acceptance/src/run-acceptance.ts` 现在用 package 契约常量生成 runtime import smoke 脚本，避免 runner 内部维护第二份 subpath 清单。
- `tests/unit/project-structure.test.ts` 现在要求 package source 模块、`acceptanceCompatibilityContract.packageOwnedModules`、`packages/acceptance/package.json` exports、root API re-export、type-smoke imports 和 runtime smoke specifier contract 保持一致。
- 更新 package README 和 active migration goal，记录 package-owned module contract 是结构测试与 import smoke 的共同来源。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 `acceptancePackageSubpathSpecifiers` 尚未从 package root API 暴露按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 聚焦结构测试：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、70 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、package subpath import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bi Package Type Resolution Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，在 runtime all-subpath import smoke 之外新增 package subpath type-resolution smoke。
- 新增 `tests/type-smoke/acceptance-package-subpaths.ts`，通过 package root 和全部 `@hardening-mcp/acceptance/*` subpath 导入验证 TypeScript 能从 package `types` entries 解析声明。
- `packages/acceptance/src/run-acceptance.ts` 新增 `Package subpath type-resolution smoke` 标准验收命令，运行 `tsc --ignoreConfig --noEmit` 检查 type-smoke 文件。
- `buildAcceptanceRunQualityGateRequirement()` 现在要求 full acceptance 报告同时包含 `Package subpath import smoke` 和 `Package subpath type-resolution smoke`。
- 更新 README、package README、ADR-0006、monorepo structure spec、active goal、用户验收指南和验收清单，将 full/browser acceptance 当前门禁更新为 17/17。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "type-resolution smoke"` 因 `buildPackageSubpathTypeResolutionSmokeCommand()` 尚不存在按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- Type smoke：`node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node tests/type-smoke/acceptance-package-subpaths.ts` 通过。
- 聚焦 goal audit：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts --testNamePattern "type-resolution smoke|acceptance run quality gate|current goal audit item sequence"` 通过，2 个测试文件、3 个测试。
- `pnpm test:unit`：通过，25 个测试文件、446 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17；包含 unit 25/446、all-subpath package import smoke 30/30、package subpath type-resolution smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；质量门禁已要求 package subpath type-resolution smoke。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bh Legacy Dist Declaration Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 `dist/internal/acceptance/*` 兼容输出门禁从 `.js` runtime wrapper 扩展到 `.d.ts` declaration re-export。
- `packages/acceptance/src/goal-audit-sources.ts` 新增 `LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`，并让 `readGoalAuditTextSources()` 读取 12 个 `dist/internal/acceptance/*.d.ts` 声明输出。
- `buildProcessGovernanceGoalAuditItems()` 的 `Legacy acceptance dist compatibility outputs` 审计项现在同时要求 `.js` 和 `.d.ts` 输出都委托到 `packages/acceptance/dist/*`。
- 更新 package README、ADR-0006、monorepo structure spec 和 active goal，明确 legacy dist compatibility outputs 包含 runtime wrappers 与 declaration re-exports。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/goal-audit.test.ts --testNamePattern "source collection helpers|declaration outputs|workspace sources|process governance"` 因 declaration source specs 尚不存在按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、6 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、158 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、445 个测试。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 unit 25/445、all-subpath package import smoke 30/30、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；`Legacy acceptance dist compatibility outputs` 证据已覆盖 `.js` 和 `.d.ts`。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bg All Subpath Smoke Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，将 acceptance 质量门禁中的 package subpath import smoke 从 4 个 runner subpath 扩展为 package root 加所有 package-owned implementation module subpaths。
- `packages/acceptance/src/run-acceptance.ts` 现在会导入 30 个 `@hardening-mcp/acceptance` package export，要求每个 subpath 存在 runtime exports，并继续要求 4 个 runner subpath 暴露 `main()`。
- `buildProcessGovernanceGoalAuditItems()` 的架构迁移审计项从 `Acceptance package typed runner exports` 升级为 `Acceptance package typed module exports`，解析 `packages/acceptance/package.json` 并检查所有 package-owned module subpath 的 `types` 与 `default` dist entrypoint。
- 更新 README、ADR-0006、monorepo structure spec、active goal、用户验收指南和验收清单，记录 all-subpath package import smoke 已进入标准验收门禁。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 smoke 命令只包含 runner subpaths 按预期失败。
- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "process governance"` 因 goal audit 仍使用 runner-only 审计项按预期失败。
- Green：上述两个聚焦测试在实现 all-subpath smoke 与 typed module export 审计后通过。
- Runtime smoke：`node --input-type=module -e <all-subpath import smoke>` 通过，30 个 package subpath imports 可解析。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，4 个测试文件、171 个测试。
- `pnpm test:unit`：通过，25 个测试文件、444 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 unit 25/444、all-subpath package import smoke 30/30、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认；架构迁移审计项已更新为 `Acceptance package typed module exports`。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bf Source Export Ratchet

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，新增枚举式结构门禁，防止后续新增 `packages/acceptance/src/*.ts` 模块时漏掉 package subpath export、package root API re-export 或 legacy compatibility wrapper 边界。
- `tests/unit/project-structure.test.ts` 现在从文件系统推导 `packages/acceptance/src` 模块清单，并要求每个 implementation module 都存在 `packages/acceptance/package.json` 的 typed subpath export 和 `packages/acceptance/src/index.ts` re-export。
- 同一结构测试也从文件系统推导 `src/internal/acceptance/*.ts` legacy 模块清单，要求旧路径继续委托到 `packages/acceptance/dist/*`，且不能重新引入 `src/shared` 或 `src/domain` 等实现依赖。
- 更新用户验收指南和验收清单中的 unit 测试计数为 25 个测试文件、444 个测试。

### 验证

- Characterization：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "every acceptance package source module"` 通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、157 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，25 个测试文件、444 个测试。
- `pnpm build`：通过。
- `pnpm lint`：首次发现新增结构测试存在未使用变量，修复后通过。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 unit 25/444、package subpath import smoke、integration 11/27、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2be Benchmark Ownership Scope Clarification

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，修正 benchmark report ownership 与 acceptance package 迁移范围的文档边界。
- `packages/acceptance/README.md` 不再把 `src/internal/benchmark` 迁移列为 acceptance package deferred responsibility，而是明确 benchmark report ownership 保持在 `src/internal/benchmark`，等待单独 package 决策。
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md` 的 ownership table 现在将 Acceptance 与 Benchmark 分开，避免把 benchmark report 误归入 `packages/acceptance` 的当前迁移范围。
- 新增结构测试，防止 package README 或 monorepo spec 再次把 benchmark report 迁移误标为 acceptance package goal 的阻塞项。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "benchmark report ownership"` 因 package README 仍列出 `Move benchmark report logic out of src/internal/benchmark` 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts` 通过，5 个测试文件、197 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、443 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 package subpath import smoke、integration、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bd Active Goal Status Alignment

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，修正 active migration goal 文档中过期的 Current State。
- `docs/goals/active/2026-06-20-acceptance-package-migration.md` 现在记录 Phase 2 implementation modules 已迁入 `packages/acceptance/src`，`src/internal/acceptance/*` 为兼容 wrapper，`dist/internal/acceptance/*` 为兼容输出。
- Success Definition 中 full/browser acceptance 期望从旧的 15/15 更新为当前 16/16。
- 将原“仍未完成”模块清单改为“剩余外部条件”，明确当前剩余项是用户人工验收结论，而不是 acceptance package 模块迁移缺口。
- 新增结构测试，防止 active migration goal 文档再次回退为旧状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "active acceptance package migration goal"` 因 active goal 文档仍列出旧模块未完成状态并写 15/15 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts` 通过，5 个测试文件、196 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、442 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 package subpath import smoke、integration、benchmark 5/5 Go 和真实 Chromium trace E2E。

## 2026年6月21日 - Acceptance Package Phase 2bc Goal Audit Legacy Dist Output Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 `dist/internal/acceptance/*` 兼容输出从构建副作用提升为 goal audit 架构迁移门禁。
- `readGoalAuditTextSources()` 现在读取 12 个 `dist/internal/acceptance/*.js` 兼容输出文件。
- 新增 `LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS` 并从 package root API 暴露，供 goal audit 和后续结构检查复用。
- `buildProcessGovernanceGoalAuditItems()` 新增 `Legacy acceptance dist compatibility outputs` 检查项，要求 legacy dist 输出全部委托到 `packages/acceptance/dist`。
- 更新 README，将 `src/internal/acceptance/` 和 `dist/internal/acceptance/` 明确标注为兼容 wrapper/output 路径，当前验收实现从 `packages/acceptance/` 追踪。
- 更新用户验收指南和验收清单中的 goal audit 摘要为 28 项检查、27 项自动证据通过、0 项缺失、1 项需人工确认。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "process governance|current goal audit"` 因 dist compatibility output 门禁尚未实现按预期失败，6 个失败断言覆盖 process governance 与 current goal audit 总数。
- Green：同一聚焦测试通过，2 个测试文件、6 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts tests/unit/project-structure.test.ts` 通过，5 个测试文件、195 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、441 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 package subpath import smoke、integration、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，28 项检查、27 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 27、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2bb Goal Audit Typed Runner Export Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 typed runner package exports 从实现事实提升为 goal audit 架构迁移门禁。
- `readGoalAuditTextSources()` 现在读取 `packages/acceptance/package.json`，使 goal audit 能检查 package-owned runner subpath exports。
- `buildProcessGovernanceGoalAuditItems()` 新增 `Acceptance package typed runner exports` 检查项，要求根 `package.json` 使用 `@hardening-mcp/acceptance: workspace:*`，并要求四个 runner subpath 均声明 `types` 与 `default` dist entrypoint。
- 更新 `tests/unit/goal-audit.test.ts` 和 `tests/unit/acceptance-package.test.ts`，将 process governance 审计项从 4 项扩展到 5 项，并将当前 goal audit 自动检查总数从 26 项扩展到 27 项。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "process governance|current goal audit"` 因新门禁尚未实现按预期失败，6 个失败断言覆盖 process governance 与 current goal audit 总数。
- Green：同一聚焦测试通过，2 个测试文件、6 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts` 通过，4 个测试文件、171 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、441 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 package subpath import smoke、integration、benchmark 5/5 Go 和真实 Chromium trace E2E。
- `pnpm goal:audit`：通过，27 项检查、26 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新交接包与 goal audit 摘要，自动证据通过 26、缺失 0、需人工确认 1。

## 2026年6月21日 - Acceptance Package Phase 2ba Goal Audit Package Subpath Gate Evidence

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 package subpath import smoke 纳入 goal audit 质量门禁证据要求。
- `buildAcceptanceRunQualityGateRequirement()` 现在要求 `docs/acceptance/acceptance-run.md` 同时包含 `Package subpath import smoke`、integration、benchmark 和真实 Chromium trace E2E 证据。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖缺少 package subpath import smoke 时应判定 `完整验收门禁通过` 缺失。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "acceptance run quality gate"` 因 goal audit 尚未检查 `Package subpath import smoke` 按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts` 通过，3 个测试文件、143 个测试。
- `pnpm test:unit`：通过，25 个测试文件、441 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；goal audit 所需的 Package subpath import smoke、integration、benchmark 和真实 Chromium trace E2E 均在验收报告中。

## 2026年6月21日 - Acceptance Package Phase 2az Package Subpath Import Acceptance Gate

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，把 package subpath import smoke 从手动验证沉淀为正式 acceptance 质量门禁。
- `packages/acceptance/src/run-acceptance.ts` 新增 `buildPackageSubpathImportSmokeCommand()`，标准 acceptance 会用 Node 动态导入四个 runner 子路径并验证均导出 `main()`。
- `packages/acceptance/src/index.ts` 从 root API 暴露 `buildPackageSubpathImportSmokeCommand()`。
- 更新 `tests/unit/acceptance-report.test.ts`，以 TDD 守护 smoke command 的命令名、分类、必需性和四个完整 package subpath。
- 更新 package README、ADR-0006、monorepo structure spec、README 和用户验收指南，记录 package subpath import smoke 已进入标准验收门禁。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts --testNamePattern "package subpath import smoke"` 因 `buildPackageSubpathImportSmokeCommand()` 未实现按预期失败。
- Green：同一聚焦测试通过，1 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、66 个测试。
- `pnpm test:unit`：通过，25 个测试文件、441 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，16/16；包含 Package subpath import smoke、benchmark 5/5 Go、真实 Chromium trace E2E 通过。

## 2026年6月21日 - Acceptance Package Phase 2ay Typed Runner Package Exports

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，补强 package exports 证据。
- `packages/acceptance/package.json` 中 `./run-acceptance`、`./run-goal-audit`、`./run-user-acceptance`、`./run-user-acceptance-handoff` 现在全部声明 `types` 与 `default`，不再使用字符串 export。
- 根 `package.json` 现在通过 `@hardening-mcp/acceptance: workspace:*` 链接 acceptance package，并更新 `pnpm-lock.yaml`。
- `packages/acceptance/src/index.ts` 现在从 root API 暴露 `LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS`，让 wrapper audit 调用方不需要依赖内部子路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，守护 typed runner subpath exports 与 root wrapper spec export。
- 更新 package README、ADR-0006 和 monorepo structure spec，记录 runner typed exports 与 wrapper source spec root API。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "source collection helpers|workspace package"` 因 root index 未导出 wrapper source specs、runner subpath exports 仍是字符串按预期失败。
- Green：同一聚焦测试通过，2 个测试。
- 受影响单元集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts` 通过，3 个测试文件、154 个测试。
- `pnpm test:unit`：通过，25 个测试文件、440 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Workspace import smoke：`node --input-type=module -e '...'` 验证 `@hardening-mcp/acceptance/run-acceptance`、`run-goal-audit`、`run-user-acceptance`、`run-user-acceptance-handoff` 均可解析并导出 `main()`。

## 2026年6月21日 - Acceptance Package Phase 2ax Goal Audit Legacy Wrapper Coverage

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移收口，补强 goal audit 自动化覆盖。
- 新增 `LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS`，让 goal audit 明确读取每个 `src/internal/acceptance/*.ts` legacy compatibility file。
- `buildProcessGovernanceGoalAuditItems()` 现在额外产出 `架构迁移: Legacy acceptance 兼容 wrapper` 检查项；任何 legacy 文件未委托到 `packages/acceptance/dist/*` 时会列出具体路径并失败。
- 同步 `tests/unit/goal-audit.test.ts`、`tests/unit/acceptance-package.test.ts`、`tests/unit/project-structure.test.ts`，守护新增审计项和 legacy source 只作为 wrapper 审计来源出现。
- 更新 package README 和 monorepo structure spec，记录 wrapper-audit source list 的定位。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "source collection|process governance|current goal audit items"` 因 `LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS` 未实现、当前 goal audit 仍为 25 项按预期失败。
- Green：同一聚焦测试通过，5 个测试。
- 受影响单元：`pnpm vitest run tests/unit/goal-audit.test.ts` 通过，102 个测试。
- `pnpm test:unit`：通过，25 个测试文件、440 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。

## 2026年6月21日 - Acceptance Package Phase 2aw Legacy User Acceptance Runner Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择最后一个 legacy run-user-acceptance wrapper 切片。
- `packages/acceptance/src/run-user-acceptance.ts` 现在导出 `isDirectRun`，root package index 以 `isUserAcceptanceDirectRun` 暴露该 helper。
- `src/internal/acceptance/run-user-acceptance.ts` 现在 re-export `packages/acceptance/dist/run-user-acceptance.js` 和 `packages/acceptance/dist/user-acceptance-runner-helpers.js`，不再保留真实项目验收 runner 的重复实现。
- 保留 direct-run shim，确保直接执行 legacy `dist/internal/acceptance/run-user-acceptance.js` 仍会调用 package-owned `main()` 并使用统一 fatal error formatter。
- 更新 `tests/unit/project-structure.test.ts` 和 `tests/unit/acceptance-package.test.ts`，守护 package direct-run export、legacy wrapper 和 direct-run shim。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 run-user-acceptance legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts tests/unit/user-acceptance.test.ts --testNamePattern "legacy user acceptance runner|user acceptance runner implementation|runner helpers compatible|prints acceptance help"` 因 package direct-run helper 未导出且 legacy run-user-acceptance 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，3 个测试文件、3 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、103 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、440 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/run-user-acceptance.js` 与 `packages/acceptance/dist/run-user-acceptance.js`、`packages/acceptance/dist/user-acceptance-runner-helpers.js` 导出同一个真实项目验收 runner/helper；直接执行 `node dist/internal/acceptance/run-user-acceptance.js --help` 通过并输出 help。
- Legacy implementation sweep：`src/internal/acceptance/*.ts` 全部为 package dist wrapper。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2av Legacy Goal Audit Runner Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy run-goal-audit wrapper 切片。
- `packages/acceptance/src/run-goal-audit.ts` 现在导出 `isDirectRun`，root package index 以 `isGoalAuditDirectRun` 暴露该 helper。
- `src/internal/acceptance/run-goal-audit.ts` 现在 re-export `packages/acceptance/dist/run-goal-audit.js`，不再保留旧的 goal audit runner 大实现。
- 保留 direct-run shim，确保直接执行 legacy `dist/internal/acceptance/run-goal-audit.js` 仍会调用 package-owned `main()` 并使用统一 fatal error formatter。
- 更新 `tests/unit/project-structure.test.ts` 和 `tests/unit/acceptance-package.test.ts`，守护 package direct-run export、legacy wrapper 和 direct-run shim。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 run-goal-audit legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts tests/unit/goal-audit.test.ts --testNamePattern "legacy goal audit runner|goal audit runner implementation|runGoalAudit"` 因 package direct-run helper 未导出且 legacy run-goal-audit 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、2 个测试，1 个测试文件按 pattern skip。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、153 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、439 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/run-goal-audit.js` 与 `packages/acceptance/dist/run-goal-audit.js` 导出同一个 goal audit runner helper；直接执行 `node dist/internal/acceptance/run-goal-audit.js` 通过并输出 goal audit。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2au Legacy User Acceptance Handoff Runner Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy run-user-acceptance-handoff wrapper 切片。
- `packages/acceptance/src/run-user-acceptance-handoff.ts` 现在导出 `isDirectRun`，root package index 以 `isUserAcceptanceHandoffDirectRun` 暴露该 helper。
- `src/internal/acceptance/run-user-acceptance-handoff.ts` 现在 re-export `packages/acceptance/dist/run-user-acceptance-handoff.js`，不再保留用户验收交接 runner 的重复实现。
- 保留 direct-run shim，确保直接执行 legacy `dist/internal/acceptance/run-user-acceptance-handoff.js` 仍会调用 package-owned `main()` 并使用统一 fatal error formatter。
- 更新 `tests/unit/project-structure.test.ts` 和 `tests/unit/acceptance-package.test.ts`，守护 package direct-run export、legacy wrapper 和 direct-run shim。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 run-user-acceptance-handoff legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/user-acceptance-handoff.test.ts --testNamePattern "legacy user acceptance handoff runner|package-owned handoff runner helpers compatible|prints help"` 因 package direct-run helper 未导出且 legacy run-user-acceptance-handoff 仍是重复实现按预期失败。
- Green：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "legacy user acceptance handoff runner|package-owned handoff runner helpers compatible|prints help|user acceptance handoff runner implementation"` 通过，3 个测试文件、4 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、77 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、438 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/run-user-acceptance-handoff.js` 与 `packages/acceptance/dist/run-user-acceptance-handoff.js` 导出同一个用户验收交接 runner helper；直接执行 `node dist/internal/acceptance/run-user-acceptance-handoff.js --help` 通过并输出 help。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2at Legacy Acceptance Runner Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy run-acceptance wrapper 切片。
- `src/internal/acceptance/run-acceptance.ts` 现在 re-export `packages/acceptance/dist/run-acceptance.js`，不再保留 acceptance runner 的重复实现。
- 保留 direct-run shim，确保直接执行 legacy `dist/internal/acceptance/run-acceptance.js` 仍会调用 package-owned `main()` 并使用统一 fatal error formatter。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy run-acceptance wrapper 和 direct-run shim。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 run-acceptance legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts --testNamePattern "legacy acceptance runner|acceptance runner helpers compatible|direct execution|prints acceptance help"` 因 legacy run-acceptance 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、4 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、62 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、437 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/run-acceptance.js` 与 `packages/acceptance/dist/run-acceptance.js` 导出同一个 acceptance runner helper；直接执行 `node dist/internal/acceptance/run-acceptance.js --help` 通过并输出 help。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2as Legacy Goal Audit Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy goal-audit wrapper 切片。
- `src/internal/acceptance/goal-audit.ts` 现在 re-export `packages/acceptance/dist/goal-audit.js`，不再保留 goal audit summary 与 Markdown 渲染的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy goal-audit wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 goal-audit legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts --testNamePattern "legacy goal audit Markdown|goal audit output compatible|reports ready for user acceptance|reports incomplete|reports complete"` 因 legacy goal-audit 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、5 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、150 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、436 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/goal-audit.js` 与 `packages/acceptance/dist/goal-audit.js` 导出同一个 goal audit summary 与 Markdown helper，并保持敏感值脱敏。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ar Legacy User Acceptance Handoff Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy user-acceptance-handoff wrapper 切片。
- `src/internal/acceptance/user-acceptance-handoff.ts` 现在 re-export `packages/acceptance/dist/user-acceptance-handoff.js`，不再保留用户验收交接包 Markdown 的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy user-acceptance-handoff wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 user-acceptance-handoff legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/user-acceptance-handoff.test.ts --testNamePattern "legacy user acceptance handoff|handoff output compatible|handoff package"` 因 legacy user-acceptance-handoff 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、6 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、74 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、435 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/user-acceptance-handoff.js` 与 `packages/acceptance/dist/user-acceptance-handoff.js` 导出同一个用户验收交接包 Markdown helper，并保持敏感值脱敏。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2aq Legacy User Acceptance Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy user-acceptance wrapper 切片。
- `src/internal/acceptance/user-acceptance.ts` 现在 re-export `packages/acceptance/dist/user-acceptance.js`，不再保留真实项目用户验收记录 Markdown 与 summary 的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy user-acceptance wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 user-acceptance legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/user-acceptance.test.ts --testNamePattern "legacy user acceptance Markdown|user acceptance output|user acceptance record|summarizes required artifact checks"` 因 legacy user-acceptance 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、52 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、97 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、434 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/user-acceptance.js` 与 `packages/acceptance/dist/user-acceptance.js` 导出同一个真实项目用户验收 Markdown helper，并保持敏感值脱敏。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ap Legacy User Acceptance Args Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy user-acceptance-args wrapper 切片。
- `src/internal/acceptance/user-acceptance-args.ts` 现在 re-export `packages/acceptance/dist/user-acceptance-args.js`，不再保留真实项目用户验收参数解析与命令格式化的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy user-acceptance-args wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 user-acceptance-args legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/user-acceptance.test.ts --testNamePattern "legacy user acceptance args|user acceptance args|formatUserAcceptanceCommand|parseUserAcceptanceArgs"` 因 legacy user-acceptance-args 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、2 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、96 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、433 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/user-acceptance-args.js` 与 `packages/acceptance/dist/user-acceptance-args.js` 导出同一个用户验收 args parser 和 command formatter。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ao Legacy Report Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy report wrapper 切片。
- `src/internal/acceptance/report.ts` 现在 re-export `packages/acceptance/dist/report.js`，不再保留 acceptance summary 与 Markdown report 的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy report wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 report legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-report.test.ts --testNamePattern "legacy acceptance report|acceptance report"` 因 legacy report 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、14 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、57 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、432 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/report.js` 与 `packages/acceptance/dist/report.js` 导出同一个 acceptance report helper，并保持敏感值脱敏。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2an Legacy Repo Preflight Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy repo-preflight wrapper 切片。
- `src/internal/acceptance/repo-preflight.ts` 现在 re-export `packages/acceptance/dist/repo-preflight.js`，不再保留 repo root 与 `package.json` manifest 检查的重复实现。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy repo-preflight wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 repo-preflight legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/repo-preflight.test.ts --testNamePattern "legacy acceptance repo preflight|repo preflight"` 因 legacy repo-preflight 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、12 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/repo-preflight.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、54 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、431 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/repo-preflight.js` 与 `packages/acceptance/dist/repo-preflight.js` 导出同一个 repo preflight helper，并通过临时 repo 的 `package.json` manifest 检查。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2am Legacy Fatal Error Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy fatal-error wrapper 切片。
- `src/internal/acceptance/fatal-error.ts` 现在 re-export `packages/acceptance/dist/fatal-error.js`，不再直接依赖 root shared redaction。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy fatal-error wrapper。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 fatal-error legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/acceptance-fatal-error.test.ts --testNamePattern "legacy acceptance fatal error|formatAcceptanceFatalError"` 因 legacy fatal-error 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、3 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-fatal-error.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、430 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/fatal-error.js` 与 `packages/acceptance/dist/fatal-error.js` 导出同一个 fatal error formatter，并保持敏感值脱敏。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2al Legacy Markdown Wrapper

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 legacy markdown wrapper 切片。
- `src/internal/acceptance/markdown.ts` 现在 re-export `packages/acceptance/dist/markdown.js`，不再保留重复实现。
- `package.json` 的 `build` 调整为 `pnpm build:packages && pnpm build:src`，确保 legacy wrapper 编译前已有 package dist 和类型声明。
- `package.json` 的 `typecheck` 调整为先运行 `build:packages`，再检查 root `src` 和 package source。
- 更新 `tests/unit/project-structure.test.ts`，守护 legacy markdown wrapper 和 package-first build/typecheck 顺序。
- 更新 ADR-0006、monorepo structure spec 和 package README，记录 package-first 构建约束和 markdown legacy wrapper 状态。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/markdown-format.test.ts --testNamePattern "legacy acceptance markdown|markdown formatting"` 因 legacy markdown 仍是重复实现按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、5 个测试。
- 构建红灯：legacy wrapper 直接指向 `packages/acceptance/src/markdown.js` 时，`pnpm build` 因 root `src` build `rootDir` 限制失败。
- Green：legacy wrapper 改为指向 `packages/acceptance/dist/markdown.js`，并将 build/typecheck 调整为 package-first 后，聚焦测试、`pnpm typecheck`、`pnpm build` 通过。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/markdown-format.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、45 个测试。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、429 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist compatibility smoke：`dist/internal/acceptance/markdown.js` 与 `packages/acceptance/dist/markdown.js` 导出同一组 markdown helper function。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ak Acceptance Runner Root API

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 acceptance runner root API 切片。
- `packages/acceptance/src/index.ts` 现在暴露 acceptance runner 的 parse、help、command formatting、direct-run detection 和 CLI invocation helper。
- 更新 `tests/unit/acceptance-report.test.ts`，让当前 acceptance runner helper 测试从 package root API 读取，legacy runner 仅作为行为兼容对照。
- 更新 `tests/unit/acceptance-package.test.ts`，要求 package root API 暴露 `runAcceptanceCli`、`parseAcceptanceArgs`、`acceptanceHelpText`、`isAcceptanceHelpRequest` 和 `formatAcceptanceCommand`。
- 更新 ADR-0006 和 package README，记录 acceptance runner helper 已成为 package root 兼容 API。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "acceptance runner|acceptance report|direct execution|parses pnpm|prints acceptance help"` 因 package root 未导出 acceptance runner helper 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、18 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、53 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、428 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist export smoke：`parseAcceptanceArgs`、`formatAcceptanceCommand` 和 `isAcceptanceHelpRequest` 可从 `packages/acceptance/dist/index.js` 使用。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月20日 - Acceptance Package Migration Goal

### 完成内容

- 创建长期执行目标：`docs/goals/active/2026-06-20-acceptance-package-migration.md`。
- 明确后续迁移范围为 `packages/acceptance`，而不是一次性完成所有 monorepo package 迁移。
- 目标约束采用 TDD、测试金字塔、兼容优先和完整验收闭环。
- 当前 Codex active goal 已启动，目标是完成 acceptance package 后续迁移。

### 下一步

- 从低耦合模块开始，优先迁移 `report.ts`、`goal-audit.ts` 和 `user-acceptance.ts`。

## 2026年6月21日 - Acceptance Package Phase 2aj Compatibility Contract Export

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 compatibility contract export 切片。
- `packages/acceptance/package.json` 现在暴露 `./compatibility` subpath。
- `acceptanceCompatibilityContract.packageOwnedModules`、package README 和 monorepo structure spec 已将 `compatibility` 纳入 package-owned implementation modules。
- 更新 `tests/unit/acceptance-package.test.ts`，要求 package compatibility contract 自身进入 package-owned module 清单。
- 更新 `tests/unit/project-structure.test.ts`，守护 `./compatibility` subpath、README 和 monorepo structure spec 清单。
- 更新 ADR-0006，记录 compatibility contract 通过 package root 和 `./compatibility` subpath 暴露。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "compatibility|acceptance command ownership"` 因 compatibility 未进入 package-owned module 清单且缺少 `./compatibility` subpath 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、4 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、40 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、428 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist export smoke：`packages/acceptance/dist/compatibility.js` 可导出 compatibility contract，且 `resolveAcceptanceEntrypointUrl('acceptance')` 指向 package-owned dist runner。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ai Redaction Package Export

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择安全边界相关的低耦合 helper export 切片。
- `packages/acceptance/src/index.ts` 现在导出 `redactSensitiveText`。
- `packages/acceptance/package.json` 现在暴露 `./redaction` subpath。
- `acceptanceCompatibilityContract.packageOwnedModules`、package README 和 monorepo structure spec 已将 `redaction` 纳入 package-owned implementation modules。
- 更新 `tests/unit/privacy-redaction.test.ts`，让脱敏单元测试从 package API 读取，并验证 shared legacy helper 行为一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `redaction` 纳入 package contract、exports 和结构约束。
- 更新 ADR-0006，记录 redaction 和 shell quoting 均已成为 package-owned helper API。

### 验证

- Red：`pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "redact|redaction|acceptance command ownership"` 因 package index 未导出 `redactSensitiveText`、package contract 和 subpath 缺少 `redaction` 按预期失败。
- Green：同一聚焦测试通过，3 个测试文件、19 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、57 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、428 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist export smoke：`redactSensitiveText` 可从 `packages/acceptance/dist/index.js` 和 `packages/acceptance/dist/redaction.js` 使用。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ah Shell Quote Package Export

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择已存在但未公开的低耦合 helper export 切片。
- `packages/acceptance/src/index.ts` 现在导出 `shellQuoteArg`。
- `packages/acceptance/package.json` 现在暴露 `./shell-quote` subpath。
- `acceptanceCompatibilityContract.packageOwnedModules`、package README 和 monorepo structure spec 已将 `shell-quote` 纳入 package-owned implementation modules。
- 更新 `tests/unit/shell-quote.test.ts`，让 shell quoting 单元测试从 package API 读取，并验证 shared legacy helper 行为一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `shell-quote` 纳入 package contract、exports 和结构约束。
- 更新 ADR-0006，记录 shell quoting 已成为 package-owned helper API。

### 验证

- Red：`pnpm vitest run tests/unit/shell-quote.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "shell quote|acceptance command ownership"` 因 package index 未导出 `shellQuoteArg`、package contract 和 subpath 缺少 `shell-quote` 按预期失败。
- Green：同一聚焦测试通过，3 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/shell-quote.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、427 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist export smoke：`shellQuoteArg` 可从 `packages/acceptance/dist/index.js` 和 `packages/acceptance/dist/shell-quote.js` 使用。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2af Goal Audit Runner Helper API

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择低风险 API 兼容切片。
- `packages/acceptance/src/run-goal-audit.ts` 现在 re-export package-owned `REQUIRED_DOCUMENT_PATHS`、用户验收记录分类、accepted 判定和 acceptance-run freshness helper。
- 更新 `tests/unit/goal-audit.test.ts`，让当前 helper 兼容测试从 package runner 子路径读取，legacy runner 仅作为行为对照。
- 更新 `tests/unit/acceptance-package.test.ts`，把 goal audit runner helper API 纳入 package contract。
- 更新 package README、monorepo structure spec 和 ADR-0006，记录 package runner 子路径保持 legacy helper API shape。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts --testNamePattern "goal audit runner|compatible|compat"` 因 package runner 缺少 helper exports 按预期失败。
- Green：同一聚焦测试通过，2 个测试文件、6 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 通过，3 个测试文件、142 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、426 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。
- Dist resolver smoke：`resolveAcceptanceEntrypointUrl('acceptance')` 和 `resolveAcceptanceEntrypointUrl('goalAudit')` 均指向 `file:///repo/packages/acceptance/dist/*`。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。
- `rg --files packages/acceptance/src | rg '\.(js|js\.map|d\.ts)$'`：无输出，确认 package source 未混入生成产物。

## 2026年6月21日 - Acceptance Package Phase 2ag Entrypoint Resolution

### 完成内容

- 继续按 active goal 推进 acceptance package 迁移，选择 package wrapper 执行路径切片。
- 更新 `packages/acceptance/src/compatibility.ts`，让 `resolveAcceptanceEntrypointUrl()` 指向 package-owned `packages/acceptance/dist/*` runner，而不是 legacy `dist/internal/acceptance/*`。
- 保留 `acceptanceCompatibilityContract.legacyDistRoot = dist/internal/acceptance`，明确 legacy dist 仍是兼容输出面，不再是 package wrapper 的执行目标。
- 更新 `tests/unit/acceptance-package.test.ts`，要求 package wrapper resolver 返回 package-owned dist entrypoints。
- 更新 `tests/unit/project-structure.test.ts`，守护 `compatibility.ts` 不再包含 `../../../dist/internal/acceptance` 运行解析。
- 更新 package README、monorepo structure spec 和 ADR-0006，记录 package execution path 与 legacy output surface 的分离。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts --testNamePattern "package wrapper|acceptance command ownership"` 因 resolver 仍指向 legacy dist 按预期失败。
- Green：同一聚焦测试通过，2 个测试。
- 受影响结构/单元集合：`pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，2 个测试文件、40 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、426 个测试。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；benchmark 5/5 Go，真实 Chromium trace E2E 通过。

## 2026年6月20日 - Acceptance Package Phase 2d Goal Audit Module

### 完成内容

- 新增 `packages/acceptance/src/goal-audit.ts`，作为 package-owned goal audit Markdown 和 summary implementation。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit']`。
- 更新 `tests/unit/goal-audit.test.ts`，让纯 goal audit 单元测试从 package API 读取，并验证旧 `src/internal/acceptance/goal-audit.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `goal-audit` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `goal-audit` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、91 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、367 个测试。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续迁移 `user-acceptance.ts`；该模块和 runner/preflight 耦合更高，迁移前应先用 compatibility tests 固定现有 user acceptance Markdown、preflight 和 command 输出边界。

## 2026年6月20日 - Acceptance Package Phase 2e User Acceptance Module

### 完成内容

- 新增 `packages/acceptance/src/user-acceptance.ts`，作为 package-owned user acceptance Markdown、summary 和 evidence command formatting implementation。
- 在 package 内保留最小 placeholder repo path 检测，避免 `packages/acceptance` 反向依赖 `src/internal/acceptance/repo-preflight.ts`。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `user-acceptance` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit', 'user-acceptance']`。
- 更新 `tests/unit/user-acceptance.test.ts`，让纯 user acceptance Markdown/summary 单元测试从 package API 读取，并验证旧 `src/internal/acceptance/user-acceptance.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `user-acceptance` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `user-acceptance` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/user-acceptance.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、64 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、369 个测试。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15。

### 下一步

- 继续评估 `user-acceptance-handoff.ts` 是否可作为下一个纯 Markdown builder 迁移；runner、args、repo-preflight 和 browser/hardening orchestration 暂时继续留在 legacy compatibility path。

## 2026年6月20日 - Acceptance Package Phase 2f User Acceptance Handoff Module

### 完成内容

- 新增 `packages/acceptance/src/user-acceptance-handoff.ts`，作为 package-owned user acceptance handoff Markdown builder。
- 新增 `packages/acceptance/src/shell-quote.ts`，作为 package 私有 shell quoting helper，避免 handoff builder 反向依赖 `src/shared/*`。
- 在 package 内保留最小 placeholder repo path 检测，避免 `packages/acceptance` 反向依赖 `src/internal/acceptance/repo-preflight.ts`。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `user-acceptance-handoff` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit', 'user-acceptance', 'user-acceptance-handoff']`。
- 更新 `tests/unit/user-acceptance-handoff.test.ts`，让 handoff Markdown builder 单元测试从 package API 读取，并验证旧 `src/internal/acceptance/user-acceptance-handoff.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `user-acceptance-handoff` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `user-acceptance-handoff` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/user-acceptance-handoff.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、371 个测试。
- `pnpm lint`：通过。
- `pnpm test:integration`：通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15。

### 下一步

- 继续迁移低耦合支持模块：优先评估 `user-acceptance-args.ts` 和 `fatal-error.ts`；涉及 runner orchestration 的 `run-user-acceptance*.ts` 暂时保留 compatibility wrapper，等 args/preflight/fatal-error 边界稳定后再拆。

## 2026年6月20日 - Acceptance Package Phase 2g Fatal Error Module

### 完成内容

- 新增 `packages/acceptance/src/fatal-error.ts`，作为 package-owned acceptance fatal error formatting implementation。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `fatal-error` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit', 'user-acceptance', 'user-acceptance-handoff', 'fatal-error']`。
- 更新 `tests/unit/acceptance-fatal-error.test.ts`，让 fatal error 单元测试从 package API 读取，并验证旧 `src/internal/acceptance/fatal-error.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `fatal-error` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `fatal-error` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/acceptance-fatal-error.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/fatal-error.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、19 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、373 个测试。
- `pnpm lint`：通过。

### 下一步

- 继续评估 `user-acceptance-args.ts` 和 `repo-preflight.ts` 的迁移边界；它们涉及 root path 解析、placeholder repo path 和 runner 输入契约，应先固定 root resolution 与 default output path 兼容测试。

## 2026年6月20日 - Acceptance Package Phase 2h Repo Preflight Module

### 完成内容

- 新增 `packages/acceptance/src/repo-preflight.ts`，作为 package-owned repo root 与 package.json manifest preflight implementation。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `repo-preflight` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit', 'user-acceptance', 'user-acceptance-handoff', 'fatal-error', 'repo-preflight']`。
- 更新 `tests/unit/repo-preflight.test.ts`，让 repo preflight 单元测试从 package API 读取，并验证旧 `src/internal/acceptance/repo-preflight.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `repo-preflight` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `repo-preflight` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/repo-preflight.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/repo-preflight.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、29 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、375 个测试。
- `pnpm lint`：通过。

### 下一步

- 继续迁移 `user-acceptance-args.ts`；迁移前需要固定 default output path、root path 解析和 placeholder repo path formatting 的 package/legacy compatibility。

## 2026年6月20日 - Acceptance Package Phase 2i User Acceptance Args Module

### 完成内容

- 新增 `packages/acceptance/src/user-acceptance-args.ts`，作为 package-owned user acceptance CLI args parser 和 command formatter。
- 实现继续使用 repo root 相对项目根目录解析、默认 `docs/acceptance/user-acceptance-record.md` 输出路径、placeholder repo path display 和 shell quoting 规则。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `user-acceptance-args` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report', 'goal-audit', 'user-acceptance', 'user-acceptance-handoff', 'fatal-error', 'repo-preflight', 'user-acceptance-args']`。
- 更新 `tests/unit/user-acceptance.test.ts`，让 args parser/formatter 测试从 package API 读取，并验证旧 `src/internal/acceptance/user-acceptance-args.ts` 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `user-acceptance-args` 纳入 package contract、exports 和结构约束。
- 更新 monorepo structure spec 和 package README，记录 `user-acceptance-args` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/user-acceptance-args.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、69 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、377 个测试。
- `pnpm lint`：通过。

### 下一步

- 开始评估 runner 层迁移：优先让 `src/internal/acceptance/run-user-acceptance*.ts` 通过 package-owned modules 组装，或在 package 内新增 runner implementation，同时保持 `dist/internal/acceptance/*` 兼容输出和 root scripts 不变。

## 2026年6月20日 - Acceptance Package Phase 2j Run Acceptance Runner

### 完成内容

- 将 `packages/acceptance/src/run-acceptance.ts` 从 legacy delegate wrapper 升级为 package-owned acceptance runner implementation。
- 修复 package runner 顶层导入副作用：`run-acceptance` 现在可被单元测试导入，只有 direct run 时才执行 `main()`。
- package runner 复用 package-owned `report`、`fatal-error` 和 `shell-quote` 模块，继续保持默认输出路径 `docs/acceptance/acceptance-run.md`。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `run-acceptance`。
- 更新 `tests/unit/acceptance-report.test.ts`，让 runner helper 测试从 package API 读取，并验证旧 `src/internal/acceptance/run-acceptance.ts` 的 args/command formatting 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts`，把 `run-acceptance` 纳入 package contract 约束。

### 验证

- Red：导入旧 package wrapper 时触发顶层 delegate，递归启动 `pnpm test:unit`；已中断该测试会话并以 package-owned runner 修复。
- Green：`pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/acceptance-package.test.ts` 通过，2 个测试文件、25 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、379 个测试。
- `pnpm lint`：通过。
- `pnpm acceptance`：通过，standard mode 12/12；该命令验证 root script 已直接运行 package-owned `run-acceptance`。

### 下一步

- 重新运行 `pnpm acceptance -- --full --browser`，恢复目标要求中的 full/browser acceptance 证据。
- 继续评估 `run-user-acceptance-handoff.ts`，它比 `run-user-acceptance.ts` 更小，适合作为下一个 package-owned runner。

## 2026年6月20日 - Acceptance Package Phase 2k User Acceptance Handoff Runner

### 完成内容

- 将 `packages/acceptance/src/run-user-acceptance-handoff.ts` 从 legacy delegate wrapper 升级为 package-owned user acceptance handoff runner implementation。
- 修复 package handoff runner 顶层导入副作用：该模块现在可被单元测试导入，只有 direct run 时才执行 `main()`。
- package runner 复用 package-owned `goal-audit`、`user-acceptance-handoff`、`fatal-error` 和 `repo-preflight` 模块，继续保持默认输出路径 `docs/acceptance/user-acceptance-handoff.md` 和 `docs/acceptance/goal-completion-audit.md`。
- `main()` 在运行时动态加载 legacy built `buildCurrentGoalAuditItems()`，避免在本切片内一次性迁移大型 `run-goal-audit.ts`。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `run-user-acceptance-handoff`。
- 更新 `tests/unit/user-acceptance-handoff.test.ts`，让 runner helper 测试从 package API 读取，并验证旧 `src/internal/acceptance/run-user-acceptance-handoff.ts` 的 args/run 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `run-user-acceptance-handoff` 纳入 package contract、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `run-user-acceptance-handoff` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts` 因 package wrapper 未导出 runner helpers、`packageOwnedModules` 未包含 `run-user-acceptance-handoff` 按预期失败。
- Green：`pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、48 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、381 个测试。
- `pnpm lint`：通过。
- `pnpm user:handoff`：通过，验证 root script 已直接运行 package-owned `run-user-acceptance-handoff` 并刷新交接包。
- `pnpm acceptance -- --full --browser`：通过，15/15。

### 下一步

- 继续评估剩余 runner：`run-goal-audit.ts` 体量最大且耦合目标审计文件读取；`run-user-acceptance.ts` 涉及真实 repo、artifact 和 generated tests，适合作为后续更小切片拆分。

## 2026年6月20日 - Acceptance Package Phase 2l User Acceptance Record Module

### 完成内容

- 评估 `src/internal/acceptance/run-goal-audit.ts` 后，决定不在本切片整文件迁移 1117 行 runner，先迁出其中低耦合、测试覆盖充分的用户验收记录判定逻辑。
- 新增 `packages/acceptance/src/shell-words.ts`，作为 package-owned shell command parser，供 acceptance package 内部复用。
- 新增 `packages/acceptance/src/user-acceptance-record.ts`，作为 package-owned user acceptance record classification implementation，包含 accepted/changes_requested/pending 判定、artifact 证据校验、repo 路径一致性校验和 freshness 校验。
- package record classifier 复用 package-owned `parseUserAcceptanceArgs`，避免反向依赖 root `src/shared` 或 legacy acceptance runner。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `shell-words` 与 `user-acceptance-record` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `shell-words` 和 `user-acceptance-record`。
- 更新 `tests/unit/goal-audit.test.ts`，让用户验收记录判定测试从 package API 读取，并验证 legacy `run-goal-audit.ts` 导出的 classifier/freshness 结果与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把两个模块纳入 package contract、exports、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `shell-words` 与 `user-acceptance-record` 已成为 package-owned implementation modules。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 因缺少 `packages/acceptance/src/shell-words.ts` 和 `packages/acceptance/src/user-acceptance-record.ts` 按预期失败。
- Green：同一目标测试通过，2 个测试文件、92 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，3 个测试文件、100 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、383 个测试。
- `pnpm lint`：通过。

### 下一步

- 后续可让 `run-goal-audit.ts` 逐步复用 package-owned `user-acceptance-record`，但需要先设计 root `src` 到 package dist/src 的兼容导入方式，避免破坏 `tsconfig.build.json` 的 `rootDir: "src"` 约束。
- 继续评估 `run-user-acceptance.ts` 的可拆分纯边界，例如 artifact summary、preflight/result markdown 组装和 generated spec validation command 处理。

## 2026年6月20日 - Acceptance Package Phase 2m User Acceptance Runner Helpers

### 完成内容

- 评估 `src/internal/acceptance/run-user-acceptance.ts` 后，决定不在本切片整文件迁移 587 行 runner，先迁出其中不依赖 hardening/browser orchestration 的 runner helper。
- 新增 `packages/acceptance/src/user-acceptance-runner-helpers.ts`，作为 package-owned user acceptance runner helper implementation。
- 新模块包含 repo preflight helper、record writer、artifact checks builder、generated Playwright spec validation check、Playwright dependency resolver、generated validation command/evidence formatter、validation base URL selection和 auto-boot 判定。
- helper 复用 package-owned `repo-preflight`、`shell-quote`、`redaction` 和 `user-acceptance-args`，避免 package 反向依赖 root `src/domain`、`src/shared` 或 legacy runner。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `user-acceptance-runner-helpers` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `user-acceptance-runner-helpers`。
- 更新 `tests/unit/user-acceptance.test.ts`，让 runner helper 测试从 package API 读取，并验证 legacy `run-user-acceptance.ts` 的 generated validation helper 输出与 package implementation 保持一致。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把该模块纳入 package contract、exports、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `user-acceptance-runner-helpers` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts` 因缺少 `packages/acceptance/src/user-acceptance-runner-helpers.ts` 按预期失败。
- Green：同一目标测试通过，2 个测试文件、66 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，3 个测试文件、74 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、385 个测试。
- `pnpm lint`：通过。

### 下一步

- 后续可让 package-owned `run-user-acceptance.ts` 复用 `user-acceptance-runner-helpers`，但仍需处理 hardening/browser orchestration 对 `src/tools` 和 `src/domain` 的依赖边界。
- 继续评估是否先迁完整 `run-user-acceptance` runner，或继续拆出 `boot/browser` adapter 边界，避免 package build 直接跨入 root `src`。

## 2026年6月20日 - Acceptance Package Phase 2n User Acceptance Runner

### 完成内容

- 将 `packages/acceptance/src/run-user-acceptance.ts` 从 legacy delegate wrapper 升级为 package-owned user acceptance runner implementation。
- 修复 package user acceptance runner 顶层导入副作用：该模块现在可被单元测试导入，只有 direct run 时才执行 `main()`。
- package runner 复用 package-owned `user-acceptance`、`user-acceptance-args`、`user-acceptance-runner-helpers`、`fatal-error` 和 `redaction` 模块。
- `main()` 和默认运行路径在通过 repo preflight 后动态加载 built root `runHardeningTool`、`runBootAppTool` 和 `createPlaywrightBrowserDriver`，避免 package build 直接跨入 root `src/tools` 或 `src/domain`。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `run-user-acceptance`。
- 更新 `tests/unit/user-acceptance.test.ts`，让 `main()` 和 `runUserAcceptance()` 测试从 package runner API 读取；legacy runner 仅保留 generated validation helper 的兼容对照。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `run-user-acceptance` 纳入 package contract、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `run-user-acceptance` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts` 因 package wrapper 顶层 delegate 执行 legacy `main()` 且缺少 `--repo` 按预期失败。
- Green：同一目标测试通过，2 个测试文件、67 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，3 个测试文件、75 个测试。
- `pnpm typecheck`：先因 package runner `issueCounts` 类型过宽失败；收紧为 `{ P0: number; P1: number; P2: number }` 后通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、386 个测试。
- `pnpm lint`：通过。
- `pnpm user:accept -- --repo /tmp/agent-tester-missing-real-app --output /tmp/agent-tester-user-acceptance-smoke.md`：按预期返回 1，并由 package-owned runner 生成结构化 preflight 失败记录。

### 下一步

- 剩余主要 runner 是 `run-goal-audit.ts`；它仍然体量大且强耦合当前 repo 文件读取，后续应继续拆分审计 evidence builder 或设计 package runner 动态加载策略。

## 2026年6月21日 - Acceptance Package Phase 2o Goal Audit Runner

### 完成内容

- 将 `packages/acceptance/src/run-goal-audit.ts` 从 legacy delegate wrapper 升级为 package-owned goal audit runner implementation。
- 修复 package goal audit runner 顶层导入副作用：该模块现在可被单元测试导入，只有 direct run 时才执行 `main()`。
- package runner 复用 package-owned `goal-audit` 和 `fatal-error` 模块，继续保持默认输出路径 `docs/acceptance/goal-completion-audit.md`。
- `main()` 在运行时动态加载 legacy built `buildCurrentGoalAuditItems()`，避免本切片一次性迁移 1117 行、强耦合当前 repo 文件读取的 evidence builder。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `run-goal-audit`。
- 更新 `tests/unit/goal-audit.test.ts`，新增注入式 `runGoalAudit()` 单元测试，验证 package runner 能生成 goal audit 文档并返回正确退出码。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `run-goal-audit` 纳入 package contract、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `run-goal-audit` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 因 package wrapper 顶层 delegate 执行并缺少 `runGoalAudit` 导出、`packageOwnedModules` 未包含 `run-goal-audit` 按预期失败。
- Green：同一目标测试通过，2 个测试文件、96 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，3 个测试文件、104 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、388 个测试。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，验证 root script 已直接运行 package-owned `run-goal-audit` 并刷新 `docs/acceptance/goal-completion-audit.md`。

### 下一步

- 剩余工作主要从“runner wrapper 迁移”转向“goal audit evidence builder 拆分”：后续应将 `buildCurrentGoalAuditItems()` 中的低耦合 text/file requirement helper 和用户验收材料 evidence builder 逐步迁入 package。

## 2026年6月21日 - Acceptance Package Phase 2p Goal Audit Requirements

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-requirements.ts`，作为 package-owned goal audit requirement helper implementation。
- 新模块包含 `REQUIRED_DOCUMENT_PATHS`、文本 marker requirement builder、文件存在 requirement builder 和 full/browser acceptance quality gate freshness builder。
- helper 复用 package-owned `user-acceptance-record` 中的 `isAcceptanceRunFreshEnough()`，避免复制日期 freshness 判断。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-requirements` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-requirements`。
- 更新 `tests/unit/goal-audit.test.ts`，验证 package required document path 与 legacy `run-goal-audit.ts` 兼容，并覆盖 text/file requirement 与 acceptance-run freshness gate。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `goal-audit-requirements` 纳入 package contract、exports、README 和 monorepo structure spec 约束。
- 更新 monorepo structure spec 和 package README，记录 `goal-audit-requirements` 已成为 package-owned implementation module。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 因缺少 `packages/acceptance/src/goal-audit-requirements.ts` 按预期失败。
- Green：同一目标测试通过，2 个测试文件、100 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，3 个测试文件、108 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、392 个测试。
- `pnpm lint`：通过。

### 下一步

- 后续可让 legacy `run-goal-audit.ts` 或 package-side evidence builder 复用这些 package-owned requirement helpers，继续减少 `buildCurrentGoalAuditItems()` 内部私有逻辑。
- 继续拆分用户验收材料 evidence builder、文档读取计划或 grouped text-source 构建逻辑。

## 2026年6月21日 - Acceptance Package Phase 2q Goal Audit User Acceptance Helper

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-user-acceptance.ts`，作为 package-owned user acceptance goal audit item helper。
- 新模块封装 `用户确认 MVP 符合预期` 的三种状态映射：
  - `accepted` -> `passed`
  - `changes_requested` -> `missing`
  - `pending_or_invalid` -> `manual_required`
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-user-acceptance` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-user-acceptance`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 package-owned evidence、next action 和完整 goal audit item 构造。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把 `goal-audit-user-acceptance` 纳入 package contract、exports、README 和 monorepo structure spec 约束。
- 清理一次失败构建遗留在 `packages/acceptance/src` 下的 `.js`、`.js.map` 和 `.d.ts` 产物，并新增结构测试，确保 package source 目录不混入构建输出。
- 在 ESLint ignore 中加入 `**/*.d.ts`，避免声明文件被当作源码解析。

### 架构边界

- 曾尝试让 legacy `src/internal/acceptance/run-goal-audit.ts` 直接 import `packages/acceptance/src/goal-audit-user-acceptance.ts`。
- `pnpm build` 暴露该方式违反 root build 的 `rootDir: "src"` 边界，会导致 TS6059。
- 结论：当前阶段 package-owned helper 应先通过 package exports 和结构测试固定边界；legacy runtime 直接复用 package source 需要等 build strategy 允许跨 package 引用后再推进。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 因缺少 `packages/acceptance/src/goal-audit-user-acceptance.ts` 按预期失败。
- Green：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 通过，3 个测试文件、112 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，25 个测试文件、396 个测试。
- `pnpm lint`：通过。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 继续拆分 `buildCurrentGoalAuditItems()` 中的用户验收材料 evidence builder 或文档读取计划。
- 在下一轮迁移前，先确定 root build 与 package build 的引用边界，避免 `src/internal` 直接依赖 `packages/*/src`。

## 2026年6月21日 - Acceptance Package Phase 2r User Acceptance Materials Builder

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-user-acceptance-materials.ts`，作为 package-owned grouped text requirement builder。
- 新模块把 `buildCurrentGoalAuditItems()` 中 7 个 `用户验收材料` 检查项整理为可复用规格：
  - `演示命令和验收清单`
  - `稳定报告样例`
  - `已知限制和未解决 blocker 列表`
  - `MCP 配置示例和客户端验收步骤`
  - `安装步骤和环境前置条件`
  - `示例 repo 运行流程`
  - `用户验收交接包`
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-user-acceptance-materials` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-user-acceptance-materials`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 7 个 material requirement 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-user-acceptance-materials.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、115 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、399 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 后续可继续拆分 `buildCurrentGoalAuditItems()` 的文档读取/输入组装层，或为 goal audit source collection 建立 package-owned builder。
- legacy runtime 仍不能直接 import `packages/*/src`；复用 package-owned实现前需要先完成 root/package build strategy 边界设计。

## 2026年6月21日 - Acceptance Package Phase 2s Goal Audit Source Collection

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-sources.ts`，作为 package-owned goal audit text source collection plan。
- 新模块声明 `buildCurrentGoalAuditItems()` 所需的单文件来源路径和分组测试来源路径：
  - `GOAL_AUDIT_TEXT_SOURCE_PATHS`
  - `GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS`
  - `readGoalAuditTextSources()`
- `readGoalAuditTextSources()` 使用注入的 `readText`，保持单元测试可控，同时为后续 runtime 迁移保留 I/O 边界。
- 新 source collection 覆盖 `goal-audit-user-acceptance-materials` 所需的全部 material source keys。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-sources` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-sources`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 source path plan、grouped join 和 material source key coverage。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-sources.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、118 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、402 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 后续可在不跨越 root `rootDir: "src"` 构建边界的前提下，继续把 `buildCurrentGoalAuditItems()` 的纯 item builder 层迁入 package。
- 若要让 legacy runtime 直接复用 package source，需要先调整 build strategy 或通过 dist/package import 设计兼容层。

## 2026年6月21日 - Acceptance Package Phase 2t Delivery and P0 Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-delivery.ts`，作为 package-owned delivery/P0 goal audit item builder。
- 新模块封装 `buildCurrentGoalAuditItems()` 中前 4 个低耦合检查项：
  - `交付物: 可运行的 CLI`
  - `交付物: 可运行的 MCP Server`
  - `P0 Tools: P0 tools 通过 MCP 层暴露`
  - `P0 Tools: P0 tools 通过 CLI 层调用`
- builder 复用 package-owned `buildGoalAuditFileRequirement()` 和 `buildGoalAuditTextRequirement()`，并通过注入的 `pathExists` 保持单元测试可控。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-delivery` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-delivery`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 delivery/P0 builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-delivery.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、121 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、405 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 继续把 `buildCurrentGoalAuditItems()` 中 MCP/CLI 可运行性、完整工作流、本地 artifact、可观测性等 item builder 迁入 package。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2u Runtime Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-runtime.ts`，作为 package-owned MCP/CLI runtime goal audit item builder。
- 新模块封装 `buildCurrentGoalAuditItems()` 中两个运行性检查项：
  - `MCP 可运行性: 协议级 list/call、P0 链路与 session 清理`
  - `CLI 可运行性: 子命令、帮助入口与 artifact smoke`
- builder 复用 package-owned `buildGoalAuditTextRequirement()`，并使用 `goal-audit-sources` 中已有 source key。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-runtime` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-runtime`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 MCP/CLI runtime builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-runtime.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、124 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、408 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 继续把 `buildCurrentGoalAuditItems()` 中完整工作流、本地 artifact、可观测性、安全边界等 item builder 迁入 package。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2v Workflow and Artifact Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-workflow-artifacts.ts`，作为 package-owned workflow/artifact goal audit item builder。
- 新模块封装 `buildCurrentGoalAuditItems()` 中两个检查项：
  - `完整工作流: 可执行 analyze_repo -> boot_app -> explore_app -> generate_tests -> harden_report -> repair_plan`
  - `本地 artifact: 本地 artifact 输出`
- builder 复用 package-owned `buildGoalAuditTextRequirement()`，并使用 `goal-audit-sources` 中已有 source key。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-workflow-artifacts` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-workflow-artifacts`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 workflow/artifact builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-workflow-artifacts.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、127 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、411 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go。

### 下一步

- 继续把 `buildCurrentGoalAuditItems()` 中可观测性、安全边界、开发流程、日志治理、token 控制等 item builder 迁入 package。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2w Observability and Security Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-observability-security.ts`，作为 package-owned observability/security goal audit item builder。
- 新模块封装三类低耦合文本检查：
  - `可观测性: 可复现信息与失败证据`
  - `Local-first 与隐私: 报告和验收文档声明本地优先与敏感信息边界`
  - `安全边界: 不硬编码密钥、不上传代码、不泄露 env value`
- builder 复用 package-owned `buildGoalAuditTextRequirement()`，并使用 `goal-audit-sources` 中已有 source key。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-observability-security` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-observability-security`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 observability/security builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-observability-security.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、130 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、414 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续把 `buildCurrentGoalAuditItems()` 中开发流程、日志治理、token 控制、benchmark/required documents 等低耦合 item builder 迁入 package。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2x Process Governance Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-process-governance.ts`，作为 package-owned process governance goal audit item builder。
- 新模块封装三类低耦合文本检查：
  - `开发流程: TDD 与测试金字塔执行记录`
  - `日志治理: 阻塞与决策记录`
  - `Token 控制: 精准上下文与小步审计`
- builder 复用 package-owned `buildGoalAuditTextRequirement()`，并使用 `goal-audit-sources` 中已有 source key。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-process-governance` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-process-governance`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 process governance builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-process-governance.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、133 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、417 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续把 `buildCurrentGoalAuditItems()` 中 benchmark、required documents 等剩余低耦合 item builder 迁入 package。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2y Evidence and Documents Goal Audit Builders

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-evidence-documents.ts`，作为 package-owned evidence/document goal audit item builder。
- 新模块封装两类低耦合检查：
  - `Benchmark: Benchmark 达到 Go 标准`
  - `文档与日志: Required Documents 已维护`
- builder 复用 package-owned `buildGoalAuditTextRequirement()` 和 `buildGoalAuditFileRequirement()`，并通过注入 `pathExists` 保持文件检查可单元测试。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-evidence-documents` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-evidence-documents`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 evidence/document builder 的 passed 和 missing 路径。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-evidence-documents.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、136 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、420 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续评估 `buildCurrentGoalAuditItems()` 中剩余用户验收材料 item 是否已经由 `goal-audit-user-acceptance-materials` 完整覆盖；若覆盖完成，下一步应减少 legacy runner 中重复内联逻辑或推进更高层组合 builder。
- legacy runtime 仍保持兼容路径，直接复用 package source 前需先解决 root/package build 边界。

## 2026年6月21日 - Acceptance Package Phase 2z Current Goal Audit Item Composer

### 完成内容

- 新增 `packages/acceptance/src/goal-audit-current-items.ts`，作为 package-owned current goal audit item composer。
- composer 组合已迁入 package 的 builders：
  - `goal-audit-delivery`
  - `goal-audit-runtime`
  - `goal-audit-workflow-artifacts`
  - `goal-audit-observability-security`
  - `goal-audit-process-governance`
  - `goal-audit-evidence-documents`
  - `goal-audit-user-acceptance-materials`
  - `goal-audit-user-acceptance`
- composer 保持 legacy goal audit 报告顺序：MCP runtime 位于 P0 MCP 之后，Local-first/安全位于文档检查之后，用户验收项仍位于最后。
- composer 通过注入 `sources`、`pathExists` 和 `userAcceptanceStatus` 工作，不直接读取文件或导入 legacy implementation。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `goal-audit-current-items` API。
- 扩展 package contract，记录 `packageOwnedModules` 包含 `goal-audit-current-items`。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 package composer 组合出当前 25 项 audit item、保持顺序、且保留用户验收人工确认边界。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，把新模块纳入 package contract、exports、README 和 monorepo structure spec 约束。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因缺少 `packages/acceptance/src/goal-audit-current-items.ts` 和 package export 按预期失败。
- Green：同一目标测试通过，3 个测试文件、138 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、422 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续评估是否可以让 package-owned `run-goal-audit` 读取 sources 并使用 `goal-audit-current-items`，同时保留 `dist/internal/acceptance/*` 兼容输出。
- 若直接替换 runner 会触碰 root/package build 边界，应先增加兼容测试再分步执行。

## 2026年6月21日 - Acceptance Package Phase 2aa Goal Audit Workspace Runner

### 完成内容

- 更新 `packages/acceptance/src/run-goal-audit.ts`，让 package-owned `goal:audit` runner 通过 package source reader 和 `goal-audit-current-items` composer 构建当前 audit items。
- 新增并导出 `buildGoalAuditItemsFromWorkspace()`，用注入式 `readText`、`pathExists` 和可选 `pathExistsSync` 支持单元测试和真实 workspace 执行。
- `goal:audit` 仍写入兼容输出路径 `docs/acceptance/goal-completion-audit.md`。
- 保留 `dist/internal/acceptance/*` 兼容输出，但 package runner 不再动态导入 legacy `dist/internal/acceptance/run-goal-audit.js` 来构建当前 items。
- `packages/acceptance/src/index.ts` 暴露 workspace builder API。
- 更新 `packages/acceptance/README.md`，记录 `goal:audit` 当前通过 package-owned source collection、current-item composition 和 Markdown rendering 执行。
- 更新 `tests/unit/goal-audit.test.ts`，覆盖 workspace source 读取、相对路径到绝对路径的文件检查适配，以及 25 项当前 audit item 输出。
- 更新 `tests/unit/acceptance-package.test.ts`，把 `buildGoalAuditItemsFromWorkspace()` 纳入 runner API contract。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` 因 `buildGoalAuditItemsFromWorkspace` 尚未实现按预期失败。
- Green：同一目标测试通过，3 个测试文件、139 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、423 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 在保持 legacy dist 兼容输出的前提下，评估是否还能进一步瘦身 `src/internal/acceptance/run-goal-audit.ts`，例如将其转为 package runner 的兼容 wrapper。

## 2026年6月21日 - Acceptance Package Phase 2ab Handoff Goal Audit Workspace Path

### 完成内容

- 更新 `packages/acceptance/src/run-user-acceptance-handoff.ts`，让 package-owned `user:handoff` runner 直接复用 `buildGoalAuditItemsFromWorkspace({ root })`。
- 移除 package handoff runner 对 legacy `dist/internal/acceptance/run-goal-audit.js` item loader 的动态导入。
- `user:handoff` 仍保持默认输出路径 `docs/acceptance/user-acceptance-handoff.md`，并继续在默认输出时刷新 `docs/acceptance/goal-completion-audit.md`。
- 保留 `dist/internal/acceptance/*` 兼容输出和现有 legacy behavior compatibility tests。
- 更新 `packages/acceptance/README.md` 和 monorepo structure spec，记录 handoff runner 当前通过 package-owned goal audit workspace builder 执行。
- 更新 `tests/unit/project-structure.test.ts`，约束 handoff runner 不再依赖 legacy goal audit dist loader，并要求 README/spec 同步记录该边界。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "package-owned handoff"` 因 handoff runner 仍导入 legacy goal audit dist loader 按预期失败。
- Green：实现迁移后，同一结构测试通过。
- Red：扩展文档约束后，同一结构测试因 README/spec 未记录 handoff workspace path 按预期失败。
- Green：补充 README/spec 后，同一结构测试通过。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts`：通过，4 个测试文件、167 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、424 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm user:handoff`：通过，同时通过 package-owned goal audit workspace builder 刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续评估是否能安全瘦身 legacy `src/internal/acceptance/run-goal-audit.ts`，或先迁移其它仍低耦合且不触碰 root/package build 边界的 acceptance runner 依赖。

## 2026年6月21日 - Acceptance Package Phase 2ac Goal Audit Package Source Evidence

### 完成内容

- 更新 `packages/acceptance/src/goal-audit-sources.ts`，让 package-owned goal audit source collection 读取 package implementation files：
  - `packages/acceptance/src/user-acceptance-handoff.ts`
  - `packages/acceptance/src/run-user-acceptance-handoff.ts`
  - `packages/acceptance/src/repo-preflight.ts`
  - `packages/acceptance/src/user-acceptance-args.ts`
  - `packages/acceptance/src/user-acceptance.ts`
  - `packages/acceptance/src/run-user-acceptance.ts`
  - `packages/acceptance/src/run-goal-audit.ts`
- 保留 legacy `src/internal/acceptance/*` 兼容行为面和旧路径 compatibility tests，但 package goal audit 不再以旧源码作为当前实现证据。
- 更新 `packages/acceptance/src/goal-audit-process-governance.ts`，把 Token 控制审计源码标记从 legacy runner 内联数组切换为 package runner/source/composer 标记。
- 更新 `tests/unit/goal-audit.test.ts`，要求 source collection plan 指向 package implementation files，并用新的 package runner markers 证明 process governance 审计项。
- 更新 `tests/unit/project-structure.test.ts`，守护 package goal audit source collection 不回退到 legacy implementation source paths。
- 更新 `packages/acceptance/README.md` 和 monorepo structure spec，记录 goal audit source evidence 的 package-owned 边界。

### 验证

- Red：`pnpm vitest run tests/unit/goal-audit.test.ts --testNamePattern "source collection|process governance"` 因 source plan 仍指向 `src/internal/acceptance/*` 且 process governance needles 仍为旧 marker 按预期失败。
- Green：切换 source paths 和 process governance markers 后，同一 focused 测试通过。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、102 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts tests/unit/acceptance-package.test.ts`：通过，3 个测试文件、141 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、425 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续沿 package-owned source evidence 检查是否还有审计项读取 legacy implementation files；若没有，下一步优先评估 legacy wrapper 瘦身策略和兼容测试强度。

## 2026年6月21日 - Acceptance Package Phase 2ad ADR Current State Alignment

### 完成内容

- 更新 `docs/adr/0006-package-build-strategy.md`，把 Implementation Note 从 Phase 2a wrapper delegation 状态补充到当前 Phase 2 package-owned implementation 状态。
- ADR 现在明确记录：
  - Phase 2 implementation modules now live under `packages/acceptance/src`。
  - root scripts call package-owned acceptance runners。
  - legacy `dist/internal/acceptance/*` remains a compatibility output, not the current package execution path。
  - 新 source evidence 和 package ownership 检查应指向 `packages/acceptance/src/*`。
- 更新 `tests/unit/project-structure.test.ts`，把 ADR 当前状态说明纳入结构守护，避免后续迁移继续依赖过期的 Phase 2a 说明。

### 验证

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "phase 2 package split"` 因 ADR-0006 未记录当前 package-owned implementation 状态按预期失败。
- Green：更新 ADR 后，同一结构测试通过。
- `pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts`：通过，3 个测试文件、141 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、425 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 在当前 ADR 约束下继续评估 legacy `src/internal/acceptance/*` 文件是否能安全瘦身为兼容层，重点先处理不依赖 `src/shared/*` 和 root/package build 顺序的文件。

## 2026年6月21日 - Acceptance Package Phase 2ae Current Goal Audit Package API

### 完成内容

- 在 `packages/acceptance/src/run-goal-audit.ts` 新增 `buildCurrentGoalAuditItems()`，保持 legacy API shape，同时将实现路由到 package-owned `buildGoalAuditItemsFromWorkspace({ root })`。
- `main()` 现在直接使用 package `buildCurrentGoalAuditItems()`，避免当前 item 构建入口和 CLI 入口语义分叉。
- `packages/acceptance/src/index.ts` 暴露 `buildCurrentGoalAuditItems`。
- 更新 `tests/unit/goal-audit.test.ts`，让当前 goal audit item 构建测试主入口从 legacy `src/internal/acceptance/run-goal-audit.ts` 切到 package `run-goal-audit` API。
- legacy goal audit 导入继续仅用于兼容行为对照，例如 user acceptance record classification 和 required document path 兼容。
- 更新 `tests/unit/acceptance-package.test.ts` 和 `tests/unit/project-structure.test.ts`，守护 package API、README、spec 和 ADR 中的当前 item 构建所有权。
- 更新 `packages/acceptance/README.md`、monorepo structure spec 和 ADR-0006，记录 `buildCurrentGoalAuditItems()` 的 package-owned 边界。

### 验证

- Red：切换 `tests/unit/goal-audit.test.ts` 和 `tests/unit/acceptance-package.test.ts` 到 package `buildCurrentGoalAuditItems` 后，因 package 尚未导出该函数按预期失败。
- Green：新增 package API 并导出后，focused 测试通过。
- `pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts`：通过，3 个测试文件、142 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，25 个测试文件、426 个测试。
- `pnpm test:integration`：沙箱内因本地 server 监听失败；提权重跑通过，11 个测试文件、27 个测试。
- `pnpm acceptance -- --full --browser`：通过，15/15；Benchmark 5/5 Go；真实 Chromium trace E2E 通过。
- `pnpm goal:audit`：通过，24 项已通过、0 项缺失、1 项等待人工确认。

### 下一步

- 继续缩小测试和实现对 legacy `src/internal/acceptance/run-goal-audit.ts` 的依赖；下一步优先评估 `buildCurrentGoalAuditItems()` legacy compatibility wrapper 的可行性。

## 2026年6月20日 - Acceptance Package Phase 2c Report Module

### 完成内容

- 新增 `packages/acceptance/src/report.ts`，作为 package-owned acceptance report implementation。
- 新增 `packages/acceptance/src/redaction.ts`，作为 package 私有 redaction helper，避免 package build 在当前阶段直接跨入 `src/shared/*`。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `report` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown', 'report']`。
- 更新 `tests/unit/acceptance-report.test.ts`，让 report 单测从 package API 读取，并验证旧 `src/internal/acceptance/report.ts` 输出与 package implementation 保持一致。
- 更新 monorepo structure spec 和 package README，记录 `report` 已成为 package-owned implementation module。

### 下一步

- 继续迁移 `goal-audit.ts`；若其 redaction 和 markdown 依赖继续扩大，应评估是否先抽 `packages/shared` 或继续 package-local compatibility strategy。

## 2026年6月20日 - Acceptance Package Phase 2a

### 完成内容

- 新增 `packages/acceptance/package.json`、`tsconfig.json`、`tsconfig.build.json` 和 `src/*` wrapper 入口。
- root scripts 切换为通过 `packages/acceptance/dist/*` 运行 `acceptance`、`goal:audit`、`user:accept` 和 `user:handoff`。
- 保留 `src/internal/acceptance/*` 和 `dist/internal/acceptance/*` 作为兼容实现路径。
- 新增 `tests/unit/acceptance-package.test.ts`，验证 package contract、兼容输出路径和 legacy dist entrypoint 解析。
- 更新 `tests/unit/project-structure.test.ts`，把 acceptance package ownership 纳入结构约束。
- 更新 monorepo structure spec、ADR-0006 和 README，明确 Phase 2a 是 package-owned compatibility wrapper，不是完整实现迁移。

### 下一步

- 选择低耦合模块逐步迁入 `packages/acceptance/src`，每次迁移都保留旧路径 wrapper 和脚本兼容测试。

## 2026年6月20日 - Acceptance Package Phase 2b Markdown Module

### 完成内容

- 新增 `packages/acceptance/src/markdown.ts`，作为第一个 package-owned implementation module。
- `packages/acceptance/src/index.ts` 和 package exports 暴露 `markdown` API。
- 扩展 package contract，记录 `packageOwnedModules: ['markdown']`。
- 更新 markdown 单元测试，验证 package implementation 与旧 `src/internal/acceptance/markdown.ts` 兼容行为一致。
- 更新 monorepo structure spec 和 package README，明确旧 `src` 路径仍作为兼容实现保留。

### 下一步

- 继续选择低耦合、无 root build 反向依赖的 acceptance helper 迁入 package；涉及 `src/shared/*` 或复杂 runner 的模块需先设计 workspace package import 策略。

## 2026年6月20日 - Docs Taxonomy 与命名规范

### 完成内容

- 新增 `docs/adr/0007-documentation-taxonomy-and-naming.md`，明确文档分类、命名规则、版本/日期策略和生成型验收输出的兼容例外。
- 新增 `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`，定义 canonical topology、naming rules、migration map 和 acceptance criteria。
- 迁移稳定文档到 `specs/`、`guides/`、`checklists/`、`records/`、`strategy/`、`samples/`、`spikes/` 和 `completed/` 子目录。
- 保留 `docs/acceptance/acceptance-run.md`、`goal-completion-audit.md`、`user-acceptance-handoff.md` 和 `user-acceptance-record.md` 的默认输出路径，等待 acceptance 包迁移时再做兼容式调整。
- 更新 README、运行时代码和结构测试，使新 taxonomy 成为可验证约束。

### 下一步

- 在 `packages/acceptance` 迁移时，为生成型验收输出设计兼容路径或可配置输出路径。

## 2026年6月20日 - Package Build Strategy ADR

### 完成内容

- 新增 `docs/adr/0006-package-build-strategy.md`，明确 Phase 2 包拆分必须采用兼容优先策略。
- 明确 `packages/acceptance` 作为第一个包拆分试点。
- 更新 `docs/architecture/monorepo-structure-v0.1.md`，将 Phase 2 阻塞条件从“待定义策略”推进为“策略已接受，待实现”。
- 更新项目结构测试，要求 ADR-0006 可发现，并约束 Phase 2 试点顺序和验收门禁。

### 下一步

- 在 Spec v0.2 中为 `packages/acceptance` 迁移写 TDD 执行计划。
- 先补 wrapper/export 测试，再移动 `src/internal/acceptance/*` 实现。

## 2026年6月18日 - Phase 0 启动

### 完成内容

- 创建长期执行目标：`docs/goals/codex-goal.md`。
- 创建项目骨架规划，准备进入 TDD 开发。

### 当前阶段

Phase 0：项目初始化。

### 下一步

- 安装最小 TypeScript/Vitest/ESLint 工具链。
- 编写 `analyze_repo` 失败测试。
- 实现最小 `analyze_repo`。

## 2026年6月18日 - Phase 0/1 当前切片完成

### 完成内容

- 创建 TypeScript 项目骨架。
- 安装最小开发依赖：TypeScript、Vitest、tsx、ESLint、Node 类型。
- 修复 TypeScript 6 build 所需的 `rootDir` 配置。
- 使用 TDD 实现 `analyzeRepo` 核心逻辑：
  - 检测 Next.js、Vite、React、unknown。
  - 检测 npm、pnpm、yarn、unknown。
  - 解析 `scripts.dev/build/test`。
  - 推断 `recommendedStartCommand`。
  - 提取 env key hints，避免泄露 env value。
  - 输出 blocker 和 confidence。
- 使用 TDD 实现 `runAnalyzeRepoTool`，写入 `.hardening/run/repo-profile.json`。
- 实现 CLI handler：`hardening analyze <repo>`。

### 测试结果

- `pnpm test:unit`：通过，1 个测试文件，5 个测试。
- `pnpm test:integration`：通过，2 个测试文件，2 个测试。
- `pnpm test`：通过，3 个测试文件，7 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 发现与处理

- `tsx` 子进程集成测试在沙箱内触发 IPC pipe `EPERM`。已改为测试 CLI handler，避免环境噪声，同时保留参数解析、stdout 和 artifact 写入覆盖。
- `pnpm` 沙箱内外 store 不一致。后续依赖安装应沿用同一提权上下文，或避免非必要依赖新增。

### 下一步

- 进入 Phase 2：为 `boot_app` 编写失败测试。
- 优先实现启动命令构造、端口探测、日志写入和 blocked/failed/running 状态。

## 2026年6月18日 - Phase 2 boot_app 核心切片完成

### 完成内容

- 使用 TDD 实现 `bootApp` 核心逻辑：
  - `parseStartCommand`：解析启动命令。
  - `extractUrlFromLog`：从常见 dev server 日志中提取本地 URL。
  - 子进程启动：按 repo cwd 执行启动命令。
  - 日志写入：写入 `.hardening/run/app.log`。
  - 健康探测：对日志中发现的 URL 执行 HTTP 探测。
  - 安全停止：返回 `stop()`，测试结束后终止子进程并关闭日志流。
- 添加本地 fixture server 集成测试，验证启动、日志、URL、port 和响应内容。

### 测试结果

- `pnpm test:unit`：通过，2 个测试文件，9 个测试。
- `pnpm test:integration`：提权后通过，3 个测试文件，3 个测试。
- `pnpm test`：提权后通过，5 个测试文件，12 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 发现与处理

- 当前 Codex 沙箱禁止测试进程监听 `127.0.0.1`，导致 `listen EPERM`。按环境规则提权运行后通过。
- 该限制属于执行环境权限问题，不是产品实现问题。后续涉及 Playwright、本地 server 或完整 hardening run 的测试预计也需要同类提权。

### 下一步

- 为 `boot_app` 增加 tool wrapper 和稳定的序列化输出。
- 设计会话管理，避免 MCP/CLI 模式下意外遗留后台进程。
- 进入 Phase 3 前再引入 Playwright。

## 2026年6月18日 - boot_app tool wrapper 完成

### 完成内容

- 实现 `src/tools/boot-app-tool.ts`：
  - `runBootAppTool` 调用核心 `bootApp`。
  - 写入 `.hardening/run/boot-result.json`。
  - 返回 `resultPath` 和可停止的 `BootAppToolSession`。
  - `toSerializableBootResult` 移除 `stop()`，保证 artifact 可序列化。
- 添加 `tests/unit/boot-tool.test.ts`，验证序列化边界。
- 添加 `tests/integration/boot-tool.test.ts`，验证真实启动时可写入 `boot-result.json`。

### 已验证

- `pnpm test:unit`：通过，3 个测试文件，10 个测试。
- 非监听集成测试：通过，2 个测试文件，2 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未重复验证

- `tests/integration/boot-app.test.ts`
- `tests/integration/boot-tool.test.ts`

原因：这两个测试需要在本地监听 `127.0.0.1`。当前沙箱会触发 `listen EPERM`；此前提权运行 `boot_app` 核心集成测试已通过，但最近一次提权请求被自动审核中断。该问题已记录到 `docs/logs/blockers.md`，不作为代码失败处理。

### 下一步

- 继续实现不依赖浏览器权限的核心链路：finding schema、`generate_tests`、`harden_report`。
- 后续在权限允许时补跑完整本地监听集成测试。

## 2026年6月18日 - generate_tests 与 harden_report 核心链路完成

### 完成内容

- 使用 TDD 实现 `generatePlaywrightTests`：
  - 读取 `.hardening/run/findings.json`。
  - 生成 `tests/hardening/generated-findings.spec.ts`。
  - 避免覆盖已有 generated spec。
  - 返回 `createdFiles`、`testCommand`、`validationStatus`、`errors`。
- 实现 `runGenerateTestsTool`：
  - 写入 `.hardening/run/test-generation.json`。
- 使用 TDD 实现 `generateHardenReport`：
  - 读取 `repo-profile.json`、`boot-result.json`、`findings.json`、`test-generation.json`。
  - 计算 P0/P1/P2 issueCounts。
  - 计算初始 readiness score。
  - 写入 `hardening-report.md`。
  - 写入空 `patch.diff` 占位。
- 实现 `runHardenReportTool`。
- 扩展 CLI：
  - `hardening generate-tests <findingsPath> <outputDir>`
  - `hardening report <runDir> <outputPath>`

### 测试结果

- `pnpm test:unit`：通过，5 个测试文件，13 个测试。
- 非监听集成测试：通过，5 个测试文件，6 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- `generate_tests` 当前生成 Playwright spec，但未执行 Playwright 验证，`validationStatus` 为 `skipped`。后续进入 E2E 阶段时补充真实 Playwright 执行。
- `patch.diff` 目前为空占位。后续修复建议/patch 生成阶段补充。

### 下一步

- 抽取共享 finding schema，减少重复类型和解析逻辑。
- 开始 Phase 3：`explore_app` 的 route discovery、finding 分类和 artifact 写入。

## 2026年6月18日 - explore_app 与 run 编排切片完成

### 完成内容

- 抽取共享 finding schema 到 `src/types/findings.ts`。
- 使用 TDD 实现轻量版 `exploreApp`：
  - 访问入口 URL。
  - 抽取同源 anchor 链接。
  - 按 `maxRoutes` 遍历路由。
  - 将 4xx 归类为 `broken_route`。
  - 将 5xx 和网络错误归类为 `network_error`。
  - 将空 body 归类为 `white_screen`。
  - 写入 `.hardening/run/findings.json`。
- 实现 `runExploreAppTool`，并扩展 CLI：
  - `hardening explore <repo> <url>`
- 实现 `runHardeningTool` 和 CLI 编排命令：
  - `hardening run <repo> <url>`
  - 当前按 `analyze -> explore -> generate-tests -> report` 串联执行。
- 新增 `.gitignore`，忽略 `node_modules/`、`.pnpm-store/`、`dist/`、`coverage/`、`.hardening/` 和日志文件。

### 测试结果

- `pnpm test:unit`：通过，6 个测试文件，16 个测试。
- 非监听集成测试：通过，7 个测试文件，9 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- `explore_app` 当前是基于 `fetch` 的轻量遍历实现，尚未接入 Playwright，因此还没有真实点击、表单交互、截图、trace 或视觉 artifact。
- `hardening run <repo> <url>` 当前要求用户传入已运行应用 URL，尚未自动调用 `boot_app` 并管理长期进程会话。
- 监听类集成测试仍受当前沙箱 `listen EPERM` 限制，未在本轮重复提权尝试。

### 下一步

- 进入 Playwright 版本 `explore_app`：补齐截图、console/pageerror/network 捕获、基础交互和 artifacts。
- 设计 run-level session 管理，让 `hardening run <repo>` 可自动启动应用、探索、生成测试、报告，并可靠清理进程。
- 在 Playwright/MCP SDK 阶段按需新增依赖，继续保持依赖面最小化。

## 2026年6月18日 - Playwright browser driver 切片完成

### 完成内容

- 新增 `src/domain/explore/playwright-driver.ts`：
  - 动态加载 Playwright chromium launcher。
  - 创建浏览器 page 并访问目标 URL。
  - 捕获 HTTP status、HTML、body text、同源链接候选。
  - 捕获 browser console error、pageerror、requestfailed。
  - 写入全页截图 artifact 路径。
  - 保证 page 和 browser 可关闭。
- 扩展 `exploreApp`：
  - 支持注入 `ExploreBrowserDriver`。
  - 浏览器快照可映射为 `console_error`、`network_error`、`white_screen`、`dead_control`、`form_failure` findings。
  - 返回 `artifactFiles`。
- 扩展 `runHardeningTool`：
  - 支持透传注入式 browser driver。
- 扩展 CLI：
  - `hardening explore <repo> <url> --browser`
  - `hardening run <repo> <url> --browser`
- 安装运行依赖：
  - `playwright@1.61.0`

### 测试结果

- `pnpm test:unit`：通过，8 个测试文件，21 个测试。
- 非监听集成测试：通过，8 个测试文件，10 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- 真实 Playwright 浏览器 E2E 尚未在当前环境跑通；后续需要确认浏览器二进制可用，并且允许本地 server/listener 测试。
- 交互探索当前接口已支持 `dead_control` 和 `form_failure` 映射，但默认 Playwright driver 还没有真正点击按钮或提交表单。

### 下一步

- 为默认 Playwright driver 实现基础交互：按钮/链接点击、表单候选识别、DOM/URL 变化判断。
- 将 `run` 从“需要传入 URL”升级为可选自动 `boot_app`，并保证进程清理。

## 2026年6月18日 - Playwright 基础交互探测完成

### 完成内容

- 默认 Playwright driver 增加基础控件候选识别：
  - `button`
  - `[role="button"]`
  - `input[type="submit"]`
  - `a[href]`
- 增加点击探测：
  - 记录交互描述，例如 `Click "Save"`。
  - 点击前后比较 URL 和 body text。
  - 若二者均无变化，记录 `dead_control` 交互结果。
  - 若点击抛错，记录 click error 证据。
- `exploreApp` 已能将默认 driver 的交互结果映射为 findings。

### 测试结果

- `pnpm test:unit`：通过，8 个测试文件，22 个测试。
- 非监听集成测试：通过，8 个测试文件，10 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- 表单填写和提交仍未实现。
- 点击后的页面回退、跨 route 交互路径去重、trace 保存仍未实现。

### 下一步

- 将 `hardening run` 升级为可自动 `boot_app`，使 CLI 可在未传入 URL 时从 repo 启动应用后继续探索。

## 2026年6月18日 - run 自动 boot 会话管理完成

### 完成内容

- 扩展 `runHardeningTool`：
  - `url` 改为可选。
  - 未传入 URL 时，使用 `analyze_repo` 的 `recommendedStartCommand` 自动调用 `boot_app`。
  - 支持注入 `bootApp`，便于不监听端口的测试。
  - 运行结束后在 `finally` 中调用 boot session `stop()`，避免遗留进程。
  - 显式 URL 模式会写入外部 URL `boot-result.json`，让报告中的启动状态和 URL 更准确。
- 扩展 CLI：
  - `hardening run <repo> [url] [--browser]`

### 测试结果

- `pnpm test:unit`：通过，8 个测试文件，22 个测试。
- 非监听集成测试：通过，8 个测试文件，11 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- 真实自动 boot + Playwright E2E 仍受当前环境本地监听权限限制，尚未完整执行。
- boot 失败时目前会抛错，后续应改为产出失败报告，而不是中断整个 run。

### 下一步

- 开始 MCP Server 层：暴露 P0 tools，并确保核心工具可被 Agent/IDE 以结构化方式调用。

## 2026年6月18日 - MCP Server P0 tools 暴露完成

### 完成内容

- 安装官方 MCP TypeScript SDK：
  - `@modelcontextprotocol/sdk@1.29.0`
- 新增 `src/adapters/mcp/tool-registry.ts`：
  - `analyze_repo`
  - `boot_app`
  - `explore_app`
  - `generate_tests`
  - `harden_report`
  - `run_hardening`
- Registry 能输出 MCP tool schema、执行工具、返回 `structuredContent` 和文本 content。
- 新增 `src/adapters/mcp/server.ts`：
  - 使用 SDK `Server`。
  - 处理 `tools/list`。
  - 处理 `tools/call`。
- 新增 `src/adapters/mcp/index.ts`：
  - stdio MCP server 入口。
- `package.json` 增加 bin：
  - `hardening-mcp`
- 增加协议级集成测试：
  - 内存 Transport 初始化 MCP Server。
  - 调用 `tools/list`。
  - 调用 `tools/call analyze_repo` 并验证 artifact 写入。

### 测试结果

- `pnpm test:unit`：通过，9 个测试文件，25 个测试。
- 非监听集成测试：通过，9 个测试文件，12 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 暂未完成

- `boot_app` 作为独立 MCP tool 目前会启动进程并返回结果，但还没有 MCP 级 session/stop 工具。
- MCP tool 参数目前使用轻量手写校验，后续可以升级为更严格 schema validator。
- 真实 MCP 客户端端到端验收尚未执行。

### 下一步

- 增加 MCP/CLI 使用文档和验收清单更新。
- 设计 `stop_app` 或 run-scoped session 管理，避免独立 `boot_app` 调用留下长期进程。

## 2026年6月18日 - MCP boot session stop_app 完成

### 完成内容

- 新增 `src/adapters/mcp/boot-session-store.ts`：
  - 注册 `boot_app` session。
  - 按 `sessionId` 停止 session。
  - 未知 session 返回结构化错误，不抛异常。
- MCP registry 增加 `stop_app` tool。
- `boot_app` MCP 调用返回 `sessionId`，用于后续 `stop_app`。

### 测试结果

- `pnpm test:unit`：通过，10 个测试文件，27 个测试。
- 非监听集成测试：通过，9 个测试文件，12 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 增加 README/MCP 使用文档。
- 更新验收清单，标明当前可验收能力和仍受环境限制的验证项。

## 2026年6月18日 - README 与 E2E smoke 完成

### 完成内容

- 新增中文 `README.md`：
  - CLI 使用方式。
  - MCP Server 启动方式。
  - MCP tools 列表。
  - 质量门禁。
  - 主要 artifact。
- 更新 `docs/acceptance/acceptance-checklist.md`：
  - 标明当前已通过项。
  - 标明受本地监听和真实浏览器环境限制的待验收项。
- 更新 `docs/testing/test-strategy.md`：
  - 明确当前稳定门禁命令。
- 新增 `tests/e2e/run-data-url.e2e.test.ts`：
  - 对 fixture repo 执行完整 `hardening run <repo> <data-url>`。
  - 验证 findings、report、generated Playwright spec 均落盘。

### 测试结果

- `pnpm test:unit`：通过，10 个测试文件，27 个测试。
- 非监听集成测试：通过，9 个测试文件，12 个测试。
- `pnpm test:e2e`：通过，1 个测试文件，1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 改进 boot 失败报告路径：即使应用无法启动，也应产出 `hardening-report.md`。
- 在具备权限的环境中补跑真实本地监听与 Playwright 浏览器 E2E。

## 2026年6月18日 - boot 失败报告路径完成

### 完成内容

- `runHardeningTool` 在 boot 失败或缺少 start command 时不再直接中断：
  - 写入失败 `boot-result.json`。
  - 写入空 `findings.json`。
  - 生成测试占位。
  - 生成 `hardening-report.md`。
- boot session 仍在 `finally` 中执行 `stop()`。
- 验收清单中“boot 失败时仍生成失败报告”已标记完成。

### 测试结果

- `pnpm test:unit`：通过，10 个测试文件，27 个测试。
- 非监听集成测试：通过，9 个测试文件，13 个测试。
- `pnpm test:e2e`：通过，1 个测试文件，1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 在具备权限的环境中补跑真实本地监听与 Playwright 浏览器 E2E。
- 增强默认 Playwright driver 的表单填写与 trace artifact。

## 2026年6月18日 - Playwright submit 交互语义修正完成

### 完成内容

- 默认 Playwright driver 的交互候选增加 `kind`：
  - 普通点击：`click`
  - submit 控件：`form`
- submit 控件点击后若 URL 和 body text 均无变化，记录为 `form_failure`，不再误归类为 `dead_control`。
- submit 点击抛错时也记录为 `form_failure`。

### 测试结果

- `pnpm test:unit`：通过，10 个测试文件，28 个测试。
- 非监听集成测试：通过，9 个测试文件，13 个测试。
- `pnpm test:e2e`：通过，1 个测试文件，1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 增强表单输入填充，而不仅是 submit 控件点击。
- 在具备权限的环境中补跑真实本地监听与 Playwright 浏览器 E2E。

## 2026年6月18日 - 真实 Playwright driver 探测完成

### 完成内容

- 安装 Playwright Chromium 浏览器二进制。
- 默认沙箱内启动 Chromium 失败，已记录到 `docs/logs/blockers.md`。
- 提权验证 Playwright 原生 data URL 探测成功。
- 提权验证项目 `createPlaywrightBrowserDriver` data URL 探测成功：
  - 捕获 `bodyText`。
  - 写入截图 artifact。
  - 产生基础交互结果。
- 修复真实 driver 探测发现的问题：
  - `page.$$eval` 的浏览器上下文函数不能引用 Node 侧 helper。
  - `tsx/esbuild` 会向函数注入 `__name`，浏览器上下文不可见。
  - 已改为无闭包 `Function` 字符串，保证传入浏览器的函数自包含。

### 测试结果

- `pnpm test:unit`：通过，10 个测试文件，28 个测试。
- 非监听集成测试：通过，9 个测试文件，13 个测试。
- `pnpm test:e2e`：通过，1 个测试文件，1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 仍需在提权或非沙箱环境中补跑真实本地 server + Playwright 完整 E2E。
- 增强表单输入填充与 trace artifact。

## 2026年6月18日 - 完整 browser hardening E2E 完成

### 完成内容

- 新增 `tests/e2e/run-browser.e2e.test.ts`：
  - 默认跳过。
  - 设置 `HARDENING_E2E_BROWSER=1` 时运行。
  - 创建本地 fixture server。
  - 执行 `hardening run <repo> --browser`。
  - 验证截图 artifact、交互结果、`dead_control` finding 和报告。
- 提权运行完整 integration tests 通过。
- 提权运行聚合 `pnpm test` 通过。
- 提权运行完整 browser hardening E2E 通过。

### 测试结果

- `pnpm test:integration`（提权）：通过，11 个测试文件，15 个测试。
- `pnpm test`（提权）：通过，22 个测试文件、44 个测试；1 个可选 browser E2E 跳过。
- `HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts`（提权）：通过，1 个测试文件，1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 进入真实用户项目验收前，补充更严格的表单输入填充和 trace artifact。
- 在 README 中补充可选 browser E2E 命令。

## 2026年6月18日 - Benchmark 验证完成

### 完成内容

- 新增 `fixtures/benchmark/` 下 5 个本地半真实 benchmark repo：
  - `next-console`
  - `next-server-error`
  - `react-blank`
  - `vite-basic`
  - `vite-broken-route`
- 新增 `src/internal/benchmark/report.ts`：
  - 汇总 benchmark 结果。
  - 生成 `docs/logs/spike-results.md` Markdown。
- 新增 `scripts/run-benchmark.mjs` 和 `pnpm benchmark`。
- Benchmark runner 会复制 fixture 到 `benchmark-runs/`，执行 `node dist/adapters/cli/index.js run <repo> --browser`，并保留每个 repo 的 hardening artifacts。
- 运行 benchmark 通过：
  - 5/5 repo 完成完整流程。
  - 每个 repo 均生成至少 1 个 Playwright spec。
  - 总耗时约 11 秒，低于 15 分钟预算。
  - `docs/logs/spike-results.md` 已生成。
- 修复聚合测试扫描 benchmark 产物的问题：
  - `benchmark-runs/**` 加入 `.gitignore`。
  - `benchmark-runs/**` 加入 ESLint ignore。
  - `benchmark-runs/**` 加入 Vitest exclude。

### 测试结果

- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed。
- `pnpm test:unit`：通过，11 个测试文件，30 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `pnpm test:integration`（提权）：通过，11 个测试文件，15 个测试。
- `pnpm test`（提权）：通过，23 个测试文件、46 个测试；1 个可选 browser E2E 跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 当前 MVP 已具备请求用户验收的证据基础。
- 真实项目验收仍需用户提供或指定 repo 后执行。

## 2026年6月18日 - Benchmark generated tests 实际执行验证完成

### 完成内容

- 新增开发依赖 `@playwright/test@1.61.0`。
- Benchmark runner 增强：
  - 每个 repo 完成 hardening run 后，重新启动 fixture app。
  - 使用 `HARDENING_BASE_URL` 执行生成的 `tests/hardening/*.spec.ts`。
  - 将 `generatedTestValidation` 写入 `docs/logs/spike-results.md`。
- 修复 generated tests 重复 title 问题：
  - test title 增加序号前缀。
  - 避免 Playwright 因重复标题拒绝执行。
- 调整 boot 集成测试 timeout：
  - full suite 并行负载下，本地 server 启动可能超过 10 秒。
  - 测试使用与产品默认一致的 30 秒 boot timeout，Vitest case timeout 调整为 45 秒。

### Benchmark 结果

- `pnpm benchmark`（提权）：通过，Go。
- 5/5 repo 完成完整流程。
- 5/5 generated Playwright specs 实际执行通过。
- 总耗时约 2 分钟 1 秒，低于 15 分钟预算。
- `docs/logs/spike-results.md` 已更新。

### 测试结果

- `pnpm test:unit`：通过，11 个测试文件，31 个测试。
- `pnpm test`（提权）：通过，23 个测试文件、47 个测试；1 个可选 browser E2E 跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 请求用户用真实项目执行验收：`pnpm build && node dist/adapters/cli/index.js run <repo> --browser`。

## 2026年6月18日 - 用户验收材料补齐

### 完成内容

- 新增 `docs/architecture/architecture.md`：
  - 主流程架构图。
  - CLI/MCP/Core/Artifacts 分层说明。
  - 本地优先和隐私边界。
  - boot session 生命周期。
  - 测试金字塔与 benchmark 覆盖。
- 新增 `docs/acceptance/user-acceptance-guide.md`：
  - 安装与构建步骤。
  - 质量门禁命令和当前结果。
  - CLI 验收命令。
  - MCP stdio 配置示例。
  - Benchmark 验收方式。
  - 报告样例检查项。
  - 真实项目验收命令。
  - 已知限制和验收结论模板。
- 更新 README 和验收清单，将上述文档纳入正式验收入口。

### 下一步

- 运行轻量验证，确认文档引用与项目状态一致。
- 等待用户指定真实 repo 或直接进行用户验收。

## 2026年6月18日 - 真实项目运行控制参数补齐

### 完成内容

- CLI `explore` / `run` 增加真实项目探索控制：
  - `--critical-path <path>`：可重复传入关键业务路径。
  - `--max-routes <n>`：限制探索路由数量。
  - `--max-actions-per-route <n>`：限制每个路由的基础交互数量，允许传 `0` 禁用交互。
  - `--start-command <command>`：`run` 自动启动时覆盖推断启动命令。
  - `--boot-timeout-ms <ms>`：`run` 自动启动时覆盖启动超时。
- MCP `explore_app` / `run_hardening` 与 CLI 对齐：
  - 支持 `criticalPaths`、`maxRoutes`、`maxActionsPerRoute`、`browser`。
  - `run_hardening` 支持 `startCommand` 和 `bootTimeoutMs`。
  - 对探索控制参数增加 MCP 层校验：路由数/超时必须为正整数，交互数必须为非负整数。
- 补充测试覆盖：
  - CLI 参数解析覆盖关键路径、探索上限、启动命令和超时。
  - `runHardeningTool` 集成测试覆盖探索控制参数传递。
  - MCP registry 单测覆盖非法正整数和负交互数拒绝。
- 更新 README 和 `docs/acceptance/user-acceptance-guide.md`，补齐真实项目验收命令和参数说明。

### 测试结果

- `pnpm test:unit`：通过，11 个测试文件、36 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，23 个测试文件、53 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 发现与处理

- 当前目录不是 Git 仓库，无法使用 `git diff/status` 生成变更汇总；本轮使用文件检查与测试输出记录状态。

### 下一步

- 指定一个真实 Web App repo，执行真实项目验收命令。
- 根据真实验收结果决定是否进入下一切片：表单填充、登录态支持、破坏性动作 guardrails 或自动 patch 生成。

## 2026年6月18日 - 浏览器探索破坏性动作防护完成

### 完成内容

- Playwright browser driver 增加默认高风险动作跳过：
  - 基于按钮/链接描述、aria/title/name、data-testid/id、href/action 等线索识别风险。
  - 默认跳过删除、移除、销毁、归档、停用、禁用、清空、重置、退出登录、支付、购买、订阅、退款、转账、提现等动作。
  - 跳过结果记录为 `skipped_unsafe` interaction，不执行点击。
- `maxActionsPerRoute` 语义更精确：
  - 高风险跳过不计入已执行 action 数。
  - 普通安全候选仍可在 action limit 内继续探索。
- `exploreApp` 明确不把 `skipped_unsafe` 当成 finding：
  - 跳过危险动作是安全证据，不是应用缺陷。
  - `dead_control` 和 `form_failure` 仍继续映射为 actionable findings。
- 更新 README、架构说明和用户验收指南，将破坏性动作防护纳入当前能力。

### 测试结果

- `pnpm vitest run tests/unit/playwright-driver.test.ts`：通过，4 个测试。
- `pnpm vitest run tests/unit/playwright-driver.test.ts tests/unit/explore-app.test.ts`：通过，2 个测试文件、10 个测试。
- `pnpm test:unit`：通过，11 个测试文件、38 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，23 个测试文件、55 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed，5/5 generated specs passed，总耗时约 20 秒。

### 下一步

- 后续增强优先级：表单填充、登录态支持、复杂多步业务流、自动 patch 生成。

## 2026年6月18日 - 安全表单填充切片完成

### 完成内容

- Playwright browser driver 在 submit/form 交互前增加安全表单填充：
  - 支持 `input` 和 `textarea` 候选字段。
  - 对 email、tel、url、number、search、text/textarea 使用固定测试值。
  - 跳过 disabled、readonly、hidden、file、checkbox、radio、submit/button 等不适合填充的字段。
  - 跳过 password、secret、token、API key、OTP/2FA/MFA、信用卡、CVV、SSN、银行账户等敏感字段。
- interaction evidence 增加 `fields_filled=<n>` 和 `fields_skipped=<n>`：
  - 不记录填充值，避免报告泄露或误导。
  - 字段填充发生在点击 submit 前，便于真实表单暴露验证、提交和运行时问题。
- 补充 TDD 单测：
  - 验证安全字段被填入确定性测试值。
  - 验证敏感字段不会被填入。
  - 验证 submit 交互仍按 `form_failure` / `ok` 语义记录。
- 更新 README、架构说明、测试策略和用户验收指南。

### 测试结果

- `pnpm vitest run tests/unit/playwright-driver.test.ts`：通过，5 个测试。
- `pnpm vitest run tests/unit/playwright-driver.test.ts tests/unit/explore-app.test.ts tests/integration/explore-tool.test.ts`：通过，3 个测试文件、12 个测试。
- `pnpm test:unit`：通过，11 个测试文件、39 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，23 个测试文件、56 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed，5/5 generated specs passed，总耗时约 19 秒。

### 下一步

- 后续增强优先级：登录态支持、复杂多步业务流、trace artifact、自动 patch 生成。

## 2026年6月18日 - storageState 登录态支持完成

### 完成内容

- CLI `explore` / `run` 增加 `--storage-state <path>`：
  - 传入 Playwright storageState JSON 文件路径。
  - 与 `--browser` 配合使用，探索已登录页面。
- MCP `explore_app` / `run_hardening` 增加 `storageStatePath`：
  - tool schema 显式暴露该字段。
  - handler 创建 browser driver 时透传该路径。
- Playwright browser driver 支持 storageState context：
  - 未传 `storageStatePath` 时沿用 `browser.newPage()`。
  - 传入后使用 `browser.newContext({ storageState })` 创建隔离上下文。
  - snapshot 完成后关闭 page 和 context，避免 session 泄漏。
- 补充 TDD 单测：
  - CLI 参数解析覆盖 `--storage-state`。
  - driver 覆盖 context 创建参数和 context 关闭。
  - MCP registry 覆盖 schema 暴露。
- 更新 README、架构说明、测试策略和用户验收指南。

### 测试结果

- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/playwright-driver.test.ts`：通过，2 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/playwright-driver.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，3 个测试文件、17 个测试。
- `pnpm test:unit`：通过，11 个测试文件、41 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，23 个测试文件、58 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed，5/5 generated specs passed，总耗时约 19 秒。

### 下一步

- 后续增强优先级：复杂多步业务流、trace artifact、自动 patch 生成。

## 2026年6月18日 - Playwright trace artifact 支持完成

### 完成内容

- CLI `explore` / `run` 增加 `--trace`：
  - 默认不输出 trace，避免 artifact 体积无控制增长。
  - 开启后每个 browser snapshot 输出 `.trace.zip` 到 `.hardening/artifacts`。
- MCP `explore_app` / `run_hardening` 增加 `trace`：
  - tool schema 显式暴露该字段。
  - handler 创建 browser driver 时透传 trace 开关。
- Playwright browser driver 支持 context tracing：
  - trace 开启时强制使用 browser context，即使未传 storageState。
  - snapshot 开始前启动 tracing，交互完成后停止并写入 trace zip。
  - trace zip 路径写入 `artifactFiles`，与截图一起进入 run/report artifact 链路。
  - 异常路径中也尝试停止 tracing 并关闭 page/context，避免资源泄漏。
- 补充 TDD 单测：
  - CLI 参数解析覆盖 `--trace`。
  - driver 覆盖 trace start/stop、trace zip 路径和 artifactFiles。
  - MCP registry 覆盖 schema 暴露。
- 更新 README、架构说明、测试策略和用户验收指南。

### 测试结果

- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/playwright-driver.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，3 个测试文件、18 个测试。
- `pnpm test:unit`：通过，11 个测试文件、42 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts`（提权）：通过，真实 Chromium 生成 `.trace.zip`。
- `pnpm test`（提权）：通过，23 个测试文件、59 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed，5/5 generated specs passed，总耗时约 20 秒。

### 下一步

- 后续增强优先级：复杂多步业务流、自动 patch 生成。

## 2026年6月18日 - 非空 patch.diff 生成完成

### 完成内容

- `harden_report` 不再写入空 `patch.diff`：
  - 生成 `docs/hardening-remediation.md` 的新增文件 diff。
  - remediation plan 包含 findings、severity、type、repro、evidence、generated tests 和验证命令。
  - 若 generated Playwright specs 已落盘，将对应测试文件作为新增文件 diff 纳入 `patch.diff`。
  - 报告和 patch 输出会清除 ANSI escape 和不可见控制字符，避免污染 Markdown/diff。
- 明确 patch 边界：
  - `patch.diff` 是可人工审查的 remediation/test patch。
  - 当前不会自动修改业务源码，避免在没有源码定位和用户确认的情况下生成危险修复。
- 补充 TDD 测试：
  - unit 覆盖 remediation plan diff、finding 内容和 generated spec diff。
  - integration 覆盖 `runHardenReportTool` 不再返回空 patch。
- 更新 README、测试策略和用户验收指南，移除 `patch.diff` 占位描述。

### 测试结果

- `pnpm vitest run tests/unit/harden-report.test.ts tests/integration/harden-report-tool.test.ts`：通过，2 个测试文件、2 个测试。
- `pnpm test:unit`：通过，11 个测试文件、42 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、16 个测试。
- `pnpm test:e2e`：通过，1 个测试文件、1 个测试；1 个可选 browser E2E 跳过。
- `HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts`（提权）：通过，真实 Chromium 生成 `.trace.zip`。
- `pnpm test`（提权）：通过，23 个测试文件、59 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，Go，5/5 repo completed，5/5 generated specs passed，总耗时约 21 秒。

### 下一步

- 后续增强优先级：复杂多步业务流、业务源码级 patch 生成。

## 2026年6月18日 - 验收运行入口完成

### 完成内容

- 新增 `src/internal/acceptance/report.ts`：
  - 汇总验收检查项。
  - 以必需项失败数判定整体通过/未通过。
  - 生成分组 Markdown 验收报告。
- 新增 `src/internal/acceptance/run-acceptance.ts`：
  - `pnpm acceptance` 运行快速本地门禁与关键文档/产物检查。
  - `pnpm acceptance -- --full` 额外运行完整 integration tests 和 benchmark。
  - `pnpm acceptance -- --full --browser` 额外运行真实 Chromium trace E2E。
  - 报告写入 `docs/acceptance/acceptance-run.md`。
  - 运行入口使用 `preacceptance -> pnpm build` 和 `node dist/internal/acceptance/run-acceptance.js`，避免 `tsx` 在沙箱内创建 IPC pipe 时触发 `listen EPERM`。
  - 参数解析兼容 pnpm 转发的独立 `--` 分隔符。
  - 直接运行判断兼容工作区路径含空格的情况。
- 新增 `tests/unit/acceptance-report.test.ts`，以 TDD 覆盖验收汇总、失败判定和 Markdown 输出。
- 更新 README、测试策略、用户验收指南和验收清单。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：通过，1 个测试文件、5 个测试。
- `pnpm test:unit`：通过，14 个测试文件、56 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、73 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance`：通过，standard 模式 12/12 检查通过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 21 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。

### 下一步

- 等待用户指定真实 Web App repo 做最终人工验收。
- 根据真实项目验收反馈决定是否进入复杂多步业务流或业务源码级 patch 生成。

## 2026年6月18日 - Goal 完成度审计完成

### 完成内容

- 新增 `src/internal/acceptance/goal-audit.ts`：
  - 汇总 `docs/goals/codex-goal.md` 的关键成功条件。
  - 将每个条件标记为已通过、缺失或需要人工确认。
  - 保守判定：自动证据齐全时只进入“已准备好请求用户验收”，不自动标记长期 goal complete。
- 新增 `src/internal/acceptance/run-goal-audit.ts`：
  - 检查 CLI/MCP bin、P0 tools、完整工作流、完整验收报告、benchmark、Required Documents、本地优先与隐私边界。
  - 写入 `docs/acceptance/goal-completion-audit.md`。
- 新增 `tests/unit/goal-audit.test.ts`，覆盖“只有用户确认缺失时不能声称完成”的判定规则。
- 新增 package scripts：`pregoal:audit` 和 `goal:audit`。
- 更新 README、测试策略、用户验收指南、验收清单和决策日志。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、3 个测试。
- `pnpm goal:audit`：通过，生成 `docs/acceptance/goal-completion-audit.md`；9 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm test:unit`：通过，13 个测试文件、50 个测试。
- `pnpm test`（提权）：通过，25 个测试文件、67 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 21 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。

### 下一步

- 继续等待用户提供真实 Web App repo 或明确验收结论。
- 在真实项目验收后，将用户结论补入验收记录，再判断长期 goal 是否可以标记 complete。

## 2026年6月18日 - 真实项目验收 Runner 完成

### 完成内容

- 新增 `src/internal/acceptance/user-acceptance.ts`：
  - 汇总真实项目验收 artifact 检查。
  - 生成 `docs/acceptance/user-acceptance-record.md`。
  - 区分验收运行通过和用户结论：`pending`、`accepted`、`changes_requested`。
- 新增 `src/internal/acceptance/run-user-acceptance.ts`：
  - `pnpm user:accept -- --repo <repo>` 调用现有 `runHardeningTool`，不复制第二套流程。
  - 支持 `--url`、`--browser`、`--trace`、`--critical-path`、`--max-routes`、`--max-actions-per-route`、`--start-command`、`--boot-timeout-ms`、`--storage-state`、`--decision` 和 `--notes`。
  - 检查 `hardening-report.md`、`findings.json`、`patch.diff`、generated Playwright spec，以及 browser 模式下的 artifacts。
- `pnpm goal:audit` 已升级：
  - 当 `docs/acceptance/user-acceptance-record.md` 同时包含验收运行通过和 `用户确认通过` 时，用户验收项可自动转为已通过。
  - 当前模板仍保持待确认状态，不会误判为完成。
- 新增 `tests/unit/user-acceptance.test.ts`，覆盖验收记录汇总、pending 结论和 pnpm 参数转发解析。
- 更新 README、测试策略、用户验收指南和验收清单。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、9 个测试。
- `pnpm user:accept -- --repo /tmp/<fixture-copy>/vite-basic --url http://127.0.0.1:9 --output docs/acceptance/user-acceptance-record.md`：通过，验证 runner 可生成 report、findings、patch 和 generated spec。随后已将 `docs/acceptance/user-acceptance-record.md` 恢复为待真实项目验收模板，避免把 fixture smoke 误记为最终用户验收。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 等待用户提供真实 Web App repo 路径。
- 执行 `pnpm user:accept -- --repo <repo> --browser --decision pending`。
- 若用户确认通过，执行 `pnpm user:accept -- --repo <repo> --browser --decision accepted` 和 `pnpm goal:audit`，再进行长期 goal completion audit。

## 2026年6月18日 - MCP P0 纵向协议测试完成

### 完成内容

- 扩展 `tests/integration/mcp-server.test.ts`：
  - 通过 MCP memory transport 列出 tools。
  - 通过协议级 `tools/call` 依次调用 `analyze_repo`、`boot_app`、`explore_app`、`generate_tests`、`harden_report` 和 `stop_app`。
  - 使用临时 Node HTTP fixture 验证 `boot_app` 真实启动本地 app，`explore_app` 访问运行 URL，`generate_tests` 写入 Playwright spec，`harden_report` 写入 Markdown report 和 `patch.diff`。
- 将 `pnpm goal:audit` 的 P0 MCP 证据升级为 registry 暴露 + MCP 协议级纵向测试双证据。

### 已验证

- `pnpm vitest run tests/integration/mcp-server.test.ts`（提权）：通过，1 个测试文件、2 个测试。
- `pnpm test:integration`（提权）：通过，11 个测试文件、17 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、74 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 21 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。

### 下一步

- 等待用户提供真实 Web App repo 路径并执行 `pnpm user:accept`。

## 2026年6月18日 - user:accept 生成测试执行验证完成

### 完成内容

- `pnpm user:accept` 新增 `--validate-generated-tests`：
  - 默认不执行生成的 Playwright spec，避免普通验收成本过高。
  - 开启后将 generated spec 执行验证作为必需检查项。
  - 当前要求同时传入 `--url`，确保被测应用在验证期间保持运行。
  - 使用 hardening-mcp 自带的 Playwright runtime，并在目标 repo cwd 下执行 generated spec，避免要求用户项目预装 `@playwright/test`。
- `docs/acceptance/user-acceptance-record.md` 模板已更新，说明如何执行真实项目验收和 generated spec 验证。
- 更新 README、测试策略、用户验收指南和验收清单。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm test:unit`：通过，14 个测试文件、58 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、76 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 28 秒。
- `pnpm user:accept -- --repo /tmp/<fixture-copy>/vite-basic --url http://127.0.0.1:<port> --validate-generated-tests --output docs/acceptance/user-acceptance-record.md`（提权）：通过，验证生成的 Playwright spec 可执行。随后已将 `docs/acceptance/user-acceptance-record.md` 恢复为待真实项目验收模板，避免把 fixture smoke 误记为最终用户验收。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

### 下一步

- 等待用户提供真实 Web App repo 路径和运行 URL。
- 执行 `pnpm user:accept -- --repo <repo> --url <running-url> --browser --validate-generated-tests --decision pending`。

## 2026年6月18日 - user:accept 自动 boot 生成测试验证完成

### 完成内容

- `pnpm user:accept -- --validate-generated-tests` 不再要求用户同时传入 `--url`：
  - 当未传 `--url` 时，runner 会包装 `runHardeningTool` 的 boot 流程。
  - `hardening run` 阶段仍使用自动启动的 app 完成探索、测试生成和报告。
  - runner 会延迟停止自动启动的 app，直到 generated Playwright spec 执行验证结束。
  - 如果用户或 CI 已有运行中的服务，仍可传入 `--url <running-url>` 复用现有 app。
- 新增 `shouldManageGeneratedTestBootSession` 纯函数，明确何时需要托管 boot session，并用单元测试锁定行为。
- 更新 README、测试策略、用户验收指南、验收记录模板和验收清单。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm test:unit`：通过，14 个测试文件、60 个测试。
- `pnpm test`（沙箱）：因本地监听权限限制失败，失败集中在 boot/MCP 本地 server 用例。
- `pnpm test`（提权）：通过，26 个测试文件、78 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm user:accept -- --repo /tmp/<fixture-copy>/vite-basic --validate-generated-tests --output /tmp/<record>.md`（提权）：通过，验证无 `--url` 时 runner 会保持自动 boot 的 app 存活直到 generated Playwright spec 执行完成；验收记录写入 `/tmp`，未覆盖真实验收模板。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 19 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 自然语言关键路径种子完成

### 完成内容

- 补齐 MVP 规格中的“自然语言关键路径”路径来源：
  - `--critical-path` 和 MCP `criticalPaths` 继续支持明确 URL/path。
  - 当输入是短自然语言意图时，探索层会用本地确定性关键词表扩展为少量常见业务路由候选。
  - 示例：`测试登录、创建项目并发送一条聊天消息` 会种子化为 `/login`、`/projects/new`、`/projects` 和 `/chat`。
- 新增 `expandCriticalPathInput`，将 intent 解析集中在探索层，CLI 和 MCP 共享同一行为。
- 修复 `pnpm user:accept` 验收记录中的命令格式：
  - repo 路径、自然语言 critical path、start command、notes 等包含空格或非 ASCII 字符的参数会自动 shell quote。
  - 生成的验收命令现在可作为复现证据复制运行。
- 更新 CLI help、MCP tool schema 描述、README 和用户验收指南。

### TDD 记录

- Red：新增 `tests/unit/explore-app.test.ts` 用例后，当前实现会把中文意图当成 URL 编码路径，2 个测试失败。
- Green：实现本地 intent expander 并接入 `seedQueue`，相关测试通过。

### 已验证

- `pnpm vitest run tests/unit/explore-app.test.ts tests/unit/cli-options.test.ts`：通过，2 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm test:unit`：通过，14 个测试文件、64 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、82 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm user:accept -- --repo /tmp/<fixture-copy>/vite-basic --critical-path "测试登录、创建项目并发送一条聊天消息" --validate-generated-tests --notes "needs reviewer confirmation" --output /tmp/<record>.md`（提权）：通过，验证自然语言 critical path、自动 boot generated spec 验证和可复制验收命令输出。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 44 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 关键路径 smoke test 生成完成

### 完成内容

- `generate_tests` 新增可选 `smokeRoutes` 输入。
- `run_hardening` 会把 `explore_app` 实际访问过的 `visitedRoutes` 传给 `generate_tests`。
- 生成的 Playwright spec 现在会同时包含：
  - findings 对应的回归测试。
  - 尚未被 finding 覆盖的已探索关键路径 smoke tests。
- README、测试策略、用户验收指南和决策日志已更新。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，生成器仍只写入默认首页 smoke，未覆盖 `/login` 和 `/projects/new`。
- Red：扩展 `tests/integration/run-hardening-tool.test.ts` 后，完整 run 未将探索到的 `/settings` 写入 generated spec。
- Green：实现 `smokeRoutes` test case 生成，并在 after-boot/explore 编排分支传入 `explore.visitedRoutes`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/integration/run-hardening-tool.test.ts`：通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/unit/generate-tests.test.ts tests/integration/run-hardening-tool.test.ts`：通过，2 个测试文件、8 个测试。
- `pnpm test:unit`：通过，14 个测试文件、65 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、83 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 26 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - generate_tests smokeRoutes 入口暴露完成

### 完成内容

- 独立 CLI `hardening generate-tests` 新增 `--smoke-route <path-or-url>`，可重复传入。
- MCP `generate_tests` tool 新增 `smokeRoutes` 输入。
- CLI、MCP 和 `run_hardening` 现在都能把关键路径传入同一个 `generatePlaywrightTests` 核心实现。
- 更新 README、架构说明、技术 spike plan 和用户验收指南。

### TDD 记录

- Red：新增 CLI parser 和 CLI artifact 测试后，`parseGenerateTestsOptions` 不存在，CLI 仍忽略 `--smoke-route`。
- Red：扩展 MCP P0 协议测试后，`generate_tests` 忽略 `smokeRoutes`，生成 spec 仍只包含默认 `/` smoke。
- Green：实现 `parseGenerateTestsOptions`、CLI 传参、MCP schema 和 MCP call 传参。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts tests/integration/cli-generated-artifacts.test.ts`：通过，2 个测试文件、11 个测试。
- `pnpm vitest run tests/integration/mcp-server.test.ts`（提权）：通过，1 个测试文件、2 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/mcp-server.test.ts`（提权）：通过，3 个测试文件、13 个测试。
- `pnpm test:unit`：通过，14 个测试文件、67 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、85 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 35 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 报告 verification command 完成

### 完成内容

- `harden_report` 在 Markdown 报告的“测试生成”表格中新增 `verificationCommand`。
- `docs/hardening-remediation.md` 的 patch diff 中新增同样的 verification command。
- 当 boot result 有 URL 时，命令会自动带上 `HARDENING_BASE_URL=<boot-url>`，避免用户复制 generated test command 后误跑默认 `localhost:3000`。
- 更新用户验收指南和测试策略。

### TDD 记录

- Red：新增 `tests/unit/harden-report.test.ts` 断言后，报告和 patch diff 都缺少 `HARDENING_BASE_URL=http://localhost:3000 npx playwright test tests/hardening`。
- Green：实现 `buildVerificationCommand` 和 shell quoting，报告与 remediation patch 都写入可复制验证命令。

### 已验证

- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts tests/integration/harden-report-tool.test.ts`：通过，2 个测试文件、2 个测试。
- `pnpm test:unit`：通过，14 个测试文件、67 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、85 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，总耗时约 22 秒。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。

### 下一步

- 运行 `pnpm goal:audit`，确认自动证据仍齐全且长期 goal 仍等待用户真实项目验收。

## 2026年6月18日 - generated testCommand shell-safe 完成

### 完成内容

- 新增 `src/shared/shell-quote.ts`，统一 shell 参数转义逻辑。
- `generatePlaywrightTests` 生成的 `testCommand` 现在会在输出目录含空格或特殊字符时自动加引号。
- `harden_report` 的 verification command 复用同一个 shell quoting helper，避免报告命令和测试命令转义规则分叉。
- `user:accept` 命令格式化也复用共享 helper，移除验收模块里的重复本地实现。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`outputDir` 含空格时生成的 `npx playwright test ...` 命令未加引号，无法直接复制执行。
- Green：实现共享 `shellQuoteArg` 并接入测试生成与报告模块，含空格路径输出为 `npx playwright test '<path with spaces>'`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、5 个测试。
- `pnpm vitest run tests/unit/generate-tests.test.ts tests/unit/harden-report.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/harden-report-tool.test.ts`：通过，4 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/generate-tests.test.ts tests/unit/harden-report.test.ts tests/integration/harden-report-tool.test.ts`：通过，4 个测试文件、16 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、68 个测试。
- `pnpm test`：沙箱内因本地应用启动/端口环境限制失败，3 个 integration boot/MCP 用例未进入 running 状态。
- `pnpm test`（提权）：通过，26 个测试文件、86 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 19 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - smokeRoutes 空白归一化完成

### 完成内容

- `generatePlaywrightTests` 现在会对 `smokeRoutes` 的每一项先执行前后空白归一化。
- 用户从 CLI/MCP/`run_hardening` 传入带前后空格的 `/path` 或 URL 时，生成的 Playwright smoke spec 仍会覆盖正确路由。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`smokeRoutes: ['  /login  ']` 被忽略，生成 spec 只包含其他可解析路由。
- Green：在 `extractPathFromRoute` 中先 `trim()` 再解析 URL 或相对路径。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/generate-tests.test.ts tests/unit/cli-options.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/mcp-server.test.ts tests/integration/run-hardening-tool.test.ts`（提权）：通过，5 个测试文件、23 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、69 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、87 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 20 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - user:accept 参数值归一化完成

### 完成内容

- `pnpm user:accept` 的 option value reader 现在会清理参数值前后空白。
- `--repo " path "`、`--url " http://... "`、`--decision " accepted "`、`--critical-path " /login "` 等复制粘贴场景不再因为外层空白导致验收失败或路径误解析。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`--decision " accepted "` 会触发 `--decision must be pending, accepted, or changes_requested`。
- Green：在 `readOptionValue` 中对 inline value 和 next-arg value 统一 `trim()`，并继续对空值报错。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/generate-tests.test.ts`：通过，4 个测试文件、26 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、70 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、88 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 19 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - CLI 多余位置参数校验完成

### 完成内容

- `hardening analyze` 现在会对第二个位置参数返回 `Unexpected argument`。
- `hardening report` 现在会对第三个位置参数返回 `Unexpected argument`。
- `hardening run` / `hardening explore` 共享的 repo/url parser 现在会对第三个位置参数返回 `Unexpected argument`。
- `hardening generate-tests` 现在会对 `<findingsPath> <outputDir>` 之后的多余位置参数返回 `Unexpected argument`。
- 这避免真实验收命令拼错时静默忽略尾部参数，提升 CLI 可复现性和错误可观察性。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/cli-options.test.ts` 用例后，`run/explore/generate-tests/analyze/report` 的多余位置参数仍被静默忽略。
- Green：在 `parseRepoUrlOptions` 和 `parseGenerateTestsOptions` 返回值中检查 `positional[2]`；在 `runAnalyze` 和 `runReport` 执行工具前复用 `unexpectedPositionalArgument`。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/integration/cli-generated-artifacts.test.ts`：通过，2 个测试文件、15 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、74 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、92 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 31 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - CLI option 参数值归一化完成

### 完成内容

- `hardening run` / `hardening explore` 的 next-arg option 值现在会清理前后空白。
- `--critical-path " /login "`、`--start-command " pnpm preview "`、`--storage-state " .auth/user.json "` 等复制粘贴场景会归一化为真实值。
- `hardening generate-tests --smoke-route " /settings "` 现在会生成 `/settings` smoke route，而不是保留外层空白。
- 仅归一化 option 值，不修改 repo、url、outputDir 等位置参数，避免破坏理论上带前后空白的真实路径。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/cli-options.test.ts` 用例后，next-arg 形式的 `--critical-path`、`--start-command`、`--storage-state`、`--smoke-route` 仍保留外层空白。
- Green：在 CLI 共享 `readOptionValue` 中对 next-arg value 统一 `trim()`，复用到字符串 option 和整数 option。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/integration/cli-generated-artifacts.test.ts`：通过，2 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、76 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、94 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 20 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 报告 Markdown 表格转义完成

### 完成内容

- `harden_report` 生成的 Markdown 表格现在会对单元格中的 `|` 做转义。
- 表格单元格中的换行会被归一化为空格，避免真实项目命令、URL 或文件名把报告表格拆坏。
- 变更范围限定在报告表格单元格，不影响发现项正文、remediation 文档和 patch diff 的文本内容。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/harden-report.test.ts` 用例后，`framework`、`recommendedStartCommand`、`url`、`createdFiles`、`testCommand`、`verificationCommand` 中的 `|` 会破坏 Markdown 表格，换行也会拆成额外行。
- Green：新增 `formatTableCell`，在表格渲染处统一调用 `cleanText`、换行单行化和管道转义。

### 已验证

- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、2 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts tests/integration/harden-report-tool.test.ts`：通过，2 个测试文件、3 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，14 个测试文件、77 个测试。
- `pnpm test`（提权）：通过，26 个测试文件、95 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - shell quote 控制字符单行化完成

### 完成内容

- `shellQuoteArg` 现在会在参数包含换行、制表符、回车或其他控制字符时使用 ANSI-C quoting。
- `formatUserAcceptanceCommand` 输出的可复制 `pnpm user:accept` 命令不会因为 `--notes` 等参数包含换行而变成多行命令。
- 普通路径、URL、空格和单引号参数继续保持原有 POSIX 单引号行为，降低对已有命令输出的影响。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/shell-quote.test.ts` 和 `tests/unit/user-acceptance.test.ts` 用例后，多行 notes 会被真实换行写进生成命令，无法作为单行命令复制执行。
- Green：在 `shellQuoteArg` 中增加控制字符检测和 ANSI-C 字符串转义，覆盖 `\n`、`\r`、`\t`、单引号、反斜杠和其他控制字符。

### 已验证

- `pnpm vitest run tests/unit/shell-quote.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/shell-quote.test.ts tests/unit/user-acceptance.test.ts tests/unit/generate-tests.test.ts tests/unit/harden-report.test.ts tests/integration/harden-report-tool.test.ts tests/integration/cli-generated-artifacts.test.ts`：通过，6 个测试文件、26 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、81 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、99 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 用户验收记录表格转义完成

### 完成内容

- `buildUserAcceptanceMarkdown` 的摘要表现在会对真实项目路径、验收命令、hardening report 路径和 findings 路径统一做表格单元格转义。
- 摘要表中的 `|` 会被转义，`\n` / `\r\n` / `\r` 会被归一化为空格，避免真实验收证据表格被拆坏。
- Artifact 检查行继续复用同一 `escapeMarkdownCell` 逻辑。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`repoRoot`、`reportPath`、`findingsPath` 中的 `|` 和换行会破坏用户验收摘要表。
- Green：新增 `formatCodeCell`，并将摘要表 code cell 全部接入 `escapeMarkdownCell`；同时扩展换行处理覆盖 `\r\n` 和单独 `\r`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts`：通过，3 个测试文件、22 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、82 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、100 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 用户验收记录 code span 稳健化完成

### 完成内容

- `buildUserAcceptanceMarkdown` 的摘要表 code cell 现在会根据内容中最长连续反引号动态选择 Markdown code span fence。
- 真实项目路径、验收命令、report path 或 findings path 中包含反引号时，不再破坏 Markdown 渲染。
- 该改动复用现有表格单元格转义逻辑，继续保留 `|` 和换行归一化行为。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`repoRoot`、`command` 和 `reportPath` 中包含反引号会导致摘要表 code span 提前闭合。
- Green：`formatCodeCell` 计算最长反引号 run，并使用长度加一的 fence 包裹内容。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、13 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts`：通过，3 个测试文件、23 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、83 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、101 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - 用户验收记录边界反引号 code span 修复完成

### 完成内容

- `buildUserAcceptanceMarkdown` 的摘要表 code cell 现在会在值以反引号开头或结尾时使用 CommonMark padding 空格，避免 fence 与内容反引号粘连。
- 保留最长连续反引号加一的 fence 策略；仅边界反引号触发 padding，内部反引号输出不变。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`repoRoot`、`reportPath`、`findingsPath` 等值以反引号开头或结尾时会生成不稳定的 code span。
- Green：`formatCodeCell` 在边界反引号场景对 escaped 内容两侧添加 padding 空格，让 Markdown fence 与内容保持可解析边界。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts`：通过，3 个测试文件、24 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、84 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、102 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - MVP 验收报告 code cell 稳健化完成

### 完成内容

- `buildAcceptanceMarkdown` 的摘要报告路径和检查项命令列现在统一使用动态 Markdown code span。
- `outputPath` 和 `command` 中的 `|`、换行、内部反引号、边界反引号都会被处理，避免 `docs/acceptance/acceptance-run.md` 表格被拆坏或 code span 提前闭合。
- `escapeMarkdownCell` 现在覆盖 `\n`、`\r\n` 和单独 `\r`。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/acceptance-report.test.ts` 用例后，报告路径中的换行会拆坏摘要表，命令中的反引号会提前闭合 code span。
- Green：在 `src/internal/acceptance/report.ts` 中新增 `formatCodeCell` 和最长反引号 fence 计算，并在边界反引号场景添加 padding 空格。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，3 个测试文件、25 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、85 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、103 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - Goal 审计报告回车转义完成

### 完成内容

- `buildGoalAuditMarkdown` 的表格单元格转义现在会统一处理 `\n`、`\r\n` 和单独 `\r`。
- Goal 审计项的 `requirement`、`evidence`、`nextAction` 中出现管道和回车字符时，不再破坏 `docs/acceptance/goal-completion-audit.md` 表格。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，包含 `\r\n` 或单独 `\r` 的审计证据会把 Markdown 表格拆坏。
- Green：将 `goal-audit` 的 `escapeMarkdownCell` 改为 `value.replace(/\r?\n|\r/g, ' ').replaceAll('|', '\\|')`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，3 个测试文件、26 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，15 个测试文件、86 个测试。
- `pnpm test`（提权）：通过，27 个测试文件、104 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - Markdown formatter 共享化完成

### 完成内容

- 新增 `src/internal/acceptance/markdown.ts`，集中提供 `escapeMarkdownTableCell` 和 `formatMarkdownCodeCell`。
- `buildAcceptanceMarkdown`、`buildUserAcceptanceMarkdown`、`buildGoalAuditMarkdown` 现在复用同一套 Markdown 表格和 code cell 转义逻辑。
- 删除 acceptance report 和 user acceptance record 中重复的私有 `formatCodeCell` / `longestBacktickRun` 实现，降低后续报告格式维护风险。
- 新增 `tests/unit/markdown-format.test.ts`，直接覆盖共享 helper 的管道、换行、内部反引号、边界反引号行为。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/markdown-format.test.ts` 后，`src/internal/acceptance/markdown.ts` 尚不存在，测试因模块缺失失败。
- Green：实现共享 Markdown formatter，并将三个验收/审计报告生成器迁移到共享 helper；相邻报告测试继续保持原输出断言。

### 已验证

- `pnpm vitest run tests/unit/markdown-format.test.ts`：通过，1 个测试文件、3 个测试。
- `pnpm vitest run tests/unit/markdown-format.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，4 个测试文件、29 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、89 个测试。
- `pnpm test`（提权）：通过，28 个测试文件、107 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - Acceptance output 参数 trim 完成

### 完成内容

- `pnpm acceptance` 的 `--output <path>` 和 `--output=<path>` 现在会 trim 前后空白。
- 空白输出值会继续按缺失值处理，避免验收报告写入带前后空格的错误路径。
- 该行为与 `user:accept` 和主 CLI 的选项值处理保持一致。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/acceptance-report.test.ts` 用例后，`--output ' docs/custom.md '` 会解析成包含空格的路径。
- Green：在 `parseArgs` 中对分离值和等号值统一调用 `trim()`，并对 trim 后空字符串抛出 `Missing value for --output`。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、30 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、90 个测试。
- `pnpm test`（提权）：通过，28 个测试文件、108 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - Acceptance output 缺失值识别完成

### 完成内容

- `pnpm acceptance` 的分离写法 `--output <path>` 现在会拒绝把下一个选项误当成输出路径。
- `--output --full` 和 `--output ' --browser '` 会按缺失输出路径处理，报 `Missing value for --output`。
- 该行为与 `user:accept` 的 `readOptionValue` 规则保持一致，降低真实 CLI 使用时的误写入风险。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/acceptance-report.test.ts` 用例后，`parseArgs(['--output', '--full'])` 没有报错，而是把 `--full` 解析成输出路径。
- Green：在 `parseArgs` 的 `--output` 分离值分支中增加 `value.startsWith('--')` 缺失值判断。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、31 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、91 个测试。
- `pnpm test`（提权）：通过，28 个测试文件、109 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - user:accept 嵌套输出目录写入完成

### 完成内容

- `pnpm user:accept -- --output <path>` 现在会在写入用户验收记录前自动创建输出文件的父目录。
- 新增 `writeUserAcceptanceRecord`，把目录创建与写文件行为收敛为可单元测试的函数。
- 真实项目验收记录可直接写入类似 `artifacts/acceptance/user-acceptance.md` 的嵌套路径，减少人工验收落盘失败风险。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`writeUserAcceptanceRecord` 尚不存在，嵌套输出目录写入测试失败。
- Green：在写入前调用 `mkdir(dirname(outputPath), { recursive: true })`，并让 `main` 复用该写入函数。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、32 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、92 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、110 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - user:accept 自定义 output 复现命令完成

### 完成内容

- `pnpm user:accept` 的验收记录命令现在会在用户传入自定义 `--output` 时保留该参数。
- 默认 `docs/acceptance/user-acceptance-record.md` 不额外写入命令，避免默认命令冗余。
- 自定义输出路径会继续使用 shell quote，包含空格的验收记录路径可复制复现。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`formatUserAcceptanceCommand` 输出缺少自定义 `--output` 参数。
- Green：提取默认验收记录路径常量，并在 outputPath 非默认值时追加 `--output <path>`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、33 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、93 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、111 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 25 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - generated spec 验证命令 quoting 完成

### 完成内容

- `pnpm user:accept -- --validate-generated-tests` 写入验收记录时，generated Playwright spec 验证命令现在会 shell quote Playwright runner 路径和 spec 路径。
- 工作区路径或测试文件名包含空格时，记录中的验证命令仍可复制复现。
- 实际执行仍使用 `spawn(command, args)` 的参数数组，未改变 generated spec 验证运行语义。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`formatGeneratedTestValidationCommand` 尚不存在，路径含空格的命令无法验证 quoting。
- Green：新增 `formatGeneratedTestValidationCommand`，统一用 `shellQuoteArg` 格式化 runner 路径和 generated spec 相对路径，并让 `buildGeneratedTestValidationCheck` 复用。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、94 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、112 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 20 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - generated spec 验证命令 env 前缀完成

### 完成内容

- generated Playwright spec 验证命令现在会显式带上 `HARDENING_BASE_URL=<url>` 和 `NODE_PATH=<path>` 前缀。
- 该命令用于用户验收记录中的复现证据，避免复制命令时遗漏 generated spec 运行所需的 base URL 和本地依赖路径。
- `HARDENING_BASE_URL` 和 `NODE_PATH` 只记录运行所需的非敏感值；实际执行仍通过 `spawn` 的 env 参数传入，不改变运行行为。
- 更新用户验收指南和验收清单中的 benchmark 耗时。

### TDD 记录

- Red：更新 `tests/unit/user-acceptance.test.ts` 用例后，`formatGeneratedTestValidationCommand` 输出缺少 `HARDENING_BASE_URL` 和 `NODE_PATH` 前缀。
- Green：为 `formatGeneratedTestValidationCommand` 增加 `baseUrl` 和 `nodePath` 输入，并统一 shell quote env value。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、94 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、112 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 24 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - generated spec 验证命令 cwd 前缀完成

### 完成内容

- generated Playwright spec 验证命令现在会以 `cd <repoRoot> &&` 开头。
- 用户从验收记录复制命令时，不需要额外记住必须先进入真实项目根目录。
- repo 路径包含空格时会继续使用 shell quote；实际执行仍使用 `spawn` 的 `cwd` 参数，未改变验证运行行为。
- 更新用户验收指南和验收清单中的 benchmark 耗时。

### TDD 记录

- Red：更新 `tests/unit/user-acceptance.test.ts` 用例后，`formatGeneratedTestValidationCommand` 输出缺少 `cd <repoRoot> &&` 前缀。
- Green：为 `formatGeneratedTestValidationCommand` 增加 `repoRoot` 输入，并在 evidence 命令前追加可复制的 cwd 前缀。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、94 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、112 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - acceptance report 命令 quoting 完成

### 完成内容

- `pnpm acceptance` 写入验收报告时，命令展示现在会 shell quote env value、可执行路径和参数。
- 工作区路径、runner 路径或测试文件名包含空格时，`docs/acceptance/acceptance-run.md` 中的命令仍可复制复现。
- 实际执行仍使用 `spawn(command, args)` 的参数数组，不改变验收运行语义。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/acceptance-report.test.ts` 用例后，`formatAcceptanceCommand` 尚未导出，路径含空格的验收命令无法验证 quoting。
- Green：导出 `formatAcceptanceCommand`，复用 `shellQuoteArg` 格式化 env value、command 和 args，并让验收报告生成复用该函数。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、35 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、95 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、113 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 23 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 用户验收三条件完成

### 完成内容

- `pnpm goal:audit` 的用户验收判断现在集中到 `isAcceptedUserAcceptanceRecord`。
- 只有真实项目验收记录同时满足以下条件，才会把“用户确认 MVP 符合预期”判为已通过：
  - 验收运行状态为通过。
  - 用户结论为用户确认通过。
  - 必需项失败为 0。
- 该逻辑避免不一致或手工编辑的 `docs/acceptance/user-acceptance-record.md` 让长期 goal 过早完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`isAcceptedUserAcceptanceRecord` 尚未导出，无法验证用户验收三条件。
- Green：导出 `isAcceptedUserAcceptanceRecord` 并让当前 goal audit 构建逻辑复用该函数。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、36 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、96 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、114 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 25 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收记录完整性判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在不再接受孤立的三行摘要片段。
- 用户验收项只有在记录同时包含以下内容时才会判为已通过：
  - `# 真实项目用户验收记录` 标题。
  - 验收运行状态为通过。
  - 用户结论为用户确认通过。
  - 必需项失败为 0。
  - 最终验收判定文字确认用户已明确确认 MVP 符合预期。
- 该调整进一步降低 `docs/acceptance/user-acceptance-record.md` 被不完整片段或误编辑内容误判为长期 goal 完成证据的风险。
- 更新用户验收指南和验收清单中的最新 benchmark 耗时。

### TDD 记录

- Red：更新 `tests/unit/goal-audit.test.ts` 后，当前实现仍会接受只包含三行摘要表的片段。
- Green：收紧 `isAcceptedUserAcceptanceRecord`，要求完整验收记录标题和最终验收判定同时存在。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、36 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、96 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、114 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 用户验收摘要解析完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 不再用全局字符串包含判断读取用户验收状态。
- 新增正式区块解析：
  - 只从 `## 摘要` 表格读取 `验收运行状态`、`用户结论`、`必需项失败`。
  - 只从 `## 验收判定` 区块读取最终验收结论。
- 如果用户备注中出现伪造的 accepted 表格行或验收判定文字，不会影响 `pnpm goal:audit` 的完成判断。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，当前实现会把只出现在用户备注里的 accepted 文本误判为通过。
- Green：实现摘要区块表格解析和验收判定区块读取，让用户验收完成判定只依赖正式记录字段。
- Refactor：修正表格行解析的 TypeScript 类型收窄，保证 `pnpm typecheck` 通过。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、37 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、97 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、115 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit artifact 明细判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会解析 `## Artifact 检查` 表格。
- 用户验收项只有在至少存在一条必需 artifact 检查，且所有 `必需=是` 的检查状态均为 `通过` 时，才可能判为已通过。
- 该逻辑避免 `## 摘要` 被误写成 `必需项失败 | 0` 时，隐藏的必需 artifact 明细失败被忽略。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，摘要显示通过但 `Artifact 检查` 中存在必需失败项时仍会被误判通过。
- Green：新增 artifact 检查明细解析，要求所有必需检查均为通过。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、38 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、98 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、116 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 29 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit artifact 表格转义解析完成

### 完成内容

- `goal:audit` 的用户验收记录表格解析现在支持 Markdown 转义管道符 `\|`。
- `Artifact 检查` 中如果必需失败行的检查项或证据包含转义管道符，该行不会被错误跳过。
- 该调整防止 artifact 明细中包含 `|` 字符时，失败的必需检查被解析器忽略，导致用户验收项误判通过。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，失败的必需 artifact 行包含 `\|` 时会被旧 parser 拆坏并跳过，导致误判通过。
- Green：将 `parseMarkdownTableRow` 改为逐字符解析，识别反斜杠转义的管道符。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、39 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、99 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、117 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 20 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 真实路径与命令判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会校验 `## 摘要` 中的真实项目路径和验收命令。
- 用户验收项只有在以下条件同时满足时才可能判为已通过：
  - `真实项目路径` 不是空值、`待提供`、`n/a` 或 `<real-web-app-repo>` 占位符。
  - `验收命令` 包含 `pnpm user:accept`、`--repo` 和 `--decision accepted`。
  - `验收命令` 不包含 `<real-web-app-repo>` 占位符。
- 该调整避免模板内容或占位命令被误当成真实用户验收完成证据。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，占位 repo 和占位验收命令仍可能被误判为通过。
- Green：新增真实项目路径与验收命令校验，并对 Markdown code cell 做轻量归一化。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、40 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、100 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、118 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit report/findings 路径判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会校验 `## 摘要` 中的 `hardening report` 和 `findings` 字段。
- 用户验收项只有在这两个字段都不是空值、`n/a`、`待生成`、`待提供` 或占位符时，才可能判为已通过。
- 该调整避免 artifact 明细显示通过但摘要中的关键产物路径仍缺失时，长期 goal 被误判完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`hardening report` 为 `n/a` 且 `findings` 为 `待生成` 时仍可能被误判通过。
- Green：新增 report/findings 产物路径校验，并复用 Markdown code cell 归一化逻辑。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、41 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、101 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、119 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 28 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit report/findings 存在性判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在支持注入 `pathExists` 检查，并在 `pnpm goal:audit` 实际运行时使用 `existsSync` 校验 `hardening report` 与 `findings` 路径。
- 用户验收项只有在摘要中的 report/findings 路径既是具体值、又真实存在时，才可能判为已通过。
- 该调整避免手工记录了不存在的产物路径时，长期 goal 被误判完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`findings` 路径不存在时仍可能被误判通过。
- Green：增加可注入路径存在性检查；单元测试默认保持结构校验，`goal:audit` 生产路径使用真实文件系统检查。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、13 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、102 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、120 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 49 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit artifact 证据路径存在性判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会解析 `Artifact 检查` 中的检查项名称、状态和证据。
- 对 `已生成` / `已记录` 类必需 artifact 检查，用户验收项只有在证据路径全部真实存在时，才可能判为已通过。
- `generated Playwright spec 执行验证` 这类命令证据不按路径处理，避免把可复现命令误判为不存在的文件。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`generated Playwright spec 已生成` 的证据路径不存在时仍可能被误判通过。
- Green：扩展 artifact 明细 parser，并对需要文件/目录证据的必需项执行可注入 `pathExists` 校验。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、43 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、103 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、121 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 35 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit artifact repo 边界判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在要求真实项目路径为存在的绝对路径。
- `hardening report`、`findings` 以及 `已生成` / `已记录` 类必需 artifact 证据路径都必须位于本次真实项目 repo 根目录内。
- 该调整避免验收记录把其他目录或其他项目的产物路径冒充为当前 repo 的验收证据。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`真实项目路径` 为 `/tmp/real-app` 但 `hardening report` 指向 `/tmp/other-app` 时仍可能被误判通过。
- Green：新增 repo 根目录边界判定，所有文件型验收产物必须是 repo 根目录内的绝对路径且真实存在。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、104 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、122 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 31 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令 repo 一致性判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会解析 `验收命令` 中的 `--repo` 参数。
- 用户验收项只有在命令中的 `--repo` 路径与摘要中的 `真实项目路径` 解析为同一路径时，才可能判为已通过。
- 该调整避免验收记录摘要和可复现命令指向不同 repo 时，长期 goal 被误判完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`真实项目路径` 为 `/tmp/real-app` 但 `验收命令 --repo` 指向 `/tmp/other-app` 时仍可能被误判通过。
- Green：新增轻量 shell word parser，支持解析 `--repo value` 和 `--repo=value`，并要求解析值与摘要 repo 一致。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、45 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、105 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、123 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 33 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令 decision 精确判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在会解析 `验收命令` 中的 `--decision` 参数。
- 用户验收项只有在命令中的实际 `--decision` 值精确等于 `accepted` 时，才可能判为已通过。
- 该调整避免 `--decision accepted` 只出现在 `--notes` 或其他文本中时，长期 goal 被误判完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，命令实际为 `--decision pending`，但 notes 中包含 `--decision accepted` 时仍可能被误判通过。
- Green：复用 shell word parser 读取实际 `--decision` 参数值，并要求其精确等于 `accepted`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、46 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、106 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、124 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令前缀判定完成

### 完成内容

- `isAcceptedUserAcceptanceRecord` 现在要求 `验收命令` 的实际 shell words 前缀为 `pnpm user:accept --`。
- `pnpm user:accept` 只出现在 `echo`、`notes` 或其他非执行前缀位置时，用户验收项不会被判为已通过。
- 该调整避免伪造的可复现命令绕过用户验收完成判断。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`echo pnpm user:accept -- --repo ... --decision accepted` 仍可能被误判通过。
- Green：复用 shell word parser，要求命令前 3 个词精确为 `pnpm`、`user:accept`、`--`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、18 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、47 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、107 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、125 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 15 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令重复参数判定完成

### 完成内容

- `goal:audit` 的验收命令解析现在与 `pnpm user:accept` 的 CLI 行为对齐：重复出现的单值参数以最后一次出现为准。
- 用户验收项不会因为命令中先出现 `--decision accepted`，后面又被 `--decision pending` 覆盖而误判通过。
- 该调整降低手写或拼接验收命令时的伪通过风险。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`--decision accepted --decision pending` 仍可能被误判通过。
- Green：`readShellCommandOption` 改为返回最后一次匹配的参数值，与 `parseUserAcceptanceArgs` 的覆盖语义一致。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、48 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、108 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、126 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 21 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 下一步

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令顺序解析完成

### 完成内容

- `goal:audit` 的验收命令检查改为按 `pnpm user:accept` 支持的选项顺序解析。
- 未知参数、缺少值的参数、以及未正确引用的 `--notes --decision accepted` 片段都会被判为无效命令。
- 用户验收项不会因为格式错误的 notes 暴露出伪造的后续 `--decision accepted` 而误判通过。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`--decision pending --notes --decision accepted` 仍会被误判为用户已接受。
- Green：新增轻量顺序解析器，复用 shell words，仅接受 `user:accept` 已知 flag/value options，并按 CLI 行为消费参数。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、20 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、43 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、109 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、127 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 主验收命令显示脱敏完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 摘要中的 `验收命令` 现在会在写入 Markdown 前经过敏感信息脱敏。
- 实际 `pnpm user:accept` 参数和执行行为不变；只对记录中的显示命令脱敏。
- 覆盖用户通过 `--url` 传入 OAuth callback、token fragment 等敏感 query/fragment 参数的场景。
- 更新用户验收指南和验收清单中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`buildUserAcceptanceMarkdown` 会把 `code=oauth-secret` 和 `access_token=fragment-secret` 原样写入验收记录。
- Green：新增 `formatUserAcceptanceEvidenceCommand`，在摘要表 `验收命令` 字段写入前复用 `redactSensitiveText`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/shell-quote.test.ts`：通过，5 个测试文件、66 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、168 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；188 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、192 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令未闭合引号判定完成

### 完成内容

- `goal:audit` 的 shell words parser 现在会在命令存在未闭合单引号或双引号时返回无效。
- 用户验收项不会因为不可执行的 malformed shell command 仍包含 `--decision accepted` 而误判通过。
- 该调整让 `docs/acceptance/user-acceptance-record.md` 中的可复现命令更接近真实 shell 执行语义。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`--notes "unterminated` 仍可能被误判为有效验收命令。
- Green：`parseShellWords` 在扫描结束仍处于 quote 状态时返回无效，验收命令检查直接拒绝该记录。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、21 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、110 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、128 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 15 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 验收命令数值参数判定完成

### 完成内容

- `goal:audit` 的验收命令解析现在会校验 `pnpm user:accept` 的数值型参数。
- `--max-routes` 和 `--boot-timeout-ms` 必须为正整数；`--max-actions-per-route` 必须为非负整数。
- 用户验收项不会因为记录中存在真实 CLI 会失败的 `--max-routes banana` 等命令而误判通过。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`--max-routes banana --decision accepted` 仍可能被误判为有效验收命令。
- Green：新增数值 option 校验 helper，使 goal audit 的可复现命令判定更接近 `parseUserAcceptanceArgs` 的真实约束。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、45 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、111 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、129 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月18日 - goal audit 复用 user:accept CLI 解析器完成

### 完成内容

- `goal:audit` 保留 shell words 和命令前缀检查，但验收命令的 option 语义改为复用 `parseUserAcceptanceArgs`。
- 删除 `goal:audit` 内部重复维护的 `user:accept` flag/value option 集合与数值校验逻辑。
- 该重构降低 `pnpm user:accept` 后续增减参数时，真实 CLI 与 goal audit 完成判定漂移的风险。

### TDD 记录

- 本轮是受既有回归测试保护的重构，覆盖范围包括：重复 decision、malformed notes、未闭合引号、非法数值参数、repo 一致性和 command prefix。
- Green：目标单测与相关验收单测全部通过，行为保持稳定。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、45 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、111 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、129 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 参数解析纯模块抽取完成

### 完成内容

- 新增 `src/internal/acceptance/user-acceptance-args.ts`，集中维护 `UserAcceptanceCliOptions`、`parseUserAcceptanceArgs` 和 `formatUserAcceptanceCommand`。
- `run-user-acceptance` 继续负责真实验收执行、artifact 检查和报告写入，并 re-export 参数解析与命令格式化 API 以保持现有调用兼容。
- `run-goal-audit` 现在依赖轻量纯 parser 模块，不再为了校验验收命令而间接引入 browser driver 和 hardening runner 入口。
- 该重构进一步降低真实验收 CLI 与 goal audit 完成判定之间的依赖耦合和语义漂移风险。

### TDD 记录

- 本轮是受既有回归测试保护的边界重构。
- 既有测试覆盖 `parseUserAcceptanceArgs`、`formatUserAcceptanceCommand`、`isAcceptedUserAcceptanceRecord`、非法验收命令、repo 一致性、重复 decision、非法数值参数和 malformed shell command。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、39 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、45 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、111 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、129 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - goal audit 用户备注标题注入防护完成

### 完成内容

- `goal:audit` 现在对正式 `## 验收判定` 读取最后一个同名二级标题 section。
- 摘要和 artifact 表仍读取首个结构化 section，避免扩大解析行为影响范围。
- 该调整防止用户备注中伪造 `## 验收判定` 和 accepted 文案时，长期 goal 被误判完成。
- 更新用户验收指南和验收清单中的当前测试数量与 benchmark 耗时。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，备注中伪造的 accepted `## 验收判定` 会被审计读取，导致记录被误判通过。
- Green：新增 `readLastMarkdownSection` 并仅用于正式验收判定；保留 `readMarkdownSection` 的首个 section 语义用于摘要和 artifact 表。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、23 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、46 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、112 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、130 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 用户备注标题转义完成

### 完成内容

- `user:accept` 生成验收记录时，会转义用户备注中的 Markdown 标题行。
- 该调整防止用户备注把伪造的 `## 验收判定` 注入到生成文档结构中。
- 该生成侧防护与 `goal:audit` 读取最后一个正式验收判定 section 的审计侧防护形成互补。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，用户备注中的 `## 验收判定` 会生成第二个同名二级标题。
- Green：新增 `formatNotes`，将备注中的 Markdown 标题标记转义，保留备注内容但不改变验收记录结构。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、18 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、47 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、113 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、131 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - goal audit ANSI-C shell quoting 解析完成

### 完成内容

- `goal:audit` 的验收命令解析现在支持 `$'...'` ANSI-C shell quoting。
- 该解析支持项目自身 `shellQuoteArg` 会输出的 `\n`、`\r`、`\t` 和 `\xNN` 控制字符转义。
- `goal:audit` 的 Markdown 表格行解析改为只反转义 `\|`，不再吞掉命令单元格中的普通反斜杠。
- 该调整确保 `user:accept` 生成的可复制命令在包含控制字符参数时，仍可被完成度审计按真实 shell 语义复核。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`--repo $'/tmp/real\\tapp'` 无法与摘要中的真实 repo 路径对齐，验收记录被误判为未通过。
- Green：扩展 `parseShellWords` 的 ANSI-C quoted string 解码，并修正 `parseMarkdownTableRow` 对反斜杠的处理范围。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、24 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/markdown-format.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、48 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，16 个测试文件、114 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，28 个测试文件、132 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 启动日志与报告敏感值脱敏完成

### 完成内容

- 新增 `redactSensitiveText`，集中处理高风险 key-value 与 Authorization Bearer token 脱敏。
- `boot_app` 写入 `.hardening/run/app.log` 前会脱敏日志文本，stderr 进入 `errors` 前也会脱敏。
- `harden_report` 在格式化报告和 remediation patch 文本前再次执行脱敏，避免外部或手写 boot-result 中的 env value 泄露到报告。
- 启动日志和报告保留敏感 key 名用于诊断，但 value 统一替换为 `[REDACTED]`。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 与 `tests/unit/harden-report.test.ts` 用例后，报告仍会包含 `OPENAI_API_KEY=sk-live-secret` 和 `Authorization: Bearer bearer-secret`。
- Green：新增共享脱敏模块并接入 boot log、boot errors 和报告清洗路径；补充 `tests/integration/boot-app.test.ts` 验证真实 app log 落盘不包含 secret value。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts`：通过，2 个测试文件、5 个测试。
- `pnpm vitest run tests/integration/boot-app.test.ts`（提权）：通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/boot-app.test.ts tests/integration/boot-app.test.ts tests/integration/run-hardening-tool.test.ts`（提权）：通过，5 个测试文件、14 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、117 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、135 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app 启动命令 shell-like 解析完成

### 完成内容

- 新增共享 `parseShellWords`，支持单引号、双引号、反斜杠转义和 `$'...'` ANSI-C quoting。
- `boot_app` 的 `parseStartCommand` 现在复用该 parser，不再用简单空格拆分启动命令。
- 用户传入类似 `pnpm --filter 'web app' dev -- --host 127.0.0.1` 的启动命令时，带空格的参数会被正确保留为单个 argv。
- 未闭合引号会明确报错 `Start command has invalid shell quoting`，避免把错误命令静默拆坏后继续执行。
- `goal:audit` 同步复用共享 parser，减少验收命令审计与启动命令解析之间的语义漂移。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-app.test.ts` 用例后，`'web app'` 被拆成 `"'web"` 和 `"app'"`，未闭合引号也不会报错。
- Green：抽取 `src/shared/shell-words.ts` 并让 `parseStartCommand` 使用它；删除 `goal:audit` 内部重复 parser。

### 已验证

- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/boot-app.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/shell-quote.test.ts`：通过，4 个测试文件、51 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、119 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、137 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app inline env 启动命令支持完成

### 完成内容

- `parseStartCommand` 现在会解析启动命令开头的合法 inline env assignment。
- `boot_app` 启动子进程时会把这些 inline env 合并到 `spawn` 的环境变量中。
- 支持 `NODE_ENV=development PORT='3001' pnpm dev` 这类真实项目常用启动方式，quoted env value 会按 shell-like parser 保留。
- inline env 不会作为命令或普通 argv 传入，避免把 `NODE_ENV=development` 错当成可执行文件。
- 用户验收指南中补充 `--start-command` 支持 inline env 的说明。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-app.test.ts` 用例后，`NODE_ENV=development PORT='3001' pnpm dev` 会被解析成 command=`NODE_ENV=development`。
- Green：扩展 `ParsedStartCommand` 增加 `env` 字段，解析开头合法 assignment，并在 `bootApp` 的 `spawn` env 中合并。
- 补充 `tests/integration/boot-app.test.ts`，验证真实子进程能读取 inline env。

### 已验证

- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/integration/boot-app.test.ts`（提权）：通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/boot-app.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/integration/boot-app.test.ts tests/integration/run-hardening-tool.test.ts`（提权）：通过，5 个测试文件、54 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、120 个测试。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、138 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo export env hint 解析完成

### 完成内容

- `analyze_repo` 的 env hint 提取现在支持 `.env.local` 等文件中的 `export KEY=value` 写法。
- env hint 仍只记录符合大写 env key 规范的 key 名，不记录或输出 value。
- 保持 `.env.example`、`.env.local`、`.env` 三类文件的去重排序行为。
- 用户验收指南补充 `analyze` 阶段对 `export KEY=value` env hint 的支持说明。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，`export OPENAI_API_KEY=sk-live-secret` 和 `export NEXT_PUBLIC_APP_URL="https://example.test"` 无法被识别，`envHints` 返回空数组。
- Green：新增 `parseEnvHintKey`，在解析 key 前剥离可选 `export ` 前缀，并继续只接受 `/^[A-Z0-9_]+$/u` 的 key。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、121 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、139 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 外部 URL 默认端口记录完成

### 完成内容

- `run_hardening` 在用户直接传入已运行 URL 时，写入的 `boot-result.json` 现在会为 `http:` 和 `https:` URL 记录默认端口。
- 显式端口仍优先，例如 `http://localhost:5173` 继续记录 `5173`。
- 非 HTTP(S) URL（例如 data URL）继续记录 `null`，避免制造不可验证端口。
- 用户验收指南补充外部 URL 默认端口记录行为。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/integration/run-hardening-tool.test.ts` 用例后，`https://example.test/dashboard` 写入的 `boot-result.json` 中 `port` 为 `null`。
- Green：扩展 `readPort`，显式端口优先，否则按 `http:` 返回 `80`、按 `https:` 返回 `443`。

### 已验证

- `pnpm vitest run tests/integration/run-hardening-tool.test.ts`：通过，1 个测试文件、5 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、121 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、140 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 15 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 从 repro full URL 提取路径完成

### 完成内容

- `generate_tests` 现在能从 finding 的 `reproSteps` 中识别 `Go to http://...`、`Visit http://...`、`Open http://...` 这类完整 URL。
- 生成的 Playwright spec 会保留 pathname 和 query，例如 `/settings?tab=team`，避免错误退回 `/`。
- 该修复覆盖 `explore_app` 自身 findings 常见输出形态，提升生成回归测试对真实故障路由的命中率。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`reproSteps: ["Go to http://localhost:3000/settings?tab=team"]` 生成的 spec 目标路径错误地退回 `/`。
- Green：扩展 `extractPath`，在普通绝对路径匹配前先解析 repro step 中的 HTTP(S) 完整 URL。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、122 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、141 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - browser 非 HTTP 导航交互跳过完成

### 完成内容

- 浏览器探索现在会跳过 `mailto:`、`tel:`、`javascript:`、`data:` 和 hash anchor 这类非 HTTP 导航交互。
- 这些跳过项不计入 `maxActionsPerRoute`，后续安全的同页按钮仍可被探索。
- 返回的 interaction evidence 使用 `reason=non_http_navigation`，便于用户理解为什么没有点击。
- 该 guardrail 减少真实项目中点击邮件、电话、脚本链接或锚点导致的无意义探索噪声。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/playwright-driver.test.ts` 用例后，`mailto:support@example.com` 被当作普通点击，且占用了唯一 action limit。
- Green：在 `unsafeInteractionReason` 中增加非 HTTP 导航检测，并保持跳过项不计入 action limit。

### 已验证

- `pnpm vitest run tests/unit/playwright-driver.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、123 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、142 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - browser 外部 HTTP 导航交互跳过完成

### 完成内容

- 浏览器探索现在会识别交互候选中的 HTTP(S) URL，并与当前页面 origin 比较。
- 外部 origin 的链接交互会被跳过，返回 `reason=external_navigation`。
- 跳过外部链接不计入 `maxActionsPerRoute`，后续同应用内安全控件仍可被探索。
- 同源 HTTP(S) 链接不受影响，路由发现仍由 link discovery 处理。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/playwright-driver.test.ts` 用例后，`https://docs.example.com/guide` 被当成普通点击，且占用了唯一 action limit。
- Green：`unsafeInteractionReason` 增加当前 URL 上下文，解析候选文本中的 HTTP(S) URL，外部 origin 返回 `external_navigation`。

### 已验证

- `pnpm vitest run tests/unit/playwright-driver.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、124 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、143 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 去除 repro URL 尾随标点完成

### 完成内容

- `generate_tests` 现在会清理自然语言复现步骤中 HTTP(S) URL 和相对路径末尾的句末标点。
- 复现步骤如 `Go to http://localhost:3000/settings.` 现在会生成 `/settings`，不再误生成 `/settings.`。
- 清理逻辑仅作用于 `Go to`、`Visit`、`Open` 这类自然语言步骤中提取到的 route，保持已有显式 URL 解析路径不扩大改动面。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`reproSteps: ["Go to http://localhost:3000/settings."]` 生成的 spec 目标路径错误地包含 `/settings.`。
- Green：新增 `stripTrailingRoutePunctuation`，在自然语言步骤提取 URL 或相对路径后去除 `)`, `,`, `.`, `;` 等尾随标点。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、125 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、144 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 从 evidence 文本提取 URL 完成

### 完成内容

- `generate_tests` 现在能从 finding evidence 的说明文本中提取 HTTP(S) URL。
- evidence 如 `Request failed at http://localhost:3000/settings.` 现在会生成 `/settings` 的 Playwright 回归测试，不再退回默认 `/`。
- URL 文本提取会复用尾随标点清理逻辑，处理自然语言句末的 `.`, `,`, `;`, `)`。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，包含 URL 的 evidence 文本无法被识别，生成测试目标路径错误地退回 `/`。
- Green：新增 `extractPathFromUrlText`，在 evidence/repro step 文本中扫描 HTTP(S) URL，并在解析前去除尾随标点。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、126 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、145 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 清理纯 URL evidence 标点完成

### 完成内容

- `generate_tests` 现在会优先按 URL 文本提取逻辑处理 evidence 和 repro step。
- 纯 URL evidence 如 `http://localhost:3000/settings.` 现在会生成 `/settings`，不再因为严格 `new URL()` 先命中而保留 `/settings.`。
- 该调整复用已有尾随标点清理逻辑，统一覆盖“说明文本中的 URL”和“纯 URL evidence”两种真实报告形态。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，纯 URL evidence 中的句末 `.` 被当成 path 的一部分，生成 `/settings.`。
- Green：调整 `extractPath` 的解析顺序，先使用 `extractPathFromUrlText` 清理并解析 HTTP(S) URL，再回退到严格完整 URL 解析。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、127 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、146 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app 归一化 0.0.0.0 URL 完成

### 完成内容

- `boot_app` 从 dev server 日志提取 URL 时，现在会把 `0.0.0.0` 归一化为 `127.0.0.1`。
- 日志如 `Network: http://0.0.0.0:5173/` 现在会返回 `http://127.0.0.1:5173`，便于后续健康探测、浏览器探索和报告访问。
- 该修复保留原协议与端口，只替换客户端不应直接使用的监听地址。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-app.test.ts` 用例后，`extractUrlFromLog` 返回 `http://0.0.0.0:5173`。
- Green：新增 `normalizeClientUrl`，在 `extractUrlFromLog` 返回前将 `0.0.0.0` hostname 替换为 `127.0.0.1`。

### 已验证

- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、128 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、147 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - run_hardening 显式 0.0.0.0 URL 归一化完成

### 完成内容

- `run_hardening` 在用户直接传入已运行 URL 时，现在会复用 boot 层的客户端 URL 归一化逻辑。
- 显式输入 `http://0.0.0.0:5173/` 会在探索、`boot-result.json` 和最终报告中统一为 `http://127.0.0.1:5173`。
- 非 `0.0.0.0` URL 保持原样，避免改变用户传入的 trailing slash 或路径语义。
- `boot_app` 的 `normalizeClientUrl` 现在可复用，并在无效 URL 输入时安全返回 trim 后的原值。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/integration/run-hardening-tool.test.ts` 用例后，显式 URL `http://0.0.0.0:5173/` 被原样传给 browser driver，`boot-result.json` 也记录了 `0.0.0.0`。
- Green：导出并复用 `normalizeClientUrl`，在 `run_hardening` 的显式 URL 和 boot session URL 两条路径上统一归一化。
- Refactor：收窄 `normalizeClientUrl` 行为，只在 hostname 为 `0.0.0.0` 时改写，其他 URL 保持原样，避免破坏既有 trailing slash 行为。

### 已验证

- `pnpm vitest run tests/integration/run-hardening-tool.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、128 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、148 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app 归一化 IPv6 unspecified URL 完成

### 完成内容

- `boot_app` 从 dev server 日志提取 URL 时，现在会识别 `http://[::]:<port>/`。
- IPv6 unspecified host `[::]` 会被归一化为 `127.0.0.1`，与 `0.0.0.0` 使用相同客户端访问语义。
- 该修复提升 Vite/Node/Next 等可能输出 IPv6 bind 地址时的自动启动成功率。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-app.test.ts` 用例后，`extractUrlFromLog('Network: http://[::]:5173/')` 返回 `null`。
- Green：扩展 dev server URL 匹配正则支持 `[::]`，并让 `normalizeClientUrl` 将 `[::]` hostname 替换为 `127.0.0.1`。

### 已验证

- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、129 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，3 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、149 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app 接受 HTTP 404 可达性完成

### 完成内容

- `boot_app` 的健康探测现在把任何有效 HTTP 响应视为 server 已可达。
- 根路径返回 404 的真实应用不再被误判为启动失败；后续 `explore_app` 仍会把 404 作为 `broken_route` finding 记录。
- 该调整将“进程/端口已启动”和“页面是否健康”分层处理，减少自动 boot 阶段的误拦截。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/integration/boot-app.test.ts` 用例后，fixture server 已监听并返回 404，但 `bootApp` 仍因 `response.ok` 为 false 而返回 `failed`。
- Green：`waitForReachable` 改为收到任意 HTTP status 即返回可达，路由状态继续交给 explore 阶段分类。

### 已验证

- `pnpm vitest run tests/integration/boot-app.test.ts`（提权）：通过，1 个测试文件、2 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、129 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、150 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot_app 保留日志 URL path 和 query 完成

### 完成内容

- `boot_app` 从 dev server 日志提取 URL 时，现在会保留本地 URL 的 path 和 query string。
- 对输出为 `http://localhost:<port>/app/dashboard?seed=1` 的应用，后续探索入口不再退回 origin。
- 日志句子末尾的常见标点会被剥离，避免把 `,`、`.` 等符号误带入可达性探测 URL。
- 更新用户验收指南和验收清单中的当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-app.test.ts` 用例后，`extractUrlFromLog('Local: http://localhost:5173/app/dashboard?seed=1')` 返回 `http://localhost:5173`，path 和 query 被截断。
- Green：扩大本地 dev server URL 匹配范围，并增加日志 URL 专用清理逻辑，在保留路径/查询的同时去掉句尾标点。

### 已验证

- `pnpm vitest run tests/unit/boot-app.test.ts`：通过，1 个测试文件、11 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、131 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、152 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - explore_app tool 归一化 bind 地址完成

### 完成内容

- `runExploreAppTool` 现在会在进入探索前归一化客户端 URL。
- 独立 `explore_app` / CLI `hardening explore <repo> <url>` / MCP `explore_app` 入口复用 `boot_app` 的 `normalizeClientUrl` 规则。
- 用户传入 `http://0.0.0.0:<port>/` 或 `http://[::]:<port>/` 时，会探索 `http://127.0.0.1:<port>`，避免把 server bind 地址当作客户端访问地址。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与沙箱稳定门禁说明。

### TDD 记录

- Red：新增 `tests/integration/explore-tool.test.ts` 用例后，`runExploreAppTool` 会把 `http://0.0.0.0:5173/` 原样传给 `fetchPage`。
- Green：在 tool 层调用 `normalizeClientUrl(input.url)`，让 CLI、MCP 和内部 tool 调用统一获得客户端可访问地址。

### 已验证

- `pnpm vitest run tests/integration/explore-tool.test.ts`：通过，1 个测试文件、3 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、131 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、154 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo 启动脚本 fallback 完成

### 完成内容

- `analyze_repo` 的 `scripts` profile 新增 `start` 和 `preview` 字段。
- `recommendedStartCommand` 现在按 `dev`、`start`、`preview` 顺序选择可用启动脚本。
- npm 项目使用 `npm run <script>`，pnpm/yarn 项目使用 `<package-manager> <script>`。
- 只有 `start` 或 `preview` 的真实项目不再被误判为缺少推荐启动命令，自动 `run_hardening` 更容易进入 boot 阶段。
- 更新 README、用户验收指南和验收清单中的能力说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，只有 `start` 或 `preview` script 的 repo 仍返回 `recommendedStartCommand: null`，profile 中也没有对应 script 字段。
- Green：扩展 `RepoScripts`，增加 `selectStartScript`，让推荐命令在 `dev` 缺失时 fallback 到 `start` 或 `preview`。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts tests/integration/analyze-tool.test.ts`：通过，3 个测试文件、10 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、133 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、156 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo 识别 packageManager 字段完成

### 完成内容

- `analyze_repo` 现在会在缺少 lockfile 时读取 `package.json#packageManager`。
- 支持从 `npm@...`、`pnpm@...`、`yarn@...` 识别包管理器。
- lockfile 仍保持更高优先级，避免 package metadata 与实际安装锁文件冲突时误判。
- 无 lockfile 但声明 `packageManager: "pnpm@..."` 的真实项目现在可得到 `pnpm dev`、`pnpm start` 或 `pnpm preview` 推荐命令。
- 更新 README、用户验收指南和验收清单中的能力说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，无 lockfile 但声明 `packageManager: "pnpm@10.12.1"` 的 repo 仍被识别为 `unknown`，导致推荐启动命令为空。
- Green：扩展 `PackageJsonShape`，读取 `packageManager` 字段，并在 lockfile 检测之后 fallback 解析该字段。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、10 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、135 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、158 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - explore_app critical path 同源保护完成

### 完成内容

- `explore_app` 对显式 full URL critical path 增加 same-origin 过滤。
- `/path`、`./path`、自然语言意图仍按目标应用 base URL 展开。
- 外部 origin critical path 不再进入访问队列，保持本地优先与目标应用边界。
- 更新 README、用户验收指南和验收清单中的能力说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/explore-app.test.ts` 用例后，`https://external.example/login` 被加入探索队列并实际访问。
- Green：在 `expandCriticalPathInput` 显式 URL 分支中要求 base URL 存在时 origin 一致，否则丢弃。

### 已验证

- `pnpm vitest run tests/unit/explore-app.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/integration/explore-tool.test.ts tests/integration/run-hardening-tool.test.ts`：通过，2 个测试文件、9 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、137 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、160 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 优先使用 repro route 完成

### 完成内容

- `generate_tests` 在从 finding 生成 Playwright test route 时，现在优先读取 `reproSteps`。
- `evidence` 中的 URL 只作为兜底来源，避免第三方 API、CDN 或外部资源 URL 抢占用户页面复现路径。
- 例如 `reproSteps: ["Go to /checkout"]` 且 evidence 包含 `https://api.stripe.com/v1/checkout/sessions` 时，生成测试目标为 `/checkout`。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与路径提取说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，生成器把 `https://api.stripe.com/v1/checkout/sessions` 提取为 `/v1/checkout/sessions`，没有覆盖真正的 `/checkout` 页面。
- Green：调整 `extractPath` 的输入顺序，先解析 `reproSteps`，再解析 `evidence`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/run-hardening-tool.test.ts`：通过，3 个测试文件、10 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、138 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、161 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - session/JWT/CSRF 脱敏完成

### 完成内容

- `redactSensitiveText` 扩展敏感 key 识别，覆盖 `SESSION`、`JWT` 和 `CSRF`。
- 报告和 remediation patch 中的 finding `reproSteps` / `evidence` 现在会脱敏 session、JWT、CSRF 等真实 Web App 常见敏感值。
- `Cookie: session=...; csrftoken=...` 会保留 key 名并将 value 替换为 `[REDACTED]`，便于诊断同时避免泄漏。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，`session=abc123` 和 `jwt=header.payload.signature` 未被脱敏。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，finding `reproSteps` 与 `evidence` 中的 session value 会进入 `hardening-report.md`。
- Green：扩展敏感 key 正则，新增 `SESSION`、`JWT`、`CSRF`，并复用报告层已有 `cleanText` 脱敏路径。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、3 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、140 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、163 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 19 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - Cookie header 通用脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 `Cookie:` header，并脱敏其中所有 `name=value` 的 value。
- `Set-Cookie:` header 会脱敏第一个 cookie value，同时保留 `Path=/`、`HttpOnly` 等 cookie 属性，避免破坏诊断信息。
- 报告和 remediation patch 中的 finding evidence 若包含 `Cookie: theme=dark; sid=abc123; visitor_id=...`，会输出为 `theme=[REDACTED]`、`sid=[REDACTED]`、`visitor_id=[REDACTED]`。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，`Cookie: theme=dark; sid=abc123` 和 `Set-Cookie: preview=...` 未被脱敏。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，finding evidence 中的通用 cookie value 会进入 `hardening-report.md`。
- Green：新增 Cookie/Set-Cookie header 级脱敏逻辑，普通 Cookie 脱敏所有 pair，Set-Cookie 只脱敏首个 cookie pair 并保留属性。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、5 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、142 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、165 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - Authorization header 通用脱敏完成

### 完成内容

- `redactSensitiveText` 现在会脱敏 `Authorization:` header 中任意 scheme 的 credential。
- 支持 `Bearer`、`Basic`、`ApiKey`、`Digest` 等常见 scheme，并保留 header 名与 scheme 便于诊断。
- `Proxy-Authorization:` 使用同一规则脱敏，避免代理认证信息进入报告或 remediation patch。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，`Authorization: Basic dXNlcjpwYXNz`、`authorization: ApiKey ...` 和 `Proxy-Authorization: Digest ...` 未被脱敏。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，非 Bearer Authorization header credential 会进入 `hardening-report.md`。
- Green：将 Bearer 专用正则替换为 Authorization/Proxy-Authorization 通用 header 正则，保留 scheme 并脱敏 credential。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、5 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，17 个测试文件、144 个测试。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、167 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - URL userinfo credential 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会脱敏带协议 URL 中的 userinfo credential。
- 覆盖 `https://user:pass@example.com/path` 以及 `postgres://user:pass@host/db`、`redis://:pass@host/db` 这类连接串。
- 脱敏后保留协议、host、port 和 path，只将 `userinfo@` 替换为 `[REDACTED]@`，便于定位目标服务同时避免泄漏用户名密码。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，Web URL、Postgres URL 和 Redis URL 中的 userinfo credential 未被脱敏。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，boot error 和 finding evidence 中的 URL userinfo credential 会进入 `hardening-report.md`。
- Green：新增协议 URL userinfo 正则，在统一脱敏管线中将 `scheme://userinfo@host` 转换为 `scheme://[REDACTED]@host`。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、146 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、169 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated spec 敏感 query 脱敏完成

### 完成内容

- `generate_tests` 写入 Playwright spec 前，现在会脱敏 route query 中的敏感参数值。
- 覆盖 finding 路由和 smoke route 两条输入路径。
- 对 `code`、token、secret、password、session、JWT、CSRF、private key、service role、authorization 等敏感 query key，保留 key 并将 value 替换为 `[REDACTED]`。
- 保留非敏感 query 参数，例如 `state=public-state`、`tab=profile`，避免丢失复现诊断信息。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated spec 隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`/callback?code=oauth-secret&access_token=token-secret` 会原样写入 generated spec。
- Red：新增 smoke route 用例后，`/account?session=browser-session&csrf=csrf-secret` 会同时进入 generated spec 的 title 和 target URL。
- Green：在生成测试用例前统一清洗 route path，敏感 query value 替换为 `[REDACTED]`，非敏感 query 原样保留。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、13 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts`：通过，4 个测试文件、17 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、148 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、171 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated test diff 内容脱敏完成

### 完成内容

- `harden_report` 生成 `patch.diff` 时，现在会在新增文件 diff 构建前统一脱敏文件内容。
- 覆盖 remediation plan diff 和 generated Playwright spec diff，避免手写或外部 generated spec 中的 secret 进入 patch。
- `redactSensitiveText` 扩展 Authorization 规则，支持 `Authorization: 'Basic ...'` 和 `Proxy-Authorization: "Digest ..."` 这类 JS object literal 常见写法。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 patch diff 脱敏边界说明。

### TDD 记录

- Red：新增 `tests/unit/harden-report.test.ts` 用例后，generated spec diff 会原样包含 `OPENAI_API_KEY=sk-generated-secret`、`Basic dXNlcjpwYXNz` 和 `https://alice:browser-pass@example.com/private`。
- Red：新增 `tests/unit/privacy-redaction.test.ts` quoted Authorization 用例后，`Authorization: 'Basic quoted-secret'` 未被脱敏。
- Green：`buildNewFileDiff` 在拆分 diff 行前调用 `redactSensitiveText`；Authorization 正则支持可选引号包裹的 scheme credential。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、149 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、172 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - URL query 敏感参数通用脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别完整 URL query，并脱敏敏感 query 参数值。
- 覆盖 `code`、token、secret、password、session、JWT、CSRF、private key、service role、authorization 等敏感 query key。
- 保留非敏感 query 参数和 fragment，例如 `state=public-state` 与 `#done`，避免破坏复现信息。
- `harden_report` 的应用 URL 表格项和 `HARDENING_BASE_URL=...` verification command 现在都会脱敏 URL query secret。
- 收紧通用 key-value 脱敏边界，避免 `access_token=...&state=...` 误吞后续非敏感 query 或破坏 shell quote。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 URL query 脱敏边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，完整 URL 中的 `code=oauth-secret` 未被脱敏，且通用 key-value 规则会破坏 query/fragment。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，`boot-result.json` 中带 `code` 和 `access_token` 的 URL 会进入报告应用 URL 和 verification command。
- Green：新增 URL query 字符串级脱敏逻辑，保留原始 URL 编码形态、非敏感参数和 fragment；通用 key-value value 边界排除 `&`、`#` 和引号。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、7 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、151 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制。
- `pnpm test`（提权）：通过，29 个测试文件、174 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - URL fragment 敏感参数脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 URL fragment 参数，并脱敏敏感参数值。
- 覆盖 OAuth implicit flow 常见形态：`#access_token=...`、`#id_token=...`、`#code=...`，同时保留 `state` 等非敏感参数。
- 覆盖 SPA hash route query 形态：`/#/callback?code=...&tab=...`。
- `harden_report` 的应用 URL 表格项和 `HARDENING_BASE_URL=...` verification command 现在都会脱敏 URL fragment 中的敏感参数。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 URL fragment 脱敏边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，`http://localhost:3000/callback#code=fragment-code&state=public-state` 中的 `code` 未被脱敏。
- Red：新增 `tests/unit/harden-report.test.ts` 用例后，`boot-result.json` 中带 `#code=...` 的 URL 会进入报告应用 URL 和 verification command。
- Green：将 URL query 与 fragment 参数归一到同一套参数级脱敏逻辑；普通 fragment 参数和 SPA hash query 均复用敏感 key 判断。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/unit/harden-report.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、34 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、153 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；172 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、176 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated test title 敏感值脱敏完成

### 完成内容

- `generate_tests` 现在会在生成 Playwright test title 前，对 finding title 进行敏感值脱敏。
- 覆盖 API key、Authorization token 等出现在 finding title 中的敏感值，避免写入 generated spec。
- 保持 route 提取、query 脱敏、test title 序号和 smoke route 生成逻辑不变。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated spec 隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`OPENAI_API_KEY=sk-title-secret` 和 `Authorization: Bearer title-token` 会原样进入 generated Playwright test title。
- Green：`buildGeneratedTestCases` 构建 title 时复用 `redactSensitiveText`，在写入 spec 前统一脱敏。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts`：通过，5 个测试文件、26 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、154 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；173 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、177 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated route fragment 敏感参数脱敏完成

### 完成内容

- `generate_tests` 写入 Playwright spec 前，现在会脱敏 route fragment 中的敏感参数值。
- 覆盖 finding repro step 和 smoke route 两条输入路径，例如 `/callback#code=...` 与 `/callback#access_token=...`。
- 从完整 URL 提取路径时会保留 SPA hash route，例如 `http://localhost:3000/#/callback?code=...` 会生成 `/#/callback?code=[REDACTED]`，不再退化为 `/`。
- 保留非敏感 fragment 参数，例如 `state`、`tab`，避免破坏复现路径。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated spec 隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` finding route 用例后，`/callback#code=fragment-code&id_token=id-secret` 会原样写入 generated spec。
- Red：新增 smoke route 用例后，`/callback#access_token=fragment-token` 会同时进入 generated spec 的 title 和 target URL。
- Green：`sanitizeGeneratedRoutePath` 统一处理 query 与 fragment 参数；full URL 提取时保留 `url.hash` 并复用同一套敏感 key 判断。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/run-hardening-tool.test.ts`：通过，4 个测试文件、25 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、157 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；176 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、180 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests 外部 evidence URL 过滤完成

### 完成内容

- `generate_tests` 现在会先解析 `reproSteps`，再解析 `evidence`，保持用户页面复现路径优先。
- `evidence` 中的完整 URL 只接受本地 app host 作为兜底，例如 `localhost`、`127.0.0.1`、`0.0.0.0`、`[::1]`。
- 第三方 API、CDN 或外部资源 URL 不再被误生成成本地页面测试；没有可用页面路径时回退到默认 `/` smoke。
- `reproSteps` 中显式写出的 full URL 仍保持可用，用于用户真实页面复现步骤。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated tests 路径提取边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`Request failed at https://api.stripe.com/v1/checkout/sessions` 会生成错误的本地 `/v1/checkout/sessions` 测试。
- Red：新增纯外部 URL evidence 用例后，`https://api.segment.io/v1/batch` 仍会生成错误的本地 `/v1/batch` 测试。
- Green：拆分 repro/evidence 解析路径；evidence URL 解析增加 local app host 限制，repro step 仍按显式导航解析。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、19 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts`：通过，3 个测试文件、17 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、159 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；178 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、182 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests repro 描述外部 URL 过滤完成

### 完成内容

- `generate_tests` 现在会优先识别 `Go to`、`Visit`、`Open` 这类显式页面导航。
- `reproSteps` 普通描述文本中的完整 URL 只接受本地 app host 作为兜底。
- 第三方 API、CDN 或外部资源 URL 出现在 repro 描述中时，不再被误生成成本地页面测试；没有可用页面路径时回退到默认 `/` smoke。
- 普通 repro 描述中的本地 app URL 仍可作为兜底路径，例如 `request failed at http://localhost:3000/settings`。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated tests 路径提取边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`Click checkout; request failed at https://api.stripe.com/v1/checkout/sessions` 会生成错误的本地 `/v1/checkout/sessions` 测试。
- Green：调整 `extractPathFromReproText` 顺序，显式导航优先，纯 URL repro 仍可用，普通文本嵌入 URL 改为 local app host 兜底。
- Refactor：补充普通 repro 文本中本地 URL 的正向用例，防止规则过窄。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、21 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts`：通过，3 个测试文件、17 个测试。
- 非监听 integration 子集：通过，8 个测试文件、17 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、161 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；180 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、184 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests smoke route 外部 URL 过滤完成

### 完成内容

- `generate_tests` 的 `smokeRoutes` 输入现在只接受相对路径和本地 app full URL。
- 第三方 API、CDN 或外部资源 URL 作为 smoke route 时，不再被误生成成本地页面测试。
- 没有 findings 且所有 smoke route 都被过滤时，仍回退到默认 `/` smoke，保证 generated spec 可运行。
- 保留本地 full URL smoke route 的现有行为，例如 `http://localhost:3000/login` 仍生成 `/login`。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated tests 路径提取边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`smokeRoutes: ["https://api.stripe.com/v1/checkout/sessions"]` 会生成错误的本地 `/v1/checkout/sessions` 测试。
- Green：`extractPathFromRoute` 对完整 URL 启用 local app host 限制，相对路径仍正常解析。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/integration/mcp-server.test.ts tests/unit/cli-options.test.ts`（沙箱）：3 个测试文件通过、1 个 MCP 本地监听链路失败，符合默认沙箱本地监听限制。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、162 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；181 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、185 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests smoke route IPv6 unspecified 本地 URL 支持完成

### 完成内容

- `generate_tests` 的 `smokeRoutes` 现在会把 `http://[::]:<port>/...` 识别为本地 app full URL。
- `[::]` full URL 只用于提取 path/query/fragment，生成的 Playwright spec 仍使用 `HARDENING_BASE_URL` 组合目标地址，不会把 bind address 写成浏览器访问 origin。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与本地 app URL 范围说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`smokeRoutes: ["http://[::]:3000/dashboard?tab=team"]` 被过滤并退回默认 `/` smoke。
- Green：扩展 `isLocalAppHostname`，将 `[::]` 纳入本地 app host 判定，与 boot URL 归一化语义保持一致。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、23 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、163 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；182 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、186 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated tests hosted app 同源 smoke route 保留完成

### 完成内容

- `generate_tests` 新增可选 `baseUrl` 语义，`smokeRoutes` 中的完整 URL 会接受本地 app host 或与 `baseUrl` 同源的 app route。
- `run_hardening` 在探索完成后把当前被测 URL 传给 generated tests，避免 hosted app 的 `visitedRoutes` 被误判为外部 URL 并退回默认 `/` smoke。
- 第三方 API、CDN 或外部资源 URL 仍会被过滤，例如同一批 smoke route 中的 `https://api.stripe.com/...` 不会生成本地页面测试。
- 更新 README、用户验收指南、验收清单和测试策略中的当前测试数量与 generated tests URL 边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，`baseUrl: "https://app.example.test/dashboard"` 下同源 smoke route `https://app.example.test/settings?tab=team` 被过滤并退回默认 `/`。
- Red：新增 `tests/integration/run-hardening-tool.test.ts` 用例后，`run_hardening` 探索 hosted app 得到的 `visitedRoutes` 没有生成 `/dashboard` 和 `/settings` smoke tests。
- Green：`extractPathFromRoute` 解析 full URL 时增加 app base origin 判定；`runHardeningAfterBoot` 调用 `runGenerateTestsTool` 时传入 `baseUrl: input.url`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts tests/integration/run-hardening-tool.test.ts`：通过，2 个测试文件、31 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、164 个测试。
- `pnpm vitest run tests/integration/run-hardening-tool.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/mcp-server.test.ts`（沙箱）：2 个测试文件通过、1 个 MCP 本地监听链路失败，符合默认沙箱本地监听限制。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；184 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、188 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept generated spec 验证 URL 归一化完成

### 完成内容

- `pnpm user:accept -- --validate-generated-tests` 的 generated Playwright spec 验证阶段现在会复用 client URL 归一化规则。
- 当用户传入 `--url http://0.0.0.0:<port>/`，或自动 boot 得到 `http://[::]:<port>/` 时，验证阶段使用 `http://127.0.0.1:<port>` 作为 `HARDENING_BASE_URL`。
- 该行为与 `run_hardening` 探索和报告阶段保持一致，避免真实项目验收中探索可访问、generated spec 验证却访问 bind address 的不一致。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与 generated spec 验证说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`selectGeneratedTestValidationBaseUrl` 尚不存在，无法证明验收验证 base URL 会归一化 `0.0.0.0` 和 `[::]`。
- Green：新增 `selectGeneratedTestValidationBaseUrl`，在 `run-user-acceptance` 中调用 `normalizeClientUrl` 后再传给 generated spec 验证。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/boot-app.test.ts tests/unit/goal-audit.test.ts`：通过，3 个测试文件、54 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、165 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；185 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、189 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept generated spec 验证失败日志脱敏完成

### 完成内容

- `pnpm user:accept -- --validate-generated-tests` 在 generated Playwright spec 验证失败时，写入验收记录的 stderr/stdout 摘要会先经过敏感信息脱敏。
- 覆盖 API key、Authorization、session 等常见敏感值，避免真实项目验收失败日志把密钥或登录态写入 `docs/acceptance/user-acceptance-record.md`。
- 保持原有行为：优先记录 stderr；没有 stderr 时记录 stdout；没有输出时记录 exit code。
- 更新用户验收指南和验收清单中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`formatGeneratedTestValidationFailureEvidence` 尚不存在，无法证明 generated spec 验证失败 evidence 会脱敏。
- Green：新增 `formatGeneratedTestValidationFailureEvidence`，在 `buildGeneratedTestValidationCheck` 的失败分支复用 `redactSensitiveText` 后再截断写入 evidence。
- Refactor：测试分别覆盖 stderr 优先和 stdout fallback，避免误认为两者会同时写入验收记录。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、20 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts`：通过，4 个测试文件、61 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、166 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；186 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、190 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept generated spec 验证命令 evidence 脱敏完成

### 完成内容

- `pnpm user:accept -- --validate-generated-tests` 写入验收记录的 generated Playwright spec 验证命令 evidence 现在会先经过敏感信息脱敏。
- 实际执行仍使用真实 `HARDENING_BASE_URL`；只对写入 `docs/acceptance/user-acceptance-record.md` 的显示命令做脱敏。
- 覆盖 OAuth callback、token fragment 等出现在 `--url` / `HARDENING_BASE_URL` 中的敏感 query/fragment 参数，避免成功或失败 evidence 泄露认证参数。
- 更新用户验收指南和验收清单中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`formatGeneratedTestValidationEvidenceCommand` 尚不存在，且 failure evidence 中的命令会原样包含 `code=oauth-secret`。
- Green：新增 `formatGeneratedTestValidationEvidenceCommand` 并在 success/failure evidence 分支复用 `redactSensitiveText` 处理显示命令。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、21 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/shell-quote.test.ts`：通过，5 个测试文件、65 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、167 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；187 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、191 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - browser finding evidence 源头脱敏完成

### 完成内容

- Browser exploration 返回的 finding 现在会在核心输出边界统一脱敏 `title`、`reproSteps` 和 `evidence`。
- 覆盖 console error、page error、failed request URL 和 interaction evidence 中的 API key、Authorization、session、OAuth code、URL fragment token 等敏感值。
- 该修复发生在 `runExploreAppTool` 写入 `.hardening/run/findings.json` 之前，避免中间 artifact 依赖报告层二次脱敏。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/explore-app.test.ts` 用例后，browser finding 的 `reproSteps`、console/page error、failed request 和 interaction evidence 会原样包含 `oauth-secret`、`access_token`、API key、Bearer token 和 session。
- Green：新增 `redactFinding`，在 `exploreApp` 与 browser exploration 返回结果前复用 `redactSensitiveText` 统一处理 finding 输出字段。

### 已验证

- `pnpm vitest run tests/unit/explore-app.test.ts`：通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/explore-app.test.ts tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/integration/explore-tool.test.ts`：通过，5 个测试文件、56 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、169 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；189 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、193 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - explore 返回结果列表脱敏完成

### 完成内容

- `exploreApp` 返回给 CLI/MCP/编排层的 `visitedRoutes` 和 `interactions` 现在会在输出边界统一脱敏。
- 内部探索、队列去重和 browser driver 调用仍使用真实 URL；只对返回结果做脱敏，避免 stdout/MCP 响应泄露 OAuth code、fragment token 或按钮文本中的 token。
- 该切片补齐了上一轮 findings 脱敏之外的直接返回字段隐私边界。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/explore-app.test.ts` 用例后，`visitedRoutes` 会原样包含 `code=oauth-secret#access_token=fragment-secret`，`interactions` 会原样包含 `token=interaction-token-secret`。
- Green：新增 `redactTextList`，在非 browser 与 browser exploration 返回前统一处理 `visitedRoutes`，并处理 browser `interactions`。

### 已验证

- `pnpm vitest run tests/unit/explore-app.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/explore-app.test.ts tests/unit/privacy-redaction.test.ts tests/unit/generate-tests.test.ts tests/integration/explore-tool.test.ts tests/integration/run-hardening-tool.test.ts`：通过，5 个测试文件、54 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、170 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；190 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、194 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - already-running boot-result URL 脱敏完成

### 完成内容

- 用户传入 already-running URL 时，`.hardening/run/boot-result.json` 现在会对 `url` 字段中的敏感 query/fragment 参数脱敏。
- 内部探索、browser driver 调用和 generated tests base URL 仍使用真实 URL；只对写入本地 artifact 的 URL 做脱敏。
- 保持默认端口记录逻辑不变，`http`/`https` 未显式端口仍分别记录 80/443。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/integration/run-hardening-tool.test.ts` 用例后，`boot-result.json` 会原样包含 `code=oauth-secret` 和 `access_token=fragment-secret`。
- Green：`writeExternalUrlBootResult` 写入 artifact 时复用 `redactSensitiveText(url)`，同时继续用原始 URL 计算端口和执行探索。

### 已验证

- `pnpm vitest run tests/integration/run-hardening-tool.test.ts`：通过，1 个测试文件、8 个测试。
- `pnpm vitest run tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts tests/unit/privacy-redaction.test.ts tests/unit/generate-tests.test.ts tests/integration/explore-tool.test.ts`：通过，5 个测试文件、53 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、170 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；191 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、195 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - auto-boot serializable boot result URL 脱敏完成

### 完成内容

- `toSerializableBootResult` 现在会对返回结果 `url` 中的敏感 query/fragment 参数脱敏。
- 该边界同时覆盖 `runBootAppTool` 写入的 boot artifact 和 MCP `boot_app` 响应，因为二者复用同一个可序列化 boot result。
- 运行期 `session.url` 仍保留真实 URL，供 reachability、exploration 和 session store 使用；只在对外输出或 artifact 边界脱敏。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/boot-tool.test.ts` 用例后，`toSerializableBootResult` 会原样返回 `code=oauth-secret` 和 `access_token=fragment-secret`。
- Green：`toSerializableBootResult` 返回 `url` 前复用 `redactSensitiveText`，保持内部 session URL 不变。

### 已验证

- `pnpm vitest run tests/unit/boot-tool.test.ts`：通过，1 个测试文件、2 个测试。
- `pnpm vitest run tests/unit/boot-tool.test.ts tests/unit/boot-app.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/privacy-redaction.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，5 个测试文件、35 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、171 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；192 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、196 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - quoted object 敏感字段脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 quoted object key/value 形式的敏感字段，例如 `"apiKey":"..."`、`"accessToken": "..."`、`'client_secret': '...'` 和 `"NEXTAUTH_SESSION_TOKEN": "..."`。
- 脱敏时保留原始 key、key quote、分隔空格和 value quote，只替换 value，降低对 JSON/object-like 日志可读性的破坏。
- 该修复作用于公共脱敏边界，因此同时覆盖 boot logs、explore findings、generated tests、report、patch diff 和 user acceptance evidence 等调用方。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，quoted object 中的 `json-api-secret`、`json-access-token`、`object-client-secret` 和 `json-session-secret` 会原样保留。
- Green：新增 `quotedSensitiveKeyValuePattern`，在通用 key/value 脱敏前处理 quoted key + quoted value。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、79 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、172 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；193 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、197 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - quoted authorization object 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 quoted object key/value 形式的 `Authorization` 和 `Proxy-Authorization` 字段，例如 `"Authorization":"Bearer ..."`、`"authorization": "ApiKey ..."` 和 `'Proxy-Authorization': 'Digest ...'`。
- 该规则对 quoted authorization object 直接整值脱敏，避免 JSON/object-like 工具日志中的 bearer、API key、digest 等 credential 泄露。
- 该修复复用公共脱敏边界，因此覆盖 boot logs、explore findings、generated tests、report、patch diff 和 user acceptance evidence 等调用方。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，quoted object 中的 `json-bearer-token`、`json-api-key-token` 和 `json-proxy-digest` 会原样保留。
- Green：扩展 `quotedSensitiveKeyValuePattern`，将 `Authorization` 与 `Proxy-Authorization` 纳入 quoted object 敏感字段识别。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、80 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、173 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；194 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、198 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - quoted cookie object 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 quoted object key/value 形式的 `Cookie` 和 `Set-Cookie` 字段，例如 `"Cookie":"theme=dark; sid=..."` 和 `"set-cookie": "preview=...; Path=/; HttpOnly"`。
- `Cookie` object value 会按 cookie pair 全量脱敏；`Set-Cookie` object value 会只脱敏首个 cookie pair，保留 `Path`、`HttpOnly` 等属性。
- 该修复复用公共脱敏边界，因此覆盖 boot logs、explore findings、generated tests、report、patch diff 和 user acceptance evidence 等调用方。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，quoted object 中的 `theme=dark`、`sid=abc123`、`visitor_id=visitor-secret` 和 `preview=preview-secret` 会原样保留。
- Green：新增 `quotedCookieHeaderPattern`，在普通 quoted 敏感字段脱敏前处理 `Cookie` 和 `Set-Cookie` object value。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、81 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、174 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；195 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、199 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - standalone JWT 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别常见裸 JWT 形态的 `eyJ...`.`...`.`...` token，并整值替换为 `[REDACTED]`。
- 该规则覆盖没有 `jwt=`、Authorization header 或 JSON key 包裹的 console、network error、test failure 输出。
- 规则刻意限定为常见 `eyJ` 开头的 JWT header，避免过度匹配普通带点文本。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，裸 JWT 中的 `signature-secret` 会原样保留。
- Green：新增 `jwtTokenPattern`，在 URL 脱敏后、通用 key/value 脱敏前处理 standalone JWT-looking token。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、82 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、175 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；196 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、200 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - standalone provider API key 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别裸 OpenAI/Anthropic-like provider key，例如 `sk-...` 和 `sk-ant-api03-...`，并整值替换为 `[REDACTED]`。
- 该规则覆盖 provider key 没有 env name、JSON key 或 header name 包裹时进入日志、错误、报告或验收 evidence 的场景。
- 规则按 `sk-`/`sk-ant-apiNN-` 前缀和最小长度约束，避免误伤短 `sk-` 文本。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，裸 `sk-...` 与 `sk-ant-api03-...` provider key 会原样保留。
- Green：新增 `providerApiKeyPattern`，在 standalone JWT 脱敏后、通用 key/value 脱敏前处理裸 provider key。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、13 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、83 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、176 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；197 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、201 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - signed URL query credential 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别 signed URL 中的 credential/signature query 参数，并将值替换为 `[REDACTED]`。
- 覆盖 AWS SigV4 `X-Amz-Credential`、`X-Amz-Signature`、legacy S3 `AWSAccessKeyId`、`Signature`，以及 Azure SAS `sig`。
- 非敏感参数如 `X-Amz-Date`、`Expires`、`sp`、`se` 会保留，便于报告仍具备复现价值。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，signed URL 的 AWS credential/signature 和 Azure SAS signature 会原样保留。
- Green：扩展 `isSensitiveQueryKey`，加入 `sig`、`signature`、`xamzcredential`、`xamzsignature` 和 `awsaccesskeyid`。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、84 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、177 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；198 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、202 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - standalone repository/deployment token 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别裸 GitHub、NPM 和 Vercel 类工具 token，并整值替换为 `[REDACTED]`。
- 覆盖 GitHub fine-grained PAT `github_pat_...`、classic token `ghp_...`/`gho_...`/`ghs_...`/`ghu_...`、NPM `npm_...` 和 Vercel `vercel_...`。
- 该规则覆盖 token 没有 env name、JSON key、Authorization header 或 URL query key 包裹时进入日志、错误、报告或验收 evidence 的场景。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，裸 GitHub/NPM/Vercel token 会原样保留。
- Green：新增 `toolTokenPattern`，在 provider API key 脱敏后、通用 key/value 脱敏前处理裸工具 token。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、85 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、178 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；199 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、203 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - standalone cloud provider access key 脱敏完成

### 完成内容

- `redactSensitiveText` 现在会识别裸 AWS access key 和 Google API key，并整值替换为 `[REDACTED]`。
- 覆盖 AWS `AKIA...`、临时凭证 `ASIA...`，以及 Google `AIza...` 常见 API key 形态。
- 该规则覆盖 cloud key 没有 env name、JSON key、Authorization header 或 URL query key 包裹时进入日志、错误、报告或验收 evidence 的场景。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/privacy-redaction.test.ts` 用例后，裸 AWS/Google cloud access key 会原样保留。
- Green：新增 `cloudAccessKeyPattern`，在工具 token 脱敏后、通用 key/value 脱敏前处理裸 cloud key。

### 已验证

- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，6 个测试文件、86 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、179 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；200 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、204 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated spec signed URL credential 脱敏完成

### 完成内容

- `generatePlaywrightTests` 生成 Playwright spec 时，现在会脱敏 route query 中的 signed URL credential/signature 参数。
- 覆盖 AWS SigV4 `X-Amz-Credential`、`X-Amz-Signature`、legacy S3 `AWSAccessKeyId`、`Signature`，以及 Azure SAS `sig`。
- 非敏感参数如 `file`、`X-Amz-Date` 会保留，避免 generated spec 失去复现路径上下文。
- 更新用户验收指南、验收清单和测试策略中的当前测试数量与 generated spec 隐私边界说明。

### TDD 记录

- Red：新增 `tests/unit/generate-tests.test.ts` 用例后，generated spec 会原样保留 signed URL 的 AWS credential/signature 和 Azure SAS signature。
- Green：扩展 `src/domain/tests/generate-tests.ts` 的 `isSensitiveQueryKey`，加入 `sig`、`signature`、`xamzcredential`、`xamzsignature` 和 `awsaccesskeyid`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、25 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/harden-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/explore-app.test.ts tests/unit/boot-tool.test.ts`：通过，5 个测试文件、62 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、180 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；201 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、205 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo 常见 app dev 脚本推断完成

### 完成内容

- `analyzeRepo` 的 `recommendedStartCommand` 现在在缺失标准 `dev`、`start`、`preview` 脚本时，会尝试常见 app/web/frontend dev 脚本。
- 当前覆盖 `web:dev`、`app:dev`、`frontend:dev`、`dev:web`、`dev:app`、`dev:frontend`。
- 标准脚本仍保持优先级，不会被 fallback 脚本覆盖。
- 更新 README、用户验收指南和验收清单中的启动脚本说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，只有 `web:dev` 的 repo 仍返回 `recommendedStartCommand: null`。
- Green：新增常见 app dev script fallback，并让 confidence 判断复用同一启动脚本选择逻辑。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts`：通过，3 个测试文件、12 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、182 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；203 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、207 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo package workspaces 子包启动推断完成

### 完成内容

- `analyzeRepo` 现在会读取根 `package.json#workspaces` 中的简单 `apps/*`/`packages/*` 类 workspace pattern。
- 当根目录缺失可启动脚本时，会读取子包 `package.json`，识别子包 framework，并基于子包 `dev/start/preview` 生成 workspace 启动命令。
- 当前支持 `pnpm --filter <package> <script>`、`yarn workspace <package> <script>` 和 `npm run <script> --workspace <package>` 形态。
- `appDirectories` 会包含识别出的 workspace 子包目录；confidence 现在以实际存在 `recommendedStartCommand` 为 high 的依据，避免无启动脚本 workspace 被误判为 high。
- 更新 README、用户验收指南和验收清单中的 workspace 启动说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` workspace 用例后，根目录无依赖时 framework 仍为 `unknown`，且无法生成 `pnpm --filter web dev`。
- Red：新增无启动脚本 workspace 用例后，虽然无法生成 `recommendedStartCommand`，confidence 仍被误判为 `high`。
- Green：新增 workspace package 探测、子包 framework 识别、workspace 启动命令生成，并让 confidence 依赖实际推荐命令。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、184 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；205 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、209 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo pnpm-workspace.yaml 子包启动推断完成

### 完成内容

- `analyzeRepo` 现在会读取 `pnpm-workspace.yaml` 中常见的顶层 `packages:` 列表。
- 当根 `package.json` 未声明 workspaces，但 `pnpm-workspace.yaml` 声明 `apps/*` 等子包 pattern 时，仍可识别子包 framework 并生成 workspace 启动命令。
- 当前解析支持单行列表项、单双引号包裹的 pattern，并忽略 `!` 开头的 exclude pattern。
- 更新 README、用户验收指南和验收清单中的 pnpm workspace 说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，只有 `pnpm-workspace.yaml` 的 repo 仍无法识别子包 Vite framework，也无法生成 `pnpm --filter web dev`。
- Green：新增轻量 `pnpm-workspace.yaml` packages 解析，并把解析出的 pattern 合并进 workspace package 探测。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、185 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；206 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、210 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo workspace Web app 子包优先完成

### 完成内容

- `analyzeRepo` 的 workspace 启动命令选择现在会优先选择识别为 Web app framework 的子包。
- 当 monorepo 同时存在 `packages/ui` 这类库包 dev 脚本和 `apps/web` 这类 Vite/Next/React app dev 脚本时，会推荐 app 子包，例如 `pnpm --filter web dev`。
- 如果没有任何 workspace 子包能识别出 Web framework，则仍会回退到第一个可启动的 workspace 子包，保留兼容性。
- 更新 README、用户验收指南和验收清单中的 workspace 启动说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，`packages/ui` 的 `dev` 脚本会先于 `apps/web` 被推荐，导致 `recommendedStartCommand` 错误为 `pnpm --filter ui dev`。
- Green：新增 workspace 子包启动命令选择逻辑，先筛选有 Web framework 且有启动脚本的子包，再回退到任意可启动子包。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、186 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；207 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、211 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo workspace Vite config 子包优先完成

### 完成内容

- `analyzeRepo` 现在会把 workspace 子包 framework 探测结果缓存到内部 `WorkspacePackage` 元数据。
- workspace 启动命令选择会优先使用完整 framework 探测结果，因此子包即使没有声明 `vite` 依赖，只要存在 `vite.config.*`，也会优先于库包 dev 脚本被推荐。
- 复用原有 fallback：如果没有可识别的 Web app 子包，仍回退到第一个可启动 workspace 子包。
- 更新 README、用户验收指南和验收清单中的 workspace app 识别说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，存在 `packages/ui` 和 `apps/web/vite.config.ts` 时，启动命令仍错误推荐 `pnpm --filter ui dev`。
- Green：在 workspace package 读取阶段记录 `framework`，并让 workspace 启动命令选择逻辑使用该结果。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、17 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、187 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；208 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、212 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo Bun 包管理器支持完成

### 完成内容

- `analyzeRepo` 现在支持识别 Bun 项目：`bun.lock`、`bun.lockb` 和 `package.json#packageManager` 中的 `bun@...`。
- 根项目启动建议会为 Bun 生成 `bun run <script>`，例如 `bun run dev`。
- workspace 子包启动建议会为 Bun 生成 `bun --filter <package> <script>`，例如 `bun --filter web dev`。
- 更新 README、用户验收指南、验收清单和架构说明中的包管理器支持范围与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 三个 Bun 用例后，Bun lockfile、`packageManager: bun@...` 和 Bun workspace 均被识别为 `unknown`。
- Green：扩展 `PackageManager` 联合类型、lockfile 探测、`packageManager` 字段解析、root 启动命令和 workspace 启动命令生成。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、20 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、190 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；211 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、215 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo Next config framework 探测完成

### 完成内容

- `analyzeRepo` 现在可通过 `next.config.*` 识别 Next.js 项目，即使当前 `package.json` 未声明 `next` 依赖。
- workspace 子包 framework 探测同样支持 `next.config.*`，因此 monorepo 中只带 Next config 的 app 子包会优先于库包 dev 脚本被推荐。
- 将 config 文件探测抽成通用 helper，复用给 Next 和 Vite。
- 更新 README、用户验收指南和验收清单中的 config 识别说明与当前测试数量。

### TDD 记录

- Red：新增根目录 `next.config.mjs` 用例后，framework 仍为 `unknown`。
- Red：新增 workspace `apps/web/next.config.ts` 用例后，framework 仍为 `unknown`，无法优先推荐 app 子包。
- Green：新增 `hasNextConfig`，并让 Next framework 检测同时检查依赖和 `next.config.*`。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、192 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；213 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、217 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo pnpm-workspace inline packages 完成

### 完成内容

- `analyzeRepo` 的 `pnpm-workspace.yaml` 解析现在支持简单 inline array 写法，例如 `packages: ["packages/*", "apps/*"]`。
- inline array 中的 quoted pattern 会复用现有 unquote 逻辑，并继续忽略 `!` 开头的 exclude pattern。
- 该能力与原有多行 `packages:` 列表互补，提升真实 pnpm monorepo 的 workspace app 启动推断覆盖率。
- 更新 README、用户验收指南和验收清单中的 pnpm workspace 说明与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，inline `packages: ["packages/*", "apps/*"]` 未被解析，framework 仍为 `unknown`。
- Green：新增轻量 inline string array parser，并在 `packages:` 同行存在值时解析并合并 pattern。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、23 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、193 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；214 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、218 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo framework 脚本推断完成

### 完成内容

- `analyzeRepo` 现在可通过 `package.json#scripts` 中的 framework 命令识别项目类型。
- 当前脚本级识别覆盖 `next`、`vite` 和 `react-scripts`，优先级保持 Next.js、Vite、React。
- 当 monorepo app 子包依赖被 hoist、缺少 config 文件，但 `dev` 脚本为 `next dev` 或 `vite` 时，workspace 启动命令选择仍会优先推荐 app 子包。
- 更新 README、用户验收指南和验收清单中的 framework 识别说明与当前测试数量。

### TDD 记录

- Red：新增根目录 `dev: next dev --hostname 127.0.0.1` 用例后，framework 仍为 `unknown`。
- Red：新增 workspace app 仅靠 `dev: next dev --hostname 127.0.0.1` 的用例后，framework 仍为 `unknown`，且无法优先于库包 dev 脚本。
- Green：新增 scripts framework 推断 helper，并让 framework 检测同时使用依赖、config 和脚本命令信号。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、25 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、195 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；216 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、220 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo workspace 编排脚本优先级完成

### 完成内容

- `analyzeRepo` 现在能识别根目录 `dev` 脚本只是 `turbo`、`nx`、`lerna` 等通用 workspace 编排器的场景。
- 当已识别出可启动的 Web app workspace 子包时，会优先推荐子包直接启动命令，例如 `pnpm --filter web dev`，避免把泛化根编排脚本当成最优启动入口。
- 保留原有 fallback：没有可启动 Web app 子包时，仍按根目录 `dev/start/preview` 和常见 app dev 脚本选择。
- 更新 README、用户验收指南和验收清单中的 monorepo 启动说明与当前测试数量。

### TDD 记录

- Red：新增根 `dev: turbo dev`、app 子包 `dev: vite --host 127.0.0.1` 的 monorepo 用例后，推荐命令错误地返回 `pnpm dev`。
- Green：在根启动脚本为通用 workspace 编排器且存在可启动 Web app 子包时，优先返回 workspace 子包启动命令。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、26 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、196 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；217 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、221 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo appDirectories 库包噪声收紧完成

### 完成内容

- `analyzeRepo` 的 `appDirectories` 现在会优先列出已识别为 Web app framework 的 workspace 子包。
- 当 monorepo 同时存在 `packages/ui` 这类库包和 `apps/web` 这类 Vite/Next/React app 时，profile 不再把库包目录混入 app 目录信号。
- 如果没有任何 workspace 子包能识别出 Web framework，仍保留原有 fallback，继续列出可发现的 workspace 目录作为弱信号。
- 更新 README、用户验收指南和验收清单中的 `appDirectories` 说明与当前测试数量。

### TDD 记录

- Red：新增 `packages/ui` + `apps/web` monorepo 用例后，`appDirectories` 错误包含 `packages/ui`。
- Green：新增 workspace app directory 筛选逻辑，优先返回 `framework !== "unknown"` 的子包目录，并在没有识别结果时回退到全部 workspace 目录。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、27 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、197 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；218 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、222 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - analyze_repo root appDirectories 噪声收紧完成

### 完成内容

- `analyzeRepo` 现在会区分根项目 Web framework 信号和 workspace Web app 信号。
- 当根目录存在 `src`，但根 `package.json` 本身无法识别为 Web app，而 workspace 中存在 `apps/web` 这类 Vite/Next/React app 时，`appDirectories` 不再把根 `src` 混入 app 目录信号。
- 如果根项目自身可识别为 Web app，仍会保留根目录 `app/pages/src` 信号；如果没有任何 workspace Web app 信号，也保留原有 fallback。
- 更新 README、用户验收指南和验收清单中的 `appDirectories` 说明与当前测试数量。

### TDD 记录

- Red：新增根 `src/tooling.ts` + workspace `apps/web` Vite app 用例后，`appDirectories` 错误返回 `["src", "apps/web"]`。
- Green：拆分 root framework 探测与最终 framework 汇总，并让 root app directories 在 workspace Web app 已识别且 root framework unknown 时被过滤。

### 已验证

- `pnpm vitest run tests/unit/analyze-repo.test.ts`：通过，1 个测试文件、28 个测试。
- `pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/unit/harden-report.test.ts tests/unit/mcp-tool-registry.test.ts`：通过，4 个测试文件、18 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、198 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；219 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、223 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generate_tests spec 默认 baseURL 完成

### 完成内容

- `generatePlaywrightTests` 现在会在传入 `baseUrl` 时，把该 URL 的安全 origin 写入 generated Playwright spec 的默认 `baseURL`。
- generated spec 仍优先读取 `process.env.HARDENING_BASE_URL`，便于用户或验收 runner 覆盖目标地址。
- 默认值只写入 origin，不包含 path、query 或 fragment，避免 OAuth code、token fragment 等敏感 URL 参数进入 generated spec。
- 更新 README、用户验收指南和验收清单中的 generated spec base URL 说明与当前测试数量。

### TDD 记录

- Red：新增 `baseUrl: "http://127.0.0.1:5173/dashboard"` 用例后，generated spec 仍默认 `http://localhost:3000`。
- Red：新增带 `code` query 和 `access_token` fragment 的 `baseUrl` 用例后，无法证明 generated spec 不泄露敏感参数。
- Green：新增 `readDefaultBaseUrl`，仅从 `baseUrl` 读取 `origin`；解析失败时回退 `http://localhost:3000`。

### 已验证

- `pnpm vitest run tests/unit/generate-tests.test.ts`：通过，1 个测试文件、27 个测试。
- `pnpm vitest run tests/integration/generate-tests-tool.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts tests/unit/user-acceptance.test.ts`：通过，4 个测试文件、41 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、200 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；221 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、225 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generate_tests baseUrl CLI/MCP 入口完成

### 完成内容

- 独立 CLI `hardening generate-tests` 新增 `--base-url <url>`，可把指定应用 URL 传入 generated Playwright spec 的默认 `baseURL` 计算逻辑。
- MCP `generate_tests` tool schema 新增 `baseUrl` 入参，并会传递给测试生成工具。
- standalone 入口现在和完整 `run_hardening` 链路保持一致：默认只写入安全 origin，运行时仍可用 `HARDENING_BASE_URL` 覆盖。
- 更新 README、用户验收指南和验收清单中的 CLI/MCP 说明与当前测试数量。

### TDD 记录

- Red：新增 CLI parser 用例后，`--base-url` 和 inline `--base-url=...` 都被判定为未知参数。
- Red：新增 MCP schema 和 tool call 用例后，`generate_tests` 未暴露 `baseUrl`，生成 spec 仍默认 `http://localhost:3000`。
- Green：在 `parseGenerateTestsOptions`、CLI tool 调用和 MCP tool registry 中贯通 `baseUrl`。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/mcp-tool-registry.test.ts`：Red 阶段 4 个预期失败；Green 阶段通过，2 个测试文件、24 个测试。
- `pnpm vitest run tests/unit/generate-tests.test.ts tests/unit/cli-options.test.ts tests/unit/mcp-tool-registry.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/run-hardening-tool.test.ts tests/unit/harden-report.test.ts`：通过，7 个测试文件、73 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、204 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；225 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、229 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept generated test 验证超时参数完成

### 完成内容

- `pnpm user:accept` 新增 `--generated-test-timeout-ms <ms>`，用于调整 `--validate-generated-tests` 执行 generated Playwright spec 时的超时时间。
- 默认 generated spec 验证超时保持 120000ms；未显式传参时行为不变。
- 验收记录中的可复现命令会写入该参数，`pnpm goal:audit` 也能识别带该参数的 accepted 验收命令。
- 更新 README、用户验收指南、测试策略、验收清单和用户验收记录模板中的真实项目验收命令与当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`--generated-test-timeout-ms` 被判定为未知参数，格式化验收命令也不会包含该参数。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，带 generated test timeout 的 accepted 验收记录无法通过 goal audit 判定。
- Green：在 `parseUserAcceptanceArgs`、`formatUserAcceptanceCommand`、`main -> buildArtifactChecks -> buildGeneratedTestValidationCheck` 贯通 timeout，并复用正整数校验。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：Red 阶段 4 个预期失败；Green 阶段通过，2 个测试文件、49 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、61 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、207 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；228 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、232 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept repo root 前置校验完成

### 完成内容

- `pnpm user:accept` 现在会在进入 hardening flow 前校验 `--repo` 是已存在目录。
- 当 repo 路径不存在时，runner 会写入包含 `repo root 是有效目录` 失败项的结构化验收记录，并返回非零退出码，不会自动创建目标 repo 目录。
- 当 repo 路径指向普通文件时，runner 同样写入结构化失败记录，而不是抛出 `ENOTDIR`。
- 更新 README、用户验收指南、测试策略、验收清单和用户验收记录模板中的真实项目验收边界与当前测试数量。

### TDD 记录

- Red：新增 `main()` 单元用例后，缺失 repo root 会被 `runAnalyzeRepoTool` 自动创建，并生成通过的验收记录。
- Red：新增 repo root 指向普通文件的用例后，流程抛出 `ENOTDIR`，没有写入可审计验收记录。
- Green：新增 `buildRepoRootPreflightCheck`，在 `main` 中先写入失败记录并返回，只有 repo root 是有效目录时才继续创建 browser driver 和 hardening flow。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、26 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、63 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、209 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；230 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、234 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16-17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept package.json 前置校验完成

### 完成内容

- `pnpm user:accept` 现在要求有效 repo root 下存在文件型 `package.json`。
- 当 repo root 是空目录或缺少 `package.json` 时，runner 会写入包含 `package.json 是有效文件` 失败项的结构化验收记录，并返回非零退出码。
- 该前置校验避免把空目录误当作真实 Web App repo 完成验收准备。
- 更新 README、用户验收指南、测试策略、验收清单和用户验收记录模板中的真实项目验收边界与当前测试数量。

### TDD 记录

- Red：新增空目录 repo root 用例后，`pnpm user:accept` 仍会进入 hardening flow 并返回 0。
- Green：扩展 `buildRepoRootPreflightCheck`，在 repo root 是目录后继续检查 `package.json` 是否存在且为文件。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、27 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、64 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、210 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；231 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、235 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept hardening flow 异常记录完成

### 完成内容

- `pnpm user:accept` 主流程抽出 `runUserAcceptance`，支持在单测中注入 hardening runner，降低异常路径测试成本。
- 当 repo 前置校验通过但 hardening flow 发生非预期异常时，runner 会写入包含 `hardening flow 执行完成` 失败项的结构化验收记录，并返回非零退出码。
- 异常 evidence 会先经过敏感信息脱敏和长度截断，避免把 token、secret 等错误输出原样写入验收文档。
- 更新 README、用户验收指南、测试策略、验收清单和用户验收记录模板中的异常记录边界与当前测试数量。

### TDD 记录

- Red：新增注入失败 hardening runner 的 `runUserAcceptance` 单元用例后，测试因缺少可注入编排函数失败。
- Green：抽出 `runUserAcceptance(options, dependencies)`，保留 `main(args)` 对外行为，并在 hardening flow 异常 catch 分支写入结构化失败验收记录。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、28 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、65 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、211 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；232 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、236 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept help 入口完成

### 完成内容

- `pnpm user:accept -- --help` 现在会输出真实项目验收参数说明，并返回 0，不再要求提供 `--repo`。
- help 文案覆盖 repo、browser、trace、generated spec 验证、超时、critical path、启动命令、输出路径、用户结论和备注等验收参数。
- 更新 README、用户验收指南、测试策略、验收清单和用户验收记录模板，加入 help 入口并同步当前测试数量。

### TDD 记录

- Red：新增 `main(['--help'])` 单元用例后，`parseUserAcceptanceArgs` 抛出 `Unknown user acceptance option: --help`。
- Green：在 `main` 中新增 help 分支，抽出 `isUserAcceptanceHelpRequest` 和 `userAcceptanceHelpText`，保持正常验收路径不变。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、29 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-report.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、66 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、212 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；233 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、237 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm user:accept -- --help`：通过，输出真实项目验收参数说明。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - acceptance help 入口完成

### 完成内容

- `pnpm acceptance -- --help` 现在会输出验收门禁参数说明，并返回 0，不运行任何质量门禁或写入验收报告。
- help 文案覆盖 standard/full/browser/output 等验收参数，并提示 browser 模式需要浏览器权限。
- 更新 README、用户验收指南、测试策略和验收清单，加入 acceptance help 入口并同步当前测试数量。

### TDD 记录

- Red：新增 `main(['--help'])` 单元用例后，`parseArgs` 抛出 `Unknown acceptance option: --help`。
- Green：在 `run-acceptance` 的 `main` 中新增 help 分支，抽出 `isAcceptanceHelpRequest` 和 `acceptanceHelpText`，保持正常验收路径不变。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、67 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、213 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；234 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、238 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm acceptance -- --help`：通过，输出验收门禁参数说明。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - CLI 子命令 help 入口完成

### 完成内容

- `hardening analyze|explore|generate-tests|report|run --help` 现在会在命令分发层直接输出对应子命令用法，并返回 0。
- 子命令 help 会在参数校验、repo 分析、浏览器探索和 artifact 写入前返回，避免用户查帮助时触发副作用。
- 更新 README、用户验收指南、测试策略和验收清单，加入 CLI 子命令 help 验收项并同步当前测试数量。

### TDD 记录

- Red：新增 5 个子命令 `--help` 单元用例后，`analyze --help` 被当成 repo 路径执行，其余命令进入参数缺失或未知选项分支。
- Green：在 `runCli` 分发层新增 `commandHelpText` 和 `isHelpRequest`，让已知子命令的 `--help` / `-h` 统一走零副作用帮助路径。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：Red 阶段 5 个预期失败；Green 阶段通过，1 个测试文件、21 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，5 个测试文件、88 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `node dist/adapters/cli/index.js run --help`、`node dist/adapters/cli/index.js analyze --help`、`node dist/adapters/cli/index.js generate-tests --help`：通过，输出对应子命令用法说明。
- `pnpm test:unit`：通过，17 个测试文件、218 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；239 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、243 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - CLI help 短参数自描述完成

### 完成内容

- 全局 `hardening -h` / `--help` 现在会在帮助文本中明确列出 `--help, -h` 和 `--version, -v`。
- 子命令 `hardening analyze|explore|generate-tests|report|run -h` 会输出与 `--help` 相同的零副作用帮助文本，并在 Options 中自描述 `--help, -h`。
- 更新 README、用户验收指南、测试策略和验收清单，加入 `-h` 验收说明并同步当前测试数量。

### TDD 记录

- Red：新增全局 help option 自描述和 5 个子命令 `-h` 单元用例后，测试因帮助文本缺少 `--help, -h` / `--version, -v` 失败。
- Green：仅补充 CLI help 文案，不改命令执行逻辑，保持参数校验、repo 分析、浏览器探索和 artifact 写入路径不变。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：Red 阶段 6 个预期失败；Green 阶段通过，1 个测试文件、27 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，5 个测试文件、94 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `node dist/adapters/cli/index.js -h`、`node dist/adapters/cli/index.js run -h`、`node dist/adapters/cli/index.js analyze -h`：通过，输出包含短参数说明的帮助文本。
- `pnpm test:unit`：通过，17 个测试文件、224 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；245 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、249 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新总耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 验收 runner 短帮助转发示例完成

### 完成内容

- `pnpm acceptance -- -h` 现在在验收 help 的 Usage 中明确出现，帮助用户正确使用 pnpm 的短参数转发写法。
- `pnpm user:accept -- -h` 现在在真实项目验收 help 的 Usage 中明确出现，不要求提供 repo。
- 更新 README、用户验收指南、测试策略和验收清单，补齐两个验收 runner 的 `-h` 示例。

### TDD 记录

- Red：新增 acceptance 与 user acceptance help 单元断言后，输出缺少 `pnpm acceptance -- -h` 和 `pnpm user:accept -- -h`。
- Green：仅补充两个 help 文案的 Usage 行，不改解析、验收执行、artifact 写入或真实项目验收逻辑。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、39 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，4 个测试文件、67 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm acceptance -- -h`：通过，输出验收门禁短帮助转发示例。
- `pnpm user:accept -- -h`：通过，输出真实项目验收短帮助转发示例。
- `pnpm test:unit`：通过，17 个测试文件、224 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；245 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、249 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 用户备注脱敏完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 的用户备注现在会在写入前经过 `redactSensitiveText`。
- 该调整覆盖用户在 `--notes` 中粘贴 API key、token、敏感 URL query/fragment 等内容的场景。
- 保留既有 Markdown 标题转义保护，避免用户备注注入伪造的验收判定 section。
- 更新 README、用户验收指南、测试策略和验收清单，明确用户备注属于验收记录脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，用户备注中的 `API_KEY=sk-test-secret` 和 `token=note-secret` 原样出现在验收记录中。
- Green：`formatNotes` 写入前复用公共敏感信息脱敏函数，再执行标题转义。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、30 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，5 个测试文件、84 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、225 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；246 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、250 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 检查证据脱敏完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 的 Artifact 检查证据列现在会在渲染前经过 `redactSensitiveText`。
- 该调整覆盖前置校验、artifact 检查或 generated spec 验证证据中意外包含 API key、token、敏感 URL query/fragment 的场景。
- 保留既有 Markdown 表格转义，脱敏只发生在最终报告输出边界，不改变验收采集逻辑。
- 更新 README、用户验收指南、测试策略和验收清单，明确 artifact 检查证据属于验收记录脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，check evidence 中的 `API_KEY=sk-check-secret` 和 `token=artifact-secret` 原样出现在验收记录中。
- Green：`formatCheckRow` 写入证据列前复用公共敏感信息脱敏函数，再进行 Markdown 表格单元格转义。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、31 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，5 个测试文件、85 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、226 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；247 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、251 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 摘要路径脱敏完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 摘要表中的真实项目路径、hardening report 路径和 findings 路径现在会在渲染前经过 `redactSensitiveText`。
- 该调整覆盖用户 repo 路径、CI 工作目录、报告路径或 fragment/query 中意外包含 API key、token 等敏感值的场景。
- 保留既有 Markdown code span 与表格转义行为；脱敏只发生在验收记录显示层，不改变文件系统访问、artifact 检查或 goal audit 的自动证据采集。
- 更新 README、用户验收指南、测试策略和验收清单，明确验收记录摘要路径属于脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，摘要路径中的 `API_KEY=sk-path-secret`、`token=report-secret` 和 `access_token=findings-secret` 原样出现在验收记录中。
- Green：新增 `formatUserAcceptanceSummaryPath`，让 repo/report/findings 路径先复用公共敏感信息脱敏函数，再进入 Markdown code cell 格式化。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、32 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts tests/unit/markdown-format.test.ts`：通过，5 个测试文件、86 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、227 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；248 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、252 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。
- 日志顺序修复后复跑 `pnpm goal:audit`：通过，结果仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - acceptance 报告显示脱敏完成

### 完成内容

- `docs/acceptance/acceptance-run.md` 的报告路径、命令列和说明列现在会在渲染前经过 `redactSensitiveText`。
- 该调整覆盖自定义 `--output` 路径、验收命令或失败说明中意外包含 API key、token、client secret、URL query/fragment 敏感参数的场景。
- 保留既有 Markdown code span 和表格单元格转义行为；脱敏只发生在验收报告显示层，不改变命令执行逻辑和 artifact 检查。
- 更新用户验收指南、测试策略和验收清单，明确普通 acceptance 报告也属于脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/acceptance-report.test.ts` 用例后，`outputPath`、`command` 和 `detail` 中的 `API_KEY=sk-output-secret`、`token=command-token`、`client_secret=detail-secret` 和 `access_token=detail-token` 原样出现在验收报告中。
- Green：在 `src/internal/acceptance/report.ts` 新增 `formatAcceptanceCodeCell`，并在报告路径、命令列和说明列输出前复用公共敏感信息脱敏函数。

### 已验证

- `pnpm vitest run tests/unit/acceptance-report.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/acceptance-report.test.ts tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，5 个测试文件、87 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、228 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；249 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、253 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - benchmark 报告路径脱敏完成

### 完成内容

- `docs/logs/spike-results.md` 的运行目录、repo 报告路径和失败原因现在会在渲染前经过 `redactSensitiveText`。
- 该调整覆盖 benchmark 运行目录、report path 或失败日志中意外包含 API key、token、client secret、URL query/fragment 敏感参数的场景。
- 保留既有 benchmark 执行、artifact 生成和 Go/No-go 判定逻辑；脱敏只发生在 benchmark Markdown 显示层。
- 同时对 repo 名称做 Markdown 表格转义，避免异常 fixture 名称破坏结果表格。
- 更新用户验收指南、测试策略和验收清单，明确 `docs/logs/spike-results.md` 属于脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/benchmark-report.test.ts` 用例后，运行目录、report path 和失败原因中的 `API_KEY=sk-run-secret`、`token=report-secret`、`client_secret=error-secret` 和 `access_token=fragment-secret` 原样出现在 benchmark 报告中。
- Green：在 `src/internal/benchmark/report.ts` 复用 `redactSensitiveText`、`formatMarkdownCodeCell` 和 `escapeMarkdownTableCell`，收紧 benchmark Markdown 输出边界。

### 已验证

- `pnpm vitest run tests/unit/benchmark-report.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、3 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/benchmark-report.test.ts tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts tests/unit/acceptance-report.test.ts tests/unit/goal-audit.test.ts`：通过，5 个测试文件、58 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、229 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；250 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、254 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - goal audit 报告显示脱敏完成

### 完成内容

- `docs/acceptance/goal-completion-audit.md` 的分类标题、要求、证据和下一步现在会在渲染前经过 `redactSensitiveText`。
- 该调整覆盖 goal audit 证据或下一步文本中意外包含 API key、token、client secret、URL query/fragment 敏感参数的场景。
- 保留既有完成度判定逻辑；脱敏只发生在 goal audit Markdown 显示层。
- 分类标题继续保持 Markdown 安全显示，避免异常分类文本破坏标题结构。
- 更新用户验收指南、测试策略和验收清单，明确 `docs/acceptance/goal-completion-audit.md` 属于脱敏边界。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，分类标题、要求、证据和下一步中的 `API_KEY=sk-category-secret`、`token=evidence-secret`、`client_secret=next-secret` 和 `access_token=fragment-secret` 原样出现在 goal audit 报告中。
- Green：在 `src/internal/acceptance/goal-audit.ts` 复用 `redactSensitiveText` 和既有 Markdown 转义函数，收紧 goal audit Markdown 输出边界。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、26 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts tests/unit/acceptance-report.test.ts tests/unit/benchmark-report.test.ts`：通过，5 个测试文件、59 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、230 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；251 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、255 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - boot result 元数据脱敏完成

### 完成内容

- `toSerializableBootResult` 现在会对 auto-boot 可序列化结果中的 `logsPath`、`blockers` 和 `errors` 统一执行敏感信息脱敏。
- 该调整补齐了此前只脱敏 `url` 的输出边界，避免 `boot-result.json` 或 MCP/tool 返回值中的启动失败信息、日志路径和 blocker 文本意外携带 API key、token、client secret 或 URL query/fragment 敏感参数。
- 运行期 boot session 内部字段仍保留原值，供进程管理和后续流程使用；脱敏只发生在对外序列化和 artifact 写入边界。
- 更新 README、用户验收指南、测试策略和验收清单，明确 `boot-result.json` 的 URL、日志路径、blockers 和 errors 属于脱敏边界，并同步当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/boot-tool.test.ts` 用例后，`logsPath` 中的 `token=log-secret`、`blockers` 中的 `API_KEY=sk-blocker-secret` 和 `errors` 中的 `client_secret=error-secret` 会原样出现在可序列化 boot result 中。
- Green：在 `src/tools/boot-app-tool.ts` 复用 `redactSensitiveText`，对 `logsPath`、`blockers` 和 `errors` 做输出前脱敏。

### 已验证

- `pnpm vitest run tests/unit/boot-tool.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、3 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/markdown-format.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、231 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；252 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、256 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - MCP tool 错误响应脱敏完成

### 完成内容

- MCP tool 错误响应现在会在写入 `content` 文本和 `structuredContent.error` 前经过 `redactSensitiveText`。
- 该调整覆盖未知 tool 名、参数校验异常或下游 tool 抛出的错误 message 中意外包含 API key、token、client secret、URL query/fragment 敏感参数的场景。
- 正常 tool 成功结果不改变；仍由各 tool 自身在 artifact/structured result 输出边界做字段级脱敏。
- 更新 README、用户验收指南、测试策略和验收清单，明确 MCP tool 错误响应属于脱敏边界，并同步当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/mcp-tool-registry.test.ts` 用例后，未知 tool 名中的 `API_KEY=sk-tool-secret` 和 `token=query-secret` 会原样出现在 MCP 错误响应中。
- Green：在 `src/adapters/mcp/tool-registry.ts` 的 `toToolError` 中复用公共敏感信息脱敏函数，同时覆盖文本 content 和 structured error。

### 已验证

- `pnpm vitest run tests/unit/mcp-tool-registry.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、232 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；253 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、257 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - CLI stderr 错误输出脱敏完成

### 完成内容

- CLI 参数校验错误、未知命令错误和下游工具异常现在统一通过 `writeCliError` 写入 stderr。
- `writeCliError` 写入前复用 `redactSensitiveText`，避免用户把 API key、token、client secret 或带敏感 query/fragment 的 URL 传入 CLI 参数后被原样回显。
- 正常 stdout JSON 输出不改变；各 tool 的 artifact/structured result 仍由对应输出边界负责脱敏。
- 更新 README、用户验收指南、测试策略和验收清单，明确 CLI stderr 错误输出属于脱敏边界，并同步当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/cli-options.test.ts` 用例后，`hardening analyze ./app API_KEY=sk-cli-secret ...?token=url-secret` 的 validation error 会把敏感值原样写入 stderr。
- Green：在 `src/adapters/cli/run.ts` 引入公共敏感信息脱敏函数，并让所有 CLI stderr 错误输出经由 `writeCliError`。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、28 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，17 个测试文件、233 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；254 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，29 个测试文件、258 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - MCP 进程级 fatal stderr 脱敏完成

### 完成内容

- 新增 `src/adapters/mcp/fatal-error.ts`，集中格式化 MCP Server 进程级启动失败信息。
- `src/adapters/mcp/index.ts` 顶层 catch 现在通过 `formatMcpFatalError` 写入 stderr，避免启动失败 stack/message 中的 API key、token、client secret 或 URL query/fragment 敏感参数原样泄漏。
- MCP tool 层成功/失败响应逻辑不变；该切片只覆盖 stdio MCP Server 入口在 server 启动失败时的进程级 stderr 边界。
- 更新 README、用户验收指南、测试策略和验收清单，明确 MCP 进程级启动失败 stderr 属于脱敏边界，并同步当前测试数量。

### TDD 记录

- Red：新增 `tests/unit/mcp-fatal-error.test.ts` 后，测试因 `formatMcpFatalError` 模块不存在失败。
- Green：新增 formatter 并复用 `redactSensitiveText`，然后接入 MCP 入口文件的顶层 catch。

### 已验证

- `pnpm vitest run tests/unit/mcp-fatal-error.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，18 个测试文件、234 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；255 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，30 个测试文件、259 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 验收 runner fatal stderr 脱敏完成

### 完成内容

- 新增 `src/internal/acceptance/fatal-error.ts`，集中格式化 acceptance、goal:audit 和 user:accept 进程级 fatal error。
- `src/internal/acceptance/run-acceptance.ts`、`src/internal/acceptance/run-goal-audit.ts`、`src/internal/acceptance/run-user-acceptance.ts` 顶层 catch 现在写入 stderr 前会脱敏。
- 覆盖验收 runner 启动/未捕获异常中的 API key、token、client secret 和 URL query/fragment 敏感参数。
- 更新 README、用户验收指南、测试策略和验收清单，明确验收 runner 进程级 fatal stderr 属于脱敏边界，并同步测试数量。

### TDD 记录

- Red：新增 `tests/unit/acceptance-fatal-error.test.ts` 后，测试因 `formatAcceptanceFatalError` 模块不存在失败。
- Green：新增 formatter 并复用 `redactSensitiveText`，然后接入三个验收 runner 的 direct-run catch。

### 已验证

- `pnpm vitest run tests/unit/acceptance-fatal-error.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts tests/unit/acceptance-report.test.ts tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，4 个测试文件、85 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，19 个测试文件、235 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；256 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，31 个测试文件、260 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - Benchmark runner fatal stderr 脱敏完成

### 完成内容

- 新增 `src/internal/benchmark/fatal-error.ts`，集中格式化 benchmark runner 进程级 fatal error。
- `scripts/run-benchmark.mjs` 从顶层 await 改为 `main().catch(...)`，在进程级 fatal stderr 写入前复用公共敏感信息脱敏函数。
- 覆盖 benchmark runner 启动/未捕获异常中的 API key、token、client secret 和 URL query/fragment 敏感参数。
- 更新 README、用户验收指南、测试策略和验收清单，明确 benchmark runner 进程级 fatal stderr 属于脱敏边界，并同步测试数量。

### TDD 记录

- Red：新增 `tests/unit/benchmark-fatal-error.test.ts` 后，测试因 `formatBenchmarkFatalError` 模块不存在失败。
- Green：新增 formatter 并复用 `redactSensitiveText`，然后接入 benchmark runner 的顶层 catch。

### 已验证

- `pnpm vitest run tests/unit/benchmark-fatal-error.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、1 个测试。
- `pnpm vitest run tests/unit/benchmark-report.test.ts tests/unit/privacy-redaction.test.ts`：通过，2 个测试文件、19 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、236 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；257 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、261 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 18 秒，验收报告中 benchmark 阶段耗时约 19 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - CLI 成功 stdout JSON 脱敏完成

### 完成内容

- 新增 `formatCliJsonOutput`，让 CLI 成功 JSON 输出在写入 stdout 前统一经过敏感信息脱敏。
- `analyze`、`explore`、`generate-tests`、`report`、`run` 的成功结果现在都走同一个 JSON 输出边界。
- 该兜底层不改变各 tool 内部结果结构，降低未来新增字段时意外输出 API key、token、client secret 或 URL query/fragment 敏感参数的风险。
- 更新 README、用户验收指南、测试策略和验收清单，明确 CLI 成功 stdout JSON 属于脱敏边界，并同步测试数量。

### TDD 记录

- Red：新增 `formatCliJsonOutput` 单元断言后，测试因 formatter 未导出失败。
- Green：新增 formatter 并复用 `redactSensitiveText`，然后接入所有 CLI 成功 JSON 输出路径。

### 已验证

- `pnpm vitest run tests/unit/cli-options.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、29 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/integration/cli-analyze.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/cli-run.test.ts`：通过，3 个测试文件、5 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、237 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；258 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、262 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒，验收报告中 benchmark 阶段耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - MCP 成功响应脱敏完成

### 完成内容

- `src/adapters/mcp/tool-registry.ts` 的成功响应现在会在写入 text `content` 和 `structuredContent` 前统一经过敏感信息脱敏。
- 新增 MCP 成功响应脱敏测试，覆盖成功结果中的路径/API key/token 等敏感值不会进入协议响应。
- 修复通用脱敏误伤 `sessionId` 的问题：文本 content 仍可脱敏，成功响应的 `structuredContent.sessionId` 会保留，确保后续 `stop_app` 能继续使用该操作句柄。
- 更新 README、用户验收指南、测试策略和验收清单，明确 MCP 成功响应也属于脱敏边界，并同步测试数量。

### TDD 记录

- Red：新增 MCP 成功响应脱敏断言后，`profilePath` 中的 `API_KEY=sk-success-secret` 和 `token=query-secret` 会同时出现在 text content 与 structuredContent。
- Green：对成功结果先脱敏再返回，并保留 `sessionId`；随后用 MCP 协议级集成测试确认 `boot_app -> stop_app` 链路不被破坏。

### 已验证

- `pnpm vitest run tests/unit/mcp-tool-registry.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/privacy-redaction.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/integration/mcp-server.test.ts`（提权）：通过，1 个测试文件、2 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、238 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；259 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、263 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 19 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户修改反馈审计分支完成

### 完成内容

- `pnpm goal:audit` 现在会区分真实项目验收记录中的 `accepted` 与 `changes_requested`。
- `accepted` 仍是唯一长期 goal 完成证据；`changes_requested` 只有在真实运行通过、验收命令匹配、artifact 可验证且用户备注包含具体修改项时，才会被识别为有效修改反馈。
- 有效 `changes_requested` 会在 goal audit 中转为继续迭代输入，下一步指向 `docs/acceptance/user-acceptance-record.md` 的用户备注，而不是继续泛泛等待验收。
- 更新 README、用户验收指南、测试策略和验收清单，明确 `changes_requested` 的使用方式和审计语义，并同步测试数量。

### TDD 记录

- Red：新增 `classifyUserAcceptanceRecord` 的 `changes_requested` 断言后，测试因函数未导出失败。
- Green：新增验收记录分类函数，复用既有 repo、命令、artifact 和正式验收判定校验；随后把 goal audit 的用户验收项接入该分类结果。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、28 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、60 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、240 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；261 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、265 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论；若用户结论为 `changes_requested`，需继续按验收备注迭代。

## 2026年6月19日 - 验收记录模板修改反馈入口完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 模板现在包含 `--decision changes_requested --notes "<具体修改项>"` 示例。
- 模板说明同步为：`accepted` 才是长期 goal 完成证据；`changes_requested` 且备注包含具体修改项时，会被 `pnpm goal:audit` 识别为继续迭代输入。
- 新增文档回归测试，防止默认验收记录模板再次丢失修改反馈入口。
- 更新用户验收指南和验收清单中的测试数量。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 文档模板断言后，测试因 `docs/acceptance/user-acceptance-record.md` 缺少 `--decision changes_requested` 失败。
- Green：补充默认验收记录模板的修改反馈命令示例和 audit 语义说明。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、33 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、61 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、241 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；262 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、266 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论；若用户结论为 `changes_requested`，需继续按验收记录模板中的备注迭代。

## 2026年6月19日 - Required Documents 验收记录审计完成

### 完成内容

- `pnpm goal:audit` 的 Required Documents 审计现在把 `docs/acceptance/user-acceptance-record.md` 纳入必需文档清单。
- 新增 `REQUIRED_DOCUMENT_PATHS` 常量，避免必需文档清单散落在 `buildCurrentGoalAuditItems` 内部。
- Goal audit 报告的文档证据现在明确包含 acceptance record，贴合 `docs/goals/codex-goal.md` 最终交付物中的“验收记录”要求。
- 更新用户验收指南和验收清单中的测试数量。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，`REQUIRED_DOCUMENT_PATHS` 尚未导出，且清单无法证明包含 `docs/acceptance/user-acceptance-record.md`。
- Green：导出并复用 `REQUIRED_DOCUMENT_PATHS`，将 `docs/acceptance/user-acceptance-record.md` 加入 Required Documents 文件检查。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、29 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、62 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、242 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；263 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、267 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 18 秒。
- `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认；Required Documents 证据已包含 acceptance record。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 9 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 本地 artifact 输出审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 最终交付中的“本地 artifact 输出”。
- 新增 `本地 artifact` 分类，检查 hardening flow 是否覆盖 `boot-result.json`、`findings.json`、`test-generation.json`、`hardening-report.md`、`patch.diff`、截图和 trace artifacts 的源码与测试证据。
- 导出 `buildCurrentGoalAuditItems`，让单元测试可以直接验证当前完成度审计项，而不是只验证 Markdown formatter。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，`buildCurrentGoalAuditItems` 尚未导出，且当前审计项中不存在 `本地 artifact 输出`。
- Green：导出 `buildCurrentGoalAuditItems`，并新增 `本地 artifact 输出` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、30 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、63 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、243 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；264 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、268 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前为 10 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `本地 artifact` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 10 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收材料审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 最终交付中的“用户验收所需的演示命令和验收清单”。
- 新增 `用户验收材料` 分类，检查 README、用户验收指南和验收清单是否覆盖完整验收命令、goal audit 命令、真实项目验收命令、通过结论命令和待验收清单。
- 复用 `buildCurrentGoalAuditItems` 的当前状态测试，防止后续文档调整导致用户验收材料从完成度审计中脱落。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / 演示命令和验收清单`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 README、用户验收指南和验收清单，并新增 `演示命令和验收清单` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、31 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、244 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；265 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、269 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前为 11 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 11 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 安全边界完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 成功定义中的安全项：不硬编码密钥、不上传代码、不泄露 env value。
- 新增 `安全边界` 分类，检查 local-only 文档边界、env key hints、共享脱敏实现、CLI/MCP/report/acceptance 脱敏测试，以及浏览器敏感字段和危险动作跳过测试。
- 复用已有安全实现和回归测试作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `安全边界 / 不硬编码密钥、不上传代码、不泄露 env value`。
- Green：在 `buildCurrentGoalAuditItems` 中读取安全相关源码、测试和 local-first 文档，并新增 `安全边界` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、32 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、245 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；266 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、270 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前为 12 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `安全边界` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 12 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - TDD 与测试金字塔完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 的开发流程约束：TDD 优先、测试金字塔、小步切片和日志记录。
- 新增 `开发流程` 分类，检查 goal 契约、测试策略、开发日志和验收报告是否共同证明 Red/Green 记录、unit/integration/E2E 分层测试和当前验收门禁通过。
- 复用已有文档和验收报告作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量、benchmark 耗时与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `开发流程 / TDD 与测试金字塔执行记录`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 `docs/testing/test-strategy.md`、`docs/logs/dev-log.md` 和 `docs/acceptance/acceptance-run.md`，并新增 `TDD 与测试金字塔执行记录` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、33 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、246 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；267 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、271 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前为 13 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `开发流程` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 13 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 可观测性与可复现性完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 的可观测性和可复现性要求。
- 新增 `可观测性` 分类，检查工具输出是否覆盖 profile/findings/report/result/log 路径、artifact 路径、repro steps、evidence、verification command、blockers 和 errors。
- 复用现有 tool/report/browser 代码与 integration/E2E 测试作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量、benchmark 耗时与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `可观测性 / 可复现信息与失败证据`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 boot/explore/run/report 源码、用户文档和集成/E2E 测试，并新增 `可复现信息与失败证据` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、34 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、247 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；268 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、272 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前为 14 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `可观测性` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 14 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 日志治理完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 的日志治理要求。
- 新增 `日志治理` 分类，检查阻塞日志是否记录环境限制、尝试方案和外部条件，决策日志是否记录架构、依赖、测试和验收相关长期决策。
- 复用现有 `docs/logs/blockers.md`、`docs/logs/decision-log.md` 和 `docs/logs/dev-log.md` 作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `日志治理 / 阻塞与决策记录`。
- Green：在 `buildCurrentGoalAuditItems` 中读取阻塞日志和决策日志，并新增 `阻塞与决策记录` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、35 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、248 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；269 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、273 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前为 15 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `日志治理` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 15 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - Token 控制完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 的 Token Control Policy。
- 新增 `Token 控制` 分类，检查目标契约、开发日志小步 TDD 记录，以及 goal audit 对证据文件的定向读取。
- 审计证据刻意复用现有文档和源码，不做全仓递归扫描，贴合精准上下文和小步审计要求。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `Token 控制 / 精准上下文与小步审计`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 goal audit 源码，并新增 `精准上下文与小步审计` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、36 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、249 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；270 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、274 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 16 秒。
- `pnpm goal:audit`：通过，当前为 16 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `Token 控制` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 16 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - CLI 可运行性完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 最终交付中的“可运行 CLI”。
- 新增 `CLI 可运行性` 分类，检查 package bin、CLI 子命令 usage、零副作用 help 入口、`analyze/explore/generate-tests/report/run` handler smoke 和 artifact 输出测试。
- 复用现有 CLI 单元测试与集成测试作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量、benchmark 耗时与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `CLI 可运行性 / 子命令、帮助入口与 artifact smoke`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 CLI 源码、验收材料和 CLI smoke 测试，并新增 `子命令、帮助入口与 artifact smoke` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、37 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、250 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；271 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、275 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前为 17 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `CLI 可运行性` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 17 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - MCP 可运行性完成度审计完成

### 完成内容

- `pnpm goal:audit` 现在显式审计 `docs/goals/codex-goal.md` 最终交付中的“可运行 MCP Server”。
- 新增 `MCP 可运行性` 分类，检查 `hardening-mcp` stdio bin、MCP server list/call handler、协议级 `tools/list` / `tools/call` 集成测试、P0 MCP 链路、`stop_app` session 清理、参数校验和 MCP 脱敏测试。
- 复用现有 MCP registry、server 和协议级集成测试作为证据，没有改变运行时行为。
- 更新用户验收指南和验收清单中的测试数量与 goal audit 摘要。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `MCP 可运行性 / 协议级 list/call、P0 链路与 session 清理`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 MCP server、registry、用户验收材料和 MCP 协议/registry 测试，并新增 `协议级 list/call、P0 链路与 session 清理` 的 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、38 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、251 个测试。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；272 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，32 个测试文件、276 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，full 模式 15/15 检查通过，benchmark 5/5 completed，最新 benchmark 耗时约 17 秒。
- `pnpm goal:audit`：通过，当前为 18 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `MCP 可运行性` 章节。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 18 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 稳定报告样例验收材料完成

### 完成内容

- 新增 `docs/testing/sample-hardening-report.md`，提供可直接阅读的稳定报告样例，避免用户只能依赖 `benchmark-runs/<run-id>` 通配路径查找报告。
- `pnpm goal:audit` 现在将样例报告作为 required document，并新增 `用户验收材料 / 稳定报告样例` 审计项。
- 更新 README、用户验收指南和验收清单，显式指向稳定报告样例。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，`docs/testing/sample-hardening-report.md` 尚未纳入 required documents，且不存在 `用户验收材料 / 稳定报告样例` 审计项。
- Green：新增样例报告文档，在 `buildCurrentGoalAuditItems` 中读取该文档并新增稳定报告样例审计项。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、40 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、253 个测试。
- `pnpm goal:audit`：通过，当前为 19 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / 稳定报告样例` 审计项。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 19 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 已知限制和 blocker 验收材料完成

### 完成内容

- 用户验收指南的“已知限制”扩展为“已知限制和未解决 blocker”，集中列出默认沙箱本地监听、Chromium 权限、真实项目 hardening run 和用户验收结论四类待验收事项。
- 验收清单新增 `目标完成度审计已覆盖已知限制和未解决 blocker 列表`，让用户无需分散查看多个文档。
- `pnpm goal:audit` 新增 `用户验收材料 / 已知限制和未解决 blocker 列表` 审计项。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / 已知限制和未解决 blocker 列表`。
- Green：在 `buildCurrentGoalAuditItems` 中读取用户验收指南、验收清单和阻塞日志，并新增对应 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、41 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、254 个测试。
- `pnpm goal:audit`：通过，当前为 20 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / 已知限制和未解决 blocker 列表` 审计项。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 20 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - MCP 配置验收材料完成

### 完成内容

- 用户验收指南的 MCP 验收章节新增客户端验收步骤，覆盖配置 `mcpServers.hardening-mcp`、刷新 client、列出 tools、调用 `analyze_repo` smoke 和 `stop_app` 清理。
- 验收清单新增 `目标完成度审计已覆盖 MCP 配置示例和客户端验收步骤`。
- `pnpm goal:audit` 新增 `用户验收材料 / MCP 配置示例和客户端验收步骤` 审计项。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / MCP 配置示例和客户端验收步骤`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 README、用户验收指南和验收清单，并新增对应 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、42 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、255 个测试。
- `pnpm goal:audit`：通过，当前为 21 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / MCP 配置示例和客户端验收步骤` 审计项。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 21 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 安装前置条件验收材料完成

### 完成内容

- README 的安装章节新增环境前置条件，明确 Node.js 22+、pnpm、Playwright Chromium 和浏览器权限要求。
- 验收清单新增 `目标完成度审计已覆盖安装步骤和环境前置条件`。
- `pnpm goal:audit` 新增 `用户验收材料 / 安装步骤和环境前置条件` 审计项。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / 安装步骤和环境前置条件`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 README、用户验收指南和验收清单，并新增对应 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、43 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、256 个测试。
- `pnpm goal:audit`：通过，当前为 22 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / 安装步骤和环境前置条件` 审计项。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 22 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 示例 repo 运行流程验收材料完成

### 完成内容

- 用户验收指南的 Benchmark 章节新增“示例 repo 运行流程”，覆盖 `pnpm build`、`pnpm benchmark`、`docs/logs/spike-results.md`、completed repo 报告和 generated Playwright spec 检查。
- 验收清单新增 `目标完成度审计已覆盖示例 repo 运行流程`。
- `pnpm goal:audit` 新增 `用户验收材料 / 示例 repo 运行流程` 审计项。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / 示例 repo 运行流程`。
- Green：在 `buildCurrentGoalAuditItems` 中读取 README、用户验收指南、验收清单和 spike 结果，并新增对应 `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、44 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，20 个测试文件、257 个测试。
- `pnpm goal:audit`：通过，当前为 23 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / 示例 repo 运行流程` 审计项。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 23 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包完成

### 完成内容

- 新增 `pnpm user:handoff`，生成 `docs/acceptance/user-acceptance-handoff.md`。
- 交接包集中呈现 goal audit、真实项目验收命令、`accepted` / `changes_requested` 两条路径、验收重点和“不能由自动脚本代替用户确认”的完成边界。
- README、用户验收指南和验收清单已接入交接包入口。
- `pnpm goal:audit` 新增 `用户验收材料 / 用户验收交接包` 审计项。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 后，模块不存在导致测试失败；新增 `tests/unit/goal-audit.test.ts` 断言后，当前审计项中不存在 `用户验收材料 / 用户验收交接包`。
- Green：新增 handoff markdown builder、生成脚本、package script、文档和 goal audit `textRequirement`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：Red 阶段按预期失败；Green 阶段通过，2 个测试文件、46 个测试。
- `pnpm user:handoff`：通过，生成 `docs/acceptance/user-acceptance-handoff.md`。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前为 24 项自动证据通过、0 项缺失、1 项需用户人工确认；报告新增 `用户验收材料 / 用户验收交接包` 审计项。
- `pnpm test:unit`：通过，21 个测试文件、259 个测试。
- 文档和开发日志更新后复跑 `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包参数完成

### 完成内容

- `pnpm user:handoff -- --help` 现在输出交接包命令说明，不会生成或覆盖交接包。
- `pnpm user:handoff -- --output <path>` 支持写入自定义交接包路径，便于用户验收时生成临时或归档版本。
- `docs/acceptance/user-acceptance-handoff.md` 自身新增刷新交接包命令，用户打开该文件即可看到 help/output 入口。
- README、用户验收指南和验收清单已记录 `--help` 与 `--output <path>`。
- `pnpm goal:audit` 的 `用户验收材料 / 用户验收交接包` 审计项新增 help/output 证据。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，`--help` 被当成生成命令、`--output` 被忽略，且参数解析函数不存在。
- Green：新增 `parseUserAcceptanceHandoffArgs`、`userAcceptanceHandoffHelpText` 和 `writeUserAcceptanceHandoff`，并在 `main` 中接入 help 与自定义输出路径。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 3 个预期失败；Green 阶段通过，1 个测试文件、4 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、49 个测试。
- `pnpm user:handoff -- --help`：通过。
- `pnpm user:handoff -- --output /private/tmp/hardening-user-handoff-smoke.md`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，21 个测试文件、262 个测试。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 repo 命令完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 现在会把交接包中的 `user:accept` 命令渲染为真实 repo 路径命令。
- repo 路径会经过 shell quoting，覆盖包含空格的路径，避免用户复制命令后执行失败。
- README、用户验收指南和验收清单已记录 `--repo <repo>`。
- `pnpm goal:audit` 的 `用户验收材料 / 用户验收交接包` 审计项新增 repo 参数证据。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包仍输出 `<real-web-app-repo>` 占位符，且 `parseUserAcceptanceHandoffArgs` 拒绝 `--repo`。
- Green：新增 `repoRoot` handoff 输入、`--repo` 参数解析，并复用 `shellQuoteArg` 生成可复制命令。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、6 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、51 个测试。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-repo-smoke.md`：通过，输出真实 repo 路径命令。
- `pnpm test:unit`：通过，21 个测试文件、264 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，刷新 `docs/acceptance/user-acceptance-handoff.md`。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 repo 前置检查完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 现在会在交接包中显示 `Repo 前置检查` 表格。
- 前置检查复用 `user:accept` 的 repo root / `package.json` 校验逻辑，提前暴露路径不存在、不是目录或缺少 `package.json` 的问题。
- README、用户验收指南和验收清单已说明 `--repo` 会显示 repo root / `package.json` 前置检查结果。
- `pnpm goal:audit` 的 `用户验收材料 / 用户验收交接包` 审计项新增 repo preflight 证据。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包不会输出 `Repo 前置检查`。
- Green：在 handoff builder 中支持 `repoPreflightChecks`，runner 在 `--repo` 场景调用 `buildRepoRootPreflightCheck` 并写入 Markdown。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、7 个测试。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-preflight-smoke.md`：通过，输出 `Repo 前置检查`。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、52 个测试。
- `pnpm test:unit`：通过，21 个测试文件、265 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 repo 前置检查拆分完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 的 `Repo 前置检查` 现在拆分为两行：`repo root 是有效目录` 和 `package.json 是有效文件`。
- handoff 层新增专用 preflight 列表，不改变 `pnpm user:accept` 的现有结构化失败记录行为。
- 用户验收指南和验收清单已更新为“两个独立前置检查结果”。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，`buildUserAcceptanceHandoffRepoPreflightChecks` 不存在。
- Green：新增 handoff 专用 `buildUserAcceptanceHandoffRepoPreflightChecks`，对 repo root 和 `package.json` 分别返回检查项。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、8 个测试。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-preflight-two-checks.md`：通过，输出两个独立前置检查项。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、53 个测试。
- `pnpm test:unit`：通过，21 个测试文件、266 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包前置失败退出码完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 现在在必需 repo 前置检查失败时返回非零退出码。
- 命令仍会写出交接包，保留 `Repo 前置检查` 中的失败/跳过原因，便于用户或 CI 读取失败证据。
- 交接包正文、README、用户验收指南、验收清单和 goal audit 证据已同步说明该退出码语义。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，无效 repo 的 `main(['--repo', missingRepo])` 仍返回 0。
- Green：新增 handoff 层必需前置检查阻断判断；只要必需 repo 前置检查不是 `passed`，命令返回 1。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、54 个测试。
- `pnpm user:handoff`：通过，刷新 `docs/acceptance/user-acceptance-handoff.md`。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-valid-smoke.md`：通过，两个 repo 前置检查均通过。
- `pnpm user:handoff -- --repo /private/tmp/hardening-handoff-missing-repo --output /private/tmp/hardening-user-handoff-invalid-smoke.md`：按预期返回退出码 1，并写出失败交接包。
- `pnpm test:unit`：通过，21 个测试文件、267 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包前置失败指引完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 的 `Repo 前置检查` 表格现在会输出 `前置检查结论`。
- 当必需前置检查未通过时，交接包会明确提示先修复 repo 路径或 package.json，再运行 `pnpm user:accept`。
- README、用户验收指南、验收清单和 goal audit 证据已同步该用户流程。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，失败 repo 的 handoff 报告没有 `前置检查结论：未通过`。
- Green：`formatRepoPreflightChecks` 根据必需检查是否全部通过输出通过/未通过结论和下一步。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、55 个测试。
- `pnpm user:handoff`：首次运行暴露旧交接包缺少新 audit needle，刷新后再次运行通过，当前为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff -- --repo /private/tmp/hardening-handoff-missing-repo --output /private/tmp/hardening-user-handoff-blocked-smoke.md`：按预期返回退出码 1，并输出 `前置检查结论：未通过`。
- `pnpm test:unit`：通过，21 个测试文件、268 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包自引用刷新稳定完成

### 完成内容

- `pnpm user:handoff` 默认写入 `docs/acceptance/user-acceptance-handoff.md` 后，会重新计算 goal audit 摘要。
- 如果刷新交接包本身修复了旧文档缺失项，runner 会用同一生成时间再写入最终交接包，并以刷新后的摘要决定退出码。
- README、用户验收指南和验收清单已说明默认输出会在写入后重算摘要，避免旧交接包导致一次性失败。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，`runUserAcceptanceHandoff` 不存在，无法模拟“第一次审计缺失、写入后第二次审计通过”的自引用刷新场景。
- Green：新增可注入的 `runUserAcceptanceHandoff`，默认输出路径执行两阶段摘要刷新；自定义输出路径保持原有一次审计语义。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、56 个测试。
- `pnpm user:handoff`：通过，默认交接包刷新后仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-stable-valid.md`：通过，两个 repo 前置检查均通过。
- `pnpm user:handoff -- --repo /private/tmp/hardening-handoff-missing-repo --output /private/tmp/hardening-user-handoff-stable-invalid.md`：按预期返回退出码 1，并写出失败交接包。
- `pnpm test:unit`：通过，21 个测试文件、269 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包失败路径命令隐藏完成

### 完成内容

- 当 `pnpm user:handoff -- --repo <repo>` 的必需前置检查失败时，`建议验收顺序` 不再展示带失败 repo 的 `pnpm user:accept` 命令。
- 失败路径现在只展示修复 repo 路径或 package.json 后重新生成交接包的步骤，避免用户复制无效验收命令。
- README、用户验收指南和验收清单已同步该行为。

### TDD 记录

- Red：扩展 `tests/unit/user-acceptance-handoff.test.ts` 后，失败 repo 报告仍包含 `pnpm user:accept -- --repo /tmp/missing-app`。
- Green：新增 `formatRecommendedAcceptanceFlow`，根据必需 repo 前置检查是否通过生成不同的验收步骤。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、11 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、56 个测试。
- `pnpm user:handoff`：通过，刷新默认交接包。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-flow-valid.md`：通过，继续展示真实 `user:accept` 命令。
- `pnpm user:handoff -- --repo /private/tmp/hardening-handoff-missing-repo --output /private/tmp/hardening-user-handoff-flow-invalid.md`：按预期返回退出码 1，且不展示带失败 repo 的 `user:accept` 命令。
- `pnpm test:unit`：通过，21 个测试文件、269 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包表格转义完成

### 完成内容

- `Repo 前置检查` 表格现在会对检查项名称和证据做 Markdown 表格转义，避免 repo 路径或证据中的 `|`、换行破坏表格结构。
- 表格证据输出复用敏感信息脱敏逻辑，避免错误证据中出现 token、secret 等敏感值。
- 用户验收指南和验收清单已同步当前单元测试计数。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，包含 `|`、换行和 `TOKEN=secret-value` 的 repo 前置检查会破坏表格并泄露原始 token。
- Green：新增 `formatTableCell`，在 handoff 表格输出前统一执行敏感信息脱敏和 Markdown 表格单元转义。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、12 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、57 个测试。
- `pnpm user:handoff`：通过，刷新默认交接包，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff -- --repo fixtures/benchmark/vite-basic --output /private/tmp/hardening-user-handoff-escaped-valid.md`：通过，真实 repo 前置检查和验收命令继续正常输出。
- `pnpm user:handoff -- --repo /private/tmp/hardening-handoff-missing-repo --output /private/tmp/hardening-user-handoff-escaped-invalid.md`：按预期返回退出码 1，并写出失败交接包。
- `pnpm test:unit`：通过，21 个测试文件、270 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，当前仍为 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 聚合测试证据刷新完成

### 完成内容

- 补跑当前 `pnpm test` 聚合门禁，刷新 270 个单元测试后的整体测试证据。
- 用户验收指南和验收清单已同步最新聚合测试数量。
- 默认沙箱下本地 app boot 相关 integration/MCP 用例仍受本地监听限制；提权环境完整通过。

### TDD 记录

- 本轮没有新增运行时代码；属于质量门禁证据刷新和文档同步。
- 继续遵守测试金字塔，复用现有 unit、integration、E2E 聚合门禁验证当前状态。

### 已验证

- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；291 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、295 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包审计文件同步完成

### 完成内容

- `pnpm user:handoff` 默认写入 `docs/acceptance/user-acceptance-handoff.md` 时，现在会同步刷新 `docs/acceptance/goal-completion-audit.md`。
- 交接包摘要和链接到的目标完成度审计文件使用同一轮 goal audit items 和同一生成时间，避免用户打开旧审计文件。
- README、用户验收指南和验收清单已同步说明该默认刷新行为。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，默认 handoff runner 不会写出 `docs/acceptance/goal-completion-audit.md`，测试观察到 goal audit 写入列表为空。
- Green：为 `runUserAcceptanceHandoff` 增加可注入的 `writeGoalAudit`，默认 CLI 入口接入 `writeGoalAuditDocument`，并在默认输出路径下用最终审计项生成 goal audit Markdown。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、13 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、58 个测试。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，21 个测试文件、271 个测试。
- `pnpm lint`：通过。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；292 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、296 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包审计证据加固完成

### 完成内容

- `pnpm goal:audit` 的 `用户验收材料 / 用户验收交接包` 审计项现在会检查 `user:handoff` 默认刷新 `docs/acceptance/goal-completion-audit.md` 的实现证据。
- 审计输入新增 `src/internal/acceptance/run-user-acceptance-handoff.ts`，并要求存在 `goalAuditOutputPath`、`writeGoalAuditDocument` 和 `buildGoalAuditMarkdown`。
- 用户验收指南和验收清单已同步当前单元测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`用户验收交接包` 审计项证据未提到 `refreshes docs/acceptance/goal-completion-audit.md`。
- Green：扩展 `run-goal-audit` 的交接包审计 text source、needles 和 evidence，使交接包文档、用户说明和 runner 实现共同构成审计证据。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、46 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、59 个测试。
- `pnpm test:unit`：通过，21 个测试文件、272 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；293 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、297 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 repo 命令脱敏完成

### 完成内容

- `docs/acceptance/user-acceptance-handoff.md` 中由 `--repo <repo>` 渲染出的 `pnpm user:handoff` 和 `pnpm user:accept` 命令现在会在展示层脱敏 repo 路径中的敏感 key/value。
- 该调整不改变 runner 对真实 repo 路径的前置检查，只收紧交接包 Markdown 输出边界。
- `pnpm goal:audit` 的安全边界审计已纳入 handoff 命令脱敏测试证据。
- 用户验收指南和验收清单已同步当前测试计数。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包命令会原样输出 `/tmp/TOKEN=secret-value/real app`。
- Green：`buildUserAcceptanceHandoffMarkdown` 的 repo 命令参数改为先经过 `redactSensitiveText`，再用 `shellQuoteArg` 格式化。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，安全边界审计证据未覆盖 handoff 命令脱敏。
- Green：`run-goal-audit` 的安全证据读取 `tests/unit/user-acceptance-handoff.test.ts`，并要求存在 `redacts sensitive repo path values in handoff commands`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、14 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、47 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts`：通过，3 个测试文件、77 个测试。
- `pnpm test:unit`：通过，21 个测试文件、274 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；295 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、299 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包脱敏命令提示完成

### 完成内容

- 当 `docs/acceptance/user-acceptance-handoff.md` 中展示的 repo 命令路径包含被脱敏的敏感值时，交接包会明确提示该命令仅用于安全展示。
- 该提示要求用户使用真实 repo 路径重新运行命令，避免把包含 `[REDACTED]` 的展示命令误当作可直接复制执行的验收命令。
- `pnpm goal:audit` 的用户验收交接包审计已覆盖这条提示，防止后续交接包行为和审计证据漂移。
- 用户验收指南和验收清单已同步当前测试计数。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包只展示脱敏后的 repo 命令，没有说明该命令需要替换为真实 repo 路径。
- Green：`buildUserAcceptanceHandoffMarkdown` 检测 `repoRoot` 是否发生脱敏；发生脱敏时，在 Repo 参数行为区块增加安全展示提示。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`用户验收交接包` 审计项证据未覆盖脱敏命令提示。
- Green：`run-goal-audit` 读取交接包生成器源码，并要求存在脱敏命令提示文案，审计 evidence 同步说明该边界。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、48 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、63 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts`：通过，3 个测试文件、79 个测试。
- `pnpm test:unit`：通过，21 个测试文件、276 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；297 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、301 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 repo 预检刷新入口完成

### 完成内容

- 默认 `docs/acceptance/user-acceptance-handoff.md` 的刷新命令现在会显示 `pnpm user:handoff -- --repo <real-web-app-repo>`。
- 该入口让用户可以先生成带 repo root 和 `package.json` 前置检查的交接包，再执行真实项目 `pnpm user:accept`。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖这条 repo 预检刷新入口。
- 用户验收指南和验收清单已同步当前单元测试计数。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 断言后，默认交接包只显示 `--output <path>`，没有显示 `--repo <real-web-app-repo>` 预检刷新命令。
- Green：`buildUserAcceptanceHandoffMarkdown` 增加 `formatRefreshCommands`，默认输出同时展示真实 repo 预检刷新入口和自定义输出入口。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包审计 evidence 未说明默认交接包会提示用真实 repo 重新生成带前置检查的交接包。
- Green：`run-goal-audit` 的用户验收交接包 evidence 增加 `prompts regeneration with a real repo preflight`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、15 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过前已观察到 48 个既有测试通过、1 个新增测试失败。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、64 个测试。
- `pnpm test:unit`：通过，21 个测试文件、277 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts`：通过，3 个测试文件、80 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；298 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、302 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 真实项目验收记录前置检查拆分完成

### 完成内容

- `pnpm user:accept` 现在会在验收记录中分别输出 repo root 和 `package.json` 两个前置检查。
- 当 repo root 不存在或不是目录时，`package.json` 检查会标记为跳过，并说明 `repo root check failed`。
- 当 repo root 有效但缺少 `package.json` 时，验收记录会同时显示 repo root 通过、`package.json` 失败，方便用户定位需要修复的前置条件。
- `pnpm goal:audit` 的用户验收材料审计已纳入 user:accept 双项前置检查实现和测试证据。
- 用户验收指南和验收清单已同步当前单元测试计数与前置检查说明。

### TDD 记录

- Red：收紧 `tests/unit/user-acceptance.test.ts` 后，缺失 repo 和 repo root 为文件的失败记录只包含 repo root 失败，缺少 `package.json` 跳过项；缺失 `package.json` 的记录也缺少 repo root 通过项。
- Green：`runUserAcceptance` 改用 `buildUserAcceptanceRepoPreflightChecks`，在 hardening flow 前生成双项前置检查；保留 `buildRepoRootPreflightCheck` 兼容旧调用。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`演示命令和验收清单` 审计 evidence 未覆盖 user:accept 双项前置检查。
- Green：`run-goal-audit` 将 `src/internal/acceptance/run-user-acceptance.ts` 和 `tests/unit/user-acceptance.test.ts` 纳入审计输入，并更新 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 3 个预期失败；Green 阶段通过，1 个测试文件、33 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 前观察到 49 个既有测试通过、1 个新增测试失败。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、83 个测试。
- `pnpm test:unit`：通过，21 个测试文件、278 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts`：通过，3 个测试文件、99 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；299 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、303 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包有效 repo CLI 覆盖完成

### 完成内容

- 新增 `pnpm user:handoff -- --repo <repo> --output <path>` 的有效 repo 入口级回归测试。
- 测试验证有效 repo 前置检查全部通过时，CLI 返回 0、交接包包含 repo root 与 `package.json` 通过项，并渲染具体 `pnpm user:accept` 命令。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖有效 repo handoff 成功路径。
- 用户验收指南和验收清单已同步当前单元测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`用户验收交接包` 审计 evidence 未覆盖有效 repo handoff CLI 成功路径。
- Green：`run-goal-audit` 将 `tests/unit/user-acceptance-handoff.test.ts` 纳入用户验收交接包审计输入，并要求存在有效 repo CLI 成功路径测试。
- 入口级 handoff 测试本身新增后直接通过，说明当前实现已有该行为，本轮补的是验收入口回归覆盖。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：通过，1 个测试文件、16 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 前观察到 50 个既有测试通过、1 个新增测试失败。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、67 个测试。
- `pnpm test:unit`：通过，21 个测试文件、280 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/privacy-redaction.test.ts`：通过，3 个测试文件、83 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm goal:audit`：通过，24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；301 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、305 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收 repo 占位符预检完成

### 完成内容

- 新增共享 repo 占位符预检，`pnpm user:accept -- --repo "<real-web-app-repo>"` 和 `pnpm user:handoff -- --repo "<real-web-app-repo>"` 会在访问文件系统前失败，并提示 `replace <real-web-app-repo> with the real Web App repo path`。
- 该行为避免用户把文档中的占位符误当作真实路径后只看到泛化的 missing path 错误。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖占位符 repo 拒绝能力。
- 用户验收指南和验收清单已同步当前测试计数与占位符预检说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts` 用例后，占位符 repo 路径只返回 `missing repo root`。
- Green：新增 `src/internal/acceptance/repo-preflight.ts`，并在 `run-user-acceptance` 与 `run-user-acceptance-handoff` 的 repo root 检查前短路返回可执行提示。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包审计 evidence 未覆盖占位符 repo 拒绝能力。
- Green：`run-goal-audit` 纳入共享预检源码和两组验收测试，并更新 handoff 审计 needles 与 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、51 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：占位符刷新命令回归 Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、18 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、52 个测试。
- `pnpm test:unit`：通过，21 个测试文件、284 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm user:handoff -- --repo '<real-web-app-repo>' --output /private/tmp/hardening-placeholder-handoff.md`：按预期返回非零退出码，交接包写出占位符替换提示，刷新命令保持 `<real-web-app-repo>` 占位符。
- `pnpm user:accept -- --repo '<real-web-app-repo>' --output /private/tmp/hardening-placeholder-acceptance.md`：按预期返回非零退出码，验收记录写出占位符替换提示。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；305 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、309 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 占位符命令展示完成

### 完成内容

- `formatUserAcceptanceCommand` 现在会在 repo 参数包含 `<real-web-app-repo>` 这类占位符时，保留占位符本身用于显示命令。
- 该调整避免 `pnpm user:accept -- --repo "<real-web-app-repo>"` 的失败验收记录展示 `/Users/.../<real-web-app-repo>` 这类假绝对路径，降低用户复制错误命令的概率。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖可见 `user:accept` 命令保留占位符的行为。
- 用户验收指南和验收清单已同步当前测试计数与占位符展示说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`formatUserAcceptanceCommand` 仍把占位符 repo 解析后的绝对路径写入可见命令。
- Green：`user-acceptance-args.ts` 复用 `findRepoPathPlaceholder`，仅在显示命令时把 repo 参数还原为占位符；真实 repo 路径继续按原逻辑 shell quote。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包审计 evidence 未覆盖可见 `user:accept` 命令保留占位符。
- Green：`run-goal-audit` 将新测试标题纳入 handoff 审计 needles，并更新 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、35 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、53 个测试。
- `pnpm test:unit`：通过，21 个测试文件、286 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm user:accept -- --repo '<real-web-app-repo>' --output /private/tmp/hardening-placeholder-acceptance.md`：按预期返回非零退出码，验收记录中的可见命令保留 `--repo <real-web-app-repo>`。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；307 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、311 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 占位符摘要路径展示完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 的摘要路径格式化现在会识别 `<real-web-app-repo>` 这类占位符。
- 当用户误传占位符 repo 时，验收记录的 `真实项目路径` 会显示 `<real-web-app-repo>`，不再显示 `/workspace/<real-web-app-repo>` 这类解析后的假绝对路径。
- 真实 repo 路径、report 路径和 findings 路径仍保持原有脱敏与 Markdown code cell 格式化行为。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖验收记录摘要路径保留占位符的行为。
- 用户验收指南和验收清单已同步当前测试计数与摘要路径占位符说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，占位符 repo 的摘要 `真实项目路径` 仍显示解析后的绝对路径。
- Green：`user-acceptance.ts` 的 summary path formatter 复用 `findRepoPathPlaceholder`，仅在展示层把占位符路径收敛为占位符本身。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包审计 evidence 未覆盖摘要路径占位符展示。
- Green：`run-goal-audit` 将新测试标题纳入 handoff 审计 needles，并更新 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、36 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、54 个测试。
- `pnpm test:unit`：通过，21 个测试文件、288 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm user:accept -- --repo '<real-web-app-repo>' --output /private/tmp/hardening-placeholder-acceptance.md`：按预期返回非零退出码，验收记录的 `真实项目路径` 和 `验收命令` 均保留 `<real-web-app-repo>` 占位符。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；309 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、313 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - package.json JSON 前置检查完成

### 完成内容

- `pnpm user:accept -- --repo <repo>` 现在会在 hardening flow 启动前解析 `package.json`，并把 JSON 语法错误记录为结构化失败。
- `pnpm user:handoff -- --repo <repo>` 的 repo 前置检查同步验证 `package.json` JSON 语法，避免交接包展示可执行验收命令但后续真实验收立即失败。
- `pnpm goal:audit` 的用户验收材料审计已覆盖 malformed `package.json` 拒绝能力。
- 用户验收指南和验收清单已同步当前测试计数与前置检查说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts` 用例后，语法错误的 `package.json` 被当作存在的文件处理，未阻止后续流程。
- Green：`run-user-acceptance` 与 `run-user-acceptance-handoff` 在文件存在检查后读取并 `JSON.parse` package manifest，失败时返回 `invalid package.json` 证据。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`演示命令和验收清单` 审计 evidence 未覆盖 malformed `package.json` 拒绝能力。
- Green：`run-goal-audit` 将新测试标题和 `invalid package.json` 证据纳入审计 needles，并更新 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、56 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、55 个测试。
- `pnpm test:unit`：通过，21 个测试文件、291 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm user:accept -- --repo <malformed-package-json-temp-repo> --output <temp>/acceptance.md`：按预期返回非零退出码，验收记录显示 repo root 通过、`package.json` 失败，并写出 `invalid package.json` 证据。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；312 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、316 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接包 JSON 语法提示完成

### 完成内容

- `docs/acceptance/user-acceptance-handoff.md` 的 Repo 参数行为现在明确说明 `package.json` 必须是文件型且 JSON 对象 manifest。
- Repo 前置检查失败时，交接包会提示先修复 repo 路径或 package.json manifest，再运行 `pnpm user:accept`。
- `pnpm goal:audit` 的用户验收交接包审计证据已覆盖 handoff package documents package.json object manifest preflight。
- 用户验收指南和验收清单已同步当前测试计数与 handoff JSON 语法提示说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，handoff Markdown 未说明文件型、JSON 对象 manifest 的 `package.json` 要求。
- Green：`buildUserAcceptanceHandoffMarkdown` 的 Repo 参数行为、失败结论和修复步骤统一改为 repo 路径或 package.json manifest 修复提示。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包审计 evidence 未覆盖 JSON 语法预检说明。
- Green：`run-goal-audit` 的 handoff needles 和 evidence 纳入 JSON 语法预检提示。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、20 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 前观察到 55 个既有测试通过、1 个新增测试失败。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、76 个测试。
- `pnpm test:unit`：通过，21 个测试文件、293 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；314 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、318 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - package.json manifest 对象预检完成

### 完成内容

- `pnpm user:accept -- --repo <repo>` 现在会拒绝 JSON 合法但不是对象的 `package.json`，例如数组、字符串、数字、布尔值或 `null`。
- `pnpm user:handoff -- --repo <repo>` 的 repo 前置检查同步拒绝非对象 package manifest，避免用户拿到后续必然失败的验收命令。
- `pnpm goal:audit` 的用户验收材料审计已覆盖 non-object package.json manifests are rejected before hardening runs。
- 用户验收指南和验收清单已同步 package manifest 对象要求与当前单元测试计数。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts` 用例后，`[]` 这类合法 JSON 被当作有效 `package.json` 放行。
- Green：`run-user-acceptance` 与 `run-user-acceptance-handoff` 在 `JSON.parse` 后要求 manifest 是非数组对象，否则返回 `invalid package.json manifest` 证据。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`演示命令和验收清单` 审计 evidence 未覆盖非对象 package manifest 拒绝能力。
- Green：`run-goal-audit` 将新测试标题和 `invalid package.json manifest` 证据纳入审计 needles，并更新 evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、59 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 前观察到 56 个既有测试通过、1 个新增测试失败。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，3 个测试文件、116 个测试。
- `pnpm test:unit`：通过，21 个测试文件、296 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；317 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，33 个测试文件、321 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - package.json manifest 预检共享化完成

### 完成内容

- `src/internal/acceptance/repo-preflight.ts` 现在集中提供 `buildPackageJsonManifestCheck`，统一处理 `package.json` 存在性、文件类型、JSON 语法和对象 manifest 校验。
- `pnpm user:accept` 与 `pnpm user:handoff` 复用同一套 package manifest 预检逻辑，降低后续验收入口行为漂移风险。
- `user:accept` 继续通过 evidence formatter 截断超长错误证据；`user:handoff` 保持完整 repo 前置检查证据。
- 新增 `tests/unit/repo-preflight.test.ts`，直接覆盖共享 repo preflight 模块的占位符识别、有效 manifest、缺失文件、语法错误、非对象 manifest 和 evidence formatter。

### TDD 记录

- Refactor：在现有 `user-acceptance`、`user-acceptance-handoff` 和 `goal-audit` 回归测试保护下，将两个 runner 中重复的 `validatePackageJsonSyntax` / `isPackageJsonManifest` 实现迁移到共享 `repo-preflight` 模块。
- Fix：首次重构误删 `join` import，定向测试和 typecheck 立即暴露 `join is not defined` / TS2304；恢复 import 后回归通过。

### 已验证

- `pnpm vitest run tests/unit/repo-preflight.test.ts tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，4 个测试文件、122 个测试。
- `pnpm test:unit`：通过，22 个测试文件、302 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；323 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、327 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `rg -n "validatePackageJsonSyntax|isPackageJsonManifest|buildPackageJsonManifestCheck|invalid package.json manifest" src/internal/acceptance tests/unit`：确认 runner 中重复校验函数已移除，只有共享 `buildPackageJsonManifestCheck` 及测试/审计证据保留。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - repo root 目录预检共享化完成

### 完成内容

- `src/internal/acceptance/repo-preflight.ts` 现在集中提供 `buildRepoRootDirectoryCheck`，统一处理 repo root 占位符、目录存在性、非目录路径和缺失路径。
- `pnpm user:accept` 与 `pnpm user:handoff` 复用同一套 repo root 目录预检逻辑，继续在 repo root 失败时跳过 package manifest 检查。
- `tests/unit/repo-preflight.test.ts` 新增共享目录预检直接覆盖：占位符短路、有效目录、缺失路径和非目录路径。

### TDD 记录

- Red：新增 `buildRepoRootDirectoryCheck` 调用测试后，`tests/unit/repo-preflight.test.ts` 中 4 个用例因共享函数未导出而失败。
- Green：在 `repo-preflight` 中实现共享目录预检，并将 `run-user-acceptance` / `run-user-acceptance-handoff` 的私有重复 repo root 检查迁移到共享函数。
- Fix：迁移时首次误删 `run-user-acceptance` 中 artifact `fileExists` 仍需使用的 `stat` import；`pnpm typecheck` 暴露 TS2304 后恢复 import。

### 已验证

- `pnpm vitest run tests/unit/repo-preflight.test.ts`：Red 阶段 4 个预期失败；Green 阶段通过，1 个测试文件、10 个测试。
- `pnpm vitest run tests/unit/repo-preflight.test.ts tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，4 个测试文件、126 个测试。
- `pnpm test:unit`：通过，22 个测试文件、306 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。
- `pnpm user:handoff`：通过，同时刷新默认交接包和 `docs/acceptance/goal-completion-audit.md`。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；327 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、331 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - generated spec 执行验证审计证据完成

### 完成内容

- `pnpm goal:audit` 的“演示命令和验收清单”证据现在显式覆盖 `user:accept` 对 generated Playwright spec 的执行验证能力。
- 审计 needles 绑定到用户指南中的 `--validate-generated-tests` 命令、runner 中的 `buildGeneratedTestValidationCheck`、以及 generated spec 验证命令脱敏测试。
- 用户验收指南和验收清单已同步最新测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收材料 evidence 只覆盖生成 spec 与前置检查，未显式说明 `user:accept can execute generated Playwright specs`。
- Green：扩展 `run-goal-audit` 的验收材料 needles/evidence，使 goal audit 从文档、实现和测试中确认 generated spec 执行验证入口。
- Fix：首次 Green 使用了不存在的 marker 文本；目标测试暴露缺失后，改为引用已有跳过提示和验证命令脱敏测试文本。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、58 个测试。
- `pnpm test:unit`：通过，22 个测试文件、307 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；328 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、332 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - goal 状态与完整验收报告刷新完成

### 完成内容

- `docs/goals/codex-goal.md` 状态从草案更新为“执行中，自动证据已准备好请求用户验收”，保持原始目标和成功标准不变。
- 重新运行 `pnpm acceptance -- --full --browser`，刷新 `docs/acceptance/acceptance-run.md` 和 `docs/logs/spike-results.md`。
- 最新完整验收报告显示 full 模式 15/15 检查通过，benchmark 5/5 completed，真实 Chromium trace E2E 通过。

### TDD 记录

- 文档状态维护属于 `docs/goals/codex-goal.md` 明确允许的文档例外；本切片不改变核心产品逻辑。
- 以完整验收入口作为回归验证，覆盖 unit、E2E smoke、typecheck、lint、build、integration、benchmark 和真实 Chromium trace E2E。

### 已验证

- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过。
- `pnpm test:unit`：通过，22 个测试文件、307 个测试。
- `pnpm test:integration`：通过，11 个测试文件、24 个测试。
- `pnpm test:e2e`：通过，1 个测试通过、1 个可选 browser E2E 跳过。
- `pnpm benchmark`：通过，5/5 个 benchmark repo completed，5/5 generated tests 验证 passed，总耗时约 17 秒。
- `HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts`：通过，1 个真实 Chromium trace E2E。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - acceptance-run 新鲜度审计完成

### 完成内容

- `pnpm goal:audit` 的“完整验收门禁通过”检查现在要求 `docs/acceptance/acceptance-run.md` 的生成日期不早于 `docs/goals/codex-goal.md` 的最后更新日期。
- 该检查能防止 goal 文档更新后继续复用旧的 full acceptance 报告作为质量门禁证据。
- 用户验收指南和验收清单已同步最新测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`isAcceptanceRunFreshEnough` 尚未实现，过期 acceptance-run 无法被自动识别。
- Green：新增 acceptance-run 生成日期解析、goal 最后更新日期解析和 freshness 比较，并接入“完整验收门禁通过”审计项。
- Refactor：将 full acceptance markers 与 freshness 检查封装为 `buildAcceptanceRunQualityGateRequirement`，保持 goal audit 主流程可读。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、59 个测试。
- `pnpm test:unit`：通过，22 个测试文件、308 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；329 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、333 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收记录新鲜度审计完成

### 完成内容

- `pnpm goal:audit` 在读取 `docs/acceptance/user-acceptance-record.md` 时，现在要求记录生成时间不早于 `docs/goals/codex-goal.md` 的最后更新日期。
- 该检查防止 goal 契约更新后，旧的 accepted 用户验收记录继续被误判为完成证据。
- 直接调用 `classifyUserAcceptanceRecord` 时保持兼容；只有传入 goal 更新时间上下文时才启用 freshness 检查。
- 用户验收指南和验收清单已同步最新测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，旧的 accepted 验收记录在提供 goal 更新时间上下文时仍被分类为 `accepted`。
- Green：为用户验收记录分类器增加 `goalLastUpdatedText` 选项，并在 `buildCurrentGoalAuditItems` 中传入当前 `docs/goals/codex-goal.md` 内容。
- Regression：保留既有 direct helper 调用兼容性，未传 freshness 选项的历史单元测试不需要修改。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、60 个测试。
- `pnpm test:unit`：通过，22 个测试文件、309 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；330 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、334 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收记录 freshness 文档化完成

### 完成内容

- 用户验收交接包现在明确说明 accepted 验收记录的生成时间必须不早于 `docs/goals/codex-goal.md` 的最后更新日期。
- `pnpm goal:audit` 的“用户验收交接包”审计证据现在覆盖 accepted user acceptance records must be fresh for the current goal update date。
- 用户验收指南和验收清单已同步该完成边界和最新测试计数。

### TDD 记录

- Red：新增 `tests/unit/goal-audit.test.ts` 和 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包文案与审计 evidence 均未说明 accepted 验收记录 freshness 要求。
- Green：更新交接包生成器、用户验收指南、验收清单和 goal audit needles/evidence，让代码约束、用户材料和审计证据保持一致。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、82 个测试。
- `pnpm test:unit`：通过，22 个测试文件、310 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；331 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、335 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接状态摘要完成

### 完成内容

- `pnpm user:handoff` 现在会从 goal audit items 中提取“用户确认 MVP 符合预期”项，并在交接包里渲染当前用户验收状态、证据和下一步。
- `pnpm goal:audit` 的“用户验收交接包”证据现在覆盖 handoff summarizes current user acceptance status and next action。
- 刷新 full acceptance 报告，确保本次交接包改动后的质量门禁证据是最新的。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包不会渲染“用户验收状态”；新增 `tests/unit/goal-audit.test.ts` 用例后，审计 evidence 未覆盖该交接能力。
- Green：为 handoff builder 增加 `userAcceptanceItem` 输入，runner 从 goal audit items 中传入该项，并更新 goal audit needles/evidence。
- Fix：typecheck 暴露 `exactOptionalPropertyTypes` 下的可选属性问题后，改为缓存 user acceptance item 并直接传递 `GoalAuditItem`。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、22 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、62 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、84 个测试。
- `pnpm test:unit`：通过，22 个测试文件、312 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；333 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、337 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，benchmark 5/5 completed，真实 Chromium trace E2E 通过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接质量门禁快照完成

### 完成内容

- `pnpm user:handoff` 现在会从 goal audit items 中提取“完整验收门禁通过”项，并在交接包里渲染自动质量门禁状态、证据和下一步。
- `pnpm goal:audit` 的“用户验收交接包”证据现在覆盖 handoff summarizes automated quality gate status。
- 用户验收指南和验收清单已同步最新测试计数与交接包说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包不会渲染“自动质量门禁”；新增 `tests/unit/goal-audit.test.ts` 用例后，审计 evidence 未覆盖该交接能力。
- Green：为 handoff builder 增加 `qualityGateItem` 输入，runner 从 goal audit items 中传入该项，并更新 goal audit needles/evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、23 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、63 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、86 个测试。
- `pnpm test:unit`：通过，22 个测试文件、314 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；335 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、339 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm user:handoff`：通过，交接包已包含“自动质量门禁”和“用户验收状态”。
- `pnpm goal:audit`：通过，25 项检查、24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接当前结论完成

### 完成内容

- `pnpm user:handoff` 现在会在当前状态表之后直接渲染“当前结论”。
- ready 状态会明确显示“自动证据已齐，仍需用户验收结论”；incomplete 状态会提示先修复自动缺失项。
- `pnpm goal:audit` 的“用户验收交接包”证据现在覆盖 handoff renders an explicit current conclusion。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，交接包没有当前结论；新增 `tests/unit/goal-audit.test.ts` 用例后，审计 evidence 未覆盖该交接能力。
- Green：新增 `formatCurrentConclusion` 并更新 handoff 审计 needles/evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，1 个测试文件、24 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、64 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、88 个测试。
- `pnpm test:unit`：通过，22 个测试文件、316 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；337 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、341 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，benchmark 5/5 completed，真实 Chromium trace E2E 通过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接 repo preflight 当前结论完成

### 完成内容

- `pnpm user:handoff -- --repo <repo>` 现在在必需 repo 前置检查失败时，会让“当前结论”优先提示修复 repo 路径或 package.json manifest。
- 失败 repo preflight 仍保留独立检查表、非零退出码和禁止展示失败 repo `pnpm user:accept` 命令的既有行为。
- `pnpm goal:audit` 的“用户验收交接包”证据现在覆盖 handoff current conclusion prioritizes repo preflight blockers。
- 用户验收指南和验收清单已同步最新测试计数与交接包说明。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance-handoff.test.ts` 用例后，ready 状态下的当前结论仍显示“自动证据已齐，仍需用户验收结论”，没有优先暴露 repo preflight blocker。
- Green：`formatCurrentConclusion` 接收 repo preflight checks，并在必需检查失败时返回 repo blocker 结论。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，`用户验收交接包` 审计 evidence 未覆盖 repo preflight blocker 优先结论。
- Green：更新 `run-goal-audit` needles/evidence，要求源码、测试和交接文档共同覆盖该行为。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、25 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、65 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、90 个测试。
- `pnpm test:unit`：通过，22 个测试文件、318 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；339 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、343 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，benchmark 5/5 completed，真实 Chromium trace E2E 通过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - user:accept 生成记录下一步闭环完成

### 完成内容

- `pnpm user:accept` 生成的 `docs/acceptance/user-acceptance-record.md` 现在包含 `## 下一步` 章节。
- failed 记录会提示先修复必需项失败并重新运行 `pnpm user:accept`。
- pending 记录会提示用户将结论更新为 `accepted` 或 `changes_requested`。
- accepted 记录会提示运行 `pnpm goal:audit` 并确认用户验收项通过。
- changes_requested 记录会提示把用户备注写入 `docs/logs/dev-log.md` 或 `docs/logs/blockers.md`，继续迭代后重新验收。
- `pnpm goal:audit` 的“演示命令和验收清单”证据现在覆盖 generated user acceptance records include next-step guidance。

### TDD 记录

- Red：新增 4 个 `tests/unit/user-acceptance.test.ts` 用例后，生成记录缺少 `## 下一步`。
- Green：新增 `formatNextSteps`，按 run status 与 user decision 输出下一步。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收材料 evidence 未覆盖生成记录下一步闭环。
- Green：将 `src/internal/acceptance/user-acceptance.ts` 纳入 goal audit 审计输入，并补充 needles/evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts`：Red 阶段 4 个预期失败；Green 阶段通过，1 个测试文件、42 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、66 个测试。
- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、108 个测试。
- `pnpm test:unit`：通过，22 个测试文件、323 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；344 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、348 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收记录模板下一步闭环完成

### 完成内容

- `docs/acceptance/user-acceptance-record.md` 待验收模板现在包含 `## 下一步` 章节。
- 模板会提示先运行真实项目验收并生成本记录。
- 模板会提示用户确认通过后运行 `pnpm goal:audit`。
- 模板会提示用户要求修改时，把具体修改项写入备注并继续迭代。
- `pnpm goal:audit` 的“演示命令和验收清单”证据现在覆盖 placeholder user acceptance record includes next-step guidance。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，待验收模板缺少 `## 下一步`。
- Green：更新 `docs/acceptance/user-acceptance-record.md` 模板，补齐待验收状态下的下一步。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收材料 evidence 未覆盖模板下一步闭环。
- Green：将 `docs/acceptance/user-acceptance-record.md` 纳入 goal audit 的演示命令和验收清单审计输入，并补充 needles/evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、110 个测试。
- `pnpm test:unit`：通过，22 个测试文件、325 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；346 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、350 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - changes_requested 具体备注入口校验完成

### 完成内容

- `pnpm user:accept -- --decision changes_requested` 现在必须同时提供具体 `--notes`。
- 空备注、缺失 `--notes` 或 `<具体修改项>` 占位备注会在参数解析阶段被拒绝。
- 该入口行为与 `pnpm goal:audit` 的完成度语义对齐：只有包含具体用户修改项的 `changes_requested` 记录才会被识别为继续迭代输入。
- `pnpm goal:audit` 的“演示命令和验收清单”证据现在覆盖 changes_requested acceptance commands require concrete notes。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，缺少备注的 `changes_requested` 命令仍可解析通过。
- Green：在 `parseUserAcceptanceArgs` 中增加 `hasConcreteChangeNotes` 校验。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收材料 evidence 未覆盖该入口约束。
- Green：将 `src/internal/acceptance/user-acceptance-args.ts` 纳入 goal audit 审计输入，并补充 needles/evidence。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/goal-audit.test.ts`：Red 阶段 2 个预期失败；Green 阶段通过，2 个测试文件、112 个测试。
- `pnpm test:unit`：通过，22 个测试文件、327 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；348 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、352 个测试；1 个可选 browser E2E 文件、1 个测试跳过。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收交接 changes_requested 具体备注完成

### 完成内容

- `pnpm user:handoff` 生成的 `changes_requested` 示例命令现在使用具体备注 `补齐登录态探索并降低误报`，不再输出会被 CLI 拒绝的 `<具体修改项>` 占位备注。
- 具体 repo 路径下的交接包命令同样会 shell quote 该具体备注。
- `pnpm goal:audit` 的“用户验收交接包”证据现在覆盖 handoff changes_requested commands use concrete notes。
- 用户验收清单和用户验收指南已同步测试数量和交接包行为说明。

### TDD 记录

- Red：更新 `tests/unit/user-acceptance-handoff.test.ts` 后，handoff 生成器仍输出 `<具体修改项>`，2 个用例预期失败。
- Green：更新 `src/internal/acceptance/user-acceptance-handoff.ts`，将 `changes_requested` 示例备注改为具体修改项。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户验收交接包 evidence 未覆盖具体备注约束。
- Green：更新 `src/internal/acceptance/run-goal-audit.ts` 的 needle 和 evidence，将交接包 `changes_requested` 命令纳入审计。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts`：通过，1 个测试文件、25 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：Red 阶段 1 个预期失败；Green 阶段通过，1 个测试文件、69 个测试。
- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：通过，2 个测试文件、94 个测试。
- `pnpm test:unit`：通过，22 个测试文件、328 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；349 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、353 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，`docs/acceptance/acceptance-run.md` 和 `docs/logs/spike-results.md` 已刷新。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - accepted 用户验收确认备注加固完成

### 完成内容

- `pnpm user:accept -- --decision accepted` 现在必须同时提供具体 `--notes`，避免只有一个 flag 的记录被误当成明确用户验收。
- `pnpm goal:audit` 只会把包含具体用户确认备注的 accepted 验收记录判定为完成证据。
- CLI help、README、测试策略、用户验收指南、用户验收清单和验收记录模板已同步该边界。
- `pnpm goal:audit` 的“演示命令和验收清单”证据现在覆盖 accepted acceptance commands require concrete confirmation notes。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，`--decision accepted` 缺少备注仍可解析通过。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，用户备注为 `待用户填写。` 的 accepted 记录仍被归类为完成证据。
- Green：在 `parseUserAcceptanceArgs` 中为 accepted 增加具体确认备注校验，并在 goal audit 分类前检查 `## 用户备注`。
- Red：新增 goal audit evidence 用例后，审计项尚未覆盖 accepted 备注约束。
- Green：更新 `run-goal-audit` needles/evidence，将 accepted 具体确认备注要求纳入长期审计。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts`：Red 阶段 4 个预期失败；Green 阶段通过，3 个测试文件、142 个测试。
- `pnpm test:unit`：通过，22 个测试文件、332 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；353 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、357 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，`docs/acceptance/acceptance-run.md` 和 `docs/logs/spike-results.md` 已刷新。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - accepted 验收 generated spec 验证加固完成

### 完成内容

- `pnpm user:accept -- --decision accepted` 现在必须同时传入 `--validate-generated-tests`。
- `pnpm goal:audit` 只有在 accepted 验收记录包含 `generated Playwright spec 执行验证` 必需项通过证据时，才会把用户验收项判定为完成。
- 用户验收交接包、README、测试策略、用户验收指南、验收清单、验收记录模板和决策日志已同步最终 accepted 命令。
- `pnpm goal:audit` 的“演示命令和验收清单”证据现在覆盖 accepted acceptance records require generated spec validation。

### TDD 记录

- Red：新增 `tests/unit/user-acceptance.test.ts` 用例后，accepted 命令缺少 `--validate-generated-tests` 仍可解析通过。
- Red：新增 `tests/unit/goal-audit.test.ts` 用例后，generated spec 执行验证跳过的 accepted 记录仍被归类为完成证据。
- Green：在 `parseUserAcceptanceArgs` 中为 accepted 增加 `--validate-generated-tests` 校验，并在 goal audit 中要求 generated spec 执行验证为必需且通过。
- Red：新增 goal audit evidence 用例后，审计项尚未覆盖 accepted generated spec 验证要求。
- Green：更新 `run-goal-audit` needles/evidence，将该要求纳入长期审计。

### 已验证

- `pnpm vitest run tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/goal-audit.test.ts`：Red 阶段 3 个预期失败；Green 阶段通过，3 个测试文件、146 个测试。
- `pnpm test:unit`：通过，22 个测试文件、336 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（沙箱）：失败，4 个本地 app boot 相关 integration/MCP 用例返回 `failed` 而非 `running`，符合默认沙箱本地监听限制；357 个测试通过，1 个可选 browser E2E 跳过。
- `pnpm test`（提权）：通过，34 个测试文件、361 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，`docs/acceptance/acceptance-run.md` 和 `docs/logs/spike-results.md` 已刷新。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 用户验收指南 accepted 验收摘要同步完成

### 完成内容

- `docs/acceptance/user-acceptance-guide.md` 的验收模式表格已同步最终 accepted 边界。
- `pnpm goal:audit` 摘要说明现在明确：accepted 必须带具体确认备注，且 generated Playwright spec 执行验证通过。
- `--validate-generated-tests` 参数说明现在明确：最终 `--decision accepted` 必须启用该项。

### TDD 记录

- 本次为文档一致性修正，不涉及产品运行逻辑；按 goal 契约记录为文档例外。

### 已验证

- `pnpm goal:audit`：通过，25 项检查中 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - 真实项目用户验收外部阻塞记录完成

### 完成内容

- `docs/logs/blockers.md` 已新增“长期 goal 等待真实项目用户验收”条目。
- 阻塞记录明确当前不是代码或自动质量门禁缺失，而是 `docs/goals/codex-goal.md` Success Definition 要求的外部用户确认条件。
- 阻塞记录给出 pending、accepted 和 changes_requested 三条可执行验收路径。

### TDD 记录

- 本次为阻塞日志治理，不涉及产品运行逻辑；按 goal 契约记录为文档例外。

### 已验证

- `pnpm goal:audit`：通过，25 项检查中 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 等待用户提供真实 Web App repo 路径和用户验收结论。

## 2026年6月19日 - rotifer-playground 真实 repo 验收与非 Web 启动识别完成

### 完成内容

- 已克隆用户指定 repo：`rotifer-protocol/rotifer-playground` 到 `/private/tmp/rotifer-playground`。
- 已为目标 repo 执行 `npm ci`；默认沙箱访问 npm registry 被 `connect EPERM 127.0.0.1:7897` 拦截，提权后安装成功，npm audit 报 1 个 moderate vulnerability。
- 首次真实验收暴露误判：`analyze_repo` 将 `dev: tsc --watch` 推荐为 `npm run dev`，导致 `boot_app` 等待 Web URL 超时。
- `analyze_repo` 已加固：未知框架下不再把 `tsc --watch`、`tsup --watch` 等纯编译/watch 脚本推荐为 Web App start command；此类 repo 会返回 `recommendedStartCommand: null`，并记录 `No Web App start script detected`。
- `pnpm user:accept -- --browser` 已加固 browser driver 清理：即使 hardening 未进入 explore 阶段，也会关闭由 runner 创建的 browser driver，避免失败记录写出后进程挂住。
- 默认 `docs/acceptance/user-acceptance-record.md` 已恢复为待验收模板，避免真实 repo 的失败记录污染项目自身单元测试；rotifer 的实际报告保留在 `/private/tmp/rotifer-playground/hardening-report.md`。

### TDD 记录

- Red：新增 `tests/unit/analyze-repo.test.ts` 用例后，CLI/tooling repo 的 `dev: tsc --watch` 仍被推荐为 `npm run dev`。
- Green：在 analyzer 中过滤未知框架下的非 serving 脚本，并为有 start-like 脚本但无 Web App start command 的 repo 增加 blocker。
- Red：新增 `tests/unit/user-acceptance.test.ts` cleanup 用例后，`runUserAcceptance` 创建的 browser driver 在 no-explore hardening 返回路径没有关闭。
- Green：为 user acceptance runner 创建的 browser driver 增加 close-once 包装，并在 finally 中统一清理。

### 已验证

- `node dist/adapters/cli/index.js analyze /private/tmp/rotifer-playground`：通过，返回 `framework: unknown`、`recommendedStartCommand: null`、`blockers: ["No Web App start script detected"]`、`confidence: low`。
- `pnpm user:accept -- --repo /private/tmp/rotifer-playground --browser --validate-generated-tests --boot-timeout-ms 10000 --decision pending`（提权）：按预期未通过但正常退出；报告显示 readiness score 60、P0/P1/P2 均为 0、启动状态 failed，阻塞项为 `No Web App start script detected` 和 `No URL or start command is available`。
- `pnpm vitest run tests/unit/analyze-repo.test.ts tests/unit/user-acceptance.test.ts`：通过，2 个测试文件、76 个测试。
- `pnpm test:unit`：通过，22 个测试文件、338 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（提权）：通过，34 个测试文件、363 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 检查通过，benchmark 5/5 completed，5/5 generated specs passed，总耗时约 59 秒，`docs/acceptance/acceptance-run.md` 和 `docs/logs/spike-results.md` 已刷新。

### 未完成项

- 用户提供的 `rotifer-playground` 不是可自动启动的 Web App repo，当前不能作为 accepted 验收证据。
- 若要继续完成长期 goal，需要用户提供可运行 Web App repo，或提供该 repo 对应的已运行 Web UI URL 和可用 start command。

## 2026年6月19日 - rotifer-alpha 真实 Web App pending 验收通过

### 完成内容

- 已克隆用户指定 repo：`rotifer-protocol/rotifer-alpha` 到 `/private/tmp/rotifer-alpha`。
- 识别到真实 Web App 位于 `/private/tmp/rotifer-alpha/site`；根目录无 `package.json`，`site/` 为 Vite React 应用。
- `pnpm user:handoff -- --repo /private/tmp/rotifer-alpha/site` 通过 repo preflight，并刷新用户验收交接文档。
- `node dist/adapters/cli/index.js analyze /private/tmp/rotifer-alpha/site` 识别为 `framework: vite`、`packageManager: npm`、`recommendedStartCommand: npm run dev`、`confidence: high`。
- 目标 repo 的 `npm ci` 和 `npm run build` 通过；目标 repo 自身 `npm run lint` 未通过，主要为 React hooks/static-components、`any`、空 catch、render 中 `Date.now()` 等既有质量问题。
- 首次 `pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision pending` 暴露平台缺陷：目标 repo 未安装 `@playwright/test` 时，generated spec 验证无法解析 Playwright 依赖。
- 已通过 TDD 修复：generated spec 验证阶段由 hardening 平台临时提供 `@playwright/test` 解析入口，验证完成后清理，不要求被测 repo 安装 Playwright。
- 修复后重跑真实验收通过：7/7 artifact 检查通过，生成 `hardening-report.md`、`findings.json`、`patch.diff`、generated spec、browser artifacts，并成功回放 generated Playwright spec。
- 临时 Playwright dependency resolver 的清理顺序已修正，真实验收后 `/private/tmp/rotifer-alpha/site/tests/hardening` 下不再残留临时 `node_modules` 目录。
- 真实 pending 验收记录保存在 `docs/acceptance/user-acceptance-record.rotifer-alpha.md`；默认 `docs/acceptance/user-acceptance-record.md` 继续保留为最终 accepted 模板。

### TDD 记录

- Red：`rotifer-alpha/site` 真实验收中，generated spec 在目标 repo 下执行时报 `Cannot find package '@playwright/test'`。
- Green：新增 `ensureGeneratedTestPlaywrightDependency`，在 generated spec 所在目录创建临时 Playwright dependency resolver，并在验证后清理。
- Green：新增单元测试覆盖临时 resolver 的创建和清理。

### 已验证

- `npm ci`（目标 repo `/private/tmp/rotifer-alpha/site`）：通过。
- `npm run build`（目标 repo `/private/tmp/rotifer-alpha/site`）：通过。
- `npm run lint`（目标 repo `/private/tmp/rotifer-alpha/site`）：未通过，46 个既有问题，属于被测项目质量发现，不是 hardening-mcp 质量门禁。
- `pnpm vitest run tests/unit/user-acceptance.test.ts`：通过，1 个测试文件、48 个测试。
- `pnpm test:unit`：通过，22 个测试文件、339 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test`（提权）：通过，34 个测试文件、364 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision pending --output docs/acceptance/user-acceptance-record.rotifer-alpha.md`（提权）：通过，7/7 artifact 检查通过，generated spec 为 `/private/tmp/rotifer-alpha/site/tests/hardening/generated-findings-2.spec.ts`，readiness score 0，P1 75。
- `pnpm goal:audit`：通过，25 项检查中 24 项自动证据通过、0 项缺失、1 项需用户人工确认。

### 未完成项

- 当前记录仍为 `decision=pending`，不能替代用户明确验收结论。
- 若用户认为该结果符合 MVP 预期，需要运行或授权运行 accepted 命令写入最终验收记录；若不符合，应以 `changes_requested` 写明具体修改项继续迭代。

## 2026年6月19日 - Run-scoped artifact bundle 完成

### 完成内容

- `run_hardening` 新增 run-scoped artifact bundle：
  - `.hardening/runs/<run-id>/manifest.json`
  - `.hardening/runs/<run-id>/hardening-report.md`
  - `.hardening/runs/<run-id>/repo-profile.json`
  - `.hardening/runs/<run-id>/boot-result.json`
  - `.hardening/runs/<run-id>/app.log`
  - `.hardening/runs/<run-id>/findings.json`
  - `.hardening/runs/<run-id>/test-generation.json`
  - `.hardening/runs/<run-id>/patch.diff`
  - `.hardening/runs/<run-id>/generated-tests/*`
  - `.hardening/runs/<run-id>/artifacts/*`
- `.hardening/latest` 现在指向最新 run，AI IDE / Agent 可从 `.hardening/latest/manifest.json` 读取统一入口。
- 旧路径继续保留：根目录 `hardening-report.md`、`.hardening/run/*`、`.hardening/artifacts/*` 和 `tests/hardening/*.spec.ts`。
- README、架构说明、用户验收指南、技术 spike 计划、样例报告、验收清单和 goal audit 证据已同步新布局。

### TDD 记录

- Red：新增 `tests/integration/run-hardening-tool.test.ts` 用例后，`.hardening/latest` 不存在。
- Green：实现 bundle copy、manifest 写入和 latest symlink 更新。
- Green：goal audit 单元测试现在要求“本地 artifact 输出”证据包含 manifest/latest bundle。

### 已验证

- `pnpm vitest run tests/integration/run-hardening-tool.test.ts -t "run-scoped artifact bundle"`：Red 阶段按预期失败，Green 阶段通过。
- `pnpm vitest run tests/integration/run-hardening-tool.test.ts`：通过，1 个测试文件、9 个测试。
- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、75 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，22 个测试文件、339 个测试。
- `pnpm build`：通过。
- `pnpm test`（提权）：通过，34 个测试文件、365 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision pending --output docs/acceptance/user-acceptance-record.rotifer-alpha.md`（提权）：通过，8/8 artifact 检查通过，新增 `run manifest 已生成` 检查，generated spec 为 `/private/tmp/rotifer-alpha/site/tests/hardening/generated-findings-4.spec.ts`。
- 真实 repo bundle 已验证：`.hardening/latest -> runs/run-2026-06-19T11-19-40-270Z`，manifest 指向 bundle 内报告、findings、generated test 和 4 个截图 artifact。
- `pnpm goal:audit`：通过，25 项检查中 24 项自动证据通过、0 项缺失、1 项需用户人工确认；“本地 artifact 输出”证据已包含 manifest/latest bundle。

### 未完成项

- 当前仍为 `decision=pending`，长期 goal 仍等待用户明确 `accepted` 或 `changes_requested` 结论。

## 2026年6月20日 - 多 repo workspace output 完成

### 完成内容

- `runHardeningTool` 新增可选 `workspaceOutputDir`。
- CLI `hardening run` 新增 `--workspace-output <dir>`。
- MCP `run_hardening` 新增 `workspaceOutputDir` 输入字段。
- 中央输出目录结构：
  - `<workspace-output>/manifest.json`
  - `<workspace-output>/repos/<repo-slug>/latest`
  - `<workspace-output>/repos/<repo-slug>/runs/<run-id>/manifest.json`
  - `<workspace-output>/repos/<repo-slug>/runs/<run-id>/hardening-report.md`
  - `<workspace-output>/repos/<repo-slug>/runs/<run-id>/findings.json`
  - `<workspace-output>/repos/<repo-slug>/runs/<run-id>/generated-tests/*`
  - `<workspace-output>/repos/<repo-slug>/runs/<run-id>/artifacts/*`
- workspace manifest 会记录每个 repo 的 `repoSlug`、`repoRoot`、`latestRunId`、`latestRunDir` 和 `latestManifest`。
- README、架构说明、用户验收指南、验收清单和 goal audit 证据已同步多 repo 输出能力。

### TDD 记录

- Red：新增 `tests/integration/run-hardening-tool.test.ts` 多 repo workspace output 用例后，中央 `manifest.json` 不存在。
- Green：实现 workspace bundle copy、repo slug 生成、repo latest symlink 和 workspace manifest 更新。
- Green：CLI option 测试覆盖 `--workspace-output`；goal audit 测试覆盖 multi-repo workspace manifest 证据。

### 已验证

- `pnpm vitest run tests/integration/run-hardening-tool.test.ts -t "workspace output"`：Red 阶段按预期失败，Green 阶段通过。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/unit/mcp-tool-registry.test.ts tests/unit/goal-audit.test.ts tests/integration/run-hardening-tool.test.ts`：通过，4 个测试文件、124 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm test:unit`：通过，22 个测试文件、339 个测试。
- `pnpm test`（提权）：通过，34 个测试文件、366 个测试；1 个可选 browser E2E 文件、1 个测试跳过。
- `pnpm goal:audit`：通过，25 项检查中 24 项自动证据通过、0 项缺失、1 项需用户人工确认；“本地 artifact 输出”证据已包含 optional multi-repo workspace manifest。

### 未完成项

- 当前仍为 `decision=pending`，长期 goal 仍等待用户明确 `accepted` 或 `changes_requested` 结论。

## 2026年6月20日 - 用户验收闭环与 Spec v0.2 启动

### 完成内容

- 用户明确确认当前 MVP 符合预期，并授权完成验收闭环。
- 已运行最终 accepted 验收命令：
  `pnpm user:accept -- --repo /private/tmp/rotifer-alpha/site --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`。
- `docs/acceptance/user-acceptance-record.md` 已写入真实项目 accepted 验收记录，8/8 artifact 检查通过。
- 真实项目验收输出包含 `hardening-report.md`、`findings.json`、`patch.diff`、run manifest、generated Playwright spec、generated spec 执行验证和 browser artifacts。
- 修复了 `pnpm goal:audit` 对 quoted Playwright executable 证据的误判：审计逻辑现在解析 shell words，而不是依赖固定字符串 `playwright test`。
- 已新增 `docs/product/mvp-spec-v0.2.md`，作为下一阶段“AI IDE 可执行修复计划”的产品规格入口。

### TDD 记录

- Red：最终验收记录已为 accepted，但 `pnpm goal:audit` 仍将用户验收项判定为人工待确认。
- 定位：generated spec 执行验证命令使用带引号的 Playwright 绝对路径，旧规则要求证据包含固定字符串 `playwright test`。
- Green：新增单元测试覆盖 quoted Playwright executable path 和单引号 notes 的验收记录；修复后分类结果为 `accepted`。

### 已验证

- `pnpm vitest run tests/unit/goal-audit.test.ts`：通过，1 个测试文件、76 个测试。
- `pnpm test:unit`：通过，22 个测试文件、340 个测试。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 项检查通过；Unit、E2E smoke、typecheck、lint、build、integration、benchmark、Real Chromium trace E2E 全部通过。
- `pnpm goal:audit`：通过，25/25 项检查通过，0 项缺失，0 项需要人工确认，结论为“自动可验证范围和用户验收结论均已有证据，可以进入长期 goal 完成审计”。

### 未完成项

- v0.1 goal 已满足完成条件；下一阶段进入 Spec v0.2 的方案评审和实现规划。

## 2026年6月20日 - 结构治理 goal 启动

### 完成内容

- 用户授权全自动执行项目文件夹结构优化。
- 已创建长期 goal：在不降低功能、测试、验收证据和文档可追溯性的前提下，优化顶层产物、docs 分层和 src 边界。
- 新增 `docs/goals/codex-goal-structure-refactor.md`，定义目标结构、迁移顺序、TDD 策略、兼容要求、风险控制和完成边界。

### TDD 记录

- Phase 0 暂不改运行时代码，只建立结构治理契约。
- 后续每个目录迁移阶段必须先更新或补充路径相关测试，再执行迁移。

### 已验证

- 已读取当前顶层目录、源码目录、docs 目录和路径引用热点。

### 下一步

- Phase 1：将 benchmark/test 运行产物治理到 `artifacts/`，同步 `.gitignore`、ESLint ignore、Vitest exclude 和 benchmark runner 默认路径。

## 2026年6月20日 - Phase 1 顶层运行产物治理

### 完成内容

- 新增 `tests/unit/project-structure.test.ts`，守护 benchmark 产物必须写入 `artifacts/benchmark-runs/`，并确保新旧产物目录都被测试和 lint 排除。
- `scripts/run-benchmark.mjs` 默认运行目录从 `benchmark-runs/` 调整为 `artifacts/benchmark-runs/`。
- `.gitignore` 新增 `artifacts/benchmark-runs/` 和 `artifacts/test-results/`，同时保留旧 `benchmark-runs/`、`test-results/` 兼容忽略。
- `eslint.config.js` 和 `vitest.config.ts` 同步排除新旧 benchmark/test 产物目录。
- 历史顶层 `benchmark-runs/`、`test-results/` 和误生成的 `--help/` 已移动到 `artifacts/` 下归档：
  - `artifacts/benchmark-runs/`
  - `artifacts/test-results/`
  - `artifacts/orphaned-runs/--help/`
- README、用户验收指南、测试策略、架构说明和样例报告已更新为 `artifacts/benchmark-runs/`。

### TDD 记录

- Red：新增 `project-structure.test.ts` 后，测试失败，确认旧 benchmark runner 仍写入 `benchmark-runs/`。
- Green：更新 benchmark runner 和忽略规则后，结构守护测试通过。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、1 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，5/5 benchmark repo completed，运行目录为 `artifacts/benchmark-runs/run-2026-06-20T03-42-13-926Z`。

### 下一步

- Phase 2：设计并执行 `docs/` 分层迁移，优先保证 acceptance、goal audit 和 README 默认路径不失效。

## 2026年6月20日 - Phase 2 docs 分层迁移

### 完成内容

- `docs/` 已按职责分层：
  - `docs/product/`：MVP spec 和用户访谈脚本。
  - `docs/architecture/`：架构说明和技术 spike 计划。
  - `docs/testing/`：测试策略和样例硬化报告。
  - `docs/acceptance/`：验收清单、验收运行报告、goal audit、用户验收指南、交接包和验收记录。
  - `docs/logs/`：开发日志、阻塞日志、决策日志和 benchmark/spike 结果。
  - `docs/goals/`：长期 goal 和结构治理 goal。
- `run-acceptance` 默认写入 `docs/acceptance/acceptance-run.md`。
- `run-goal-audit` 默认写入并读取 `docs/acceptance/goal-completion-audit.md`，并读取分层后的 required documents。
- `run-user-acceptance` 默认写入 `docs/acceptance/user-acceptance-record.md`。
- `run-user-acceptance-handoff` 默认写入 `docs/acceptance/user-acceptance-handoff.md`，并刷新新的 goal audit 路径。
- `scripts/run-benchmark.mjs` 现在写入 `docs/logs/spike-results.md`。
- README、代码、测试和文档中的旧 `docs/*.md` 引用已机械迁移到新路径。

### TDD 记录

- Red：路径迁移前先通过 `rg` 建立旧路径引用清单，确认默认输出和审计读取路径仍指向平铺 `docs/`。
- Green：更新默认路径和实际文件位置后，关键验收相关单元测试通过。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/user-acceptance.test.ts tests/unit/user-acceptance-handoff.test.ts tests/unit/acceptance-report.test.ts`：通过，5 个测试文件、161 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，23 个测试文件、341 个测试。

### 下一步

- 运行 `pnpm goal:audit`，确认分层 docs 对长期审计没有破坏。
- Phase 3：评估 `src/` 边界迁移，优先从低风险 shared/internal 命名开始。

## 2026年6月20日 - Phase 3 src 边界迁移

### 完成内容

- `src/cli/` 迁移到 `src/adapters/cli/`。
- `src/mcp/` 迁移到 `src/adapters/mcp/`。
- `src/acceptance/` 迁移到 `src/internal/acceptance/`。
- `src/benchmark/` 迁移到 `src/internal/benchmark/`。
- `src/core/analyze`、`boot`、`explore`、`tests`、`report` 迁移到 `src/domain/`，其中 report 目录重命名为 `src/domain/reports/`。
- `privacy-redaction.ts`、`shell-quote.ts`、`shell-words.ts` 迁移到 `src/shared/`。
- `package.json` 的 bin 和 scripts 已更新：
  - `hardening` -> `dist/adapters/cli/index.js`
  - `hardening-mcp` -> `dist/adapters/mcp/index.js`
  - acceptance / goal audit / user acceptance scripts -> `dist/internal/acceptance/*`
- `run-goal-audit` 的源码读取路径已同步到 adapters/domain/shared/internal。
- 架构说明已更新为 adapters、domain、shared、internal、tools 的边界。

### TDD 记录

- Red：扩展 `tests/unit/project-structure.test.ts` 后，测试因 `src/adapters/cli/run.ts` 不存在失败。
- Green：移动源码目录并修正 imports、package scripts、goal audit 读取路径后，结构守护测试和 goal audit 单测通过。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts`：Red 阶段按预期失败，Green 阶段通过。
- `pnpm vitest run tests/unit/goal-audit.test.ts tests/unit/project-structure.test.ts`：通过，2 个测试文件、78 个测试。
- `pnpm test:unit`：通过，23 个测试文件、342 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:integration`：默认沙箱因本地监听权限失败；提权重跑通过，11 个测试文件、26 个测试。

### 下一步

- 运行 E2E、full acceptance 和 goal audit，确认结构治理对端到端交付无回归。

## 2026年6月20日 - Phase 4/5 README 入口与完整验收

### 完成内容

- README 新增“项目结构”入口，明确 `src/`、`docs/` 和 `artifacts/` 的职责边界。
- `docs/goals/codex-goal-structure-refactor.md` 状态更新为“已完成”，并补充 completion evidence。
- 清理迁移前残留的 `dist/` 旧构建目录并重新执行 `pnpm build`，当前构建产物只保留 adapters/domain/shared/internal/tools/types 等新结构目录。
- 结构治理完成后，最终产物入口保持为：
  - benchmark 运行产物：`artifacts/benchmark-runs/`
  - 测试运行产物：`artifacts/test-results/`
  - 自动验收报告：`docs/acceptance/acceptance-run.md`
  - goal audit 报告：`docs/acceptance/goal-completion-audit.md`

### TDD 记录

- 文档收尾前已完成 source/docs/artifacts 路径守护测试。
- 收尾更新只改变 README、goal 文档和 dev-log，不改变运行时代码。

### 已验证

- `pnpm test:e2e`：通过，1 个测试文件、1 个 skipped。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 checks passed；benchmark 5/5 completed；真实 Chromium trace E2E 通过。
- `pnpm build`：清理旧 `dist/` 后重建通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，23 个测试文件、342 个测试。
- `pnpm goal:audit`：通过，25/25 checks passed，missing 0，manual 0。

### 下一步

- 进入 spec v0.2 前，可基于当前清晰边界实现 `repair-plan`：优先放入 `src/domain/repair-plan/`，并由 `src/tools/` 对外编排。

## 2026年6月20日 - v0.2 Repair Plan Phase 0/1

### 完成内容

- 创建长期执行目标：全自动实现 Spec v0.2 `repair-plan` 能力。
- 新增 `docs/goals/codex-goal-repair-plan-v0.2.md`，明确授权、范围、TDD 计划、非目标和成功标准。
- 新增 `src/domain/repair-plan/generate-repair-plan.ts` 和 `src/types/repair-plan.ts`。
- 新增 `src/tools/generate-repair-plan-tool.ts`。
- `run_hardening` 现在会生成：
  - `.hardening/runs/<run-id>/repair-plan.json`
  - `.hardening/runs/<run-id>/repair-plan.md`
  - `.hardening/run/repair-plan.json`
  - `.hardening/run/repair-plan.md`
- run manifest 的 `entrypoints` 和 `files` 已引用 repair plan。
- CLI 新增 `hardening plan <repo>`。
- MCP 新增 `generate_repair_plan`。
- 用户验收 artifact 检查新增 `repair-plan.json` 和 `repair-plan.md`。

### TDD 记录

- Red：新增 repair-plan 单测后，因 `src/domain/repair-plan/generate-repair-plan.ts` 缺失失败。
- Red：扩展 run bundle、CLI 和 MCP 测试后，因 `repairPlan` 返回值、`plan` 命令和 `generate_repair_plan` tool 缺失失败。
- Green：实现 deterministic repair plan generator、tool wrapper、CLI/MCP 入口和 run bundle 集成后，局部门禁通过。

### 已验证

- `pnpm typecheck`：通过。
- `pnpm vitest run tests/unit/repair-plan.test.ts tests/unit/user-acceptance.test.ts tests/unit/mcp-tool-registry.test.ts tests/unit/cli-options.test.ts tests/integration/run-hardening-tool.test.ts tests/integration/cli-run.test.ts`：通过，6 个测试文件、104 个测试。

### 下一步

- 更新 README、用户验收指南、acceptance checklist、sample report 和 goal audit。
- 运行完整 unit、integration、E2E、acceptance 和 goal audit。

## 2026年6月20日 - v0.2 Repair Plan Phase 2 完整验收

### 完成内容

- README、架构说明、用户验收指南、acceptance checklist、sample hardening report 和 goal audit 已同步 repair-plan 能力。
- `scripts/run-benchmark.mjs` 的 CLI 路径从旧 `dist/cli/index.js` 修复为 `dist/adapters/cli/index.js`。
- `tests/unit/project-structure.test.ts` 新增 benchmark runner dist path 守护，避免结构迁移后的旧路径回归。

### TDD 记录

- Red：`pnpm acceptance -- --full --browser` 首次失败，benchmark 5/5 失败，原因是 runner 调用旧 `dist/cli/index.js`。
- Green：修复 benchmark runner 的 CLI 路径并补结构测试后，`pnpm benchmark` 恢复 5/5 completed。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，1 个测试文件、2 个测试。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm benchmark`（提权）：通过，5/5 completed，运行目录 `artifacts/benchmark-runs/run-2026-06-20T04-17-20-223Z`。
- `pnpm acceptance -- --full --browser`（提权）：通过，15/15 checks passed；unit 24/347，integration 11/27，benchmark 5/5，真实 Chromium trace E2E 通过。

### 下一步

- 运行最终 `pnpm goal:audit`。
- 若 goal audit 通过，将 v0.2 repair-plan goal 标记完成。

## 2026年6月20日 - v0.2 Repair Plan Goal 完成

### 完成内容

- `docs/goals/codex-goal-repair-plan-v0.2.md` 状态更新为“已完成”，并补充 completion evidence。
- `docs/product/mvp-spec-v0.2.md` 状态更新为“已实现，待真实项目新一轮用户验收”。
- `docs/acceptance/goal-completion-audit.md` 已刷新到 v0.2 repair-plan 证据。

### 已验证

- `pnpm goal:audit`：通过，25/25 checks passed，missing 0，manual 0。

### 下一步

- 选择一个真实目标 repo 运行 `pnpm user:accept -- --repo <repo> --browser --validate-generated-tests --decision pending`，检查 repair plan 是否能被 AI IDE 稳定消费。

## 2026年6月20日 - Executable Repair Task Package 增量

### 完成内容

- 根据用户授权，将“把 findings 转成可执行修复任务包”实现为产品能力增量。
- 新增 `repair-task-package.json` 和 `repair-task-package.md`，与 `repair-plan.*` 同 run bundle 输出。
- 每个任务包包含 objective、context、recommendedFix、expectedOutcome、changeScope、implementationSteps、acceptanceCriteria 和 handoffPrompt。
- `run_hardening` manifest 现在在 `entrypoints` 与 `files` 中暴露 `repairTaskPackage` 和 `repairTaskPackageMarkdown`。
- `.hardening/run` 兼容路径同步写入 `repair-task-package.json` 和 `repair-task-package.md`。
- `pnpm user:accept` artifact 检查新增 repair task package 两项，确保真实项目验收覆盖新物料。

### TDD 记录

- Red：先扩展 repair-plan、run bundle、CLI 和 user acceptance 测试，要求新任务包路径与字段存在。
- Green：实现任务包生成器、manifest 写入、workspace bundle 重写和验收检查。

### 下一步

- 跑 focused tests、typecheck、lint 和 build；通过后可在 odinsight 上重新执行 `pnpm user:accept` 刷新真实项目验收物料。

## 2026年6月20日 - odinsight Dogfooding 修复闭环

### 完成内容

- 以 `/private/tmp/odinsight/.hardening/latest/repair-task-package.md` 为输入，对目标 repo 执行受控修复闭环。
- 目标 repo 修复：
  - 补齐缺失的 mock chart helpers 和类型导入，消除 `generateSeries is not defined` 运行时错误。
  - 默认禁用真实 ICP API 请求，避免 demo 环境直接访问 `ic-api.internetcomputer.org` 造成网络 P1。
  - 将 Odinfun 改为真实外链，将 BRC-2.0 Soon 显式禁用。
  - 为币种、图表模式、时间范围、分页、复制按钮补充 `aria-pressed` / `aria-current` / `aria-disabled` 等可观测状态。
  - Clipboard 复制失败时降级到 legacy copy，并避免把权限拒绝作为 `console.error`。
- hardening-mcp 产品侧修复：
  - 浏览器探索只采集可见、可用交互目标。
  - 使用稳定 selector，优先 `data-testid`、`id`、`aria-label`、`title`、精确可见文本。
  - 点击后以 URL、body 文本、元素状态、下载事件共同判断可观测结果。
  - 对已选中控件、重复 selector、不可见/不可用控件、stale selector 做跳过处理，减少 SPA 和响应式重复 DOM 的误报。
  - 新增 driver 单测覆盖隐藏控件、状态变化、下载、已选中控件和 title selector。

### TDD 记录

- Red：新增 Playwright driver 单测，复现隐藏重复控件、状态变化、下载、已选中控件、稳定 title selector 等误报场景。
- Green：实现可见性过滤、稳定 selector、状态/下载观测、重复/stale selector 跳过后，driver 单测通过。

### 已验证

- hardening-mcp：`pnpm vitest run tests/unit/playwright-driver.test.ts` 通过，14 个测试。
- hardening-mcp：`pnpm typecheck` 通过。
- hardening-mcp：`pnpm lint` 通过。
- odinsight：`npm run build` 通过。
- odinsight：`tests/hardening/p1-regression.spec.ts` 通过，1 个浏览器回归测试。
- 用户验收：`pnpm user:accept -- --repo /private/tmp/odinsight --browser --validate-generated-tests --start-command "npm run dev -- --host 127.0.0.1" --decision pending --output docs/acceptance/user-acceptance-record.odinsight-after-repair.md` 通过。
- 最终验收结果：就绪度评分 100，P0=0，P1=0，P2=0，artifact checks 12/12 passed。

### 产物

- 验收记录：`docs/acceptance/user-acceptance-record.odinsight-after-repair.md`
- 目标 repo 报告：`/private/tmp/odinsight/hardening-report.md`
- 目标 repo 最新 findings：`/private/tmp/odinsight/.hardening/run/findings.json`
- 目标 repo 最新 run bundle：`/private/tmp/odinsight/.hardening/runs/run-2026-06-20T08-31-03-805Z`

### hardening-mcp v0.3 改进建议

- 将 browser explorer 的交互结果模型正式升级为多信号判定：URL、body、元素状态、下载事件、console/network 分类共同参与，而不是只看 URL/body 文本。
- 将 skipped interaction 从内部调试信息升级为一等 artifact，记录 `already_selected`、`duplicate_selector`、`stale_selector`、`not_visible`、`not_enabled` 等原因，避免误导修复 Agent。
- 对 repair task package 做同类 finding 聚合，避免响应式重复 DOM 或同一路径重复扫描生成大量重复 dead-control 任务。
- 为真实项目验收增加“产品误报回归集”，固定覆盖 dashboard、图表、下载、剪贴板、分页、筛选、响应式重复布局等场景。

### 剩余风险

- odinsight 既有 `npm run lint` 和 `npx tsc -b` 仍有大量历史问题，本轮未扩大修复范围。
- 本轮未向 odinsight 上游提交代码；目标 repo 仍保留 hardening 生成物和本地测试产物。

## 2026年6月20日 - Monorepo Phase 0 Scaffold

### 完成内容

- 接受 monorepo 方向，但不执行高风险源码大搬迁。
- 新增 `docs/architecture/monorepo-structure-v0.1.md`，明确目标结构、ownership、artifact 规则、迁移阶段和验收标准。
- 新增 `pnpm-workspace.yaml`，声明 `apps/*` 和 `packages/*` workspace 边界。
- 新增 Phase 0 占位目录说明：
  - `apps/cli`
  - `apps/mcp-server`
  - `packages/core`
  - `packages/browser-explorer`
  - `packages/repair-planner`
  - `packages/acceptance`
  - `packages/shared`
  - `examples`
- README 项目结构已更新为“当前单包运行结构 + monorepo Phase 0 scaffold”。
- `tests/unit/project-structure.test.ts` 新增 monorepo scaffold 守护。

### 决策

- Phase 0 只建立结构契约，不移动 runtime code。
- 当前 `src/` 和 `dist/` 路径仍被 bin、goal audit、benchmark runner、unit/integration tests 使用；直接迁移会扩大风险。
- Phase 1 应优先拆 `apps/cli` 和 `apps/mcp-server` 的 app shell，同时保持现有 bins 不变。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，3 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

## 2026年6月20日 - Monorepo Phase 1 App Shell

### 完成内容

- 按 `docs/architecture/monorepo-structure-v0.1.md` 推进 Phase 1，但保留旧 bin 和 dist 兼容入口。
- 新增 app shell：
  - `apps/cli/index.js`
  - `apps/mcp-server/index.js`
- 新增 package scripts：
  - `pnpm app:cli`
  - `pnpm app:mcp`
- `apps/cli/README.md` 和 `apps/mcp-server/README.md` 已说明当前兼容模型。
- README 已增加 app shell 使用方式。
- `tests/unit/project-structure.test.ts` 新增 Phase 1 结构守护，要求 app shell 与旧 `dist/adapters/*` bin wrapper 并存。

### TDD 记录

- Red：新增 Phase 1 结构测试后，因 `apps/cli/index.js` 缺失失败。
- Green：新增 app shell、脚本和 spec 状态说明后，结构测试通过。
- Red：新增 Phase 2 前置条件测试后，因 spec 未记录拆包延期条件失败。
- Green：补充 Phase 2 package split 前置条件和延期理由后，结构测试通过。

### Phase 2 评估

- 暂不物理移动 `src/shared/*` 到 `packages/shared/src`。
- 理由：当前 `tsconfig.build.json` 使用 `rootDir: "src"`，且 `src/shared/*` 被 `src/domain`、`src/tools`、`src/adapters`、`src/internal` 多处相对导入使用；直接移动会破坏 `dist/shared/*` 兼容输出和旧路径测试。
- 结论：Phase 2 需要先设计 package build strategy 和 compatibility wrappers，再迁移实现文件。该限制已写入 `docs/architecture/monorepo-structure-v0.1.md`。

### 已验证

- `pnpm test:unit`：通过，24 个测试文件、354 个测试。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，5 个测试。
- `pnpm vitest run tests/unit/cli-options.test.ts tests/integration/cli-run.test.ts`：通过，2 个测试文件、33 个测试。
- `pnpm vitest run tests/integration/mcp-server.test.ts`（提权，本地端口监听）：通过，2 个测试。
- `node apps/cli/index.js --help`：通过。
- `node apps/cli/index.js run --help`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm goal:audit`：通过，自动可验证范围 24/24，通过项无缺失；长期 MVP 用户确认仍为人工项。

## 2026年6月20日 - ADR 文档补齐

### 完成内容

- 新增 `docs/adr/`，用于记录长期架构决策。
- 新增 ADR 模板：`docs/adr/template.md`。
- 新增 ADR 索引：`docs/adr/README.md`。
- 首批补齐 5 篇核心 ADR：
  - `ADR-0001: Local-First MCP and CLI`
  - `ADR-0002: Shared Core for CLI and MCP`
  - `ADR-0003: Target Repo Hardening Artifacts`
  - `ADR-0004: Repair Plan and Executable Task Package`
  - `ADR-0005: Phased Monorepo Migration`
- README 和 `docs/architecture/architecture.md` 已链接 ADR 入口。
- `tests/unit/project-structure.test.ts` 新增 ADR 可发现性守护。

### 决策

- `docs/logs/decision-log.md` 保留为时间线式决策日志。
- `docs/adr/` 用于沉淀长期有效、需要约束后续实现的架构决策。

### 已验证

- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，6 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
## 2026年6月25日 - Team Cloud & Enterprise Spec v0.1

### 完成内容

- 按 TDD 先新增 `project-structure.test.ts` 文档级联测试，并确认因商业版 ADR/spec 缺失而失败。
- 新增 `ADR-0016: Team Cloud and Enterprise Commercial Edition Boundary`。
- 新增 `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`，覆盖 Hosted dashboard、Team collaboration、Enterprise integrations、Advanced governance 和 Roadmap。
- 新增 `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md`，明确 Open artifact contract、Commercial control plane 和 No target repo source upload by default。
- 级联更新 ADR 索引、README、architecture overview、commercialization strategy、open-core packaging、MVP v0.3、acceptance checklist、testing strategy 和 decision log。

### 边界

- 当前 goal 只完成商业版产品/架构规划与验收边界。
- 不实现 paid cloud runtime，不新增数据库、账号体系、计费、hosted dashboard 代码或远程 artifact ingestion。
- 后续任何 Team Cloud / Enterprise 运行时代码必须重新进入 TDD 和测试金字塔。
## 2026年6月25日 - Public Website and Project Intelligence Console Planning v0.1

### 完成内容

- 按 TDD 新增 structure-level test，先确认 ADR-0017 和相关 specs 缺失时失败。
- 新增 `ADR-0017: Public Website and Internal Project Intelligence Console`。
- 新增 `docs/product/specs/public-website-spec-v0.1.md`，定义响应式官网、private preview、Waitlist 和不声明 SaaS availability 的内容边界。
- 新增 `docs/product/specs/project-intelligence-console-spec-v0.1.md`，定义 Docs Graph、Code Graph、Project Progress Graph 和 local-only 数据边界。
- 新增 `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md`，定义 Graph Builder、`artifacts/project-graph/` snapshots 和 No hosted service dependency。
- 级联更新 ADR 索引、README、architecture overview、commercialization strategy、acceptance checklist、testing strategy 和 decision log。

### 边界

- 当前不实现 public website UI。
- 当前不实现 graph builder、watch mode、internal console runtime 或 hosted dashboard。
- 后续实现必须进入新的 TDD goal，并先补可执行 graph/website 测试。

## 2026年6月25日 - Public Website v0.1 Implementation

### 完成内容

- 采用 Product Design 方案 1（Trust Ledger）实现 RepoAssure 响应式官网。
- 新增 `apps/website` workspace app，包名为 `@repoassure/website`。
- 新增 Trust Ledger hero 产品视觉资产；后续 Public Website Code-Native Trust Ledger Preview v0.1 已将该 raster 资产替换为 code-native localized React preview。
- 实现官网核心 section：Hero、How it works、Proof artifacts、Open Core、Roadmap、Trust boundary、Private preview CTA、Footer。
- 实现交互：移动导航、artifact preview tabs、private preview form 本地状态。
- 新增 `scripts/verify-website.mjs` 和根脚本 `pnpm verify:website`，用于浏览器截图与交互验证。
- 新增 `design-qa.md`，记录 Product Design QA 证据并标记 `final result: passed`。
- 将官网纳入根级 `pnpm build` 和 `pnpm typecheck`。
- 新增 `apps/*/dist` 到 `.gitignore`、ESLint ignore、Vitest exclude，并同步私有工程基线文档。
- 更新 `docs/product/specs/public-website-spec-v0.1.md` 为 Implemented。

### TDD 记录

- Red：新增 `tests/unit/public-website.test.ts` 后，因 `apps/website/package.json` 缺失失败。
- Green：实现 `apps/website` 后，官网契约测试通过。
- Red：新增 `apps/*/dist` 构建产物边界断言后，因 `.gitignore` 未覆盖失败。
- Green：补齐 ignore/test/lint 排除规则后，project structure 测试通过。

### 已验证

- `pnpm vitest run tests/unit/public-website.test.ts`：通过。
- `pnpm vitest run tests/unit/public-website.test.ts tests/unit/project-structure.test.ts`：通过，2 个 test files / 66 个 tests。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，生成 desktop、zh-CN desktop、mobile、mobile menu、comparison、`desktop-focus-dark.png` 和 `desktop-focus-light.png`。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，36 个 test files / 540 个 tests。
- `pnpm build`：通过。
- `pnpm repo:hygiene`：通过。
- `pnpm goal:audit`：通过，35/35。
- `pnpm vitest run tests/unit/project-structure.test.ts -t "routes benchmark artifacts"`：通过。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，验证桌面/移动截图、artifact tabs、private preview form 和移动菜单。

### 边界

- 当前不部署官网，不配置域名/DNS/analytics。
- Private preview form 仅为前端本地状态，不接入 waitlist backend。
- `Explore the repository` 仍使用占位 GitHub 入口，待公开 repo URL 最终确认后替换。

## 2026年6月25日 - Public Website Localization Strategy ADR

### 完成内容

- 按 TDD 新增 `project-structure.test.ts` 文档级联测试，并确认因 `ADR-0018` 缺失而失败。
- 新增 `ADR-0018: Public Website Localization Strategy`。
- 级联更新 ADR 索引、README、architecture overview、public website spec、commercialization strategy、acceptance checklist、testing strategy 和 decision log。
- 明确官网 i18n 节奏：English default，English + Simplified Chinese first，Japanese and Korean 为 roadmap locales。
- 明确 localized forbidden-claim checks 是未来 i18n runtime 的必须测试。

### 边界

- 当前只落 ADR 和文档级联，不实现 website i18n runtime。
- 当前不实现 `/en/`、`/zh-CN/`、`/ja/`、`/ko/` 路由。
- 当前不授权 hardening report、repair plan、acceptance package、generated test、CLI output 或 AI IDE handoff material 的产品物料多语言化。

## 2026年6月25日 - Public Website i18n v0.1 Implementation

### 完成内容

- 按 TDD 先更新 `tests/unit/public-website.test.ts`，确认因 `apps/website/src/i18n.ts` 缺失而失败。
- 新增 `apps/website/src/i18n.ts`，定义 typed locale dictionaries。
- 保持 English 为默认 locale，新增 Simplified Chinese (`zh-CN`)。
- 保留 Japanese (`ja`) 和 Korean (`ko`) 为 roadmap-only locales，不写入 runtime copy。
- 在官网 header 新增 visible language switcher。
- 根据 active locale 更新 `document.documentElement.lang`、`document.title` 和 meta description。
- 将 App 文案改为读取 locale dictionaries，保留 artifact tabs、private preview form、mobile navigation 等交互。
- 扩展 `scripts/verify-website.mjs`，验证 English default、Simplified Chinese switching、desktop/mobile screenshots、artifact tabs、private preview form 和 mobile navigation。
- 更新 ADR-0018、public website spec、testing strategy 和 acceptance checklist 的实现状态。

### TDD 记录

- Red：`pnpm vitest run tests/unit/public-website.test.ts` 因 `apps/website/src/i18n.ts` 缺失失败。
- Green：新增 i18n 字典和 App locale 消费后，`public-website.test.ts` 通过。

### 5S 记录

- Scope：范围限定在 `apps/website`，只实现官网 i18n runtime，不扩展产品 artifact 多语言。
- Sketch：按 ADR-0018 设计 English default、`zh-CN` first、`ja`/`ko` roadmap-only 和 forbidden-claim checks。
- Scaffold：新增 typed locale dictionaries、language switcher 和 metadata update hook。
- Ship：将 App 文案迁移到 locale dictionaries，并扩展 `pnpm verify:website` 覆盖中英文交互。
- Stabilize：执行 unit、structure、typecheck、build、lint、browser verification、repo hygiene、release check 和 goal audit。

### 已验证

- `pnpm vitest run tests/unit/public-website.test.ts`：通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，验证 English default、`zh-CN`、localized Trust Ledger preview、桌面/移动截图、artifact tabs、private preview form 和移动菜单。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，36 个 test files / 539 个 tests。
- `pnpm build`：通过。
- `pnpm repo:hygiene`：通过。
- `pnpm release:check`：自动 prerequisites 通过，`public release ready: no`，仍需 manual legal/trademark/branch-protection authorization。
- `pnpm goal:audit`：通过，35/35。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，验证 English default、`zh-CN`、桌面/移动截图、artifact tabs、private preview form 和移动菜单。

### 边界

- 当前不实现 `/en/`、`/zh-CN/`、`/ja/`、`/ko/` SEO 路由。
- 当前不实现 Japanese 或 Korean runtime copy。
- 当前不本地化 hardening report、repair plan、acceptance package、generated test、CLI output 或 AI IDE handoff material。

## 2026年6月25日 - Public Website Code-Native Trust Ledger Preview v0.1

### 完成内容

- 将官网 hero Trust Ledger 从 raster image 替换为 `apps/website/src/TrustLedgerPreview.tsx`。
- 新增 `trustLedgerPreview` typed locale dictionary，覆盖标题、副标题、侧栏、表头、artifact rows、status、summary、evidence 和 footer。
- 保持 English default，新增 Simplified Chinese Trust Ledger preview copy；Japanese 和 Korean 仍为 roadmap-only locales。
- 移除未使用的 Trust Ledger raster asset，避免图片内嵌英文文本绕过 i18n。
- 扩展 `scripts/verify-website.mjs`，检查 English 和 Simplified Chinese 的 Trust Ledger preview DOM 文案。
- 级联更新 ADR-0018、public website spec、testing strategy、acceptance checklist 和 design QA 记录。

### TDD 记录

- Red：先更新 `tests/unit/public-website.test.ts`，要求存在 `TrustLedgerPreview.tsx`、App 不再引用 `/assets/trust-ledger.png`、preview copy 进入 English / Simplified Chinese dictionaries；测试按预期失败。
- Green：新增 `TrustLedgerPreview`、扩展 i18n copy、替换 App hero media 后，`public-website.test.ts` 通过。

### 5S 记录

- Scope：范围限定在 public website app、website verification 和相关文档，不扩展产品 artifact 多语言。
- Sketch：保留 Product Design option 1 的 Trust Ledger 信息架构，改为真实 DOM 和 locale-driven copy。
- Scaffold：新增 reusable preview component、typed preview copy 和 responsive CSS。
- Ship：接入 App，更新 browser verification，删除未使用 raster asset。
- Stabilize：执行 website unit、typecheck、build，并进入完整金字塔测试。

### 已验证

- `pnpm vitest run tests/unit/public-website.test.ts`：通过。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。

### 边界

- 当前不实现 locale routes 或 deployment changes。
- 当前不本地化 hardening report、repair plan、acceptance package、generated test、CLI output 或 AI IDE handoff material。

## 2026年6月25日 - Public Website Enterprise Design System ADR

### 完成内容

- 按 Product Design audit 路线评估当前 Public Website：当前实现功能可用、边界正确，但视觉仍偏通用 SaaS / developer-tool landing page，未达到顶尖安全公司级别。
- 确认当前 repo 没有真正的 `design.md` / design system 文档；`design-qa.md` 只是 QA 记录，ADR-0010 只是品牌定位。
- 新增 `ADR-0019: Public Website Enterprise Design System`。
- 新增 `docs/design/design-system-v0.1.md`，定义 security-grade、evidence-first、local-first、enterprise-calm 的设计原则。
- 级联更新 ADR index、README、architecture overview、public website spec、testing strategy、acceptance checklist 和 decision log。

### TDD 记录

- Red：先在 `tests/unit/project-structure.test.ts` 新增 enterprise design system 级联测试，因 `docs/adr/0019-public-website-enterprise-design-system.md` 缺失按预期失败。
- Green：新增 ADR-0019、design system 文档和级联写入后，目标结构测试通过。

### 边界

- 当前只落设计系统与决策，不修改 `apps/website` UI。
- Public Website v0.2 redesign 需要单独 goal，并基于 `docs/design/design-system-v0.1.md` 执行 Product Design audit、视觉方案、实现和浏览器 QA。
- 当前不授权 customer logos、analyst badges、SaaS availability、Team Cloud availability、Enterprise availability、public release claims 或产品 artifact 多语言化。

## 2026年6月25日 - Public Website v0.2 Enterprise Redesign

### 完成内容

- 采用 Product Design 方向 2：Assurance Graph。
- 新增 `apps/website/src/AssuranceGraph.tsx`，用 code-native DOM 和 icon-library icons 呈现 Docs、Code、Tests、ADRs、Repair Plan、Patch Plan 和 Acceptance 的保障图谱。
- 将官网首屏改为 dark enterprise security surface：左侧 local-first narrative，右侧 Assurance Graph + Trust Ledger dual panel，底部 assurance pipeline。
- 更新 English / Simplified Chinese copy：English default heading 为 `Assure every AI-generated repo before it ships`，中文为 `在交付前保障每个 AI 生成仓库`。
- 修正默认 locale 行为：不再根据 `navigator.languages` 自动切换；只有用户手动选择并写入 localStorage 后才使用非默认 locale。
- 更新 `scripts/verify-website.mjs`，使用选定 source concept，并验证 v0.2 headline、Assurance Graph、Trust Ledger、assurance pipeline、artifact tabs、private preview form 和 mobile navigation。
- 更新 `design-qa.md`，记录 source visual、implementation screenshots、comparison evidence 和 `final result: passed`。
- 级联更新 public website spec、design system、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/public-website.test.ts`，要求 `AssuranceGraph.tsx`、v0.2 copy、dark enterprise token、selected source concept 和 Assurance Graph verification；测试因组件/文案缺失按预期失败。
- Green：新增 Assurance Graph component、扩展 i18n、重构 hero 和更新 verification script 后，`public-website.test.ts` 通过。

### 5S 记录

- Scope：只改 public website、website verification、design QA 和相关文档，不触碰 CLI/MCP 核心。
- Sketch：按 Product Design direction 2 对齐 dark navy、Assurance Graph、Trust Ledger 和 assurance pipeline。
- Scaffold：新增 component 和 locale copy，先让测试契约通过。
- Ship：重构 hero CSS 和 responsive layout，保持 language switcher、mobile nav、artifact tabs 和 private preview form 可用。
- Stabilize：执行 unit、typecheck、build、browser verification 和截图 QA；白底 section 低对比问题在 QA 中修复。

### 已验证

- `pnpm vitest run tests/unit/public-website.test.ts`：通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过。
- `pnpm --filter @repoassure/website typecheck`：通过。
- `pnpm --filter @repoassure/website build`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，生成 desktop、zh-CN desktop、mobile、mobile menu 和 comparison screenshots。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test:unit`：通过，36 个 test files / 540 个 tests。
- `pnpm build`：通过。
- `pnpm repo:hygiene`：通过。
- `pnpm release:check`：自动 public-release prerequisites 通过，`public release ready: no`，仍需 manual legal/trademark/branch-protection authorization。
- `pnpm goal:audit`：通过，35/35。

### 边界

- 当前不新增 customer logos、analyst badges、SaaS availability、Team Cloud availability、Enterprise availability 或 public release claims。
- 当前不实现 product artifact localization。
- 当前不实现 internal Project Intelligence Console graph runtime。

## 2026年6月25日 - Public Website UI/UX Gate Fix

### 完成内容

- 根据 `design-qa.md` 的 UI/UX QA 结论修复两个 P2：焦点态不足、设计 token 未完全语义化。
- 在 `apps/website/src/styles.css` 建立 website semantic token layer，分为 brand tokens、semantic tokens 和 component tokens。
- 为官网主结构增加显式 `theme-dark` / `theme-light`，使深色 hero/header/footer 和白色内容区不依赖隐式 cascade 判断背景与文本语义。
- 增加统一 `:focus-visible` 规则，覆盖 `a`、`button`、`select`、`input` 和 `[role="tab"]`。
- 扩展 `scripts/verify-website.mjs`，新增 `desktop-focus-dark.png` 和 `desktop-focus-light.png` 浏览器截图证据。
- 级联更新 design system、public website spec、testing strategy、acceptance checklist 和 `design-qa.md`。

### TDD 记录

- Red：先更新 `tests/unit/public-website.test.ts`，要求 CSS 存在 brand / semantic / component token groups、`theme-dark` / `theme-light`、`--focus-ring`、`--focus-ring-on-dark` 和关键交互元素的 `:focus-visible` 覆盖；更新 `tests/unit/project-structure.test.ts`，要求 UI/UX gate 级联写入文档。targeted tests 因缺少 token/focus/doc 级联按预期失败。
- Green：实现 semantic token layer、focus-visible gate、显式 theme classes 和文档级联后，targeted website tests 通过。

### 5S 记录

- Scope：范围限定在 public website UI/UX gate、browser verification 和相关文档，不扩展新页面、不改 CLI/MCP 核心。
- Sketch：将 QA 的两个 P2 映射为可测试契约：semantic token layer 和 focus-visible gate。
- Scaffold：先补 unit / structure tests，再补 CSS token、theme classes 和 verify script 截图证据。
- Ship：在保持现有视觉方向的前提下修复焦点态和 token 分层。
- Stabilize：执行 targeted tests 后进入完整金字塔验证。

### 已验证

- `pnpm vitest run tests/unit/public-website.test.ts`：通过。

### 边界

- 当前不声明公开发布完成；public release 仍受 legal、trademark、branch protection / ruleset 和 maintainer publication authorization 约束。
- 当前不授权 SaaS、Team Cloud、Enterprise、hosted dashboard、customer logos、analyst badges 或 product artifact localization。
- P3 移动端信息密度和图谱线条精修仍可在后续视觉 polish goal 中处理。

## 2026年6月27日 - Cloudflare Access Private Preview Deployment

### 完成内容

- 在 Cloudflare Zero Trust 中创建 Access application：`RepoAssure Private Preview`。
- 创建并挂载 Access policy：`RepoAssure reviewer allow`，规则为 `Allow` + `Emails` 包含 `maintainer-authenticated-smoke-identity`。
- 部署 RepoAssure public website build output 到 Cloudflare Pages project：`repoassure-preview`。
- 生产环境部署 id：`997feaee-ef39-43c7-ab4d-2c99014df06d`，保护入口为 `https://repoassure-preview.pages.dev`。

### 已验证

- `pnpm build:website`：通过。
- `pnpm verify:website`（提权，本地浏览器验证）：通过，生成 desktop、zh-CN desktop、mobile、mobile menu、comparison、`desktop-focus-dark.png` 和 `desktop-focus-light.png`。
- `pnpm package:website-preview`：通过，forbidden availability claims failed count 为 `0`。
- `pnpm preflight:cloudflare-preview`：通过，状态为 `ready_for_manual_remote_execution`。
- `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch preview`：通过。
- `curl -I https://repoassure-preview.pages.dev`：返回 `302` 到 Cloudflare Access login，并包含 `www-authenticate: Cloudflare-Access`。
- `wrangler pages deployment list --project-name repoassure-preview`：显示 Production deployment `997feaee-ef39-43c7-ab4d-2c99014df06d`。

### 边界

- 只能分享 `https://repoassure-preview.pages.dev` 作为 private preview 入口。
- 不得分享 deployment subdomain 或 branch alias，例如 `https://997feaee.repoassure-preview.pages.dev`、`https://b29e4023.repoassure-preview.pages.dev`、`https://main.repoassure-preview.pages.dev`；这些 URL 在验证中返回 public `200`。
- 本次只完成私有预览部署，不授权 public launch、生产营销发布、仓库公开、npm 发布、GitHub release、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月27日 - Cloudflare Access Private Preview Reviewer Acceptance v0.1

### 完成内容

- 新增 `pnpm verify:cloudflare-preview` 和 `scripts/verify-cloudflare-access-preview.mjs`。
- 验证 accepted private preview URL：`https://repoassure-preview.pages.dev`。
- 生成 reviewer-side acceptance evidence 到 `artifacts/public-website-preview/cloudflare-access-acceptance`。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求根脚本、verification script、preflight handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 记录 reviewer-side acceptance；测试因缺少脚本和文档级联按预期失败。
- Green：新增 verification script、root package script 和文档级联。

### 已验证

- `pnpm verify:cloudflare-preview`：验证未登录访问 `https://repoassure-preview.pages.dev` 会进入 Cloudflare Access，并包含 `www-authenticate: Cloudflare-Access`。
- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "Cloudflare Access private preview reviewer-side acceptance"`：通过。
- `pnpm vitest run tests/unit/project-structure.test.ts`：通过，72 个 tests。
- `pnpm lint`：通过。
- `pnpm test:unit`：通过，36 个 test files / 548 个 tests。
- `git diff --check`：通过。
- GitHub Actions `RepoAssure CI` for commit `c79b15b`：通过。

### 边界

- 登录后内容 smoke 为 `manual_required`：必须由 allowed reviewer 人工完成 Cloudflare Access email/OTP 登录后确认页面内容。
- rollback/shutdown 为 `manual_required`：如需关闭 private preview，手动禁用/删除 Access application 或删除 Cloudflare Pages deployment/project。
- 不得将 deployment subdomain 或 branch alias 作为 accepted review surface。

## 2026年6月28日 - Private Preview External Reviewer Access Update v0.1

### 完成内容

- 在用户明确授权后，通过 Cloudflare Dashboard UI 更新 `RepoAssure reviewer allow`。
- 为 `external-reviewer-1` 与 `external-reviewer-2` 两个匿名 first-batch slots 添加 Access allow-list 覆盖。
- 新增 `docs/operations/private-preview-external-reviewer-access-update-v0.1.md`。
- 级联更新 external reviewer selection、recruitment/dispatch plan、handoff readiness、handoff package、public website handoff、acceptance checklist 和 test strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求本轮 Access 更新有独立 operations 记录并级联到相关文档；测试因缺少 `docs/operations/private-preview-external-reviewer-access-update-v0.1.md` 按预期失败。
- Green：新增 access update operation record，并更新级联文档。

### 已验证

- Cloudflare Dashboard UI：policy save 完成并返回 Policies 列表；`RepoAssure reviewer allow` 仍显示被 1 个 application 使用。
- `pnpm verify:cloudflare-preview`：应继续验证未登录边界；登录后 reviewer smoke 仍为 `manual_required`。

### 边界

- Git tracked docs 只记录匿名 reviewer slots，不记录真实 reviewer email。
- No invitation was sent。
- 不创建 external issue，不编造 reviewer feedback。
- 不记录 OTP、cookie、Access token、login query-state、raw Access redirect URL、reviewer credentials 或无关个人数据。
- 不授权 public launch、生产营销发布、仓库公开、npm 发布、GitHub release、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月28日 - Private Preview External Reviewer Manual Dispatch v0.1

### 完成内容

- 在 Access allow-list 已更新后，通过 manual maintainer email 向 `external-reviewer-1` 与 `external-reviewer-2` 两个匿名 slot 发送 private preview handoff。
- 新增 `docs/operations/private-preview-external-reviewer-manual-dispatch-v0.1.md`。
- 记录 `Dispatch status: sent`、`manual maintainer email`、`Message template version: private-preview-reviewer-handoff-package-v0.1`、slot-level ledger 和 `waiting_for_reviewer_feedback`。
- 级联更新 access update、external reviewer selection、recruitment/dispatch plan、handoff readiness、handoff package、public website handoff、acceptance checklist 和 test strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Private Preview External Reviewer Manual Dispatch 文档和级联记录存在；测试因 `docs/operations/private-preview-external-reviewer-manual-dispatch-v0.1.md` 缺失按预期失败。
- Green：新增 manual dispatch operation record，并更新级联文档。

### 边界

- Git tracked docs 只记录匿名 reviewer slots、channel、message template version、sent status 和 recorded timestamp，不记录真实 reviewer email。
- No external issue was created。
- No reviewer feedback was invented。
- 不记录 OTP、cookie、Access token、login query-state、raw Access redirect URL、reviewer credentials 或无关个人数据。
- 不授权 public launch、生产营销发布、仓库公开、npm 发布、GitHub release、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月28日 - Private Preview External Reviewer Feedback Intake v0.1

### 完成内容

- 新增 `docs/operations/private-preview-external-reviewer-feedback-intake-v0.1.md`。
- 为 `external-reviewer-1` 与 `external-reviewer-2` 建立 slot-level intake ledger。
- 记录 `Intake status: waiting_for_reviewer_feedback` 与 `Feedback received: no`。
- 明确 Sensitive material redaction gate 和 allowed feedback record shape。
- 级联更新 manual dispatch、recruitment/dispatch plan、handoff readiness、feedback triage backlog、public website handoff、acceptance checklist 和 test strategy。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Private Preview External Reviewer Feedback Intake 文档和级联记录存在；测试因 `docs/operations/private-preview-external-reviewer-feedback-intake-v0.1.md` 缺失按预期失败。
- Green：新增 feedback intake operation record，并更新级联文档。

### 边界

- No reviewer feedback was invented。
- No feedback triage was started。
- No external issue was created。
- Git tracked docs 不记录真实 reviewer email。
- 不记录 OTP、cookie、Access token、login query-state、raw Access redirect URL、reviewer credentials 或无关个人数据。
- 不授权 public launch、生产营销发布、仓库公开、npm 发布、GitHub release、SaaS availability、Team Cloud availability、Enterprise availability 或 hosted dashboard availability claims。

## 2026年6月28日 - Public Release Readiness v0.2

### 完成内容

- 新增 `docs/operations/public-release-readiness-v0.2.md`。
- 记录当前 automated readiness command matrix：`pnpm repo:hygiene`、`pnpm release:check`、unit、typecheck、lint、build、full/browser acceptance、goal audit 和 `git diff --check`。
- 明确当前 release checker 预期仍为 `public release ready: no`。
- 记录 manual authorization gates：branch protection or equivalent repository ruleset、legal review、trademark/name review、final maintainer publication authorization。
- 明确 Private Preview Feedback Triage Execution v0.1 仍需等待真实 reviewer feedback。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Readiness v0.2 文档和级联记录存在；测试因 `docs/operations/public-release-readiness-v0.2.md` 缺失按预期失败。
- Green：新增 v0.2 readiness operation record，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Decision Input Review v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-decision-input-review-v0.1.md`。
- 记录当前状态：`Status: not_ready_pending_input`，public release remains no-go。
- Review source：`docs/operations/public-release-manual-decision-input-v0.1.md`。
- 确认当前表单仍未收到 maintainer 填写的 approve / reject / defer / accept risk 决策。
- 确认所有人工 gate 仍缺少 decision value、evidence、decision date、notes 和 scope。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Decision Input Review v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-decision-input-review-v0.1.md` 缺失按预期失败。
- Green：新增 manual decision input review operation record，并更新级联文档。

### 边界

- No gate was approved, rejected, deferred, risk-accepted, closed, or passed in this review。
- Public Source Release Execution v0.1 remains blocked。
- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Decision Input v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-decision-input-v0.1.md`。
- 记录当前状态：`Status: pending_input`，public release remains no-go。
- 生成 maintainer 可填写决策表单，字段包括 Decision value、Evidence、Decision date、Notes、Scope。
- 明确 No approve / reject / defer / accept risk decision is prefilled。
- 当前所有人工 gate 均保持 `pending_input`：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision、Dependency/license risk confirmation、Secret/customer data exposure confirmation。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Decision Input v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-decision-input-v0.1.md` 缺失按预期失败。
- Green：新增 manual decision input form，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Evidence Decision Closure v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-evidence-decision-closure-v0.1.md`。
- 记录当前状态：`Status: not_closed_pending_decisions`，decision closure remains not_closed，public release remains no-go。
- 明确本轮未收到逐项 approve / reject / defer / accept risk 决策。
- 当前所有人工 gate 均保持 `pending_decision`：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision、Dependency/license risk confirmation、Secret/customer data exposure confirmation。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Evidence Decision Closure v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-evidence-decision-closure-v0.1.md` 缺失按预期失败。
- Green：新增 manual evidence decision closure operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Evidence Decision v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-evidence-decision-v0.1.md`。
- 记录当前状态：`Status: pending_manual_decisions`，public release remains no-go。
- 将缺失人工 gate 转成 maintainer decision table，允许后续逐项记录 approve / reject / defer / accept risk。
- 明确 `Execution authorization is not a release decision`。
- 当前所有人工 gate 均保持 `pending_decision`：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision、Dependency/license risk confirmation、Secret/customer data exposure confirmation。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Evidence Decision v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-evidence-decision-v0.1.md` 缺失按预期失败。
- Green：新增 manual evidence decision operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Gate Evidence Completion v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-gate-evidence-completion-v0.1.md`。
- 记录当前状态：`Status: incomplete_missing_manual_evidence`，completion remains incomplete，public release remains no-go。
- 明确 `Goal execution authorization is not publication authorization`。
- 生成 Maintainer Evidence Request Checklist，列出 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation。
- 记录结论：No gate was completed, closed, or passed。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Gate Evidence Completion v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-gate-evidence-completion-v0.1.md` 缺失按预期失败。
- Green：新增 manual gate evidence completion operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Gate Evidence Intake v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-gate-evidence-intake-v0.1.md`。
- 记录当前状态：`Status: evidence_intake_incomplete`，public release remains no-go。
- 归档已存在自动化证据：`pnpm release:check`、`pnpm repo:hygiene`、scoped sensitive-pattern scan、CI run 28350237293、Public Release Manual Gate Closure v0.1。
- 明确缺失人工证据：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision、maintainer dependency/license risk confirmation、maintainer secret/customer data exposure confirmation。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Gate Evidence Intake v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-gate-evidence-intake-v0.1.md` 缺失按预期失败。
- Green：新增 manual gate evidence intake operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Gate Closure v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-gate-closure-v0.1.md`。
- 记录当前状态：`Status: not_closed_missing_manual_evidence`，public release remains no-go。
- 明确本轮“授权执行”只授权该文档 goal，不等同于 legal review、trademark/name review、branch protection evidence、reviewer feedback 或 final maintainer publication authorization。
- 记录 closure result：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision 均为 not_closed；Dependency/license risk confirmation 和 Secret/customer data exposure confirmation 仅有 readiness/automated scan 的部分证据支持。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Gate Closure v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-gate-closure-v0.1.md` 缺失按预期失败。
- Green：新增 manual gate closure operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月29日 - Public Release Manual Gate Input Collection v0.1

### 完成内容

- 新增 `docs/operations/public-release-manual-gate-input-collection-v0.1.md`。
- 记录当前状态：`Status: collecting_manual_gate_inputs`，public release remains no-go。
- 新增 maintainer 输入收集表：Legal review、Trademark/name review、Branch protection or equivalent repository ruleset、Final maintainer publication authorization、Private preview reviewer feedback decision、Dependency/license risk confirmation、Secret/customer data exposure confirmation。
- 明确控制规则：Do not record a gate as passed without explicit maintainer evidence。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Manual Gate Input Collection v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-manual-gate-input-collection-v0.1.md` 缺失按预期失败。
- Green：新增 manual gate input collection operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。

## 2026年6月28日 - Public Release Candidate Final Review v0.1

### 完成内容

- 新增 `docs/operations/public-release-candidate-final-review-v0.1.md`。
- 记录最终审查结论：`Status: no_go_until_manual_gates_close`，Final recommendation: no-go for public release。
- 记录 automated local gates passed：repo hygiene、release check、unit、typecheck、lint、build、full/browser acceptance、Real Chromium trace E2E、benchmark、goal audit、diff check 和 reviewer email sensitive scan。
- 明确当前 release checker 仍应报告 `public release ready: no`。
- 明确 manual gates 仍未关闭：branch protection or equivalent repository ruleset、legal review、trademark/name review、final maintainer publication authorization。
- 明确 Private Preview Feedback Triage Execution v0.1 remains blocked until real reviewer feedback exists。
- 级联更新 README、public release checklist、testing strategy 和 acceptance checklist。

### TDD 记录

- Red：先更新 `tests/unit/project-structure.test.ts`，要求 Public Release Candidate Final Review v0.1 文档和级联记录存在；测试因 `docs/operations/public-release-candidate-final-review-v0.1.md` 缺失按预期失败。
- Green：新增 final review operation packet，并更新级联文档。

### 边界

- No repository visibility change was authorized。
- No npm publication was authorized。
- No GitHub release was authorized。
- No public launch or production marketing announcement was authorized。
- No SaaS、Team Cloud、Enterprise 或 hosted dashboard availability claim was authorized。
