import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { SocketIndicator } from "@/components/ui/SocketIndicator";
import { PageContainer } from "./PageContainer";
import { SidebarNav } from "./SidebarNav";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-[var(--bg)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 ease-out lg:static lg:z-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <PageContainer className="flex h-full flex-col px-0 py-6 lg:max-w-none lg:px-5">
          <div className="mb-10 px-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Operations
            </p>
            <p className="mt-1 text-lg font-medium tracking-tight text-[var(--text)]">
              Qeema Console
            </p>
          </div>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
          <div className="mt-auto border-t border-[var(--border)] pt-8">
            <p className="truncate px-1 text-[11px] text-[var(--text-muted)]">
              {user?.email}
            </p>
            <Button
              variant="ghost"
              className="mt-3 w-full justify-center text-[13px]"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </PageContainer>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]">
          <PageContainer className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                type="button"
                variant="ghost"
                className="px-3 text-[13px]"
                onClick={() => setMenuOpen((o) => !o)}
              >
                Menu
              </Button>
            </div>
            <div className="hidden lg:block" />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-4">
              <SocketIndicator />
            </div>
          </PageContainer>
        </header>

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:pb-8">
          <PageContainer className="px-0">
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
