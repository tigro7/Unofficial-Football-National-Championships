const leagueNormalizationMap: { [key: string]: string } = {
    "serie_a": "Italian Championship",
}

export default function normalizeLeagueName(leagueName: string) {
    return leagueNormalizationMap[leagueName] || leagueName;
}