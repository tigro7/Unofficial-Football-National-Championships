import ErrorBoundary from "@/app/components/ErrorBoundary";
import Stronghold from "./stronghold";

export default async function Page({ params }: { params: Promise<{ league: string }> }) {
    const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const league = (await params).league;
    const [stronghold, decadeDominator] = await Promise.all([
        fetch(`${host}/api/${league}/stats/stronghold`).then(res => res.json()),
        fetch(`${host}/api/${league}/stats/decade-dominator`).then(res => res.json()),
    ]);

    return (
        <ErrorBoundary>
            <Stronghold stronghold={stronghold} decadeDominator={decadeDominator} league={league} />
        </ErrorBoundary>
    );
}
