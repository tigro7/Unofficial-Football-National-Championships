import ErrorBoundary from "@/app/components/ErrorBoundary";
import NoTitles from "./noTitles";

export default async function Page({ params }: { params: Promise<{ league: string }> }) {
    const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const league = (await params).league;
    const data = await fetch(`${host}/api/${league}/stats/consolation-prize`).then(res => res.json());

    return (
        <ErrorBoundary>
            <NoTitles data={data} league={league} />
        </ErrorBoundary>
    );
}
