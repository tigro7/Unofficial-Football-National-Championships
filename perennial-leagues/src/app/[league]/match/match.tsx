'use client'

import HeadToHead from "@/app/components/HeadToHead";
import Jersey from "@/app/components/Jersey";
import TrophyTable from "@/app/components/TrophyTable";
import TeamLink from "@/app/components/TeamLink";
import TeamStats from "@/app/components/TeamStats";
import {
  faCrown,
  faTrophy,
  faCalendar,
  faFlag,
  faHandshake,
  faShieldHalved,
  faCircleArrowLeft,
  faCircleArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { InfoProvider } from "@/contexts/InfoContext/InfoContext";
import InfoWindow from "@/contexts/InfoContext/InfoWindow";
import Link from "next/link";

const Match = ({ matchInfo, teamHome, teamAway, stats, adjacents, league = "serie_a"}: { 
  matchInfo: { date: string, location: string, score?: string, outcome: string, detentore: string, sfidante: string, home: string, away: string, competizione: string, numero: number}, 
  teamHome: { name: string, colors: { primary: string, secondary: string }, abbr: string}, 
  teamAway: { name: string, colors: { primary: string, secondary: string }, abbr: string}, 
  stats: { headToHead: {home: number, away: number, draw: number}, teamHomeTitles: number, teamAwayTitles: number },
  adjacents: { previous: number, next: number },
  league: string
}) => {
  
    const iconHome = matchInfo.detentore === teamHome.name ? faCrown : matchInfo.detentore === teamAway.name && matchInfo.outcome === 's' ? faFlag : null;
    const iconAway = matchInfo.detentore === teamAway.name ? faCrown : matchInfo.detentore === teamHome.name && matchInfo.outcome === 's' ? faFlag : null;
    const iconMatch = matchInfo.outcome === 'd' ? faHandshake : matchInfo.outcome === 's' ? faTrophy : matchInfo.outcome === 'v' ? faShieldHalved : faCalendar;
    const iconTitle = matchInfo.outcome === 'd' ? `Draw (${matchInfo.detentore} still reigns)` : matchInfo.outcome === 's' ? `Won by ${matchInfo.detentore}` : matchInfo.outcome === 'v' ? `Defended by ${matchInfo.detentore}` : 'Scheduled';
    const iconColor = matchInfo.outcome === 's' ? 'gold' : '';

    const [iconStats, setStats] = useState([]);

    const [matchDate, setMatchDate] = useState<string | null>(null);

    const router = useRouter();
  
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await fetch(`/api/${league}/stats/match/${matchInfo.numero}`);
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error("Errore nel caricamento delle statistiche", error);
        }
      };
  
      fetchStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMatchDate(new Date(matchInfo.date).toLocaleDateString());
    }, [league, matchInfo.date, matchInfo.numero]);

    const [swipeProgress, setSwipeProgress] = useState<number | null>(null); // Valore progressivo per il feedback

    const handlers = useSwipeable({
      onSwiping: (eventData) => {
        const maxSwipe = window.innerWidth / 2;
        const progress = Math.min(Math.abs(eventData.deltaX) / maxSwipe, 1);
        if (eventData.dir === "Left" && adjacents.next) {
          setSwipeProgress(progress);
        } else if (eventData.dir === "Right" && adjacents.previous) {
          setSwipeProgress(-progress);
        } else {
          setSwipeProgress(null);
        }
      },
      onSwiped: (eventData) => {
        if (eventData.dir === "Left" && adjacents.next) {
          router.push(`/${league}/match/${adjacents.next}`);
        } else if (eventData.dir === "Right" && adjacents.previous) {
          router.push(`/${league}/match/${adjacents.previous}`);
        }
        setSwipeProgress(null);
      },
      preventScrollOnSwipe: false,
      trackTouch: true,
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" && adjacents.previous) {
        router.push(`/${league}/match/${adjacents.previous}`);
      } else if (e.key === "ArrowRight" && adjacents.next) {
        router.push(`/${league}/match/${adjacents.next}`);
      }
    };

    return (
      <InfoProvider>
        <title>{league} - Match - UFNC</title>
        <div {...handlers} onKeyDown={handleKeyDown} tabIndex={0} aria-label="Match detail — use arrow keys or swipe to navigate between matches">
          {/* Swipe feedback overlay */}
          {swipeProgress !== null && (
            <div
              className="fixed top-0 h-full transition-transform duration-100 ease-out"
              style={{
                left: swipeProgress < 0 ? 0 : undefined,
                right: swipeProgress > 0 ? 0 : undefined,
                width: `${Math.min(Math.abs(swipeProgress) * 100, 15)}%`,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            />
          )}

          {adjacents.previous && (
            <Link
              className="landscape:hidden fixed left-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.previous}`}
              aria-label="Previous match"
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowLeft} size="2x" aria-hidden="true" />
            </Link>
          )}
          {adjacents.next && (
            <Link
              className="landscape:hidden fixed right-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.next}`}
              aria-label="Next match"
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowRight} size="2x" aria-hidden="true" />
            </Link>
          )}

          <section className="section mt-[var(--margin-big)]">
            {/* Match header */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                  <h2 className="sub font-bold text-center">
                    <TeamLink
                      league={league}
                      teamName={teamHome.abbr?.length > 0 && window.innerWidth <= 768 ? teamHome.abbr : matchInfo.home}
                      teamLink={teamHome.name}
                    />
                  </h2>
                </div>
                <Link href={`/${league}/team/${teamHome.name}`} title={teamHome.name} aria-label={teamHome.name}>
                  <Jersey colors={teamHome.colors} icon={iconHome} ariaLabel={teamHome.name} />
                </Link>
              </div>

              <div className="flex flex-col items-center text-center w-1/3 gap-[var(--margin-xs)]">
                <p className="small font-bold">
                  <Link href={`/${league}`} className="link-secondary">{matchInfo.competizione}</Link>
                </p>
                <p className="small italic flex items-center gap-[var(--margin-sm)]">
                  {adjacents.previous && <Link className="portrait:hidden" href={`/${league}/match/${adjacents.previous}`} aria-label="Previous match"><FontAwesomeIcon icon={faCircleArrowLeft} aria-hidden="true" /></Link>}
                  {matchDate}
                  {adjacents.next && <Link className="portrait:hidden" href={`/${league}/match/${adjacents.next}`} aria-label="Next match"><FontAwesomeIcon icon={faCircleArrowRight} aria-hidden="true" /></Link>}
                </p>
                {matchInfo.location && <p className="small text-tertiary">{matchInfo.location}</p>}
                {matchInfo.score && <p className="h3">{matchInfo.score}</p>}
                <p title={iconTitle}>
                  <FontAwesomeIcon icon={iconMatch} className="text-4xl" color={iconColor} />
                </p>
              </div>

              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                  <h2 className="sub font-bold text-center">
                    <TeamLink
                      league={league}
                      teamName={teamAway.abbr?.length > 0 && window.innerWidth <= 768 ? teamAway.abbr : matchInfo.away}
                      teamLink={teamAway.name}
                    />
                  </h2>
                </div>
                <Link href={`/${league}/team/${teamAway.name}`} title={teamAway.name} aria-label={teamAway.name}>
                  <Jersey colors={teamAway.colors} icon={iconAway} ariaLabel={teamAway.name} />
                </Link>
              </div>
            </div>

            {/* Achievements */}
            {iconStats.length > 0 && (
              <div className="mt-[var(--margin-lg)]">
                <TeamStats stats={iconStats} match={true} />
              </div>
            )}

            <div className="mt-[var(--margin-lg)]" />
            <div className="flex justify-center items-stretch gap-[var(--margin-lg)] portrait:hidden">
              <TrophyTable titles={stats.teamHomeTitles} match={true} className="w-1/3 h-full" />
              <HeadToHead
                home={stats.headToHead.home}
                draw={stats.headToHead.draw}
                away={stats.headToHead.away}
                colorHome={teamHome.colors.primary === "#FFFFFF" ? teamHome.colors.secondary : teamHome.colors.primary}
                colorAway={teamAway.colors.primary === "#FFFFFF" ? teamAway.colors.secondary : teamAway.colors.primary}
              />
              <TrophyTable titles={stats.teamAwayTitles} match={true} className="w-1/3 h-full" />
            </div>
            <div className="landscape:hidden flex flex-col items-center gap-[var(--margin-md)]">
              <HeadToHead
                home={stats.headToHead.home}
                draw={stats.headToHead.draw}
                away={stats.headToHead.away}
                colorHome={teamHome.colors.primary === "#FFFFFF" ? teamHome.colors.secondary : teamHome.colors.primary}
                colorAway={teamAway.colors.primary === "#FFFFFF" ? teamAway.colors.secondary : teamAway.colors.primary}
              />
              <div className="flex justify-around w-full">
                <TrophyTable titles={stats.teamHomeTitles} match={true} className="w-1/2" />
                <TrophyTable titles={stats.teamAwayTitles} match={true} className="w-1/2" />
              </div>
            </div>
          </section>
        </div>
        <InfoWindow />
      </InfoProvider>
    );
};

export default Match;
