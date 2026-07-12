# 决策日志

## 2026年7月8日 - AI IDE repair replay real campaign validation

### 决策

接受 AI IDE Repair Replay Real Campaign Validation v0.1：把近真实 campaign fixture 从 bundle manifest 继续延伸到 consumer contract 和 replay readiness，形成 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay` 的完整本地验证链。

### 原因

- ADR-0025 和 ADR-0026 已分别实现 consumer contract 与 replay readiness，但需要真实/近真实 campaign 证明两个层可以和上游 repair evidence chain 连续工作。
- E2E 暴露出 replay readiness 对 redaction boundary 文案过窄，只识别 `redact`，不识别生成证据中的 `sanitized summaries only; never store secrets` 等价隐私边界。
- 修复后，complete verified fixture 可以生成 `ready_for_maintainer_replay_review`，为后续 target repo repair goal proposal 提供本地 readiness evidence。

### 影响

- 更新 `tests/integration/playbook-e2e-repair-evidence.test.ts`，E2E 现在运行 `playbook:contract` 和 `playbook:replay`。
- 更新 `packages/acceptance/src/ai-ide-repair-execution-replay-readiness.ts`，支持真实 campaign sanitized-boundary wording。
- 新增 `docs/adr/0027-ai-ide-repair-replay-real-campaign-validation.md` 与 `docs/operations/ai-ide-repair-replay-real-campaign-validation-v0.1.md`。
- 本决策不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不执行 target repo mutation、npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - AI IDE repair execution replay readiness

### 决策

接受 AI IDE Repair Execution Replay Readiness v0.1：在 AI IDE repair evidence consumer contract 之后新增本地 replay readiness 报告，让 maintainer 或 AI IDE 在任何目标 repo 修复 goal 之前先回放检查 artifact read sequence、verification checklist、blocked actions 和 review boundaries。

### 原因

- Consumer contract 已能说明怎么读 evidence bundle，但还缺少一份“我已经按顺序回放并确认边界”的 readiness evidence。
- `ai-ide-repair-execution-replay-readiness.json` 将 `sourceConsumerContract`、`artifactReplay`、`verificationReplay`、`boundaryReplay` 和 `nextReviewDecision` 固定成机器可读 contract。
- 明确 non-authorization boundary 可以避免把 replay readiness 误解为 target repo mutation、release、launch、customer contact 或商业版 availability 授权。

### 影响

- 新增 `packages/acceptance/src/ai-ide-repair-execution-replay-readiness.ts`。
- 新增 `scripts/generate-ai-ide-repair-execution-replay-readiness.mjs` 和 `pnpm playbook:replay`。
- 新增 `docs/adr/0026-ai-ide-repair-execution-replay-readiness.md` 与 `docs/operations/ai-ide-repair-execution-replay-readiness-v0.1.md`。
- 本决策不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不执行 target repo mutation、npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月5日 - Real target validation campaign v0.2

### 决策

接受 Real Target Validation Campaign v0.2：在 Real Target Campaign Follow-up Hardening v0.2 合并后，复跑 `agent-reach`、`odinsight` 和 `openclaw-ui` 三个真实目标 repo，并把新发现的 browser/Node 环境误分诊缺口转成 TDD 产品修复。

### 原因

- v0.1 的两个失败目标需要验证是否从“产品不清楚”变成“目标环境前置条件清楚”。
- `agent-reach` 仍 blocked，但 now correctly classified as `environment` / `document_target_stack`，且 repair material 给出 Python/CLI environment prerequisites。
- `openclaw-ui` 已能从 nested Vite UI package 和 parent pnpm workspace context 推断 `pnpm dev`，新的失败证据是目标 repo 未安装 `vite`。
- v0.2 发现 browser/Node 缺工具时维护者指南误用 Python/CLI 文案，因此需要栈感知 triage guidance 和 `Prepare target app environment` repair task。

### 影响

- 更新 `packages/acceptance/src/target-repo-feedback-summary.ts`，browser 环境失败输出 Node/Web app environment prerequisite guidance。
- 更新 `packages/repair-planner/src/generate-repair-plan.ts`，boot 失败且缺本地 dev tooling 时生成 P1 `Prepare target app environment` repair task。
- 新增 `docs/operations/real-target-validation-campaign-v0.2.md` 和对应测试级联。
- 本决策不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月3日 - Real target repo validation campaign

### 决策

接受 Real Target Repo Validation Campaign v0.1：用 3 个真实公开目标 repo 验证 RepoAssure 当前 browser / Python-CLI acceptance mode，并新增本地 campaign summary runtime，把多 repo evidence 汇总为 maintainer / AI IDE 可消费索引。

### 原因

- 单个 `user:accept` run 已能生成 target repo feedback、AI IDE handoff 和 user validation evidence loop，但多 repo campaign 缺少统一索引。
- 真实目标运行暴露出 browser artifact 缺失时的失败文案不够可诊断，需要把 `boot-result.json` status/errors 带入验收记录。
- campaign summary 可以把 `agent-reach`、`odinsight`、`openclaw-ui` 的 run status、blocker category 和 next product action 汇总为 `repoassure.validation-campaign-summary.v1`。

### 影响

- 新增 `packages/acceptance/src/campaign-summary.ts`。
- 新增 `scripts/summarize-validation-campaign.mjs` 和 `pnpm campaign:summarize`。
- 更新 `packages/acceptance/src/user-acceptance-runner-helpers.ts` 和 `packages/acceptance/src/run-user-acceptance.ts`，让 browser artifact 缺失 evidence 包含 `browser requested but no browser artifacts were generated` 与 `boot-result.json` context。
- 新增 `docs/operations/real-target-validation-campaign-v0.1.md` 和对应测试级联。
- 本决策不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月3日 - Release readiness hygiene automation runtime

### 决策

接受 Release Readiness Hygiene Automation Runtime v0.1：按 Product Backlog Prioritization v0.1 / Priority 5 实现最小本地 runtime，用 `pnpm release:hygiene` 生成 maintainer / AI IDE 可审阅的 release hygiene evidence package。

### 原因

- `release:check`、`repo:hygiene`、敏感材料扫描和 `goal:audit` 以前是分散命令，需要一份可回放的本地 evidence package 串起来。
- `release-readiness-hygiene.json` 将 release readiness、repo hygiene、sensitive-material-scan、goal audit command boundary 和 package publication boundary 固定成机器可读 contract。
- 明确 non-authorization boundary 可以避免把 hygiene evidence 误解为 npm publication、GitHub release、public launch 或商业版 availability 授权。

### 影响

- 新增 `scripts/generate-release-hygiene-evidence.mjs`。
- 新增 `pnpm release:hygiene`。
- 新增 `docs/operations/release-readiness-hygiene-automation-runtime-v0.1.md` 和对应测试。
- 本决策不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月3日 - User validation evidence loop runtime

### 决策

接受 User Validation Evidence Loop Runtime v0.1：按 Product Backlog Prioritization v0.1 / Priority 4 实现最小本地 runtime，让 browser 和 Python/CLI user acceptance runs 生成可审计、可回放、可被 AI IDE 消费的 user validation evidence loop。

### 原因

- 真实 reviewer / maintainer 反馈不能只停留在非结构化 notes，需要可回放的 evidence package。
- `user-validation-evidence-loop.json` 将 `feedbackEvents`、`evidenceSources`、`triage`、`qualityGates`、`redactionBoundary` 和 `nonAuthorizationBoundary` 固定成机器可读 contract。
- 明确 non-authorization boundary 可以避免把 reviewer feedback、changes requested、accept risk 或 defer 误解为 public launch 或商业版 availability 授权。

### 影响

- 新增 `packages/acceptance/src/user-validation-evidence-loop.ts`。
- 更新 `packages/acceptance/src/run-user-acceptance.ts`，browser 和 Python/CLI user acceptance runs 均写入 `user-validation-evidence-loop.json`。
- 新增 `docs/operations/user-validation-evidence-loop-runtime-v0.1.md` 和对应测试。
- 本决策不上传 reviewer feedback、target repo material 或 private artifacts，不存储 reviewer PII、raw email、OTP、cookie、Access token、login query-state、reviewer credentials、secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月3日 - Repair task actionability runtime

### 决策

接受 Repair Task Actionability Runtime v0.1：按 Product Backlog Prioritization v0.1 / Priority 3 实现最小本地 runtime，让 repair task package 和 repair handoff package 的任务具备更明确的 AI IDE / maintainer 执行判断字段。

### 原因

- 现有修复物料已经能列出任务，但 AI IDE 和 maintainer 还需要稳定字段判断任务依赖、验证命令、patch applicability evidence 和人工 review 边界。
- `actionability` 元数据可以把 `dependencies`、`suggestedVerificationCommands`、`patchApplicabilityEvidence`、`aiIdeExecutionPrompt`、`manualReviewBoundary`、`riskNotes` 和 `noAutoApplyBoundary` 固定成机器可读 contract。
- 明确 no-auto-apply boundary 可以减少 AI IDE 误把建议物料当成自动 patch 授权的风险。

### 影响

- 更新 `packages/repair-planner/src/generate-repair-plan.ts` 和 `packages/repair-planner/src/repair-plan.ts`。
- 更新 `packages/acceptance/src/run-repair-handoff.ts`，repair handoff tasks 也写入 `actionability`。
- 新增 `docs/operations/repair-task-actionability-runtime-v0.1.md` 和对应测试。
- 本决策不自动应用 patch，不修改目标 repo，不创建 branch、commit、issue、pull request 或 advisory，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月3日 - AI IDE handoff material quality runtime

### 决策

接受 AI IDE Handoff Material Quality Runtime v0.1：按 Product Backlog Prioritization v0.1 / Priority 2 实现最小本地 runtime，让 browser 和 Python/CLI user acceptance runs 写入 run-scoped AI IDE handoff package。

### 原因

- 目标 repo acceptance run 现在已有 `target-repo-feedback-summary.json`，下一步需要一份更稳定的 AI IDE / maintainer 消费索引。
- `ai-ide-handoff-package.json` 将推荐阅读顺序、artifact inventory、priority actions、consumption guidance、quality gates 和 source summary 固定成机器可读 contract。
- 使用 relative artifact links 和 redaction boundary 可以减少路径泄露与敏感信息风险。

### 影响

- 新增 `packages/acceptance/src/ai-ide-handoff-package.ts`。
- 更新 `packages/acceptance/src/run-user-acceptance.ts`，browser 和 Python/CLI user acceptance runs 均写入 `ai-ide-handoff-package.json`。
- 新增 `docs/operations/ai-ide-handoff-material-quality-runtime-v0.1.md` 和对应测试。
- 本决策不上传目标 repo 材料，不存储 secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月2日 - Target repo acceptance feedback loop runtime

### 决策

接受 Target Repo Acceptance Feedback Loop Runtime v0.1：按 Target Repo Acceptance Feedback Loop Spec v0.1 实现最小本地 runtime，让 browser 和 Python/CLI user acceptance runs 写入 run-scoped feedback summary。

### 原因

- Priority 1 的产品验证需要真实目标 repo run 后有一份 AI IDE 和 maintainer 都能快速消费的本地摘要。
- `target-repo-feedback-summary.json` 将分散的 report、manifest、repair plan、generated tests、browser artifacts 和 triage guidance 串起来。
- 使用 relative artifact links 和 redaction boundary 可以减少路径泄露与敏感信息风险。

### 影响

- 新增 `packages/acceptance/src/target-repo-feedback-summary.ts`。
- 更新 `packages/acceptance/src/run-user-acceptance.ts`，browser 和 Python/CLI user acceptance runs 均写入 `target-repo-feedback-summary.json`。
- 新增 `docs/operations/target-repo-acceptance-feedback-loop-runtime-v0.1.md` 和对应测试。
- 本决策不上传目标 repo 材料，不存储 secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月2日 - Target repo acceptance feedback loop spec

### 决策

接受 Target Repo Acceptance Feedback Loop Spec v0.1：先把 Product Backlog Prioritization v0.1 的 Priority 1 落成可测试 contract，再进入 runtime 实现。

### 原因

- 真实目标 repo 运行反馈是验证 RepoAssure 产品价值的第一优先级。
- AI IDE 和 maintainer 需要稳定、简短、可消费的 feedback summary，而不是只看分散 artifacts。
- 在实现前先锁定字段、隐私边界、AI IDE consumption order 和 TDD implementation order，可以避免后续功能漂移。

### 影响

- 新增 `docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md`。
- Future implementation contract 包括 `runStatus`、`targetRepoMetadataClass`、`acceptanceResult`、`blockerCategory`、`nextRecommendedProductAction`、`artifactLinks`、`redactionBoundary` 和 `maintainerTriageGuidance`。
- 本决策不实现 runtime，不上传目标 repo 材料，不存储 secrets 或 raw private repo content，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月2日 - Product backlog prioritization

### 决策

接受 Product Backlog Prioritization v0.1：在 Public Launch Defer Closure v0.1 之后，优先推进产品能力验证，而不是重新打开 public launch gate。

### 原因

- Product / Website / User Validation Backlog Planning v0.1 已把后续工作拆为产品、官网、用户验证、release hygiene 和未来 launch reopening criteria。
- 当前最关键的不确定性是 RepoAssure 对真实目标 repo 的验收反馈、AI IDE 交接物料质量和 repair task 可执行性。
- public launch 只有在新的完整 launch authorization packet 和 Action Authorization Receipt 出现后才应重新讨论。

### 影响

- 新增 `docs/operations/product-backlog-prioritization-v0.1.md`。
- 后续 TDD 顺序为 Target repo acceptance feedback loop、AI IDE handoff material quality、Repair task actionability、User validation evidence loop、Release readiness hygiene automation。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Product website user validation backlog planning

### 决策

接受 Product / Website / User Validation Backlog Planning v0.1：public launch gate 已关闭为 deferred 后，后续工作转入 `product_website_user_validation_backlog`。

### 原因

- Public Launch Defer Closure v0.1 已明确不再重复推进当前 launch authorization gate。
- 后续更有价值的工作是产品能力、官网说明、用户验证和 release hygiene。
- Future launch reopening criteria 必须等待新的完整 launch authorization packet。

### 影响

- 新增 `docs/operations/product-website-user-validation-backlog-v0.1.md`。
- Backlog 拆分为 product、public website、user validation、release readiness hygiene 和 future launch reopening criteria。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Public launch defer closure

### 决策

接受 Public Launch Defer Closure v0.1：当前 public launch gate 关闭为 deferred，closure decision 为 `close_public_launch_gate_as_deferred`，launch authorization status 继续保持 `not_authorized`。

### 原因

- Explicit Launch Authorization or Defer Decision v0.1 已记录 `defer_public_launch`。
- 连续推进同一 launch authorization gate 不会增加安全性，只会制造流程噪声。
- 未来 launch 必须从新的完整 launch authorization packet 重新开始。

### 影响

- 新增 `docs/operations/public-launch-defer-closure-v0.1.md`。
- 当前后续 workstream 转为 `product_website_user_validation_backlog`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Explicit launch authorization or defer decision

### 决策

接受 Explicit Launch Authorization or Defer Decision v0.1：当前显式决策为 `defer_public_launch`，launch authorization status 继续保持 `not_authorized`。

### 原因

- 本轮只授权执行 Codex goal，不提供 public launch 的具体动作授权。
- Launch scope、launch copy、release notes、support boundary、claim-risk review、commercial wording、risk acceptance、rollback/correction plan 和 final launch approval 均未提供。
- 缺少 Action Authorization Receipt 时，不能执行任何 public launch action。

### 影响

- 新增 `docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md`。
- Future launch 必须重新进入 `future_launch_authorization_packet`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Maintainer launch decision input

### 决策

记录 Maintainer Launch Decision Input v0.1：本轮“授权执行”只授权执行 Codex goal，不等于 launch authorization；maintainer input decision 为 `not_supplied`，launch decision 为 `defer_launch`，launch authorization status 继续保持 `not_authorized`。

### 原因

- 本轮没有提供具体 launch scope、launch copy、release notes、support boundary、claim-risk review、commercial wording、risk acceptance、rollback/correction plan 或 final launch approval。
- Goal execution authorization is not launch authorization。
- 缺少最终发布动作、发布内容、风险接受和回滚方案时，不能生成 Action Authorization Receipt。

### 影响

- 新增 `docs/operations/maintainer-launch-decision-input-v0.1.md`。
- 所有 launch decision input fields 均记录为 `not_supplied`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Public launch authorization packet completion

### 决策

接受 Public Launch Authorization Packet Completion v0.1：记录 completion attempt，但 launch authorization status 继续保持 `not_authorized`，completion decision 为 `defer_launch_authorization`。

### 原因

- 本轮只授权执行 Codex goal，没有提供具体 launch scope、launch copy、release notes、support boundary、claim review、commercial wording、risk acceptance、rollback/correction plan 或 maintainer approval。
- 缺少这些字段时，不能生成 Action Authorization Receipt。
- Public launch execution 必须等待 `maintainer_launch_decision_input`。

### 影响

- 新增 `docs/operations/public-launch-authorization-packet-completion-v0.1.md`。
- 所有 launch completion fields 均记录为 `defer`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月1日 - Public launch authorization packet

### 决策

准备 Public Launch Authorization Packet v0.1，但不授权执行 public launch。

### 原因

- Public Launch Boundary Decision v0.1 已确认当前是 `source_public_website_live`，不是 public launch。
- 真正 launch 前需要收集 launch scope、launch copy、release notes、support boundary、claim review、commercial wording、risk acceptance、rollback/correction plan 和 maintainer approval。
- 该 packet 只是 review gate，不是 Action Authorization Receipt。

### 影响

- 新增 `docs/operations/public-launch-authorization-packet-v0.1.md`。
- Launch authorization status remains `not_authorized`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend 或商业版 availability claims。

## 2026年7月1日 - Public launch boundary decision

### 决策

接受 Public Launch Boundary Decision v0.1：RepoAssure 当前保持 `source_public_website_live` 模式，决策为 `do_not_launch_yet`。

### 原因

- 源码公开和官网在线已经完成，但这不等于 public launch。
- npm publish、GitHub release、production marketing announcement、customer contact、pricing change、spend 和商业版 availability claims 都属于更高风险外部动作。
- 真正 launch 前需要单独的 `public_launch_authorization` gate，明确 launch copy、support boundary、claim risk、rollback/correction plan 和最终 maintainer approval。

### 影响

- 新增 `docs/operations/public-launch-boundary-decision-v0.1.md`。
- Public launch remains not authorized。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend 或商业版 availability claims。

## 2026年7月1日 - Public release post-merge hygiene

### 决策

执行 Public Release Post-Merge Hygiene v0.1，确认源码公开、受保护 PR、官网自定义域名和发布边界在 PR #4 合并后仍保持一致。

### 原因

- Repository 已为 `PUBLIC`，但这不等于 npm publication、GitHub release 或 public launch。
- `main` 已采用 solo maintainer branch protection，需要确认 `Quality Gates` 和 main CI 仍通过。
- 官网已绑定 `repoassure.com` 和 `www.repoassure.com`，需要确认网站可访问和禁止声明边界仍通过。
- 公开仓库后需要再次核验 tracked docs/source 中没有真实 reviewer email、maintainer account identifier、secret 或 customer data 暴露。

### 影响

- 新增 `docs/operations/public-release-post-merge-hygiene-v0.1.md`。
- 确认 repository visibility `PUBLIC`、default branch `main`、branch protection profile `solo_maintainer`、required status check `Quality Gates` 和 main CI run `28511247860`。
- 确认 `package.json` 仍保持 `"private": true`，GitHub release list 为空、remote tags 为空、npm registry 中不存在 `hardening-mcp` package。
- 确认 `repoassure.com` 和 `www.repoassure.com` 均通过 `pnpm verify:website`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月1日 - Solo maintainer branch protection adjustment

### 决策

接受 ADR-0023，将 `main` branch protection 调整为独立开发者维护模式。

### 原因

- RepoAssure 当前由独立开发者维护。
- 团队式 1 人 review gate 会导致 PR 作者无法合并自己的 PR。
- GitHub 已在 PR #3 中拒绝 self-approval：`Review Can not approve your own pull request`。
- 强制 `Quality Gates` 比强制第二个 GitHub 身份更符合当前维护阶段。

### 影响

- Required approving reviews 从 `1` 调整为 `0`。
- `Quality Gates`、strict status checks、admin enforcement、conversation resolution、linear history、禁用 force pushes 和 branch deletion 均保留。
- PR #3 已通过受保护 PR flow 合并，merge commit 为 `c522f3c180ea642d4c531f97ecb287aa061d060f`。
- Main CI run `28510634551` 已通过。
- 本决策不授权直推 `main`、npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月1日 - Protected PR workflow verification

### 决策

使用 `codex/protected-pr-workflow-v0.1` 分支和 GitHub PR 验证 `main` 的受保护协作闭环。

### 原因

- `main` 已启用 native branch protection。
- 后续变更必须验证 PR、`Quality Gates`、review gate 和 merge gate 是否按预期工作。
- 该验证不应通过弱化保护规则或直推 `main` 完成。

### 影响

- 新增 `docs/operations/protected-pr-workflow-verification-v0.1.md`。
- 受保护流程验证通过 PR #3 执行，最新 CI 证据由 GitHub PR status 和 PR comment 记录。
- GitHub 拒绝 self-approval，并返回 `Review Can not approve your own pull request`。
- 当前 merge gate 正确等待外部 maintainer review，应由 maintainer review 完成，而不是绕过保护。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月1日 - Native branch protection enablement

### 决策

启用 GitHub native branch protection 保护 `xiaoba-dev/repoassure` 的 `main` 分支。

### 原因

- Repository 已公开，private repo 阶段的 GitHub 403 限制已不再阻塞 native protection 配置。
- Public Source Release Execution v0.1 已完成，`RepoAssure CI` run `28493500138` 已成功。
- `main` 需要从等效发布控制升级为真实 GitHub repository control。

### 影响

- `main` 要求 `Quality Gates` 严格状态检查。
- `main` 要求 PR merge、1 个 approving review、stale review dismissal 和 conversation resolution。
- Force pushes 和 branch deletion 被禁用。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月1日 - Public source release execution

### 决策

执行 `Public Source Release Execution v0.1`，将 GitHub repository `xiaoba-dev/repoassure` visibility 从 `PRIVATE` 改为 `PUBLIC`。

### 原因

- Public Release Authorization v0.1 状态为 `ready_for_public_source_release_execution`。
- Equivalent Release Control Closure v0.1 已关闭 branch protection / equivalent repository ruleset gate。
- `pnpm release:check` 已报告 `public release ready: yes`。
- Maintainer 已授权执行该 public source release goal。

### 影响

- `gh repo view` 验证 repository visibility 为 `PUBLIC`。
- 执行时 `git ls-remote https://github.com/xiaoba-dev/repoassure.git HEAD` 验证 public read access 返回 HEAD `1593cfb36871ceef08c9711fd21bc59ebcee6bc8`。
- 本决策不执行 npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。
- 下一步建议配置 native branch protection / repository ruleset，要求 `RepoAssure CI` / `Quality Gates`。

