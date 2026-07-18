# 决策日志

## 2026年7月19日 - Public marketing site reachability boundary

### 决策

接受 ADR-0023：营销站点可以在产品公开发布门禁关闭之前公开可达且允许搜索索引。取代 ADR-0020 与 ADR-0021 中的公开自定义域名禁令，两份记录的其余条款全部继续有效。

真正的边界从「谁能访问」移到「页面上声明什么」：全部对外文案必须留在 `apps/website/src/i18n.ts` 以保持 CI 护栏覆盖；不得声称任何未交付能力可用；不得展示客户 logo、分析师徽章、案例、star 数或认证；不得把物料描述为 signed；私密预览保持仅限邀请。

### 原因

- owner 确认 `repoassure.com` 为其注册所有。所有权从来不是争点——两条禁令约束的是**绑定时机相对于发布门禁**，而非注册归属。
- 那两份 ADR 落笔时，防止过早公开的唯一手段就是让站点不可达。如今官网已有 25 条 CI 强制的禁止虚假宣传正则，外加一条断言「护栏对历史文案确实触发、对新文案不误伤」的测试。可达性本来是给声明问题用的代理控制，而声明问题现在有了直接控制。
- 两份 Accepted 状态的 ADR 与可观测现实持续矛盾，本身有代价。Project Intelligence Console 正是为抓这类漂移而存在；放着不管等于教人 ADR 是装饰品。
- 一个营销站在产品正式发布前公开，是 pre-launch 产品的常规安排。

### 影响

- 新增 `docs/adr/0023-public-marketing-site-reachability-boundary.md`。
- ADR-0020 与 ADR-0021 增加 `Amended by` 标注与修订说明，**仅**域名条款被取代；merge / deployment / public launch 三道独立门禁、Vercel 暂停、私密预览 URL 分享前必须先配置访问控制，全部继续有效。
- `docs/PLAN.md` 的未决项从「域名冲突」更新为「部署与工作区不一致」。
- 继续禁止：public launch、production marketing announcement、repository visibility change、npm publication、GitHub release、deployment、SaaS / Team Cloud / Enterprise / hosted dashboard 可用性声明、customer contact、pricing/spend change、恢复 Vercel Git integration。
- branch protection 门禁仍为 defer，继续阻断 public release；ADR-0012「不得为解锁 branch protection 而公开仓库」继续有效。
- 已记录的新风险：移除可达性控制后，未来的过度声明会直接抵达公众。护栏只覆盖它编码的模式——完整性声明正是因为无模式覆盖才在公网挂了数周。

## 2026年7月18日 - RepoAssure Design System v2 unfreeze and information architecture decision

### 决策

接受 RepoAssure Design System v2 Unfreeze v0.1，并记录 ADR-0022：owner 已提供定稿的 RepoAssure Design System v2，`owner_finalizes_claude_design` 条件满足，释放 `deferred_design_pending` 设计队列，授权 `website_visual_redesign`。

采纳设计系统 v2 作为官网与 Project Intelligence Console 两个界面的统一设计源，并在其基础上做两项偏离：浅色为默认主题（深色 opt-in、证据区用常暗 console 表面），品牌字体自托管而不引用字体 CDN。

官网信息架构按 ADR-0013 记录的四问重组（能否交付 / 什么证据 / 还卡着什么 / 下一个 AI IDE 先修什么），并把交付流程与交付角色拆成独立区块。Console 从「异常上报」改为「状态与信心上报」。

实现 artifact 内容哈希与校验命令，同时把 signed / cryptographically verifiable 措辞改为 content-hashed / 完整性可独立验证。官网演示数据改用真实基准跑分产出。

执行顺序为四个 goal：design system adoption、evidence integrity hashing、website design integration、console redesign。`project-intelligence-adr-cascade-remediation-closure-v0.1` 未启动，重新排队至 console 重构之后。

### 原因

