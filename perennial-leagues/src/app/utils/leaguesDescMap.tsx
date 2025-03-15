const leagueDescMap: { [key: string]: string } = {
    "serie_a": "Spanning from 1898, Italy has seen a lot of great teams. The title has been challenged all over the italian boot and the fight is roaring, seeking Juventus's 67 titles.",
    "premier_league": "The oldest league in the world, the English championship has been played since 1888. The title, however, has een challenged since 1871, in the FA Cup. Liverpool is the current record holder.",
    "laliga": "Work in progress...",
}

export default function getLeagueDesc(leagueName: string) {
    return leagueDescMap[leagueName] || leagueName;
}