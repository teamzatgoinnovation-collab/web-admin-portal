"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { mockRepo } from "@/lib/mock-data";

const cards = [
  { key: "users" as const, label: "Users", href: "/users" },
  { key: "roles" as const, label: "Roles", href: "/roles" },
  { key: "companies" as const, label: "Companies", href: "/companies" },
  { key: "branches" as const, label: "Branches", href: "/branches" },
  { key: "apiKeys" as const, label: "API Keys", href: "/api-keys" },
  { key: "logs" as const, label: "Audit logs", href: "/logs" },
];

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: () => mockRepo.counts(),
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Site administration overview. Counts come from the local mock repository."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 transition-colors hover:bg-[var(--color-muted)]"
          >
            <p className="text-sm text-[var(--color-muted-foreground)]">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {data?.[card.key] ?? "—"}
            </p>
          </Link>
        ))}
      </div>
      {data ? (
        <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
          {data.enabledUsers} of {data.users} users enabled.
        </p>
      ) : null}
    </div>
  );
}
