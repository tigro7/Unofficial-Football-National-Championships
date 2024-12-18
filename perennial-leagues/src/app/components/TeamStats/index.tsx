import React from "react";
import StatsIcon from "../StatsIcon";
import statsMap from "@/app/utils/statsMap";

interface StatRecord {
  squadra: string;
  data: string;
  league: string;
  statistica: string;
  valore: string | null;
}

interface TeamStatsProps {
  stats: StatRecord[];
  match?: boolean;
}

const TeamStats: React.FC<TeamStatsProps> = ({ stats, match = false }) => {
    return (
        <div className="team-stats-container m-5 w-full">
            <div className="stats-grid grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-5">
                {stats.map((stat, index) => {
                    const statInfo = statsMap[Object.keys(statsMap).find((key) => stat.statistica.toLowerCase().includes(key.toLowerCase())) || "Question Circle"];
                    const valueProcessor = statInfo.valueProcessor;
                    const localeDate = new Date(stat.data).toLocaleDateString();
                    return (
                        <div key={index} className="stat-item text-center p-3 border border-gray-300 rounded-lg shadow-sm"
                            onClick={(event) => {
                                    if (match){
                                        event.preventDefault();
                                        return;
                                    }
                                    window.location.href = `/${stat.league}/match/${localeDate.split('/').reverse().join('-')}`;
                                }}>
                            <StatsIcon statName={stat.statistica} statTitle={statInfo.title} />
                            <div className="stat-details font-semibold text-lg">
                                <p>{stat.statistica}</p>
                                <p>{localeDate}</p>
                                {stat.valore  && 
                                    <p>
                                        {valueProcessor ? valueProcessor(Number(stat.valore)) : stat.valore}
                                    </p>
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamStats;
