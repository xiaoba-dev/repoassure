# RepoAssure

RepoAssure 是一个本地优先的 AI 代码验收与交付保障层，用于把 AI 生成的 repo 转化为可验收、可修复、可交付的工程资产。

当前实现工作区仍命名为 `hardening-mcp`：一个 Code Hardening MCP Server + CLI，用于分析、启动、探索和测试 AI 生成的 Web 应用代码，并生成硬化报告、回归测试、修复计划和 AI IDE 可消费的交接物料。

## 当前能力

- 分析本地 repo：识别框架、包管理器、脚本、workspace 子包、环境变量线索和启动建议；包管理器支持 npm、pnpm、yarn 和 Bun，优先按 lockfile 判断，缺失时读取 `package.json#packageManager`；启动建议按 `dev`、`start`、`preview` 顺序选择，缺失标准脚本时会尝试常见 app/web/frontend dev 脚本，并可从 `package.json#workspaces` 或 `pnpm-workspace.yaml` 的多行列表/简单 inline array 子包声明生成 workspace 启动命令，且优先选择通过依赖、`next.config.*`、`vite.config.*` 或 framework 启动脚本识别为 Web app 的子包；当根脚本只是 `turbo`、`nx`、`lerna` 这类通用 workspace 编排器时，会优先推荐已识别 Web app 子包的直接启动命令；`appDirectories` 会优先列出已识别的 Web app 子包，并在根项目本身不是 Web app 时过滤根 `src` 这类噪声信号。
- 启动应用：执行 dev server 命令，提取本地 URL，写入 boot artifact。
- 探索应用：
  - 默认轻量 fetch 路由探索。
  - 可选 Playwright 浏览器探索，捕获 console error、pageerror、failed request、截图和基础点击/提交交互。
  - submit 前会对非敏感文本字段填入固定测试值，跳过 password、token、信用卡等敏感字段。
  - 可传入 Playwright `storageState` JSON 复用登录态，覆盖已登录页面。
  - 可选输出 Playwright trace zip，帮助回放复杂前端问题。
  - 默认跳过删除、支付、退出登录等高风险控件，避免探索真实项目时执行破坏性动作。
