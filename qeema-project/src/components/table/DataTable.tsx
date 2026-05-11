import type { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  minWidthClass?: string;
};

export function DataTable({
  children,
  minWidthClass = "min-w-[880px]",
}: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className={`w-full ${minWidthClass} border-collapse text-left text-[13px]`}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHeadRow({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-[var(--surface)]">
      <tr className="border-b border-[var(--border)]">{children}</tr>
    </thead>
  );
}

export function DataTableTh({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] ${className}`}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)]">{children}</tbody>;
}

export function DataTableTr({
  children,
  highlight = false,
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`transition-colors duration-100 hover:bg-[var(--surface-2)] ${
        highlight ? "bg-[var(--accent-light)]" : ""
      }`}
    >
      {children}
    </tr>
  );
}

export function DataTableTd({
  children,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 align-middle text-[13px] text-[var(--text)] ${className}`}
    >
      {children}
    </td>
  );
}
