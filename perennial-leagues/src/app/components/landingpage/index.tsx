'use client';

import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Header con il link per tornare alla Home */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Campionato d&apos;Italia non ufficiale</h1>
        <Link href="/" className="text-lg text-blue-600 hover:underline">
            Home
        </Link>
      </header>

      {/* Contenuto principale */}
      <div className="flex flex-col items-center">
        {/* Link al prossimo match */}
        <Link href="/match/next/serie_a" className="w-full max-w-md p-6 mb-6 text-center bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all">
            Prossima difesa del titolo
        </Link>

        {/* Link alla cronologia */}
        <Link href="/timeline/serie_a" className="w-full max-w-md p-6 text-center bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all">
            Cronologia dei Regni
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
