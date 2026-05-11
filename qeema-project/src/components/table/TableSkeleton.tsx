import { Skeleton } from "@/components/ui/Skeleton";
import { DataTableBody, DataTableTd, DataTableTr } from "./DataTable";

type Props = {
  cols: number;
  rows?: number;
};

/** Skeleton rows only; pair with a visible `DataTableHeadRow` above. */
export function TableSkeletonRows({ cols, rows = 6 }: Props) {
  return (
    <DataTableBody>
      {Array.from({ length: rows }, (_, r) => (
        <DataTableTr key={r}>
          {Array.from({ length: cols }, (_, c) => (
            <DataTableTd key={c}>
              <Skeleton className="h-4 w-full max-w-[12rem]" />
            </DataTableTd>
          ))}
        </DataTableTr>
      ))}
    </DataTableBody>
  );
}
