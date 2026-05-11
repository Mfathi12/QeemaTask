import type { ReactNode } from "react";

/** Max-width shell; horizontal padding comes from `AdminLayout` main on mobile/desktop. */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] ${className}`}>
      {children}
    </div>
  );
}
