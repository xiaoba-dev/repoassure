# Examples

Reserved for small sample target repos and integration examples.

Do not place generated hardening output for external target repos here. Target repo artifacts should stay in the target repo's `.hardening/` directory unless a test fixture explicitly requires otherwise.

## GitHub Actions

- `github-actions/repoassure-local-first.yml` demonstrates the v0.3 local-first GitHub Action wrapper.
- Artifact upload in the example is explicit opt-in and limited to selected summaries; the wrapper itself does not upload target repo source, logs, screenshots, traces, env values, or private artifacts.
