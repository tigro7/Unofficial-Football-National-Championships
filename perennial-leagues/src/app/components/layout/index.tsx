'use client';

import { pridi } from "@/app/fonts";
import { useTheme } from "@/contexts/theme-context";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { theme, setTheme } = useTheme();
  //const isBrowserDefaultDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  //setTheme(isBrowserDefaultDark() ? 'dark' : 'light');

  return (
    <div className="min-h-screen flex flex-col" tabIndex={-1}>
      {/* Contenuto */}
      <main className="flex-grow container mx-auto p-4">
        {/* Header */}
        <header className="flex justify-between items-center mb-[var(--margin-huge)]">
          <Link href="/" className="flex items-center">
            <Image src="/logofull.png" alt="Unofficial Football National Championships" className="h-16" width={64} height={64} />
            <h2 className={`${pridi.className} h2 ml-[var(--margin-sm)]`}>UFNC</h2>
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden md:block bg-inverted px-4 py-2 rounded-lg"
            title={theme === 'dark' ? 'light theme' : 'dark theme'}
          >
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
          </button>
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