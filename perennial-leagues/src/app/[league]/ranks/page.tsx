import Ranks from "./ranks";
import ErrorBoundary from "@/app/components/ErrorBoundary";
 
export default async function Page({ params, }: { params: Promise<{ league: string }>}) {
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const league = (await params).league;
    const squadre = await fetch (`${host}/api/${league}/squadre`).then(res => res.json());

    return (
        <ErrorBoundary>
            <Ranks squadre={squadre}/>
        </ErrorBoundary>
    )
}