- 生成测试：根据 findings 和已探索关键路径生成 Playwright 回归测试草案；优先使用 `reproSteps` 中的显式页面导航，普通描述文本、evidence 和 smoke route 里的完整 URL 只接受本地 app URL（如 `localhost`、`127.0.0.1`、`0.0.0.0`、`[::1]`、`[::]`）或当前被测 app 同源 URL，避免把第三方 API/CDN URL 误生成成本地页面测试；传入 app URL 时，generated spec 会把安全 origin 写作默认 baseURL，并仍支持 `HARDENING_BASE_URL` 覆盖；写入 generated spec 前会脱敏 route query/fragment 中的 token、code、session、CSRF 等敏感参数值，保留 SPA hash route，并脱敏 generated test title 中的敏感值。
- 生成报告、修复计划和物料包：输出 `hardening-report.md`、AI IDE 可消费的 `repair-plan.json`、人类可读的 `repair-plan.md`、可执行修复任务包 `repair-task-package.json` / `repair-task-package.md`、repair handoff 的 `repair-handoff-package.json` / `.md` / `verification-plan.md`、repair execute 的 `repair-execution-report.json` / `.md`、patch plan 的 `patch-plan.json` / `.md`、可人工审查的 `.hardening/run/patch.diff`，并为每次 `run_hardening` 生成 `.hardening/runs/<run-id>/manifest.json`；`.hardening/latest` 会指向最新 run，方便 AI IDE 从单一入口读取本次报告、JSON、截图、generated tests、repair plan 和修复任务包。报告、repair plan、修复任务包、repair handoff、repair execution report、patch plan 和 diff 会脱敏 API key、token、password、session、JWT、CSRF、Cookie/Set-Cookie value、Authorization/Proxy-Authorization credential、URL userinfo credential 和 URL query/fragment 中的敏感参数值；`boot-result.json` 的 URL、日志路径、blockers 和 errors 写入前也会脱敏。
- AI IDE handoff material quality runtime：browser 和 Python/CLI user acceptance runs 会在 run-scoped 目录写入 `target-repo-feedback-summary.json` 和 `ai-ide-handoff-package.json`，并从 manifest 记录 `artifacts.targetRepoFeedbackSummaryPath` 与 `artifacts.aiIdeHandoffPackagePath`。`ai-ide-handoff-package.json` schema 为 `repoassure.ai-ide-handoff-package.v1`，包含 `recommendedReadingOrder`、`artifactInventory`、`priorityActions`、`consumptionGuidance`、`qualityGates`、`redactionBoundary` 和 `sourceSummary`，用于让 AI IDE / maintainer 先读摘要、报告、repair task package、repair plan、patch diff、generated tests、browser artifacts 和 user validation evidence loop。该 package 使用 relative artifact links，本地生成，不上传目标 repo 材料，不授权 npm publish、GitHub release、public launch 或商业版 availability claims。
- User validation evidence loop runtime：browser 和 Python/CLI user acceptance runs 会在 run-scoped 目录写入 `user-validation-evidence-loop.json`，并从 manifest 记录 `artifacts.userValidationEvidenceLoopPath`。schema 为 `repoassure.user-validation-evidence-loop.v1`，包含 `feedbackEvents`、`evidenceSources`、`triage`、`qualityGates`、`redactionBoundary` 和 `nonAuthorizationBoundary`，用于把 pending、accepted、changes_requested、accept_risk、defer 和 blocked 等验证结论形成本地可审计证据链。该 package 使用 relative artifact links，本地生成，不保存 reviewer PII、raw email、OTP、cookie、Access token、login query-state、reviewer credentials、secrets 或 raw private repo content，不授权 public launch 或商业版 availability claims。
- Release readiness hygiene automation runtime：`pnpm release:hygiene` 会生成本地 `release-readiness-hygiene.json` / `.md`，schema 为 `repoassure.release-readiness-hygiene.v1`，汇总 `release:check`、`repo:hygiene`、`sensitive-material-scan`、`goal:audit` command boundary 和 `package.json` publication boundary，方便 maintainer / AI IDE 审阅发布卫生状态。该 runtime 只生成 local evidence，不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend 或商业版 availability claims。
- Real Target Repo Validation Campaign v0.1：`pnpm campaign:summarize` 会把多个真实目标 repo 的本地 `target-repo-feedback-summary.json`、`ai-ide-handoff-package.json`、`user-validation-evidence-loop.json` 和 acceptance record 汇总为 `campaign-summary.json` / `.md`，schema 为 `repoassure.validation-campaign-summary.v1`。本轮真实目标 campaign 覆盖 `agent-reach` Python/CLI、`odinsight` browser 和 `openclaw-ui` complex monorepo UI，结果为 1 个通过、2 个失败，并已硬化 browser artifact 缺失诊断：`browser requested but no browser artifacts were generated; boot-result.json status=failed; details=...`。该 summary 只生成本地索引，不上传目标 repo 材料，不授权 npm publish、GitHub release、public launch 或商业版 availability claims。
- Real Target Campaign Follow-up Hardening v0.2：基于 `agent-reach` 和 `openclaw-ui` 的真实目标信号，Python/CLI repair plan 现在会把缺失 console entrypoint、`pytest`、`ruff`、`mypy` 这类 `ENOENT` 失败写入 `Python/CLI environment prerequisites`，并把 target repo feedback summary 归类为 `environment` blocker、推荐 `document_target_stack`；browser analyzer 现在会在直接分析 nested UI package 时读取 parent pnpm workspace context，从子目录 cwd 推断 `pnpm dev` 这类可执行启动命令。该 follow-up 只提交产品硬化、测试和本地 summary，不上传目标 repo 材料，不授权 npm publish、GitHub release、public launch 或商业版 availability claims。
- Real Target Validation Campaign v0.2：复跑 `agent-reach` Python/CLI、`odinsight` browser 和 `openclaw-ui` complex monorepo UI 后，campaign summary 记录 3 个目标、1 个通过、2 个 blocked、0 个 failed；`agent-reach` 和 `openclaw-ui` 均被归类为 `environment` / `document_target_stack`，`odinsight` 作为 browser control 通过。v0.2 还修复了 browser/Node 环境失败误用 Python 指南的问题，并让 repair task package 生成 `Prepare target app environment` 任务，要求 AI IDE 先安装目标依赖、确认 `vite` 等 dev tooling，再 rerun browser acceptance。该记录只提交抽象结论和产品修复，不上传目标 repo 材料，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- Product Validation Action Queue Runtime v0.3：`campaign-summary.json` 现在输出 `prioritizedActionQueue`，把多 repo campaign 的 `nextRecommendedProductAction` 聚合成 P0/P1/P2 行动队列，包含 `ownerSurface`、`recommendedVerification` 和 `evidenceRefs`，让 maintainer / AI IDE 先处理 `P0-improve-repair-plan`、`P1-document-target-stack` 这类跨 repo 行动，再阅读每个 target row。该 runtime 只生成本地产品验证队列，不上传目标 repo 材料，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- Product / Website / User Validation Backlog Execution v0.1：本地 backlog 已统一归并为 `verified_implemented`、`automatable_next`、`manual_or_external_trigger` 和 `do_not_execute` 四类。真实目标反馈 summary、AI IDE handoff、repair task actionability、user validation evidence loop、release hygiene 与官网验证均已有本地证据；下一项自动可执行工作是 Security Assurance Lane provider import ergonomics。真实外部反馈仍是 `waiting_for_reviewer_feedback`，不得被编造或当作 public launch、客户联系、商业版或 target repo mutation 授权。
- AI IDE Repair Execution Playbook v0.1：`pnpm playbook:generate -- --campaign-summary <campaign-summary.json> --output <dir>` 会把 `prioritizedActionQueue`、`ai-ide-handoff-package.json`、`repair-task-package.json` 和 `user-validation-evidence-loop.json` 串成 `ai-ide-repair-playbook.json` / `.md`，schema 为 `repoassure.ai-ide-repair-execution-playbook.v1`。该 playbook 给 maintainer / AI IDE 一份本地执行顺序和 verification checklist，并明确 maintainer review boundary；它不自动修改目标 repo、不创建 branch/commit/PR/issue/advisory，不上传目标 repo 材料，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Playbook Real Campaign Consumption Validation v0.1：`ai-ide-repair-playbook.json` 现在保留 `campaignContext.targetStatusMatrix`、`executionPlan[].targetContexts` 和 `aiIdeConsumptionChecklist`，使 AI IDE 能在同一份 playbook 中看到 passed / blocked / failed target 状态、environment blocker、`P0-improve-repair-plan` / `P1-document-target-stack` 行动项、读取顺序、verification checklist 和 maintainer review boundary。`tests/integration/playbook-generate.test.ts` 通过 `pnpm playbook:generate` 验证真实/近真实 campaign 消费闭环和敏感路径脱敏；该验证不上传目标 repo 材料，不自动修改目标 repo，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Playbook Consumption Dry-Run Report v0.1：`pnpm playbook:consume -- --playbook <ai-ide-repair-playbook.json> --output <dir>` 会生成 `ai-ide-playbook-consumption-report.json` / `.md`，schema 为 `repoassure.ai-ide-playbook-consumption-report.v1`，用于让 AI IDE 在修复前输出一份本地理解报告。报告包含 `campaignUnderstanding`、`repairTaskUnderstanding`、`readOrderCompliance` 和 `dryRunDecision.blockedActions`，验证 AI IDE 是否读懂 target 状态、readOrder、verification checklist 与 maintainer review boundary；该 dry-run 不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Decision Package v0.1：`pnpm playbook:decide -- --consumption-report <ai-ide-playbook-consumption-report.json> --output <dir>` 会生成 `ai-ide-repair-decision-package.json` / `.md`，schema 为 `repoassure.ai-ide-repair-decision-package.v1`，用于把 dry-run 理解报告转成 maintainer 可审阅的修复决策包。决策包包含 `decisionSummary`、`decisionItems`、`targetReviewSummary` 和 `maintainerDecisionChecklist`，区分 `manual_repair_candidate`、`environment_prerequisite`、`repoassure_product_improvement` 和 no-action target；该能力不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Approval Receipt v0.1：`pnpm playbook:approve -- --decision-package <ai-ide-repair-decision-package.json> --approvals <approval-decisions.json> --output <dir>` 会生成 `ai-ide-repair-approval-receipt.json` / `.md`，schema 为 `repoassure.ai-ide-repair-approval-receipt.v1`，用于把 maintainer 的 `approve`、`reject`、`defer`、`accept_risk` 决策写成本地审批证据。receipt 包含 `receiptSummary`、`approvalItems` 和 `maintainerApprovalChecklist`；只有被 `approve` 的 `manual_repair_candidate` 会标记为可进入后续单独授权的 manual repair execution。该能力不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Approved Repair Execution Plan v0.1：`pnpm playbook:plan-approved -- --approval-receipt <ai-ide-repair-approval-receipt.json> --output <dir>` 会生成 `ai-ide-approved-repair-execution-plan.json` / `.md`，schema 为 `repoassure.ai-ide-approved-repair-execution-plan.v1`，只消费 approval receipt 中 `approvalDecision=approve` 且 `decisionType=manual_repair_candidate` 的条目。plan 包含 `approvedExecutionItems`、`excludedApprovalItems`、`executionChecklist` 和 `rollbackAndReviewChecklist`，让 AI IDE 明确先读什么、如何验证、哪些项不能执行；该能力不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Execution Evidence Report v0.1：`pnpm playbook:evidence -- --execution-plan <ai-ide-approved-repair-execution-plan.json> --evidence <repair-execution-evidence-input.json> --output <dir>` 会生成 `ai-ide-repair-execution-evidence-report.json` / `.md`，schema 为 `repoassure.ai-ide-repair-execution-evidence-report.v1`，用于记录后续单独授权的人工修复是否按 plan 读取材料、运行验证、保持边界或仍然 blocked。report 包含 `itemReports`、`boundaryReport`、`executionEvidenceChecklist` 和 `rollbackAndReviewChecklist`；该能力只生成本地证据，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Evidence End-to-End Campaign Fixture v0.1：`fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json` 提供不含私密源码的本地 campaign fixture；`tests/integration/playbook-e2e-repair-evidence.test.ts` 会连续执行 `pnpm playbook:generate`、`playbook:consume`、`playbook:decide`、`playbook:approve`、`playbook:plan-approved` 和 `playbook:evidence`，验证 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence` 的 JSON/Markdown 全链路消费、读取顺序、approval boundary、execution evidence boundary、redaction boundary 和 non-authorization boundary。该 fixture 不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Evidence Bundle Manifest v0.1：`pnpm playbook:bundle -- --playbook <ai-ide-repair-playbook.json> --consumption-report <ai-ide-playbook-consumption-report.json> --decision-package <ai-ide-repair-decision-package.json> --approval-receipt <ai-ide-repair-approval-receipt.json> --execution-plan <ai-ide-approved-repair-execution-plan.json> --evidence-report <ai-ide-repair-execution-evidence-report.json> --output <dir>` 会生成 `ai-ide-repair-evidence-bundle-manifest.json` / `.md`，schema 为 `repoassure.ai-ide-repair-evidence-bundle-manifest.v1`，作为 AI IDE 读取 repair evidence chain 的单一入口。manifest 记录 artifact reading order、schema/version、SHA-256 provenance、current status、next actions、approval boundary、execution evidence boundary、redaction boundary 和 non-authorization boundary；该能力只生成本地索引，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Evidence Bundle E2E Automation v0.1：`pnpm playbook:bundle -- --from-dir <dir>` 会从同一目录自动发现 `ai-ide-repair-playbook.json`、`ai-ide-playbook-consumption-report.json`、`ai-ide-repair-decision-package.json`、`ai-ide-repair-approval-receipt.json`、`ai-ide-approved-repair-execution-plan.json` 和 `ai-ide-repair-execution-evidence-report.json`，生成 bundle manifest；`tests/integration/playbook-e2e-repair-evidence.test.ts` 覆盖 `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle manifest` 的本地 E2E 消费闭环。该能力不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权 public launch、npm publish、GitHub release 或商业版 availability claims。
- AI IDE Repair Evidence Bundle Consumer Contract v0.1：`pnpm playbook:contract -- --from-dir <dir>` 会从本地 bundle manifest 生成 `ai-ide-repair-evidence-consumer-contract.json` / `.md`，schema 为 `repoassure.ai-ide-repair-evidence-consumer-contract.v1`。consumer contract 将 bundle manifest 转成 AI IDE 可直接消费的 `artifactReadSequence`、artifact roles、`verificationChecklist`、maintainer review boundary、redaction boundary、non-authorization boundary 和 blocked actions；该能力不上传目标 repo 材料，不自动修改目标 repo，不授权发布、launch、客户联系或商业版 availability claims。
- Target Repo Repair Goal Proposal Package v0.1：`pnpm playbook:proposal -- --from-dir <dir>` 会从本地 `ai-ide-repair-execution-replay-readiness.json` 生成 `ai-ide-target-repo-repair-goal-proposal-package.json` / `.md`，schema 为 `repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1`。proposal package 将 replay readiness 转成 maintainer / AI IDE 可审阅的下一步修复 goal 提案，包含 prerequisites、artifact read order、allowed repair scope、repair task breakdown、verification commands、maintainer approval boundary、redaction boundary、non-authorization boundary 和 blocked actions；它不上传目标 repo 材料，不自动修改目标 repo，不授权发布、launch、客户联系或商业版 availability claims。
- Target Repo Repair Goal Authorization Receipt v0.1：`pnpm playbook:authorize -- --from-dir <dir> --decisions <authorization-decisions.json>` 会从本地 `ai-ide-target-repo-repair-goal-proposal-package.json` 和 maintainer 决策输入生成 `ai-ide-target-repo-repair-goal-authorization-receipt.json` / `.md`，schema 为 `repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1`。receipt 支持 `approve`、`reject`、`defer`、`accept_risk`，记录 source proposal provenance、decision summary、approved/rejected/deferred/risk-accepted scope、verification requirements 和 non-authorization boundary；它只可授权“单独的目标 repo 修复 goal”，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory，不授权发布、launch、客户联系或商业版 availability claims。
- Authorized Target Repo Repair Goal Task Package v0.1：`pnpm playbook:target-repair-goal -- --from-dir <dir>` 会从本地 `ai-ide-target-repo-repair-goal-authorization-receipt.json` 生成 `ai-ide-authorized-target-repo-repair-goal-task-package.json` / `.md`，schema 为 `repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1`。task package 只把 `authorizedForSeparateTargetRepoRepairGoal` 的授权项转换成 `approvedRepairGoals`，并把 rejected / deferred / risk-accepted 项保留为 excluded scope；它为后续“单独目标 repo 修复 goal”提供 AI IDE 可消费输入，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权发布、launch、客户联系或商业版 availability claims。
- Target Repo Repair Goal Execution Evidence Intake v0.1：`pnpm playbook:target-repair-evidence -- --from-dir <dir>` 会从本地 `ai-ide-authorized-target-repo-repair-goal-task-package.json` 和 `target-repo-repair-goal-execution-evidence-input.json` 生成 `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` / `.md`，schema 为 `repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1`。intake report 记录 separate target repo repair goal 的 mutation summary、verification results、boundary report 和 maintainer review checklist；它只导入本地证据，不上传目标 repo 材料，不由 RepoAssure 创建 branch/commit/PR/issue/advisory/file mutation，不授权发布、launch、客户联系或商业版 availability claims。
- Target Repair Evidence Review Decision Package v0.1：`pnpm playbook:target-repair-review -- --from-dir <dir>` 会从本地 `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` 和 `target-repair-evidence-review-decisions.json` 生成 `ai-ide-target-repair-evidence-review-decision-package.json` / `.md`，schema 为 `repoassure.ai-ide-target-repair-evidence-review-decision-package.v1`。decision package 支持 `accept`、`changes_requested`、`defer` 和 `accept_risk`，记录 source intake provenance、accepted evidence scope、change-requested/deferred/risk-accepted items、next repair goal recommendations 和边界；它只记录 maintainer 审阅决策，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权发布、launch、客户联系或商业版 availability claims。
- Blocked Goal Recovery Package v0.1：`pnpm goal:recover -- --from-dir <dir>` 会从本地 `blocked-goal-recovery-input.json` 生成 `blocked-goal-recovery-package.json` / `.md`，schema 为 `repoassure.blocked-goal-recovery-package.v1`。recovery package 支持 environment、external_service、authorization_required、maintainer_decision_required、technical_unknown、test_instability、security_or_compliance 和 product_scope blocker 分类，以及 blocked、incomplete、deferred、retryable 状态；它记录 source goal/audit/log provenance、attempted actions、automatic recovery actions、maintainer decision requests、external prerequisites、resume commands 和边界，不上传目标 repo 材料，不自动修改目标 repo，不创建 branch/commit/PR/issue/advisory/file mutation，不授权发布、launch、客户联系或商业版 availability claims。
- Blocked Goal Recovery Consumption Validation v0.1：`pnpm --silent goal:recover:consume -- --from-dir <dir>` 会读取本地 `blocked-goal-recovery-package.json`，生成 `blocked-goal-recovery-consumption-report.json` / `.md`，schema 为 `repoassure.blocked-goal-recovery-consumption-report.v1`。报告提供原文件 SHA-256、evidence read order、resume readiness、automatic retry / maintainer decision / external prerequisite action queue、reviewed resume commands 和 resume checklist；readiness 从实际 blocker gate 推导并验证 blocked actions 完整性。命令输出会脱敏 secret-like path；报告不执行 recovery commands，也不授权目标 repo 修改、发布、launch、客户联系、pricing/spend 或商业版 availability claims。
- Blocked Goal Recovery Decision Receipt v0.1：`pnpm --silent goal:recover:decide -- --from-dir <dir>` 会读取 consumption report 和 `blocked-goal-recovery-decisions.json`，生成 `blocked-goal-recovery-decision-receipt.json` / `.md`，schema 为 `repoassure.blocked-goal-recovery-decision-receipt.v1`。Receipt 通过稳定 opaque action/command ID 逐项记录 approve/reject/defer/accept_risk、raw-source SHA-256、external prerequisite completion evidence、command-level decision 和 separate-resume readiness；它 does not execute 任何 resume command，也不授权 target repo mutation、发布、launch、客户联系、pricing/spend、仓库可见性或商业/hosted claims。
- Blocked Goal Recovery Resume Attempt Task Package v0.1：`pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>` 将 ready decision receipt 转成 `blocked-goal-recovery-resume-attempt-task-package.json` / `.md`，schema 为 `repoassure.blocked-goal-recovery-resume-attempt-task-package.v1`。目录还需提供 task-input envelope 记录 independently reviewed receipt SHA；它只携带 approve/accept_risk action 与 command scope，保留 exact receipt bytes、source evidence、执行顺序、prerequisites 和 verification checklist；非 ready receipt 输出空执行范围。任务包 does not execute resume commands，也不扩展 target repo、发布、launch、客户、pricing/spend、visibility 或商业/hosted 权限。
- Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1：`pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir>` 将 separate resume attempt 的 action、command、verification 和 boundary evidence 转成 JSON/Markdown intake，schema 为 `repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1`。它绑定 exact task package SHA，区分 complete / failed / incomplete / boundary violation / source not ready；does not execute commands，也不等于 maintainer acceptance。
- Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1：`pnpm --silent goal:recover:review-resume-evidence -- --from-dir <dir>` 同时读取原始 task package、execution evidence intake 和 maintainer decisions，将 exact-task / exact-intake-bound 决策转成 JSON/Markdown review package，schema 为 `repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1`。它重新核对 task package SHA-256 和完整 action / command / verification inventory，并逐项记录 accept / changes_requested / defer / accept_risk；does not execute commands 或自动关闭 Goal。
- Blocked Goal Recovery Resume Attempt Closure Receipt v0.1：`pnpm --silent goal:recover:close-resume-attempt -- --from-dir <dir>` 重新验证 exact task package、execution intake、accepted / accepted-with-risk review package 的完整 SHA 和 evidence inventory trust chain，再结合 exact-review-SHA closure input 生成本地 JSON/Markdown closure receipt，schema 为 `repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1`。accepted-with-risk 必须逐项确认全部 risk evidence keys；receipt does not execute commands，也不关闭 external goal 或扩大任何外部授权。
- Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1：`pnpm --silent goal:recover:validate-lifecycle -- --from-dir <campaign-dir>` 读取本地相对 artifact 目录，验证 recovery 到 closure 的 schema、raw-byte SHA、blocked actions、redaction 和非执行边界，生成 `blocked-goal-recovery-lifecycle-campaign-summary.json` / `.md`。矩阵覆盖 accepted、accepted_with_risk、blocked、failed、incomplete、environment_blocker、boundary_violation 和 rejected_tampered；validator does not execute commands 或改变 external state。
- Blocked Goal Recovery MCP Real Client Consumption Validation v0.1：`pnpm test:mcp-real-client` 使用官方 SDK `Client` + `StdioClientTransport` 启动真实 MCP 子进程，验证八工具发现、reviewed lifecycle 消费、成功 schema、可读错误、stderr 脱敏、timeout 和 deterministic cleanup。错误结果只返回标准 text `content` + `isError: true`，避免 success output schema 拒绝 `{ error }` structuredContent；该验证不执行恢复命令或修改目标 repo。
- Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1：`pnpm --silent mcp:config -- --client <cursor|vscode|codex>` 生成本地 stdio 配置，固定使用当前 Node.js 绝对路径和 `apps/mcp-server/index.js`；`pnpm test:mcp-external-config` 从 repo 外部、带空格 source-checkout alias 启动三种配置并验证八工具发现、SDK harness 环境隔离和进程清理。新空配置可直接使用；已有配置必须只合并 `repoassure` entry。生成器 does not write client configuration，验证 does not execute recovery or resume commands；真实 IDE 环境继承留给人工验收。
- Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1：维护者可按 `docs/operations/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1.md` 使用一个真实安装的客户端检查工具发现，并只调用无恢复命令的 disposable fixture。Codex 的首次人工验收已接受并保留脱敏证据；这不代表发布、目标仓库修改或 hosted/commercial availability。

## Public Source State

RepoAssure source is currently public and `main` is protected by GitHub `Quality Gates`; the historical public-release evidence and the current-state reconciliation are recorded in `docs/operations/public-release-manual-gate-closure-v0.2.md`. This does not authorize npm publication, GitHub release creation, public launch, production marketing, customer outreach, or SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
- Repair task actionability runtime：`repair-task-package.json` 和 `repair-handoff-package.json` 的每个任务包含 `actionability` 元数据，覆盖 `dependencies`、`suggestedVerificationCommands`、`patchApplicabilityEvidence`、`aiIdeExecutionPrompt`、`manualReviewBoundary`、`riskNotes` 和 `noAutoApplyBoundary`。该 runtime 让 AI IDE / maintainer 更容易判断先读什么、验证什么、哪些 patch applicability evidence 需要人工审查，并明确 no-auto-apply boundary；它不自动修改目标 repo、不创建 branch/commit/PR/issue/advisory，也不授权 public launch 或商业版 availability claims。
- Security Assurance Lane Phase 1：可通过 `hardening security import --provider codex-security --scan-dir <dir> --repo <repo> --run-dir <dir>` 从本地 provider scan directory 导入安全证据，提供 local-first provider security evidence import，生成 `.hardening/runs/<run-id>/security/security-summary.json`、`security-findings.json`、provider `import-manifest.json` 和 `normalized-findings.json`；导入过程保留 provider provenance、写入前脱敏证据，并让 repair plan / repair task package 消费 security findings。该能力不运行 Codex Security 插件、不联网、不上传目标 repo、不创建 issue/PR/advisory、不修改目标 repo，也不是当前 MVP 必需验收门槛。
- CLI：成功 stdout JSON 和 stderr 错误输出都会在写入前脱敏，避免上游工具结果或异常消息中的敏感值直接进入终端。
- MCP Server：通过 stdio 暴露 hardening tools，供 Agent/IDE 调用；tool 成功响应和错误响应写入 `content` 与 `structuredContent` 前都会脱敏，进程级启动失败写入 stderr 前也会脱敏；`sessionId` 作为 `stop_app` 所需操作句柄会保留在成功响应的 `structuredContent` 中。

## 项目结构

当前代码是分阶段迁移中的 monorepo workspace：CLI/MCP 入口仍通过兼容 bin 运行，monorepo 迁移已进入 Phase 2 package extraction。`packages/acceptance/` 已承载验收实现模块、runner、goal audit 和 user handoff；`@hardening-mcp/shared` / `packages/shared/` 已承载脱敏、shell quoting 和 shell word parsing 共享工具实现；`@hardening-mcp/security-assurance` / `packages/security-assurance/` 已承载 Security Assurance Lane Phase 1 本地 provider evidence import 实现；`@hardening-mcp/browser-explorer` / `packages/browser-explorer/` 已承载 browser/fetch exploration 和 Playwright driver 实现；`@hardening-mcp/repair-planner` / `packages/repair-planner/` 已承载 repair plan 与 executable repair task package 实现；`src/internal/acceptance/`、`dist/internal/acceptance/`、`src/shared/`、`dist/shared/`、`src/domain/explore/`、`dist/domain/explore/`、`src/domain/repair-plan/`、`dist/domain/repair-plan/` 和 `src/types/repair-plan.ts` / `dist/types/repair-plan.*` 仅作为兼容 wrapper/output 路径保留。完整目标结构和迁移规则见 `docs/architecture/specs/monorepo-structure-spec-v0.1.md`；文档分类与命名规则见 `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`。

Autopilot-compatible source-of-truth gateways 位于 `docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md` 和 `docs/PLAN.md`。它们是产品意图、解决方案边界、设计方向和执行顺序的稳定入口；详细文档仍保留在现有 `docs/product/`、`docs/architecture/`、`docs/design/`、`docs/acceptance/`、`docs/operations/`、`docs/goals/` 和 `docs/logs/` 目录中。

```text
apps/
  cli/        hardening CLI 的未来 app 边界说明
  mcp-server/ hardening-mcp stdio server 的未来 app 边界说明
