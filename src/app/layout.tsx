import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/components/user-provider";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
      <body className={`${spaceGrotesk.className} antialiased bg-background text-foreground min-h-screen`}>
        <UserProvider>{children}</UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
