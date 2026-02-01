import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
