/* eslint-disable @next/next/no-sync-scripts */
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Velox Solar",
  description: "Economia de Energia Inteligente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        {/* 1. TAILWIND (VISUAL) - Apenas o link, sem config extra para não bugar */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* 2. GOOGLE ADS (RASTREAMENTO) - ID: AW-17791443438 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17791443438"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17791443438');
          `}
        </script>
      </head>
      <body className={`${inter.className} bg-[#0B0D17] text-white`}>
        {children}
      </body>
    </html>
  );
}