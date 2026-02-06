import { NutriLayout } from "@/components/layout/NutriLayout";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NutriLayout>{children}</NutriLayout>;
}