## 2026年7月1日 - Equivalent release control closure

### 决策

执行并关闭 `Equivalent Release Control Closure v0.1`。在 GitHub private repo branch protection / repository rulesets 仍不可用的前提下，使用 ADR-0022 定义的等效证据包关闭 branch protection or equivalent repository ruleset manual gate。

### 原因

- ADR-0022 已把替代门禁设计为 exact release SHA、RepoAssure CI / Quality Gates、local full test、release hygiene、sensitive-material scan 和 maintainer closure approval 的证据包。
- Release candidate SHA `589bd9eb83bd6cd185f28d029732ee6b98027873` 对应 GitHub `RepoAssure CI` run `28492402257`，结论为 success。
- Maintainer 已授权执行 Equivalent Release Control Closure v0.1，并接受以该等效控制替代当前不可用的 platform-enforced private repo branch protection/rulesets 的 residual risk。

### 影响

- 新增 `docs/operations/equivalent-release-control-closure-v0.1.md`。
- 新增 `docs/product/strategy/public-release-authorization-v0.1.md`。
- Public release readiness 可以进入 Public Source Release Execution v0.1，但该 execution 必须是单独 goal。
- 本决策不执行 repository visibility change、npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月1日 - Equivalent release control

### 决策

新增 `ADR-0022: Equivalent Release Control`。当 GitHub private repo branch protection / repository rulesets 仍不可用时，允许把替代门禁设计为一个明确的 evidence package 候选，而不是为了启用 branch protection 公开仓库。

