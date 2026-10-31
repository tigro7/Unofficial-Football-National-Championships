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

const Stronghold = ({
    stronghold,
    decadeDominator,
    league,
}: {
    stronghold: StatRow[];
    decadeDominator: StatRow[];
    league: string;
}) => {
    const withLeague = (rows: StatRow[]) => rows.map(r => ({ ...r, league }));

    return (
        <InfoProvider>
            <title>{league} - Records - UFNC</title>
            <h3 className="h3 w-full lg:w-1/2">
                <Link href={`/${league}/ranks`} className="opacity-60 hover:opacity-100">
                    {normalizeLeagueName(league)} - Stats &amp; Stuff
                </Link>
                {' / '}Records
            </h3>

            <section className="section mt-[var(--margin-big)]">
                <span className="section-label">Stronghold Records</span>
                {stronghold.length === 0 ? (
                    <p className="opacity-60">No stronghold records yet.</p>
                ) : (
                    <TeamStats stats={withLeague(stronghold)} showTeam />
                )}
            </section>

            <section className="section">
                <span className="section-label">Decade Dominators</span>
                {decadeDominator.length === 0 ? (
                    <p className="opacity-60">No decade dominator records yet.</p>
                ) : (
                    <TeamStats stats={withLeague(decadeDominator)} showTeam />
                )}
            </section>

            <InfoWindow />
        </InfoProvider>
    );
};

export default Stronghold;
