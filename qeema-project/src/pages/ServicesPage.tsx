import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ApiClientError,
  servicesApi,
  type ServicePayload,
  type ServiceUpdatePayload,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
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
import type { Service } from "@/types/models";

const priceFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ServicesPage() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setError(null);
    try {
      const { data } = await servicesApi.list();
      setItems(data.data);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Could not load services.";
      setError(msg);
      toast.error(msg, { toastId: "services-load" });
      setItems([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setFormError(null);
    setEditorOpen(true);
  }

  async function onSubmitEditor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const category = String(fd.get("category") ?? "").trim();
    const priceRaw = String(fd.get("price") ?? "");
    const price = Number.parseFloat(priceRaw);

    if (!name || !category || !Number.isFinite(price) || price < 0) {
      setFormError("Enter a valid name, category, and non-negative price.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        const body: ServiceUpdatePayload = { name, category, price };
        await servicesApi.update(editing.id, body);
        toast.success("Service updated.");
      } else {
        const body: ServicePayload = { name, category, price };
        await servicesApi.create(body);
        toast.success("Service created.");
      }
      setEditorOpen(false);
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Save failed.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await servicesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Service deleted.");
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Could not delete service.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const colCount = 5;

  return (
    <div>
      <PageHeader
        title="Services"
        description="Maintain the service catalog offered to clients when they open new requests."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <Label htmlFor="service-search">Search</Label>
          <Input
            id="service-search"
            type="search"
            placeholder="Filter by name or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0">
          Add service
        </Button>
      </div>

      {error ? (
        <p className="mb-6 text-[13px] text-[var(--danger)]">{error}</p>
      ) : null}

      <DataTable minWidthClass="min-w-[720px]">
        <DataTableHeadRow>
          <DataTableTh>Name</DataTableTh>
          <DataTableTh>Category</DataTableTh>
          <DataTableTh>Price</DataTableTh>
          <DataTableTh>Updated</DataTableTh>
          <DataTableTh className="text-right">Actions</DataTableTh>
        </DataTableHeadRow>

        {items === null ? (
          <TableSkeletonRows cols={colCount} rows={7} />
        ) : filtered.length === 0 ? (
          <DataTableBody>
            <DataTableTr>
              <DataTableTd colSpan={colCount} className="py-14 text-center">
                <span className="text-[var(--text)]">
                  {items.length === 0
                    ? "No services yet. Create one to get started."
                    : "No matches for your search."}
                </span>
              </DataTableTd>
            </DataTableTr>
          </DataTableBody>
        ) : (
          <DataTableBody>
            {filtered.map((s) => (
              <DataTableTr key={s.id}>
                <DataTableTd className="font-medium text-[var(--text)]">
                  {s.name}
                </DataTableTd>
                <DataTableTd>
                  <CategoryBadge category={s.category} />
                </DataTableTd>
                <DataTableTd className="font-data tabular-nums text-[var(--text)]">
                  {priceFmt.format(s.price)}
                </DataTableTd>
                <DataTableTd className="font-data tabular-nums text-[var(--text-muted)]">
                  {new Date(s.updatedAt).toLocaleString()}
                </DataTableTd>
                <DataTableTd className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => setDeleteTarget(s)}
                    >
                      Delete
                    </Button>
                  </div>
                </DataTableTd>
              </DataTableTr>
            ))}
          </DataTableBody>
        )}
      </DataTable>

      <Modal
        open={editorOpen}
        title={editing ? "Edit service" : "New service"}
        description={
          editing
            ? "Update catalog metadata. Changes apply immediately."
            : "Add an entry to the catalog."
        }
        onClose={() => !submitting && setEditorOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="service-form" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <form id="service-form" className="space-y-5" onSubmit={onSubmitEditor}>
          <div>
            <Label htmlFor="svc-name">Name</Label>
            <Input
              id="svc-name"
              name="name"
              required
              defaultValue={editing?.name ?? ""}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="svc-category">Category</Label>
            <Input
              id="svc-category"
              name="category"
              required
              defaultValue={editing?.category ?? ""}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="svc-price">Price (USD)</Label>
            <Input
              id="svc-price"
              name="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              required
              defaultValue={editing?.price ?? ""}
            />
          </div>
          {formError ? (
            <p className="text-[13px] text-[var(--danger)]">{formError}</p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Delete service"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.name}” from the catalog? This cannot be undone.`
            : undefined
        }
        onClose={() => !submitting && setDeleteTarget(null)}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={submitting}
              onClick={() => void confirmDelete()}
            >
              {submitting ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        {deleteTarget ? (
          <p className="text-[13px] text-[var(--text-muted)]">
            Linked requests may block deletion. Resolve dependencies first if the
            operation fails.
          </p>
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </Modal>
    </div>
  );
}
