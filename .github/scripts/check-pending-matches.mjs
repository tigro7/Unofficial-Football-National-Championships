#!/usr/bin/env node
/**
 * check-pending-matches.mjs
 *
 * Determines the current title holder for each league, finds their next
 * finished match on football-data.org that is not yet recorded in the UFNC DB,
 * and writes one JSON file per resolved match to .github/pending-results/.
 *
 * Called by the check-pending-matches.yml workflow. Exits 0 if no new results
 * were found (idempotent), exits 0 with files written when results were found,
 * exits 1 on a hard error.
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
const ONLY_LEAGUE = process.env.LEAGUE ?? null;

if (!UFNC_BASE_URL) { console.error('UFNC_BASE_URL is required'); process.exit(1); }
if (!FD_API_KEY) { console.error('FOOTBALL_DATA_API_KEY is required'); process.exit(1); }

const config = JSON.parse(
  await import('node:fs').then(fs => fs.promises.readFile(join(__dirname, 'football-data-config.json'), 'utf8'))
);

const today = new Date().toISOString().split('T')[0];

const LEAGUE_DISPLAY_NAME = {
  serie_a: 'Serie A',
  premier_league: 'Premier League',
  liga: 'La Liga',
};

/** Returns "YYYY-YYYY+1" season label for a YYYY-MM-DD date string. */
function seasonLabel(dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  const start = month >= 7 ? year : year - 1;
  return `${start}-${start + 1}`;
}

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
 * Fetches all finished matches from football-data.org for a competition
 * from dateFrom up to today.
 */
async function fetchFdoMatchesAfter(competitionCode, dateFrom) {
  const url = `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${today}`;
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': FD_API_KEY },
  });

  if (res.status === 429) {
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
    if (ONLY_LEAGUE && ufncLeague !== ONLY_LEAGUE) continue;

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

    // Strip any time component from the date (DB returns ISO timestamps)
    for (const m of ufncMatches) {
      m.data = m.data.split('T')[0];
    }

    // Find the most recent completed match to determine the current champion
    const lastCompleted = ufncMatches.find(m => m.outcome !== 'n');
    if (!lastCompleted) {
      console.log(`${ufncLeague}: no completed matches found, skipping`);
      continue;
    }

    // detentore always stores the winner/current champion after the match (see match.tsx convention).
    const currentChampion = lastCompleted.detentore;

    const lastMatchDate = lastCompleted.data;
    console.log(`${ufncLeague}: current champion is "${currentChampion}" (last match: ${lastMatchDate}, outcome=${lastCompleted.outcome}, detentore=${lastCompleted.detentore})`);

    // Compute the day after the last recorded match
    const afterDate = new Date(lastMatchDate);
    afterDate.setDate(afterDate.getDate() + 1);
    const dateFrom = afterDate.toISOString().split('T')[0];

    if (dateFrom > today) {
      console.log(`${ufncLeague}: no matches possible after today, skipping`);
      continue;
    }

    // Small delay between API calls to stay within free-tier rate limit
    await new Promise(r => setTimeout(r, 6_500));

    const fdoMatches = await fetchFdoMatchesAfter(code, dateFrom);

    // Filter to matches where the champion was home or away, sort by date ascending
    const championMatches = fdoMatches
      .filter(m =>
        teamMatches(currentChampion, m.homeTeam, leagueAliases) ||
        teamMatches(currentChampion, m.awayTeam, leagueAliases)
      )
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    if (championMatches.length === 0) {
      console.log(`${ufncLeague}: no finished matches found for "${currentChampion}" after ${lastMatchDate}`);
      continue;
    }

    // Take only the first (earliest) — cascade re-trigger handles subsequent ones
    const fdoMatch = championMatches[0];
    const matchDate = fdoMatch.utcDate.split('T')[0];
    const home = fdoMatch.homeTeam.shortName ?? fdoMatch.homeTeam.name;
    const away = fdoMatch.awayTeam.shortName ?? fdoMatch.awayTeam.name;

    // Use UFNC team names (from config keys) rather than FDO names to keep DB consistent
    const ufncHome = Object.keys(leagueAliases).find(name =>
      teamMatches(name, fdoMatch.homeTeam, leagueAliases)
    ) ?? home;
    const ufncAway = Object.keys(leagueAliases).find(name =>
      teamMatches(name, fdoMatch.awayTeam, leagueAliases)
    ) ?? away;

    // Idempotency: skip if this match is already in the UFNC DB
    const alreadyRecorded = ufncMatches.some(m =>
      m.home === ufncHome && m.away === ufncAway && m.data === matchDate
    );
    if (alreadyRecorded) {
      console.log(`${ufncLeague}: ${ufncHome} vs ${ufncAway} on ${matchDate} already in DB, skipping`);
      continue;
    }

    const { fullTime } = fdoMatch.score;
    if (fullTime.home === null || fullTime.away === null) {
      console.warn(`${ufncLeague}: match found but score not yet available`);
      continue;
    }

    const incomingChampionPosition = teamMatches(currentChampion, fdoMatch.homeTeam, leagueAliases) ? 'home' : 'away';
    const outcome = mapOutcome(fdoMatch.score.winner, incomingChampionPosition);
    const risultato = `${fullTime.home}-${fullTime.away}`;

    // detentore = who holds the title AFTER this match (the winner):
    // 's' → challenger won, flip position; 'v'/'d' → champion kept it, same position
    const detentorePosition = outcome === 's'
      ? (incomingChampionPosition === 'home' ? 'away' : 'home')
      : incomingChampionPosition;

    const result = {
      league: ufncLeague,
      home: ufncHome,
      away: ufncAway,
      data: matchDate,
      detentore: detentorePosition,
      risultato,
      outcome,
      note: `${LEAGUE_DISPLAY_NAME[ufncLeague] ?? ufncLeague.replace(/_/g, ' ')} ${seasonLabel(matchDate)}`,
    };

    console.log(
      `${ufncLeague}: ${ufncHome} ${risultato} ${ufncAway} on ${matchDate} → outcome=${outcome} (champion="${currentChampion}" was ${incomingChampionPosition}, new detentore=${detentorePosition})`
    );
    resolved.push(result);
  }

  // Write result files
  const resultsFound = resolved.length > 0;

  if (resultsFound) {
    for (const result of resolved) {
      const leagueDir = join(OUTPUT_DIR, result.league);
      mkdirSync(leagueDir, { recursive: true });
      const filename = `${result.data}.json`;
      writeFileSync(join(leagueDir, filename), JSON.stringify(result, null, 2) + '\n');
      console.log(`Written: .github/pending-results/${result.league}/${filename}`);
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