### 原因

- Public Release Manual Decision Input Review v0.2 已确认 7 项 maintainer 决策均可审阅。
- 当前唯一 blocking manual gate 是 branch protection or equivalent repository ruleset。
- GitHub private repo plan 仍对 branch protection / repository rulesets 返回 `HTTP 403`。
- 继续推进 public release governance 需要一个可审计的替代控制设计，但不能绕过 release boundary。

### 影响

- 新增 `docs/operations/equivalent-release-control-design-v0.1.md`。
- Equivalent release control 当前状态为 `designed_not_executed`。
- Public Source Release Execution 仍被阻塞，直到 future closure goal 执行证据包并记录 explicit maintainer approval。
- 不授权 repository visibility change、npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年6月25日 - Public release readiness boundary

### 决策

新增 `ADR-0015: Public Release Readiness Boundary`。允许在 private repo 中加入 Apache-2.0 `LICENSE`、`package.json#license`、`CONTRIBUTING.md`、`SECURITY.md`、dependency license audit 和 public release notes draft，作为公开发布准备材料。

### 原因

- ADR-0009 已选择 Apache-2.0 作为 open-core license target。
- v0.3 已完成本地优先 GitHub Action、repair loop agent contract 和 release readiness checker，下一步需要让公开发布材料可审计。
- `LICENSE`、贡献政策和安全披露应在真正公开前被 review，而不是在发布瞬间才生成。

### 影响

- `LICENSE` 存在不代表公开发布授权。
- `package.json` 继续保持 `"private": true`，npm package publication 仍关闭。
- `pnpm release:check` 会检查自动 readiness materials，并在 manual publication authorization 缺失时继续报告 `public release ready: no`。
- 公开 repo、npm publish、公开公告、外部 case study 仍必须等待法律、商标、branch protection 或等效 ruleset 和最终 maintainer authorization。

## 2026年6月25日 - Monorepo readiness before v0.3

### 决策

在正式执行 v0.3 Distribution and Repair Loop Readiness 之前，先完成并落档 monorepo readiness audit。当前 repo 判定为“可运行的分阶段 monorepo”，不是“成熟完成态 monorepo”；v0.3 可以基于现有 compatibility-first package/app 边界推进，但必须明确哪些结构缺口属于 v0.3，哪些应延期。

### 原因

- 当前 `packages/acceptance`、`packages/shared`、`packages/security-assurance`、`packages/browser-explorer`、`packages/repair-planner` 已具备 package ownership，但 `packages/core` 仍是占位。
- `apps/cli` 与 `apps/mcp-server` 仍通过 built `dist/adapters/*` 入口运行，适合继续作为兼容 app shells，而不是在 v0.3 中强制深迁移。
- v0.3 真正需要处理的是 GitHub Action wrapper、examples、repo hygiene / public-release readiness checks 和 repair loop contract；benchmark package ownership、dashboard、多 repo artifact history 不应混入同一个 goal。
- 本轮只固化排序和级联文档，不改变 ADR-0005、ADR-0006 或 ADR-0014 的长期架构方向，因此不新增 ADR。

### 影响

- 新增 `docs/architecture/specs/monorepo-readiness-audit-v0.1.md`。
- 新增并归档 `docs/goals/completed/2026-06-25-monorepo-readiness-audit.md`。
- 更新 v0.3 goal，将 `monorepo readiness audit` 设为前置条件；该 goal 后续已完成并归档。
- 级联更新 monorepo structure spec、testing strategy 和 dev log，并新增结构测试守护。

## 2026年6月25日 - v0.3 Distribution and Repair Loop Readiness

### 决策

新增 `ADR-0014: Distribution and Repair Loop Readiness`，将下一个产品阶段定义为 v0.3 分发与修复闭环就绪：优先完成 GitHub Action wrapper、CLI/MCP 分发示例、AI IDE repair loop artifact contract、validation-only / patch-plan 闭环强化，以及 public-release readiness checks。

### 原因

- MVP v0.2 已完成真实项目 accepted 用户验收，继续只加诊断能力的边际价值降低。
- ADR-0009 已将 GitHub Action 和 MCP 作为 open-core adoption 的首批分发渠道，但缺少明确实现边界。
- ADR-0004 已定义 repair plan / executable task package，但 v0.3 需要把 handoff、validation-only、patch plan 打磨成 AI IDE 可稳定消费的闭环。
- 需要在进入实现前明确：GitHub Action 只包装本地 CLI，不上传目标 repo；v0.3 不默认自动修改代码、不创建 PR、不实现 hosted dashboard。

### 影响

- 新增 `docs/product/specs/mvp-spec-v0.3.md` 和 `docs/goals/completed/2026-06-25-v0.3-distribution-repair-loop-readiness.md`。
- 级联更新 ADR index、architecture overview、README、commercialization strategy、open-core packaging spec、public release checklist、testing strategy、user acceptance guide、acceptance checklist 和 blockers。
- `mvp-spec-v0.2` 状态修正为已实现且真实项目用户验收已通过。

## 2026年6月23日 - Security Assurance Lane Phase 1 本地导入

### 决策

实现 Security Assurance Lane Phase 1：新增 `@hardening-mcp/security-assurance` / `packages/security-assurance`，通过 `hardening security import --provider codex-security --scan-dir <dir> --repo <repo> --run-dir <dir>` 导入本地 provider scan directory，生成 run-scoped `security-summary.json`、`security-findings.json`、provider `import-manifest.json` 和 `normalized-findings.json`，并让 repair plan / repair task package 消费 normalized security findings。

### 原因

- ADR-0013 和 `security-assurance-lane-spec-v0.1.md` 已明确 RepoAssure 应作为 provider-backed security evidence lane，而不是自研通用漏洞扫描器。
- Phase 1 可以先交付本地、可测试、可脱敏、可追踪 provenance 的 import contract，为后续 Codex Security、SARIF 或其他 provider 输出格式扩展打基础。
- 将 security evidence 转入 repair planning，比单独保存扫描报告更符合 RepoAssure 的 AI IDE / Agent handoff 定位。

### 影响

- 新增 open-core package `@hardening-mcp/security-assurance`。
- Security Assurance Lane 仍为可选 lane，不进入当前 MVP 必需验收门槛。
- 本轮不调用 Codex Security 插件/runtime，不联网、不上传目标 repo、不创建 issue/PR/advisory、不修改目标 repo，也不实现 native deep vulnerability scanner。

## 2026年6月23日 - 自动化治理收口与 Security Assurance Lane 规格

### 决策

将 ADR-0013 后可全自动完成的治理任务收口：新增 `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`，把 Security Assurance Lane 从战略决策细化为 provider interface、Codex Security import、provider provenance、local-first evidence handling、redaction、artifact layout 和 repair-plan integration 的规格合同。同时将已完成的 `acceptance-package-migration` 与 `python-cli-acceptance-mode` goal 从 active 归档到 completed。

### 原因

- ADR-0013 已明确 RepoAssure 不应正面竞争为通用 deep vulnerability scanner，但仍需要一份后续实现可执行的 provider-backed evidence lane 规格。
- `docs/goals/active` 中存在已完成但仍标记进行中/待执行的历史 goal，会误导后续任务规划。
- `open-core-packaging-spec-v0.1.md` 仍把已经实现的 browser-explorer 和 repair-planner package 标记为 future target，需要与当前 monorepo 实际状态对齐。

### 影响

- 新增 Security Assurance Lane Spec v0.1，但不实现 Codex Security provider runtime import。
- `docs/goals/completed/` 现在包含 acceptance package migration 和 Python/CLI acceptance mode 的完成证据。
- open-core packaging spec 反映 browser-explorer、repair-planner 已是 implemented open-core packages，并新增 Security Assurance Lane packaging boundary TBD。

## 2026年6月23日 - Codex Security 与 Security Assurance Lane

### 决策

新增 `ADR-0013: Codex Security and Security Assurance Lane`。RepoAssure 不把自身定位为 Codex Security 的直接替代品或通用 deep vulnerability scanner；安全能力作为 future provider-backed `Security Assurance Lane` 接入，Codex Security 是优先集成 provider，但不是唯一依赖。

### 原因

- Codex Security 会把 AI security scan 能力平台化，直接竞争安全扫描本身会削弱 RepoAssure 的差异化。
- RepoAssure 的核心价值在 repo readiness、acceptance evidence、repair task package、agent handoff 和 artifact normalization。
- 用户未来仍会需要把安全发现纳入交付验收和修复闭环，因此需要 provider interface，而不是忽略安全扫描生态。

### 影响

- 新增 ADR-0013，并级联更新 ADR 索引、架构概览、MVP v0.2、竞品调研、商业化策略和 README。
- 后续实现应优先考虑 `security import --provider codex-security --scan-dir <scan-dir>` 这类导入能力。
- 当前不启动自研 deep vulnerability scanner，也不改变 v0.2 已实现范围。

## 2026年6月23日 - browser-explorer package 抽取

### 决策

执行 Phase 2e browser-explorer package 抽取：`packages/browser-explorer/src` 成为 fetch route exploration、Playwright browser exploration、安全交互、截图和 trace evidence 的实现所有者，根 package 通过 `@hardening-mcp/browser-explorer` workspace dependency 引用该包。`src/domain/explore/*` 与 `dist/domain/explore/*` 保留为兼容 wrapper/output，不在本阶段迁移 core 或新增 exploration strategy。

### 原因

- browser explorer 是 RepoAssure 模拟用户操作和 Agent 操作的关键能力，长期需要独立演进。
- explorer 当前边界清晰：上层 tool 通过 `exploreApp` 和 `createPlaywrightBrowserDriver` 消费能力，适合在 core 之前抽成 package。
- `findings.json`、截图、trace、visited routes 和 interactions 是现有 artifact schema 的关键部分，必须先通过 TDD 锁定 package exports、legacy wrappers、dist outputs 和行为 parity。

### 影响

- 新增 `@hardening-mcp/browser-explorer` 包，导出 root、`compatibility`、`explore-app` 和 `playwright-driver` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:browser-explorer`、`build:repair-planner`、`build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec、ADR-0006、dev log 和 goal audit 已级联写入 browser-explorer package ownership 与兼容路径边界。

## 2026年6月23日 - repair-planner package 抽取

### 决策

执行 Phase 2d repair-planner package 抽取：`packages/repair-planner/src` 成为 repair plan 和 executable repair task package 的实现所有者，根 package 通过 `@hardening-mcp/repair-planner` workspace dependency 引用该包。`src/domain/repair-plan/*`、`dist/domain/repair-plan/*`、`src/types/repair-plan.ts` 和 `dist/types/repair-plan.*` 保留为兼容 wrapper/output，不在本阶段迁移 core 或 browser explorer。

### 原因

- repair planner 已经有清晰边界：上层 tool 只调用 `generateRepairPlan`，schema/types 集中在 repair plan 契约。
- `repair-plan.json`、`repair-task-package.json` 和对应 Markdown 是 AI IDE 消费的核心物料，抽包必须先通过行为 parity、package exports、type-smoke 和 legacy dist output 测试锁定。
- acceptance 与 shared 已经证明 compatibility-first package build strategy 可行，repair-planner 是下一步低耦合抽取对象。

### 影响

