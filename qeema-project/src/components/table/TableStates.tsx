import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { DataTableBody, DataTableTd, DataTableTr } from "./DataTable";

type ColSpanProps = {
  colSpan: number;
};

export function TableLoadingRow({ colSpan }: ColSpanProps) {
  return (
    <DataTableBody>
      <DataTableTr>
        <DataTableTd colSpan={colSpan} className="py-12 text-center">
          <span className="inline-block animate-pulse text-[var(--text-muted)]">
            Loading…
          </span>
        </DataTableTd>
      </DataTableTr>
    </DataTableBody>
  );
}

export function TableEmptyRow({
  colSpan,
  children,
}: ColSpanProps & { children: ReactNode }) {
  return (
    <DataTableBody>
      <DataTableTr>
        <DataTableTd
          colSpan={colSpan}
          className="py-10 text-center text-[var(--text-muted)]"
        >
          {children}
        </DataTableTd>
      </DataTableTr>
    </DataTableBody>
  );
}

export function TableErrorRow({
  colSpan,
  message,
  onRetry,
}: ColSpanProps & {
  message: string;
  onRetry: () => void;
}) {
  return (
    <DataTableBody>
      <DataTableTr>
        <DataTableTd colSpan={colSpan} className="py-10 text-center">
          <p className="mb-4 text-[13px] text-[var(--danger)]">{message}</p>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </DataTableTd>
      </DataTableTr>
    </DataTableBody>
  );
}
