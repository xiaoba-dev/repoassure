# 测试策略

## 原则

项目采用 TDD 和测试金字塔：

```text
        E2E Tests
     Integration Tests
        Unit Tests
```

## 层级

| 层级 | 用途 | 初始目标 |
| --- | --- | --- |
| Unit | 纯函数、检测器、解析器、评分逻辑 | 最多 |
| Integration | CLI、artifact 写入、工具链路、子进程边界 | 适量 |
| E2E | 完整 hardening run、示例 repo | 最少但关键 |

Browser exploration 的单元测试覆盖截图 artifact、trace artifact、runtime signals、storageState context、基础点击、submit 语义、高风险动作跳过、非敏感表单字段填充、敏感字段跳过，以及 browser finding evidence 写入前脱敏。

Report generation 的单元和集成测试覆盖 readiness score、issue counts、Markdown report、带 `HARDENING_BASE_URL` 的 generated test verification command、敏感值脱敏，以及非空 `patch.diff`。`patch.diff` 当前验证 remediation plan、generated test diffs 和 diff 内容脱敏，不验证自动业务代码修复。

v0.3 distribution and repair loop readiness 的测试必须覆盖 GitHub Action wrapper 结构、local CLI invocation、默认不上传私有 artifact、repair task package / repair handoff / validation-only / patch plan 的 agent-consumption contract，以及 public-release readiness checks。任何未来 auto-fix、PR creation 或 hosted artifact storage 行为都必须先有 ADR，再进入测试策略。

当前 v0.3 测试覆盖：`project-structure.test.ts` 守护 `.github/actions/repoassure/action.yml`、safe example workflow 和文档入口；`repair-handoff.test.ts`、`repair-execute.test.ts`、`repair-patch-plan.test.ts` 守护 `agentContract` schema、读取顺序、下一步命令和不自动改源码边界；`public-release-readiness.test.ts` 守护 `pnpm release:check` 的 automated public-release prerequisites、tracked artifact/secret hygiene、manual authorization gate 和 CLI 输出；`goal-audit.test.ts` 守护 v0.3 交付物进入 `pnpm goal:audit`。

Public release readiness v0.1 的测试使用 unit / structure / goal-audit 层守护，不执行真实发布动作：`public-release-readiness.test.ts` 覆盖 Apache-2.0 `LICENSE`、`CONTRIBUTING.md`、`SECURITY.md`、dependency license audit、release notes draft 和 manual publication authorization gate；`project-structure.test.ts` 守护 ADR-0015、PR 模板、README、public release checklist 和 private repo boundary 的级联；`goal-audit.test.ts` 守护 public release readiness 作为自动审计项进入 `pnpm goal:audit`。任何 make repo public、npm publish、tag/release 或公开公告都必须另行授权并重新定义测试策略。

Public Release Readiness v0.2 的测试继续限于 unit / structure / goal-audit 层，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-readiness-v0.2.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求保留 `public release ready: no`、`package.json` `"private": true`、manual authorization gates、no repository visibility change、no npm publication、no GitHub release、no public launch / production marketing announcement、no SaaS / Team Cloud / Enterprise / hosted dashboard availability claim，以及 Private Preview Feedback Triage Execution 仍等待真实 reviewer feedback 的边界。

Public Release Candidate Final Review v0.1 的测试继续限于 structure / local quality gate / CI gate，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-candidate-final-review-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求最终审查包记录 automated local gates passed、Real Chromium trace E2E passed、`public release ready: no`、final recommendation no-go for public release、manual gates pending、Private Preview Feedback Triage Execution 仍等待真实 reviewer feedback，以及 no repository visibility change / npm publication / GitHub release / public launch / commercial availability claim 的边界。

Public Release Manual Gate Input Collection v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-gate-input-collection-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求记录 `Status: collecting_manual_gate_inputs`、public release remains no-go、不得在缺少 explicit maintainer evidence 时把 gate 记为 passed，并覆盖 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation，以及 no repository visibility change / npm publication / GitHub release / public launch / commercial availability claim 的边界。

Public Release Manual Gate Closure v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-gate-closure-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `not_closed_missing_manual_evidence`、public release remains no-go、No manual gate is marked closed without explicit maintainer evidence，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization 和 private preview reviewer feedback decision 保持 not_closed，同时 dependency/license 与 secret/customer data exposure 只能记录为部分自动证据支持，不授权发布执行。

Public Release Manual Gate Closure v0.2 的测试继续限于 structure-level tests 和 read-only remote evidence review，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-gate-closure-v0.2.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `not_closed_after_fresh_evidence_review`、public release remains no-go、Execution authorization is not final publication authorization，并记录 repository visibility `PRIVATE`、latest CI run `28486178718` success、branch protection API `HTTP 403`、repository rulesets API `HTTP 403`。legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization 和 private preview reviewer feedback decision 必须保持 not_closed；dependency/license 与 secret/customer data exposure 只能记录为部分自动证据支持；不得授权 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Public Release Manual Gate Evidence Intake v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-gate-evidence-intake-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `evidence_intake_incomplete`、public release remains no-go、Do not convert missing manual evidence into a passed gate，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization 和 private preview reviewer feedback decision 标记为 missing；dependency/license 与 secret/customer data exposure 只能记录自动 readiness/scan 证据，不授权 release execution。

