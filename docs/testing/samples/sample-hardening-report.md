# hardening-mcp 样例硬化报告

来源：本地 benchmark 的 `vite-basic` 场景，内容按真实生成报告结构整理，并将本机绝对路径替换为 `<workspace>` 以便文档长期稳定。

## 摘要

| 项目 | 结果 |
| --- | --- |
| 就绪度评分 | 85 |
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| 启动状态 | running |
| 应用 URL | http://127.0.0.1:56397 |

## Repo Profile

| 字段 | 值 |
| --- | --- |
| framework | vite |
| packageManager | npm |
| recommendedStartCommand | npm run dev |
| confidence | high |

## 发现项

### 1. Interaction did not produce an observable result

- 严重级别：P1
- 类型：dead_control
- 复现步骤：Go to http://127.0.0.1:56397 -> Click "Save"
- 证据：click_error=TimeoutError: page.click: Timeout 1000ms exceeded.

## 测试生成

| 字段 | 值 |
| --- | --- |
| createdFiles | `<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/tests/hardening/generated-findings.spec.ts` |
| testCommand | `npx playwright test '<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/tests/hardening'` |
| verificationCommand | `HARDENING_BASE_URL=http://127.0.0.1:56397 npx playwright test '<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/tests/hardening'` |
| validationStatus | skipped |

## 修复指导

- 优先处理 P0 和 P1 问题。
- 运行生成的 Playwright 测试以复现关键路径。
- 结构化 repair plan 路径：`<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/.hardening/latest/repair-plan.json`
- 人类可读 repair plan 路径：`<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/.hardening/latest/repair-plan.md`
- 可执行修复任务包路径：`<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/.hardening/latest/repair-task-package.json`
- 人类可读修复任务包路径：`<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/.hardening/latest/repair-task-package.md`
- 补丁 diff 路径：`<workspace>/artifacts/benchmark-runs/<run-id>/vite-basic/.hardening/run/patch.diff`

## Repair Plan 摘要

`repair-plan.json` 会为 AI IDE / Agent 提供稳定任务清单。每个任务包含：

- `taskId`
- `severity`
- `title`
- `repairIntent`
- `evidence`
- `targetAreas`
- `verification.commands`
- `agentPrompt`

## Executable Repair Task Package 摘要

`repair-task-package.json` 面向 AI IDE / Agent 的执行交接。每个任务包含：

- `objective`
- `context.rootCauseHypothesis`
- `recommendedFix.expectedOutcome`
- `recommendedFix.changeScope`
- `recommendedFix.implementationSteps`
- `verification.acceptanceCriteria`
- `handoffPrompt`

## 阻塞项和错误

- test generation error: Validation skipped because Playwright execution is handled in the E2E phase.

## 验收关注点

- 报告包含评分、严重级别汇总、启动状态、repo profile、发现项、复现步骤、证据、生成测试、verificationCommand、修复指导、blockers/errors。
- 真实项目报告路径通常为 `<repo>/hardening-report.md`，兼容 artifacts 位于 `<repo>/.hardening/run` 和 `<repo>/.hardening/artifacts`。
- AI IDE / Agent 首选入口为 `<repo>/.hardening/latest/manifest.json`；该 manifest 会指向 run-scoped bundle 内的 `repair-plan.json`、`repair-plan.md`、`repair-task-package.json`、`repair-task-package.md`、`hardening-report.md`、`findings.json`、`generated-tests/` 和 `artifacts/`。
- 真实运行产生的路径、URL、错误摘要和用户备注会经过敏感信息脱敏。
