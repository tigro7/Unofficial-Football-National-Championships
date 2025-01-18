import { daysToYears, showSpan } from "@/app/lib/commons";

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

  return (
    <div className="relative flex landscape:justify-center w-full" style={{ minHeight: "600px", height: `${totalHeight}px` }}>
      {/* Timeline centrale */}
      <div className="relative w-8 bg-gray-300 h-full">
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
            isLeft ? "left-full ml-6" : "landscape:right-full landscape:mr-6 portrait:left-full portrait:ml-6"} bg-gray-300`;
          const infoClassName = `absolute w-64 p-2 text-sm bg-gray-100 shadow-md rounded-md ${
            isLeft ? "left-full ml-6" : "landscape:right-full landscape:mr-6 portrait:left-full portrait:ml-6"
          } hover:z-50`;

          return (
            <div
              key={index}
              style={{ top: topPosition, height: `${percentage}%`, minHeight: `${regno.team ? "5px" : "0px"}` }}
              className="w-8 absolute"
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
                <div
                  className={infoClassName}
                  style={{
                    cursor: "pointer",
                    top: `calc(${percentage / 2}%)`,
                    transform: `translateY(-50%)`,
                  }}
                  onClick={() => {
                    window.location.href = `/${league}/match/${regno.matchStart}`;
                  }}
                >
                  <p className="font-semibold">{`#${reignIndex}`}</p>
                  <p>{`${showSpan(regno.start, regno.end)}: ${daysToYears(Math.ceil(
                    (new Date(regno.end).getTime() - new Date(regno.start).getTime()) / (1000 * 60 * 60 * 24))
                  )}`}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalTimelineChart;