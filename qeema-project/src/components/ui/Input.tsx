import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

const base =
  "h-9 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-[13px] font-normal text-[var(--text)] outline-none transition-colors duration-150 " +
  "placeholder:text-[var(--text-hint)] placeholder:text-[13px] " +
  "focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className = "", ...rest }: Props) {
  return <input className={`${base} ${className}`} {...rest} />;
}
