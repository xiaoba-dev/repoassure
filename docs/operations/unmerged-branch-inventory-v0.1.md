# Unmerged Branch Inventory v0.1

生成日期：2026-08-29
基线：`origin/main` = `6600022`（含 #70–#78）

## 这份文档为什么存在

`design-system-v2` 是四簇产品工作与一批治理轨迹的**唯一载体**，落后 `main` 81 个提交且还在增加。
分支是这类东西的坏容器：它会腐烂、搜不到、合并成本每周上升，而且一旦有人认为「太旧了删掉吧」，
连同「这些是什么、为什么没切」的判断一起消失——那些判断是一轮跨厂商对抗辩论加一次逐簇分拣才得出的。

这份清单把那些判断从分支搬进仓库，使删除分支变成可逆操作。

分支已于 2026-08-30 删除，代码本身归档在 [`archive/branches/`](../../archive/branches/)。恢复方法见该目录的 README；
但多数时候需要的是本文档记录的判断，不是那些代码。

**已合并的分支不在此列。** 它们的内容在 `main` 上，理由在 ADR 与 decision log 里，
分支名到 PR 的映射由 GitHub 永久保留（已验证：#74–#78 的分支已从远端删除，PR 仍带 `headRefName`）。
为它们再写文档只会加重本仓库最重的那一部分，且没有可归因的失败。

## 已落地的部分

`design-system-v2` 上体量最大的工作**已经在 `main` 上**，逐字节一致：

| 内容 | 状态 |
| --- | --- |
| `packages/design-system`（90 个文件） | 与 `main` 完全一致 |
| `apps/website` | 唯一差异是未跟踪的 `env.d.ts` |
| repair 工作流 CLI + MCP（3 个工具） | #75 / ADR-0043 |
| project intelligence watch | #77，已切断 agent-context 与 `.autopilot` 耦合 |
| security provider 发现与结构化导入错误 | #78 / ADR-0045 |
| design-system CSS type smoke | #74 |

## 未落地的部分

> 2026-08-30 补记：本节原有四条，遗漏了 conditional dead control（见下）。
> 遗漏原因可归因：初次盘点以未跟踪文件为线索（归档提交记录「76 个文件中 75 个未跟踪」），
> 而该簇是对两个**已跟踪**文件的修改，落在那条线索之外。
> 复核方法：以 `git diff --name-status <archive-tag> origin/main` 全量比对文件集，
> 再对每个差异文件用标识符在 `main` 上做绝对存在性检查，不要只盘点未跟踪文件。


### B — false-positive 回归目录与检测器校准契约

实现 2287 行 / 5 模块，测试 903 行 / 5 文件。

给每条 finding 建立台账：期望判定（`true_positive` / `false_positive_candidate` /
`needs_maintainer_review`）、风险等级、维护者裁决（`approve` / `defer` / `accept_risk` /
`revise_fixture`）。校准契约的 `proposedAction` 只有 `'review_only'` 一个取值。

契约边界写死在类型里：`findingSuppression: false`、`runtimeDetectionBehaviorChange: false`、
`automaticSeverityDowngrade: false`。**它不改变检测行为，不压制任何发现，只让误报可追踪。**

未切原因：找不到「现状哪次失败能归因于缺它」。这是产品优先级判断，不是技术判断。

**推翻条件**：误报已经多到需要一份可追踪的账。

### C — workspace repair summary

实现 1271 行 / 2 模块，测试 1614 行 / 4 文件。schema `repoassure.workspace-repair-summary.v1`。

读 `--workspace-output`（`main` 上已有）产出的 workspace manifest，把多个仓库的修复状态汇总为
`ready` / `no_tasks` / `stale` / `missing_artifacts` / `invalid_artifacts` / `identity_collision`，
整体状态 `ready` / `partial` / `blocked` / `empty`，任务按 P0–P2 分级。

测试多于实现，说明自带完整回归防护，切起来风险低。未切原因同 B：没有失败归因。

**推翻条件**：日常确实一次扫多个仓库。一次一个的话这张表永远只有一行。

### F 剩余 — agent-context 与 watch-handoff

实现 1113 行 / 2 模块，测试 1068 行 / 5 文件。schema
`repoassure.project-intelligence-agent-context@1`。

`watch` 已由 #77 单独落地。留下的两个建议**随分支归档**：`agent-context` 的
`currentGoal` / `recommendedNextGoals` / `blockers` 全部读自 `.autopilot/progress/snapshot.json`
与 `.autopilot/goals/*.json`，那是 autopilot 的目标模型；#73 之后干净检出没有该目录，
它只会输出 `unknown`。`watch-handoff` 的作用是把这两者打包。

**推翻条件**：重新采用 autopilot 目标模型。

### evidence-package — 第 4 个 repair 工具

实现 695 行 / 2 模块，测试 911 行 / 3 文件。schema `repoassure.repair-evidence-package.v1`。

`assemble_repair_evidence_package` MCP 工具与 `run-repair-evidence-package` runner。
未随 #75 落地的**唯一原因**是它需要三个 runner 输出上的新字段
（`repairActionQueue` / `maintainerReview` / `verificationChecklist`），即三份已发布契约的
schema 演进；并且 `run-repair-handoff.ts` 两侧独立演进过——`main` 在 `d61bb21` 加了
`actionability`，分支加了上述三个字段，互不包含，需要真正的三方合并。

