'use client';

import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl">Campionato d&apos;Italia non ufficiale</h1>
        <Link href="/" className="text-lg hover:underline">
            Home
        </Link>
      </header>

      {/* Contenuto */}
      <main className="flex-grow container mx-auto p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4">
        by Alberto Tiribelli
      </footer>
    </div>
  );
};

export default Layout;