Public Release Manual Gate Evidence Completion v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-gate-evidence-completion-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `incomplete_missing_manual_evidence`、completion remains incomplete、public release remains no-go、Goal execution authorization is not publication authorization、No gate was completed, closed, or passed，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 incomplete。

Public Release Manual Evidence Decision v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-evidence-decision-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `pending_manual_decisions`、public release remains no-go、Execution authorization is not a release decision、Allowed decision values: approve / reject / defer / accept risk，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 pending_decision。

Public Release Manual Evidence Decision Closure v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-evidence-decision-closure-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `not_closed_pending_decisions`、decision closure remains not_closed、public release remains no-go、No approve / reject / defer / accept risk decisions were supplied，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 pending_decision。

Public Release Manual Decision Input v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-decision-input-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `pending_input`、public release remains no-go、No approve / reject / defer / accept risk decision is prefilled，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 pending_input，同时表单包含 Decision value、Evidence、Decision date、Notes、Scope 字段。

Public Release Manual Decision Input Completion v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-decision-input-completion-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `not_completed_missing_explicit_decisions`、public release remains no-go、Goal execution authorization is not a manual release decision，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 not_completed / missing_decision。该 gate 不预填 approve / reject / defer / accept risk，不关闭任何 release gate，不授权 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Public Release Manual Decision Intake v0.2 的测试继续限于 structure-level tests 和 read-only remote evidence review，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-decision-intake-v0.2.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `decisions_recorded_release_execution_blocked`、public release remains no-go，并记录七项决策：legal review approve、trademark/name accept risk、branch protection or equivalent repository ruleset defer、final maintainer publication authorization approve、private preview reviewer feedback accept risk、dependency/license risk accept risk、secret/customer data exposure approve。该 gate 还必须记录 branch protection / repository rulesets `HTTP 403`、conditional approve fallback defer、final authorization 被 deferred branch protection gate 阻塞，以及 no repository visibility change / npm publication / GitHub release / public launch / SaaS availability 的非授权边界。

Public Release Manual Decision Input Review v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-decision-input-review-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `not_ready_pending_input`、public release remains no-go、No approve / reject / defer / accept risk decision was supplied by the maintainer，并要求 legal review、trademark/name review、branch protection or equivalent repository ruleset、final maintainer publication authorization、private preview reviewer feedback decision、dependency/license risk confirmation、secret/customer data exposure confirmation 全部保持 pending_input / missing，同时阻止 Public Source Release Execution v0.1。

Public Release Manual Decision Input Review v0.2 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 `docs/operations/public-release-manual-decision-input-review-v0.2.md`、README、public release checklist、acceptance checklist、testing strategy 和 dev log 的级联，要求状态为 `reviewed_release_execution_still_blocked`、public release remains no-go，并确认 Public Release Manual Decision Intake v0.2 的 7 项 maintainer 决策均已存在且可审阅：legal review approve、trademark/name accept risk、branch protection or equivalent repository ruleset defer、final maintainer publication authorization approve、private preview reviewer feedback accept risk、dependency/license risk accept risk、secret/customer data exposure approve。该 review 必须确认当前 blocking manual gate 仅为 branch protection or equivalent repository ruleset；No equivalent release control is defined in this review；不得通过公开仓库解锁 branch protection，也不得授权 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Equivalent Release Control Design v0.1 的测试继续限于 structure-level tests，不执行真实发布动作：`project-structure.test.ts` 守护 ADR-0022、`docs/operations/equivalent-release-control-design-v0.1.md`、README、architecture overview、public release checklist、acceptance checklist、testing strategy、decision log 和 dev log 的级联，要求状态为 `designed_not_executed`、public release remains no-go，并要求 evidence package 覆盖 exact release commit SHA、RepoAssure CI / Quality Gates、local full test、`pnpm build`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm repo:hygiene`、`pnpm release:check`、secret/customer-data exposure scan、diff review 和 maintainer approval for equivalent control closure。该设计不关闭 branch protection gate，不授权 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Equivalent Release Control Closure v0.1 的测试覆盖 structure-level tests、release readiness unit tests、本地质量门禁和远端 CI 证据：`project-structure.test.ts` 守护 `docs/operations/equivalent-release-control-closure-v0.1.md`、`docs/product/strategy/public-release-authorization-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy、decision log 和 dev log 的级联，要求 closure 状态为 `closed_release_execution_ready`、authorization 状态为 `ready_for_public_source_release_execution`，并记录 exact release candidate SHA、RepoAssure CI / Quality Gates success、local full test evidence、secret/customer-data exposure scan evidence、maintainer approval 和 residual risk accepted。`public-release-readiness.test.ts` 守护 authorization record 存在时 `releaseReady` 为 true；`pnpm release:check` 应报告 `public release ready: yes`。该 closure 不执行 repository visibility change、npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Public Source Release Execution v0.1 的测试覆盖 structure-level tests 和 post-release remote verification：`project-structure.test.ts` 守护 `docs/operations/public-source-release-execution-v0.1.md`、README、public release checklist、acceptance checklist、testing strategy、decision log 和 dev log 的级联，要求状态为 `repository_public_verified`，记录 repository visibility 从 `PRIVATE` 到 `PUBLIC`、GitHub visibility verification、public read access verification、RepoAssure CI / Quality Gates、`pnpm release:check` 和 `public release ready: yes`。本 gate 只执行 repository visibility change，不执行 npm publication、GitHub release、public launch、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability claims。

