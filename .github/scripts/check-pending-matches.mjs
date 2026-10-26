#!/usr/bin/env node
/**
 * check-pending-matches.mjs
 *
 * Fetches UFNC matches with outcome='n' whose scheduled date is in the past,
 * looks up their results on football-data.org, and writes one JSON file per
 * resolved match to .github/pending-results/.
 *
 * Called by the check-pending-matches.yml workflow. Exits 0 if no results were
 * found (idempotent), exits 0 with files written when results were found, exits
 * 1 on a hard error.
 *
 * Required env vars:
 *   UFNC_BASE_URL          e.g. https://your-app.vercel.app
 *   FOOTBALL_DATA_API_KEY  football-data.org v4 API key
 *
 * Output env (written to $GITHUB_OUTPUT when running in Actions):
 *   results_found   'true' | 'false'
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(ROOT, '.github', 'pending-results');

const UFNC_BASE_URL = process.env.UFNC_BASE_URL?.replace(/\/$/, '');
const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

if (!UFNC_BASE_URL) { console.error('UFNC_BASE_URL is required'); process.exit(1); }
if (!FD_API_KEY) { console.error('FOOTBALL_DATA_API_KEY is required'); process.exit(1); }

const config = JSON.parse(
  await import('node:fs').then(fs => fs.promises.readFile(join(__dirname, 'football-data-config.json'), 'utf8'))
);

const today = new Date().toISOString().split('T')[0];

/**
 * Tries to match a UFNC team name against a football-data.org team object.
 * Returns true if the FDO team's name or shortName matches any alias in the config.
 */
function teamMatches(ufncName, fdoTeam, leagueAliases) {
  const aliases = leagueAliases[ufncName] ?? [ufncName];
  const fdoNames = [
    fdoTeam.name?.toLowerCase(),
    fdoTeam.shortName?.toLowerCase(),
    fdoTeam.tla?.toLowerCase(),
  ].filter(Boolean);

  for (const alias of aliases) {
    const a = alias.toLowerCase();
    if (fdoNames.some(n => n === a || n.includes(a) || a.includes(n))) {
      return true;
    }
  }
  return false;
}

/**
 * Maps a football-data.org winner string + detentore position to UFNC outcome.
 *   winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW'
 *   detentore: 'home' | 'away'
 */
function mapOutcome(winner, detentore) {
  if (winner === 'DRAW') return 'd';
  const winnerSide = winner === 'HOME_TEAM' ? 'home' : 'away';
  return winnerSide === detentore ? 'v' : 's';
}

/**
 * Fetches finished matches from football-data.org for a competition on a given date.
 * Uses a ±1 day window to account for UTC vs local time differences.
 */
async function fetchFdoMatches(competitionCode, dateStr) {
  const from = new Date(dateStr);
  from.setDate(from.getDate() - 1);
  const to = new Date(dateStr);
  to.setDate(to.getDate() + 1);

  const dateFrom = from.toISOString().split('T')[0];
  const dateTo = to.toISOString().split('T')[0];

  const url = `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': FD_API_KEY },
  });

  if (res.status === 429) {
    // Rate limited (free tier: 10 req/min) — wait 60s and retry once
    console.warn(`Rate limited by football-data.org. Waiting 65s...`);
    await new Promise(r => setTimeout(r, 65_000));
    const retry = await fetch(url, { headers: { 'X-Auth-Token': FD_API_KEY } });
    if (!retry.ok) {
      console.error(`football-data.org error after retry: ${retry.status} ${retry.statusText}`);
      return [];
    }
    return (await retry.json()).matches ?? [];
  }

  if (!res.ok) {
    console.error(`football-data.org error: ${res.status} ${res.statusText}`);
    return [];
  }

  return (await res.json()).matches ?? [];
}

async function main() {
  const resolved = [];

  for (const [ufncLeague, leagueConfig] of Object.entries(config.leagues)) {
    const { code, teams: leagueAliases } = leagueConfig;

    // Fetch all matches for this league from UFNC
    let ufncMatches;
    try {
      const res = await fetch(`${UFNC_BASE_URL}/api/${ufncLeague}/matches`);
      if (!res.ok) {
        console.error(`Failed to fetch UFNC matches for ${ufncLeague}: ${res.status}`);
        continue;
      }
      ufncMatches = await res.json();
    } catch (err) {
      console.error(`Network error fetching UFNC matches for ${ufncLeague}:`, err.message);
      continue;
    }

    // Strip any time component from the date (DB returns ISO timestamps like 2025-10-25T00:00:00.000Z)
    for (const m of ufncMatches) {
      m.data = m.data.split('T')[0];
    }

    // Filter: unplayed matches whose date is already in the past
    const pending = ufncMatches.filter(m => m.outcome === 'n' && m.data < today);

    if (pending.length === 0) {
      console.log(`${ufncLeague}: no pending matches in the past`);
      continue;
    }

    console.log(`${ufncLeague}: ${pending.length} pending match(es) to check`);

    // Group by date to minimise football-data.org API calls (free tier: 10 req/min)
    const byDate = pending.reduce((acc, m) => {
      (acc[m.data] ??= []).push(m);
      return acc;
    }, {});

    for (const [date, matches] of Object.entries(byDate)) {
      // Small delay between API calls to stay within free-tier rate limit
      await new Promise(r => setTimeout(r, 6_500));

      const fdoMatches = await fetchFdoMatches(code, date);

      for (const ufncMatch of matches) {
        const { home, away, detentore, numero } = ufncMatch;

        // Find the corresponding football-data.org match
        const fdoMatch = fdoMatches.find(m =>
          teamMatches(home, m.homeTeam, leagueAliases) &&
          teamMatches(away, m.awayTeam, leagueAliases)
        );

        if (!fdoMatch) {
          console.warn(
            `${ufncLeague} #${numero} (${date}): no football-data.org match found for "${home}" vs "${away}". ` +
            `Add entries to football-data-config.json if team names differ.`
          );
          continue;
        }

        const { fullTime } = fdoMatch.score;
        if (fullTime.home === null || fullTime.away === null) {
          console.warn(`${ufncLeague} #${numero}: match found but score not yet available`);
          continue;
        }

        // detentore is stored as a name in the DB; map back to 'home'/'away' position
        const detentorePosition = detentore === home ? 'home' : 'away';
        const outcome = mapOutcome(fdoMatch.score.winner, detentorePosition);
        const risultato = `${fullTime.home}-${fullTime.away}`;

        const result = {
          league: ufncLeague,
          home,
          away,
          data: date,
          detentore: detentorePosition,
          risultato,
          outcome,
          note: `${ufncLeague.replace(/_/g, ' ')} matchday ${fdoMatch.matchday ?? ''}`.trim(),
        };

        console.log(
          `${ufncLeague} #${numero}: ${home} ${risultato} ${away} → outcome=${outcome}`
        );
        resolved.push({ numero, ...result });
      }
    }
  }

  // Write result files
  const resultsFound = resolved.length > 0;

  if (resultsFound) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const result of resolved) {
      const filename = `${result.data}-${result.league}-${result.numero}.json`;
      writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(result, null, 2) + '\n');
      console.log(`Written: .github/pending-results/${filename}`);
    }
  }

  // Signal to the Actions workflow whether we have anything to PR
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    writeFileSync(outputFile, `results_found=${resultsFound}\n`, { flag: 'a' });
  }

  console.log(`Done. ${resolved.length} result(s) resolved.`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
