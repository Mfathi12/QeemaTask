import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

const base =
  "inline-flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "border border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[#374151] hover:bg-[var(--surface-2)]",
  ghost:
    "border border-[var(--border)] bg-white text-[#374151] hover:bg-[var(--surface-2)]",
  danger:
    "border border-[var(--danger-border)] bg-white text-[var(--danger)] hover:bg-[var(--danger-bg)]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