Team Cloud & Enterprise Spec v0.1 的当前测试范围限于 structure-level tests：`project-structure.test.ts` 守护 ADR-0016、商业版产品 spec、商业版架构 spec、README、architecture overview、commercialization strategy、open-core packaging、MVP v0.3、acceptance checklist、decision log 和 dev log 的级联。因为当前增量明确 No paid cloud implementation in this increment，不新增云端 runtime unit/integration/E2E；未来一旦实现 artifact import、hosted dashboard、team collaboration、enterprise integrations 或 advanced governance，必须先补对应金字塔测试。

Public Website and Project Intelligence Console planning 的当前测试范围同样限于 structure-level tests：`project-structure.test.ts` 守护 ADR-0017、public website spec、Project Intelligence Console spec、Project Intelligence Console architecture、README、architecture overview、commercialization strategy、acceptance checklist、testing strategy、decision log 和 dev log 的级联。当前不实现 public website UI、graph builder 或 internal console runtime；未来实现 graph builder 时必须先补 markdown/link extraction、code ownership classification、graph normalization、redaction 和 fixture integration tests，未来实现 responsive website 时必须补页面结构、响应式布局和内容边界验证。

Public Website Localization Strategy 的测试范围包括 structure-level tests 和 website runtime tests：`project-structure.test.ts` 守护 ADR-0018、public website spec、README、architecture overview、commercialization strategy、acceptance checklist、testing strategy、decision log 和 dev log 的级联；`public-website.test.ts` 守护 typed locale dictionaries、English default、Simplified Chinese locale、Japanese/Korean roadmap-only 边界、language switcher 入口、code-native Trust Ledger preview、无 hero raster dependency 和 localized forbidden-claim checks；`pnpm verify:website` 覆盖 English default rendering、Simplified Chinese switching、HTML `lang`、desktop/mobile screenshots、Trust Ledger preview localized text、artifact tabs、private preview form state 和 mobile navigation。该测试范围不覆盖 hardening report、repair plan、acceptance package、generated test、CLI output 或 AI IDE handoff material localization；这些属于单独产品能力，必须先有独立 ADR。

Public Website Enterprise Design System 的当前测试范围限于 structure-level tests：`project-structure.test.ts` 守护 ADR-0019、`docs/design/design-system-v0.1.md`、public website spec、README、architecture overview、acceptance checklist、testing strategy、decision log 和 dev log 的级联。当前只接受设计系统决策和文档落地，不实现 Public Website v0.2 redesign。未来 redesign goal 必须补 Product Design audit evidence、desktop/mobile screenshots、English/Simplified Chinese layout checks、Trust Ledger visual QA、forbidden-claim checks 和 `pnpm verify:website`。

Public Website v0.2 Enterprise Redesign 的测试范围包括 unit / structure / browser visual QA：`public-website.test.ts` 守护 Assurance Graph component、code-native Trust Ledger、dark enterprise security tokens、English default、Simplified Chinese locale、no browser-language auto-switching、selected source concept 和 guarded public copy；`pnpm verify:website` 覆盖 v0.2 headline、Assurance Graph、Trust Ledger、assurance pipeline、artifact tabs、private preview form、mobile navigation、English default 和 Simplified Chinese switching；`design-qa.md` 记录 selected Product Design direction 2 source visual、desktop/mobile screenshots、comparison evidence、P0/P1/P2 findings 和 `final result: passed`。

Public Website UI/UX Gate 的测试范围包括 unit / structure / browser focus evidence：`public-website.test.ts` 守护 website semantic token layer，包括 brand tokens、semantic tokens、component tokens、`theme-dark` / `theme-light`、`--surface-hero`、`--surface-page`、`--status-verified`、`--focus-ring`、`--focus-ring-on-dark`，并要求 `a`、`button`、`select`、`input`、`[role="tab"]` 具备 `:focus-visible` 覆盖；`project-structure.test.ts` 守护 design system、public website spec、acceptance checklist、testing strategy 和 dev log 的 UI/UX gate 级联；`pnpm verify:website` 额外捕获 `desktop-focus-dark.png` 和 `desktop-focus-light.png`，证明深色首屏和白色表单区焦点态在真实浏览器中可见。该 gate 不授权 SaaS、Team Cloud、Enterprise、public release claims 或 product artifact localization。

