# Public Website UI/UX Roadmap v0.2

> **2026-07-19 更新：**§3 的冻结决策已由 [ADR-0022](../adr/0022-repoassure-design-system-v2-and-information-architecture.md) 部分解除。信息架构已按 ADR-0013 四问重组，交付流程与交付角色拆分为独立区块，浅色成为默认主题。导航仍为 5 项。其余冻结项继续有效。

| 字段 | 值 |
| --- | --- |
| **Status** | `ACTIVE` |
| **日期** | 2026-07-01 |
| **评审基线** | **58 / 100**（合格 MVP 偏上；sprint 后目标 ≥68） |
| **对标** | Linear（克制首屏、单焦点、产品 frame 稳定） |
| **实现** | `apps/website/` |
| **本地** | `pnpm dev:website` → http://127.0.0.1:5173/ |
| **设计系统** | [`design-system-v0.1.md`](design-system-v0.1.md) |
| **前置 QA** | 根目录 `design-qa.md`（2026-06-25 gate）— 本路线图不推翻 release guardrails |
| **取代** | [`website-uiux-baseline-temp-2026-07-01.md`](website-uiux-baseline-temp-2026-07-01.md)（已归档） |

---

## 1. 目的

本文件是 Public Website UI 提升 sprint（P0–P3）的**正式路线图与防漂移锚点**。P0–P2 已于 2026-07-01 全部完成；P3 mobile/pixel polish 已于 2026-07-16 完成首轮实现。后续改版应先对照 §4 冻结决策，再评估 §9 后续轮次。

当前后续设计队列为 `deferred_design_pending`：owner 已决定在 Claude Design 新方案定稿前，暂缓 Public Website Owner Visual Acceptance、设计系统重写、官网视觉重构和 Claude Design integration。自动目标选择应回到 product core execution，不应继续自动选择 website visual polish。

改 UI 时：

- 不要把已删的 **Trust Ledger 全表** 加回 Hero
- 不要让 **终端演示** 在 Hero 与 How it works 重复出现
- 不要为填空白加假 social proof / GitHub 链接
- 断点修一处时，应同时检查 961–1100px 与 `<960px` 视口

---

## 2. 当前实现快照（P0–P2 完成后）

### 页面结构（自上而下）

1. Header — **5** nav + 语言 + Private preview CTA
2. **Hero（深色）** — 文案 + `HeroConsole`（迷你侧栏 + Trust Ledger 标题 + **run 摘要**，非完整 CLI）
3. `hero-graph-breath` — Hero 与 Graph 之间的浅色呼吸带
4. **Assurance Graph（深色）** — SVG `AssuranceGraph`；`<960px` 显示 `graph-chain-fallback` 列表
5. **How it works（浅色）** — `CliDemo`（**唯一**完整 CLI 输出）+ 4 角色 step cards
6. **Proof artifacts（浅色）** — `ArtifactPreview` tabs（深色主预览面板 + mock 代码/JSON）
7. Open core + Roadmap — split section；Open core 含 `OpenCoreDiagram` 单色架构示意
8. Trust boundary — 3 张 trust cards（**无** Trust Ledger 全表）
9. Private preview 表单 + `designPartnerNote`（诚实说明，无假 logo 墙）
10. Footer — `site-footer-compact`

### 关键组件与样式

| 资产 | 路径 |
| --- | --- |
| 入口 | `apps/website/src/App.tsx` |
| Hero 控制台 | `apps/website/src/HeroConsole.tsx` |
| 图谱 | `apps/website/src/AssuranceGraph.tsx` |
| 物料预览 | `apps/website/src/ArtifactPreview.tsx` |
| CLI 区块 | `apps/website/src/CliDemo.tsx` |
| Open core 示意 | `apps/website/src/OpenCoreDiagram.tsx` |
| 文案 | `apps/website/src/i18n.ts` |
| Token | `apps/website/src/styles/tokens.css` |
| 证据视觉 | `apps/website/src/styles/evidence-system.css` |
| 响应式 | `apps/website/src/styles/responsive.css` |
| 主样式 | `apps/website/src/styles.css` |

