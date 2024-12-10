'use client'

import Jersey from "../components/Jersey";
import TimelineByDecades from "../components/TimelineByDecades";

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
  
  

const Timeline = ({squadre, regni, startDate}: {squadre: {squadra: string, colors: {primary: string, secondary: string}}[], regni:{ start: string, end: string, squadra: string}[], startDate: string}) => {

    if (!squadre || !regni || !startDate) {
      return <div>Errore: dati non disponibili</div>;
    }
  
    const timeLineData = generateTimelineByDecade(squadre, regni);

    const attualeCampione = regni[regni.length - 1].squadra;

    const duration = (reign : {start: string, end: string, squadra: string}) => Math.ceil((new Date(reign.end).getTime() - new Date(reign.start).getTime()) / (1000 * 60 * 60 * 24));

    const longestReign = regni.reduce((prev, curr) => (duration(prev) > duration(curr) ? prev : curr));
    const shortestReign = regni.reduce((prev, curr) => (duration(prev) < duration(curr) ? prev : curr));
  
    return(
        <div className="container mx-auto mt-8 p-4 border-4 border-gold">
            {/* Titolo */}
            <h1 className="text-4xl font-bold text-center mb-6">
                Cronologia dei Regni
            </h1>

            {/* Stats Generali */}
            <div className="flex justify-around mb-6">
                <div className="text-center">
                    <p className="text-xl font-semibold">Totale Regni</p>
                    <p className="text-3xl">{regni.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-semibold">Durata Totale</p>
                    <p className="text-3xl">{Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} giorni</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-semibold">Durata Media</p>
                    <p className="text-3xl">{Math.floor(((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))/regni.length)} giorni</p>
                </div>
            </div>

            {/* Il più lungo e il più corto */}
            <div className="flex justify-around mb-6">
                <div className="text-center" style={{ color: squadre.find(squadra => squadra.squadra == longestReign.squadra)?.colors.primary }}>
                    <p className="text-xl font-semibold">Regno più lungo</p>
                    <p className="text-3xl">
                        {duration(longestReign)} giorni
                    </p>
                    <p className="text-sm italic mt-2">Inizio: {(new Date(longestReign.start)).toLocaleDateString()} Fine: {(new Date(longestReign.end)).toLocaleDateString()}</p>
                </div>
                <div className="text-center" style={{ color: squadre.find(squadra => squadra.squadra == shortestReign.squadra)?.colors.primary }}>
                    <p className="text-xl font-semibold">Regno più corto</p>
                    <p className="text-3xl">
                        {duration(shortestReign)} giorni
                    </p>
                    <p className="text-sm italic mt-2">Inizio: {(new Date(shortestReign.start)).toLocaleDateString()} Fine: {(new Date(shortestReign.end)).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Campione Attuale */}
            <div className="flex flex-col items-center mb-6">
                <p className="text-xl font-semibold text-center" style={{ color: squadre.find(squadra => squadra.squadra == attualeCampione)?.colors.primary }}>
                    Campione Attuale
                </p>
                <p className="text-3xl font-bold" style={{ color: squadre.find(squadra => squadra.squadra == attualeCampione)?.colors.secondary }}>
                    {attualeCampione}
                </p>
                <Jersey colors={squadre.find(squadra => squadra.squadra == attualeCampione)?.colors || {primary: '#000000', secondary: '#ffffff'}} />
            </div>

            <div className="py-10">     
                <TimelineByDecades segments={timeLineData}/>
            </div>

        </div>
    );
  }
  
  export default Timeline;