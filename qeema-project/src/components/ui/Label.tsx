import type { LabelHTMLAttributes, ReactNode } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export function Label({ children, className = "", ...rest }: Props) {
  return (
    <label
      className={`mb-1.5 block text-[11px] font-medium text-[var(--text-muted)] ${className}`}
      {...rest}
    >
      {children}
    </label>
  );
}
