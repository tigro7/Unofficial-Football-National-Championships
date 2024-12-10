'use client'

import "@/app/utils/setupCharts";
import Jersey from "../components/Jersey";
import Timeline from "../components/Timeline";

const generateTimeline = (regni: { start: string; end: string }[], startDate: string) => {
  const timeline = [];
  const today = new Date().toISOString();

  // Aggiungere un regno vuoto all'inizio, se necessario
  if (new Date(startDate).getTime() < new Date(regni[0].start).getTime()) {
    timeline.push({
      start: startDate,
      end: regni[0].start,
      team: false,
      duration: Math.ceil(
        (new Date(regni[0].start).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    });
  }

  // Iterare sui regni e calcolare la durata
  for (let i = 0; i < regni.length; i++) {
    const currentRegno = regni[i];
    const currentStart = new Date(currentRegno.start);
    const currentEnd = new Date(currentRegno.end);

    // Aggiungere il regno attuale
    timeline.push({
      ...currentRegno,
      team: true,
      duration: Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)),
    });

    // Aggiungere un regno vuoto se c'è un gap tra il regno attuale e il successivo
    if (i < regni.length - 1) {
      const nextStart = new Date(regni[i + 1].start);
      if (currentEnd < nextStart) {
        timeline.push({
          start: currentRegno.end,
          end: regni[i + 1].start,
          team: false,
          duration: Math.ceil(
            (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)
          ),
        });
      }
    }
  }

  // Aggiungere un regno vuoto alla fine, se necessario
  if (new Date(today).getTime() > new Date(regni[regni.length - 1].end).getTime()) {
    timeline.push({
      start: regni[regni.length - 1].end,
      end: today,
      team: false,
      duration: Math.ceil(
        (new Date(today).getTime() - new Date(regni[regni.length - 1].end).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    });
  }

  return timeline;
};


const Squadra = ({squadra, stats, colors, regni, startDate, posizioni}: {squadra: string, stats: {regni: number, durataCombinata: number, durataMedia: number}, colors: {primary: string, secondary: string}, regni:{ start: string, end: string }[], startDate: string, posizioni: {regni: number, durata: number, media: number}}) => {

  if (!squadra || !stats || !colors) {
    return <div>Errore: dati non disponibili</div>;
  }

  const timeLineData = generateTimeline(regni, startDate);

  return(
    <div className="container mx-auto mt-8 p-4 border-4" style={{ borderColor: colors.primary }}>
    {/* Nome della Squadra */}
    <h1 className="text-4xl font-bold text-center mb-6" style={{ color: colors.primary }}>
      {`${squadra.charAt(0).toUpperCase()}${squadra.slice(1)}`}
    </h1>

    {/* Stats e Posizioni */}
    <div className="flex justify-around mb-6">
      <div className="text-center" style={{ color: colors.primary }}>
        <p className="text-xl font-semibold">Regni</p>
        <p className="text-3xl">{stats.regni}</p>
        <p className="text-sm italic mt-2">{posizioni.regni}° nella classifica totale</p>
      </div>
      <div className="text-center" style={{ color: colors.primary }}>
        <p className="text-xl font-semibold">Durata Combinata</p>
        <p className="text-3xl">{stats.durataCombinata} giorni</p>
        <p className="text-sm italic mt-2">{posizioni.durata}° nella classifica totale</p>
      </div>
      <div className="text-center" style={{ color: colors.primary }}>
        <p className="text-xl font-semibold">Durata Media</p>
        <p className="text-3xl">{stats.durataMedia} giorni</p>
        <p className="text-sm italic mt-2">{posizioni.media}° nella classifica totale</p>
      </div>
    </div>
    <div className="flex justify-around mb-6">
      <div className="text-center" style={{ color: colors.secondary }}>
        <p className="text-xl font-semibold">Primo</p>
        <p className="text-3xl">1</p>
        <p className="text-sm italic mt-2">Inizio: {(new Date(regni[0].start)).toLocaleDateString()} Fine: {(new Date(regni[0].end)).toLocaleDateString()}</p>
      </div>
      <div className="text-center" style={{ color: colors.secondary }}>
        <p className="text-xl font-semibold">Ultimo</p>
        <p className="text-3xl">{regni.length}</p>
        <p className="text-sm italic mt-2">Inizio: {(new Date(regni[regni.length - 1].start)).toLocaleDateString()} Fine: {(new Date(regni[regni.length - 1].end)).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="flex justify-around mb-6">
      <div className="text-center" style={{ color: colors.primary }}>
        <p className="text-xl font-semibold">Il più lungo</p>
        <p className="text-3xl">{timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration > curr.duration ? prev : curr;
        }).duration} giorni</p>
        <p className="text-sm italic mt-2">Inizio: {
          (new Date(
          timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration > curr.duration ? prev : curr;
        }).start)).toLocaleDateString()
        } Fine: {
          (new Date(
          timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration > curr.duration ? prev : curr;
        }).end)).toLocaleDateString()
        }</p>
      </div>
      <div className="text-center" style={{ color: colors.primary }}>
        <p className="text-xl font-semibold">Il più corto</p>
        <p className="text-3xl">{timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration < curr.duration ? prev : curr;
        }).duration} giorni</p>
        <p className="text-sm italic mt-2">Inizio: {
          (new Date(
          timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration < curr.duration ? prev : curr;
        }).start)).toLocaleDateString()
        } Fine: {
          (new Date(
          timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{
          return prev.duration < curr.duration ? prev : curr;
        }).end)).toLocaleDateString()
        }</p>
      </div>
    </div>

    <div className="flex justify-center mb-6">
      <Jersey colors={colors} />
    </div>

    <div className="py-10">     
       <Timeline regni={timeLineData} primaryColor={colors.primary} secondaryColor={colors.secondary}/>
    </div>

    </div>
  );
}

export default Squadra;