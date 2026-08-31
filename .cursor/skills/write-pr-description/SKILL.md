---
name: write-pr-description
description: >-
  Drafts pull request descriptions for the current branch using
  .github/PULL_REQUEST_TEMPLATE.md. Use when the user asks for a PR
  description, PR body, or to write/open a pull request for the current branch.
---

# Write PR Description

Generates a PR description from **branch changes** and the repo template at
`.github/PULL_REQUEST_TEMPLATE.md`. Read that file first — section headings and
checklist must match it exactly.

## Workflow

Copy this checklist and track progress:

```
- [ ] Step 1: Gather git context (parallel)
- [ ] Step 2: Analyze commits and diff
- [ ] Step 3: Fill template sections
- [ ] Step 4: Output markdown (+ create PR if asked)
```

### Step 1: Gather git context

Run these **in parallel** from the repo root:

```bash
git status
git branch -vv
git log --oneline -20
```

Resolve the base branch (`master` or `main` — whichever exists and is the default):

```bash
BASE=$(git merge-base HEAD master 2>/dev/null || git merge-base HEAD main)
git log --oneline "$BASE"..HEAD
git diff "$BASE"...HEAD --stat
git diff "$BASE"...HEAD --name-only
```

If the user names a different base branch, use that instead.

### Step 2: Analyze changes

From commits + diff, identify:

| Signal | Where to look |
| ------ | ------------- |
| Feature scope | Commit messages, `src/modules/` |
| UI changes | `src/modules/`, `src/common/` |
| Tests added | `**/__tests__/**`, `*.test.ts`, `*.test.tsx` |
| Docs | `docs/*.mdc` |
| Tooling / CI | `knip.json`, `.github/`, `scripts/`, `package.json` |

**Linear ticket from branch name:** extract `LIT-NNN` (case-insensitive) from the
current branch, e.g. `luizepauloxd/lit-10-add-feature` → `LIT-10`. If no ticket ID
is found, leave the Linear section as a placeholder comment.

### Step 3: Fill template sections

Use the structure from `.github/PULL_REQUEST_TEMPLATE.md`.

**Section rules:**

- **What Changed?** — factual, reviewer-oriented bullets; call out breaking changes explicitly.
- **Why** — one short paragraph or 2–3 bullets; explain user impact, not implementation.
- **Screenshots** — never leave empty without a note; for non-UI PRs say N/A.
- **Checklist** — leave unchecked unless the user confirms CI/E2E status.

### Step 4: Deliver output

**Description only (default):** return the filled markdown in the chat response.
Do not create a PR unless the user asks.

**Create PR (when requested):** follow the user rule for pull requests.

## Quality bar

- Summarize **all commits** on the branch (`$BASE..HEAD`), not only the latest.
- Do not invent features not present in the diff.
- Note docs updates under **What Changed?** when `docs/` was touched.

## Do not

- Skip reading `.github/PULL_REQUEST_TEMPLATE.md` — always align with its sections.
- Push or open a PR without explicit user request.
- Mark checklist items as done without user confirmation.
