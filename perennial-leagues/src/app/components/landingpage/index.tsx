'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

const LandingPage = () => {

  const [nextMatchDate, setNextMatchDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextMatch = async () => {
      try {
        const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
        const response = await fetch(`${host}/api/serie_a/matches/last`);
        const data = (await response.json())[0];

        // Format the date
        const nextMatchDate = new Date(data.data)
          .toLocaleDateString()
          .split('/')
          .reverse()
          .join('-');
        setNextMatchDate(nextMatchDate);
      } catch (error) {
        console.error("Error fetching next match:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextMatch();
  }, []);

  return (
    <div className="container mx-auto mt-8 p-4">

      {/* Contenuto principale */}
      <div className="flex flex-col items-center">
        {isLoading ? (
          <div className="w-full max-w-md p-6 mb-6 text-center bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-grey-600 transition-all">
            Prossima difesa del titolo
          </div>
        ) : nextMatchDate ? (
          <>
            {/* Link al prossimo match */}
            <Link
              href={`/serie_a/match/${nextMatchDate}`}
              className="w-full max-w-md p-6 mb-6 text-center bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all"
            >
              Prossima difesa del titolo
            </Link>
          </>
        ) : (
          <p>Nessun match disponibile</p>
        )}

        {/* Link alla cronologia */}
        <Link href="/serie_a/timeline" className="w-full max-w-md p-6 text-center bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all">
            Cronologia dei Regni
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
