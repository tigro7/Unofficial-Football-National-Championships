import StatsIcon from "../StatsIcon";
import statsMap from "@/app/utils/statsMap";
import { useInfo } from "../../../contexts/InfoContext/InfoContext";
import Link from "next/link";

type StatRow = {
    squadra: string;
    data: string;
    league: string;
    statistica: string;
    valore: string | null;
    numero: number;
};

const TeamStats = ({ stats, match = false, showTeam = false, getCardHref } : {
    stats: StatRow[];
    match?: boolean;
    showTeam?: boolean;
    getCardHref?: (stat: StatRow) => string | undefined;
  }) => {

    const { setInfo } = useInfo();

    return (
        <div className="w-full">
            <div className={match ? "flex flex-wrap justify-center gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"}>
                {stats.map((stat, index) => {
                    const statKey = Object.keys(statsMap).find((key) =>
                        stat.statistica.toLowerCase().includes(key.toLowerCase())
                    ) || "Question Circle";
                    const statInfo = statsMap[statKey];
                    const valueProcessor = statInfo.valueProcessor;
                    const localeDate = new Date(stat.data).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                    const rivalParts = stat.statistica.split(" vs ");
                    const rival = rivalParts.length > 1 ? rivalParts[1] : "";
                    const tier = stat.statistica.endsWith(" Gold") ? "Gold"
                        : stat.statistica.endsWith(" Silver") ? "Silver"
                        : stat.statistica.endsWith(" Bronze") ? "Bronze"
                        : stat.statistica.endsWith(" Iron") ? "Iron" : "";
                    const positionMatch = stat.statistica.match(/ (\d+)$/);
                    const position = positionMatch ? positionMatch[1] : null;
                    const isDecade = (statKey === "Decade Dominator" || statKey === "Class of ") && position && position.length === 4;

                    const statLabel = rival
                        ? rivalParts[0]
                        : tier
                        ? stat.statistica.replace(` ${tier}`, "")
                        : position
                        ? stat.statistica.replace(` ${position}`, "")
                        : stat.statistica;

                    const renderBadge = () => {
                        if (rival) return (
                            <span className="achievement-badge rival-badge truncate max-w-[100px]">{rival}</span>
                        );
                        if (tier) {
                            const cls: Record<string, string> = {
                                Gold: "achievement-badge tier-gold",
                                Silver: "achievement-badge tier-silver",
                                Bronze: "achievement-badge tier-bronze",
                                Iron: "achievement-badge tier-iron",
                            };
                            return <span className={cls[tier]}>{tier}</span>;
                        }
                        if (isDecade && position) return (
                            <span className="achievement-badge decade-badge">{position}s</span>
                        );
                        if (position) return (
                            <span className="achievement-badge rank-badge">#{position}</span>
                        );
                        return <div className="h-5" />;
                    };

                    const cardHref = getCardHref?.(stat);

                    return (
                        <article key={index} className={`card bg-system flex flex-col p-3.5${match ? " w-[140px]" : ""}`}>
                            {/* Top meta bar: badge left, info button right */}
                            <div className="flex h-6 items-center justify-between gap-1">
                                <div className="truncate min-w-0">{renderBadge()}</div>
                                <button
                                    type="button"
                                    aria-label={`Details about ${statLabel}`}
                                    aria-haspopup="dialog"
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-tertiary transition hover:bg-tertiary hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInfo({
                                            content: statInfo.title,
                                            title: stat.statistica,
                                            value: valueProcessor ? valueProcessor(Number(stat.valore)) : stat.valore,
                                            longInfo: statInfo.longInfo
                                                ?.replace("$squadra", stat.squadra)
                                                .replace("$sfidante", rival)
                                                .replace("$position", position || "")
                                                .replace("$decade", position || "")
                                                .replace("$value", stat.valore
                                                    ? valueProcessor ? valueProcessor(Number(stat.valore)) : stat.valore.toString()
                                                    : ""),
                                            data: localeDate,
                                        });
                                    }}
                                >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {/* Medallion */}
                            <div className="my-3 flex justify-center">
                                <div className="achievement-medallion">
                                    <StatsIcon statName={stat.statistica} statTitle={statInfo.title} />
                                </div>
                            </div>

                            {/* Name + stat value */}
                            <div className="flex flex-col items-center text-center flex-1 justify-end">
                                {cardHref ? (
                                    <Link href={cardHref} className="text-xs font-semibold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors">
                                        {statLabel} ↗
                                    </Link>
                                ) : (
                                    <h4 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                                        {statLabel}
                                    </h4>
                                )}
                                <span className="mt-0.5 text-[11px] text-tertiary font-medium">
                                    {valueProcessor ? valueProcessor(Number(stat.valore)) : stat.valore}
                                </span>

                                <hr className="achievement-divider" />

                                {!match ? (
                                    <>
                                        {showTeam && (
                                            <Link
                                                href={`/${stat.league}/team/${stat.squadra}`}
                                                className="text-[11px] font-semibold text-foreground hover:text-primary transition-colors truncate max-w-full"
                                            >
                                                {stat.squadra}
                                            </Link>
                                        )}
                                        <Link
                                            href={`/${stat.league}/match/${stat.numero}`}
                                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-tertiary hover:text-secondary transition-colors"
                                        >
                                            <span>{localeDate}</span>
                                            <span className="text-[10px] leading-none" aria-hidden="true">↗</span>
                                        </Link>
                                    </>
                                ) : (
                                    <p className="text-[11px] text-tertiary">{stat.squadra}</p>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamStats;