packages/
  core/              未来核心编排包
  security-assurance/ @hardening-mcp/security-assurance 安全证据导入实现包
  browser-explorer/  @hardening-mcp/browser-explorer 浏览器探索实现包
  repair-planner/    @hardening-mcp/repair-planner 修复计划实现包
  acceptance/        Phase 2 acceptance 实现与验收命令包
  shared/            @hardening-mcp/shared 共享工具实现包
src/
  adapters/    当前 CLI 和 MCP 入口适配器
  tools/       当前 MCP/CLI 共享的工具编排层
  domain/      当前 analyze、boot、reports、tests 等领域逻辑，explore 为兼容 wrapper
  shared/      @hardening-mcp/shared 的兼容 wrapper
  internal/    acceptance 兼容 wrapper 与 benchmark 等项目治理脚本
docs/
  PRD.md       Autopilot-compatible 产品意图入口
  SPEC.md      Autopilot-compatible 解决方案边界入口
  DESIGN.md    Autopilot-compatible 设计方向入口
  PLAN.md      Autopilot-compatible 执行顺序入口
  adr/         长期架构决策记录
  product/     specs/ 和 research/
  architecture/overview、specs/ 和 spikes/
  testing/     strategy/ 和 samples/
  acceptance/  guides/、checklists/、records/ 和当前验收输出
  logs/        dev-log、blockers、decision-log、spike-results
  goals/       active goal 和 completed/
