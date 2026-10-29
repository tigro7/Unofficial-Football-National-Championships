'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Reign = { squadra: string; start: string; end: string };
type TeamColor = { squadra: string; primary: string; secondary: string };

const reignDays = (r: Reign) =>
    Math.max(1, Math.ceil((new Date(r.end).getTime() - new Date(r.start).getTime()) / 86400000));

const MiniTimeline = ({ league }: { league: string }) => {
    const [regni, setRegni] = useState<Reign[]>([]);
    const [colors, setColors] = useState<TeamColor[]>([]);

    useEffect(() => {
        const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        Promise.all([
            fetch(`${host}/api/${league}/regni`).then(r => r.json()),
            fetch(`${host}/api/${league}/squadre`).then(r => r.json()),
        ]).then(([reignData, squadreData]) => {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            setRegni((reignData as Reign[]).filter(r => new Date(r.end) >= oneYearAgo));
            setColors(
                (squadreData as { squadra: string; colore_primario: string; colore_secondario: string }[]).map(s => ({
                    squadra: s.squadra.toLowerCase(),
                    primary: `#${s.colore_primario || '666666'}`,
                    secondary: `#${s.colore_secondario || 'ffffff'}`,
                }))
            );
        }).catch(() => {/* silently skip on error */});
    }, [league]);

    if (!regni.length) return null;

    const totalDays = regni.reduce((sum, r) => sum + reignDays(r), 0);

    // unique teams ordered by last appearance (so most recent teams survive slice(-8))
    const uniqueTeams = [...regni].reverse().filter(
        (r, i, arr) => arr.findIndex(x => x.squadra === r.squadra) === i
    ).reverse();

    return (
        <div className="w-full mt-[var(--margin-big)]">
            <div className="flex justify-between items-center mb-3">
                <h4 className="h4">Recent Title Reigns</h4>
                <Link href={`/${league}/timeline`} className="link-secondary text-sm">
                    Full timeline →
                </Link>
            </div>

            {/* Horizontal proportional bar */}
            <div className="flex w-full h-10 rounded-sm overflow-hidden">
                {regni.map((r, i) => {
                    const pct = (reignDays(r) / totalDays) * 100;
                    const tc = colors.find(c => c.squadra === r.squadra);
                    return (
                        <Link
                            key={i}
                            href={`/${league}/team/${r.squadra}`}
                            title={`${r.squadra} · ${reignDays(r)} days`}
                            style={{
                                width: `${pct}%`,
                                background: `repeating-linear-gradient(90deg, ${tc?.primary ?? '#666666'} 0px, ${tc?.primary ?? '#666666'} 6px, ${tc?.secondary ?? '#ffffff'} 6px, ${tc?.secondary ?? '#ffffff'} 12px)`,
                                minWidth: '3px'
                            }}
                            className="h-full transition-opacity hover:opacity-75"
                        />
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-primary">
                {uniqueTeams.map((r, i) => {
                    const tc = colors.find(c => c.squadra === r.squadra);
                    return (
                        <Link key={i} href={`/${league}/team/${r.squadra}`} className="flex items-center gap-1 hover:opacity-75">
                            <span
                                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ background: `repeating-linear-gradient(90deg, ${tc?.primary ?? '#666666'} 0px, ${tc?.primary ?? '#666666'} 3px, ${tc?.secondary ?? '#ffffff'} 3px, ${tc?.secondary ?? '#ffffff'} 6px)` }}
                            />
                            <span className="capitalize">{r.squadra}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MiniTimeline;
