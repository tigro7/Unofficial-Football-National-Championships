import localFont from "next/font/local";
import "./globals.css";
import Layout from "./components/layout";
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-secondary`}>
        <Layout>
          {children}
        </Layout>
        <SpeedInsights />
      </body>
    </html>
  );
}