artifacts/
  benchmark-runs/  benchmark 运行产物
  test-results/    测试运行产物
examples/      示例目标 repo 和集成示例预留区
```

开发者优先从 `src/adapters/cli/`、`src/adapters/mcp/` 和 `src/tools/` 追踪入口；验收命令和验收实现优先从 `packages/acceptance/` 追踪，`src/internal/acceptance/` 与 `dist/internal/acceptance/` 仅作为兼容 wrapper/output 路径保留；共享脱敏与 shell helper 实现优先从 `@hardening-mcp/shared` / `packages/shared/` 追踪，`src/shared/` 与 `dist/shared/` 仅作为兼容 wrapper/output 路径保留；安全证据导入优先从 `@hardening-mcp/security-assurance` / `packages/security-assurance/` 追踪；浏览器探索、fetch route exploration、Playwright driver 和安全交互策略实现优先从 `@hardening-mcp/browser-explorer` / `packages/browser-explorer/` 追踪，`src/domain/explore/` 与 `dist/domain/explore/` 仅作为兼容 wrapper/output 路径保留；repair plan 与修复任务包实现优先从 `@hardening-mcp/repair-planner` / `packages/repair-planner/` 追踪，`src/domain/repair-plan/`、`dist/domain/repair-plan/` 和 `src/types/repair-plan.ts` / `dist/types/repair-plan.*` 仅作为兼容 wrapper/output 路径保留；产品和验收资料优先从 `docs/product/`、`docs/acceptance/` 和 `docs/goals/` 读取；长期架构决策优先读取 `docs/adr/README.md`。AI IDE / Agent 消费目标 repo 的硬化物料时，应优先读取目标 repo 的 `.hardening/latest/manifest.json`，再读取 manifest 指向的 `ai-ide-handoff-package.json` 和 `user-validation-evidence-loop.json`。

核心架构决策已级联到当前文档和实现：ADR-0001 固化 local-first CLI/MCP 边界，ADR-0002 固化 CLI/MCP shared core，ADR-0003 固化 `.hardening/latest/manifest.json` 和 run-scoped artifact 布局，ADR-0004 固化 repair plan 与 executable task package 物料合同。ADR-0010 固化 RepoAssure 品牌定位；ADR-0011 固化私有 GitHub 工程基线、CI 门禁和 repo hygiene 检查；ADR-0012 固化 branch protection 和 release boundary operations 要求；ADR-0013 固化 Codex Security 影响下的 Security Assurance Lane 策略，执行规格见 `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`：安全扫描工具应作为 provider-backed evidence source 接入 RepoAssure，而不是把 RepoAssure 定位成通用 deep vulnerability scanner；ADR-0014 固化 v0.3 分发与修复闭环就绪方向，要求 GitHub Action wrapper、AI IDE repair loop 和 public-release readiness 继续遵守 local-first、不默认自动改代码、不上传目标 repo 的边界；ADR-0015 固化 public release readiness boundary：Apache-2.0 `LICENSE`、贡献政策、安全披露、依赖 license audit 和 release notes draft 是发布准备材料，不等于公开发布授权；ADR-0016 固化 Team Cloud and Enterprise commercial edition boundary，商业版路线图见 `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`，架构边界见 `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md`；ADR-0017 固化 public website 与 Project Intelligence Console 是两个独立 surface，官网规划见 `docs/product/specs/public-website-spec-v0.1.md`，内部 graph console 规划见 `docs/product/specs/project-intelligence-console-spec-v0.1.md`；ADR-0018 固化 public website localization strategy：官网先支持 English + Simplified Chinese first，Japanese and Korean 是 roadmap locales，且不授权产品 artifact 多语言化；ADR-0019 固化 public website enterprise design system，设计系统见 `docs/design/design-system-v0.1.md`，后续 Public Website v0.2 应对齐 security-grade、evidence-first、local-first、enterprise-calm 的企业安全审美；ADR-0020 固化 public website private preview deployment boundary：private preview deployment、production deployment 和 public launch 是三个独立 gate，deployment execution requires a separate Codex goal；ADR-0021 固化 private preview hosting fallback decision：Vercel target mismatch 修复前暂停使用现有 Vercel project，local static preview bundle 是临时 review surface，远程 fallback 只接受 Cloudflare Pages preview deployments with Cloudflare Access 或等效访问受控静态托管；ADR-0022 固化 equivalent release control：当 GitHub private repo branch protection / rulesets 不可用时，替代门禁必须以 exact release SHA、CI、local full test、hygiene、sensitive-material scan 和 maintainer closure approval 为证据包，且设计本身不关闭 public release gate；ADR-0024 固化 Autopilot-compatible documentation architecture：`docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md` 和 `docs/PLAN.md` 是 source-of-truth gateway，不搬迁现有详细文档；ADR-0025 固化 AI IDE repair evidence bundle consumer contract：`playbook:contract` 将 bundle manifest 转成 AI IDE 可消费的 artifact read sequence、verification checklist 和 maintainer review boundary；ADR-0029 固化 target repo repair goal authorization receipt：`playbook:authorize` 将 proposal package 和 maintainer 决策转成 approve/reject/defer/accept_risk 回执，但不执行目标 repo 修改；ADR-0032 固化 target repair evidence review decision package：`playbook:target-repair-review` 将 intake report 和 maintainer review decisions 转成 accept/changes_requested/defer/accept_risk 决策包，但不执行目标 repo 修改；ADR-0033 固化 blocked goal recovery package：`goal:recover` 将 blocked/incomplete/deferred/retryable goal blocker 证据转成恢复包，但不执行目标 repo 修改或发布动作；`hardening-mcp` 暂时保留为内部 package、CLI 和 MCP 实现名称。

ADR-0034 进一步固化 blocked goal recovery consumption contract：`goal:recover:consume` 将恢复包转成 AI IDE 可消费的 read order、action queue 和 resume checklist，但不执行恢复命令。

ADR-0035 固化 Blocked Goal Recovery Decision Receipt v0.1：`goal:recover:decide` 将 action queue 与 maintainer decisions 转成可审计回执，但不执行恢复命令。

ADR-0036 固化 Blocked Goal Recovery Resume Attempt Task Package v0.1：`goal:recover:prepare-resume` 将已审阅回执转成独立恢复尝试的有界任务包，但不执行恢复命令。

ADR-0037 固化 Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1：`goal:recover:intake-resume-evidence` 只导入外部执行证据，不执行命令或自动接受证据。

ADR-0038 固化 Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1：maintainer acceptance 必须逐项、可审计且不触发命令执行。ADR-0039 固化 Blocked Goal Recovery Resume Attempt Closure Receipt v0.1：只有 accepted / accepted-with-risk review 可生成 exact-source-bound 本地 closure，且不关闭 external goal。ADR-0040 固化完整 recovery lifecycle campaign validation 和 rejected_tampered fail-closed 规则。

## 安装

环境前置条件：

- Node.js 22 或更高版本。
- pnpm。
- 如需 `--browser`、真实 Chromium trace E2E 或 generated Playwright spec 验证，请安装 Playwright Chromium，并在允许启动浏览器进程的环境中运行。

```bash
pnpm install
```

## CLI

```bash
pnpm build

