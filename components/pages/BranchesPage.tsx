"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@zatgo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { mockRepo, type BranchRecord } from "@/lib/mock-data";

const schema = z.object({
  name: z.string().min(1),
  companyId: z.string().min(1),
  city: z.string().min(1),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function BranchesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BranchRecord | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => mockRepo.listBranches(),
  });
  const companies =
    useQuery({
      queryKey: ["admin", "companies"],
      queryFn: () => mockRepo.listCompanies(),
    }).data ?? [];

  const companyName = useMemo(() => {
    const map = new Map(companies.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [companies]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      companyId: companies[0]?.id ?? "",
      city: "",
      active: true,
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) =>
      mockRepo.upsertBranch({ id: editing?.id, ...values }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(editing ? "Branch updated" : "Branch created");
      setOpen(false);
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => mockRepo.deleteBranch(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Branch deleted");
    },
  });

  const columns = useMemo<ColumnDef<BranchRecord>[]>(
    () => [
      { accessorKey: "name", header: "Branch" },
      {
        accessorKey: "companyId",
        header: "Company",
        cell: ({ row }) => companyName(row.original.companyId),
      },
      { accessorKey: "city", header: "City" },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (row.original.active ? "Active" : "Inactive"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs"
              onClick={() => {
                setEditing(row.original);
                form.reset({
                  name: row.original.name,
                  companyId: row.original.companyId,
                  city: row.original.city,
                  active: row.original.active,
                });
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              className="px-2 py-1 text-xs text-[var(--color-destructive)]"
              onClick={() => remove.mutate(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [companyName, form, remove],
  );

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Operating locations under companies."
        actions={
          <>
            <SearchField value={search} onChange={setSearch} placeholder="Search branches…" />
            <Button
              onClick={() => {
                setEditing(null);
                form.reset({
                  name: "",
                  companyId: companies[0]?.id ?? "",
                  city: "",
                  active: true,
                });
                setOpen(true);
              }}
            >
              Add branch
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No branches" />

      <FormDialog
        open={open}
        title={editing ? "Edit branch" : "Add branch"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit((v) => save.mutate(v))} disabled={save.isPending}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("name")}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Company</span>
            <select
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("companyId")}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">City</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("city")}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("active")} />
            Active
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
