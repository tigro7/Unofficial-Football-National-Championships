'use client'

import "@/app/utils/setupCharts";
import Jersey from "@/app/components/Jersey";
//import TimelineChart from "@/app/components/TimelineChart";
import StatContainer from "@/app/components/StatContainer";
import TeamStats from "@/app/components/TeamStats";
import { useEffect, useState } from "react";
import normalizeLeagueName from "@/app/utils/leaguesMap";
import LastFiveMatches from "@/app/components/LastFive";
import { openSans } from "@/app/fonts";
import TrophyTable from "@/app/components/TrophyTable";
import VerticalTimelineChart from "@/app/components/VerticalTimelineChart";

const generateTimeline = (regni: { start: string; end: string, matchStart: number, matchEnd: number }[], startDate: string) => {
  const timeline = [];
  const today = new Date().toISOString();

  // Aggiungere un regno vuoto all'Started, se necessario
  if (new Date(startDate).getTime() < new Date(regni[0]?.start).getTime()) {
    timeline.push({
      start: startDate,
      end: regni[0].start,
      matchStart: 1,
      matchEnd: regni[0].matchStart,
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
          matchStart: currentRegno.matchEnd,
          end: regni[i + 1].start,
          matchEnd: regni[i + 1].matchStart,
          team: false,
          duration: Math.ceil(
            (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)
          ),
        });
      }
    }
  }

  // Aggiungere un regno vuoto alla Ended, se necessario
  if (new Date(today).getTime() > new Date(regni[regni.length - 1]?.end).getTime()) {
    timeline.push({
      start: regni[regni.length - 1].end,
      matchStart: regni[regni.length - 1].matchEnd,
      end: today,
      matchEnd: regni[regni.length - 1].matchEnd,
      team: false,
      duration: Math.ceil(
        (new Date(today).getTime() - new Date(regni[regni.length - 1].end).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    });
  }

  return timeline;
};

const Squadra = ({squadra, stats, colors, regni, startDate, posizioni, league = "serie_a", lastFiveMatches}: 
  {squadra: string, 
    stats: {regni: number, durataCombinata: number, durataMedia: number, difese: number, mediaDifese: number, sfide: number}, 
    colors: {primary: string, secondary: string}, 
    regni:{ start: string, end: string, matchStart: number, matchEnd: number }[], 
    startDate: string, 
    posizioni: {regni: number, durata: number, media: number, difese: number, mediaDifese: number, sfide: number}, 
    league: string,
    lastFiveMatches: {numero: number, detentore: string, sfidante: string, risultato: string, note: string, data: string, durata: number, outcome: 'v' | 's' | 'd', home: string, away: string, league: string}[]
  }) => {

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
  //const longestReign = timeLineData.length > 0 ? timeLineData.filter(regno => regno.team).reduce((prev, curr) => { return prev.duration > curr.duration ? prev : curr; }) : null;
  //const shortestReign = timeLineData.length > 0 ? timeLineData.filter(regno => regno.team).reduce((prev, curr) => { return prev.duration < curr.duration ? prev : curr; }) : null;

  const numeralSuffix = (num: number) => {
    const lastDigit = num.toString().slice(-1);
    if (lastDigit === '1') return "st";
    if (lastDigit === '2') return "nd";
    if (lastDigit === '3') return "rd";
    return "th";
  }

  const compareDatesByDay = (date1: string, date2: string) => {
    const d1 = new Date(date1).setHours(0, 0, 0, 0);
    const d2 = new Date(date2).setHours(0, 0, 0, 0);
    return d1 === d2;
  };

  return(
    <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-system">
      {/* Nome della Squadra */}
      
      <div className={`items-start landscape:ml-12 my-6`}>
        <div className="inset-0 border-4 rounded-xl" style={{ borderColor: colors.primary }}>
          <div className="inset-1 border-4 rounded-xl p-4" style={{ borderColor: colors.secondary }}>
            <div className="flex items-center">
              <Jersey colors={colors} icon={compareDatesByDay(regni[regni.length - 1]?.end, new Date().toISOString()) ? "faCrown" : null} />
              <div className="ml-4">
                <h1 className="text-4xl font-bold">
                  {`${squadra.charAt(0).toUpperCase()}${squadra.slice(1)}`}
                </h1>
                <h3 className={`text-2xl text-gray-800 italic ${openSans.className}`}>
                  {normalizeLeagueName(league)}
                </h3>
              </div>
              <TrophyTable titles={stats.regni} />
            </div>
          </div>
        </div>
      </div>

      {/* Ultimi 5 match */}
      <div className="flex justify-around mb-6">
        <LastFiveMatches team={squadra} matches={lastFiveMatches} />
      </div>

      <div className="flex justify-around mb-6">
        <TeamStats stats={iconStats} />
      </div>

      {/* Stats e Posizioni */}
      <div className="flex justify-around mb-6 grid grid-cols-[repeat(auto-fit,minmax(150px,150px))] justify-center gap-2">
        <StatContainer statName="Total Titles" statValue={stats.regni} position={posizioni.regni} positionSuffix={`${numeralSuffix(posizioni.regni)} overall`} />
        <StatContainer statName="Combined Duration" statValue={stats.durataCombinata} valueSuffix=" days" position={posizioni.durata} positionSuffix={`${numeralSuffix(posizioni.durata)} overall`} />
        <StatContainer statName="Average Duration" statValue={stats.durataMedia} valueSuffix=" days" position={posizioni.media} positionSuffix={`${numeralSuffix(posizioni.media)} overall`} />
        <StatContainer statName="Defenses" statValue={stats.difese} valueSuffix=" times" position={posizioni.difese} positionSuffix={`${numeralSuffix(posizioni.difese)} overall`} />
        <StatContainer statName="Average Defenses" statValue={stats.mediaDifese} valueSuffix=" times" position={posizioni.mediaDifese} positionSuffix={`${numeralSuffix(posizioni.mediaDifese)} overall`} />
        <StatContainer statName="Challenges" statValue={stats.sfide} valueSuffix=" times" position={posizioni.sfide} positionSuffix={`${numeralSuffix(posizioni.sfide)} overall`} />
      </div>
  
      {/* Regni
      <div className="flex justify-around mb-6">
        {longestReign &&
          <StatContainer statName="Longest Reign" statValue={longestReign.duration} valueSuffix=" days"
            position={' '} positionPrefix={`Started: ${(new Date(longestReign.start)).toLocaleDateString()}`}
            positionSuffix={`Ended: ${(new Date(longestReign.end)).toLocaleDateString()}`}
          />
        }
        {shortestReign &&
          <StatContainer statName="Shortest Reign" statValue={shortestReign.duration} valueSuffix=" days"
            position={' '} positionPrefix={`Started: ${(new Date(shortestReign.start)).toLocaleDateString()}`}
            positionSuffix={`Ended: ${(new Date(shortestReign.end)).toLocaleDateString()}`}
          />
      }
      </div>

      <div className="py-10">
        {timeLineData.length > 0 &&     
          <TimelineChart regni={timeLineData} primaryColor={colors.primary} secondaryColor={colors.secondary} league={league}/>
        }
      </div>
      */}
      <div className="py-10">
        {timeLineData.length > 0 &&     
          <VerticalTimelineChart regni={timeLineData} primaryColor={colors.primary} secondaryColor={colors.secondary} league={league}/>
        }
      </div>
    </div>
  );
}

export default Squadra;