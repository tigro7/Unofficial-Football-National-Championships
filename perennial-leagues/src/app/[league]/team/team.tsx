'use client'

import "@/app/utils/setupCharts";
import Jersey from "@/app/components/Jersey";
import TimelineChart from "@/app/components/TimelineChart";
import StatContainer from "@/app/components/StatContainer";
import TeamStats from "@/app/components/TeamStats";
import { useEffect, useState } from "react";

const generateTimeline = (regni: { start: string; end: string }[], startDate: string) => {
  const timeline = [];
  const today = new Date().toISOString();

  // Aggiungere un regno vuoto all'Started, se necessario
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

  // Aggiungere un regno vuoto alla Ended, se necessario
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

const Squadra = ({squadra, stats, colors, regni, startDate, posizioni, league = "serie_a"}: 
  {squadra: string, stats: {regni: number, durataCombinata: number, durataMedia: number}, colors: {primary: string, secondary: string}, regni:{ start: string, end: string }[], startDate: string, posizioni: {regni: number, durata: number, media: number}, league: string}) => {

  const [iconStats, setStats] = useState([]);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await fetch(`/api/${league}/stats/${squadra}`);
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error("Errore nel caricamento delle statistiche", error);
        }
      };
  
      fetchStats();
  }, [league, squadra]);

  if (!squadra || !stats || !colors) {
    return <div>Errore: dati non disponibili</div>;
  }

  const timeLineData = generateTimeline(regni, startDate);
  const longestReign = timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{return prev.duration > curr.duration ? prev : curr;})
  const shortestReign = timeLineData.filter(regno => regno.team).reduce((prev, curr) =>{return prev.duration < curr.duration ? prev : curr;})

  const numeralSuffix = (num: number) => {
    const lastDigit = num.toString().slice(-1);
    if (lastDigit === '1') return "st";
    if (lastDigit === '2') return "nd";
    if (lastDigit === '3') return "rd";
    return "th";
  }

  return(
    <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-slate-50">
      {/* Nome della Squadra */}
      <h1 className="text-4xl font-bold text-center mb-6 rounded-xl">
        {`${squadra.charAt(0).toUpperCase()}${squadra.slice(1)}`}
      </h1>

      {/* Stats e Posizioni */}
      <div className="flex justify-around mb-6">
        <StatContainer statName="Total Titles" statValue={stats.regni} position={posizioni.regni} positionSuffix={`${numeralSuffix(posizioni.regni)} overall`} color={"#000000"} />
        <StatContainer statName="Combined Duration" statValue={stats.durataCombinata} valueSuffix=" days" position={posizioni.durata} positionSuffix={`${numeralSuffix(posizioni.durata)} overall`} color={"#000000"} />
        <StatContainer statName="Average Duration" statValue={stats.durataMedia} valueSuffix=" days" position={posizioni.media} positionSuffix={`${numeralSuffix(posizioni.media)} overall`} color={"#000000"} />
      </div>

      <div className="flex justify-around mb-6">
        <TeamStats stats={iconStats} />
      </div>
      
      <div className="flex justify-around mb-6">
        <StatContainer statName="Longest Reign" statValue={longestReign.duration} valueSuffix=" days" color={"#000000"}
          position={' '} positionPrefix={`Started: ${(new Date(longestReign.start)).toLocaleDateString()}`}
          positionSuffix={`Ended: ${(new Date(longestReign.end)).toLocaleDateString()}`}
        />
        <StatContainer statName="Shortest Reign" statValue={shortestReign.duration} valueSuffix=" days" color={"#000000"}
          position={' '} positionPrefix={`Started: ${(new Date(shortestReign.start)).toLocaleDateString()}`}
          positionSuffix={`Ended: ${(new Date(shortestReign.end)).toLocaleDateString()}`}
        />
      </div>

      <div className="flex justify-center mb-6">
        <Jersey colors={colors} icon={null} />
      </div>

      <div className="py-10">     
        <TimelineChart regni={timeLineData} primaryColor={"#000000"} secondaryColor={colors.secondary} league={league}/>
      </div>
    </div>
  );
}

export default Squadra;