import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "BRL",
  locale: string = "pt-BR"
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
