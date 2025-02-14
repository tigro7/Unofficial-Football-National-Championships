'use client';

import { pridi } from "@/app/fonts";
import { ThemeContext } from "@/contexts/theme-context";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {

  const isBrowserDefaultDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(isBrowserDefaultDark() ? 'dark' : 'light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.add(theme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = () => {
    const isCurrentDark = theme === 'dark';
    const newTheme = isCurrentDark ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };


  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-${theme}`}>
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
                onClick={handleThemeChange}
                className="hidden md:block bg-inverted px-4 py-2 rounded-lg"
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
      </div>
      </ThemeContext.Provider>
  );
};

export default Layout;