- 新增 `@hardening-mcp/repair-planner` 包，导出 root、`compatibility`、`generate-repair-plan` 和 `repair-plan` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:repair-planner`、`build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec、ADR-0006、dev log 和 goal audit 已级联写入 repair-planner package ownership 与兼容路径边界。

## 2026年6月23日 - shared package 抽取

### 决策

执行 Phase 2c shared package 抽取：`packages/shared/src` 成为脱敏、shell quoting 和 shell word parsing 的实现所有者，根 package 通过 `@hardening-mcp/shared` workspace dependency 引用该包。`src/shared/*` 与 `dist/shared/*` 保留为兼容 wrapper/output，不在本阶段迁移 core、browser explorer 或 repair planner。

### 原因

- shared 工具被 CLI、MCP、domain、internal 和 acceptance 多处复用，继续由 root `src/shared` 承载会阻塞后续 package 边界清晰化。
- `dist/shared/*` 是既有 build 输出面，必须先通过 TDD 锁定兼容 wrapper、package exports、类型解析和构建顺序。
- shared 的边界小于 core/browser/repair，适合作为 acceptance package 之后的第二个可控抽取。

### 影响

- 新增 `@hardening-mcp/shared` 包，导出 root、`compatibility`、`privacy-redaction`、`shell-quote` 和 `shell-words` 子路径。
- 根构建脚本改为先 `build:shared`，再 `build:acceptance`，最后 `build:src`。
- README、架构概览、monorepo spec 和 ADR-0006 已级联写入 shared package ownership 与兼容路径边界。

## 2026年6月22日 - 分支保护与发布边界

### 决策

新增 `ADR-0012: Branch Protection and Release Boundary`，将 `main` 分支保护和 private release boundary 固化为仓库 operations 要求。目标状态是要求 `RepoAssure CI` / `Quality Gates` 作为 required status check；在 GitHub plan 不支持 private repo branch protection / rulesets 时，记录 blocker，不允许通过公开仓库绕过限制。

### 原因

- CI 已经通过，但如果 `main` 不受保护，CI 只能提示问题，不能阻止低质量变更进入主分支。
- 当时项目仍处于 private pre-release 阶段，尚未添加仓库级 `LICENSE`，也不能发布 package、移除 `package.json` `"private": true` 或公开仓库。ADR-0015 后续允许添加 Apache-2.0 `LICENSE` 作为 readiness material，但不授权公开发布。
- GitHub API 对 private repo branch protection 和 rulesets 返回 HTTP 403，需要把这个外部限制记录为治理 blocker。

### 影响

- 新增 `docs/operations/branch-protection-release-boundary-v0.1.md`，记录目标保护状态、当前 403 阻塞和手动解除步骤。
- `docs/product/strategy/public-release-checklist-v0.1.md` 增加 main branch protection / equivalent ruleset 检查项。
- PR 模板增加 release boundary 确认项。

## 2026年6月22日 - 私有 GitHub 工程基线

### 决策

新增 `ADR-0011: Private GitHub Engineering Baseline`，将 RepoAssure 私有仓库的协作和自动化基线固化为 GitHub Actions CI、PR 模板、Issue 模板和 `pnpm repo:hygiene` 已追踪文件检查。

### 原因

- 私有仓库已经完成首次推送，后续功能开发需要可重复的 PR 和 CI 质量门禁。
- generated artifacts、build outputs、local hardening runs、env files、private keys 和 local logs 不能依赖人工记忆避免提交。
- `pnpm goal:audit` 能验证自动证据，但不能替代用户人工验收；该边界需要在 PR 和 CI 文档中明确。

### 影响

- 新增 `.github/workflows/ci.yml`，在 PR 和 `main` push 上运行 `pnpm repo:hygiene`、unit、typecheck、lint、build 和 `pnpm goal:audit`。
- 新增 `.github/pull_request_template.md` 与 `.github/ISSUE_TEMPLATE/`，规范 private pre-release backlog 和 PR 审查材料。
- 新增 `docs/architecture/specs/private-github-engineering-baseline-v0.1.md` 作为工程基线操作说明。

## 2026年6月22日 - RepoAssure 品牌定位

### 决策

新增 `ADR-0010: RepoAssure Brand Positioning`，将产品品牌正式确定为 RepoAssure。`hardening-mcp` 暂时保留为当前内部 package、CLI 和 MCP 实现名称；private GitHub repo 优先使用 `repoassure`。

### 原因

- 竞品调研显示 `VibeProof`、`AgentProof`、`CodeGate`、`AgentGate`、`CodeAsure` 和 `VibeCheck` 等相邻命名已经被活跃产品或开源项目占用。
- RepoAssure 更准确表达 repo-level acceptance、repair evidence 和 delivery assurance，不会被限制为 MCP server、安全扫描器、agent 监控或 checklist 工具。
- 品牌需要能覆盖当前 Web/Python CLI acceptance，以及未来 Team Cloud 和 Enterprise/on-prem 场景。

### 影响

- 新增 `docs/product/research/competitive-landscape-v0.1.md` 作为后续开发、定位和命名参考。
- README、MVP spec、commercialization strategy 和 private repo readiness 已级联写入 RepoAssure 品牌。
- 后续 public release 前仍需执行商标、域名、GitHub、npm 和法律 review。

## 2026年6月22日 - ADR 级联对齐

### 决策

将 ADR-0001 至 ADR-0004 的早期架构决策显式级联到 `docs/architecture/overview.md` 和 README，补齐 local-first CLI/MCP、shared CLI/MCP core、target repo hardening artifacts、repair plan/task package 的交叉引用和当前物料链说明。将 ADR-0009 的商业化 follow-up 级联为 `docs/product/strategy/` 下的三个草案文档：commercialization strategy、public release checklist 和 open-core packaging spec。

### 原因

- 早期 ADR 的实现和语义已经存在，但文档中的显式 ADR 追踪偏弱。
- 架构说明中的 artifact layout 已落后于当前 repair handoff、repair execution 和 patch plan 能力。
- ADR-0009 的 follow-up 需要从自然语言待办沉淀成可追踪文档路径，但不应提前发布 license 或改变当前 private package 状态。

### 影响

- `docs/architecture/overview.md` 增加 ADR cascade map 和当前 artifact flow。
- `docs/architecture/specs/docs-taxonomy-spec-v0.1.md` 增加 `docs/product/strategy/` 文档类别。
- 后续商业化、公开发布和 open-core 边界讨论应优先更新 `docs/product/strategy/*`，再视需要修订 ADR-0009。

## 2026年6月22日 - 商业化与 License 策略

### 决策

新增 `ADR-0009: Commercialization and Licensing Strategy`，将当前产品定位为 AI 代码质量与交付保障层，而不是另一个 AI IDE。未来公开发布时，开源核心目标采用 Apache-2.0，商业化采用 open-core 模式：CLI、MCP、artifact schema、本地验收、repair plan、patch plan 等保留在 open core；Hosted dashboard、多 repo 历史、组织策略、SSO/RBAC、审计留存、高级规则包、行业模板和企业私有化作为商业产品面。

### 原因

- 当前产品的核心价值是把 AI 生成代码转化为可验收、可修复、可交付的工程资产。
- AI IDE 生态已经拥挤，直接竞争会削弱差异化；作为验收与修复证据层更适合与 Cursor、Codex、Claude Code、GitHub Copilot 等工具集成。
- Apache-2.0 有利于开发者和企业采用，并提供专利授权；AGPL、BSL、FSL、SSPL 等限制性协议暂不适合当前需要扩大生态的阶段。
- 商业价值应集中在团队协作、组织治理、合规审计、企业部署和高级规则质量，而不是限制本地核心能力。

### 影响

- 公开发布前必须补充仓库级 `LICENSE` 文件，并评估是否移除 `package.json` 的 `"private": true`。
- 后续 hosted / enterprise 能力需要先定义 public/private module boundary，避免商业功能反向污染 open-core artifact contract。
- 数十个自有 AI 项目应成为内部质量基础设施的第一批使用场景，用真实验收物料反哺产品路线和推广案例。

## 2026年6月18日 - 默认实现栈

### 决策

使用 TypeScript + Node.js 作为 `hardening-mcp` 的默认实现栈。

### 原因

- 目标用户和 MVP 技术栈集中在 Next.js、React、Vite 和 Node.js。
- CLI、MCP Server、Playwright 和前端项目分析都与 Node.js 生态天然适配。
- TypeScript 能提供更稳定的工具契约和重构边界。

### 影响

- 第一阶段优先实现 Node.js repo 分析能力。
- Python、Go、Java 等非 Web 技术栈暂不进入 MVP。

## 2026年6月18日 - 测试和 CLI 结构

### 决策

将 CLI 参数解析逻辑放入 `src/adapters/cli/run.ts`，入口文件 `src/adapters/cli/index.ts` 只负责绑定真实 stdout/stderr 和 exit code。

### 原因

- 便于在集成测试中稳定覆盖 CLI 行为。
- 避免 `tsx` 子进程在当前沙箱中创建 IPC pipe 时触发权限错误。
- 保持 CLI 与未来 MCP tools 共享核心实现。

### 影响

- 集成测试直接调用 `runCli`，覆盖参数解析、stdout、stderr 和 artifact 写入。
- 后续真实 CLI smoke test 可在 build 后使用 `node dist/adapters/cli/index.js` 执行。

## 2026年6月18日 - 依赖安装策略

### 决策

初始阶段只安装 TypeScript、Vitest、tsx、ESLint、Node 类型和 TypeScript ESLint 相关依赖。

### 原因

- 控制依赖面和安装成本。
- `analyze_repo` 不需要 Playwright 或 MCP SDK。
- Playwright 和 MCP SDK 等较重依赖应在进入对应阶段时再引入。

### 影响

- Phase 1 能保持轻量、可快速验证。
- Phase 3 前再引入 Playwright。
- Phase 6 前再引入 MCP SDK。

## 2026年6月18日 - explore_app 分阶段实现

### 决策

先交付基于 `fetch` 的轻量路由探索，再进入 Playwright 版本。

### 原因

- 轻量实现可先验证 finding schema、artifact 写入、CLI 输出、测试生成和报告链路。
- 当前沙箱对本地监听和浏览器类测试存在权限限制，过早接入 Playwright 会放大环境噪声。
- 分阶段实现能保持 TDD 步长小，并让 `run` 编排尽早形成可测试闭环。

### 影响

- `explore_app` 当前能发现基本 HTTP 层问题，但不能代表最终 MVP 的真实人类/Agent 操作模拟能力。
- 下一阶段必须替换或增强为 Playwright 驱动，补齐点击、表单、控制台错误、截图、trace 和 E2E 验证。

## 2026年6月18日 - Playwright 作为默认浏览器自动化底座

### 决策

使用 Playwright 作为 MVP 的默认浏览器自动化依赖，并通过可注入 driver 保持核心逻辑可测试。

### 原因

- Playwright 能覆盖 Chromium 浏览器访问、截图、控制台错误、网络失败、交互和 trace。
- 与目标 Web 技术栈和生成 Playwright 回归测试的产品闭环一致。
- 可注入 driver 允许单元/集成测试使用 fake driver，避免每次测试都依赖真实浏览器环境。

### 影响

- `playwright` 进入运行依赖。
- CLI 增加 `--browser` 模式；默认无 flag 时仍保留轻量 fetch 探索路径。
- 后续 E2E 需要浏览器二进制和本地监听权限。

## 2026年6月18日 - run 命令支持外部 URL 与自动 boot 双模式

### 决策

`hardening run` 同时支持 `run <repo> <url>` 和 `run <repo>`。

### 原因

- 外部 URL 模式便于用户或 Agent 复用已经启动的开发服务器，验证成本低。
- 自动 boot 模式更接近最终产品体验，可由工具自己分析 repo、启动应用、探索、生成测试和报告。
- 双模式能在受限环境中继续测试核心编排，同时保留完整本地运行能力。

### 影响

- `url` 在 `runHardeningTool` 中变为可选。
- 自动 boot 必须保证进程清理，当前通过 `finally -> stop()` 实现。
- 后续需要改进 boot 失败报告，避免失败时缺少最终 hardening report。

