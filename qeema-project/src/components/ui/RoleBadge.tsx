import type { UserPublic } from "@/types/models";

const styles: Record<UserPublic["role"], string> = {
  ADMIN: "bg-[#f3f4f6] text-[#374151]",
  MOBILE_USER: "bg-[#f9fafb] text-[#6b7280]",
};

const label: Record<UserPublic["role"], string> = {
  ADMIN: "Admin",
  MOBILE_USER: "Client",
};

export function RoleBadge({ role }: { role: UserPublic["role"] }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[role]}`}
    >
      {label[role]}
    </span>
  );
}