Public Website Private Preview Deployment Planning 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 ADR-0020、public website spec、public website handoff、README、architecture overview、acceptance checklist、testing strategy、decision log 和 dev log 的级联。该 planning gate 不执行真实部署，不调用 hosting provider，不创建 preview URL，不连接 custom domain，不公开 repo，不发布 npm package，不创建 GitHub release。deployment execution goal 已补 `vercel.json`、`.vercelignore` 和 blocker 记录测试；当前 Vercel 尝试被记录为 blocked，因为 CLI / project 返回 `target production` 或不可验证的 `UNKNOWN` preview，且 Vercel Git integration 曾在 `main` push 后自动创建 production deployment；Git integration 已断开。Resolve Vercel Preview Target Blocker v0.1 的测试补充要求 blocker、dev log 和 handoff 记录 retry 状态；本轮复验 `main` 默认 deploy、显式 `--target preview --skip-domain` 和临时非 main 分支 deploy 后仍未得到 accepted preview URL。只有获得 `Ready`、访问受控、非 production alias 的 preview URL，并通过 smoke/content/screenshot/forbidden-claim verification 后，才能把该 gate 改为通过。

Private Preview Hosting Fallback Decision 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 ADR-0021、ADR index、public website spec、release candidate handoff、README、architecture overview、acceptance checklist、testing strategy、decision log、dev log 和 blockers 的级联。该 decision gate 不部署 Cloudflare，不创建 preview URL，不上传 website source/build output 到新 hosting provider。未来 execution goal 必须补 Cloudflare Pages preview deployments with Cloudflare Access 或等效 host 的 access-control verification、smoke/content checks、desktop/mobile screenshots、forbidden-claim checks、rollback/delete evidence 和 non-authorization boundary。

Local Static Preview Package 的测试范围包括 structure-level tests 和 packaging smoke：`project-structure.test.ts` 守护 `pnpm package:website-preview`、`scripts/package-website-preview.mjs`、`.gitignore`、local preview handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 的级联；`pnpm build:website && pnpm package:website-preview` 生成 `artifacts/public-website-preview/local-static-preview`，并检查 `dist/`、`manifest.json`、`forbidden-claims.json` 和 `review-guide.md`。该 gate 不调用 remote hosting provider，不创建 preview URL，不上传 build output，不恢复 Vercel Git integration。

Cloudflare Access Remote Preview Preflight 的测试范围包括 structure-level tests 和 local preflight smoke：`project-structure.test.ts` 守护 `pnpm preflight:cloudflare-preview`、`scripts/preflight-cloudflare-preview.mjs`、Cloudflare Access preflight handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 的级联；`pnpm preflight:cloudflare-preview` 生成 `artifacts/public-website-preview/cloudflare-access-preflight/preflight-report.json` 和 `review-guide.md`。该 gate 不调用 Cloudflare API，不上传 website source/build output，不创建 preview URL，不执行 production deployment，不恢复 Vercel Git integration。未来 remote execution goal 必须在此基础上补 access-control verification、smoke/content checks、desktop/mobile screenshots、forbidden-claim checks、rollback/delete evidence 和 non-authorization boundary。

Private Preview Reviewer-Side Acceptance 的测试范围包括 structure-level tests 和 remote header smoke：`project-structure.test.ts` 守护 `pnpm verify:cloudflare-preview`、`scripts/verify-cloudflare-access-preview.mjs`、Cloudflare Access preflight handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 的级联；`pnpm verify:cloudflare-preview` 生成 `artifacts/public-website-preview/cloudflare-access-acceptance/acceptance-report.json` 和 `review-guide.md`，验证 accepted private preview URL 未登录时重定向到 Cloudflare Access，并包含 `www-authenticate: Cloudflare-Access` protected-resource metadata。该 gate 不自动绕过 email/OTP 登录，不保存 reviewer 凭证，不把 deployment subdomain 或 branch alias 视为 accepted review surface；登录后内容 smoke、移动端人工体验确认和 rollback/shutdown 执行仍为 `manual_required`。

Private Preview Authenticated Reviewer Acceptance Closure 的测试范围是 structure-level contract 加人工浏览器验收记录：`project-structure.test.ts` 守护 preflight handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 已记录 authenticated reviewer closure；人工浏览器验收使用 allowed reviewer Chrome profile 完成 Cloudflare Access 登录后，确认桌面端和移动宽度下 RepoAssure hero、language selector、private preview CTA、Assurance Graph、Trust Ledger、artifact tabs、trust boundary 和 private preview form 可访问。该 closure 不保存 OTP、cookie 或 Access token，不扩大 Access policy，不把登录后 browser session 转成自动化凭证；rollback/shutdown 仍是人工运维动作。

Public Website Custom Domain Deployment v0.1 的测试范围包括 structure-level tests、Cloudflare Pages custom domain state、DNS/HTTPS smoke 和官网浏览器 verification：`project-structure.test.ts` 守护 `docs/operations/public-website-custom-domain-deployment-v0.1.md`、README、acceptance checklist、testing strategy、dev log 和 blockers 的级联，要求记录 `verified_custom_domain_active`、Cloudflare Pages project `repoassure-preview`、custom domains `repoassure.com` / `www.repoassure.com`、latest deployment URL、Pages custom domain API active、历史 `CNAME record not set` / `Authentication error` blocker、已验证 CNAME 记录和 non-authorization boundary。`curl -I -L` 已确认两个 custom domain HTTPS 返回 200；`REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website` 和 `REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website` 已通过英文默认、Simplified Chinese 语言切换、desktop/mobile smoke、Trust Ledger、Assurance Graph、artifact tabs、private preview form 和 forbidden-claim custom-domain verification。该 verification 不等于 public launch、repo public、npm publication、GitHub release 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability。

