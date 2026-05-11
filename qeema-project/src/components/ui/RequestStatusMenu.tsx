import { useRef, useState } from "react";
import { ApiClientError, requestsApi } from "@/lib/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { RequestStatus } from "@/types/models";
import { toast } from "@/lib/toast";
import { Button } from "./Button";

const OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export function RequestStatusMenu({
  requestId,
  current,
  onUpdated,
}: {
  requestId: number;
  current: RequestStatus;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapRef, () => setOpen(false), open);

  async function choose(next: RequestStatus) {
    if (next === current) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      await requestsApi.patchStatus(requestId, next);
      onUpdated();
      setOpen(false);
      toast.success("Status updated.");
    } catch (e) {
      const msg =
        e instanceof ApiClientError ? e.message : "Could not update status.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative inline-block text-left" ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        className="px-3 text-[13px]"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
      >
        {busy ? "Updating…" : "Update status"}
      </Button>
      {open ? (
        <ul
          className="absolute right-0 z-30 mt-1 min-w-[11rem] rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1"
          role="menu"
        >
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="menuitem"
                disabled={busy || o.value === current}
                className="w-full px-3 py-2 text-left text-[13px] text-[var(--text)] transition-colors duration-100 hover:bg-[var(--surface-2)] disabled:cursor-default disabled:opacity-40"
                onClick={() => void choose(o.value)}
              >
                {o.label}
                {o.value === current ? (
                  <span className="ml-2 text-[11px] text-[var(--text-muted)]">
                    current
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
