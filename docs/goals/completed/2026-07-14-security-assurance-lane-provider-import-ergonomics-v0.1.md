# Security Assurance Lane Provider Import Ergonomics v0.1 Codex Goal

最后更新：2026年7月14日
状态：已完成
适用范围：Security Assurance Lane Phase 1 本地 provider evidence import

## Goal Objective

在隔离 worktree 中按照 TDD 和测试金字塔，统一 provider 输入契约、预检错误、CLI/MCP discoverability 和 repair-planning handoff，同时保持 local-first、redaction、no target mutation 和 no provider service 边界。

## 完成内容

- 新增 package-owned `security-provider-contracts`，作为六个 provider id、normalized-envelope contract 与稳定错误码的唯一来源。
- importer 在任何输出目录创建前验证 provider、`scan.json`、JSON root、provider binding 和 findings array。
- CLI 新增 `hardening security providers`，完善 help、精确缺参提示和安全错误指导。
- tool result 新增 `repairPlanningHandoff`，同时给出 CLI/MCP repair-plan 入口与 maintainer review boundary。
- MCP 新增 `list_security_providers` 和 `import_security_evidence`，并通过 in-process transport 与 real stdio client 验证。
- 独立复审后补齐 schema/finding strict validation、P0-P3 mapping、safe unreadable-file error、metadata/id redaction、repo-local `.hardening` containment、symbolic-link rejection、create-only evidence，以及 untrusted provider suggestion boundary。
- 二次独立复审后让 invalid severity fail closed、P3 进入 repair tasks，新增 no-follow regular-file/10 MiB input boundary、collision-resistant redacted ids，以及 multiline Markdown/prompt neutralization。
- 最终独立复审后关闭 whole-artifact trust-ordering blocker：security task 先输出 machine-readable `trustBoundary`，使用非 provider 控制的通用标题，Markdown 对 provider text 做字面化转义；taskId 改由 normalized `findingId` 派生，并让 finding 必填/可选字段 fail closed。
- 最终 P2 收口让所有 normalized provider ids 带内容摘要，避免普通 slug-equivalent id 碰撞；Markdown 同时中和 bare URL/email autolink。
- 更新 package exports、type smoke、架构规格、README、testing、acceptance、operations、logs 和 PLAN gateway。

## TDD 证据

- RED：共享 contract 测试因模块不存在失败；实现 catalog 与 preflight 后 GREEN。
- RED：CLI 六项契约分别暴露缺少 handoff、provider list、完整 help、精确缺参、unsupported guidance 和 safe import error；最小实现后 GREEN。
- RED：compiled CLI 不认识 `security providers`；重建 root runtime 后 GREEN。
- RED：MCP registry、transport 和 real client 无法发现两个新工具；复用共享 contract/tool 后 GREEN。
- RED：结构测试因 operation/completed-goal 文档缺失失败；完成文档级联后 GREEN。
- Review RED：11 个边界测试暴露 10 个失败，existing-output 测试单独确认 overwrite；最小修复并重建 package 后，security/CLI/MCP focused suite 3 files / 82 tests GREEN。

## 测试金字塔

- Unit：`security-assurance.test.ts`、`cli-options.test.ts`、`mcp-tool-registry.test.ts`、`project-structure.test.ts`。
- Integration：`cli-generated-artifacts.test.ts`、`mcp-server.test.ts`。
- Real client smoke：`mcp-real-client.test.ts` 通过官方 MCP SDK 与 compiled stdio server 消费 list/import。
- Repository gates：typecheck、lint、unit/full test、repo hygiene、release check、goal audit、diff check 与独立复审。

独立复审修复后的最终自动化结果：unit 67 files / 810 tests 通过；full suite 106 files / 895 tests 通过，1 个 optional file/test 跳过；typecheck、lint、repo hygiene、release check 均通过；goal audit 35/35 通过，0 missing，0 manual。

最终 delta review 结论：P0/P1/P2 均为 0；parent-directory TOCTOU 仅在既定 local trusted-maintainer threat model 下作为已记录的非阻断残余风险接受。

## 边界

- Native provider formats are not accepted；当前六个 provider id 只表示 normalized-envelope provenance，不表示原生格式 adapter 已实现。
- 不运行 scanner/provider service，不上传源码或报告，不自动修改 target repo。
- 不授权或执行 release、launch、customer contact、pricing/spend、visibility change 或 hosted/commercial availability claim。

## 下一 Goal

`Security Assurance Lane Provider Format Fixture Contracts v0.1`：先建立 sanitized/versioned native-format fixture matrix 与兼容性期望，再决定具体 adapter 实现顺序。
