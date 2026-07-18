"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { mockRepo, type LogRecord } from "@/lib/mock-data";

export function LogsPage() {
  const [search, setSearch] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: () => mockRepo.listLogs(),
  });

  const columns = useMemo<ColumnDef<LogRecord>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "When",
        cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
          <span className="uppercase tracking-wide">{row.original.level}</span>
        ),
      },
      { accessorKey: "actor", header: "Actor" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "detail", header: "Detail" },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Audit logs"
        description="Local activity from portal mutations (mock). Replace with site audit trail later."
        actions={
          <SearchField value={search} onChange={setSearch} placeholder="Search logs…" />
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No logs" />
    </div>
  );
}
