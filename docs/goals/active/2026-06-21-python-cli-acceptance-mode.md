# Python/CLI Acceptance Mode Codex Goal

最后更新：2026年6月21日
状态：待执行
适用范围：ADR-0008 后续能力；为当前 Web App browser acceptance flow 增加独立 Python/CLI acceptance mode
关联文档：

- `docs/adr/0008-repository-acceptance-scope.md`
- `docs/product/specs/mvp-spec-v0.2.md`
- `docs/acceptance/guides/user-acceptance-guide.md`
- `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- `docs/logs/blockers.md`

## Goal Objective

按照“先 TDD + 中间 5A 敏捷开发 + 后金字塔测试”的工程流程，实现 ADR-0008 的后续能力：在不削弱当前 Web App browser acceptance flow 的前提下，为 `hardening-mcp` 增加独立的 Python/CLI acceptance mode。

目标是让 `Panniantong/Agent-Reach` 这类 Python CLI / Agent capability repo 不再只能停留在 `missing package.json` 的范围外失败记录，而是可以通过显式 Python/CLI 模式完成本地验收，产出 CLI-oriented findings、logs、repair plan、repair task package 和 verification commands。

预期新增主链路：

```text
pyproject.toml / CLI repo
  -> repo preflight --mode cli
  -> Python/CLI profile
  -> dependency/static/smoke checks
  -> CLI-oriented findings
  -> hardening report
  -> repair-plan.json / repair-task-package.json
  -> user acceptance record