## 2026年6月18日 - MCP Server 采用 Registry + SDK 薄绑定

### 决策

将 hardening 工具实现为独立 registry，再通过官方 MCP SDK 暴露为 stdio server。

### 原因

- Registry 可直接单元测试，不依赖 MCP transport。
- SDK 绑定层保持很薄，只处理 `tools/list` 和 `tools/call`。
- 这种结构便于未来同时服务 CLI、MCP、IDE skill 或其他 Agent runtime。

### 影响

- `@modelcontextprotocol/sdk` 进入运行依赖。
- `hardening-mcp` 可作为 MCP stdio server bin 使用。
- 后续需要补 session 管理，尤其是独立 `boot_app` 的进程生命周期。

## 2026年6月18日 - 独立 boot_app 必须配套 stop_app

### 决策

MCP Server 暴露 `boot_app` 时同时暴露 `stop_app`。

### 原因

- `boot_app` 会创建长期进程；没有停止入口会导致资源泄漏。
- Agent/IDE 可能按 tool-by-tool 方式调用，而不是只调用 run-scoped flow。
- `run_hardening` 内部仍使用 `finally` 自动清理，`stop_app` 主要服务独立 `boot_app` 调用。

### 影响

- MCP tool 列表包含 `stop_app`。
- `boot_app` 返回 `sessionId`。
- 后续可以扩展 `list_sessions` 或 server shutdown 自动清理。

## 2026年6月18日 - Benchmark 产物目录排除出 Vitest 扫描

### 决策

`benchmark-runs/**` 作为本地 benchmark 输出目录加入 `.gitignore`、ESLint ignore 和 Vitest exclude。

### 原因

- Benchmark 会在临时 repo 中生成 `tests/hardening/*.spec.ts`。
- 这些文件是被测项目的 Playwright 测试，不是 hardening-mcp 自身的 Vitest 测试。
- 如果不排除，聚合 `pnpm test` 会扫描 benchmark 产物并错误尝试用 Vitest 执行 Playwright spec。

### 影响

- `pnpm test` 只运行 hardening-mcp 自身测试。
- Benchmark 产物仍保留在 `benchmark-runs/`，用于人工检查和结果复现。

## 2026年6月18日 - Generated Playwright Test 标题强制唯一

### 决策

生成的 Playwright test title 使用序号前缀，例如 `1. P1 console_error: ...`。

### 原因

- 同一页面可能产生多个相同类型和标题的 finding。
- Playwright 不允许同一文件内出现重复 test title。
- Benchmark 验证 generated specs 时暴露了重复标题导致 runner 失败的问题。

### 影响

- generated spec 更稳定，可直接执行。
- 报告标题仍保留 severity、type 和原始 finding title。

## 2026年6月18日 - Goal 审计不替代用户验收

### 决策

新增 `pnpm goal:audit` 作为自动证据审计入口，但不允许它把“用户确认 MVP 符合预期”自动判为完成。

### 原因

- `docs/goals/codex-goal.md` 的 Success Definition 明确要求用户确认 MVP 符合预期，或明确列出剩余修改项。
- 自动测试、benchmark 和文档检查只能证明工程准备状态，不能证明真实用户项目上的主观验收结论。
- 保守审计能避免因为本地 fixture 全绿而过早标记长期 goal complete。

### 影响

- `docs/acceptance/goal-completion-audit.md` 可以显示“已准备好请求用户验收”。
- 长期 goal 仍保持 active，直到用户提供真实项目验收结论或明确确认 MVP 通过。
- 后续若真实项目验收失败，失败项进入 `docs/logs/dev-log.md` 或 `docs/logs/blockers.md`，再继续迭代。

## 2026年6月18日 - 真实项目验收记录采用显式用户结论

### 决策

新增 `pnpm user:accept`，但验收记录默认 `decision=pending`。只有用户显式传入 `--decision accepted` 时，`pnpm goal:audit` 才能将用户验收项判定为已通过。

### 原因

- 真实项目 hardening flow 通过只能证明工具运行和 artifact 生成成功。
- `docs/goals/codex-goal.md` 要求的是用户确认 MVP 符合预期，这需要明确的人类结论。
- 将运行状态和用户结论拆开，可以避免自动脚本伪造验收。

### 影响

- `docs/acceptance/user-acceptance-record.md` 成为最终用户验收证据入口。
- 用户可以先用 `--decision pending` 运行检查，再在人工确认后用 `--decision accepted` 覆盖记录。
- 如果用户要求修改，用 `--decision changes_requested` 记录，后续继续迭代。

## 2026年6月18日 - 生成测试同时覆盖故障与关键路径

### 决策

`run_hardening` 在生成 Playwright specs 时，将 `explore_app` 实际访问过的 routes 作为 smoke routes 传入 `generate_tests`。生成器会先为 findings 生成回归测试，再为尚未被 finding 覆盖的已探索关键路径生成 smoke tests。

### 原因

- MVP 规格要求“故障或关键路径可以转换为 Playwright 测试”。
- 只从 findings 生成测试会漏掉“关键路径无明显故障但仍应持续守护”的场景。
- 使用 `explore_app` 的 `visitedRoutes` 比重新解析 CLI/MCP 参数更可靠，能覆盖明确 path、URL 和自然语言 critical path 展开的结果。

### 影响

- 生成的 `tests/hardening/*.spec.ts` 同时包含故障复现测试和关键路径 smoke tests。
- 生成器基于 path 去重，避免同一路由同时因 finding 和 smoke route 重复生成。
- Benchmark 和 `--validate-generated-tests` 会实际执行这些生成测试。

## 2026年6月19日 - Accepted 验收必须验证 generated spec

### 决策

`pnpm user:accept -- --decision accepted` 必须同时传入 `--validate-generated-tests` 和具体 `--notes`。`pnpm goal:audit` 只有在 accepted 验收记录包含 generated Playwright spec 执行验证通过证据时，才把用户验收项判定为完成。

### 原因

- MVP 的用户验收重点包括生成的 Playwright spec 是否可在真实项目上执行或给出明确失败证据。
- 只生成 spec 不能证明它能在真实项目环境中回放。
- accepted 是最终完成证据，应比 pending 检查更严格，避免用户在未验证 generated spec 的情况下误标完成。

### 影响

- 用户可以先用 `--decision pending` 运行快速真实项目检查。
- 最终 accepted 命令使用 `--validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"`。
- 需要登录态或慢启动的项目应配合 `--url`、`--storage-state` 或 `--generated-test-timeout-ms` 完成验证。

## 2026年6月19日 - 未知框架不推荐纯编译 watch 脚本

### 决策

当 `analyze_repo` 无法识别 Web 框架时，不再把 `tsc --watch`、`tsup --watch` 等纯编译或构建类脚本推荐为 Web App start command。若 repo 只有这类脚本或明显 CLI 入口，则 `recommendedStartCommand` 返回 `null`，并记录 `No Web App start script detected` blocker。

### 原因

- `rotifer-protocol/rotifer-playground` 是 CLI/tooling repo，`dev` 脚本为 `tsc --watch`，不会输出可访问的本地 Web URL。
- 将纯编译 watch 误当成 dev server 会让 `boot_app` 等待 URL 超时，并让用户误以为是应用启动慢或浏览器问题。
- MVP 面向现代 Web App repo；非 Web repo 应清晰报告不适用，而不是伪造启动建议。

### 影响

- Vite、Next.js、React 等已识别 Web 框架的脚本推荐行为不变。
- 简单 `node server.mjs` 这类明确 server fixture 仍可通过显式 `--start-command` 或 boot tool 运行。
- 真实项目验收会更早暴露“该 repo 不是可自动 hardening 的 Web App”这一事实。

## 2026年6月19日 - Generated spec 验证使用平台自带 Playwright 依赖

### 决策

`pnpm user:accept -- --validate-generated-tests` 在执行目标 repo 下的 generated Playwright spec 时，由 hardening 平台临时提供 `@playwright/test` 解析入口，验证结束后清理，不要求被测 repo 预先安装 Playwright。

### 原因

- 真实 Web App repo 可能没有 `@playwright/test` 依赖；MVP 目标是“拿来即测”，不能把测试依赖安装作为隐性前提。
- Node ESM bare import 不可靠地支持 `NODE_PATH`，`rotifer-alpha/site` 验收时暴露了 generated spec 无法解析 `@playwright/test` 的问题。
- 验证依赖应归属于 hardening 平台；被测 repo 只承载生成的回归 spec 和 hardening artifacts。

### 影响

- generated spec 仍保持标准 `import { test, expect } from '@playwright/test';` 形式，便于用户后续纳入项目自己的测试体系。
- 验收验证阶段会在 generated spec 目录下短暂创建 `node_modules/@playwright/test` symlink，并在验证完成后删除。
- 如果用户希望长期保留这些测试，只需在目标项目中正式安装 Playwright 依赖或按项目规范迁移测试文件。

## 2026年6月19日 - Run-scoped artifact bundle 成为 AI IDE 首选入口

### 决策

`run_hardening` 在保留原有兼容路径的同时，为每次运行创建 `.hardening/runs/<run-id>/` 物料包，并将 `.hardening/latest` 指向最新运行。AI IDE / Agent 应优先读取 `.hardening/latest/manifest.json`。

### 原因

- 旧布局分散在 repo 根目录、`.hardening/run`、`.hardening/artifacts` 和 `tests/hardening`，人类可读但不利于 Agent 稳定集成。
- run-scoped bundle 能避免多次运行混淆，并让每次测试的报告、JSON、截图和 generated tests 形成可归档单元。
- 保留 legacy paths 可以兼容已有 CLI、MCP、测试和用户习惯。

### 影响

- 新增 `.hardening/runs/<run-id>/manifest.json`，其中 `files` 指向 bundle 内规范化物料，`legacyPaths` 指向旧路径。
- `.hardening/latest` 是最新 run 的稳定入口。
- 目标项目仍会保留根目录 `hardening-report.md` 和 `tests/hardening/*.spec.ts`，方便人工查看和纳入项目 CI。

## 2026年6月20日 - 多 repo workspace output 作为可选聚合层

### 决策

在单 repo `.hardening` 输出之外，`run_hardening` 新增可选 `workspaceOutputDir`，CLI 对应 `--workspace-output <dir>`。传入后，每个 repo 的 run bundle 会复制到同一个中央输出目录的 `repos/<repo-slug>/runs/<run-id>/` 下，并维护 workspace 级 `manifest.json`。

### 原因

- 单 repo 输出适合本地项目自包含，但 AI IDE 工作区可能同时管理多个 repo。
- 中央输出目录让 IDE 只需读取一个 workspace manifest，就能发现每个 repo 的最新 hardening 结果。
- 该能力必须保持可选，避免默认把用户项目输出搬离 repo，也避免破坏现有 CI 和人工查看路径。

### 影响

- 默认行为不变：不传 `workspaceOutputDir` 时，只写目标 repo 的 `.hardening`。
- 多 repo 模式下，中央 `manifest.json` 记录每个 repo 的 `repoSlug`、`repoRoot`、`latestRunId`、`latestRunDir` 和 `latestManifest`。
- CLI、MCP 和核心 `runHardeningTool` 都支持该参数。

## 2026年6月20日 - 验收审计解析 Playwright 命令结构

### 决策

`pnpm goal:audit` 判定 generated Playwright spec 执行验证证据时，解析 shell words，确认存在 `HARDENING_BASE_URL=` 环境变量，并确认 Playwright 可执行文件后跟 `test` 子命令；不再依赖固定字符串 `playwright test`。

### 原因

- 真实验收命令可能使用平台自带 Playwright 绝对路径，例如 `'/Users/.../node_modules/.bin/playwright' test`。
- 路径包含空格时，命令生成器会自动加引号；固定字符串匹配会把有效证据误判为无效。
- 审计规则应验证命令结构和关键约束，而不是验证某一种显示格式。

### 影响

- accepted 用户验收记录可以正确支持带引号的 Playwright executable path。
- 仍要求 generated spec 验证使用 `HARDENING_BASE_URL=`，避免把普通命令误判为真实回放验证。
- 单元测试覆盖 quoted executable、单引号 notes 和新鲜度校验组合。

