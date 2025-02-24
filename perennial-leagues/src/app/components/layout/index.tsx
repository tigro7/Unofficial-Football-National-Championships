'use client';

import { pridi } from "@/app/fonts";
import { useTheme } from "@/contexts/theme-context";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { theme, setTheme } = useTheme();

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
        <div>
          Except where otherwhise noted, content on this site, <a property="dct:title" rel="cc:attributionURL" href="http://ufnc.xyz">ufnc</a>{' by '}<a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://www.linkedin.com/in/alberto-tiribelli-64237867/">Alberto Tiribelli</a>{', is licensed under '}
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ display: 'inline-block' }}>CC BY-NC-SA 4.0.</a> Icons by <a href="https://fontawesome.com">Font Awesome</a>. 
          <div className="flex justify-center mt-2">
            <Image height={22} width={22} style={{ marginLeft: '3px', verticalAlign: 'text-bottom' }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="" />
            <Image height={22} width={22} style={{ marginLeft: '3px', verticalAlign: 'text-bottom' }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="" />
            <Image height={22} width={22} style={{ marginLeft: '3px', verticalAlign: 'text-bottom' }} src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="" />
            <Image height={22} width={22} style={{ marginLeft: '3px', verticalAlign: 'text-bottom' }} src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt="" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;