- 全量文档与实现扫描发现四个问题使单纯换 token 不足以解决：ADR-0013 四问定位在官网完全缺席；`#how-it-works` 把流程与角色混在一个区块；官网宣称的 signed / cryptographically verifiable 在代码中无任何实现，产出的 manifest 不含 hash、signature、checksum 或 digest 字段，且现有 forbidden-claim 护栏未覆盖该声明；Hero 的「214 issues」与真实跑分（1–3 findings）不符。
- Console 在项目健康时 findings 为 0，当前设计使其在最该证明价值时变成空页；其 code graph 中 2502 个节点有 2149 个（85.9%）是 vendored 依赖文件，占满 80 条显示窗口并掩盖全部 357 条测试关系边。
- ADR-0019 明确要求「必须由单独的实现 goal 对照设计系统重构 `apps/website`」，本决策即该 goal 的授权来源。
- 设计系统自带的字体 CDN 引用与本地优先主张冲突，且 Project Intelligence Console 测试禁止生成产物出现任何 http:// 或 https:// 引用。

### 影响

- 新增 `docs/adr/0022-repoassure-design-system-v2-and-information-architecture.md`，ADR-0019 标记为 Superseded。
- 新增 `docs/operations/repoassure-design-system-v2-unfreeze-v0.1.md`，`docs/operations/public-website-design-work-deferred-v0.1.md` 标记为 superseded 并保留为时点记录。
- 新增四个 goal：`repoassure-design-system-v2-adoption-v0.1`（active）、`repoassure-evidence-integrity-hashing-v0.1`、`public-website-claude-design-integration-and-qa-v0.1`（released from deferral）、`project-intelligence-console-redesign-v0.1`。
- `public-website-owner-visual-acceptance-p3-follow-up-triage-v0.1` 标记为 superseded，其 P3 triage 项并入本次重构。
- `.autopilot/goals/index.json` 与 `.autopilot/progress/` 状态更新；`website_visual_redesign` 从 blocked actions 移除，新增 `public_custom_domain_decision` 为 blocked。
- 治理状态测试同步重设基线：`tests/unit/project-structure.test.ts` 与 `tests/unit/adr-cascade-controlled-remediation.test.ts`。
- Deployment、public launch、production marketing announcement、repository visibility change、npm publication、GitHub release、public custom domain decision、hosted dashboard、cloud sync、telemetry、locale expansion、product artifact localization、target repo writes、pricing/spend change 和 customer contact 继续禁止。
- 线上 `repoassure.com` 与 ADR-0020 / ADR-0021 的公开自定义域名禁令冲突，本决策不解决、不追认、不取代该冲突，需单独的 owner 决策记录。

## 2026年7月18日 - Project Intelligence ADR cascade controlled remediation execution completed

### 决策

接受 Project Intelligence ADR Cascade Controlled Remediation Execution v0.1：在用户明确授权后，按受控 remediation plan 对 11 个 ADR missing_cascade items 执行文档级联修复，并选择 Project Intelligence ADR Cascade Remediation Closure v0.1 作为下一个 freshness closure goal。

### 原因

- 11 条 maintainer decision 已记录为 `repair`，且 controlled remediation plan 已明确目标文件、回滚边界和验证清单。
- 直接补齐 ADR `Cascade Evidence` 可以让 Project Intelligence docs graph 更清楚地追踪 ADR -> PRD/SPEC/PLAN/testing/acceptance/log/architecture 的关系。
- Closure 应单独执行，以便重新生成 freshness/backlog 证据并审计 residual findings。

### 影响

