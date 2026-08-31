# Show Explorer — Design Document

Architecture and requirements for the Jolly frontend take-home: a small web app for browsing TV shows via the public [TVMaze API](https://www.tvmaze.com/api). No design is provided; we use a consistent shadcn/ui design system on top of Tailwind CSS.

This document is the product and architecture source of truth. Implementation details that change with code (folder trees, current routes) also live in [FRONTEND.mdc](./FRONTEND.mdc) and must stay in sync.

---

## 1. Goal

Ship a React web app a reviewer can clone, run locally, and use to:

1. Browse shows in an infinitely scrolling list.
2. Search by name and filter by status, and favorites.
3. Open a show to see details and episodes.
4. Favorite / unfavorite shows, with persistence and a dedicated view.

Platform choice: **React (web)**, not React Native. The existing Vite + TypeScript repo, quality gates, and Cursor rules are a better fit for a reviewable web submission.

---

## 2. Functional requirements

These must be completed for the project to be considered done.

| ID    | Requirement                                                               | Source     | Acceptance                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-1  | **Show list** — infinitely scrolling list of shows via `GET /shows?page=` | Assignment | Load more as the user scrolls. Each item shows at least **name**, **image**, and **status**.                                                                             |
| FR-2  | **List states** — loading, error, and empty                               | Assignment | Distinct UI for first-page load, fetch failure (retry), and no results.                                                                                                  |
| FR-3  | **Search** — search shows by name via `GET /search/shows?q=`              | Assignment | Typing in the search field queries TVMaze after debounce (see §5.2). Clearing search returns to the paginated browse list.                                               |
| FR-4  | **Status filter** — Running / Ended / To Be Determined                    | Assignment | User can filter the current result set by status. Include an "All" option. TVMaze does not expose a status query param; filter **client-side** on already-fetched shows. |
| FR-5  | **Detail view** — opening a show shows its details                        | Assignment | Dedicated route. Show identity, image, status, and other useful fields from the show payload (summary, genres, rating when present).                                     |
| FR-6  | **Episodes** — `GET /shows/:id/episodes`                                  | Assignment | Episodes render on the detail view. **Must** group by season (assignment bonus; we treat it as in-scope).                                                                |
| FR-7  | **Favorites toggle** — favorite / unfavorite a show                       | Assignment | Available from list cards and the detail view. Immediate UI feedback.                                                                                                    |
| FR-8  | **Favorites persistence** — survive reloads                               | Assignment | Stored in `localStorage` (show ids plus a small display snapshot). No secrets.                                                                                           |
| FR-9  | **Favorites view** — own screen                                           | Assignment | Route lists only favorited shows. Empty state when none.                                                                                                                 |
| FR-10 | **Favorites count** — visible in the chrome                               | Assignment | Header/nav shows the current count and stays in sync across list, detail, and favorites.                                                                                 |

### 2.1 Explicit product calls

The assignment allows reasonable calls when something is ambiguous. These are the ones we lock in:

- **Web over React Native** — see §1.
- **Search vs browse are different APIs** — list returns `Show[]`; search returns `{ score, show }[]`. Normalize to one `Show` model in a service layer before UI.
- **Status filter is client-side** — avoids extra TVMaze requests and works for both browse (accumulated pages) and search (single response).
- **Episodes grouped by season** — in scope, not a stretch.
- **Favorites store a snapshot** (id, name, image, status) so the favorites view does not need to re-fetch every show on load.
- **Images** — use `image.medium` in lists and `image.original` on detail; placeholder when `image` is `null`.

---

## 3. Non-functional requirements

These constrain _how_ we build FR-1–FR-10. They are also definition of done.

| ID     | Requirement                                      | Why                                                                                                                                                                                                                                |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1  | **TVMaze rate limit: ~20 requests / 10 seconds** | Assignment. Caching, debounce, and pagination strategy exist to stay under this cap.                                                                                                                                               |
| NFR-2  | **No API key / no auth / no backend**            | Public TVMaze API; all state runs in the browser.                                                                                                                                                                                  |
| NFR-3  | **Perceived performance**                        | Debounced search, cached detail/episode reads, infinite query so returning to the list does not refetch every page.                                                                                                                |
| NFR-4  | **Correctness under concurrency**                | No stale search results, no mixed browse/search rows, no favorite-count drift. See §5.3.                                                                                                                                           |
| NFR-5  | **Accessibility**                                | Keyboard-usable controls (shadcn Select, Dropdown Menu, Button, Input). Images have alt text. Loading/error/empty are announced, not color-only.                                                                                   |
| NFR-6  | **Responsive layout**                            | Usable from ~375px to desktop. Browse uses a cinematic hero, one Your Next Watch rail, and a growing poster grid for infinite scroll; search and My List use a responsive grid. Detail is a readable single column. Plan web + mobile UX first (`.cursor/rules/design-ux.mdc`). |
| NFR-7  | **Consistent design system**                     | **All core UI primitives come from shadcn/ui. Do not recreate them.** See §6.                                                                                                                                                      |
| NFR-8  | **Type-safe API boundary**                       | Zod schemas parse TVMaze payloads. Invalid records fail closed (skip or error), never crash the tree with `any`.                                                                                                                   |
| NFR-9  | **Testability**                                  | Vitest + Testing Library. Network is mocked. New behavior is test-first. Target ≥ 80% statement coverage on `src/`.                                                                                                                |
| NFR-10 | **Quality gates**                                | `check:spaghetti`, `check:security`, `knip`, lint, typecheck, tests, build, audit, docs sync — all green before done.                                                                                                              |
| NFR-11 | **Deterministic tests**                          | No real network in unit tests. Fixtures for list, search, detail, and episode shapes.                                                                                                                                              |
| NFR-12 | **Security (frontend)**                          | No secrets in source or `localStorage`. No `dangerouslySetInnerHTML` for show summaries unless HTML is sanitized. Prefer text extraction or a sanitizer if summary HTML is rendered.                                               |
| NFR-13 | **Submission artifacts**                         | Public GitHub repo (or shared access) and a README covering run instructions, decisions/trade-offs, what was left out, and AI-usage disclosure.                                                                                    |

---

## 4. High-level architecture

```
┌─────────────────────────────────────────────────────────┐
│  App shell (providers, layout, nav + favorites count)   │
│  QueryClientProvider · Router · shadcn primitives       │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│  Feature modules         │   │  Design system          │
│  shows · show-detail ·   │   │  src/components/ui/*    │
│  favorites               │   │  (shadcn only)          │
└─────────────┬────────────┘   └─────────────────────────┘
              │
              ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│  Services + Zod schemas  │──▶│  TVMaze REST            │
│  normalize list vs search│   │  /shows, /search/shows, │
│                          │   │  /shows/:id/episodes    │
└──────────────────────────┘   └─────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│  TanStack Query cache    │
│  + debounce (search)     │
│  + localStorage favorites│
└──────────────────────────┘
```

**Complexity note:** list rendering is O(n) over the accumulated page of shows. Status filter is a single pass. Season grouping is O(e) over episodes with a `Map<number, Episode[]>`. Favorites lookups use a `Set` of ids (O(1) per card), never `Array.includes` over the full list on each render.

---

## 5. Architecture choices

### 5.1 TanStack Query (React Query) — server-state cache

**Choice:** `@tanstack/react-query` is the cache and request lifecycle layer for every TVMaze read.

**Why not** `useEffect` **+ local state:** infinite scroll, search, detail, and episodes share data. Manual caching will either refetch too often (rate limit) or serve stale rows after races. React Query gives request identity (`queryKey`), cancellation (`AbortSignal`), retries, and status flags (`isPending`, `isError`, `isFetchingNextPage`) that map directly to FR-2.

**Cache policy (locked):**

| Query       | Key (conceptual)                      | Strategy                                                                                                 |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Browse list | `['shows', 'list']`                   | `useInfiniteQuery`. Page param from `GET /shows?page=`. `staleTime` 1 minute.                            |
| Search      | `['shows', 'search', debouncedQuery]` | `useQuery`. Enabled only when `debouncedQuery` is non-empty.                                             |
| Show detail | `['shows', showId]`                   | `useQuery`. Populated from list data via `placeholderData` / initial data when we already have the show. |
| Episodes    | `['shows', showId, 'episodes']`       | `useQuery`. Cached per show so back-navigation is instant.                                               |

**Rate-limit alignment (NFR-1):**

- Default `staleTime` of **1 minute** so revisiting a show or the list does not hit the network while the cache is still fresh.
- `gcTime` long enough that back-stack navigation reuses pages.
- Infinite query keeps already-fetched pages; scrolling up does not refetch.
- Search does not run until debounce settles (see §5.2).
- No polling. No prefetch-on-hover of every card (that would burn the 20/10s budget).
- TVMaze's terminal pagination `404` is normalized to an empty page and marks the
  catalog complete — that page is never requested again and no end-of-list loader is shown.
- Browse keeps a stable Your Next Watch rail. Later pages append to one All Shows grid
  so cards never reshuffle across fake category rows.
- A `429` retries in the background with backoff. Loaded rows and scroll position stay put;
  no footer spinner or error banner is swapped in.

`QueryClientProvider` wraps the tree in `src/app/providers.tsx`. Query functions live in module `services/`, not in components.

### 5.2 Debounced search

**Choice:** the search `Input` is **controlled immediately** (what the user types). The React Query key uses a **debounced** string (~300ms).

**Why:** `GET /search/shows?q=` on every keystroke would exceed TVMaze’s rate limit (NFR-1) and flicker the list. Debouncing coalesces typing into one request.

**Behavior:**

- `q === ''` → browse infinite list (search query disabled).
- While debounce is pending, keep showing the previous result set (or a lightweight “updating” indicator), not a blank page.
- Status filter applies to whatever list is on screen (browse pages or search hits).
- Implementation: a small `useDebouncedValue` hook in the shows module (one hook per file).
- **URL sync:** search and status filter are mirrored in the query string on `/` so views are shareable and survive reload/back/forward:
  - `q` — search text (omitted when empty)
  - `status` — `Running`, `Ended`, or `To Be Determined` (omitted when `all`)
  - Example: `/?q=mock&status=Ended`

### 5.3 Race conditions

Several races exist in this UI. We treat them as required correctness, not polish.

| Race                                    | What goes wrong                                                              | Mitigation                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fast typing `g` → `gi` → `girls`        | Response for `gi` arrives after `girls` and overwrites the list              | Debounce + React Query: each `queryKey` is unique; in-flight query is **aborted** via `signal` when the key changes. UI only binds to the current key. |
| Search then clear                       | Search hits mix into paginated browse rows                                   | Browse and search are **different queries**. The page renders exactly one of: infinite list **or** search results, never concatenated.                 |
| Status filter while a page is in flight | Filter applied to a partial page, then a new page of unfiltered rows appends | Filter is a **pure derivation** of `(pages                                                                                                             | searchHits, status)`. New pages flow through the same derivation. |
| Open show A, quickly open show B        | Episodes for A paint on B’s page                                             | Detail/episode `queryKey` includes `showId`. React Query will not apply A’s data to B’s observers.                                                     |
| Favorite toggle vs reload               | Two tabs or Strict Mode double-write                                         | Favorites store writes go through a single module store; persist is the serialized snapshot, not ad-hoc `localStorage.setItem` in components.          |
| Infinite scroll + search                | Sentinel fires and requests `page=N` during search                           | Infinite query `enabled` is false while search is active.                                                                                              |

**Rule:** every `fetch` / `queryFn` must accept and pass `AbortSignal`. Never ignore out-of-order JSON by sequence-number hacks when the cache already keys by request identity.

### 5.4 Tailwind CSS — styling library

**Choice:** Tailwind CSS **v4** (Vite plugin, CSS-first `@theme`).

shadcn/ui Nova primitives emit v4-only utilities (`gap-(--card-spacing)`, `data-open:`, `@theme inline`). Tailwind v3 cannot compile them, so the styling library is v4.

**Rules:**

- Layout and spacing via utility classes (`flex`, `gap-*`, grid). **Never** `space-y-`* / `space-x-*`.
- Color and typography via **semantic tokens** (`bg-background`, `text-muted-foreground`, `bg-card`). No raw `bg-blue-500` in product UI.
- `className` on shadcn components is for **layout** (width, grid placement), not for re-skinning variants that already exist.

Tokens live in `src/styles/index.css`. There is no `tailwind.config.js`.

### 5.5 shadcn/ui — component library

**Choice:** shadcn/ui (Nova preset, Base UI primitives), installed as source under `src/components/ui/`.

**Why:** the assignment asks for a clean UI with no mockups. A generated design system gives accessible Button, Input, Select, Card, and menus without inventing one. Components are copied into the repo (not a black-box npm UI kit), which fits this codebase’s “source is reviewable” bar.

Installed now (via ShadCN MCP + CLI):

| Primitive         | File                                  | Use in this app                                                             |
| ----------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| **Button**        | `src/components/ui/button.tsx`        | Favorites toggle, retry, nav actions, load-more fallback                    |
| **Card**          | `src/components/ui/card.tsx`          | Show tiles, detail header, empty/error panels                               |
| **Input**         | `src/components/ui/input.tsx`         | Search-by-name field                                                        |
| **Select**        | `src/components/ui/select.tsx`        | Status filter (All / Running / Ended / To Be Determined)                    |
| **Dropdown Menu** | `src/components/ui/dropdown-menu.tsx` | Overflow actions (e.g. card menus) where a menu is a better fit than Select |

Also installed: `Badge`, `Skeleton`, `Empty`, `Spinner`, `Separator`, `ToggleGroup` (status filter), `InputGroup` (search).

### 5.6 Modular folders — one scoped part of the app per module

**Choice:** feature modules under `src/modules/<name>/` as enforced by `.cursor/rules/spaghetti-checker.mdc`.

Planned modules (replace the starter `home` module as features land):

```
src/modules/
  shows/           # browse list, search, status filter, show card
    pages/
    components/
    hooks/         # useDebouncedValue, useShowsList, …
    services/      # TVMaze client + normalizers
    schemas/       # Zod
    types/
    routes.ts
    __tests__/
  show-detail/     # details + episodes by season
  favorites/       # persisted favorites, count, favorites page
```

Shared, non-feature code:

| Path                     | Responsibility                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/`     | **shadcn primitives only** (do not split; do not reimplement)                                                  |
| `src/common/components/` | App-level compositions that **wrap** shadcn (header, show-status badge wrapper). Still one component per file. |
| `src/common/layouts/`    | Root / app layout                                                                                              |
| `src/app/providers.tsx`  | `QueryClientProvider`, router-level providers                                                                  |
| `src/routes/index.tsx`   | Central route table                                                                                            |
| `src/lib/utils.ts`       | `cn()` for class merging                                                                                       |

Cross-module imports go through `routes.ts` / a public barrel — never another module’s `components/` or `hooks/`.

---

## 6. Design system law — do not recreate core components

**Visual language:** Netflix-inspired TV UI — cinematic black canvas (`#000`), Netflix red
primary (`#E50914`), white foreground, muted metadata (`#b3b3b3`), pill navigation and CTAs,
hero spotlight for the featured show, a Your Next Watch rail, and an infinite All Shows grid. Tokens
live in `src/styles/index.css`; compose shadcn primitives only — never fork Button/Card/etc.

**All core components must not be re-created.** The design system is shadcn/ui. Product UI is
composition of those primitives plus Tailwind layout utilities.

### 6.1 Must use (never duplicate)

| Need                          | Use                                                                                               | Do not                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Actions                       | `<Button variant="…" size="…">`                                                                   | Styled `<button>` / custom `IconButton`                                 |
| Text fields                   | `<Input>` (and later `InputGroup` / `Field`)                                                      | Styled `<input>`                                                        |
| Status filter / single choice | `<ToggleGroup>` + `ToggleGroupItem` (All / Running / Ended / TBD)                                 | Native `<select>` restyle, or a row of handmade chips                   |
| Menus                         | `<DropdownMenu>` + `DropdownMenuGroup` + `DropdownMenuItem`                                       | Absolute-positioned `<div>` lists                                       |
| Surfaces                      | `<Card>`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` | Bespoke “show card” chrome that reimplements padding, radius, and rings |
| Loading placeholders          | shadcn `Skeleton` (when added)                                                                    | Hand-rolled `animate-pulse` boxes                                       |
| Empty states                  | shadcn `Empty` (when added)                                                                       | One-off dashed-border empty markup                                      |
| Status pills                  | shadcn `Badge` (when added)                                                                       | Custom colored `<span>`s                                                |
| Toasts                        | `sonner` (if/when added)                                                                          | Custom toast stack                                                      |
| Class merging                 | `cn()` from `@/lib/utils`                                                                         | String concat / ad-hoc ternaries                                        |

### 6.2 Allowed custom code

- **Layout** around primitives (CSS grid of Cards, page margins, infinite-scroll sentinel).
- **Feature components** that compose primitives (`ShowCard` = Card + image + Button + Badge).
- **New shadcn primitives** added through the CLI / MCP when a screen needs them (`npx shadcn@latest add <name>`), then composed.

### 6.3 Forbidden

- Copying a shadcn Card into `src/modules/**` and renaming it.
- Forking `button.tsx` to add product-specific variants that `variant` / `size` already cover.
- Building a parallel “design kit” under `src/common/components/` that restyles native elements to look like shadcn.
- Overriding primitive colors/typography via `className` (`text-blue-500` on `Button`, replacing `bg-primary`).

shadcn files under `src/components/ui/` export several related parts on purpose (Card, Select, Dropdown Menu). That is exempt from the spaghetti “one component per file” rule. Do not split those files to satisfy the checker.

---

## 7. Routes (target)

| Path             | Page                                 | Module        |
| ---------------- | ------------------------------------ | ------------- |
| `/`              | Show list (browse + search + filter) | `shows`       |
| `/shows/:showId` | Show detail + episodes by season     | `show-detail` |
| `/favorites`     | Favorited shows                      | `favorites`   |

The starter `/` Home page is temporary scaffolding until `shows` lands.

---

## 8. TVMaze integration

Base URL: `https://api.tvmaze.com` (HTTPS only).

| Operation | Endpoint                      | Notes                                                     |
| --------- | ----------------------------- | --------------------------------------------------------- |
| Browse    | `GET /shows?page={n}`         | `n` starts at 0. Empty array means no more pages.         |
| Search    | `GET /search/shows?q={query}` | Different shape: `{ score, show }[]`.                     |
| Show      | `GET /shows/:id`              | Use when the list snapshot is insufficient; prefer cache. |
| Episodes  | `GET /shows/:id/episodes`     | Group by `season`.                                        |

Network adapter: `fetch` with `AbortSignal`, `Accept: application/json`. Zod parse after JSON. Map search hits with `hits.map((h) => h.show)`.

---

## 9. Testing strategy

- **Red → green → refactor** for every FR.
- Tests in `__tests__/`, never beside source.
- Mock `fetch` / QueryClient; never hit TVMaze in unit tests.
- **E2E:** Playwright in `e2e/` uses `test-fixtures/tvmaze.mock-data.ts` (real TVMaze snapshots in one file; mocked in test/e2e only, never in dev).
- Cover: list pagination, debounce (fake timers), abort/race (out-of-order responses), status filter, favorites persist (mocked `localStorage`), episode grouping, error/empty/loading UI.
- shadcn primitives are covered by a smoke render test so the design-system files stay in the graph; product tests assert user-visible behavior on composed feature components.

---

## 10. Out of scope (unless time remains)

- User accounts, cloud-synced favorites.
- Offline-first / service worker.
- React Native.
- Prefetching every card on hover (rate limit).
- Pixel-perfect custom illustration; we ship a clean shadcn UI.

With more time: virtualized grid for very long lists, richer episode search, and dark-mode toggle (tokens already exist).

---

## 11. Definition of done

A feature is not done until:

1. FR/NFR in this document that it claims are met.
2. UI is composed from shadcn primitives (§6), not custom replacements.
3. Tests exist and pass; quality gates in `.cursor/rules/quality-gating.mdc` are green.
4. [FRONTEND.mdc](./FRONTEND.mdc) folder tree and routes match the code.
5. README (submission) can explain this architecture, including debounce, React Query cache, and race handling.
