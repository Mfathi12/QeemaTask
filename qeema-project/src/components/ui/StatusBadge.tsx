import type { RequestStatus } from "@/types/models";

const styles: Record<RequestStatus, string> = {
  PENDING: "bg-[#fef9c3] text-[#92400e]",
  IN_PROGRESS: "bg-[#dbeafe] text-[#1e40af]",
  COMPLETED: "bg-[#d1fae5] text-[#065f46]",
};

const label: Record<RequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}
