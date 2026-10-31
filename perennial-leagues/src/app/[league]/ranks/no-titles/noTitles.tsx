'use client'

import Link from 'next/link';
import normalizeLeagueName from '@/app/utils/leaguesMap';
import TeamStats from '@/app/components/TeamStats';
import { InfoProvider } from '@/contexts/InfoContext/InfoContext';
import InfoWindow from '@/contexts/InfoContext/InfoWindow';

type StatRow = {
    squadra: string;
    data: string;
    statistica: string;
    valore: string | null;
    numero: number;
};

const NoTitles = ({ data, league }: { data: StatRow[]; league: string }) => {
    const withLeague = (rows: StatRow[]) => rows.map(r => ({ ...r, league }));

    return (
        <InfoProvider>
            <title>{league} - Never Reigned - UFNC</title>
            <h3 className="h3 w-full lg:w-1/2">
                <Link href={`/${league}/ranks`} className="opacity-60 hover:opacity-100">
                    {normalizeLeagueName(league)} - Stats &amp; Stuff
                </Link>
                {' / '}Never Reigned
            </h3>

            <section className="section mt-[var(--margin-big)]">
                <span className="section-label">Consolation Prize</span>
                {data.length === 0 ? (
                    <p className="opacity-60">Every team has won the title at least once.</p>
                ) : (
                    <TeamStats stats={withLeague(data)} showTeam />
                )}
            </section>

            <InfoWindow />
        </InfoProvider>
    );
};

export default NoTitles;