### 验证

- `tests/unit/public-website.test.ts`
- `pnpm build:website`
- `node scripts/verify-website.mjs`（改布局后建议重跑）

---

## 3. 冻结决策（防漂移）

### 应保持

- Hero 右侧用 **`HeroConsole`**（侧栏 + 摘要），**不用**全尺寸 Trust Ledger 表格
- Proof artifacts **仅 tab 预览**，不恢复 4 张 artifact card
- Open core 用 `#open-core` + `repositoryNote` + `OpenCoreDiagram`，**不用**假 GitHub URL
- 邀请制私密预览表述；`designPartnerNote` 可说明受邀团队，**不用**假 logo 墙
- en + zh-CN；`zh-CN` H1 使用专用 `clamp`
- Nav **5 项**；`#roadmap` 保留在 Open core split 内，不作为独立 nav 项

### 禁止（未经显式决策不得做）

- 在 Hero 恢复 **Trust Ledger 四列表格** 或完整 hash 行
- 添加假客户 logo、star 数、SOC2、「已开源」
- 声称 SaaS / Team Cloud / Enterprise / 公开 npm **已上线**
- Hero 与 How it works **同时**展示完整相同终端输出
- 为填空白堆更多深色 section 或重复绿色 `SECTION LABEL` 区块

---

## 4. 已完成路线图（P0–P2）

### P0 — 响应式与 IA 基础

| ID | 任务 | 主要文件 | 完成 |
| --- | --- | --- | --- |
| P0-1 | Hero **≤1100px 改单栏**，消除挤压重叠 | `responsive.css`, `styles.css` | ✅ 2026-07-01 |
| P0-2 | **终端只出现一次**（Hero run 摘要；CLI 仅 CliDemo） | `HeroConsole.tsx`, `i18n.ts` | ✅ 2026-07-01 |
| P0-3 | Graph **mobile fallback** | `AssuranceGraph.tsx`, `responsive.css` | ✅ 2026-07-01 |
| P0-4 | **Nav 精简到 5 项** | `App.tsx`, `i18n.ts`, footer | ✅ 2026-07-01 |

### P1 — 信息减负与视觉升格

| ID | 任务 | 完成 |
| --- | --- | --- |
| P1-1 | Hero 信息减负（checklist→1，secondary CTA→text link） | ✅ 2026-07-01 |
| P1-2 | Hero 与 Graph 之间加浅色/间距呼吸带 | ✅ 2026-07-01 |
| P1-3 | Artifact 区视觉升格为主产品 preview | ✅ 2026-07-01 |
| P1-4 | zh-CN 术语表统一 | ✅ 2026-07-01 |

### P2 — 清理与诚实增强

| ID | 任务 | 完成 |
| --- | --- | --- |
| P2-1 | 清理 dead CSS（`.assurance-pipeline`, `.artifact-card` 等） | ✅ 2026-07-01 |
| P2-2 | Open core 单色架构示意 | ✅ 2026-07-01 |
| P2-3 | 真实 design partner 说明（非假 logo） | ✅ 2026-07-01 |

---

## 4.1 P3 — Pixel QA 与移动端抛光

| ID | 任务 | 主要文件 | 完成 |
| --- | --- | --- | --- |
| P3-1 | 移动端 Hero 单栏强覆盖，修复中文 H1 断字和控制台过窄 | `styles.css`, `responsive.css` | ✅ 2026-07-16 |
| P3-2 | Assurance Graph mobile fallback 改为紧凑双列，降低区块高度 | `styles.css` | ✅ 2026-07-16 |
| P3-3 | Artifact Preview / Evidence hash 移动端防溢出、防重叠 | `styles.css`, `evidence-system.css` | ✅ 2026-07-16 |
| P3-4 | Trust Ledger 移动端单列、状态/摘要/证据分层布局 | `styles.css`, `responsive.css` | ✅ 2026-07-16 |
| P3-5 | Private preview CTA 与 footer 移动端比例收敛 | `styles.css`, `responsive.css` | ✅ 2026-07-16 |

