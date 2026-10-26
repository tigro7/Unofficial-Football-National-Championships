# Contributing

This is a personal project, but these conventions keep the git history readable and the changelog easy to maintain.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Vercel Postgres
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature or page |
| `fix` | A bug fix |
| `content` | Copy/text changes with no code change |
| `style` | Visual/UI tweaks with no logic change |
| `chore` | Maintenance, dependency updates, config |
| `docs` | Documentation only (README, CHANGELOG, CONTRIBUTING) |
| `refactor` | Code restructuring with no behaviour change |
| `perf` | Performance improvement |

### Scopes

| Scope | What it covers |
|---|---|
| `home` | `app/page.tsx` and home-page components |
| `match` | Match detail page and add-match form |
| `team` | Team detail page |
| `ranks` | Rankings and statistics tables |
| `timeline` | Historical timeline page and chart components |
| `about` | About page |
| `blog` | Blog pages and API endpoints |
| `api` | API routes under `app/api/` |
| `stats` | Stats calculation logic (`statsCalc.tsx`) and stats endpoints |
| `db` | Database queries, schema changes |
| `auth` | NextAuth configuration and session handling |
| `layout` | Header, footer, navigation, root layout |
| `design` | Global styles, typography, colour palette |
| `types` | TypeScript interfaces in `lib/definitions.ts` |
| `lib` | Shared helpers in `lib/` and `utils/` |
| `analytics` | Vercel Analytics / Speed Insights |

### Examples

```
feat(match): add note field to match edit form
fix(stats): recalculate back-to-back on match delete
content(about): update league descriptions
style(ranks): highlight current title holder row
chore(deps): bump next to 15.1.0
docs: update CHANGELOG for v1.2.0
```

### Rules

- Use the **imperative mood**: "add", not "added" or "adds"
- Keep the first line **under 72 characters**
- Do **not** end the description with a period
- Breaking changes get a `!` after the type: `feat(api)!: change matches endpoint response shape`

## Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_USER` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_SECRET` | NextAuth session encryption secret |
| `NEXT_PUBLIC_BASE_URL` | Canonical base URL used for client-side fetch calls |
| `POSTGRES_URL` | Vercel Postgres connection string |
| `AUTOMATION_SECRET` | Pre-shared bearer token that allows GitHub Actions to call the POST `/api/[league]/matches` endpoint without a user session. Must be set both in Vercel (production env) and as a GitHub repository secret. |

## Dependency Update Strategy

Dependabot is configured to open PRs monthly for `npm` packages under `perennial-leagues/`. The workflow for handling those PRs is:

| Bump type | Action |
|---|---|
| **Patch** (`x.x.N`) | Merge immediately if CI is green — no manual review needed |
| **Minor** (`x.N.0`) | Skim the changelog; merge if CI is green and no breaking notes |
| **Major** (`N.0.0`) | Read migration guide, test locally, update any affected code before merging |

**Security alerts** (Dependabot or `npm audit`) are treated as bugs and addressed within 48 hours regardless of bump type.

> **Known exception:** `postcss` (high) is bundled inside `next@15.x` and cannot be fixed without upgrading to Next.js 16. CI uses `--audit-level=critical` until that upgrade is scheduled.

When merging a dependency PR, use commit type `chore(deps)`:

```
chore(deps): bump next from 15.1.0 to 15.2.0
```

## Automatic match result updates

A GitHub Actions workflow (`check-pending-matches.yml`) runs daily at 07:00 UTC. It:

1. Fetches all `outcome='n'` matches from the UFNC API whose `data` is in the past.
2. Looks up each result on the [football-data.org](https://www.football-data.org/) API.
3. If results are found, opens a pull request on the `match-results/YYYY-MM-DD` branch with one JSON file per resolved match under `.github/pending-results/`.

**Reviewing and merging the PR** triggers `apply-match-results.yml`, which calls `POST /api/[league]/matches` for each file via the bearer-token auth path.

### GitHub repository variables / secrets required

| Name | Where to set | Purpose |
|---|---|---|
| `UFNC_BASE_URL` | Repository variable (`Settings → Variables`) | Production URL, e.g. `https://ufnc.vercel.app` |
| `FOOTBALL_DATA_API_KEY` | Repository secret | football-data.org v4 API key |
| `AUTOMATION_SECRET` | Repository secret **and** Vercel env var | Shared bearer token for the POST endpoint |

Generate `AUTOMATION_SECRET` with `openssl rand -hex 32`.

### Team name mapping

`.github/scripts/football-data-config.json` maps UFNC team names (as stored in the DB) to the `shortName` values used by football-data.org. If the workflow logs `no match found` for a team, add an entry to the `teams` object for that league.

### `match-result` label

Create a `match-result` label in GitHub Issues (`Settings → Labels`) so the check workflow can tag its PRs and the apply workflow can identify them. Colour suggestion: `#0075ca`.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and is updated manually alongside significant milestones.
