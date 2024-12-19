import StatsIcon from "../StatsIcon";
import statsMap from "@/app/utils/statsMap";

const TeamStats = ({ stats, match = false } : {
    stats: {
        squadra: string;
        data: string;
        league: string;
        statistica: string;
        valore: string | null;
      }[];
    match?: boolean;
  }) => {
    return (
        <div className="team-stats-container m-5 w-full">
            <div className="stats-grid grid grid-cols-[repeat(auto-fit,minmax(150px,150px))] justify-center gap-2">
                {stats.map((stat, index) => {
                    // Trova informazioni relative alla statistica
                    const statKey = Object.keys(statsMap).find((key) => stat.statistica.toLowerCase().includes(key.toLowerCase())) || "Question Circle";
                    const statInfo = statsMap[statKey];
                    const valueProcessor = statInfo.valueProcessor;
                    const localeDate = new Date(stat.data).toLocaleDateString();
                    
                    return (
                        <div key={index} className={`text-center shadow-md rounded-md p-2 items-center justify-center ${match ? '' : 'cursor-pointer'}`}
                            onClick={(event) => {
                                    if (match){
                                        event.preventDefault();
                                        return;
                                    }
                                    window.location.href = `/${stat.league}/match/${localeDate.split('/').reverse().join('-')}`;
                                }}>
                            <StatsIcon statName={stat.statistica} statTitle={statInfo.title} />
                            <div>
                                {match && <p className="text-sm font-bold">{stat.squadra}</p>}
                                <p className="text-xl font-semibold">{stat.statistica}</p>
                                <p className="text-sm italic mt-2">{localeDate}</p>
                                {stat.valore !== null && 
                                    <p className="text-lg mt-2">
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