### P3 验证记录

- `pnpm vitest run tests/unit/public-website.test.ts` passed。
- `pnpm build:website` passed。
- `pnpm typecheck:website` passed。
- In-app Browser DOM metrics at `390x1200` showed `horizontalOverflow: 0`。
- Assurance Graph mobile fallback height reduced from 622px to 320px。
- Playwright/System Chrome screenshot capture was unavailable in this local environment due Chrome headless `SIGABRT` / CDP screenshot timeout；this is recorded as an environment limitation, not a release authorization.

### P3 后续状态

Public Website Design Work Deferred v0.1 已记录当前排序决策：P3 实现保留，进一步视觉验收和 Claude Design 集成暂缓，直到 `owner_finalizes_claude_design`。

不得在该条件满足前自动选择：

- Public Website Owner Visual Acceptance & P3 Follow-up Triage v0.1
- Public Website Claude Design Integration & QA v0.1
- website visual polish / design-system rewrite / Claude Design implementation goals

---

## 5. zh-CN 术语锚点

| 概念 | 统一用语 | Nav / 锚点 |
| --- | --- | --- |
| Assurance Graph | **保障图谱** | `#assurance-graph` |
| Proof artifacts | **证据物料** | `#artifacts` |
| Trust Ledger（Console 标题） | **信任账本** | 仅 HeroConsole 内 |
| Roadmap / evidence model | **证据模型**（路线图副标题） | `#roadmap` |
| Trust boundary | **信任边界** | `#trust` |
| How it works | **工作方式** | `#how-it-works` |

---

## 6. 重复叙事审计（当前应满足）

| 信息点 | 修前 | 当前目标 |
| --- | --- | --- |
| `pnpm hardening run…` | Hero + CliDemo | **仅 CliDemo** |
| 证据不出机器 | ≥5 处 | Hero **1 次** + Trust 区 1 次 |
| 验证→生成→验收链路 | Hero bullets + Graph + Artifacts | **Graph 主叙事** |
| 100% LOCAL | HeroConsole footer + hero privacy | **保留 1 处** |

---

## 7. 评分目标

| 维度 | 评审基线 | Sprint 目标 |
| --- | ---: | ---: |
| F. 响应式 | 5.0 | ≥7.5 |
| B. 信息架构 | 5.5 | ≥7.0 |
| D. 组件交互 | 6.5 | ≥7.5 |
| **总分** | **58** | **≥68**（精品 indie 上沿） |

大厂级（≥80）**不在 v0.2 sprint 承诺**；需品牌摄影、motion、单一主视觉等后续轮次。

---

## 8. 后续轮次（未承诺）

以下项可在单独 goal 中立项，**不得**在未决策时悄悄塞进官网：

| 主题 | 说明 |
| --- | --- |
| P4 视觉抛光 | Owner visual review 后的最终微调、motion、品牌质感 |
| 品牌摄影 / motion | 大厂级观感所需，非当前范围 |
| 可复用组件库 | website 与 future console 共享 UI primitives |
| Project Intelligence Console | 内部图谱语言与 public Assurance Graph 对齐 |
| ja / ko locale | 仍为 roadmap-only |

---

## 9. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-07-01 | 由 `website-uiux-baseline-temp-2026-07-01.md` promote 为正式 v0.2 路线图；P0–P2 全部完成 |
| 2026-07-16 | P3 mobile/pixel polish 首轮完成：移动端无横向溢出，图谱 fallback 压缩，Artifact/Trust Ledger 防重叠 |
| 2026-07-01 | P2-1–P2-3 实施完成 |
| 2026-07-01 | P1-1–P1-4 实施完成 |
| 2026-07-01 | P0-1–P0-4 实施完成 |
| 2026-07-01 | 临时基线初版（二次 UI/UX 评审） |
