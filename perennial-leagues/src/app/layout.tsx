//import localFont from "next/font/local";
import "./globals.css";
import Layout from "./components/layout";
import { SpeedInsights } from '@vercel/speed-insights/next';
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
      </head>
      <body className={`${montserrat.className} antialiased bg-secondary`}>
        <Layout>
          {children}
        </Layout>
        <SpeedInsights />
      </body>
    </html>
  );
}
