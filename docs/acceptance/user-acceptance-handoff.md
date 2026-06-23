# 用户验收交接包

生成时间：2026-06-23T15:51:22.350Z

## 当前状态

| 项目 | 结果 |
| --- | --- |
| 总体状态 | 已准备好请求用户验收 |
| 自动证据通过 | 32 |
| 自动证据缺失 | 0 |
| 需要人工确认 | 1 |
| 验收模式 | browser |
| 目标完成度审计 | `docs/acceptance/goal-completion-audit.md` |
| 真实项目验收记录 | `docs/acceptance/user-acceptance-record.md` |
| 用户验收指南 | `docs/acceptance/guides/user-acceptance-guide.md` |
| 用户验收清单 | `docs/acceptance/checklists/acceptance-checklist-v0.1.md` |

当前结论：自动证据已齐，仍需用户验收结论。

## 自动质量门禁

| 要求 | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
| 完整验收门禁通过 | 已通过 | docs/acceptance/acceptance-run.md full mode passed and is fresh for the current goal update date |  |


## 架构迁移状态

| 要求 | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
| Legacy acceptance 兼容 wrapper | 已通过 | src/internal/acceptance/*.ts all delegate to packages/acceptance/dist compatibility wrappers |  |
| Acceptance package typed module exports | 已通过 | root package depends on @hardening-mcp/acceptance workspace package; exact package export surface matches acceptancePackageExportEntries; package dist output contract matches acceptancePackageDistOutputEntries including .js.map sourceMapPath; package dist source specs match PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, and PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS; package source contract matches acceptancePackageSourceEntries; typed dist entrypoints have no unexpected package exports |  |
| Shared package typed module exports and legacy wrappers | 已通过 | root package depends on @hardening-mcp/shared workspace package; packages/shared exports typed root, compatibility, privacy-redaction, shell-quote, and shell-words subpaths; src/shared/*.ts all delegate to packages/shared/dist compatibility wrappers |  |
| Security assurance package typed module exports | 已通过 | root package depends on @hardening-mcp/security-assurance workspace package; packages/security-assurance exports typed root, compatibility, and import-security-evidence subpaths; type-smoke covers root and subpath resolution |  |
| Repair planner package typed module exports and legacy wrappers | 已通过 | root package depends on @hardening-mcp/repair-planner workspace package; packages/repair-planner exports typed root, compatibility, generate-repair-plan, and repair-plan subpaths; src/domain/repair-plan/*.ts and src/types/repair-plan.ts delegate to packages/repair-planner/dist compatibility wrappers |  |
| Browser explorer package typed module exports and legacy wrappers | 已通过 | root package depends on @hardening-mcp/browser-explorer workspace package; packages/browser-explorer exports typed root, compatibility, explore-app, and playwright-driver subpaths; src/domain/explore/*.ts delegates to packages/browser-explorer/dist compatibility wrappers |  |
| Legacy acceptance dist compatibility outputs | 已通过 | dist/internal/acceptance/*.js and *.d.ts compatibility outputs all delegate to packages/acceptance/dist package entrypoints; dist/internal/acceptance/*.js.map source maps are present through legacyAcceptanceDistOutputEntries.sourceMapPath and LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS |  |


## 用户验收状态

| 要求 | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
| 用户确认 MVP 符合预期 | 需要人工确认 | docs/goals/codex-goal.md Success Definition requires user confirmation or explicit remaining changes | 等待用户提供真实 Web App repo 或人工验收结论；不能由自动脚本代替。 |


## Repo 参数行为

使用 `--repo <repo>` 刷新交接包时，会显示 repo root 和文件型、JSON 对象 manifest 的 `package.json` 两个独立前置检查结果；如果传入 `<real-web-app-repo>` 这类占位符，会在访问文件系统前提示替换为真实路径；必需前置检查失败时仍会写出交接包并返回非零退出码。如果报告显示未通过，请先修复 repo 路径或 package.json manifest，再运行 `pnpm user:accept`。



## 刷新交接包

```bash
pnpm user:handoff -- --help
pnpm user:handoff -- --repo <real-web-app-repo>
pnpm user:handoff -- --output <path>
```

## 建议验收顺序

1. 打开 `docs/acceptance/goal-completion-audit.md`，确认自动可验证项没有缺失。
2. 打开 `docs/acceptance/guides/user-acceptance-guide.md`，按真实项目环境准备 Node.js、pnpm 和 Playwright Chromium。
3. 在一个真实 repo 上运行真实项目验收：

```bash
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
```

4. 如果结果符合预期，写入用户通过结论并复跑目标审计：

```bash
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision accepted --notes "用户确认 MVP 符合预期"
pnpm goal:audit
```

5. 如果需要继续修改，写入具体修改项并复跑目标审计：

```bash
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision changes_requested --notes "补齐登录态探索并降低误报"
pnpm goal:audit
```


## 验收重点

- CLI 与 MCP Server 是否都能完成 P0 hardening flow。
- 报告是否能解释启动、探索、生成测试、发现项、artifact 路径和复现命令。
- 生成的 Playwright spec 是否可在真实项目上执行或给出明确失败证据。
- 报告、日志和验收记录是否没有泄露 env value、token、secret 或用户私有数据。
- 已知限制是否可以接受，或已经作为 `changes_requested` 备注记录。

## 完成边界

当前交接包只整理自动证据和用户操作入口，不能由自动脚本代替用户确认。长期 goal 只有在真实项目验收通过、用户结论为 `accepted`、accepted 验收记录必须包含具体确认备注、generated Playwright spec 执行验证必须通过，且 accepted 验收记录的生成时间必须不早于 `docs/goals/codex-goal.md` 的最后更新日期时，才能标记完成。
