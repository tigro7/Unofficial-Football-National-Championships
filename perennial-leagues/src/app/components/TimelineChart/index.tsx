import { useState } from "react";

const TimelineChart = ({regni, primaryColor, secondaryColor, league = "serie_a"}: { regni: { start: string; end: string; team: boolean; duration: number; matchStart: number; matchEnd: number}[]; primaryColor: string; secondaryColor: string; league: string;}) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; position: number | null }>({
    visible: false,
    content: "",
    position: null,
  });

  const totalDuration = regni.reduce((sum, regno) => sum + regno.duration, 0);
  const startDate = regni[0].start;

  const calcPercentage = (duration: number) => (duration / totalDuration) * 100;

  let reignIndex = 0;

  const showTooltip = (start: string, end: string, position: number, reignIndex: number) => {
    const startDate = (new Date(start)).toLocaleDateString();
    const endDate = (new Date(end)).toLocaleDateString();
    const durata = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));

    setTooltip({
      visible: true,
      content: `#${reignIndex} Inizio: ${startDate} | Fine: ${endDate} | Durata: ${durata} giorni`,
      position,
    });
  };

  const hideTooltip = () => {
    setTooltip({
      visible: false,
      content: "",
      position: null,
    });
  };

  // Calcola le date significative per l'asse delle X (anniversari ogni 5 o 10 anni)
  const significantDates = [];
  const startYear = new Date(startDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const firstDecade = Math.floor(startYear / 10) * 10 + 10;

  for (let year = firstDecade; year <= currentYear; year += 5) {
    significantDates.push(new Date(year, 0, 1));
  }

  console.info(regni);

  return (
    <div className="relative flex items-center w-full h-24">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 z-10">
        {regni.map((regno, index) => {
          if (regno.team){
            reignIndex ++;
          }
          const percentage = calcPercentage(regno.duration);
          const leftPosition = `${index === 0 ? 0 : regni.slice(0, index).reduce((sum, r) => sum + calcPercentage(r.duration), 0)}%`;
          const indiceDelRegno = reignIndex;

          return (
            <div key={index}
              className={`absolute h-2 z-10`}
              style={{
                left: leftPosition,
                width: `${percentage}%`,
                backgroundColor: regno.team ? (reignIndex % 2 ? primaryColor : secondaryColor) : "#a1a1a1",
              }}
              onMouseEnter={() => (regno.team ? showTooltip(regno.start, regno.end, parseFloat(leftPosition), indiceDelRegno) : null)}
              onMouseLeave={hideTooltip}
              onClick={() => {window.location.href = `/${league}/match/${regno.matchStart}`}}
            />
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.position !== null && (
        <div
          className="absolute bg-gray-800 text-white p-2 rounded"
          style={{
            left: `calc(${tooltip.position}% - 20px)`,
            bottom: "50px", // Position above the timeline
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Indicatori di data */}
      <div className="absolute top-16 left-0 right-0 z-20 flex justify-between">
        {significantDates.map((date, index) => (
          <div key={index} 
              className="absolute -top-2 text-sm"
              style={{
                left: `${((date.getFullYear() - new Date(startDate).getFullYear()) / (currentYear - new Date(startDate).getFullYear())) * 100}%`,
              }}
            >
              {date.getFullYear()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineChart;