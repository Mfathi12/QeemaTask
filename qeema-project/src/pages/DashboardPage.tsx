import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  DataTable,
  DataTableBody,
  DataTableHeadRow,
  DataTableTd,
  DataTableTh,
  DataTableTr,
} from "@/components/table";
import { useRealtimeRequests } from "@/hooks/useRealtimeRequests";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "@/lib/toast";
import type { ServiceRequest } from "@/types/models";

function countByStatus(items: ServiceRequest[]) {
  let pending = 0;
  let inProgress = 0;
  let completed = 0;
  for (const r of items) {
    if (r.status === "PENDING") pending += 1;
    else if (r.status === "IN_PROGRESS") inProgress += 1;
    else completed += 1;
  }
  return { pending, inProgress, completed };
}

export function DashboardPage() {
  const { connected } = useSocket();
  const { items, loading, error } = useRealtimeRequests();

  useEffect(() => {
    if (!error) return;
    toast.error(error, { toastId: "dashboard-requests-error" });
  }, [error]);

  const stats = useMemo(() => {
    const { pending, inProgress, completed } = countByStatus(items);
    return {
      total: items.length,
      pending,
      inProgress,
      completed,
    };
  }, [items]);

  const recent = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 8);
  }, [items]);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor request volume, pipeline health, and the latest activity across your service desk."
      />

      <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={stats.total} loading={loading} />
        <StatCard label="Pending" value={stats.pending} loading={loading} />
        <StatCard label="In progress" value={stats.inProgress} loading={loading} />
        <StatCard label="Completed" value={stats.completed} loading={loading} />
      </section>

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-medium tracking-tight text-[var(--text)]">
            Real-time activity
          </h2>
          <p className="mt-3 text-[13px] font-normal leading-relaxed text-[var(--text-muted)]">
            {connected
              ? "You are connected to the operations channel. New submissions and status transitions sync automatically."
              : "Connect to receive live updates. Ensure you are signed in as an administrator and the API is reachable."}
          </p>
          <dl className="mt-6 space-y-3 border-t border-[var(--border)] pt-6 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-muted)]">Channel</dt>
              <dd className="font-medium text-[var(--text)]">
                {connected ? "Active" : "Inactive"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-muted)]">Tracked requests</dt>
              <dd className="font-data font-medium tabular-nums text-[var(--text)]">
                {loading ? "—" : stats.total}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-[var(--text)]">
                Recent requests
              </h2>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                Latest updates by modification time.
              </p>
            </div>
            <Link
              to="/requests"
              className="text-[13px] font-medium text-[var(--accent)] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline"
            >
              View all
            </Link>
          </div>

          <DataTable minWidthClass="min-w-[640px]">
            <DataTableHeadRow>
              <DataTableTh>ID</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Requester</DataTableTh>
              <DataTableTh>Service</DataTableTh>
              <DataTableTh>Updated</DataTableTh>
            </DataTableHeadRow>
            {loading ? (
              <DataTableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <DataTableTr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <DataTableTd key={j}>
                        <Skeleton className="h-4 w-full max-w-[8rem]" />
                      </DataTableTd>
                    ))}
                  </DataTableTr>
                ))}
              </DataTableBody>
            ) : recent.length === 0 ? (
              <DataTableBody>
                <DataTableTr>
                  <DataTableTd colSpan={5} className="py-12 text-center">
                    <span className="text-[var(--text-muted)]">
                      No requests recorded yet.
                    </span>
                  </DataTableTd>
                </DataTableTr>
              </DataTableBody>
            ) : (
              <DataTableBody>
                {recent.map((r) => (
                  <DataTableTr key={r.id}>
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
                    <DataTableTd className="text-[var(--text)]">
                      {r.service.name}
                    </DataTableTd>
                    <DataTableTd className="font-data tabular-nums text-[var(--text-muted)]">
                      {new Date(r.updatedAt).toLocaleString()}
                    </DataTableTd>
                  </DataTableTr>
                ))}
              </DataTableBody>
            )}
          </DataTable>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-16" />
      ) : (
        <p className="mt-4 font-data text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]">
          {value}
        </p>
      )}
    </Card>
  );
}
