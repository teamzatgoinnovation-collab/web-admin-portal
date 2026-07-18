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
import { mockRepo, type CompanyRecord } from "@/lib/mock-data";

const schema = z.object({
  name: z.string().min(1),
  abbr: z.string().min(1).max(8),
  country: z.string().min(1),
  defaultCurrency: z.string().min(3).max(3),
});

type FormValues = z.infer<typeof schema>;

export function CompaniesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CompanyRecord | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: () => mockRepo.listCompanies(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      abbr: "",
      country: "",
      defaultCurrency: "SAR",
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) =>
      mockRepo.upsertCompany({ id: editing?.id, ...values }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(editing ? "Company updated" : "Company created");
      setOpen(false);
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => mockRepo.deleteCompany(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Company deleted");
    },
  });

  const columns = useMemo<ColumnDef<CompanyRecord>[]>(
    () => [
      { accessorKey: "name", header: "Company" },
      { accessorKey: "abbr", header: "Abbr" },
      { accessorKey: "country", header: "Country" },
      { accessorKey: "defaultCurrency", header: "Currency" },
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
                form.reset(row.original);
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
    [form, remove],
  );

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Legal entities on this site."
        actions={
          <>
            <SearchField value={search} onChange={setSearch} placeholder="Search companies…" />
            <Button
              onClick={() => {
                setEditing(null);
                form.reset({
                  name: "",
                  abbr: "",
                  country: "",
                  defaultCurrency: "SAR",
                });
                setOpen(true);
              }}
            >
              Add company
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No companies" />

      <FormDialog
        open={open}
        title={editing ? "Edit company" : "Add company"}
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
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Name"],
              ["abbr", "Abbreviation"],
              ["country", "Country"],
              ["defaultCurrency", "Currency"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="block space-y-1 text-sm sm:col-span-1">
              <span className="font-medium">{label}</span>
              <input
                className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                {...form.register(field)}
              />
            </label>
          ))}
        </div>
      </FormDialog>
    </div>
  );
}