pnpm dev analyze <repo>
pnpm dev explore <repo> <url>
pnpm dev explore <repo> <url> --browser --critical-path /login --max-routes 20 --max-actions-per-route 20
pnpm dev generate-tests <findingsPath> <outputDir> --smoke-route /login --base-url http://127.0.0.1:5173
pnpm dev plan <repo>
pnpm dev report <runDir> <outputPath>
pnpm dev security providers
pnpm dev security import --provider codex-security --scan-dir <dir> --repo <repo> --run-dir <repo>/.hardening/runs/<run-id>
pnpm dev run <repo> [url]
pnpm dev run <repo> [url] --browser --critical-path /login --start-command "pnpm dev" --boot-timeout-ms 30000
pnpm dev run <repo> [url] --workspace-output .hardening-workspace
```

`hardening security providers` and MCP `list_security_providers` expose the same local catalog and normalized `scan.json` contract. MCP `import_security_evidence` and the CLI import return `repairPlanningHandoff` for `hardening plan` / `generate_repair_plan`. Native provider formats are not accepted in v0.1; every listed provider currently requires schema `repoassure.normalized-security-scan.v1`, and import never runs a scanner or modifies target source.

构建后也可以使用 bin：

```bash
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
node dist/adapters/cli/index.js run <repo> [url] --browser
```

Monorepo Phase 1 也提供 app shell，仍复用兼容 bin 入口：

```bash
pnpm build
node apps/cli/index.js --help
pnpm app:cli -- --help
```

每个 CLI 子命令的 `--help` / `-h` 都会在参数校验和工具执行前返回用法说明，不会触发 repo 分析、浏览器探索或文件写入。CLI 成功 stdout JSON 和 stderr 错误输出会在写入前脱敏。

常用参数：

| 参数 | 适用命令 | 说明 |
| --- | --- | --- |
| `--browser` | `explore`、`run` | 使用 Playwright 浏览器探索，而不是轻量 fetch 探索。 |
| `--critical-path <path-or-intent>` | `explore`、`run` | 添加必须探索的业务路径、同源 URL 或短自然语言意图，可重复传入；例如 `/login` 或 `"login, create a project, then send a chat message"`。外部 origin 会被忽略。 |
| `--max-routes <n>` | `explore`、`run` | 限制最多访问的路由数。 |
| `--max-actions-per-route <n>` | `explore`、`run` | 限制每个路由最多执行的基础交互数；传 `0` 可禁用点击/提交交互。 |
| `--storage-state <path>` | `explore`、`run` | 使用 Playwright storageState JSON 复用登录态。 |
| `--trace` | `explore`、`run` | 为每个 browser snapshot 输出 Playwright trace zip artifact。 |
| `--smoke-route <path-or-url>` | `generate-tests` | 为已知关键路径额外生成 Playwright smoke test，可重复传入。 |
| `--base-url <url>` | `generate-tests` | 指定 generated spec 默认 `baseURL` 的应用 URL；只写入安全 origin，仍可由 `HARDENING_BASE_URL` 覆盖。 |
| `--run-dir <dir>` | `plan` | 从指定 hardening run 目录生成或刷新 `repair-plan.json`、`repair-plan.md`、`repair-task-package.json` 和 `repair-task-package.md`；默认读取 `<repo>/.hardening/latest`。 |
| `--start-command <command>` | `run` | URL 省略时，指定应用启动命令。 |
| `--boot-timeout-ms <ms>` | `run` | URL 省略时，指定启动等待超时。 |
| `--workspace-output <dir>` | `run` | 额外把本 repo 的 run bundle 同步到一个多 repo 中央输出目录，并更新 workspace manifest。 |

## MCP Server

构建后启动 stdio MCP Server：

```bash
pnpm build
node dist/adapters/mcp/index.js
# 或使用 Phase 1 app shell
node apps/mcp-server/index.js
```

生成只写入 stdout 的 AI IDE 配置：

```bash
pnpm --silent mcp:config -- --client cursor
pnpm --silent mcp:config -- --client vscode
pnpm --silent mcp:config -- --client codex
```

输出分别对应 Cursor `mcpServers` JSON、VS Code `servers` stdio JSON 和 Codex `mcp_servers` TOML。命令不会写入任何客户端配置文件；新空配置可使用完整输出，已有配置只能合并 `repoassure` entry，并先检查同名 server/table，不能覆盖其他 servers、inputs 或 sandbox 设置。输出包含 workstation-specific 绝对路径，应优先放入本机 user-level 配置，禁止提交、共享或写入 CI 日志；如必须使用 project-level 配置，应保持 untracked。保存前仍应人工确认绝对 Node.js 与 RepoAssure 路径。

暴露的 tools：

- `analyze_repo`
- `boot_app`
- `stop_app`
- `explore_app`
- `generate_tests`
- `generate_repair_plan`
- `harden_report`
- `run_hardening`
- `create_blocked_goal_recovery`
- `consume_blocked_goal_recovery`
- `record_blocked_goal_recovery_decision`
- `prepare_blocked_goal_resume_attempt`
- `intake_blocked_goal_resume_evidence`
- `review_blocked_goal_resume_evidence`
- `close_blocked_goal_resume_attempt`
- `validate_blocked_goal_recovery_lifecycle`

`boot_app` 会返回 `sessionId`。独立调用 `boot_app` 后，应调用 `stop_app` 清理进程。`run_hardening` 内部会自动清理自己的 boot session。

`explore_app` 和 `run_hardening` 支持 `criticalPaths`、`maxRoutes`、`maxActionsPerRoute`、`storageStatePath`、`trace` 与 `browser`。`criticalPaths` 可传同源 URL/path，也可传短自然语言关键路径意图；外部 origin 会被忽略。`generate_tests` 支持 `smokeRoutes` 和 `baseUrl`，用于独立生成关键路径 smoke tests 并指定 generated spec 的安全默认 origin。`generate_repair_plan` 默认读取 `<repo>/.hardening/latest`，也可传 `runDir` 刷新指定 run 的 repair plan 和可执行修复任务包。`run_hardening` 额外支持 `startCommand`、`bootTimeoutMs` 和 `workspaceOutputDir`，并会自动生成 repair plan 与修复任务包。

Blocked-goal recovery tools 按 package → consumption → decision → task → intake → review → closure → lifecycle validation 顺序消费本地物料。它们只接受 `inputDir` 和可选的 contained `outputDir`，返回 stage-bound `repoassure.mcp-blocked-goal-recovery-tool-result.v1`，不执行 recovery/resume commands 或修改目标 repo。工具会覆盖自身固定命名的本地证据文件，因此标记 `destructiveHint: true`；输入必须是 8 MiB 以内的普通文件并使用 non-blocking/no-follow 读取，MCP 对目录 device/inode 做持续校验，输出拒绝已有 symlink 并以同目录临时文件原子替换。完整契约见 `docs/operations/blocked-goal-recovery-mcp-surface-v0.1.md`。

真实 AI IDE-shaped stdio 验证见 `docs/operations/blocked-goal-recovery-mcp-real-client-validation-v0.1.md`。运行 `pnpm test:mcp-real-client` 可验证 compiled server、官方 SDK 客户端和子进程清理契约。

外部 AI IDE 配置与 app shell 验证见 `docs/operations/blocked-goal-recovery-mcp-external-ai-ide-configuration-v0.1.md`。运行 `pnpm test:mcp-external-config` 可验证 Cursor、VS Code 和 Codex 配置从外部 cwd 启动 `apps/mcp-server/index.js`。

MCP client 配置示例见 `docs/acceptance/guides/user-acceptance-guide.md`。

## 质量门禁

```bash
pnpm repo:hygiene
pnpm release:check
pnpm release:hygiene
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
pnpm goal:audit
pnpm build:website
pnpm package:website-preview
pnpm preflight:cloudflare-preview
```

私有 GitHub repo 的 CI 基线见 `docs/architecture/specs/private-github-engineering-baseline-v0.1.md`：PR 和 `main` push 必须运行 `pnpm repo:hygiene`、unit、typecheck、lint、build 和 `pnpm goal:audit`。`pnpm repo:hygiene` 只检查已追踪文件，阻止 generated artifacts、build outputs、local hardening runs、env files、private keys 和 local logs 进入提交。当前环境中，监听本地端口的 boot 集成测试和真实浏览器 E2E 需要额外权限。详见 `docs/logs/blockers.md`。

标准 `pnpm test` 会先构建 package/root runtime outputs，再以四个 worker 保持 Vitest file parallelism 运行完整测试。并发 playbook/recovery 子进程通过 `node_modules/.cache/repoassure` 中的本地 source-and-build fingerprint single-flight 状态复用 acceptance build，避免同时改写和读取 `packages/acceptance/dist`；该缓存已被 `node_modules/` 忽略，不属于产品物料。完整说明见 `docs/operations/parallel-test-runtime-build-isolation-v0.1.md`。

v0.3 新增本地优先 GitHub Action wrapper：`.github/actions/repoassure/action.yml`。该 action 在 CI checkout 内安装依赖、构建本地 CLI，并执行 `node dist/adapters/cli/index.js run <repo>`；它不依赖 hosted RepoAssure 服务，也不会默认上传目标 repo source、logs、screenshots、traces、env values 或 private artifacts。安全示例见 `examples/github-actions/repoassure-local-first.yml`，其中 artifact upload 需要显式 opt-in。

分支保护与发布边界见 `docs/operations/branch-protection-release-boundary-v0.1.md`。历史 private repo 阶段中，GitHub 对 branch protection / repository rulesets 返回 403，因此通过 ADR-0022 的 equivalent release control 关闭该 gate。Public Source Release Execution v0.1 见 `docs/operations/public-source-release-execution-v0.1.md`：`xiaoba-dev/repoassure` 已从 `PRIVATE` 改为 `PUBLIC`，public read access 已验证，`pnpm release:check` 报告 `public release ready: yes`。`package.json` 仍保持 `"private": true`，npm publication、GitHub release、public launch、production marketing announcement、SaaS/Team Cloud/Enterprise/hosted dashboard availability claims 仍未执行。下一步应配置 native branch protection / repository ruleset，要求 `RepoAssure CI` / `Quality Gates`。

历史 public-release operation 链仍作为审计材料保留：`docs/operations/release-candidate-handoff-v0.1.md`、`docs/operations/public-release-readiness-v0.2.md`、`docs/operations/public-release-candidate-final-review-v0.1.md`、Public Release Manual Gate Input Collection v0.1、Public Release Manual Gate Closure v0.1、Public Release Manual Gate Closure v0.2、Public Release Manual Gate Evidence Intake v0.1、Public Release Manual Gate Evidence Completion v0.1、Public Release Manual Evidence Decision v0.1、Public Release Manual Evidence Decision Closure v0.1、Public Release Manual Decision Input v0.1、Public Release Manual Decision Input Completion v0.1、Public Release Manual Decision Input Review v0.1、Public Release Manual Decision Intake v0.2、Public Release Manual Decision Input Review v0.2、Equivalent Release Control Design v0.1、Equivalent Release Control Closure v0.1、public-website-release-candidate-handoff-v0.1.md。

Public Release Manual Decision Intake v0.2 见 `docs/operations/public-release-manual-decision-intake-v0.2.md`，当前状态为 `decisions_recorded_release_execution_blocked`：legal review 已 approve，trademark/name、private preview feedback 和 dependency/license risk 已 accept risk，secret/customer data exposure 基于自动核验 approve，final maintainer publication authorization 已 approve，但 branch protection / equivalent repository ruleset 因 GitHub private repo plan 下 API 仍 HTTP 403 被记录为 defer，因此 public release remains no-go。

Public Release Manual Decision Input Review v0.2 见 `docs/operations/public-release-manual-decision-input-review-v0.2.md`，当前状态为 `reviewed_release_execution_still_blocked`：7 项 maintainer 决策均已存在且可审阅，当前唯一 blocking manual gate 是 branch protection / equivalent repository ruleset；未定义 equivalent release control，不能为了启用 branch protection 而公开仓库，Public Source Release Execution v0.1 remains blocked。

Equivalent Release Control Design v0.1 见 `docs/operations/equivalent-release-control-design-v0.1.md`，来源 ADR-0022。当前状态为 `designed_not_executed`：已经定义 branch protection gate 的替代证据包候选，包括 exact release commit SHA、RepoAssure CI / Quality Gates、local full test、release hygiene、sensitive-material scan 和 maintainer closure approval；该设计未执行 closure，不授权仓库公开、npm publish、GitHub release 或 public launch，public release remains no-go。

Equivalent Release Control Closure v0.1 见 `docs/operations/equivalent-release-control-closure-v0.1.md`，Public Release Authorization v0.1 见 `docs/product/strategy/public-release-authorization-v0.1.md`。当前 closure 状态为 `closed_release_execution_ready`，authorization 状态为 `ready_for_public_source_release_execution`：branch protection / equivalent repository ruleset gate 已通过 ADR-0022 的等效证据包关闭；该记录不执行 repository visibility change、npm publish、GitHub release、public launch 或商业版 availability claims。Public Source Release Execution v0.1 仍必须作为单独 goal 获得明确执行授权。

Public Source Release Execution v0.1 见 `docs/operations/public-source-release-execution-v0.1.md`。当前状态为 `repository_public_verified`：repository visibility 已从 `PRIVATE` 改为 `PUBLIC`，执行时 `git ls-remote` public read access 返回 HEAD `1593cfb36871ceef08c9711fd21bc59ebcee6bc8`；没有执行 npm publish、GitHub release、public launch、production marketing announcement 或商业版 availability claims。

Native Branch Protection Enablement v0.1 见 `docs/operations/native-branch-protection-enablement-v0.1.md`。当前状态为 `enabled_verified`：GitHub branch protection 已保护 `main`，要求 `Quality Gates` 严格状态检查、PR merge、1 个 approving review、stale review dismissal、conversation resolution，并禁用 force pushes 和 branch deletion。后续更新 `main` 应走受保护 PR 流程。

Protected PR Workflow Verification v0.1 见 `docs/operations/protected-pr-workflow-verification-v0.1.md`。该记录验证后续变更必须通过 `codex/protected-pr-workflow-v0.1` -> PR #3 -> `Quality Gates` -> review gate -> merge gate 的受保护流程；最新 CI 证据由 GitHub PR status 和 PR comment 记录，GitHub 拒绝 self-approval，merge gate 正确等待外部 maintainer review。不弱化 branch protection，不直推 `main`，不执行 npm publish、GitHub release 或 public launch。

Solo Maintainer Branch Protection Adjustment v0.1 见 `docs/operations/solo-maintainer-branch-protection-adjustment-v0.1.md`，来源 ADR-0023。当前项目按独立开发者维护模式调整 branch protection：取消 required approving reviews，保留 `Quality Gates`、strict status checks、admin enforcement、conversation resolution、linear history，并继续禁用 force pushes 和 branch deletion。

Protected PR Workflow Closure v0.1 见 `docs/operations/protected-pr-workflow-closure-v0.1.md`：PR #3 已通过受保护 PR flow 合并，merge commit 为 `c522f3c180ea642d4c531f97ecb287aa061d060f`，main CI run `28510634551` 已通过。

Public Release Post-Merge Hygiene v0.1 见 `docs/operations/public-release-post-merge-hygiene-v0.1.md`，当前状态为 `hygiene_verified`：repository visibility 为 `PUBLIC`，default branch 为 `main`，branch protection profile 为 `solo_maintainer`，required status check 为 `Quality Gates`，main CI run `28511247860` 已通过；`package.json` 仍保持 `"private": true`，`repoassure.com` 和 `www.repoassure.com` 均已通过官网验证；secret/customer data exposure scan、`pnpm repo:hygiene` 和 `pnpm release:check` 均通过。该 hygiene 记录不执行 npm publish、GitHub release、public launch、production marketing announcement、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Public Source Release Final Verification v0.1 见 `docs/operations/public-source-release-final-verification-v0.1.md`，当前状态为 `public_source_verified_launch_still_blocked`：repository visibility 为 `PUBLIC`，latest main head 为 `e58095fea34d1f8f56941086df1b5be6abf685ce`，latest main CI run `28738066002` 已通过，public read access 通过 `git ls-remote` 验证；`main` 继续要求 `Quality Gates` strict status checks、admin enforcement、conversation resolution 和 linear history，required approving reviews 按 solo maintainer mode 禁用，force pushes 和 branch deletion 禁用；remote git tags、GitHub releases 和 npm package `hardening-mcp` 均未发现，`package.json` 仍保持 `"private": true`。该 verification 同步纠正 `CONTRIBUTING.md` 的 public/private 状态表述，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Public Launch Boundary Decision v0.1 见 `docs/operations/public-launch-boundary-decision-v0.1.md`，当前状态为 `launch_not_authorized`：RepoAssure 处于 `source_public_website_live` 模式，即源码公开且官网在线，但明确 `do_not_launch_yet`。真正 public launch 仍需要单独的 `public_launch_authorization` gate；本决策不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Public Launch Authorization Packet v0.1 见 `docs/operations/public-launch-authorization-packet-v0.1.md`，当前状态为 `authorization_packet_prepared`，但 launch authorization status 仍为 `not_authorized`。该 packet 只准备 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 和 maintainer approval 字段；它不是 Action Authorization Receipt，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend 或商业版 availability claims。

Public Launch Authorization Packet Completion v0.1 见 `docs/operations/public-launch-authorization-packet-completion-v0.1.md`，当前状态为 `completion_recorded_launch_not_authorized`，completion decision 为 `defer_launch_authorization`，launch authorization status 仍为 `not_authorized`。由于本轮没有提供具体 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 或 maintainer approval，所有 completion fields 均记录为 `defer`；No Action Authorization Receipt was produced，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Maintainer Launch Decision Input v0.1 见 `docs/operations/maintainer-launch-decision-input-v0.1.md`，当前状态为 `decision_input_recorded_launch_not_authorized`，maintainer input decision 为 `not_supplied`，launch decision 为 `defer_launch`，launch authorization status 仍为 `not_authorized`。本轮“授权执行”只授权执行 Codex goal，不等于 launch authorization；由于没有提供具体 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 或 final launch approval，所有 launch decision input 均为 `not_supplied`；No Action Authorization Receipt was produced，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Explicit Launch Authorization or Defer Decision v0.1 见 `docs/operations/explicit-launch-authorization-or-defer-decision-v0.1.md`，当前状态为 `explicit_defer_decision_recorded_launch_not_authorized`，explicit launch decision 为 `defer_public_launch`，decision source 为 `goal_execution_authorization_only`，launch authorization status 仍为 `not_authorized`。本轮没有提供 launch scope、launch copy、release notes、support boundary、legal/trademark/claim-risk review、commercial availability wording review、risk acceptance、rollback/correction plan 或 final launch approval，因此这些字段均为 `not_provided`；No Action Authorization Receipt was produced，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Public Launch Defer Closure v0.1 见 `docs/operations/public-launch-defer-closure-v0.1.md`，当前状态为 `launch_gate_closed_deferred`，closure decision 为 `close_public_launch_gate_as_deferred`，launch authorization status 仍为 `not_authorized`。该 closure 明确 Do not continue repeating launch authorization gates；未来只有在提供新的完整 launch authorization packet 时才重新打开 public launch gate。下一步 workstream 转为 `product_website_user_validation_backlog`；No Action Authorization Receipt was produced，不执行 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Product / Website / User Validation Backlog Planning v0.1 见 `docs/operations/product-website-user-validation-backlog-v0.1.md`，当前状态为 `backlog_planned_launch_deferred`，source closure 为 `Public Launch Defer Closure v0.1`，launch authorization status 仍为 `not_authorized`。该 backlog 将后续工作拆分为 product backlog、public website backlog、user validation backlog、release readiness hygiene backlog 和 future launch reopening criteria；它不重新打开 public launch gate，不生成 Action Authorization Receipt，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Product Backlog Prioritization v0.1 见 `docs/operations/product-backlog-prioritization-v0.1.md`，当前状态为 `product_backlog_prioritized_launch_deferred`，source backlog 为 `Product / Website / User Validation Backlog Planning v0.1`，prioritization decision 为 `prioritize_product_validation_before_launch`，launch authorization status 仍为 `not_authorized`。后续 TDD 执行顺序为 Priority 1: Target repo acceptance feedback loop、Priority 2: AI IDE handoff material quality、Priority 3: Repair task actionability、Priority 4: User validation evidence loop、Priority 5: Release readiness hygiene automation；它明确 Do not reopen public launch gate，不生成 Action Authorization Receipt，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Target Repo Acceptance Feedback Loop Spec v0.1 见 `docs/operations/target-repo-acceptance-feedback-loop-spec-v0.1.md`，当前状态为 `target_repo_feedback_loop_specified_not_implemented`，source priority 为 `Product Backlog Prioritization v0.1 / Priority 1`，implementation authorization 为 `spec_only`，launch authorization status 仍为 `not_authorized`。该 spec 定义未来真实目标 repo run 的本地 feedback summary contract：`runStatus`、`targetRepoMetadataClass`、`acceptanceResult`、`blockerCategory`、`nextRecommendedProductAction`、`artifactLinks`、`redactionBoundary` 和 `maintainerTriageGuidance`；它不实现 runtime，不上传目标 repo 材料，不存储 secrets 或 raw private repo content，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Target Repo Acceptance Feedback Loop Runtime v0.1 见 `docs/operations/target-repo-acceptance-feedback-loop-runtime-v0.1.md`，当前状态为 `target_repo_feedback_loop_runtime_implemented`，source spec 为 `Target Repo Acceptance Feedback Loop Spec v0.1`，implementation status 为 `implemented_minimal_runtime`，launch authorization status 仍为 `not_authorized`。`pnpm user:accept` 的 browser 和 Python/CLI 模式现在会在 run-scoped artifact directory 写入 `target-repo-feedback-summary.json`，schema 为 `repoassure.target-repo-feedback-summary.v1`，并从 manifest 记录 `artifacts.targetRepoFeedbackSummaryPath`；summary 使用 relative artifact links，不上传目标 repo 材料，不存储 secrets、raw private repo content、OTP、cookie、Access token、login query-state、reviewer credentials 或绝对 workstation paths，不授权 npm publish、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Repair Task Actionability Runtime v0.1 见 `docs/operations/repair-task-actionability-runtime-v0.1.md`，当前状态为 `repair_task_actionability_runtime_implemented`，source backlog 为 `Product Backlog Prioritization v0.1 / Priority 3`，implementation status 为 `implemented_minimal_runtime`，launch authorization status 仍为 `not_authorized`。`repair-task-package.json` 和 `repair-handoff-package.json` 现在为每个任务写入 `actionability` 元数据，包含 dependencies、suggestedVerificationCommands、patchApplicabilityEvidence、aiIdeExecutionPrompt、manualReviewBoundary、riskNotes 和 noAutoApplyBoundary；该 runtime 只增强 AI IDE / maintainer 的执行判断，不自动应用 patch，不修改目标 repo，不授权发布或商业版 availability claims。

User validation evidence loop runtime 见 `docs/operations/user-validation-evidence-loop-runtime-v0.1.md`，当前状态为 `user_validation_evidence_loop_runtime_implemented`，source backlog 为 `Product Backlog Prioritization v0.1 / Priority 4`，implementation status 为 `implemented_minimal_runtime`，launch authorization status 仍为 `not_authorized`。browser 和 Python/CLI user acceptance runs 会写入 run-scoped `user-validation-evidence-loop.json`，schema 为 `repoassure.user-validation-evidence-loop.v1`，并从 manifest 记录 `artifacts.userValidationEvidenceLoopPath`；package 包含 `feedbackEvents`、`evidenceSources`、`triage`、`qualityGates`、`redactionBoundary` 和 `nonAuthorizationBoundary`，用于把 pending、accepted、changes_requested、accept_risk、defer 和 blocked 等验证结论形成 local-first、可审计、可回放、可被 AI IDE 消费的 evidence chain。该 runtime 使用 relative artifact links，不上传 reviewer feedback、target repo material 或 private artifacts，不保存 reviewer PII、raw email、OTP、cookie、Access token、login query-state、reviewer credentials、secrets、raw private repo content 或 absolute workstation paths，不授权 public launch、npm publish、GitHub release、production marketing announcement、customer contact、pricing/spend 或商业版 availability claims。

Release readiness hygiene automation runtime 见 `docs/operations/release-readiness-hygiene-automation-runtime-v0.1.md`，当前状态为 `release_readiness_hygiene_automation_runtime_implemented`，source backlog 为 `Product Backlog Prioritization v0.1 / Priority 5`，implementation status 为 `implemented_minimal_runtime`，launch authorization status 仍为 `not_authorized`。`pnpm release:hygiene` 会生成 `release-readiness-hygiene.json` 和 `release-readiness-hygiene.md`，schema 为 `repoassure.release-readiness-hygiene.v1`，汇总 `release:check`、`repo:hygiene`、`sensitive-material-scan`、`goal:audit` command boundary 和 package publication boundary；该 runtime 只生成本地 reviewed evidence，不执行 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing change、spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Real Target Repo Validation Campaign v0.1 见 `docs/operations/real-target-validation-campaign-v0.1.md`，当前状态为 `campaign_executed_product_hardened`，implementation status 为 `implemented_minimal_campaign_summary_runtime`，launch authorization status 仍为 `not_authorized`。`pnpm campaign:summarize` 会生成本地 `campaign-summary.json` 和 `campaign-summary.md`，schema 为 `repoassure.validation-campaign-summary.v1`，用于把多个真实目标 repo 的 run-scoped feedback、AI IDE handoff、user validation evidence loop 和 acceptance record 汇总成 maintainer / AI IDE 可消费索引。本轮 campaign 覆盖 `agent-reach`、`odinsight` 和 `openclaw-ui`，记录 3 个目标、1 个通过、2 个失败，并完成 browser artifact failure diagnostics hardening；该 runtime 不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Real Target Validation Campaign v0.2 见 `docs/operations/real-target-validation-campaign-v0.2.md`，当前状态为 `campaign_executed_product_gap_closed`，implementation status 为 `real_target_followup_validated_and_environment_gap_closed`，launch authorization status 仍为 `not_authorized`。本轮复验继续覆盖 `agent-reach`、`odinsight` 和 `openclaw-ui`，记录 3 个目标、1 个通过、2 个 blocked、0 个 failed；v0.1 had 1 passed / 2 failed; v0.2 has 1 passed / 2 blocked / 0 failed。`openclaw-ui` 已从“无法推断启动命令”推进为“已推断 `pnpm dev`，目标 repo 缺少 `vite` 依赖”，并新增 Node/Web app environment prerequisite guidance 与 `Prepare target app environment` repair task。该 campaign 只提交产品修复、测试和抽象结论，不上传 target repo material、private artifacts、reviewer feedback、customer data、secrets 或 raw private repo content，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Product Validation Action Queue Runtime v0.3 见 `docs/operations/product-validation-action-queue-runtime-v0.3.md`，当前状态为 `product_validation_action_queue_implemented`，launch authorization status 仍为 `not_authorized`。`campaign-summary.json` 现在包含 `prioritizedActionQueue`，将真实目标 repo 的 product follow-up actions 聚合为带 priority、ownerSurface、targetIds、affectedModes、blockerCategories、recommendedVerification 和 evidenceRefs 的行动项；`campaign-summary.md` 同步输出 `Prioritized Action Queue` 表格。该 runtime 不上传 target repo material，不授权 npm publication、GitHub release、public launch、production marketing announcement、customer contact、pricing/spend、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

Public Website local static preview package 可通过 `pnpm build:website && pnpm package:website-preview` 生成，交接见 `docs/operations/local-static-preview-package-v0.1.md`。输出位于 `artifacts/public-website-preview/local-static-preview`，只用于本地 review，不授权 remote hosting、preview URL、production deployment 或 public launch。

Cloudflare Access remote preview preflight 可通过 `pnpm preflight:cloudflare-preview` 生成本地 evidence，交接见 `docs/operations/cloudflare-access-preview-preflight-v0.1.md`。该预检不上传 website source/build output、不调用 Cloudflare API、不创建 preview URL；Cloudflare Pages preview deployments are public by default，因此 Cloudflare Access policy must be enabled before any preview URL is shared。Public Website Custom Domain Deployment v0.1 见 `docs/operations/public-website-custom-domain-deployment-v0.1.md`，当前状态为 `verified_custom_domain_active`：`repoassure.com` 和 `www.repoassure.com` 均已在 Cloudflare Pages custom domains 中 active，HTTPS 返回 200，`pnpm verify:website` 已分别通过两个 custom domain 的英文/中文、桌面/移动、Trust Ledger、Assurance Graph、artifact tabs、private preview form 和 forbidden-claim 验证；Public Website Post-Domain Polish & Launch Boundary Review v0.1 见 `docs/operations/public-website-post-domain-polish-v0.1.md`，当前状态为 `verified_post_domain_polish`，已补齐 canonical URL、Open Graph/Twitter metadata、favicon、web manifest、robots.txt 和 sitemap.xml，并记录 apex/www 当前均直接 HTTP/2 200 服务、不配置 canonical redirect；上述记录不授权仓库公开、npm publish、GitHub release、public launch、production marketing announcement、SaaS/Team Cloud/Enterprise 或 hosted dashboard availability claims。

可使用单一验收入口生成 `docs/acceptance/acceptance-run.md`：

```bash
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm acceptance -- --full
pnpm acceptance -- --full --browser
pnpm goal:audit
pnpm user:handoff
pnpm user:handoff -- --repo <real-web-app-repo>
pnpm user:handoff -- --mode cli --repo <python-cli-repo>
pnpm user:handoff -- --help
pnpm user:handoff -- --output docs/acceptance/user-acceptance-handoff.md
pnpm repair:handoff -- --run <repo>/.hardening/runs/<run-id>
pnpm repair:execute -- --package <repo>/.hardening/runs/<run-id>/repair-handoff-package.json --task <taskId> --dry-run
pnpm repair:execute -- --package <repo>/.hardening/runs/<run-id>/repair-handoff-package.json --task <taskId> --validation-only
pnpm repair:patch-plan -- --report <repo>/.hardening/runs/<run-id>/repair-execution-report.json
pnpm user:accept -- --help
pnpm user:accept -- -h
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --mode cli --repo <python-cli-repo> --decision pending
```

`pnpm acceptance -- --help` 和 `pnpm acceptance -- -h` 会输出验收门禁参数说明。`pnpm acceptance` 运行快速本地门禁、all-subpath package import smoke、package subpath type-resolution smoke 与关键文档/产物检查；`--full` 额外运行完整 integration tests 和 benchmark；`--browser` 额外运行真实 Chromium trace E2E。验收 runner 和 benchmark runner 的进程级 fatal stderr 写入前会脱敏。

真实项目验收的产品范围见 ADR-0008（`docs/adr/0008-repository-acceptance-scope.md`）：当前 `user:accept` 浏览器验收流限定为可自动启动的 Web App repo，或已通过 `--url` 提供运行地址的 Web App。Python CLI / Agent capability repo、纯库、后端服务、移动端和其他非浏览器 UI 目标不会被静默降级为 browser acceptance；例如 `Panniantong/Agent-Reach` 这类只有 `pyproject.toml`、没有根目录 `package.json` 的 repo，在默认 browser mode 会产生结构化 preflight 失败。当前已新增显式 Python/CLI acceptance mode：`pnpm user:accept -- --mode cli --repo <python-cli-repo> --decision pending` 会校验 `pyproject.toml`、生成 Python/CLI profile、执行 CLI smoke / pytest / ruff / mypy 检查、记录 exit code/stdout/stderr/timeout，并输出 `hardening-report.md`、run manifest、repair plan、repair task package、`target-repo-feedback-summary.json`、`ai-ide-handoff-package.json` 和 `user-validation-evidence-loop.json`；该模式不会要求 generated Playwright spec validation。

`pnpm repair:handoff -- --run <repo>/.hardening/runs/<run-id>` 会从某次 run bundle 的 `manifest.json` 读取失败命令和失败验收项，生成 `repair-handoff-package.json`、`repair-handoff-package.md` 和 `verification-plan.md`。每个 handoff task 包含 `actionability`，用于记录依赖、建议验证命令、patch applicability evidence、AI IDE execution prompt、manual review boundary、risk notes 和 no-auto-apply boundary。该命令本身只负责生成交接物料，成功生成即返回 0；任务数量表示目标 repo 仍需修复的 backlog，不表示 handoff 命令失败。

`pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run` 会生成执行计划报告但不运行命令；`--validation-only` 会只复跑该任务的 verification commands，并写出 `repair-execution-report.json` 和 `repair-execution-report.md`。当前 v0.1 不自动修改目标 repo 代码；失败验证会进入 report，命令本身只表示执行报告是否成功生成。

`pnpm repair:patch-plan -- --report <repair-execution-report.json>` 会把失败验证证据分类为可审查补丁计划，输出 `patch-plan.json` 和 `patch-plan.md`。当前 v0.1 识别 `ruff I001` import-sort 自动修复候选，以及 mypy `[index]`、`[return-value]`、`[attr-defined]` 等类型修复候选；该命令只生成计划，不写目标 repo 源码、不运行 formatter、不创建 PR。

`pnpm goal:audit` 生成 `docs/acceptance/goal-completion-audit.md`，用于把 `docs/goals/codex-goal.md` 的成功条件映射到当前证据。该审计不会替代用户验收；只在自动可验证范围内确认是否已准备好请求验收。只有带具体确认备注、且 generated Playwright spec 执行验证通过的 `--validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"` 会被判定为完成；`--decision changes_requested` 也必须带具体 `--notes`，会被识别为有效修改反馈并要求继续迭代。

