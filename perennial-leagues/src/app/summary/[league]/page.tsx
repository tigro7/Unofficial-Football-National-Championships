import MatchList from "../summary";
 
export default async function Page({ params, }: { params: Promise<{ league: string }>}) {
    const league = (await params).league;
    return (
        <>
            <h1>{`${league.charAt(0).toUpperCase()}${league.slice(1)}`}</h1>
            <MatchList league={league} />
        </>
    )
}