```

## Authorization Boundary

本 goal 文档本身不代表立即执行实现。用户后续明确授权执行时，Codex 可全自动完成本 goal，包括：

- 修改 TypeScript 源码、测试、README、验收指南、验收清单、product spec、ADR follow-up 和日志。
- 新增 Python/CLI acceptance mode 的 domain、runner、CLI args、MCP/tool output 或 acceptance package API。
- 为 `Panniantong/Agent-Reach` 这类真实 repo 执行本地 preflight、静态检查、CLI smoke 和 user acceptance。
- 按环境规则为网络 clone、依赖安装、本地进程执行或需要沙箱外权限的命令请求审批。

仍必须遵守：

- 不放宽现有 Web App browser acceptance preflight；Python/CLI 必须是显式 mode 或等价独立入口。
- 不上传目标 repo 代码、日志、测试输出、env value、token、cookie 或私有数据。
- 不自动修改目标 repo 业务代码，除非用户另行授权进入 repair execution。
- 不把 Python/CLI 模式伪装成 browser acceptance；输出物料必须如实标注 mode。
- 遇到无法解决的问题，必须记录到 `docs/logs/blockers.md`。

## Product Scope

### Must Have

- 显式模式选择：
  - `pnpm user:accept -- --mode cli --repo <python-cli-repo> --decision pending`
  - 或等价显式入口；不得通过缺失 `package.json` 自动猜测并静默切换。
- Python/CLI repo preflight：
  - repo root 是有效目录。
  - `pyproject.toml` 是有效 TOML 文件。
  - 能读取 project name、requires-python、dependencies、optional dependencies 和 scripts/entrypoints。
  - 能识别 console script，例如 `agent-reach = "agent_reach.cli:main"`。
- Python/CLI profile artifact：
  - 写入 `.hardening/run/python-cli-profile.json` 和 run-scoped bundle。
  - 记录 package metadata、entrypoints、detected test/static commands、blockers 和 confidence。
- CLI smoke plan：
  - 优先执行无副作用帮助命令，例如 `<entrypoint> --help`、`python -m <module> --help`。
  - 对未知或可能联网/写入/登录的命令默认不执行，只记录为 manual verification candidate。
  - 命令执行必须有 timeout、cwd、env redaction 和 stdout/stderr size limit。
- Static/test checks：
  - 如果 repo 配置存在，支持检测并可选运行 `pytest`、`ruff`、`mypy`。
  - 没有配置时不视为失败，记录为 skipped 或 not configured。
- CLI-oriented report：
  - `hardening-report.md` 能描述 Python/CLI profile、smoke checks、static checks、blockers、findings 和 verification commands。
  - 不要求 browser artifacts、screenshots、traces 或 generated Playwright spec。
- Repair artifacts：
  - Python/CLI 模式也生成 `repair-plan.json`、`repair-plan.md`、`repair-task-package.json` 和 `repair-task-package.md`。
  - repair tasks 的 evidence 类型支持 `cli-output`、`static-check`、`test-output`、`preflight`、`network-policy`。
- User acceptance：
  - `docs/acceptance/user-acceptance-record.md` 支持 mode 字段或等价摘要。
  - Python/CLI accepted record 不要求 generated Playwright spec validation。
  - Python/CLI accepted record 必须要求至少一个 CLI smoke 或 configured static/test check 通过，并要求具体 `--notes`。
- Real repo validation：
  - 使用 `Panniantong/Agent-Reach` 作为真实项目 pending 验收目标。
  - 如果目标 repo 因外部网络、依赖安装或命令副作用限制无法完整执行，必须输出结构化 blocker，而不是伪造通过。

### Should Have

- `pnpm user:handoff -- --mode cli --repo <python-cli-repo>` 能展示 Python/CLI preflight 和建议 acceptance 命令。
- README、用户验收指南、验收清单、product spec 和 ADR-0008 follow-up 都说明 Python/CLI mode 与 browser mode 的边界。
- Goal audit 可识别 Python/CLI mode 相关材料已经存在，但不把它误当成 Web App accepted evidence。
- 多 repo workspace output 可以保留 Python/CLI run bundle。

### Non-goals

- 不做通用多语言 acceptance platform。
- 不支持 Java、Go、Rust、Swift、mobile、smart contract 或 data pipeline 的专用验收。
- 不执行可能产生真实外部副作用的 CLI 命令，例如发帖、登录、支付、删除、写入远端、批量爬取。
- 不要求安装所有 optional dependencies。
- 不接入 LLM 自动判断命令是否安全；命令安全策略必须以规则和显式 allowlist 为主。
- 不自动创建 GitHub PR 或修改目标 repo 源码。

## 5A Agile Loop

每个实现切片必须按 5A 循环推进：

| 阶段 | 含义 | 输出 |
| --- | --- | --- |
| Align | 对齐当前切片目标、ADR-0008 边界和不可破坏合同 | 本轮范围、非目标、影响文件 |
| Analyze | 分析现有代码、测试、fixtures、命令和失败证据 | 最小上下文、风险点、测试入口 |
| Architect | 设计最小接口和数据契约 | 类型、函数边界、artifact path、mode contract |
| Act | 先写 Red 测试，再实现 Green，再小范围 Refactor | 测试、源码、文档 patch |
| Assess | 运行相关门禁并记录结果 | dev-log、blockers、下一轮输入 |

执行要求：

- 每个切片必须先写 Red 测试；文档-only 切片可用结构测试或 markdown content guard 作为 Red。
- 每个切片结束必须更新 `docs/logs/dev-log.md`。
- 如果某轮发现 scope 冲突，必须先记录 blocker 或提出 ADR amendment，不得直接绕开 ADR-0008。

## TDD Plan

### Phase 0 - Contract and Fixture Baseline

目标：先固定 Python/CLI mode 的产品合同和测试 fixture。

Red tests:

- `tests/unit/user-acceptance-args.test.ts` 或现有 args 测试：`--mode cli` 被解析，未知 mode 被拒绝。
- `tests/unit/repo-preflight.test.ts`：CLI mode 要求 `pyproject.toml`，browser mode 仍要求 `package.json`。
- `tests/unit/project-structure.test.ts`：ADR-0008、product spec、README、user guide 和 checklist 均提到 Python/CLI acceptance mode。

Green implementation:

- 增加 mode 类型：`browser` 默认、`cli` 显式。
- 增加 Python/CLI fixture repo，最小包含 `pyproject.toml` 和安全 `--help` entrypoint。
- 不改变 browser mode 默认行为。

### Phase 1 - Python/CLI Profile

目标：读取 `pyproject.toml` 并生成 profile。

Red tests:

- 解析 project metadata：name、requires-python、dependencies。
- 解析 console scripts。
- TOML 缺失、语法错误、缺少 project section 生成清晰 blocker。
- 输出脱敏，不写 env value。

Green implementation:

- 新增 `src/domain/python-cli/` 或 `packages/acceptance/src/python-cli-*`，具体位置按当前 ownership 最小改动决定。
- 写入 `.hardening/run/python-cli-profile.json` 和 run-scoped artifact。

### Phase 2 - CLI Smoke and Static Checks

目标：安全执行无副作用命令，并记录 check results。

Red tests:

- console script help command 被识别为 safe smoke candidate。
- 非 help 命令默认 skipped，需要显式 allowlist 才能运行。
- command timeout、exit code、stdout/stderr snippet 和 redaction 被记录。
- pytest/ruff/mypy 只有在配置或可用命令明确时才运行/建议。

Green implementation:

- 新增 command safety policy。
- 新增 CLI smoke runner。
- 新增 static/test command detector。

### Phase 3 - Python/CLI Acceptance Record

目标：让 `pnpm user:accept -- --mode cli` 生成正确验收记录。

Red tests:

- CLI mode 不要求 `package.json`。
- CLI mode 不要求 browser artifacts 或 generated Playwright spec validation。
- accepted CLI record 必须包含具体 notes，且至少一个 required CLI/static check 通过。
- pending/failed/changes_requested lifecycle next steps 正确。

Green implementation:

- 扩展 `packages/acceptance/src/run-user-acceptance.ts` 或抽出 mode-specific runner。
- `docs/acceptance/user-acceptance-record.md` 摘要增加 mode 信息。
- 保持 browser mode accepted 仍要求 generated Playwright spec validation。

### Phase 4 - Report and Repair Artifacts

目标：Python/CLI mode 能产出 AI IDE 可消费修复材料。

Red tests:

- `hardening-report.md` 包含 Python/CLI profile、smoke/static check summary、blockers 和 verification commands。
- `repair-plan.json` 支持 CLI evidence type。
- `repair-task-package.json` 支持 CLI-oriented task handoff prompt。
- manifest 引用 Python/CLI profile、report、repair plan 和 task package。

Green implementation:

- 扩展 report/repair-plan schema，保持 Web App schema 兼容。
- 增加 mode-aware task generation。

### Phase 5 - Handoff, Docs, and Goal Audit

目标：用户能发现、运行和验收 Python/CLI mode。

Red tests:

- `pnpm user:handoff -- --mode cli --repo <repo>` 展示 CLI preflight 和 mode-specific commands。
- README/user guide/checklist/product spec 包含 CLI mode 示例。
- goal audit 证据覆盖 Python/CLI acceptance mode 文档和 tests。

Green implementation:

- 更新 handoff runner、docs、goal audit materials。
- 更新 ADR-0008 follow-up 状态或新增 decision-log 条目。

### Phase 6 - Real Repo Validation: Agent-Reach

目标：用真实 repo 验证模式价值。

Red/validation target:

- `Panniantong/Agent-Reach` 在 browser mode 仍因缺少 `package.json` 失败。
- `Panniantong/Agent-Reach` 在 CLI mode 能识别 `pyproject.toml` 和 console script。
- 在安全前提下执行 CLI help/static checks；无法执行的依赖或网络问题必须记录 blocker。

Expected output:

- `docs/acceptance/user-acceptance-record.md` 或专用输出路径记录 CLI mode pending 结果。
- run bundle 包含 Python/CLI profile、report、repair plan 和 repair task package。
- dev-log 记录真实 repo 验证结论。

## Testing Pyramid

### Unit Tests - 最多

必须覆盖：

- mode args parsing。
- browser vs cli preflight 分流。
- `pyproject.toml` parser。
- entrypoint detection。
- command safety policy。
- static/test command detection。
- CLI check result summary。
- user acceptance markdown lifecycle。
- repair task generation for CLI evidence。
- redaction and stdout/stderr truncation。

### Integration Tests - 适量

必须覆盖：

- `pnpm user:accept -- --mode cli --repo fixtures/python-cli-basic --decision pending`。
- CLI mode writes profile/report/repair artifacts into run bundle。
- `pnpm user:handoff -- --mode cli --repo fixtures/python-cli-basic`。
- browser mode existing tests still pass unchanged。
- MCP or package export smoke if new package APIs are added.

### E2E Tests - 最少但关键

必须覆盖：

- 一个本地 Python CLI fixture 的完整 CLI acceptance run。
- 一个真实 repo validation：优先 `Panniantong/Agent-Reach`，如外部条件阻塞则记录 blocker 并保留 fixture E2E。
- 不要求 Playwright browser E2E 覆盖 CLI mode；browser E2E 继续作为现有 Web App flow gate。

## Quality Gates

每个切片至少运行相关 focused tests。最终完成必须运行：

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
pnpm acceptance -- --full --browser
pnpm goal:audit
```

