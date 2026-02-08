import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/components/user-provider";

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
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <UserProvider>{children}</UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
