import League from "./league";
import ErrorBoundary from "@/app/components/ErrorBoundary";
 
export default async function Page({ params, }: { params: Promise<{ league: string }>}) {
    const league = (await params).league;

    return (
        <ErrorBoundary>
            <League league={league}/>
        </ErrorBoundary>
    )
}