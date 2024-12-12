'use client'

import Jersey from "@/app/components/Jersey";
import TimelineByDecades from "@/app/components/TimelineByDecades";
import TeamLink from "@/app/components/TeamLink";

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

const containerStat = (color: string, statname: string, statvalue: React.ReactNode, description: string) => {
  return (
    <div className="text-center" style={{ color }}>
      <p className="text-xl font-semibold">{statname}</p>
      <p className="text-3xl">{statvalue}</p>
      <p className="text-sm italic mt-2">{description}</p>
    </div>
  );
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
        <div className="container mx-auto mt-8 p-4 border-4 border-gold">
            {/* Titolo */}
            <h1 className="text-4xl font-bold text-center mb-6">
              Cronologia dei Regni
            </h1>

            {/* Stats Generali */}
            <div className="flex justify-around mb-6">
              {containerStat('black', 'Campioni', regni.length, `Squadre: ${squadre.length}`)}
              {containerStat('black', 'Durata Totale', `${totalSpan.years} Anni`, `${totalSpan.months} Mesi, ${totalSpan.days} Giorni, ${totalSpan.hours} Ore`)}
              {containerStat('black', 'Durata Media', `${Math.floor(((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))/regni.length)} Giorni`, 'Circa 10 partite')}
            </div>

            {/* Il più lungo e il più corto */}
            <div className="flex justify-around mb-6">
              {containerStat(
                longChamp?.colors.primary || 'black',
                'Regno più lungo', 
                <> <TeamLink league={league} teamName={longChamp?.squadra || ''} />: {duration(longestReign)} Giorni </>, 
                `Inizio: ${(new Date(longestReign.start)).toLocaleDateString()} Fine: ${(new Date(longestReign.end)).toLocaleDateString()}`
              )}
              {containerStat(
                shortChamp?.colors.primary || 'black', 
                'Regno più corto', 
                <> <TeamLink league={league} teamName={shortChamp?.squadra || ''} />: {duration(shortestReign)} Giorni </>, 
                `Inizio: ${(new Date(shortestReign.start)).toLocaleDateString()} Fine: ${(new Date(shortestReign.end)).toLocaleDateString()}`
              )}
            </div>

            {/* Campione Attuale */}
            <div className="flex flex-col items-center mb-6">
                <p className="text-xl font-semibold text-center" style={{ color: actualChamp?.colors.primary }}>
                    Campione Attuale
                </p>
                <p className="text-3xl font-bold" style={{ color: actualChamp?.colors.secondary }}>
                    <TeamLink league={league} teamName={actualChamp?.squadra || ''} />
                </p>
                <Jersey colors={actualChamp?.colors || {primary: '#000000', secondary: '#ffffff'}} />
            </div>

            <div className="py-10">     
                <TimelineByDecades segments={timeLineData}/>
            </div>

        </div>
    );
  }
  
  export default Timeline;