- 11 个 ADR 新增 `Cascade Evidence`。
- 新增 `docs/operations/project-intelligence-adr-cascade-controlled-remediation-execution-v0.1.md`。
- 新增 `tests/unit/adr-cascade-controlled-remediation.test.ts`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-remediation-closure-v0.1`。
- Hosted dashboard、cloud sync、telemetry、deployment、public launch、repository visibility change、npm publication、GitHub release、customer contact、pricing/spend change、target repo writes 和 website visual redesign 继续禁止。

## 2026年7月18日 - Project Intelligence ADR cascade controlled remediation plan completed

### 决策

接受 Project Intelligence ADR Cascade Controlled Remediation Plan v0.1：从 11 条 maintainer repair decisions 生成本地 Markdown/JSON 受控修复计划，并选择 `Project Intelligence ADR Cascade Controlled Remediation Execution v0.1` 作为下一步但保持执行待授权。

### 原因

- Repair decision 需要先转成具体 file-level plan，才能降低直接改写 ADR/spec/docs 的风险。
- Plan 应明确每条 item 的目标文件、执行顺序、回滚说明和验证清单。
- Controlled remediation plan 是 planning evidence，不等于授权执行 repair。

### 影响

- 新增 `pnpm project:intelligence:controlled-remediation-plan`。
- 新增 ignored artifacts `artifacts/project-graph/adr-cascade-controlled-remediation-plan.md` 和 `.json`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-controlled-remediation-execution-v0.1`，状态为 `pending_authorization`。
- Automatic ADR/spec/docs edits、repair execution、hosted dashboard、cloud sync、telemetry、deployment、public launch、repository visibility change、npm publication、target repo writes 和 website visual redesign 继续禁止，直到单独授权 remediation execution。

## 2026年7月18日 - Project Intelligence ADR cascade maintainer decisions recorded

### 决策

接受 Project Intelligence ADR Cascade Maintainer Decision Recording v0.1：基于 owner 在 Codex 对话中的明确授权，将 11 条 recommendation draft items 的最终 maintainer decision 记录为 `repair`，并选择 `Project Intelligence ADR Cascade Controlled Remediation Plan v0.1` 作为下一个执行 goal。

### 原因

- Recommendation draft 只提供建议，不等于最终 maintainer decision。
- Owner 已授权执行决策记录，因此可以把 11 条 recommended repair items 转成显式 maintainer repair decisions。
- Repair decision 只说明“同意进入修复规划”，不等于授权立即改写 ADR/spec/docs/source。

### 影响

- 新增 `pnpm project:intelligence:maintainer-decision`。
- 新增 ignored artifacts `artifacts/project-graph/adr-cascade-maintainer-decision-record.md` 和 `.json`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-controlled-remediation-plan-v0.1`，状态为 `ready_to_execute`。
- Automatic ADR/spec/docs edits、repair execution、hosted dashboard、cloud sync、telemetry、deployment、public launch、repository visibility change、npm publication、target repo writes 和 website visual redesign 继续禁止。

## 2026年7月17日 - Project Intelligence ADR cascade recommendation draft completed

### 决策

接受 Project Intelligence ADR Cascade Remediation Recommendation Draft v0.1：将 11 个 pending decision intake items 转成 maintainer-reviewable Markdown/JSON recommendation draft，并选择 `Project Intelligence ADR Cascade Maintainer Decision Recording v0.1` 作为下一个 owner-decision goal。

### 原因

- Maintainer 需要先看到每条 item 的建议、理由、风险和 follow-up，再决定 approve / defer / accept-risk / repair。
- Recommendation draft 是 advisory evidence，不等于最终 maintainer decision。
- 在没有逐项 maintainer confirmation 前，不应自动修复 ADR、不应改写 spec/docs/tests/logs/source。

### 影响

- 新增 `pnpm project:intelligence:recommendation-draft`。
- 新增 ignored artifacts `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.md` 和 `.json`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-maintainer-decision-recording-v0.1`，状态为 `pending_confirmation`。
- Hosted dashboard、cloud sync、telemetry、deployment、public launch、repository visibility change、npm publication、target repo writes 和 website visual redesign 继续禁止。

## 2026年7月17日 - Project Intelligence ADR cascade decision intake completed

### 决策

接受 Project Intelligence ADR Cascade Remediation Decision Intake v0.1：将 11 个 ADR cascade backlog items 转成 maintainer-reviewable Markdown/JSON decision intake，并选择 `Project Intelligence ADR Cascade Remediation Recommendation Draft v0.1` 作为下一个执行 goal。

### 原因