`pnpm user:handoff` 生成 `docs/acceptance/user-acceptance-handoff.md`，把 goal audit、自动质量门禁、架构迁移状态、真实项目验收命令、通过/修改两条路径和人工确认边界集中成一个最终验收入口。默认输出会在写入后重算 goal audit 摘要，并同步刷新 `docs/acceptance/goal-completion-audit.md`，避免旧交接包或旧审计文件导致一次性失败。`pnpm user:handoff -- --repo <real-web-app-repo>` 会把交接包中的验收命令渲染成可直接复制执行的真实 repo 命令，并显示 repo root / `package.json` 前置检查结果；`pnpm user:handoff -- --mode cli --repo <python-cli-repo>` 会显示 repo root / `pyproject.toml` 前置检查，并渲染 CLI mode 的 `user:accept --mode cli` 命令。若必需前置检查失败，命令仍会写出交接包并返回非零退出码，交接包不会展示带失败 repo 的 `pnpm user:accept` 命令，只提示先修复 repo 路径或对应 manifest 后重新生成交接包；前置检查通过时，交接包中的 `accepted` 和 `changes_requested` 命令都会使用可被 CLI 接受的具体备注。`pnpm user:handoff -- --help` 会输出参数说明；`--output <path>` 可写入自定义交接包路径。该交接包只帮助用户验收，不能由自动脚本代替用户确认。

