import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors duration-150 ${
    isActive
      ? "bg-[var(--accent-bg)] text-[var(--accent)]"
      : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
  }`;

const items = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/requests", label: "Requests", end: false },
  { to: "/services", label: "Services", end: false },
  { to: "/users", label: "Users", end: false },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Workspace
      </p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkClass}
          onClick={() => onNavigate?.()}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
