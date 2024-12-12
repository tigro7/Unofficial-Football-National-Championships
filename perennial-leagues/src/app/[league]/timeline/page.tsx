import Timeline from "./timeline";
import ErrorBoundary from "@/app/components/ErrorBoundary";
 
export default async function Page({ params, }: { params: Promise<{ league: string }>}) {
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const league = (await params).league;
    const startDate = await fetch (`${host}/api/${league}/start`).then(res => res.json()).then(data => data[0].data);
    const squadre = await fetch (`${host}/api/${league}/squadre`).then(res => res.json());
    const regni = await fetch (`${host}/api/${league}/regni`).then(res => res.json());    

    return (
        <ErrorBoundary>
            <Timeline squadre={
                squadre.map((squadra: {squadra: string, colore_primario: string, colore_secondario: string, regni: number, durata: number, media: number, competizione: string}) => ({
                    squadra: squadra.squadra.toLowerCase(),
                    colors: {
                        primary: `#${squadra.colore_primario ? squadra.colore_primario : '000000'}`,
                        secondary: `#${squadra.colore_secondario ? squadra.colore_secondario : 'ffffff'}`,
                    }
                }))
            } regni={regni} startDate={startDate} league={league}/>
        </ErrorBoundary>
    )
}