`pnpm user:accept -- --help` 和 `pnpm user:accept -- -h` 会输出真实项目验收参数说明。`pnpm user:accept` 用于真实项目验收：先校验 `--repo` 是已存在的目录且包含文件型 `package.json`，再运行 hardening flow，检查关键 artifacts，并生成 `docs/acceptance/user-acceptance-record.md`。如果 repo 路径缺失、不是目录、缺少 `package.json`，或 hardening flow 发生非预期异常，会写入结构化失败记录且不会创建目标 repo 目录；摘要路径、异常摘要、artifact 检查证据和用户备注会先经过敏感信息脱敏。用户可用 `--decision pending` 保持待确认，用 `--validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"` 写入通过结论，或用 `--decision changes_requested --notes "补齐登录态探索并降低误报"` 写入继续迭代输入。

`--validate-generated-tests` 会执行生成的 Playwright spec。未传 `--url` 时，`user:accept` 会让自动启动的 app 保持运行直到验证结束；如果目标应用已经由用户或 CI 启动，也可以传入 `--url <running-url>` 复用现有服务。复杂真实项目可用 `--generated-test-timeout-ms <ms>` 调整 generated spec 验证超时，默认 120000ms。

Python/CLI mode 的 accepted 记录仍要求具体 `--notes`，但不要求 `--validate-generated-tests`；其完成证据来自 `pyproject.toml` preflight、Python/CLI profile、CLI smoke/static/test check execution results、report、manifest、repair plan 和 repair task package。