## 2026年6月20日 - 结构治理采用分阶段迁移

### 决策

项目文件夹结构优化采用分阶段迁移：先治理顶层运行产物，再整理 `docs/` 分层，最后调整 `src/` 边界。每个阶段都必须更新路径测试和质量门禁，不进行一次性大规模搬迁。

### 原因

- 当前 README、goal audit、acceptance runner、benchmark runner 和测试中存在大量硬编码路径。
- 直接移动 `docs/` 或 `src/` 会同时破坏文档证据、默认输出路径、package bin、测试 imports 和审计规则。
- 运行产物治理风险最低，可以优先降低根目录噪声，并为后续迁移建立路径兼容模式。

### 影响

- 新增 `docs/goals/codex-goal-structure-refactor.md` 作为结构治理的执行契约。
- 后续迁移必须先保证旧证据可追溯，再更新默认路径。
- v0.2 `repair-plan` 实现应在结构治理完成后进入，避免继续堆叠到旧目录结构。

## 2026年6月20日 - v0.2 先做结构化 Repair Plan，不自动改代码

### 决策

v0.2 的核心能力是生成 `repair-plan.json` 和 `repair-plan.md`，并把它们接入 CLI、MCP、run bundle、workspace bundle 和验收材料。系统不会默认修改目标 repo 业务代码，也不会自动创建 PR。

### 原因

- v0.1 已能发现问题、生成报告和回归测试，但 AI IDE 仍缺少稳定的任务契约。
- 结构化 repair plan 能让 Cursor、Codex、Claude Code 等 Agent 明确读取 severity、evidence、repairIntent、verification 和 agentPrompt，减少上下文猜测。
- 自动改代码会显著扩大风险面；应等 repair plan 的任务质量和验收闭环稳定后再进入 v0.3。

### 影响

- `run_hardening` 默认生成 repair plan。
- 新增 CLI `hardening plan <repo>` 和 MCP `generate_repair_plan`。
- `.hardening/latest/manifest.json` 的 `files.repairPlan` 成为 AI IDE 修复任务首选入口。
- 用户验收必须检查 `repair-plan.json` 和 `repair-plan.md`。
## 2026年6月25日 - Team Cloud and Enterprise commercial edition boundary

### 决策

接受 `ADR-0016: Team Cloud and Enterprise Commercial Edition Boundary`。Team Cloud and Enterprise 被定义为商业包装层，位于 open artifact contract 之上，而不是替代 local-first open core 的执行路径。

### 原因

- ADR-0009 已经规划 hosted dashboard、team collaboration、enterprise integrations 和 advanced governance 为商业面，但缺少实施前的长期边界。
- 需要在写任何 paid cloud runtime 之前明确：CLI、MCP、GitHub Action、acceptance modes 和 artifact schemas 仍属于 open core。
- 商业版必须保持 No target repo source upload by default，并避免 fork open artifact contract。

### 影响

- 新增 `docs/product/specs/team-cloud-enterprise-spec-v0.1.md` 作为商业版路线图。
- 新增 `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md` 作为未来 cloud/enterprise 实现前的架构边界。
- 当前增量只完成规划和文档级联，不实现 hosted paid features。
## 2026年6月25日 - Public website and internal project intelligence console

### 决策

接受 `ADR-0017: Public Website and Internal Project Intelligence Console`。对外官网与内部 Project Intelligence Console 是 separate product surfaces：前者用于响应式品牌展示、proof artifacts、docs/GitHub 入口和 waitlist/private-preview 转化；后者用于 local-only internal observability，展示 Docs Graph、Code Graph 和 Project Progress Graph。

### 原因

- RepoAssure 已进入 public release readiness 和商业化规划阶段，需要一个对外解释入口，但不能因此绕过 public release gate。
- 当前 ADR/spec/acceptance/logs/code/tests 已足够复杂，需要一个活的内部 graph 视图帮助维护者和 AI agent 理解项目状态。
- 外部网站和内部 graph console 的受众、部署边界、数据边界完全不同，必须分开设计。

### 影响

- 新增 `docs/product/specs/public-website-spec-v0.1.md`。
- 新增 `docs/product/specs/project-intelligence-console-spec-v0.1.md`。
- 新增 `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md`。
- 当前仅完成规划，不部署官网、不实现 graph builder、不实现内部站 runtime。

## 2026年6月25日 - Public website localization strategy

### 决策

接受 `ADR-0018: Public Website Localization Strategy`。RepoAssure 官网采用分阶段多语言策略：默认 English，第一阶段优先 English + Simplified Chinese first；Japanese and Korean 作为 roadmap locales，等待英文/中文定位稳定后再进入。

### 原因

- RepoAssure 面向全球 AI developer 和 engineering audience，多语言对商业化有价值。
- 当前官网仍处于 private preview 和 public release readiness 阶段，过早全量翻译会放大维护成本和误导性声明风险。
- 官网多语言和产品 artifact 多语言是不同能力，不能用官网决策授权 hardening report、repair plan、acceptance package、CLI output 或 AI IDE handoff material 的多语言化。

### 影响

- 官网后续 i18n 实现必须先抽取 locale dictionaries。
- 首个非英文 locale 为 `zh-CN`。
- `ja` 和 `ko` 保持 roadmap。
- 每个 locale 必须通过 localized forbidden-claim checks，避免错误声明 SaaS、Team Cloud、Enterprise、public npm package、public repository 或 source upload by default 已可用。

## 2026年6月25日 - Public website enterprise design system

### 决策

接受 `ADR-0019: Public Website Enterprise Design System`。当前 Public Website v0.1 在功能、localization 和 public-release boundary 上可用，但视觉审美仍偏通用 SaaS / developer-tool landing page，尚未达到顶尖安全公司级别。

### 原因

- RepoAssure 的类别是 AI code delivery assurance，需要比普通 SaaS 官网更强的 security-grade、evidence-first、local-first、enterprise-calm 视觉语言。
- 当前 `design-qa.md` 是实现 QA 记录，不是设计系统 source of truth。
- 当前 ADR-0010 解决品牌定位，但没有定义视觉原则、tokens、组件规范、graph 规范、多语言排版和设计 QA gates。

### 影响

- 新增 `docs/design/design-system-v0.1.md` 作为设计系统 source of truth。
- Public Website v0.2 redesign 必须基于该设计系统执行，并补 Product Design audit、desktop/mobile screenshots、English/Simplified Chinese layout checks 和 browser verification。
- 本决策不直接授权 visual redesign，也不授权 customer logos、analyst badges、SaaS/Team Cloud/Enterprise availability claims 或产品 artifact 多语言化。

## 2026年6月26日 - Public website private preview deployment boundary

### 决策

接受 `ADR-0020: Public Website Private Preview Deployment Boundary`。官网代码已经进入 `main`，但 merge 不等于 deployment、production release 或 public launch。

### 原因

- 当前 public website 仍处于 private-preview 产品边界内。
- 真实 deployment 涉及 hosting target、access control、secret handling、rollback、smoke verification 和 screenshot evidence，必须单独授权。
- 需要避免文档或流程把 `main` merge 误读成官网已上线、RepoAssure 已 public launch、repo 已公开或 SaaS 已可用。

### 影响

- Private preview deployment、production deployment 和 public launch 被拆成三个独立 gate。
- 当前只完成规划，不执行 deployment。
- deployment execution requires a separate Codex goal，并必须记录 access control 和 rollback。

## 2026年6月27日 - Private preview hosting fallback decision

### 决策

接受 `ADR-0021: Private Preview Hosting Fallback Decision`。现有 Vercel project 在 target mismatch 修复前暂停用于 Public Website private preview；local static preview bundle 是临时 review surface；远程 fallback 优先选择 Cloudflare Pages preview deployments with Cloudflare Access 或等效访问受控静态托管。

### 原因

- Vercel CLI / project 在 default deploy、显式 `--target preview --skip-domain` 和临时非 main 分支 deploy 下仍返回 `target production`。
- Vercel Git integration 已断开，所有 unintended production deployments and aliases 已清理。
- 继续盲试同一 Vercel project 会反复制造 production deployment 风险，不符合 ADR-0020 的 gate 隔离。
- Cloudflare Pages preview deployments are public by default，只有在 Cloudflare Access 或等效 access policy 先配置后，才符合 private preview 要求。

### 影响

- 下一个 execution goal 不应继续盲试现有 Vercel project。
- Cloudflare Pages + Access 或等效受控静态托管成为远程 fallback candidate。
- 任何新 hosting provider 上传仍需要明确 execution authorization、access-control verification、smoke/content/screenshot/forbidden-claim checks 和 rollback evidence。
- 本决策不授权 public launch、production deployment、public custom domain、恢复 Vercel Git integration 或向新 provider 上传代码。

## 2026年7月3日 - Real target campaign follow-up hardening

### 决策

接受 `Real Target Campaign Follow-up Hardening v0.2`。基于真实目标 campaign 的 `agent-reach` 和 `openclaw-ui` 信号，优先硬化 Python/CLI 环境前置条件诊断、repair-plan guidance，以及 nested UI package 的 parent pnpm workspace context 启动推断。

### 原因

- `agent-reach` 暴露的问题不是单纯代码失败，而是缺少 console entrypoint、`pytest`、`ruff`、`mypy` 等本地环境前置条件时需要更清晰的 repair guidance。
- `openclaw-ui` 暴露的问题是 complex monorepo 子应用直接作为目标路径时，父级 workspace context 不应丢失。
- 这两项能直接提升目标 repo/AI IDE 对输出物料的可执行性。

### 影响

- Python/CLI repair artifacts 记录 `Python/CLI environment prerequisites`。
- target repo feedback summary 对缺命令场景归类为 `environment` blocker，并推荐 `document_target_stack`。
- analyzer 可从 parent pnpm workspace context 推断 nested web app 的 `pnpm dev`。
- 本决策不上传 target repo material，不授权 npm publication、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

## 2026年7月5日 - Public source release final verification

### 决策

接受 `Public Source Release Final Verification v0.1`。当前仓库已经是 public source 状态，后续不应把旧的 private 阶段文档当作当前事实；同时 public source verified 不等于 npm publication、GitHub release 或 public launch 授权。

### 原因

- GitHub repository visibility 已为 `PUBLIC`，main CI run `28738066002` 已通过，public read access 返回最新 main head。
- Branch protection 已进入 solo maintainer profile：保留 `Quality Gates` strict checks、admin enforcement、conversation resolution 和 linear history，required approving reviews 禁用。
- `CONTRIBUTING.md` 仍包含 private 阶段旧表述，容易误导贡献者。

### 影响

- 新增 `docs/operations/public-source-release-final-verification-v0.1.md`。
- 级联更新 README、public release checklist、testing strategy、acceptance checklist 和 dev log。
- 修正 `CONTRIBUTING.md` 的 public/private 状态描述。
- 本决策不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月5日 - Product validation action queue runtime

### 决策

接受 `Product Validation Action Queue Runtime v0.3`。真实目标 campaign summary 不应只告诉 maintainer “哪些 repo 失败/阻塞”，还应把跨 repo 的 follow-up signals 聚合成可执行优先级队列。

### 原因

- v0.2 已经把真实目标状态从 failed 改进为 blocked/environment，但 maintainer 和 AI IDE 仍需要自己从 target rows 推断下一步顺序。
- `nextRecommendedProductAction` 已经存在，适合被聚合为 P0/P1/P2 action queue。
- action queue 能把 product runtime work 和 target environment / maintainer-owned work 分开，减少误把 target prerequisite 当作 RepoAssure 产品 bug 的风险。

### 影响

- `campaign-summary.json` 增加 `prioritizedActionQueue`。
- `campaign-summary.md` 增加 `Prioritized Action Queue` section。
- 行动项包含 priority、ownerSurface、targetIds、affectedModes、blockerCategories、recommendedVerification、evidenceRefs 和 non-authorization boundary。
- 本决策不上传 target repo material，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月5日 - AI IDE repair execution playbook runtime

