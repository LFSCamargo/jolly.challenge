# Jolly Challenge

Frontend-only React app for the Jolly coding challenge.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Quality gates

```bash
npm run check:spaghetti
npm run check:security
npm run knip
npm run lint
npm run typecheck
npm run test
npm run build
```

See [docs/DESIGN_DOC.md](docs/DESIGN_DOC.md) for requirements and architecture, and
[docs/FRONTEND.mdc](docs/FRONTEND.mdc) for module conventions.

## AI setup

Cursor rules, hooks, and skills in `.cursor/` mirror the `password.manager` workflow —
adapted for this single-app frontend repo.
