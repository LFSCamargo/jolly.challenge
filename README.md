# Show Explorer — Jolly Frontend Challenge

Frontend-only React app for browsing TV shows via the [TVMaze API](https://www.tvmaze.com/api). No backend — all state and logic run in the browser.

**Live repo:** https://github.com/LFSCamargo/jolly.challenge

---

## Quick start

```bash
npm install
cp .env.example .env   # optional — leave API_KEY empty for TVMaze
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Note:** TVMaze is a public API and does **not** require an API key. If `API_KEY` is set in `.env`, the app sends an `Authorization` header, which triggers a CORS preflight that TVMaze rejects with **405**. Leave it blank.

### Quality gates

```bash
npm run check:spaghetti
npm run check:security
npm run knip
npm run lint
npm run typecheck
npm run test
npm run build
npm run audit
```

---

## What I built

| Route | Screen | Highlights |
| ----- | ------ | ---------- |
| `/` | Shows | Infinite browse, debounced search, status filter, cinematic hero, horizontal poster rows |
| `/shows/:showId` | Show detail | Backdrop hero, summary, genres, episodes grouped by season |
| `/favorites` | My List | Persisted favorites (localStorage), empty state, horizontal row |
| `*` | Not found | 404 page |

**Stack:** React 19 · TypeScript · Vite · React Router · TanStack Query · Zustand · Zod · Tailwind CSS v4 · shadcn/ui (Nova / Base UI) · Vitest + Testing Library

Architecture and requirements: [docs/DESIGN_DOC.md](docs/DESIGN_DOC.md)  
Module conventions: [docs/FRONTEND.mdc](docs/FRONTEND.mdc)

---

## 1. Setup — existing boilerplate

I started from my existing frontend boilerplate (adapted from a `password.manager`-style workflow) instead of a blank Vite template. That gave me:

- **React 19 + TypeScript + Vite** with path aliases (`@/`)
- **Quality gates** wired from day one: ESLint, Prettier, TypeScript, Vitest, Husky pre-commit
- **Cursor rules** in `.cursor/rules/` — test-driven development, spaghetti checker, security checker, docs sync, design/UX planning, quality gating
- **Modular layout** under `src/modules/<name>/` with `pages/`, `components/`, `hooks/`, `services/`, `schemas/`, `stores/`, and `__tests__/`

Initial commit scaffolded the repo; the second commit added the design doc and shadcn primitives on Tailwind v4.

---

## 2. System design doc — how I prompted

> `/Users/lfscamargo/Downloads/Jolly Frontend Take-Home Assignment.pdf`
>
> On top of this document can you make a docs/DESIGN_DOC.md with all the architecture choices:
> - React Query for caching the data from the requests
> - Debounced Search
> - Race Conditions
> - TailwindCSS for the styling library
> - ShadCN for the components library
> - Modular folders for each scoped part of the app
>
> Requirements and Non Functional requirements that we must conclude within this project
>
> Also set it up all the shadcn components that we are going to use such as:
> - Cards
> - Inputs
> - Buttons
> - Dropdowns / Selects
>
> Use ShadCN MCP for it
>
> Make sure to specify on the Design Doc that all core components must not be re-created, we must keep a consistent design system using only shadcn components

> configure react-router as well for the project and push

> Can you create a design and ux rule to make sure that we make plannings on top of what we need to build thinking in the design and the usability of the application in both web and mobile

That produced [docs/DESIGN_DOC.md](docs/DESIGN_DOC.md), shadcn primitives on Tailwind v4, React Router wiring, and `.cursor/rules/design-ux.mdc`.

---

## 3. Implementation + design — how I prompted

> Implement the @docs/DESIGN_DOC.md contents into the application following strictly what is defined on the markdown file
>
> Using the API key provided on @.env

> Use shadcn mcp if you need more components don't create more

> I want you to use the Netflix styleguide for all the stuff that we are building, ❤️

*(Netflix prompt included a reference screenshot of the TV UI.)*

### Implementation flow

1. **Infrastructure** — `QueryClientProvider`, `env.ts`, Vite `envPrefix`, test helpers (`render-app.tsx`), removed starter `home` module
2. **`shows` module** — Zod schemas, `tvmaze.service`, debounced search hook, infinite query browse, client-side status filter, hero + horizontal rows, loading/error/empty states
3. **`show-detail` module** — cached show + episodes queries, episodes grouped by season, backdrop hero
4. **`favorites` module** — Zustand store with `localStorage` persist, “My List” page
5. **Routing** — `/`, `/shows/:showId`, `/favorites`, 404; shared header with favorites count
6. **Tests** — services, hooks, store, pages, router (mocked `fetch`, no real network)

### Design decisions

- **Netflix-inspired UI** on top of shadcn — black canvas, red accent (`#E50914`), pill nav/CTAs, cinematic hero gradients, poster-first cards, horizontal scroll rows (“Your Next Watch” / “My List”)
- **shadcn additions via MCP/CLI:** `badge`, `skeleton`, `separator`, `empty`, `spinner`, `toggle-group`
- **Mobile + desktop** — stacked search/filter on small screens; same tasks on both viewports; touch-friendly heart buttons (no hover-only actions)
- **Client-side status filter** — TVMaze has no status query param; filter accumulated browse pages and search results locally
- **Favorites snapshot** — store `id`, `name`, `status`, `imageMedium` so My List renders without re-fetching every show

---

## 4. Bugs and issues — how I fixed them

> I'm facing issues of CORS on my application 405

| Issue | Cause | Fix |
| ----- | ----- | --- |
| **CORS / 405 on TVMaze** | Optional `API_KEY` sent `Authorization: Bearer …`, triggering a CORS preflight TVMaze does not support | Leave `API_KEY` empty in `.env` (public API needs no auth) |
| **shadcn + Tailwind mismatch** | Generated components expected Tailwind v4 | Upgraded to `@tailwindcss/vite`, removed legacy PostCSS config |
| **NavLink + Button `render` broke a11y** | Custom render prop dropped accessible names / classes | Use `buttonVariants()` on `NavLink` / `Link` directly |
| **Duplicate favorites in tests** | Missing `cleanup()` left prior renders subscribed to Zustand | Global `afterEach(cleanup)` + reset favorites store in test setup |
| **`localStorage` / persist in Vitest** | Node 22 partial `localStorage`; Zustand captured storage before polyfill | Split `setup-storage.ts` (runs first) with in-memory storage |
| **`AbortSignal` errors in tests** | jsdom vs Node fetch realm mismatch | Polyfill `fetch`/`Request`/`Response` via `undici` in test setup |
| **Router test flakiness** | “Shows” `<h1>` hidden when cinematic hero is visible | Assert stable UI: `Search shows` input + “Your Next Watch” heading |
| **`IntersectionObserver` undefined** | Infinite scroll sentinel in jsdom | Mock in `src/__tests__/setup.ts` |
| **Spaghetti checker failures** | Multiple exports per file; `.test.ts` in modules | Split `ShowsLoadMore` into its own file; rename module tests to `.test.tsx` |
| **Knip dead-code noise** | Unused barrel exports, orphaned `routes.ts` | Trim public module surfaces; delete unused files/exports |
| **Commit / remote setup** | No remote on first push; commitlint line length | Created GitHub repo; wrapped commit messages |

---

## 5. Finished project — how I achieved it

### Requirements checklist

- [x] Infinite scrolling show list (`GET /shows?page=`)
- [x] Search by name with debounce (`GET /search/shows?q=`)
- [x] Filter by status (Running / Ended / To Be Determined + All) — client-side
- [x] Show detail with summary, genres, rating, image
- [x] Episodes grouped by season
- [x] Favorite / unfavorite from list and detail
- [x] Favorites persist across reloads (`localStorage`)
- [x] Dedicated favorites view with count in header
- [x] Loading, error, and empty states
- [x] Responsive layout (mobile + desktop)
- [x] Tests with mocked network (20 tests, all passing)
- [x] All quality gates green (lint, typecheck, spaghetti, security, knip, build, audit)

### Key technical choices

| Area | Choice | Why |
| ---- | ------ | --- |
| Server state | TanStack Query | Cache browse pages, dedupe detail/episodes, cancel in-flight search |
| Search | 300ms debounce + dedicated query key | Stays under TVMaze rate limit; avoids request spam |
| Races | `AbortSignal` on fetch | Superseded search responses are discarded |
| Favorites | Zustand `persist` | Simple sync API; snapshot avoids N+1 fetches on My List |
| API boundary | Zod schemas | Invalid TVMaze payloads fail closed, no `any` in UI |
| UI | shadcn composition only | One design system; checker enforces no primitive rewrites |

### What I left out (by design)

- User accounts / cloud-synced favorites
- Offline / service worker
- React Native
- Hover prefetch of every card (rate limit)
- Virtualized lists (would add if the catalog grew much larger)

With more time: code-splitting to shrink the main bundle, richer episode UX, and a explicit dark/light toggle (tokens already support dark-first Netflix styling).

---

## AI usage disclosure

This project was built with **Cursor** as an AI-assisted pair programmer. Typical workflow:

1. I wrote prompts for architecture, implementation, and design direction
2. Cursor generated code, tests, and docs following `.cursor/rules/` (TDD, shadcn-only UI, quality gates, docs sync)
3. I reviewed diffs, ran gates locally, and iterated on bugs (CORS, tests, layout)

Human decisions retained: product calls in the design doc (web over RN, client-side filter, Netflix visual direction), module boundaries, and what ships vs. out-of-scope.

---

## Project structure (summary)

```
src/
  modules/
    shows/          # browse, search, filter, hero, rows
    show-detail/    # detail + episodes
    favorites/      # My List + persist store
  common/           # header, layouts, shared badges
  components/ui/    # shadcn primitives (do not recreate)
  routes/           # central route table
  styles/           # Netflix-inspired tokens
```

See [docs/FRONTEND.mdc](docs/FRONTEND.mdc) for the full tree.

---

## Cursor tooling

Rules, hooks, and skills live in `.cursor/` and mirror my existing frontend workflow — adapted for this single-app repo. See `.cursor/rules/quality-gating.mdc` for the full definition of done.
