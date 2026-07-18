"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button, cn } from "@zatgo/ui";
import {
  Building2,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  Moon,
  ScrollText,
  Settings,
  Shield,
  Sun,
  Users,
} from "@zatgo/icons";
import { useSessionStore } from "@/store/session";
import { logoutFromErpnext } from "@/lib/client";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/users", label: "Users", icon: Users },
  { href: "/roles", label: "Roles", icon: Shield },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/branches", label: "Branches", icon: GitBranch },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/connection", label: "Connection", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const connected = useSessionStore((s) => s.connected);
  const user = useSessionStore((s) => s.user);
  const fullName = useSessionStore((s) => s.fullName);
  const baseUrl = useSessionStore((s) => s.connection.baseUrl);
  const mode = theme ?? "system";
  const [signingOut, setSigningOut] = useState(false);

  const cycleTheme = () => {
    const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setTheme(next);
  };

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await logoutFromErpnext();
      toast.success("Signed out");
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--ac-sidebar)]">
        <div className="border-b border-[var(--color-border)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            ZatGo
          </p>
          <p className="text-lg font-semibold">Admin Portal</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[var(--ac-sidebar-active)] font-medium text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--ac-sidebar-active)] hover:text-[var(--color-foreground)]",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-[var(--color-border)] p-3 text-xs text-[var(--color-muted-foreground)]">
          <p
            className="truncate font-medium text-[var(--color-foreground)]"
            title={fullName ?? user ?? undefined}
          >
            {connected ? fullName || user : "Not signed in"}
          </p>
          <p className="truncate">{connected ? "Connected" : "Not connected"}</p>
          <p>v0.1.0</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b border-[var(--color-border)] px-4">
          <Button variant="outline" disabled={signingOut} onClick={() => void onSignOut()}>
            Sign out
          </Button>
          <Button variant="outline" className="gap-2" onClick={cycleTheme}>
            {mode === "dark" ? (
              <Moon className="size-4" />
            ) : mode === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Settings className="size-4" />
            )}
            Theme: {mode}
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
