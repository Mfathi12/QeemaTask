import { useEffect } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { RequestStatusMenu } from "@/components/ui/RequestStatusMenu";
import {
  DataTable,
  DataTableBody,
  DataTableHeadRow,
  DataTableTd,
  DataTableTh,
  DataTableTr,
  TableEmptyRow,
  TableErrorRow,
  TableSkeletonRows,
} from "@/components/table";
import { useRealtimeRequests } from "@/hooks/useRealtimeRequests";
import { toast } from "@/lib/toast";

const COL_COUNT = 6;

export function RequestsPage() {
  const { items, loading, error, refetch, highlightedIds } =
    useRealtimeRequests();

  useEffect(() => {
    if (!error) return;
    toast.error(error, { toastId: "requests-list-error" });
  }, [error]);

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Operational queue for service requests. Data loads from the API and stays synchronized through the live channel."
      />

      <DataTable minWidthClass="min-w-[960px]">
        <DataTableHeadRow>
          <DataTableTh>ID</DataTableTh>
          <DataTableTh>Status</DataTableTh>
          <DataTableTh>Requester</DataTableTh>
          <DataTableTh>Service</DataTableTh>
          <DataTableTh>Created</DataTableTh>
          <DataTableTh className="text-right">Actions</DataTableTh>
        </DataTableHeadRow>

        {loading ? (
          <TableSkeletonRows cols={COL_COUNT} rows={8} />
        ) : error ? (
          <TableErrorRow
            colSpan={COL_COUNT}
            message={error}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <TableEmptyRow colSpan={COL_COUNT}>
            No requests yet. Submissions from mobile clients appear here
            automatically when the channel is connected.
          </TableEmptyRow>
        ) : (
          <DataTableBody>
            {items.map((r) => (
              <DataTableTr key={r.id} highlight={highlightedIds.has(r.id)}>
                <DataTableTd className="font-data font-medium tabular-nums text-[var(--text)]">
                  {r.id}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={r.status} />
                </DataTableTd>
                <DataTableTd>
                  <span className="font-medium text-[var(--text)]">
                    {r.user.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                    {r.user.email}
                  </span>
                </DataTableTd>
                <DataTableTd>
                  <span className="font-medium text-[var(--text)]">
                    {r.service.name}
                  </span>
                  <span className="mt-0.5 block font-data text-[11px] tabular-nums text-[var(--text-muted)]">
                    {r.service.price.toFixed(2)}
                  </span>
                </DataTableTd>
                <DataTableTd className="font-data tabular-nums text-[var(--text-muted)]">
                  {new Date(r.createdAt).toLocaleString()}
                </DataTableTd>
                <DataTableTd className="text-right">
                  <RequestStatusMenu
                    requestId={r.id}
                    current={r.status}
                    onUpdated={() => void refetch()}
                  />
                </DataTableTd>
              </DataTableTr>
            ))}
          </DataTableBody>
        )}
      </DataTable>
    </div>
  );
}
