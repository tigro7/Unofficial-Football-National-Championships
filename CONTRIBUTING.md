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

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and is updated manually alongside significant milestones.
