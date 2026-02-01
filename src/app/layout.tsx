import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "NutriPlan",
  description:
    "Plataforma multi-tenant para planejamento alimentar auditável com três portais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${ibmPlexSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