同一簇还带着两个分发验证测试（`packed-mcp-server-protocol.test.ts` 与
`installed-cli-repair-real-campaign.test.ts`，共 703 行），它们断言 4 个工具与新字段，
因此也无法脱离这次 schema 演进单独落地。

**推翻条件**：决定演进这三份契约。届时这是一个独立 goal，不是某个入口改动的副作用。

### conditional dead control — 表单前置条件感知的假阳性豁免

实现 593 行、测试 1027 行，落在 `packages/browser-explorer` 的 playwright driver 与其单测上；
另有合成 fixture 3 个文件（`tests/fixtures/conditional-dead-control-synthetic/` 与其专项测试），
以及 42 个文件的治理轨迹（14 个 `.autopilot` goal、24 份 authorization intake / maintainer
decision record / completion audit 文档）。

点击一个初始 `disabled` 的提交按钮不会产生可观察变化，现状会把它记为 P1 `dead_control`。
这一簇先观察该控件是否存在「安全的脏态转换」（填入安全字段后是否变为 enabled），据此归类为
`false_positive_candidate` / `actionable_conditional_dead_control` / `needs_maintainer_review`，
并把判定依据写进 evidence（`conditional_dead_control.prerequisite.*`、`.classification`、
`.fail_closed_reason`）。无法安全判定时 fail closed，不做豁免。

未切原因：找不到「现状哪次失败能归因于缺它」。dead control 假阳性目前有失败归因的是**自指链接**
那一类（品牌 logo 链到当前页、`href="#"`），已由 #64 以 `no_op_self_target` 落地；
「初始禁用的提交按钮」这一子类尚无实测案例。这与 B / C 是同一条判据，不是技术判断。

**推翻条件**：出现一次实测的、由初始禁用控件造成的假 P1。届时先确认 #64 的自指豁免没有覆盖它。

### 其余散件

全量比对后剩下 7 个文件，不构成独立簇，随分支归档：

| 文件 | 归属 | 处置理由 |
| --- | --- | --- |
| `run-autopilot-progress-consistency.ts` 及其 2 个测试（679 行） | autopilot 目标模型 | 与 F 剩余同因：#73 后干净检出没有 `.autopilot`，读不到输入 |
| `project-intelligence-watch-{e2e-fixture,recovery-ux-smoke,operator-playbook}.test.ts`（606 行） | #77 已落地的 watch | 主体在 `main`，这是未随之落地的额外覆盖；需要时可单独补测，不必从分支取 |
| `adr-cascade-controlled-remediation.test.ts`（139 行） | #69 已落地的 ADR cascade | 同上 |

## 合并前必须处理的两点

### ADR 编号撞号

`design-system-v2` 的 ADR-0024 是 `ai-ide-repair-workflow-mcp-convergence`，
而 `main` 的 ADR-0024 是 `autopilot-compatible-documentation-architecture`。
任何带 ADR 的切片都必须重编号。`main` 自身另有两个 0022 与两个 0023 重号，属既有问题。

### `.gitignore` 挡不住已跟踪文件

#73 把 `.autopilot/` 写进了 `.gitignore`，但 gitignore 不管已跟踪文件：

```
design-system-v2 上的 .autopilot
  已跟踪  29   ← 会随整分支合并进入 main
  未跟踪  92   ← 会被挡住
```

那 29 个是在 `d2ad1a1` 与 `22f65f3` 里被显式提交的。**逐簇挑文件切片不会碰到它们；
只有整分支合并才会踩这个坑。**

## 切片方法：两条付出过代价的教训

**依赖闭包要查到字段级。** 只核验 `import` 能否解析是不够的——#75 的准备阶段据此判断
「六簇彼此独立」，实际编译时才暴露 `TS2339: Property 'repairActionQueue' does not exist`。
模块在，字段不在。同源错误还有「看截断输出当全貌」：`git diff --stat | tail` 让 #78 的准备
漏掉了整个 `packages/repair-planner/` 的改动，应使用 `--name-status | sort` 不截断。

**判断内容是否已落地，不要跟移动的靶子比。** squash 合并会改变哈希，因此 `git cherry`、
「分支文件 vs `main` 当前文件」、「patch 反向套用到 `main`」三种方法都会给出假阳性——
`main` 之后对同一文件的任何改动都会让已落地的分支显示为未落地。可靠来源是 GitHub 的 PR 状态。

## 分支处置

| 分支 | 处置 |
| --- | --- |
| PR 已合并的 104 个 ref | 可删；内容在 `main`，映射由 GitHub 保留 |
| `codex/security-provider-*`（2 个 ref，同一提交 `7db3a18`） | 可删；PR #62 已关闭，内容由 #78 重切落地 |
| `codex/backup-main-before-pr1-sync-20260625` | 备份快照，落后 129；reflog 与 GitHub 已覆盖 |
| 4 个零提交领先的无 PR 分支 | 可删 |
| `design-system-v2` | **已于 2026-08-30 删除**；内容双份归档，顶端 `f73065c`：bundle 见 [`archive/branches/`](../../archive/branches/)，tag `archive/design-system-v2-2026-08-29` 已推送至远端。两者都不要单独删除 |

## 边界

本文档只记录现状与判断，不改变产品行为、artifact schema 或对外接口，
不授权 npm publication、GitHub release、public launch、production marketing announcement、
customer contact、pricing/spend、repository visibility change 或
SaaS/Team Cloud/Enterprise/hosted availability claims。
