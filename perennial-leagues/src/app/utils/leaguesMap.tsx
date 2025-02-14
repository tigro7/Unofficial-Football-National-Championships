const leagueNormalizationMap: { [key: string]: string } = {
    "serie_a": "Italian Championship",
    "premier_league": "English Championship",
}

export default function normalizeLeagueName(leagueName: string) {
    return leagueNormalizationMap[leagueName] || leagueName;
}