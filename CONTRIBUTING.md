# Contributing

RepoAssure is currently prepared for a future public source release, but the repository remains private until the public release checklist is complete and publication is explicitly authorized.

## Contribution Policy

- Contributions must preserve the local-first privacy boundary.
- Contributions must not upload target repository source, logs, screenshots, traces, env values, tokens, cookies, or private artifacts by default.
- Contributions must keep generated artifacts, build outputs, local hardening runs, env files, private keys, and local logs out of tracked files.
- User acceptance impact must be documented when a change affects reports, repair artifacts, generated tests, or AI IDE handoff contracts.

## Developer Certificate of Origin

RepoAssure uses the Developer Certificate of Origin for inbound contributions.

By contributing, you certify that you have the right to submit the contribution under the project license and agree to the Developer Certificate of Origin terms. Use signed-off commits when contribution intake becomes public:

```bash
git commit -s
```

No CLA is required for the initial public release plan. This decision can be revisited if enterprise contribution volume or legal requirements change.

## Quality Gates

Before submitting a change, run the focused tests for the touched area and then the relevant repository gates:

```bash
pnpm repo:hygiene
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm goal:audit
```

Use full acceptance when a change affects runtime behavior, browser execution, generated artifacts, release readiness, or goal audit evidence:

```bash
pnpm acceptance -- --full --browser
```