- Backlog 仍不是 maintainer decision，需要独立的 decision intake surface。
- Decision intake 必须保留 approve / defer / accept-risk / repair 选项，但不能预填最终决策。
- 在推荐决策草案或 repair 之前，系统应先提供可审阅、可追踪、可脱敏的决策槽。

### 影响

- 新增 `pnpm project:intelligence:decision-intake`。
- 新增 ignored artifacts `artifacts/project-graph/adr-cascade-remediation-decision-intake.md` 和 `.json`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-remediation-recommendation-draft-v0.1`。
- 后续执行仍必须保持 no automatic ADR repair、no automatic doc rewrite、no hosted dashboard、no cloud sync、no telemetry、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月17日 - Project Intelligence ADR cascade backlog completed

### 决策

接受 Project Intelligence ADR Cascade Remediation Backlog v0.1：将 11 个 `missing_cascade` findings 转成 maintainer-reviewable backlog，并选择 `Project Intelligence ADR Cascade Remediation Decision Intake v0.1` 作为下一个执行 goal。

### 原因

- `missing_cascade` findings 不能直接等同于授权修改 ADR/spec/docs。
- Backlog 让 maintainer 能逐项选择 approve / defer / accept-risk / repair。
- 在决策录入前，系统只生成 review artifact，不自动改文档。

### 影响

- 新增 `pnpm project:intelligence:backlog`。
- 新增 ignored artifact `artifacts/project-graph/adr-cascade-remediation-backlog.md`。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-remediation-decision-intake-v0.1`。
- 后续执行仍必须保持 no automatic doc rewrite、no hosted dashboard、no cloud sync、no telemetry、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月17日 - Project Intelligence graph freshness checks completed

### 决策

接受 Project Intelligence Console Graph Freshness and Staleness Checks v0.1：snapshot 与 viewer 均展示 freshness/staleness findings，并选择 `Project Intelligence ADR Cascade Remediation Backlog v0.1` 作为下一个执行 goal。

### 原因

- Graph 只展示关系还不够，需要主动指出文档级联、代码所有权、测试链接和进展状态的不一致。
- 当前真实工作区发现 11 个 medium `missing_cascade`，说明下一步应整理可执行 backlog。
- Findings 只作为 local readiness evidence，不应自动修改文档或目标 repo。

### 影响

- `project-intelligence-snapshot.json` 新增 `summary.findings` 和 `findings`。
- `project-intelligence-viewer.html` 新增 Freshness and Staleness Findings 区块。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-adr-cascade-remediation-backlog-v0.1`。
- 后续执行仍必须保持 no hosted dashboard、no cloud sync、no telemetry、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月17日 - Project Intelligence local static viewer completed

### 决策

接受 Project Intelligence Console Local Static Viewer v0.1：用 local-only runner 将 `project-intelligence-snapshot.json` 渲染为 `project-intelligence-viewer.html`，并选择 `Project Intelligence Console Graph Freshness and Staleness Checks v0.1` 作为下一个执行 goal。

### 原因

- Maintainer 和 AI IDE 需要比 JSON/Markdown 更直观的本地查看入口。
- Viewer 仍在 ignored `artifacts/project-graph/` 边界内，不会把 graph console 提前变成 hosted dashboard。
- 完成 viewer 后，下一步最有价值的是让 graph 能主动发现过期、缺失和不一致，而不是继续扩展 UI。

### 影响

- 新增 `pnpm project:intelligence:view`。
- 新增 `project-intelligence-viewer.html` 本地输出。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-console-graph-freshness-and-staleness-checks-v0.1`。
- 后续执行仍必须保持 no hosted dashboard、no cloud sync、no telemetry、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月17日 - Project Intelligence graph snapshot generator completed

### 决策

接受 Project Intelligence Console Graph Snapshot Generator v0.1：用 local-only runner 生成 docsGraph、codeGraph 和 progressGraph 快照，并选择 `Project Intelligence Console Local Static Viewer v0.1` 作为下一个执行 goal。

### 原因

