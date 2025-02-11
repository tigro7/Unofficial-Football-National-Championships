//import localFont from "next/font/local";
import "./globals.css";
import Layout from "./components/layout";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Image from 'next/image';
import { montserrat } from "./fonts";

export const metadata = {
  title: "Campionato d'Italia non ufficiale",
  description: "Classifica e statistiche della Serie A non ufficiale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ufnc.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${montserrat.className} antialiased bg-background`}>
        <Image src="/homepageback.png" alt="Unofficial Football National Championships" className="absolute right-0 -z-10 opacity-[.125] lg:opacity-50" width={512} height={512} />
        <Layout>
          {children}
        </Layout>
        <SpeedInsights />
      </body>
    </html>
  );
}
