# RepoAssure Public Website UI/UX QA

- 审计日期：2026-06-25
- 审计入口：`uiux-designer`
- 产品界面：RepoAssure Public Website v0.2
- 实现地址：`http://127.0.0.1:5174/`
- 源视觉基准：`/Users/ycn/.codex/generated_images/019ed932-7b49-71b0-845c-684c2fc10f32/ig_04fa6cbaaebee9cb016a3d1d4ad8088191a53375bdf20065a8.png`
- 桌面截图：`/private/tmp/repoassure-website-qa/desktop-full.png`
- 中文桌面截图：`/private/tmp/repoassure-website-qa/desktop-zh-full.png`
- 移动端截图：`/private/tmp/repoassure-website-qa/mobile-full.png`
- 移动端菜单截图：`/private/tmp/repoassure-website-qa/mobile-menu.png`
- 深色焦点态截图：`/private/tmp/repoassure-website-qa/desktop-focus-dark.png`
- 白色焦点态截图：`/private/tmp/repoassure-website-qa/desktop-focus-light.png`
- 并排对照证据：`/private/tmp/repoassure-website-qa/comparison-desktop.png`
- 检查视口：desktop `1440x1000`，mobile `390x1200`
- 检查状态：英文默认页、中文切换、artifact tab、private preview form、移动端导航、深色/白色焦点态

## 审计结论

本轮根据上一版 UI/UX QA 的两个 P2 进行修复：

- P2：交互焦点态不足。
- P2：设计 token 未完全语义化。

当前两个 P2 均已关闭。官网现在具备 website semantic token layer、显式 dark/light theme、统一 `:focus-visible` 规范，并通过真实浏览器焦点态截图验证。

审计结果：**public-release UI/UX gate passed for the current website scope**。

该结论只代表当前官网 UI/UX 质量门禁通过；不代表公开发布、SaaS、Team Cloud、Enterprise、hosted dashboard 或产品 artifact 多语言化已授权。

## 风格参数

| 维度 | 当前判断 | 参数值 | 说明 |
| --- | --- | ---: | --- |
| 预设基线 | professional | - | 适合企业 SaaS、安全、B2B、开发者工具 |
| 色彩温度 | 偏冷 | 25 | 深海军蓝、冷灰、蓝色辅助，符合安全产品气质 |
| 圆角程度 | 中低 | 35 | 8px-14px 为主，避免玩具感 |
| 动效强度 | 克制 | 20 | 当前以静态可信为主，符合审计/证据产品 |
| 信息密度 | 较高 | 68 | 首屏承载品牌、图谱、账本、流水线，信息密集但可扫读 |
| 情感浓度 | 克制专业 | 30 | 文案直接、可信、少营销语 |
| 视觉对比 | 中高 | 62 | 深色首屏与白色内容区形成强结构对比 |
| 主色 | assurance green | `#009d5c` | 表达 verified / accepted / local-first |
| 辅助色 | control blue | `#4f86ff` | 用于次级 CTA、链接、计划态 |

## 修复结果

### Semantic Token Layer

已完成：

- `apps/website/src/styles.css` 增加 `/* Brand tokens */`、`/* Semantic tokens */`、`/* Component tokens */` 三层。
- 核心语义 token 包括 `--surface-hero`、`--surface-page`、`--surface-panel`、`--text-primary`、`--text-muted`、`--text-on-dark`、`--border-subtle`、`--status-verified`、`--status-generated`、`--status-accepted`。
- 组件 token 包括 `--component-radius-control`、`--component-radius-card`、`--component-radius-panel`、`--component-border-subtle`、`--component-border-on-dark`、`--component-shadow-panel`。
- `App.tsx` 为 header、hero、content sections、preview section、footer 增加显式 `theme-dark` / `theme-light`。

结论：P2 已关闭。

### Focus Visibility Gate

已完成：

- 增加统一 `:focus-visible` 规则。
- 覆盖 `a`、`button`、`select`、`input`、`[role="tab"]`。
- 深色区使用 `--focus-ring-on-dark`，白色区使用 `--focus-ring`。
- `scripts/verify-website.mjs` 捕获 `desktop-focus-dark.png` 和 `desktop-focus-light.png`，并验证焦点元素匹配 `:focus-visible`。

结论：P2 已关闭。

## 保留的非阻塞 P3

- 移动端首屏信息密度仍偏高，但没有可见重叠、横向溢出或不可读断层。
- Assurance Graph 的线条和节点位置仍可进一步精修，但当前已能表达产品关系。
- 首屏产品面板比例可继续向源图靠拢，但当前产品信号、层级和可读性已满足本轮 UI/UX gate。

## 验证结果

已通过：

```bash
pnpm vitest run tests/unit/public-website.test.ts tests/unit/project-structure.test.ts
pnpm --filter @repoassure/website typecheck
pnpm --filter @repoassure/website build
pnpm verify:website
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm repo:hygiene
pnpm goal:audit
```

浏览器验证覆盖：

- English default headline。
- Simplified Chinese switching 与 `html lang="zh-CN"`。
- artifact tab 切换到 `Repair plan / 修复计划`。
- private preview 表单提交状态。
- 移动端菜单打开。
- Trust Ledger 与 Assurance Pipeline 可见。
- 深色 header/hero 焦点态截图。
- 白色 preview form 焦点态截图。

final result: passed
