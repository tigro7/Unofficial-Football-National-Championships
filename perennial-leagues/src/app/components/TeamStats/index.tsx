import StatsIcon from "../StatsIcon";
import statsMap from "@/app/utils/statsMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useInfo } from "../InfoContext/InfoContext";

const TeamStats = ({ stats, match = false } : {
    stats: {
        squadra: string;
        data: string;
        league: string;
        statistica: string;
        valore: string | null;
        numero: number;
      }[];
    match?: boolean;
  }) => {

    const { setInfo } = useInfo();
    const tailGap = match ? "gap-2 portrait:gap-1" : "gap-4 portrait:gap-2";

    return (
        <div className="team-stats-container m-4 w-full">
            <div className={`stats-grid grid grid-cols-[repeat(auto-fit,minmax(150px,150px))] ${tailGap} justify-center items-center`}>
                {stats.map((stat, index) => {
                // Trova informazioni relative alla statistica
                const statKey = Object.keys(statsMap).find((key) =>
                    stat.statistica.toLowerCase().includes(key.toLowerCase())
                ) || "Question Circle";
                const statInfo = statsMap[statKey];
                const valueProcessor = statInfo.valueProcessor;
                const localeDate = new Date(stat.data).toLocaleDateString();
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const rival = stat.statistica.split(" vs ") ? stat.statistica.split(" vs ")[1] : "";
                const tier = stat.statistica.endsWith(" Gold") ? "Gold" : stat.statistica.endsWith(" Silver") ? "Silver" : stat.statistica.endsWith(" Bronze") ? "Bronze" : stat.statistica.endsWith(" Iron") ? "Iron" : "";
                const tierColor = `bg-${tier.toLowerCase()}`;
                const positionMatch = stat.statistica.match(/ (\d+)$/);
                const position = positionMatch ? positionMatch[1] : null;
                const positionColor = position == "1" ? "bg-gold" : position == "2" ? "bg-silver" : position == "3" ? "bg-bronze" : "bg-green-700";

                return (
                        <div
                            key={index}
                            className={`relative shadow-md flex flex-col items-center justify-center p-4 rounded-md  ${
                                match ? "" : "hover:shadow-lg transition-shadow duration-300"
                            }`}
                            style={{
                                width: "150px",
                                height: "150px",
                                background: "linear-gradient(135deg, #f0f0f0, #ffffff)",
                            }}
                        >
                            {/* Icona principale */}
                            <div className="flex items-center justify-center w-20 h-20 bg-highlights rounded-full m-2 p-2 border-4 border-primary">
                                <StatsIcon statName={stat.statistica} statTitle={statInfo.title} />
                            </div>

                            {/* SVG per creare il cerchio con testo curvo */}
                            <svg
                                className="absolute w-16 h-16 top-16"
                                viewBox="0 0 90 90"
                            >
                                {/* Cerchio per il testo */}
                               <text fill="#333" fontSize="12" fontWeight="bold">
                                    <textPath
                                        href={`#curved-text-path-${index}`}
                                        startOffset="50%"
                                        textAnchor="middle"
                                    >
                                        {(rival && rival.length > 0) ? stat.statistica.split(" vs ")[0] : 
                                            (tier && tier.length > 0) ? stat.statistica.replace(` ${tier}`, "") :
                                            (position && position.length > 0) ? stat.statistica.replace(` ${position}`, "") :
                                            stat.statistica}
                                    </textPath>
                                </text>
                                <defs>
                                    <path
                                        id={`curved-text-path-${index}`}
                                        d="M 0 0 A 1 1 0 0 0 90 0"
                                    />
                                </defs>
                            </svg>
            
                            {/* Titolo vicino all'icona 
                                <p className="absolute text-center text-sm font-semibold text-primary max-w-24 text-ellipsis overflow-hidden whitespace-nowrap">
                                    {stat.statistica}
                                </p>
                            */}

                            <p className="text-center text-xs">{valueProcessor ? valueProcessor(Number(stat.valore)) : stat.valore}</p>

                            {rival && <div className="absolute bottom-8 text-xs bg-red-700 text-white rounded-full px-2 py-1">{rival}</div>}
                            {tier && <div className={`absolute bottom-8 text-xs ${tierColor} text-white rounded-full px-2 py-1`}>{tier}</div>}
                            {position && <div className={`absolute bottom-8 text-xs ${positionColor} text-white rounded-full px-2 py-1`}>{position}</div>}
        
                            {/* Data */}
                            {!match && (
                                <div className="absolute top-2 right-2 text-xs bg-secondary text-white rounded-full px-2 py-1 cursor-pointer"
                                    onClick={(event) => {
                                        if (match) {
                                            event.preventDefault();
                                            return;
                                        }
                                        window.location.href = `/${stat.league}/match/${stat.numero}`;
                                    }}>
                                <span>{localeDate}</span>
                                </div>
                            )}
                            {/* Nome detentore */}
                            {match && <p className={`font-bold text-xs absolute top-2`}>{stat.squadra}</p>}
                        
                            <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="absolute bottom-2 right-2 text-xs text-primary cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInfo(statInfo.title);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamStats;
