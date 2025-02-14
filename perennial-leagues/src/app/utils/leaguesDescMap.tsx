const leagueDescMap: { [key: string]: string } = {
    "serie_a": "Spanning from 1898, Italy has seen a lot of great teams. The title has been challenged all over the italian boot and the fight is roaring, seeking Juventus's 67 titles.",
    "premier_league": "Work in progress...",
}

export default function getLeagueDesc(leagueName: string) {
    return leagueDescMap[leagueName] || leagueName;
}