### 决策

接受 `AI IDE Repair Execution Playbook v0.1`。`prioritizedActionQueue` 不应只停留在 campaign summary 中，还应被转换成 AI IDE / maintainer 可以按顺序执行和审查的本地 playbook。

### 原因

- campaign summary 已经知道 P0/P1/P2 action queue，但 AI IDE 仍需要明确先读哪些产物、验证哪些命令、何时停止等待 maintainer review。
- `ai-ide-handoff-package.json`、`repair-task-package.json` 和 `user-validation-evidence-loop.json` 分别解决材料索引、修复任务和验证反馈，但缺少一个聚合执行层。
- 自动修复目标 repo、自动开 PR 或自动创建 issue/advisory 会越过 maintainer boundary；当前产品应先提供可执行手册，而不是自动变更目标 repo。

### 影响

- 新增 `repoassure.ai-ide-repair-execution-playbook.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-playbook.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-playbook`。
- 新增 `pnpm playbook:generate`，从本地 `campaign-summary.json` 生成 `ai-ide-repair-playbook.json` / `.md`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月6日 - AI IDE playbook real campaign consumption validation

### 决策

接受 `AI IDE Playbook Real Campaign Consumption Validation v0.1`。仅有 action queue 和 readOrder 还不足以让 AI IDE 判断真实 campaign 中哪些 target 已通过、哪些是 environment blocker、哪些需要 repair-plan 产品改进；playbook 需要保留 campaign-level target status context。

### 原因

- 真实 campaign 至少会同时出现 passed、blocked、failed 和 environment blocker，而基础 playbook 只输出 action queue，容易让 AI IDE 忽略 passed target 和 blocked target 的不同处理方式。
- `P0-improve-repair-plan` 与 `P1-document-target-stack` 的 owner surface 不同，AI IDE 需要在同一 execution item 中看到 target run status、blocker category 和 latest run context。
- 当前阶段仍应提供本地消费验证与人工审查边界，不应直接进入目标 repo 自动修改、PR/issue/advisory 自动创建或 hosted dashboard。

### 影响

- `ai-ide-repair-playbook.json` 增加 `campaignContext.targetStatusMatrix`。
- `executionPlan[]` 增加 `targetContexts`。
- playbook 增加 `aiIdeConsumptionChecklist`。
- Markdown 增加 `Campaign Target Matrix` 和 `AI IDE consumption checklist`。
- 新增 `tests/integration/playbook-generate.test.ts`，通过 `pnpm playbook:generate` 验证真实/近真实 campaign 消费闭环。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月6日 - AI IDE playbook consumption dry-run report

### 决策

接受 `AI IDE Playbook Consumption Dry-Run Report v0.1`。AI IDE 读取 playbook 后，应先产出一份本地理解报告，证明它理解 campaign target 状态、repair task、readOrder、verification checklist 和 maintainer review boundary，再进入任何目标 repo 修复动作。

### 原因

- `ai-ide-repair-playbook.json` 已经具备执行手册能力，但仍缺少一个“消费后理解是否正确”的可审计层。
- 真实 AI IDE / Agent 可能跳过 readOrder、忽略 environment blocker 或误把 dry-run 当作自动修复授权；结构化 consumption report 可以显式暴露这些风险。
- 当前阶段的产品边界仍然是 local-first evidence 和 maintainer review，不应默认自动修改目标 repo 或创建 PR/issue/advisory。

### 影响

- 新增 `repoassure.ai-ide-playbook-consumption-report.v1`。
- 新增 `packages/acceptance/src/ai-ide-playbook-consumption-report.ts` 和 `@hardening-mcp/acceptance/ai-ide-playbook-consumption-report`。
- 新增 `pnpm playbook:consume`，从本地 `ai-ide-repair-playbook.json` 生成 `ai-ide-playbook-consumption-report.json` / `.md`。
- 报告包含 `campaignUnderstanding`、`repairTaskUnderstanding`、`readOrderCompliance` 和 `dryRunDecision.blockedActions`。
- 新增 `tests/integration/playbook-consume.test.ts` 验证 CLI smoke、schema、Markdown 可读性和 redaction boundary。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月6日 - AI IDE repair decision package

### 决策

接受 `AI IDE Repair Decision Package v0.1`。AI IDE 读懂 playbook 之后，maintainer 还需要一份明确的修复决策包，区分哪些任务可进入人工批准修复、哪些是环境前置、哪些应回到 RepoAssure 产品 backlog、哪些 target 无需动作。

### 原因

- `ai-ide-playbook-consumption-report.json` 证明 AI IDE 理解了材料，但还没有把理解结果转成 maintainer 可审阅的决策分类。
- `repoassure_product` owner surface 的任务不应被误当成目标 repo 代码修复；environment blocker 也不应被误当成可直接 patch 的问题。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不默认自动改目标 repo。

### 影响

- 新增 `repoassure.ai-ide-repair-decision-package.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-decision-package.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-decision-package`。
- 新增 `pnpm playbook:decide`，从本地 `ai-ide-playbook-consumption-report.json` 生成 `ai-ide-repair-decision-package.json` / `.md`。
- 决策包包含 `decisionSummary`、`decisionItems`、`targetReviewSummary` 和 `maintainerDecisionChecklist`。
- 新增 `tests/integration/playbook-decide.test.ts` 验证 CLI smoke、schema、Markdown 可读性和 redaction boundary。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月6日 - AI IDE repair approval receipt

### 决策

接受 `AI IDE Repair Approval Receipt v0.1`。decision package 只告诉 maintainer 哪些任务属于修复候选、环境前置或产品 backlog；在任何后续修复执行前，还需要一份本地 approval receipt 记录逐项 `approve`、`reject`、`defer` 或 `accept_risk` 决策。

### 原因

- `manual_repair_candidate` 不能仅凭分类自动进入目标 repo 修改；必须有 maintainer 的逐项审批证据。
- environment prerequisite、repoassure product improvement 和 deferred item 不应被误当成 target repo repair authorization。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不默认自动改目标 repo。

### 影响

- 新增 `repoassure.ai-ide-repair-approval-receipt.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-approval-receipt.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-approval-receipt`。
- 新增 `pnpm playbook:approve`，从本地 `ai-ide-repair-decision-package.json` 和 `approval-decisions.json` 生成 `ai-ide-repair-approval-receipt.json` / `.md`。
- approval receipt 包含 `receiptSummary`、`approvalItems` 和 `maintainerApprovalChecklist`。
- 新增 `tests/integration/playbook-approve.test.ts` 验证 CLI smoke、schema、Markdown 可读性和 redaction boundary。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月6日 - AI IDE approved repair execution plan

### 决策

接受 `AI IDE Approved Repair Execution Plan v0.1`。approval receipt 记录了 maintainer 的逐项决策，但 AI IDE 在进入后续单独授权的修复前，还需要一份只包含 approved manual repair candidate 的执行计划，避免把 deferred、rejected、accepted-risk、pending、environment prerequisite 或 RepoAssure product backlog 条目误当成目标 repo 修复授权。

### 原因

- `approvalDecision=approve` 仍需要和 `decisionType=manual_repair_candidate` 同时满足，才能进入后续人工修复规划。
- rejected、deferred、accepted-risk 和 pending item 应保留为 evidence，但不能进入 executable repair queue。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不默认自动改目标 repo。

### 影响

- 新增 `repoassure.ai-ide-approved-repair-execution-plan.v1`。
- 新增 `packages/acceptance/src/ai-ide-approved-repair-execution-plan.ts` 和 `@hardening-mcp/acceptance/ai-ide-approved-repair-execution-plan`。
- 新增 `pnpm playbook:plan-approved`，从本地 `ai-ide-repair-approval-receipt.json` 生成 `ai-ide-approved-repair-execution-plan.json` / `.md`。
- execution plan 包含 `approvedExecutionItems`、`excludedApprovalItems`、`executionChecklist` 和 `rollbackAndReviewChecklist`。
- 新增 `tests/integration/playbook-plan-approved.test.ts` 验证 CLI smoke、schema、Markdown 可读性和 redaction boundary。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月7日 - AI IDE repair execution evidence report

### 决策

接受 `AI IDE Repair Execution Evidence Report v0.1`。approved repair execution plan 只说明哪些 approved manual repair candidate 可以进入后续单独授权的修复规划；在任何修复尝试之后，还需要一份本地 evidence report 记录是否读取了计划要求材料、是否完成验证、哪些项仍 blocked，以及是否保持 non-authorization boundary。

### 原因

- 没有 execution evidence report 时，AI IDE 或 maintainer 无法稳定判断一次修复尝试是否按 approved plan 执行。
- verification results、read order compliance 和 maintainer review status 需要成为标准字段，而不是散落在聊天记录或临时日志中。
- 当前阶段继续保持 local-first evidence，不让证据报告变成目标 repo 自动修改或发布授权。

### 影响

- 新增 `repoassure.ai-ide-repair-execution-evidence-report.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-execution-evidence-report.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-execution-evidence-report`。
- 新增 `pnpm playbook:evidence`，从本地 `ai-ide-approved-repair-execution-plan.json` 和 `repair-execution-evidence-input.json` 生成 `ai-ide-repair-execution-evidence-report.json` / `.md`。
- evidence report 包含 `itemReports`、`boundaryReport`、`executionEvidenceChecklist` 和 `rollbackAndReviewChecklist`。
- 新增 `tests/integration/playbook-evidence.test.ts` 验证 CLI smoke、schema、Markdown 可读性和 redaction boundary。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月7日 - AI IDE repair evidence end-to-end campaign fixture

### 决策

接受 `AI IDE Repair Evidence End-to-End Campaign Fixture v0.1`。在单步 playbook、decision、approval、plan 和 evidence runtime 都存在后，需要一个不含私密源码的本地 fixture 验证整个产物链可以被连续消费，而不是只分别通过单步 smoke。

### 原因

- AI IDE / maintainer 的真实消费路径不是单独打开一个 artifact，而是从 `campaign-summary.json` 一路读到最终 `ai-ide-repair-execution-evidence-report.json` / `.md`。
- 如果中间 artifact 的 schema、读取顺序、approval boundary 或 evidence boundary 有断层，单步测试可能无法及时暴露。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不让 E2E fixture 变成目标 repo 自动修改或发布授权。

### 影响

- 新增 `fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json`。
- 新增 `tests/integration/playbook-e2e-repair-evidence.test.ts`。
- 端到端验证 `pnpm playbook:generate`、`pnpm playbook:consume`、`pnpm playbook:decide`、`pnpm playbook:approve`、`pnpm playbook:plan-approved` 和 `pnpm playbook:evidence`。
- 验证 `ai-ide-repair-playbook.json`、`ai-ide-playbook-consumption-report.json`、`ai-ide-repair-decision-package.json`、`ai-ide-repair-approval-receipt.json`、`ai-ide-approved-repair-execution-plan.json` 和 `ai-ide-repair-execution-evidence-report.json` 可连续消费。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - AI IDE repair evidence bundle manifest

### 决策

接受 `AI IDE Repair Evidence Bundle Manifest v0.1`。在全链路 fixture 已证明各 stage 可连续消费后，还需要一个单一 bundle manifest，作为 AI IDE / maintainer 的入口索引，避免每次手动推断六份 artifact 的读取顺序和当前状态。

### 原因

- AI IDE 不应靠聊天上下文猜测先读 playbook、再读 consumption report、decision package、approval receipt、execution plan 和 evidence report。
- artifact schema/version、SHA-256 provenance、current status、next actions 和边界信息需要成为机器可读 contract。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不让 manifest 变成目标 repo 自动修改或发布授权。

### 影响

- 新增 `repoassure.ai-ide-repair-evidence-bundle-manifest.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-evidence-bundle-manifest.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-evidence-bundle-manifest`。
- 新增 `pnpm playbook:bundle`，从本地 repair evidence artifacts 生成 `ai-ide-repair-evidence-bundle-manifest.json` / `.md`。
- manifest 包含 artifact reading order、artifact inventory、schema/version、SHA-256 provenance、`bundleSummary`、`nextActions`、approval boundary、execution evidence boundary、redaction boundary、non-authorization boundary 和 inherited blocked actions。
- 新增 `tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts` 和 `tests/integration/playbook-bundle.test.ts`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - AI IDE repair evidence bundle E2E automation

