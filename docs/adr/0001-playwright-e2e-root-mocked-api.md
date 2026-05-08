# Playwright E2E at root level, separate from Vitest, with mocked API

The project has two test layers with different runtime requirements: Vitest (unit/component) lives in `/client` and `/server`, while Playwright (E2E) lives in `/e2e` at the root. We keep them separate because Playwright requires its own browser binaries, config, and runner — embedding it in `/client` would tangle two incompatible test systems.

E2E tests mock the API via `page.route()` rather than running a real server. This avoids SQLite side effects between runs, removes the need to orchestrate server startup in CI, and keeps tests deterministic.

## Considered Options

- Playwright inside `/client` alongside Vitest — rejected: conflicting configs, Playwright and Vitest don't share a runner.
- E2E against a real server — rejected: requires DB setup/teardown, test isolation harder, slower feedback loop.
