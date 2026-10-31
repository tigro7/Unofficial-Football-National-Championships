import { Match, SquadraState, StatContext } from "../types";

export function makeMatch(overrides: Partial<Match> = {}): Match {
    return {
        numero: 1,
        detentore: "TeamA",
        sfidante: "TeamB",
        risultato: "2-1",
        data: "2010-05-01",
        durata: 0,
        league: "serie_a",
        outcome: "s",
        home: "TeamA",
        away: "TeamB",
        ...overrides,
    };
}

export function makeSquadra(name: string, overrides: Partial<SquadraState> = {}): SquadraState {
    return {
        squadra: name,
        regni: 1,
        durata: 30,
        media: 30,
        colore_primario: "#000000",
        colore_secondario: "#FFFFFF",
        league: "serie_a",
        difese: 0,
        media_difese: 0,
        sfide: 0,
        ...overrides,
    };
}

export function buildCtx(overrides: {
    match?: Partial<Match>;
    allMatches?: Match[];
    squadreMap?: Map<string, SquadraState>;
    league?: string;
} = {}): StatContext {
    const league = overrides.league ?? "serie_a";
    const match = makeMatch({ league, ...overrides.match });
    const allMatches = overrides.allMatches ?? [match];
    const squadreMap = overrides.squadreMap ?? new Map([[match.detentore, makeSquadra(match.detentore, { league })]]);
    return { league, match, allMatches, squadreMap };
}
