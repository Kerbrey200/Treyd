import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic number formatter for UZS currency.
 * Guarantees identical output on both SSR server and client regardless of navigator locale.
 */
export function formatUZS(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return isNegative ? `-${formatted}` : formatted;
}