Public Website Post-Domain Polish & Launch Boundary Review v0.1 的测试范围包括 unit / structure / remote browser verification：`public-website.test.ts` 守护 `apps/website/index.html` 中的 canonical URL、robots meta、Open Graph/Twitter metadata、favicon、manifest 和 theme color，并守护 `apps/website/public/robots.txt`、`sitemap.xml`、`site.webmanifest`、`favicon.svg`、`og-image.svg`；`project-structure.test.ts` 守护 `docs/operations/public-website-post-domain-polish-v0.1.md`、README、acceptance checklist、testing strategy 和 dev log 的级联，要求记录 `verified_post_domain_polish`、canonical URL、OG image、Twitter card、robots/sitemap、redirect policy 和 non-authorization boundary；`pnpm verify:website` 远端验证两个 custom domain 的 metadata、discoverability assets、英文/中文、desktop/mobile、Trust Ledger、Assurance Graph、artifact tabs、private preview form 和 forbidden-claim boundary。该 polish 不授权 public launch、repo public、npm publication、GitHub release、production marketing announcement 或 SaaS/Team Cloud/Enterprise/hosted dashboard availability。

Private Preview Reviewer Handoff & Feedback Intake 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 reviewer handoff 文档存在，并要求 release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 accepted review URL、allowed reviewers only、禁止分享 deployment subdomains/branch aliases、feedback template、acceptance questions、feedback intake workflow、rollback/shutdown 和敏感登录材料禁止记录边界。该 gate 不发送外部邀请，不扩大 Access policy，不创建 issue，不把 reviewer browser session 自动化。

Private Preview Feedback Triage & Website Polish Backlog 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 triage/backlog 文档存在，并要求 reviewer handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 P0/P1/P2/P3 severity rules、backlog item template、triage workflow、Expand Private Preview、Pause Private Preview、Enter Public Launch Preparation 和敏感登录材料禁止记录边界。该 gate 不发送 reviewer 邀请，不扩大 Access policy，不创建外部 issue，不授权 public launch、repo public、npm publication、GitHub release 或 SaaS/Team Cloud/Enterprise/hosted dashboard claims。

Private Preview Reviewer Expansion Readiness 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 expansion readiness 文档存在，并要求 triage/backlog、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 Access Boundary Checklist、Feedback Operations Checklist、Content and UX Checklist、Maintainer Decision Checklist、Expansion Decision、无 open P0/P1、`pnpm verify:cloudflare-preview` 和不扩大 Cloudflare Access policy 边界。该 gate 不添加 reviewer、不发送邀请、不修改 Cloudflare Access、不授权 public launch。

Private Preview Second Reviewer Access Execution 的测试范围包括 structure-level tests 和 remote header smoke：`project-structure.test.ts` 守护 execution 文档存在，并要求 Cloudflare Access preflight handoff、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `reviewer1@example.com`、`reviewer2@example.com`、`RepoAssure reviewer allow`、Cloudflare Dashboard UI execution、Access API `Authentication error` fallback、`pnpm verify:cloudflare-preview` 和 `manual_required` 边界。remote header smoke 继续使用 `pnpm verify:cloudflare-preview` 验证未登录 Cloudflare Access boundary；authenticated reviewer smoke 仍不得自动绕过 email/OTP、不得保存 token/cookie/login query-state。该 execution 只允许本次明确授权的 reviewer email，不授权 public launch、repo public、npm publication、GitHub release 或 SaaS/Team Cloud/Enterprise/hosted dashboard claims。

Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 dispatch readiness 文档存在，并要求 reviewer handoff、triage/backlog、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `waiting_for_external_reviewer_identity`、historical placeholders `reviewer1@example.com` / `reviewer2@example.com`、legacy slot names `confirmed-reviewer-1` / `confirmed-reviewer-2`、maintainer-owned access smoke test identities `maintainer-test-email-1` / `maintainer-test-email-2`、handoff message template、feedback intake record template、不发送邮件、不创建外部 issue、不编造 reviewer feedback，以及不记录 OTP/cookie/Access token/login query-state 的边界。该 gate 不验证真实反馈内容；真实外部反馈收到后必须另开 triage execution goal。

Private Preview Reviewer Identity Reconciliation 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 identity reconciliation 文档存在，并要求 second reviewer access execution、dispatch readiness、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 Maintainer / user、authenticated reviewer identity、`maintainer-authenticated-smoke-identity`、placeholder second-batch reviewer emails、`reviewer1@example.com`、`reviewer2@example.com`、`waiting_for_real_reviewer_identity` 历史状态、placeholder only、must be replaced with non-maintainer reviewer emails、不得把 placeholder emails 或 maintainer-owned test identities 当作 real reviewer feedback，以及本 reconciliation 不授权 Cloudflare Access policy change。

Private Preview Reviewer Identity Correction adds the current `maintainer_test_identity_corrected` state and uses privacy-preserving maintainer test slots instead of storing reviewer PII in Git tracked docs.

