'use client'

import Jersey from "@/app/components/Jersey";
import TimelineByDecades from "@/app/components/TimelineByDecades";
import TeamLink from "@/app/components/TeamLink";
import StatContainer from "@/app/components/StatContainer";

const maxDate = (date1: Date, date2: Date) => {
  return date1 > date2 ? date1 : date2;
};

const minDate = (date1: Date, date2: Date) => {
  return date1 < date2 ? date1 : date2;
};

const generateTimelineByDecade = (squadre: {squadra: string, colors: {primary: string, secondary: string}}[], regni:{ start: string, end: string, squadra: string}[]) => {
  // Trova la prima e l'ultima data
  const firstDate = new Date(regni[0].start);
  const lastDate = new Date(regni[regni.length - 1].end);

  const segments = [];
  let currentEnd = new Date(lastDate);
  let currentStart = new Date(currentEnd);

  // Suddividi per segmenti di 10 anni
  while (currentEnd > firstDate) {
    currentStart.setFullYear(currentEnd.getFullYear() - 10);
    if (currentStart < firstDate) {
      currentStart = new Date(firstDate); // Assicura di non andare oltre la prima data
    }

    const regniFiltered = regni
      .filter(
        (regno) =>
          new Date(regno.start) < currentEnd && new Date(regno.end) >= currentStart
      )
      .map((regno) => ({
        squadra: regno.squadra,
        start: maxDate(currentStart, new Date(regno.start)).toISOString(), // Assicura che la data di inizio sia almeno quella del segmento
        startsbefore: new Date(regno.start) < currentStart,
        end: minDate(currentEnd, new Date(regno.end)).toISOString(), // Assicura che la data di fine sia al massimo quella del segmento
        endsafter: new Date(regno.end) > currentEnd,
        colors: squadre.find(squadra => squadra.squadra == regno.squadra)?.colors || {primary: '#000000', secondary: '#ffffff'},
        realduration: Math.ceil(
          (new Date(regno.end).getTime() - new Date(regno.start).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        duration: Math.ceil(
          (minDate(currentEnd, new Date(regno.end)).getTime() - maxDate(currentStart, new Date(regno.start)).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));

    segments.push({
      start: new Date(currentStart),
      end: new Date(currentEnd),
      regni: regniFiltered,
    });

    currentEnd = new Date(currentStart);
  }

  return segments; // Ordina i segmenti dal più vecchio al più recente
};

function calculateDateDifference(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();

  if (hours < 0) {
    hours += 24;
    days--;
  }

  if (days < 0) {
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  return { years, months, days, hours };
}
  

const Timeline = ({squadre, regni, startDate, league = "serie_a"}: {squadre: {squadra: string, colors: {primary: string, secondary: string}}[], regni:{ start: string, end: string, squadra: string}[], startDate: string, league: string}) => {

    if (!squadre || !regni || !startDate) {
      return <div>Errore: dati non disponibili</div>;
    }
  
    const timeLineData = generateTimelineByDecade(squadre, regni);

    const attualeCampione = regni[regni.length - 1].squadra;

    const duration = (reign : {start: string, end: string, squadra: string}) => Math.ceil((new Date(reign.end).getTime() - new Date(reign.start).getTime()) / (1000 * 60 * 60 * 24));

    const longestReign = regni.reduce((prev, curr) => (duration(prev) > duration(curr) ? prev : curr));
    const shortestReign = regni.reduce((prev, curr) => (duration(prev) < duration(curr) ? prev : curr));
    const longChamp = squadre.find(squadra => squadra.squadra == longestReign.squadra);
    const shortChamp = squadre.find(squadra => squadra.squadra == shortestReign.squadra);
    const actualChamp = squadre.find(squadra => squadra.squadra == attualeCampione);
    
    const totalSpan = calculateDateDifference(new Date(startDate), new Date());
  
    return(
        <div className="container mx-auto mt-8 p-4 border-4 border-gold bg-system">
            {/* Titolo */}
            <h1 className="text-4xl font-bold text-center mb-6">
              Cronologia dei Regni
            </h1>

            {/* Stats Generali */}
            <div className="flex justify-around mb-6">
              <StatContainer className={'w-1/3'} color="black" statName='Champions' statValue={regni.length} positionPrefix="Total teams: " position={squadre.length}/>
              <StatContainer className={'w-1/3'} color='black' statName="Total length" statValue={`${totalSpan.years} Years`} position={`${totalSpan.months} Months, ${totalSpan.days} Days, ${totalSpan.hours} Hour`} />
              <StatContainer className={'w-1/3'} color='black' statName='Average length' statValue={`${Math.floor(((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))/regni.length)} Days`} position={'About 10 matches'} />
            </div>

            {/* Il più lungo e il più corto */}
            <div className="flex justify-around mb-6">
              <StatContainer className={'w-1/2'} color='black' statName='Longest Reign' statValue={<><TeamLink league={league} teamName={longChamp?.squadra || ''} />: {duration(longestReign)} Days </>} position={`Start: ${(new Date(longestReign.start)).toLocaleDateString()} End: ${(new Date(longestReign.end)).toLocaleDateString()}`} />
              <StatContainer className={'w-1/2'} color='black' statName='Shortest Reign' statValue={<><TeamLink league={league} teamName={shortChamp?.squadra || ''} />: {duration(shortestReign)} Days </>} position={`Start: ${(new Date(shortestReign.start)).toLocaleDateString()} End: ${(new Date(shortestReign.end)).toLocaleDateString()}`} />
            </div>

            {/* Campione Attuale */}
            <div className="flex flex-col items-center mb-6">
                <p className="text-xl font-semibold text-center">
                    Reigning Champion
                </p>
                <p className="text-3xl font-bold">
                    <TeamLink league={league} teamName={actualChamp?.squadra || ''} />
                </p>
                <Jersey colors={actualChamp?.colors || {primary: '#000000', secondary: '#ffffff'}} icon={null}/>
            </div>

            <div className="py-10">     
                <TimelineByDecades segments={timeLineData} league={league}/>
            </div>

        </div>
    );
  }
  
  export default Timeline;