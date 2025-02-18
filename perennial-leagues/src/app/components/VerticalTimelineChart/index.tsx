import { daysToYears, showSpan } from "@/app/lib/commons";
import Link from "next/link";
import { useEffect, useRef } from "react";

const VerticalTimelineChart = ({
  regni,
  primaryColor,
  secondaryColor,
  league = "serie_a",
}: {
  regni: { start: string; end: string; team: boolean; duration: number; matchStart: number; matchEnd: number }[];
  primaryColor: string;
  secondaryColor: string;
  league: string;
}) => {
  const totalDuration = regni.reduce((sum, regno) => sum + regno.duration, 0);
  const totalReigns = regni.reduce((sum, regno) => sum + (regno.team ? 1 : 0), 0);
  const calcPercentage = (duration: number) => (duration / totalDuration) * 100;
  const totalHeight = (totalReigns * 76) / 2;

  let reignIndex = 0;

  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
      // Funzione per gestire l'osservazione
      const handleIntersect = (entries: IntersectionObserverEntry[]) => {
        if (window.innerWidth < 512) {
          entries.forEach((entry) => {
              const index = refs.current.findIndex((ref) => ref === entry.target);
              if (entry.isIntersecting && refs.current[index]) {
                  // Aggiungi focus al div visibile
                    refs.current[index]?.style.setProperty('z-index', '50');
                  } else if (refs.current[index]) {
                    // Rimuovi z-index se non più visibile
                    refs.current[index]?.style.removeProperty('z-index');
              }
          });
        }
      };

      const observer = new IntersectionObserver(handleIntersect, {
          root: null, // Viewport come root
          rootMargin: "-25% 0px -25% 0px",
          threshold: 0.25, // Almeno il 25% dell'elemento visibile
      });

      refs.current.forEach((ref) => {
          if (ref) {
              observer.observe(ref);
          }
      });

      return () => {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          refs.current.forEach((ref) => {
              if (ref) observer.unobserve(ref);
          });
      };
  }, []);

  return (
    <div className="relative flex landscape:justify-center w-full portrait:mb-28 min-h-[600px]" style={{ height: `${totalHeight}px` }}>
      {/* Timeline centrale */}
      <div className="relative w-8 bg-tertiary h-full">
        {regni.map((regno, index) => {
          if (regno.team) {
            reignIndex++;
          }
          const percentage = calcPercentage(regno.duration); // Altezza relativa del segmento
          const topPosition = `${
            index === 0 ? 0 : regni.slice(0, index).reduce((sum, r) => sum + calcPercentage(r.duration), 0)
          }%`;
          const isLeft = reignIndex % 2 === 0; // Alterna destra/sinistra
          const lineClassName = `absolute w-2 h-1 ${
            isLeft ? "left-full ml-6" : "landscape:right-full landscape:mr-6 portrait:left-full portrait:ml-6"} bg-tertiary`;
          const infoClassName = `absolute w-64 p-2 text-sm bg-background-dark shadow-md rounded-md ${
            isLeft ? "left-full ml-6" : "landscape:right-full landscape:mr-6 portrait:left-full portrait:ml-6"
          }`;

          return (
            <div
              key={index}
              ref={(el) => { if(regno.team) refs.current[index] = el; }}
              style={{ top: topPosition, height: `${percentage}%`, minHeight: `${regno.team ? "5px" : "0px"}` }}
              className="w-8 absolute hover:z-50"
            >
              {/* Segmento del regno */}
              <div
                className="absolute w-8 z-10"
                style={{
                  top: topPosition,
                  height: `${regno.team ? "100%" : "0px"}`,
                  backgroundColor: regno.team ? (reignIndex % 2 === 0 ? secondaryColor : primaryColor) : "#a1a1a1",
                }}
              />

              {/* Linea che collega il riquadro alla timeline */}
              {regno.team && (
                <div
                  className={lineClassName}
                  style={{
                    top: `calc(${percentage / 2}%)`,
                    transform: `translateY(-50%)`,
                    backgroundColor: reignIndex % 2 === 0 ? secondaryColor : primaryColor,
                    zIndex: 2, // Linea sopra il box delle informazioni
                  }}
                />
              )}


              {/* Informazioni del regno */}
              {regno.team && (
                <Link href={`/${league}/match/${regno.matchStart}`} key={regno.matchStart}>
                  <div
                    className={infoClassName}
                    style={{
                      cursor: "pointer",
                      top: `calc(${percentage / 2}%)`,
                      transform: `translateY(-50%)`,
                    }}
                  >
                    <p className="font-semibold">{`#${reignIndex}`}</p>
                    <p>
                      {`${showSpan(regno.start, regno.end)}: ${daysToYears(Math.ceil(
                        (new Date(regno.end).getTime() - new Date(regno.start).getTime()) / (1000 * 60 * 60 * 24))
                      )}`}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalTimelineChart;