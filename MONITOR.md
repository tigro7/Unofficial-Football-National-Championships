# Monitor Context

> This file is read nightly by the Project Monitor agent to give Claude
> product context beyond what's visible in code metrics.

## What this project is

A personal project that tracks "boxing-title-style" championships across football leagues: one team holds the title, and it passes to whichever team beats them. Inspired by the UFWC. Built on Next.js 15, Vercel Postgres, and NextAuth, deployed on Vercel. Matches are entered manually by the admin.

Currently tracking: Serie A, Premier League.

## Current status

Active development. Core features are stable and deployed. Recent work focused on SEO, CI, and developer tooling (CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md, .env.example).

## Active work (this sprint / this month)

- Stabilising and refining the match entry flow (add-match form and stats recalculation)
- Improving stat quality and accuracy in `statsCalc.tsx`
- Groundwork for adding more leagues

## Roadmap (next meaningful steps)

- Smoother match and stats management (UX improvements to the admin add-match flow)
- Additional leagues (La Liga, Bundesliga, or others)
- Richer stats and visualisations on team and match detail pages

## Known pain points

- No automated test suite — `statsCalc.tsx` is complex and changes carry risk
- Sitemap is generated at runtime via API calls; during build those calls fail gracefully but produce an empty sitemap until the app is live
- All match data is entered manually — no integrity checks beyond what `statsCalc.tsx` enforces

## Out of scope (don't suggest these)

- User accounts, public profiles, or any social/community layer
- Mobile app or PWA install flow (responsive web only)
- Real-time or automated match result ingestion (manual entry is intentional)