Private Preview Real Reviewer Replacement 的测试范围包括 structure-level tests 和 remote header smoke：`project-structure.test.ts` 守护 replacement 文档存在，并要求 identity reconciliation、dispatch readiness、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `confirmed-reviewer-1`、`confirmed-reviewer-2`、historical placeholders `reviewer1@example.com` / `reviewer2@example.com`、removed placeholder reviewer emails、`maintainer_test_identity_corrected`、`RepoAssure reviewer allow`、Cloudflare Dashboard UI execution、`pnpm verify:cloudflare-preview` 和 `manual_required` 边界。remote header smoke 继续使用 `pnpm verify:cloudflare-preview` 验证未登录 Cloudflare Access boundary；authenticated reviewer smoke 仍不得自动绕过 email/OTP、不得保存 token/cookie/login query-state。该 replacement 不发送 reviewer invitation、不创建 external issue、不编造 reviewer feedback、不授权 public launch、repo public、npm publication、GitHub release 或 SaaS/Team Cloud/Enterprise/hosted dashboard claims。

Private Preview Reviewer Handoff Package and Dispatch Execution 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 package-and-dispatch 文档存在，并要求 reviewer handoff、dispatch readiness、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 Stage 1 handoff package generated、Stage 2 dispatch execution `pending_channel_confirmation`、`confirmed-reviewer-1`、`confirmed-reviewer-2` legacy slot names、maintainer-owned access smoke test identities、accepted review URL、No outbound message was sent、Reviewer PII is not stored in Git tracked docs、不创建 external issue、不编造 reviewer feedback，以及不记录 OTP/cookie/Access token/login query-state 的边界。该 gate 不验证真实发送；发送渠道和非 maintainer 外部 reviewer 身份确认后必须另开或恢复 dispatch execution goal。

Private Preview Reviewer Identity Correction 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 correction 文档存在，并要求 replacement、identity reconciliation、dispatch readiness、package-and-dispatch、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `maintainer_test_identity_corrected`、`maintainer-test-email-1`、`maintainer-test-email-2`、maintainer-owned access smoke test identities、not external reviewers、does not count as external reviewer feedback、Cloudflare Access/OTP smoke、No outbound reviewer invitation was sent 和不记录真实 reviewer email 的边界。

Private Preview External Reviewer Recruitment and Dispatch Plan 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 recruitment/dispatch plan 文档存在，并要求 identity correction、dispatch readiness、package-and-dispatch、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `ready_for_external_reviewer_selection`、external reviewer、not maintainer-owned、minimum reviewer count: 2、developer builder、engineering lead、security-minded reviewer、manual maintainer email、Resend、No invitation was sent、不新增 Cloudflare Access reviewer、不记录真实 reviewer email、不创建 external issue，以及不把 maintainer-owned access smoke test identities 当作 external reviewers 的边界。

Private Preview External Reviewer Selection 的测试范围限于 structure-level tests：`project-structure.test.ts` 守护 selection 文档存在，并要求 recruitment plan、dispatch readiness、package-and-dispatch、release candidate handoff、acceptance checklist、testing strategy 和 dev log 级联记录 `ready_for_access_update_decision`、`external-reviewer-1`、`external-reviewer-2`、developer builder、engineering lead、not maintainer-owned、manual maintainer email、`Access update decision: required_before_dispatch`、No invitation was sent、No Cloudflare Access reviewer was added、不记录真实 reviewer email、不创建 external issue、不编造 reviewer feedback 的边界。

Cloudflare Pages + Access Private Preview Execution Blocked 的测试范围限于 structure-level tests 和外部状态记录：`project-structure.test.ts` 守护 blockers、dev log、public website handoff、acceptance checklist 和 testing strategy 记录空 `repoassure-preview` Pages project、`repoassure-preview.pages.dev`、Access API `Authentication error`、deployment list 为空、No website source or build output was uploaded。该 gate 不把空 project 视为 accepted preview，不执行 remote smoke/screenshot/content verification，直到 Cloudflare Access policy 可配置并验证。

monorepo readiness 的测试使用 unit / structure 层守护，不新增 runtime integration 或 E2E：`project-structure.test.ts` 必须验证 readiness audit 文档存在、v0.3 goal 明确依赖该 audit、`packages/core` 仍是延期抽取项、`apps/cli` 与 `apps/mcp-server` 可继续作为 compatibility shells、`examples/` 与 GitHub Action wrapper 被归入 v0.3 分发缺口，以及 decision/dev logs 已记录排序原因。

