# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unofficial Football National Championships (UFNC) tracks an ongoing "boxing-title-style" championship across football leagues: one team holds the title, and it passes to the team that beats them. The app supports multiple leagues (Serie A, Premier League, La Liga) and is deployed on Vercel.

The main application lives in `perennial-leagues/` — that is the working directory for almost all tasks.

## Commands

All commands run from `perennial-leagues/`:

```bash
npm run dev           # Start dev server (Next.js, port 3000)
npm run build         # Production build
npm run lint          # ESLint
npm run storybook     # Storybook dev server (port 6006)
npm run build-storybook
```

There is no automated test suite.

## Architecture

**Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS, Vercel Postgres, NextAuth v4.

**Source layout (`src/`):**
- `app/[league]/` — Dynamic pages per league: match detail, team detail, add-match form, ranks, timeline
- `app/api/[league]/` — REST API routes: `matches`, `squadre`, `regni`, `stats`
- `app/components/` — UI components (TanTable, Jersey, Card, Modal, timeline charts, etc.)
- `app/utils/` — Utility modules; `statsCalc.tsx` is the most critical (645 lines, handles all stat recalculation after a match is added/edited)
- `app/lib/definitions.ts` — All shared TypeScript interfaces (`DataProp`, `Team`, `Match`, `Summary`, etc.)
- `app/lib/commons.ts` — Shared helpers (`daysToYears`, `showSpan`)
- `app/contexts/` — Theme (dark/light) and global info via React Context

**Data flow:** API routes query Vercel Postgres directly using `@vercel/postgres`. Client components fetch via `fetch()` with `process.env.NEXT_PUBLIC_BASE_URL`. There is no ORM; SQL is written inline. No migration system — the database schema is managed externally on Vercel.

**Key tables:**
- `matches` — columns: `numero`, `detentore`, `sfidante`, `risultato`, `data`, `durata`, `league`, `outcome`, `home`, `away`, `note`
- `squadre` — columns: `squadra`, `regni`, `durata`, `media`, `colore_primario`, `colore_secondario`, `league`, `difese`, `media_difese`, `sfide`
- `stats` — special achievements like "Back to Back" and "Decade Dominator"

**Match outcome values:** `'v'` = title defended (visited), `'s'` = title stolen (transferred to challenger), `'d'` = draw (title stays), `'n'` = not yet played.

**Domain terminology (Italian):** `squadra` = team, `regni` = reigns/title wins, `durata` = duration, `sfidante` = challenger, `detentore` = title holder, `difese` = title defenses.

## Adding/Editing Matches

When a match is saved, `statsCalc.tsx` must recalculate derived stats for `squadre` and `stats` tables (reign counts, durations, back-to-back tracking, decade dominator). This is the most complex part of the codebase — changes to match logic almost always require updating this file.

## Authentication

NextAuth v4 with two providers:
- **Credentials**: username/password from `ADMIN_USER` / `ADMIN_PASSWORD` env vars
- **Google OAuth**: whitelisted to specific emails (alby.tiri@gmail.com, alberto.tiribelli@gmail.com)

POST endpoints require a valid session. Read endpoints are public.

## Required Environment Variables

```
ADMIN_USER
ADMIN_PASSWORD
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXT_PUBLIC_BASE_URL      # Used by client-side fetch calls
POSTGRES_URL              # Provided by Vercel Postgres
```

## Storybook

Components under `src/app/components/` may have `.stories.tsx` files. Run `npm run storybook` to develop UI components in isolation.
