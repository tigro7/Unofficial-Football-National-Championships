# Unofficial Football National Championships

What if football league titles were awarded like boxing belts? The title passes to whichever team beats the current holder. Inspired by the [UFWC](https://en.wikipedia.org/wiki/Unofficial_Football_World_Championships).

Currently tracking: **Serie A**, **Premier League**.

## Running locally

```bash
cd perennial-leagues
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev                   # http://localhost:3000
```

You need a Vercel Postgres database. Create one at [vercel.com](https://vercel.com), link it to the project, then copy the connection string into `.env.local` as `POSTGRES_URL`.

## Deploying

The app is designed for Vercel. Push to `main` and Vercel deploys automatically once the project is connected via the dashboard.

Required environment variables must be set in the Vercel project settings — see `.env.example` for the full list.

## Storybook

```bash
cd perennial-leagues
npm run storybook   # http://localhost:6006
```