Python/CLI mode 还必须运行：

```bash
pnpm user:accept -- --mode cli --repo <python-cli-fixture> --decision pending
pnpm user:handoff -- --mode cli --repo <python-cli-fixture>
pnpm user:accept -- --mode cli --repo /private/tmp/agent-reach --decision pending
```

如果当前环境无法安装 Python dependencies、无法访问网络或命令执行存在副作用风险，不得伪造通过；必须记录到 `docs/logs/blockers.md`，并用 fixture 验收补足自动证据。

## Success Criteria

| 类别 | 通过标准 |
| --- | --- |
| Scope | browser mode 仍保持 ADR-0008 当前边界；CLI mode 必须显式启用 |
| Preflight | CLI mode 能识别有效 Python CLI repo，并对无效 `pyproject.toml` 给出结构化失败 |
| Profile | 生成 Python/CLI profile artifact，包含 metadata、entrypoints、checks、blockers |
| Execution | 安全 CLI smoke/static checks 可运行，危险或未知命令默认 skipped |
| Acceptance | CLI mode user acceptance record 不要求 Playwright，但要求 CLI/static 自动证据和具体 notes |
| Artifacts | CLI mode 生成 report、repair plan、repair task package、manifest |
| Docs | README、user guide、checklist、product spec、ADR follow-up 和 dev-log 全部更新 |
| Real Repo | Agent-Reach 至少完成 CLI mode pending 验收或形成结构化 blocker |
| Quality | unit、integration、E2E、typecheck、lint、build、acceptance、goal audit 通过 |

## Blocker Policy

以下情况必须写入 `docs/logs/blockers.md`：

- Agent-Reach 依赖安装失败且无法通过审批或离线方式解决。
- CLI smoke 命令可能触发外部网络、副作用或账号操作。
- Python 版本、本地环境或包管理器缺失导致真实 repo 无法运行。
- 现有 browser acceptance flow 与 CLI mode 发生合同冲突。
- 需要新增 ADR 或修改 ADR-0008 才能继续推进。

## Token Control Policy

- 优先读取 ADR-0008、当前 acceptance package modules 和相关 tests，不扫描无关历史日志。
- 每轮只处理一个 5A 切片，避免一次性大改。
- 使用 `rg` 定位 mode/preflight/user acceptance/repair-plan 代码。
- 真实 repo 验证只读取必要 metadata、命令输出摘要和生成物路径。
- 长期信息写入 dev-log/blockers/goal 文档，减少依赖对话历史。

## Completion Evidence

完成时必须在本文件追加：

- 最终实现摘要。
- 真实 Agent-Reach 验收记录路径。
- Python/CLI fixture 验收记录路径。
- 质量门禁结果。
- 已知限制和后续建议。
