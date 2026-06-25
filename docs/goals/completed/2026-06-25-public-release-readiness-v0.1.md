# RepoAssure Public Release Readiness v0.1 Codex Goal

最后更新：2026年6月25日
状态：已完成自动可执行范围；公开发布仍需人工授权
适用范围：Public release readiness materials and automated checks

## Goal Objective

完成 RepoAssure 公开发布前可本地自动执行的准备工作，但不实际公开 repository、不发布 npm package、不创建 tag/release、不公开公告。

## Scope

- 添加 Apache-2.0 `LICENSE` 和 `package.json#license`。
- 保持 `package.json#private: true`，继续阻止 npm package publication。
- 添加 `CONTRIBUTING.md`，记录 Developer Certificate of Origin 和 no-CLA 初始策略。
- 添加 `SECURITY.md`，记录 private vulnerability disclosure flow。
- 添加 dependency license audit 和 public release notes draft。
- 新增 ADR-0015，明确 LICENSE 是 readiness material，不是 publication authorization。
- 扩展 `pnpm release:check` 和 `pnpm goal:audit`，让 public release readiness materials 可自动审计。

## Non-goals

- 不 make repository public。
- 不 npm publish。
- 不创建 public GitHub release 或 tag。
- 不公开公告。
- 不发布外部 case study。
- 不绕过 GitHub branch protection / ruleset blocker。

## Completion Evidence

- `LICENSE` 存在并包含 Apache License Version 2.0。
- `package.json` 保持 `"private": true`，并新增 `"license": "Apache-2.0"`。
- `CONTRIBUTING.md` 记录 DCO 和 no-CLA 初始策略。
- `SECURITY.md` 记录 private vulnerability disclosure flow。
- `docs/product/strategy/dependency-license-audit-v0.1.md` 记录当前 dependency license audit。
- `docs/product/strategy/public-release-notes-v0.1.md` 记录 local-first、artifact boundary 和 non-goals。
- `docs/adr/0015-public-release-readiness-boundary.md` 记录 public release readiness boundary。
- `pnpm release:check` 自动项通过，并因 `manual-publication-authorization` 缺失继续报告 `public release ready: no`。
- `pnpm vitest run tests/unit/public-release-readiness.test.ts tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts tests/unit/acceptance-package.test.ts` 通过。