- 当前 docs、code、tests、logs 和 `.autopilot` 状态已经足够复杂，需要机器可读 graph snapshot 帮助 maintainer 和 AI IDE 理解项目全貌。
- `artifacts/project-graph/` 是 ignored artifact 边界，适合保存本地快照而不污染 source surface。
- 先生成 JSON/Markdown 快照，再做 local static viewer，可以保持 TDD 和本地优先边界。

### 影响

- 新增 `pnpm project:intelligence`。
- 新增 `project-intelligence-snapshot.json` / `.md` 本地输出。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-console-local-static-viewer-v0.1`。
- 后续执行仍必须保持 no hosted dashboard、no cloud sync、no telemetry、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - AI IDE repair end-to-end evidence package completed

### 决策

接受 AI IDE Repair End-to-End Evidence Package Validation v0.1：将 repair handoff、dry-run execution report、validation-only execution report、patch plan 和 no-write proof 聚合成 AI IDE / maintainer 可统一读取的 evidence package，并选择 `Project Intelligence Console Graph Snapshot Generator v0.1` 作为下一个执行 goal。

### 原因

- 前几轮已分别验证 handoff、dry-run、validation-only 和 patch plan，但 AI IDE 仍需要一个稳定入口理解完整修复链路。
- `artifactIndex`、`repairFlow` 和 `taskMatrix` 可以把分散物料变成可审阅的决策包。
- no-write proof 必须跨 dry-run、validation-only 和 patch plan 汇总，避免把“可修复建议”误解为“已获授权自动改代码”。

### 影响

- `AI IDE Repair End-to-End Evidence Package Validation v0.1` 记录为 `completed`。
- 新增 `pnpm repair:evidence-package` 作为本地 evidence aggregation 入口。
- `.autopilot/goals/index.json` active goal 更新为 `project-intelligence-console-graph-snapshot-generator-v0.1`。
- 后续执行仍必须保持 no automatic target repo write、no hosted dashboard、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - AI IDE repair execution dry-run validation completed

### 决策

接受 AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1：用近真实 campaign fixture 验证 `repair:execute --dry-run` 可消费 repair decision package，并选择 `AI IDE Repair Patch Plan Real Campaign Validation v0.1` 作为下一个执行 goal。

### 原因

- 上一轮 real campaign validation 证明了 repair decision package 可被 AI IDE 读取；本轮进一步证明 dry-run execution report 可被稳定生成。
- 新报告显式包含 `executionPlan`、`patchPreview`、`maintainerReview`、`verificationChecklist` 和 `noWriteProof`。
- dry-run 只生成执行报告，不应用补丁、不修改目标 repo、不创建 branch/commit/PR，也不标记 acceptance passed。

### 影响

- `AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1` 记录为 `completed`。
- `.autopilot/goals/index.json` active goal 更新为 `ai-ide-repair-patch-plan-real-campaign-validation-v0.1`。
- 后续执行仍必须保持 no automatic target repo write、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - AI IDE repair decision package real campaign validation completed

### 决策

接受 AI IDE Repair Decision Package Real Campaign Validation v0.1：用近真实 campaign fixture 验证 hardened repair decision package 可被 AI IDE 稳定消费，并选择 `AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1` 作为下一个执行 goal。

### 原因

- 上一轮 contract hardening 证明了字段结构，但还需要真实/近真实 campaign artifact 验证 JSON、Markdown、verification plan、脱敏和 no-write 边界。
- `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json` 覆盖 failed command、maintainer acceptance failure、required environment blocker 和 sensitive evidence redaction。
- 下一步应验证 `repair:execute --dry-run` 是否能消费这些 queued tasks 并生成 execution report，而不是直接进入自动修复。

### 影响

- `AI IDE Repair Decision Package Real Campaign Validation v0.1` 记录为 `completed`。
- `.autopilot/goals/index.json` active goal 更新为 `ai-ide-repair-execution-dry-run-real-campaign-validation-v0.1`。
- 后续执行仍必须保持 no automatic target repo write、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - AI IDE repair decision package contract hardened

### 决策

接受 AI IDE Repair Decision Package Contract Hardening v0.1：repair decision package contract 已从“报告/任务包辅助材料”强化为 AI IDE 可确定消费的决策包合同，并选择 `AI IDE Repair Decision Package Real Campaign Validation v0.1` 作为下一个执行 goal。

### 原因

- AI IDE 和 coding agent 需要稳定字段、读取顺序和维护者边界，不能依赖自然语言报告自行猜测。
- `repairActionQueue`、`maintainerReview`、`verificationChecklist` 和 `redaction` 能把修复动作、验收步骤、人工决策边界和隐私保证分开表达。
- 下一步必须用真实或近真实 campaign artifacts 验证消费闭环，而不是只停留在 fixture contract。

### 影响

- `AI IDE Repair Decision Package Contract Hardening v0.1` 记录为 `completed`。
- `.autopilot/goals/index.json` active goal 更新为 `ai-ide-repair-decision-package-real-campaign-validation-v0.1`。
- 后续执行仍必须保持 no automatic target repo write、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - Product core queue resumed

### 决策

接受 Product Core Execution Resume v0.1：官网设计线暂缓后，产品核心队列恢复，并选择 `AI IDE Repair Decision Package Contract Hardening v0.1` 作为下一个具体可执行 goal。

### 原因

- PRD 将 AI IDE 用户定义为核心目标用户之一，他们需要可执行的修复决策包，而不是泛泛的审计报告。
- SPEC 已明确 CLI/MCP、artifact contracts、repair plans、acceptance records 和 local-first boundary 是当前系统边界。
- 设计系统和官网视觉重构暂缓后，继续推进 AI IDE handoff / repair decision package 是更直接的产品核心增量。

### 影响

- `RepoAssure Product Core Execution Resume v0.1` 记录为 `completed_selected_next_goal`。
- `.autopilot/goals/index.json` active goal 更新为 `ai-ide-repair-decision-package-contract-hardening-v0.1`。
- 后续执行仍必须保持 no automatic target repo write、no deployment、no public launch、no repository visibility change、no npm publication、no GitHub release、no customer contact、no pricing/spend change、no website visual redesign。

## 2026年7月16日 - Public Website design work deferred

### 决策

接受 Public Website Design Work Deferred v0.1：在 owner 提供并定稿 Claude Design 新方案前，暂缓官网设计系统、视觉重构、owner visual triage 和 Claude Design integration。

### 原因

- Owner 明确表示新的设计尚未敲定，希望跳过与 design system 相关的任务。
- 继续自动选择视觉任务会消耗时间并可能与即将到来的新设计方向冲突。
- P3 pixel QA 已完成首轮实现，可以保留为当前状态；后续视觉质量应等最终设计输入后统一处理。

### 影响

- `.autopilot/goals/index.json` 的 active goal 改为 `RepoAssure Product Core Execution Resume v0.1`。
- `Public Website Owner Visual Acceptance & P3 Follow-up Triage v0.1` 和 `Public Website Claude Design Integration & QA v0.1` 暂缓至 `owner_finalizes_claude_design`。
- 不授权 deployment、public launch、repository visibility change、npm publication、GitHub release、customer contact、pricing、spend changes 或 website visual redesign implementation。

## 2026年7月16日 - Public Website P3 owner visual gate

### 决策

接受 Public Website P3 Pixel QA & Mobile Responsive Polish v0.1 作为官网视觉质量的自动化修复 pass，但不把它自动等同于最终视觉验收。

### 原因

- P3 修复已经覆盖 owner 截图反馈中的移动端重叠、密度、图谱高度、Artifact/Trust Ledger 响应式和 CTA/footer 比例问题。
- 自动验证证明 build/typecheck/unit guard 通过，并且 390px 移动端 DOM metrics 无横向溢出。
- 当前环境无法稳定生成 Playwright/System Chrome 截图，仍需要 owner 直接查看运行页面确认主观视觉质量。

### 影响

- 下一步进入 `Public Website Owner Visual Acceptance & P3 Follow-up Triage v0.1`。
- 若 owner 接受，则刷新 website release-candidate evidence。
- 若仍有视觉问题，则按 fix / defer / accept risk 记录，不扩大到 public release 或 deployment。

## 2026年7月16日 - Brownfield Autopilot Initialization v0.1

### 决策

接受 Brownfield Autopilot Initialization v0.1，将 RepoAssure 初始化为 Autopilot-managed brownfield project。

### 原因

仓库已经有 CLI、MCP Server、public website、acceptance/test platform、release governance、ADR、operations records 和大量验收材料，但缺少统一的 canonical PRD / SPEC / DESIGN / PLAN entrypoints 与机器可读 progress / goal state。没有初始化时，每次选择下一个 Codex goal 都需要重新扫描分散文档，容易让 public release、website polish 和 core product execution 混在一起。

### 影响

- 新增 `docs/PRD.md`、`docs/SPEC.md`、`docs/DESIGN.md`、`docs/PLAN.md` 作为薄 canonical entrypoints。
- 新增 `docs/operations/brownfield-autopilot-intake-v0.1.md` 记录 brownfield intake、shape matrix 和 non-authorization boundary。
- 新增 `.autopilot/progress/` 与 `.autopilot/goals/` 的 sanitized runtime state。
- `.autopilot/runs/`、`.autopilot/cache/` 和 `.autopilot/secrets/` 作为 local-only / never-commit surfaces 加入 `.gitignore`。
- 下一执行目标设为 `Public Website P3 Pixel QA & Mobile Responsive Polish v0.1`。
- 本决策不授权 public release、deployment、repository visibility change、npm publication、GitHub release、public launch、customer contact、pricing 或 spend changes。

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

## 2026年7月16日 - AI IDE repair patch plan real campaign validation

### 决策

接受 AI IDE Repair Patch Plan Real Campaign Validation v0.1。`repair:patch-plan` 必须同时支持 validation-only failed command evidence 和 dry-run `patchPreview` inputs；dry-run 场景只能生成 maintainer-reviewable patch plan inputs，不得应用补丁或自动修改目标 repo。

### 原因

- AI IDE 需要的不只是错误列表，还需要明确的读取顺序、目标文件、验证命令和维护者审批边界。
- dry-run execution report 没有真实失败命令输出，若 patch-plan 只依赖 verification failures，会返回 `no_actions`，无法形成 AI IDE 可消费的修复输入。
- 自动 patch application 风险过高，必须保留 `manual-review-only` apply policy 和 `noWriteProof`。

### 影响

- `patch-plan.json` 现在包含 `patchPlanInputs`、`maintainerReview`、`verificationChecklist` 和 `noWriteProof`。
- `patch-plan.md` 现在显式展示 Patch Plan Inputs、Maintainer Review Boundary、Verification Checklist 和 No-write Proof。
- 下一个自动 goal 转为 AI IDE Repair Validation-Only Real Campaign Validation v0.1。

## 2026年7月16日 - AI IDE repair validation-only real campaign validation

### 决策

接受 AI IDE Repair Validation-Only Real Campaign Validation v0.1。`repair:execute --validation-only` 必须区分 passed、failed 和 skipped：可执行命令运行并记录结果，包含 `<repo>` 等占位符或需要人工环境上下文的命令不执行，记录为 skipped。

### 原因

- AI IDE 和 maintainer 需要知道哪些证据来自真实命令执行，哪些是人工/环境 gate，不能把 placeholder 命令错误执行后当作产品失败。
- validation-only 必须继续保持 no-write 边界，不得应用补丁或自动修改目标 repo。
- skipped evidence 能让下一步端到端 evidence package 明确区分 code repair、manual acceptance 和 environment blocker。

### 影响

- `repair-execution-report.json` 的 task status 支持 `skipped`。
- validation-only summary 可表达 passed / failed / skipped evidence。
- 下一个自动 goal 转为 AI IDE Repair End-to-End Evidence Package Validation v0.1。
