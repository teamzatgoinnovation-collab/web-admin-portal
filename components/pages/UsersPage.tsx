"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@zatgo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { mockRepo, type UserRecord } from "@/lib/mock-data";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1, "Required"),
  roles: z.string().min(1, "Comma-separated roles"),
  companyId: z.string().min(1),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => mockRepo.listUsers(),
  });
  const companies = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: () => mockRepo.listCompanies(),
  }).data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      fullName: "",
      roles: "",
      companyId: companies[0]?.id ?? "",
      enabled: true,
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      return mockRepo.upsertUser({
        id: editing?.id,
        email: values.email,
        fullName: values.fullName,
        roles: values.roles.split(",").map((r) => r.trim()).filter(Boolean),
        companyId: values.companyId,
        enabled: values.enabled,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(editing ? "User updated" : "User created");
      setOpen(false);
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => mockRepo.deleteUser(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("User deleted");
    },
  });

  const columns = useMemo<ColumnDef<UserRecord>[]>(
    () => [
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => row.original.roles.join(", "),
      },
      {
        accessorKey: "enabled",
        header: "Status",
        cell: ({ row }) => (row.original.enabled ? "Enabled" : "Disabled"),
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
                  email: row.original.email,
                  fullName: row.original.fullName,
                  roles: row.original.roles.join(", "),
                  companyId: row.original.companyId,
                  enabled: row.original.enabled,
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
    [form, remove],
  );

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage site users and role assignments."
        actions={
          <>
            <SearchField value={search} onChange={setSearch} placeholder="Search users…" />
            <Button
              onClick={() => {
                setEditing(null);
                form.reset({
                  email: "",
                  fullName: "",
                  roles: "",
                  companyId: companies[0]?.id ?? "",
                  enabled: true,
                });
                setOpen(true);
              }}
            >
              Add user
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No users" />

      <FormDialog
        open={open}
        title={editing ? "Edit user" : "Add user"}
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
          <Field label="Full name" error={form.formState.errors.fullName?.message}>
            <input className={inputClass} {...form.register("fullName")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input className={inputClass} {...form.register("email")} />
          </Field>
          <Field label="Roles (comma-separated)" error={form.formState.errors.roles?.message}>
            <input className={inputClass} {...form.register("roles")} />
          </Field>
          <Field label="Company" error={form.formState.errors.companyId?.message}>
            <select className={inputClass} {...form.register("companyId")}>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("enabled")} />
            Enabled
          </label>
        </div>
      </FormDialog>
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-[var(--color-destructive)]">{error}</span> : null}
    </label>
  );
}
