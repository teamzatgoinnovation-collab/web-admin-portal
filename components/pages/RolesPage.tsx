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
import { mockRepo, type RoleRecord } from "@/lib/mock-data";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function RolesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RoleRecord | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => mockRepo.listRoles(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) =>
      mockRepo.upsertRole({ id: editing?.id, ...values }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(editing ? "Role updated" : "Role created");
      setOpen(false);
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => mockRepo.deleteRole(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Role deleted");
    },
  });

  const columns = useMemo<ColumnDef<RoleRecord>[]>(
    () => [
      { accessorKey: "name", header: "Role" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "userCount", header: "Users" },
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
                  description: row.original.description,
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
        title="Roles"
        description="Permission roles used across site apps."
        actions={
          <>
            <SearchField value={search} onChange={setSearch} placeholder="Search roles…" />
            <Button
              onClick={() => {
                setEditing(null);
                form.reset({ name: "", description: "" });
                setOpen(true);
              }}
            >
              Add role
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No roles" />

      <FormDialog
        open={open}
        title={editing ? "Edit role" : "Add role"}
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
            <span className="font-medium">Description</span>
            <textarea
              rows={3}
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("description")}
            />
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
