import type { ReactNode } from "react";

/** Neutral pill for categories / generic tags. */
export function Badge({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-[11px] font-medium text-[#374151] ${className}`}
    >
      {children}
    </span>
  );
}
