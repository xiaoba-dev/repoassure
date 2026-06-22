# ADR-0010: RepoAssure Brand Positioning

- Status: Accepted
- Date: 2026-06-22
- Deciders: hardening-mcp maintainers

## Context

ADR-0009 positions the product as an AI code quality and delivery assurance layer rather than another AI IDE. The repository still uses `hardening-mcp` as its implementation name, but a durable product brand is needed before creating the private GitHub repository and before future public release planning.

Brand search and competitor review found active adjacent products using names around `VibeProof`, `AgentProof`, `CodeGate`, `AgentGate`, `CodeAsure`, and `VibeCheck`. These products occupy nearby security, agent trust, gateway, checklist, and developer-tool positions. The full research record is `docs/product/research/competitive-landscape-v0.1.md`.

The brand must avoid implying that the product is only an MCP server, only a security scanner, only an agent monitor, or only a launch checklist.

## Decision

Adopt RepoAssure as the product brand.

Use this product promise:

> RepoAssure turns AI-generated repositories into testable, repairable, shippable software.

Keep `hardening-mcp` as the current internal package and CLI implementation name until a separate rename migration is planned and tested.

Use `repoassure` as the preferred private GitHub repository name if available.

Do not use these names for the product or repo:

- VibeProof
- AgentProof
- CodeGate
- AgentGate
- CodeAssure / CodeAsure
- VibeCheck

## Cascaded Documents

- `docs/product/research/competitive-landscape-v0.1.md` records the competitor and naming landscape.
- `docs/product/strategy/commercialization-strategy-v0.1.md` uses RepoAssure as the commercial product brand.
- `docs/product/specs/mvp-spec-v0.2.md` records the current product name while preserving implementation naming.
- `docs/product/strategy/private-repo-readiness-v0.1.md` records `repoassure` as the preferred private GitHub repo name.
- `README.md` introduces RepoAssure while retaining `hardening-mcp` as the current implementation workspace.

## Consequences

### Positive

- The brand aligns with repo-level acceptance and delivery assurance.
- It avoids the most crowded `Vibe`, `Proof`, `Gate`, and `Check` naming clusters.
- It works for individual developers, AI delivery teams, and future enterprise governance.
- It leaves room for Web, Python/CLI, Agent capability, Team Cloud, and on-prem product surfaces.

### Negative

- The implementation name and product brand now differ, so docs must be explicit during the transition.
- A later full rename will require package, CLI, docs, and artifact migration planning.
- `RepoAssure` still needs legal, trademark, domain, GitHub, npm, and package namespace review before public release.

### Follow-up

- Create the private GitHub repo as `repoassure` if the name is available.
- Keep package and CLI names unchanged until a dedicated rename ADR or migration spec is accepted.
- Re-run naming and trademark checks before public release.
- Update future public release materials to use RepoAssure as the primary brand.