隐私脱敏单元测试覆盖 API key、service role、password、private key、Authorization/Proxy-Authorization credential、quoted Authorization/Proxy-Authorization object-literal credential、quoted Cookie/Set-Cookie object value、quoted object key/value 中的 API key、access token、client secret、session token、standalone provider API key、standalone repository/deployment token、standalone cloud provider access key、standalone JWT-looking token、JWT、CSRF、Cookie header、Set-Cookie header、URL userinfo credential、signed URL credential/signature query 参数、URL query 敏感参数和 URL fragment 敏感参数等常见敏感值；CLI options 测试覆盖成功 stdout JSON 和 stderr 错误输出写入前会脱敏；MCP registry 测试覆盖 tool 成功响应和错误响应进入 `content` 与 `structuredContent` 前会脱敏，同时覆盖 `sessionId` 在成功 `structuredContent` 中保留以支持 `stop_app`；MCP fatal error 测试覆盖进程级启动失败写入 stderr 前会脱敏；acceptance fatal error 测试覆盖验收 runner 进程级 fatal stderr 写入前会脱敏；benchmark fatal error 测试覆盖 benchmark runner 进程级 fatal stderr 写入前会脱敏；browser exploration 测试覆盖 console/page error、failed request 和 interaction evidence 进入 findings 前会脱敏，`visitedRoutes` 与 `interactions` 返回给 CLI/MCP 前也会脱敏；run hardening 集成测试覆盖 already-running URL 写入 `boot-result.json` 前会脱敏；boot tool 单元测试覆盖 auto-boot 可序列化结果的 URL、日志路径、blockers 和 errors 写入 artifact 或返回给 MCP 前会脱敏；报告层测试覆盖 boot errors、应用 URL、verification command、finding repro/evidence 以及 generated test diff 内容进入 `hardening-report.md` 和 `patch.diff` 前都会经过脱敏；acceptance report 测试覆盖 `docs/acceptance/acceptance-run.md` 的报告路径、命令和说明列写入前会脱敏；benchmark report 测试覆盖 `docs/logs/spike-results.md` 的运行目录、repo 报告路径和失败原因写入前会脱敏；goal audit 测试覆盖 `docs/acceptance/goal-completion-audit.md` 的分类标题、要求、证据和下一步写入前会脱敏；user acceptance 测试覆盖验收命令、摘要路径、异常摘要、artifact 检查证据、generated spec 验证 evidence/失败摘要和用户备注写入验收记录前会脱敏；generated spec 测试覆盖 route query/fragment 中的 signed URL credential/signature 参数脱敏。

Generated tests 的路径提取优先使用 `reproSteps` 中的显式页面导航；普通 repro 描述、finding evidence 和 smoke route 中的完整 URL 只接受本地 app URL 或当前被测 app 同源 URL 作为兜底，本地 app URL 包括 `localhost`、`127.0.0.1`、`0.0.0.0`、`[::1]`、`[::]`，避免第三方 API、CDN 或外部资源 URL 被误生成成本地页面 smoke/regression test。生成 spec 前会保留非敏感 query/fragment 参数与 SPA hash route，并脱敏 token、code、session、CSRF 等敏感 query/fragment 参数值；finding title 进入 generated test title 前也会经过敏感值脱敏。

## 初始命令

```text
pnpm test:unit
pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/explore-tool.test.ts tests/integration/cli-run.test.ts tests/integration/run-hardening-tool.test.ts
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm release:check
pnpm goal:audit
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --help
pnpm user:accept -- -h
```

## 当前环境说明

默认沙箱中，本地监听测试会触发 `listen EPERM`。因此当前稳定门禁为：

```text
pnpm test:unit
pnpm vitest run tests/integration/analyze-tool.test.ts tests/integration/cli-analyze.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/explore-tool.test.ts tests/integration/cli-run.test.ts tests/integration/run-hardening-tool.test.ts
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
node dist/adapters/cli/index.js analyze --help
node dist/adapters/cli/index.js explore --help
node dist/adapters/cli/index.js generate-tests --help
node dist/adapters/cli/index.js plan --help
node dist/adapters/cli/index.js report --help
node dist/adapters/cli/index.js run --help
node dist/adapters/cli/index.js run -h
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm release:check
pnpm goal:audit
pnpm user:accept -- --repo <real-web-app-repo> --browser --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --browser --validate-generated-tests --decision pending
pnpm user:accept -- --repo <real-web-app-repo> --url <running-url> --browser --validate-generated-tests --generated-test-timeout-ms 240000 --decision pending
pnpm user:accept -- --help
pnpm user:accept -- -h
```

完整 `pnpm test:integration`、MCP 纵向链路和真实 `pnpm test:e2e` 需要本地监听权限与浏览器运行条件。

`artifacts/benchmark-runs/**` 是当前 benchmark 产物目录，旧的 `benchmark-runs/**` 仍从 Vitest 扫描中排除，避免生成的 Playwright specs 被 Vitest 当作自身测试执行。

## 可选真实浏览器 E2E

在允许启动本地 server 和 Chromium 的环境中运行：

```text
HARDENING_E2E_BROWSER=1 pnpm vitest run tests/e2e/run-browser.e2e.test.ts
```

该测试会启动 fixture app，执行 `hardening run <repo> --browser`，验证截图 artifact、交互 findings 和报告。

## Benchmark

```text
pnpm build
pnpm benchmark
```

Benchmark 会运行 `fixtures/benchmark/*` 下的 5 个本地半真实 repo，生成 `docs/logs/spike-results.md`，并将每个 repo 的运行产物写入 `artifacts/benchmark-runs/`。

当前 benchmark 还会为每个 repo 重启 fixture app，并实际执行生成的 `tests/hardening/*.spec.ts`，验证 findings 回归测试和已探索关键路径 smoke tests 不只是落盘，而是可由 Playwright runner 执行。

## 验收入口