在允许启动本地 server 和 Chromium 的环境中，可运行完整浏览器验收：

```bash
HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts
```

运行 5 个本地 benchmark repo，并生成 `docs/logs/spike-results.md`：

```bash
pnpm build
pnpm benchmark
```

Benchmark 会对每个 repo 执行完整 `run --browser`，并重启 fixture app 验证生成的 Playwright spec 可执行；benchmark runner 的进程级 fatal stderr 写入前会脱敏。

## 主要产物

- `.hardening/latest/manifest.json`
- `.hardening/runs/<run-id>/hardening-report.md`
- `.hardening/runs/<run-id>/repo-profile.json`
- `.hardening/runs/<run-id>/boot-result.json`
- `.hardening/runs/<run-id>/findings.json`
- `.hardening/runs/<run-id>/test-generation.json`
- `.hardening/runs/<run-id>/repair-plan.json`
- `.hardening/runs/<run-id>/repair-plan.md`
- `.hardening/runs/<run-id>/target-repo-feedback-summary.json`
- `.hardening/runs/<run-id>/ai-ide-handoff-package.json`
- `.hardening/runs/<run-id>/user-validation-evidence-loop.json`
- `.hardening/runs/<run-id>/repair-handoff-package.json`
- `.hardening/runs/<run-id>/repair-handoff-package.md`
- `.hardening/runs/<run-id>/verification-plan.md`
- `.hardening/runs/<run-id>/repair-execution-report.json`
- `.hardening/runs/<run-id>/repair-execution-report.md`
- `.hardening/runs/<run-id>/patch-plan.json`
- `.hardening/runs/<run-id>/patch-plan.md`
- `.hardening/runs/<run-id>/patch.diff`
- `.hardening/runs/<run-id>/artifacts/*`
- `.hardening/runs/<run-id>/generated-tests/*`
- `.hardening/run/repo-profile.json`
- `.hardening/run/boot-result.json`
- `.hardening/run/findings.json`
- `.hardening/run/test-generation.json`
- `.hardening/run/repair-plan.json`
- `.hardening/run/repair-plan.md`
- `.hardening/run/patch.diff`
- `.hardening/artifacts/*`
- `hardening-report.md`
- `tests/hardening/*.spec.ts`
- `docs/acceptance/acceptance-run.md`
- `docs/acceptance/goal-completion-audit.md`
- `docs/acceptance/user-acceptance-handoff.md`
- `docs/acceptance/user-acceptance-record.md`
- `docs/testing/samples/sample-hardening-report.md`

AI IDE / Agent 应优先读取 `.hardening/latest/manifest.json`，再按 `files.repairPlan`、`files.findings`、`files.report`、`files.generatedTests` 和 `files.artifacts` 消费物料。`repair-plan.json` 是 v0.2 的首选修复任务入口；`repair-handoff-package.json` 和 `verification-plan.md` 是从 run bundle 汇总后的执行交接入口；`repair-execution-report.json` 是 dry-run 或 validation-only 后的执行证据；`patch-plan.json` 是失败验证转成可审查补丁动作后的计划入口；`legacyPaths` 保留原有落盘路径，便于人工查看和兼容已有脚本。

多 repo 场景可使用 `--workspace-output <dir>` 或 MCP `workspaceOutputDir` 把多个 repo 汇总到同一个中央目录：

```text
.hardening-workspace/
  manifest.json
  repos/
    <repo-slug>/
      latest -> runs/<run-id>
      runs/
        <run-id>/
          manifest.json
          hardening-report.md
          repair-plan.json
          repair-plan.md
          findings.json
          generated-tests/
          artifacts/
```

中央 `manifest.json` 列出每个 repo 的 `repoSlug`、`repoRoot`、`latestRunId`、`latestRunDir` 和 `latestManifest`。

`patch.diff` 当前包含 remediation plan 和已生成回归测试的新增文件 diff，不会自动修改业务代码；写入前会统一脱敏敏感值。

## 项目文档

- `docs/product/specs/mvp-spec-v0.1.md`
- `docs/product/specs/mvp-spec-v0.2.md`
- `docs/product/research/competitive-landscape-v0.1.md`
- `docs/product/strategy/commercialization-strategy-v0.1.md`
- `docs/product/strategy/public-release-checklist-v0.1.md`
- `docs/product/strategy/open-core-packaging-spec-v0.1.md`
- `docs/goals/codex-goal.md`
- `docs/architecture/overview.md`
- `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md`
- `docs/acceptance/guides/user-acceptance-guide.md`
- `docs/testing/strategy/test-strategy-v0.1.md`
- `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- `docs/acceptance/acceptance-run.md`
- `docs/acceptance/goal-completion-audit.md`
- `docs/acceptance/user-acceptance-record.md`
- `docs/testing/samples/sample-hardening-report.md`
- `docs/logs/spike-results.md`
- `docs/logs/dev-log.md`
- `docs/logs/blockers.md`
- `docs/logs/decision-log.md`
- `docs/goals/completed/2026-06-20-structure-refactor.md`
- `docs/goals/completed/2026-06-20-repair-plan-v0.2.md`
## AI IDE Repair Execution Replay Readiness v0.1

After generating the AI IDE repair evidence consumer contract, maintainers can generate a replay readiness report:

```bash
pnpm playbook:replay -- --from-dir <dir>
```

This writes `ai-ide-repair-execution-replay-readiness.json` and `ai-ide-repair-execution-replay-readiness.md`. The report confirms artifact replay, verification replay, boundary replay, and the next maintainer review decision. It is readiness evidence only and does not authorize target repo mutation, publication, launch, customer contact, or commercial availability claims.

## AI IDE Repair Replay Real Campaign Validation v0.1

The near-real campaign fixture now validates the full local chain: campaign summary -> playbook -> consumption report -> decision package -> approval receipt -> approved execution plan -> execution evidence -> bundle -> contract -> replay readiness -> proposal package -> authorization receipt.

This proves `playbook:bundle`, `playbook:contract`, and `playbook:replay` work together before any separate target repo repair goal. The validation remains local-first readiness evidence only; it does not authorize target repo mutation, release, launch, customer contact, or commercial availability claims.
