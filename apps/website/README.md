# @repoassure/website

The public RepoAssure website. Single page, two locales, no backend.

## Running it

```bash
pnpm dev:website        # vite dev server on 127.0.0.1:5173
pnpm build:website      # production bundle into dist/
pnpm typecheck:website
```

Guardrails run from the repository root:

```bash
pnpm vitest run tests/unit/public-website.test.ts
node scripts/verify-website.mjs        # browser-level checks, default port 5174
```

## Information architecture

Organised around the four questions [ADR-0013](../../docs/adr/0013-codex-security-and-security-assurance-lane.md) records the product as answering — is this repo ready to ship, what evidence proves it, what is still blocking acceptance, and what should the next AI IDE fix first. [ADR-0046](../../docs/adr/0046-repoassure-design-system-v2-and-information-architecture.md) records the restructure.

```
Header · Hero · #answers · #assurance-graph · #how-it-works
  · #roles · #artifacts · #open-core (+ #roadmap) · #trust
  · #private-preview · Footer
```

Two distinctions the structure encodes deliberately:

- **`#how-it-works` is a sequence; `#roles` is a cast.** They shared one section under an i18n key named `steps`, which made the section read as neither.
- **Assurance graph nodes declare reachability.** Patch plan and acceptance are pnpm scripts inside this repository, not commands the distributed CLI exposes. Showing them unqualified implied a chain the product does not ship.

Primary navigation stays at five items. That is a frozen decision in [the v0.2 roadmap](../../docs/design/website-uiux-roadmap-v0.2.md) §3; the labels changed with the restructure, the count did not.

## Copy

**All user-visible strings live in `src/i18n.ts`.** This is not a style preference. The forbidden-claim guard in `tests/unit/public-website.test.ts` scans that file and the serialized locale objects; copy moved into a component silently leaves the guard's reach.

`en` and `zh-CN` are typed against one `WebsiteCopy` shape, so TypeScript enforces structural parity — you cannot add an English string without its Chinese counterpart. Arrays are positional: icons bind by index, not by key, so reordering an array reassigns icons.

There is no interpolation and no ICU. Every value is a complete literal, and emphasis has to come from splitting a string across sibling keys rather than markup.

## Claim boundaries

The site is live and search-indexable, so these apply on deploy, not hypothetically.

Never claim SaaS, Team Cloud, Enterprise, hosted dashboard, SSO, or RBAC availability. Never claim a published public repository or npm package. No customer logos, analyst badges, testimonials, star counts, or certifications — none are held.

Two traps the patterns cannot distinguish from real claims, because they match bare substrings:

- Writing "there is no public npm package yet" **fails**. Say "package publication remains blocked".
- Writing "我们不默认上传源代码" **fails** — `不` sits outside the matched phrase. The shipped copy uses `默认不上传源代码`, with the negation inside. Keep that word order.

Artifacts are **content-hashed**, never *signed*. Hashing is implemented and `hardening verify` checks it; signing would need a key system that does not exist. To a security reviewer those are different claims, and the patterns now enforce the distinction.

## Theme

Light is the default surface under Design System v2. Dark is opt-in. The assurance graph stays deliberately dark — it uses the console token layer, which is theme-independent because an instrument surface should not follow the page.

Brand assets, `theme-color`, and the web manifest all encode the theme and have to move together.

## Related

- [`@repoassure/design-system`](../../packages/design-system/README.md) — tokens and the component library
- [Website spec](../../docs/product/specs/public-website-spec-v0.1.md)
- [UI/UX roadmap v0.2](../../docs/design/website-uiux-roadmap-v0.2.md) — §3 lists what remains frozen