```text
pnpm acceptance
pnpm acceptance -- --help
pnpm acceptance -- -h
pnpm acceptance -- --full
pnpm acceptance -- --full --browser
```

`pnpm acceptance -- --help` 和 `pnpm acceptance -- -h` 会输出验收门禁参数说明，不运行检查。`pnpm acceptance` 汇总快速本地门禁、关键文档和产物检查，并写入 `docs/acceptance/acceptance-run.md`。`--full` 额外运行完整 integration tests 与 benchmark；`--browser` 额外运行真实 Chromium trace E2E。

`pnpm goal:audit` 生成 `docs/acceptance/goal-completion-audit.md`，用于审计 `docs/goals/codex-goal.md` 的显式成功条件是否都有当前证据。该命令只证明自动可验证范围，不把用户确认自动判定为完成；`accepted` 必须包含真实项目通过记录、可验证 artifact、匹配的验收命令、具体确认备注和 generated Playwright spec 执行验证通过证据才会被判定为完成，`changes_requested` 必须包含真实项目通过记录、可验证 artifact、匹配的验收命令和具体用户备注，随后会被归类为继续迭代输入。

CLI 子命令帮助入口属于低成本回归项。`node dist/adapters/cli/index.js <command> --help` 和 `node dist/adapters/cli/index.js <command> -h` 应返回对应命令 Usage，并且不触发 repo 分析、浏览器探索或 artifact 写入；帮助文本应自描述 `--help, -h`。

`pnpm user:accept` 是真实项目验收入口。该命令不属于默认本地门禁，因为它需要用户提供真实 Web App repo，且通常需要本地 server 与 Chromium 权限。`pnpm user:accept -- --help` 和 `pnpm user:accept -- -h` 可直接输出参数说明，不要求提供 repo。runner 会先校验 `--repo` 是已存在目录且包含文件型 `package.json`；无效路径或缺失 `package.json` 会生成结构化失败记录并返回非零退出码，不进入 hardening flow。若 hardening flow 发生非预期异常，runner 同样写入结构化失败记录，摘要路径、异常摘要、artifact 检查证据和用户备注会先经过敏感信息脱敏。

`--validate-generated-tests` 会执行 generated Playwright spec。未提供 `--url` 时，`pnpm user:accept` 会保持自动 boot 的应用运行到 generated spec 验证结束；如果目标应用已由用户或 CI 启动，则可通过 `--url <running-url>` 复用现有服务。验证阶段复用 client URL 归一化规则，将 `0.0.0.0` 和 `[::]` 转换为 loopback URL，避免探索阶段与 generated spec 验证阶段访问不同地址。慢登录或复杂真实项目可用 `--generated-test-timeout-ms <ms>` 覆盖默认 120000ms 验证超时。

## Private Preview External Reviewer Access Update

Private Preview External Reviewer Access Update v0.1 is verified through three layers:

```text
pnpm vitest run tests/unit/project-structure.test.ts
pnpm verify:cloudflare-preview
manual Cloudflare Dashboard UI confirmation
```

The structure test requires the access update operation record and cascade docs to reference only anonymous slots such as `external-reviewer-1` and `external-reviewer-2`; real reviewer email addresses must not be stored in Git tracked docs.

`pnpm verify:cloudflare-preview` remains the automated unauthenticated boundary check for `https://repoassure-preview.pages.dev`. Authenticated reviewer content smoke remains `manual_required` because Cloudflare Access email/OTP login must be completed by the reviewer and must not be bypassed or persisted by tests.

## Private Preview External Reviewer Manual Dispatch

Private Preview External Reviewer Manual Dispatch v0.1 is verified through structure-level tests and a sensitive information scan:

```text
pnpm vitest run tests/unit/project-structure.test.ts
rg -n "<out-of-band-reviewer-email-1>|<out-of-band-reviewer-email-2>" docs tests README.md package.json scripts
```

The structure test requires the manual dispatch operation record and cascade docs to reference only anonymous slots such as `external-reviewer-1` and `external-reviewer-2`, the `manual maintainer email` channel, `Dispatch status: sent`, `Message template version: private-preview-reviewer-handoff-package-v0.1`, and the `waiting_for_reviewer_feedback` state.

The local sensitive information scan must be run with the real reviewer emails supplied out of band at execution time. The real emails must not be committed into docs, tests, scripts, or examples. The test also requires Git tracked docs not to record real reviewer email addresses, external issues, invented reviewer feedback, OTPs, cookies, Cloudflare Access tokens, login query-state, raw Access redirect URLs, reviewer credentials, or unrelated personal data.

## Private Preview External Reviewer Feedback Intake

Private Preview External Reviewer Feedback Intake v0.1 is verified through structure-level tests and sensitive information scanning.

The structure test requires `docs/operations/private-preview-external-reviewer-feedback-intake-v0.1.md` and cascade docs to record `Intake status: waiting_for_reviewer_feedback`, `Feedback received: no`, `external-reviewer-1`, `external-reviewer-2`, the sensitive material redaction gate, `No reviewer feedback was invented`, `No feedback triage was started`, and `No external issue was created`.

The test intentionally does not assert any reviewer decision such as accepted or changes_requested because no real reviewer feedback exists yet. Triage remains blocked until redacted real feedback is received.
