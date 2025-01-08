const leagueNormalizationMap: { [key: string]: string } = {
    "serie_a": "Italy",
}

export default function normalizeLeagueName(leagueName: string) {
    return leagueNormalizationMap[leagueName] || leagueName;
}