# Contributing

## Code Style

- TypeScript everywhere.
- Run `pnpm lint` and `pnpm typecheck` before opening a PR.
- Prefer small, focused modules.

## Branching & Commits

- Use short-lived feature branches.
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`.
- Avoid force-push on shared branches.

## Adding a Challenge

1. `pnpm create-challenge challenge-002`
2. Add spec + tests under `challenges/challenge-002/`.
3. Update seed script or add a new seed.
4. Document any special runner requirements.

## Tests

- `pnpm test` for unit tests.
- `pnpm test:e2e` for Playwright smoke tests.

