'use client';

import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-tertiary text-white p-4 flex justify-between items-center">
        <Image src="/headersimage.png" alt="Unofficial Football National Championships" className="h-16" width={313} height={91} />
        <Link href="/" className="text-lg hover:underline">
            <Image src="/logofull.png" alt="Home" className="h-16" width={64} height={64} />
        </Link>
      </header>

      {/* Contenuto */}
      <main className="flex-grow container mx-auto p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-tertiary text-white text-center p-4">
        by Alberto Tiribelli
      </footer>
    </div>
  );
};

export default Layout;