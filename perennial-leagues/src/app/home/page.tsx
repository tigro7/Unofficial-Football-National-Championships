'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home(){
    const [nextMatchNumber, setNextMatchNumber] = useState<string | null>(null);
    const [reigningChampion, setReigningChampion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchNextMatch = async () => {
        try {
          const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
          const response = await fetch(`${host}/api/serie_a/matches/last`);
          const data = (await response.json())[0];
          setNextMatchNumber(data.numero);
          setReigningChampion(data.detentore);
        } catch (error) {
          console.error("Error fetching next match:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchNextMatch();
    }, []);

    return(
        <div className="min-h-screen bg-system" style={{ backgroundImage: "url('/homepageback.png')" }}>
            <div className="bg-system bg-system-50 min-h-screen flex flex-col items-center p-6">
                <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-10 text-center">Unofficial Football National Championships</h1>
                <div className="grid grid-cols-1 gap-6 w-full max-w-6xl">
                    {/* Container per ogni lega */}
                    <div className="bg-system rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Serie A</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Card Campione Attuale */}
                        <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer">
                            <Link href={reigningChampion ? `/serie_a/team/${reigningChampion}` : "#"}>
                                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                                    {/* Immagine o icona */}
                                    <p className="text-xl font-bold text-gray-800">🏆</p>
                                </div>
                                {isLoading ? (
                                    <h3 className="text-lg font-semibold text-center">Reigning Champion</h3>
                                ) : reigningChampion ? (
                                    <h3 className="text-lg font-semibold text-center">Reigning Champion: {reigningChampion.charAt(0).toUpperCase() + reigningChampion.slice(1)}</h3>
                                ) : (
                                    <p className="text-lg font-semibold text-center">No available Champion</p>
                                )}
                            </Link>
                        </div>
                        {/* Card Timeline Regni */}
                        <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                            <Link href="/serie_a/timeline">
                                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                                {/* Immagine o icona */}
                                <p className="text-xl font-bold text-gray-800">📜</p>
                                </div>
                                <h3 className="text-lg font-semibold text-center">Titles Timeline</h3>
                            </Link>
                        </div>
                        {/* Card Prossimo Match */}
                        <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                            <Link href={nextMatchNumber ? `/serie_a/match/${nextMatchNumber}` : "#"}>
                                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                                    {/* Immagine o icona */}
                                    <p className="text-xl font-bold text-gray-800">⚽</p>
                                </div>
                                <h3 className="text-lg font-semibold text-center">
                                    {isLoading ? "Next Match" : nextMatchNumber ? "Next Match" : "No match available"}
                                </h3>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Ripetere per altre leghe */}
                <div className="bg-system rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Premier League</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                            <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-xl font-bold text-gray-800">🚧</p>
                            </div>
                            <h3 className="text-lg font-semibold text-center">TBD</h3>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
