'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Jersey from '@/app/components/Jersey';
import Link from 'next/link';
import normalizeLeagueName from '@/app/utils/leaguesMap';
import { showSpan } from '@/app/lib/commons';

const today = new Date().toISOString().slice(0, 10);
const ACTIVE_LEAGUES = ['serie_a', 'premier_league'];

type Reign = { squadra: string; start: string; end: string };
type Squadra = { squadra: string; colore_primario: string; colore_secondario: string };
type LeagueChampion = { league: string; squadra: string | null; colors: { primary: string; secondary: string }; start: string | null; end: string | null };

const DateSearch = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || today;

    const [championsOnDate, setChampionsOnDate] = useState<LeagueChampion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchChampions = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.all(ACTIVE_LEAGUES.map(async (league) => {
                    const [regni, squadreList] = await Promise.all([
                        fetch(`${host}/api/${league}/regni`).then(r => r.json()),
                        fetch(`${host}/api/${league}/squadre`).then(r => r.json()),
                    ]);
                    const queryDate = new Date(q);
                    const champion = (regni as Reign[]).find(r =>
                        new Date(r.start) <= queryDate && new Date(r.end) > queryDate
                    );
                    const teamData = champion
                        ? (squadreList as Squadra[]).find(s => s.squadra.toLowerCase() === champion.squadra.toLowerCase())
                        : null;
                    const colors = teamData
                        ? { primary: `#${teamData.colore_primario || '000000'}`, secondary: `#${teamData.colore_secondario || 'ffffff'}` }
                        : { primary: '#000000', secondary: '#ffffff' };
                    return { league, squadra: champion?.squadra ?? null, colors, start: champion?.start ?? null, end: champion?.end ?? null };
                }));
                setChampionsOnDate(results);
            } catch (error) {
                console.error('Error fetching champions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChampions();
    }, [q, host]);

    return (
        <>
            <h3 className="h3 w-full lg:w-1/2">Who reigned on…</h3>

            <section className="section mt-[var(--margin-big)]">
                <span className="section-label">Pick a date</span>
                <input
                    type="date"
                    defaultValue={q}
                    max={today}
                    className="card bg-system border border-tertiary text-foreground p-[var(--margin-md)] text-base"
                    onChange={e => { if (e.target.value) router.replace(`/date?q=${e.target.value}`); }}
                    aria-label="Pick a date"
                />
            </section>

            <section className="section">
                <span className="section-label">Champions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--margin-lg)]">
                    {isLoading
                        ? ACTIVE_LEAGUES.map(league => (
                            <div key={league} className="card p-[var(--margin-lg)] flex flex-col gap-[var(--margin-sm)]">
                                <span className="section-label">{normalizeLeagueName(league)}</span>
                                <p className="par text-tertiary">Loading…</p>
                            </div>
                        ))
                        : championsOnDate.map(({ league, squadra, colors, start, end }) => (
                            <div key={league} className="card p-[var(--margin-lg)] flex flex-col gap-[var(--margin-md)]">
                                <span className="section-label">{normalizeLeagueName(league)}</span>
                                {squadra ? (
                                    <div className="flex items-center gap-[var(--margin-md)]">
                                        <Jersey colors={colors} icon={null} ariaLabel={squadra} dimensions="medium" />
                                        <div className="flex flex-col gap-[var(--margin-xs)]">
                                            <Link href={`/${league}/team/${squadra}`} className="h3 text-secondary capitalize hover:underline">
                                                {squadra}
                                            </Link>
                                            {start && end && (
                                                <p className="par text-tertiary text-sm">{showSpan(start, end)}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="par text-tertiary">No champion found for this date.</p>
                                )}
                            </div>
                        ))
                    }
                </div>
            </section>
        </>
    );
};

export default DateSearch;
