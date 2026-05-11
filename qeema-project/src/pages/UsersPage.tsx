import { useEffect, useMemo, useState } from "react";
import { adminUsersApi, ApiClientError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PageHeader } from "@/components/ui/PageHeader";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Button } from "@/components/ui/Button";
import {
  DataTable,
  DataTableBody,
  DataTableHeadRow,
  DataTableTd,
  DataTableTh,
  DataTableTr,
  TableSkeletonRows,
} from "@/components/table";
import { toast } from "@/lib/toast";
import type { Paginated, UserPublic } from "@/types/models";

export function UsersPage() {
  const [data, setData] = useState<Paginated<UserPublic> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const limit = 12;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await adminUsersApi.list({ page, limit });
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiClientError
              ? err.message
              : "Could not load users.";
          setError(msg);
          toast.error(msg, { toastId: "users-load" });
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [data, query]);

  const colCount = 4;

  return (
    <div>
      <PageHeader
        title="Users"
        description="Directory of accounts. Results are paginated server-side; search filters the current page."
      />

      <div className="mb-6 max-w-sm">
        <Label htmlFor="user-search">Search</Label>
        <Input
          id="user-search"
          type="search"
          placeholder="Name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {error ? (
        <p className="mb-6 text-[13px] text-[var(--danger)]">{error}</p>
      ) : null}

      <DataTable minWidthClass="min-w-[720px]">
        <DataTableHeadRow>
          <DataTableTh>Name</DataTableTh>
          <DataTableTh>Email</DataTableTh>
          <DataTableTh>Role</DataTableTh>
          <DataTableTh>Created</DataTableTh>
        </DataTableHeadRow>

        {data === null ? (
          <TableSkeletonRows cols={colCount} rows={8} />
        ) : filteredItems.length === 0 ? (
          <DataTableBody>
            <DataTableTr>
              <DataTableTd colSpan={colCount} className="py-14 text-center">
                <span className="text-[var(--text)]">
                  {data.items.length === 0
                    ? "No users found."
                    : "No matches on this page."}
                </span>
              </DataTableTd>
            </DataTableTr>
          </DataTableBody>
        ) : (
          <DataTableBody>
            {filteredItems.map((u) => (
              <DataTableTr key={u.id}>
                <DataTableTd className="font-medium text-[var(--text)]">
                  {u.name}
                </DataTableTd>
                <DataTableTd className="text-[var(--text)]">{u.email}</DataTableTd>
                <DataTableTd>
                  <RoleBadge role={u.role} />
                </DataTableTd>
                <DataTableTd className="font-data tabular-nums text-[var(--text-muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </DataTableTd>
              </DataTableTr>
            ))}
          </DataTableBody>
        )}
      </DataTable>

      {data && data.pagination.totalPages > 1 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-[13px] text-[var(--text)]">
          <p className="tabular-nums text-[var(--text-muted)]">
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} accounts
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={page >= data.pagination.totalPages}
              onClick={() =>
                setPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
