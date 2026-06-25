# Release Candidate Packaging Codex Goal

状态：已完成
日期：2026-06-25
分支：`codex/release-candidate-packaging-v0.1`

## Goal

将已完成的 v0.3 distribution/repair loop 与 public-release readiness 变更整理成可审查的本地 release candidate，同时保持不公开、不发布、不推送的边界。

## Scope

- 审查当前未提交变更，确认它们属于 v0.3 distribution/repair loop、public-release readiness 或 release candidate handoff。
- 新增 release candidate handoff 交接文档，明确 review branch、commit packaging plan、final verification gates、manual gates 和 no-publication boundary。
- 使用 TDD 方式新增 structure test，防止 handoff 入口缺失。
- 运行质量门禁，确认 release candidate 可进入本地审查。
- 创建本地 review branch 和本地 commits；不 push、不打开 PR、不发布 npm、不创建 GitHub release、不改变仓库 visibility。

## TDD Evidence

- Red：`pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "release candidate handoff"` 因 `docs/operations/release-candidate-handoff-v0.1.md` 缺失失败。
- Green：新增 `docs/operations/release-candidate-handoff-v0.1.md`，级联 README、public release checklist 和 dev log 后 focused test 通过。
- Broaden：`pnpm vitest run tests/unit/project-structure.test.ts` 通过，60/60。

## Verification

- `pnpm repo:hygiene`：通过。
- `pnpm release:check`：通过自动 prerequisites，且仍报告 `public release ready: no`。
- `pnpm test:unit`：通过，35 个测试文件、534 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm acceptance -- --full --browser`：通过，17/17。
- `pnpm goal:audit`：通过，35/35。
- `pnpm user:handoff`：通过，自动证据 35，缺失 0，需要人工确认 0。
- `git diff --check`：通过。

## Release Boundary

本 goal 只完成本地 release candidate packaging。它不授权：

- npm publish
- GitHub release
- push branch
- open PR
- make repository public
- remove `package.json` `"private": true`

公开发布仍需法律 review、商标/name review、branch protection 或等效 repository ruleset、最终 maintainer publication authorization。
