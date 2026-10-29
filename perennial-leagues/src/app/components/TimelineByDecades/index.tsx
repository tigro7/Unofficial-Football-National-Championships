import { useState } from "react";
import { daysToYears, showSpan } from "@/app/lib/commons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TimelineByDecades = ({ segments, league = "serie_a" }: {segments :{ start: Date, end: Date, 
    regni: { colors: { primary: string; secondary: string; }; duration: number; start: string; end: string; squadra: string; realduration: number; startsbefore: boolean; endsafter: boolean}[];}[]; league: string}) => {
    
    const [tooltip, setTooltip] = useState<{visible: boolean; content: string; position: number | null; index: number | null; squadra: string | null}>({visible: false, content: "", position: null, index: null, squadra: null});
    const router = useRouter();
    
    const showTooltip = ( start: string, end: string, position: number, reignIndex: number, segIndex: number, squadra: string, duration: number, sb: boolean, ea: boolean) => {
    
        setTooltip({ 
            visible: true, 
            content: `#${reignIndex} | ${squadra.charAt(0).toUpperCase() + squadra.slice(1)} | ${sb ? `...` : ``}${showSpan(start, end)}${ea ? `...` : ``} :
                ${daysToYears(duration)}`,
            position,
            index: segIndex,
            squadra,
        });

    };
    
    const hideTooltip = () => {
        setTooltip({visible: false, content: "", position: null, index: null, squadra: null});
    };

    let regniACavallo = segments.reduce((sum, segment) => sum + segment.regni.reduce((sum, regno) => sum + (regno.startsbefore ? 1 : 0), 0 ), 0);
    
    return(
        <div className="relative w-full">
            {segments.map((segment, index) => {
                const totalDuration = segment.regni.reduce((sum, regno) => sum + regno.duration, 0);
                const segIndex = index;
                let previousLeftPosition = 0;
                return (
                    <div key={index} className="mb-8">
                        {/* Titolo del segmento */}
                        <h2 className="h4 mb-4">
                            {new Date(segment.start).getFullYear()} – {new Date(segment.end).getFullYear()}
                        </h2>

                        {/* Timeline del segmento */}
                        <div className="relative flex items-center w-full h-24">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-tertiary z-10">
                                {segment.regni.map((regno, index) => {
                                    if (regno.startsbefore) {
                                        regniACavallo--;
                                    }
                                    const percentage = (regno.duration / totalDuration) * 100;
                                    const leftPosition = `${previousLeftPosition}%`;
                                    previousLeftPosition += percentage;
                                    const totalSegments = segments.reduce((sum, segment) => sum + segment.regni.length, 0);
                                    const previousSegmentSum = segIndex > 0 ? segments.slice(0, segIndex).reduce((sum, segment) => sum + segment.regni.length, 0) : 0;
                                    const indiceUltimoNelSegmento = totalSegments - previousSegmentSum;
                                    const indiceDelRegno = indiceUltimoNelSegmento - (segment.regni.length - index) - regniACavallo + (segIndex == segments.length - 1 ? 1 : 0);
                                    const tooltipId = `tooltip-${segIndex}`;
                                    const isExpanded = tooltip.visible && tooltip.index === segIndex && tooltip.squadra === regno.squadra;
                                    const ariaLabelText = `${regno.squadra}: reign ${regno.startsbefore ? 'started before this period, ' : ''}${showSpan(regno.start, regno.end)}${regno.endsafter ? ', continues after' : ''}, ${daysToYears(regno.realduration)}`;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            aria-expanded={isExpanded}
                                            aria-controls={tooltipId}
                                            aria-label={ariaLabelText}
                                            className="absolute h-2 z-10 focus:outline-2 focus:outline-offset-1 focus:outline-secondary"
                                            style={{
                                                left: leftPosition,
                                                width: `${percentage}%`,
                                                minWidth: '4px',
                                                background: percentage < 5 ?
                                                `linear-gradient(90deg, ${regno.colors.primary} 50%, ${regno.colors.secondary} 50%)`
                                                :
                                                `repeating-linear-gradient(90deg, ${regno.colors.primary} 0px, ${regno.colors.primary} 8px, ${regno.colors.secondary} 8px, ${regno.colors.secondary} 16px)`,
                                            }}
                                            onMouseEnter={() => showTooltip(regno.start, regno.end, parseFloat(leftPosition), indiceDelRegno, segIndex, regno.squadra, regno.realduration, regno.startsbefore, regno.endsafter)}
                                            onMouseLeave={hideTooltip}
                                            onFocus={() => showTooltip(regno.start, regno.end, parseFloat(leftPosition), indiceDelRegno, segIndex, regno.squadra, regno.realduration, regno.startsbefore, regno.endsafter)}
                                            onBlur={hideTooltip}
                                            onClick={() => router.push(`/${league}/team/${regno.squadra}`)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        {/* Tooltip */}
                        {tooltip.visible && tooltip.position !== null && tooltip.index == segIndex && (
                        <div
                            role="tooltip"
                            id={`tooltip-${segIndex}`}
                            className="absolute bg-background text-foreground p-2 rounded shadow-md"
                            style={{
                                left: `calc(${tooltip.position}% - 20px)`,
                                top: `calc((${tooltip.index} * 176px) + 50px)`,
                                transform: tooltip.position > 90 ? 'translateX(-100%)' : 'none',
                                whiteSpace: 'nowrap',
                                zIndex: 50,
                            }}
                        >
                            <p className="text-sm">{tooltip.content}</p>
                            <Link
                                href={`/${league}/team/${tooltip.squadra}`}
                                className="text-xs text-secondary underline mt-1 block"
                            >
                                View {tooltip.squadra} →
                            </Link>
                        </div>
                        )}  
                    </div>
                );
            })}  
        </div>
    )
};
  
export default TimelineByDecades;
  