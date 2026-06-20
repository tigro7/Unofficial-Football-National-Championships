# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- Home page icon
- `og:title`, `og:image`, and canonical link tag in the HTML head (`metadataBase`, `openGraph`, `alternates.canonical` in root layout)
- `CLAUDE.md`, `CONTRIBUTING.md`, `CHANGELOG.md` project documentation
- `.env.example` documenting all required environment variables with placeholder values
- Dependabot config for monthly npm dependency update PRs
- GitHub Actions workflow for monthly `npm audit` (moderate severity threshold)

### Changed
- Last-match fetching now uses match date rather than sequential number

### Fixed
- Sitemap generation crash at build time: fetch helpers now return `[]` on failure instead of `undefined`, preventing "is not iterable" during static export
- Trailing slash normalisation in `robots.ts` and `sitemap.ts` to prevent double slashes in generated URLs
- Removed non-existent `/private/` disallow rule from `robots.ts`
- `sitemap.ts` now includes `premier_league` pages (was missing since v0.5.0)
- About page links to other related projects
- Database schema updated to handle long team names in matches

### Fixed
- Bug in team name normalisation across leagues

---

## [0.5.0] — 2025-03-17

Multi-league support.

### Added
- English Championship (Premier League) as a second supported league
- CC BY-NC-SA licence

### Changed
- Stats calculator upgraded to handle multiple leagues simultaneously
- Team rankings now differentiate by league
- Home page layout updated for multi-league navigation
- Stats recalculated from the public URL instead of internal routes

---

## [0.4.0] — 2025-02-26

SEO, discoverability, and analytics.

### Added
- Vercel Analytics and Speed Insights integration
- Dynamic `sitemap.xml` (capped at 100 match pages)
- `robots.ts` with correct trailing-slash handling
- Dynamic page titles per league and match
- Breadcrumb navigation
- Blog post pagination

### Changed
- Blog post layout improved for readability and link inclusion
- About page updated for consistency
- Footer restructured with proper attribution and metadata

### Fixed
- Tailwind CSS context directory missing from config
- InfoContext missing `"use client"` directive
- SQL column alias missing in ranks query
- Various accessibility and navigation issues across light and dark themes

---

## [0.3.0] — 2025-02-10

Design system, dark theme, and content features.

### Added
- Dark / light theme toggle with system-preference detection
- About page and static assets
- Blog section with post listing and detail pages
- Stats info-box overlays (long descriptions per achievement)
- "Back to Back" and "Decade Dominator" achievement displays
- Swipe left/right gesture on match pages (mobile)
- Head-to-head comparison section on match pages
- Trophy board on match and team pages
- Ranks page with sortable tables (TanStack Table)
- Stats page with league-level aggregates
- Vertical timeline (mobile-responsive)
- "Last 5 matches" component on team pages

### Changed
- Home page updated with call-to-action and cleaner layout
- Timeline switched from horizontal to vertical layout
- Mobile layout improved across match, team, and timeline pages
- Match numbering switched from date-based to sequential

### Fixed
- Hydration errors in multiple components
- Chart rendering in light/dark theme switch
- Jersey icon rendering issues
- H2H scraping and result display
- Link targets on home and team pages

---

## [0.2.0] — 2024-12-17

Authentication and match management.

### Added
- Admin authentication via credentials (username/password)
- Google OAuth with email whitelist
- POST endpoint for adding new matches
- Stats recalculation triggered on match save
- Favicon

### Changed
- Match outcomes extended to support draws (`d`) and title defences (`v`)
- Team colours added to the database and exposed via a dedicated API route
- DB logic refactored into a shared layer

---

## [0.1.0] — 2024-12-11

Initial MVP — Serie A only.

### Added
- Next.js project with Vercel Postgres
- Serie A database population (matches and teams)
- Home / league summary page
- Team detail page with stats and timeline
- Match detail page with navigation between matches
- Timeline page
- Landing page with layout and breadcrumb navigation