### 决策

接受 `AI IDE Repair Evidence Bundle E2E Automation v0.1`。在 bundle manifest 已作为单一入口后，CLI 需要支持从同一 run/campaign 输出目录自动发现六份 repair evidence artifacts，避免 AI IDE / maintainer 在真实 campaign 中继续手动拼接路径。

### 原因

- 真实消费路径通常是一个本地 campaign output directory，而不是六个孤立路径。
- `--from-dir <dir>` 能让 AI IDE 只需定位一个目录并读取生成的 bundle manifest。
- E2E fixture 必须覆盖最终 bundle manifest，证明 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle manifest` 没有断层。
- 当前阶段继续保持 local-first evidence 和 maintainer review boundary，不让 bundle manifest 变成目标 repo 自动修改或发布授权。

### 影响

- 新增 `writeAiIdeRepairEvidenceBundleManifestFromDirectory`。
- `pnpm playbook:bundle` 新增 `--from-dir <dir>` 模式，并保留显式六路径模式。
- `tests/integration/playbook-e2e-repair-evidence.test.ts` 增加 bundle manifest generation 和读取断言。
- 新增 `docs/operations/ai-ide-repair-evidence-bundle-e2e-automation-v0.1.md`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - Autopilot-compatible documentation architecture

### 决策

接受 `Autopilot-Compatible Documentation Architecture v0.1`。在不搬迁现有详细文档的前提下，为 Autopilot / Codex / 人工 maintainer 增加 `docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md` 和 `docs/PLAN.md` 四个 source-of-truth gateway。

### 原因

- 当前 docs taxonomy 已经成熟，但入口分散；Autopilot 风格更偏好固定的 PRD / SPEC / DESIGN / PLAN 顶层入口。
- 直接搬迁现有 product specs、architecture specs、design docs、operations docs、goals、acceptance outputs 和 logs 会制造无必要的路径 churn。
- Gateway 模式能兼容 Autopilot 读取习惯，同时保留现有文档体系的详细追溯能力。

### 影响

- 新增 ADR-0024。
- 新增 `docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md` 和 `docs/PLAN.md`。
- 更新 docs taxonomy、README、architecture overview、testing strategy、acceptance checklist 和 dev log。
- 新增 structure-level test 守护 gateway 文件、ADR index 和级联关系。
- 本决策不改变产品方向，不搬迁现有详细文档，不发布，不触碰目标 repo，不授权 npm publication、GitHub release、public launch、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - AI IDE repair evidence bundle consumer contract

### 决策

接受 `AI IDE Repair Evidence Bundle Consumer Contract v0.1`。在 bundle manifest 已经能作为单一入口之后，新增一层 consumer contract，让 AI IDE 明确读取顺序、artifact role、verification checklist、maintainer review boundary 和 forbidden actions。

### 原因

- Bundle manifest 是 artifact inventory 和 evidence index；AI IDE 仍需要更直接的消费合同。
- `artifactReadSequence` 能把 six-artifact chain 转成可执行读取顺序，减少依赖聊天上下文。
- `verificationChecklist` 和 `maintainerReviewBoundary` 防止把本地 evidence 误解成 target repo mutation 或 release authorization。

### 影响

- 新增 ADR-0025。
- 新增 `repoassure.ai-ide-repair-evidence-consumer-contract.v1`。
- 新增 `packages/acceptance/src/ai-ide-repair-evidence-consumer-contract.ts` 和 `@hardening-mcp/acceptance/ai-ide-repair-evidence-consumer-contract`。
- 新增 `pnpm playbook:contract`，从本地 bundle manifest 生成 `ai-ide-repair-evidence-consumer-contract.json` / `.md`。
- 新增 unit contract、CLI smoke 和 structure cascade tests。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - target repo repair goal proposal package

### 决策

接受 `Target Repo Repair Goal Proposal Package v0.1`。在 replay readiness 已经证明 evidence bundle 可被 maintainer review 后，需要新增一个 proposal package，把下一步 target repo repair goal 的 scope、任务、验证和审批边界明确写成机器可读/人类可读物料。

### 原因

- Replay readiness 只能证明本地证据可 replay，不应被误解成 target repo 修改授权。
- AI IDE 需要一个清晰的下一步 goal proposal：先读哪些 artifacts、允许哪些 repair scope、需要哪些 prerequisites、如何验证。
- Maintainer 需要在任何目标 repo 修改前看到 explicit approval boundary 和 blocked actions。

### 影响

- 新增 `repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1`。
- 新增 `packages/acceptance/src/ai-ide-target-repo-repair-goal-proposal-package.ts` 和 `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-proposal-package`。
- 新增 `pnpm playbook:proposal`，从本地 replay readiness 生成 `ai-ide-target-repo-repair-goal-proposal-package.json` / `.md`。
- E2E fixture 扩展为 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay -> proposal`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月8日 - target repo repair goal authorization receipt

### 决策

接受 `Target Repo Repair Goal Authorization Receipt v0.1`。在 proposal package 之后新增本地 authorization receipt，用来记录 maintainer 对目标 repo 修复 goal 提案的 approve、reject、defer 和 accept risk 决策。

### 原因

- Proposal package 只是修复 goal 提案，不应被误解成目标 repo 修改授权。
- Maintainer 需要一份可审计回执，明确哪些 scope 被批准进入单独 target repo repair goal，哪些被拒绝、暂缓或接受风险。
- AI IDE 需要机器可读的 approved scope、verification requirements 和 non-authorization boundary，避免依赖聊天上下文推进目标 repo 修改。

### 影响

- 新增 ADR-0029。
- 新增 `repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1`。
- 新增 `packages/acceptance/src/ai-ide-target-repo-repair-goal-authorization-receipt.ts` 和 `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-authorization-receipt`。
- 新增 `pnpm playbook:authorize`，从本地 proposal package 和 maintainer decision input 生成 `ai-ide-target-repo-repair-goal-authorization-receipt.json` / `.md`。
- E2E fixture 扩展为 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay -> proposal -> authorization receipt`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月9日 - authorized target repo repair goal task package

### 决策

接受 `Authorized Target Repo Repair Goal Task Package v0.1`。在 authorization receipt 之后新增本地 task package，用来把 maintainer 已批准的目标 repo 修复 scope 转换成 AI IDE 可消费的下一步修复 goal 输入。

### 原因

- Authorization receipt 是审批证据，不应要求 AI IDE 从聊天上下文推断后续 repair goal 要读什么、改什么、验收什么。
- AI IDE 需要一份明确的 approved repair goals、excluded authorization items、verification checklist 和 blocked actions。
- Rejected、deferred 和 accept risk 项必须继续被排除，避免被误执行为目标 repo 修复。

### 影响

- 新增 ADR-0030。
- 新增 `repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1`。
- 新增 `packages/acceptance/src/ai-ide-authorized-target-repo-repair-goal-task-package.ts` 和 `@hardening-mcp/acceptance/ai-ide-authorized-target-repo-repair-goal-task-package`。
- 新增 `pnpm playbook:target-repair-goal`，从本地 authorization receipt 生成 `ai-ide-authorized-target-repo-repair-goal-task-package.json` / `.md`。
- E2E fixture 扩展为 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay -> proposal -> authorization receipt -> target repair goal task package`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月9日 - target repo repair goal execution evidence intake

### 决策

接受 `Target Repo Repair Goal Execution Evidence Intake v0.1`。在 authorized target repo repair goal task package 之后新增本地 intake report，用来记录 separate target repo repair goal 返回的 mutation summary、verification results、blocked outcomes 和 boundary evidence。

### 原因

- Task package 是执行输入，不是执行结果；maintainer 还需要一份可审计的证据报告来判断是否接受修复。
- AI IDE 需要稳定结构来提交实际变更摘要、验证结果和边界状态，而不是依赖聊天上下文。
- Boundary violation 必须被显式记录为风险证据，不能被误解为 acceptance 或 release authorization。

### 影响

- 新增 ADR-0031。
- 新增 `repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1`。
- 新增 `packages/acceptance/src/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.ts` 和 `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-execution-evidence-intake-report`。
- 新增 `pnpm playbook:target-repair-evidence`，从本地 task package 和 execution evidence input 生成 `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` / `.md`。
- E2E fixture 扩展为 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay -> proposal -> authorization receipt -> target repair goal task package -> target repair evidence intake`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月9日 - target repair evidence review decision package

### 决策

接受 `Target Repair Evidence Review Decision Package v0.1`。在 target repo repair evidence intake 之后新增本地 review decision package，用来记录 maintainer 对每个目标修复证据项的 accept、changes_requested、defer 或 accept_risk 决策。

### 原因

- Intake report 是执行证据，不应被误解成 maintainer 已经接受。
- Maintainer 需要一份可审计的 review decision package，明确哪些证据被接受、哪些需要补充、哪些暂缓、哪些只是接受风险。
- AI IDE 需要机器可读的 next repair goal recommendations 和 blocked actions，避免把审阅结论误执行为目标 repo 修改或发布动作。

### 影响

- 新增 ADR-0032。
- 新增 `repoassure.ai-ide-target-repair-evidence-review-decision-package.v1`。
- 新增 `packages/acceptance/src/ai-ide-target-repair-evidence-review-decision-package.ts` 和 `@hardening-mcp/acceptance/ai-ide-target-repair-evidence-review-decision-package`。
- 新增 `pnpm playbook:target-repair-review`，从本地 intake report 和 review decision input 生成 `ai-ide-target-repair-evidence-review-decision-package.json` / `.md`。
- E2E fixture 扩展为 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay -> proposal -> authorization receipt -> target repair goal task package -> target repair evidence intake -> target repair evidence review decision package`。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月12日 - blocked goal recovery package

### 决策

接受 `Blocked Goal Recovery Package v0.1`。当 Codex goal 或 AI IDE 修复链路因为环境、外部服务、授权、maintainer 决策、技术未知、测试不稳定、安全合规或产品范围问题受阻时，需要生成本地 recovery package，而不是依赖聊天上下文恢复。

### 原因

- Blocked goal 需要可审计的 source goal/audit/log provenance。
- Maintainer 需要区分 retryable actions、external prerequisites 和 maintainer decision requests。
- AI IDE 需要明确 resume commands 和 blocked actions，避免把恢复建议误执行为 target repo mutation 或发布动作。

### 影响

- 新增 ADR-0033。
- 新增 `repoassure.blocked-goal-recovery-package.v1`。
- 新增 `packages/acceptance/src/blocked-goal-recovery-package.ts` 和 `@hardening-mcp/acceptance/blocked-goal-recovery-package`。
- 新增 `pnpm goal:recover`，从本地 `blocked-goal-recovery-input.json` 生成 `blocked-goal-recovery-package.json` / `.md`。
- E2E fixture 扩展为在 target repair evidence review decision package 之后生成 blocked goal recovery package。
- 本决策不上传 target repo material，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

## 2026年7月13日 - blocked goal recovery consumption contract

### 决策

接受 `Blocked Goal Recovery Consumption Validation v0.1` 和 ADR-0034。Recovery package 必须通过稳定消费合同转换成 evidence read order、resume readiness、recovery action queue 和 resume checklist，AI IDE 不再从聊天上下文猜测恢复顺序。

### 影响

- 新增 `repoassure.blocked-goal-recovery-consumption-report.v1`。
- 新增 `pnpm goal:recover:consume` 和 `@hardening-mcp/acceptance/blocked-goal-recovery-consumption-report`。
- E2E fixture 扩展到 `goal:recover -> goal:recover:consume`，并改为一次构建 acceptance package，消除阶段重复编译造成的超时。
- 消费报告 does not execute recovery commands，不授权 target repo mutation、release、launch、customer contact、pricing/spend 或 commercial/hosted availability claims。
