'use client';

import { pridi } from "@/app/fonts";
import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Contenuto */}
      <main className="flex-grow container mx-auto p-4">
        {/* Header */}
        <header className="flex justify-between items-center mb-[var(--margin-huge)]">
          <Link href="/" className="flex items-center">
            <Image src="/logofull.png" alt="Unofficial Football National Championships" className="h-16" width={64} height={64} />
            <h2 className={`${pridi.className} h2 ml-[var(--margin-sm)]`}>UFNC</h2>
          </Link>
        </header>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="text-center p-4">
        by Alberto Tiribelli
      </footer>
    </div>
  );
};

export default Layout;