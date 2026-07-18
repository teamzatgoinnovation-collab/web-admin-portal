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
import { mockRepo, type ApiKeyRecord } from "@/lib/mock-data";

const schema = z.object({
  label: z.string().min(1),
  userEmail: z.string().email(),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ApiKeysPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ApiKeyRecord | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "api-keys"],
    queryFn: () => mockRepo.listApiKeys(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      userEmail: "",
      enabled: true,
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) =>
      mockRepo.upsertApiKey({ id: editing?.id, ...values }),
    onSuccess: (record) => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(
        editing
          ? "API key updated"
          : `API key created (${record.keyHint}) — secret shown once in production`,
      );
      setOpen(false);
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => mockRepo.deleteApiKey(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("API key deleted");
    },
  });

  const columns = useMemo<ColumnDef<ApiKeyRecord>[]>(
    () => [
      { accessorKey: "label", header: "Label" },
      { accessorKey: "userEmail", header: "User" },
      { accessorKey: "keyHint", header: "Key" },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
                  label: row.original.label,
                  userEmail: row.original.userEmail,
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
        title="API keys"
        description="Tokens for desktop, CI, and integrations."
        actions={
          <>
            <SearchField value={search} onChange={setSearch} placeholder="Search keys…" />
            <Button
              onClick={() => {
                setEditing(null);
                form.reset({ label: "", userEmail: "", enabled: true });
                setOpen(true);
              }}
            >
              Create key
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} globalFilter={search} emptyMessage="No API keys" />

      <FormDialog
        open={open}
        title={editing ? "Edit API key" : "Create API key"}
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
            <span className="font-medium">Label</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("label")}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">User email</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              {...form.register("userEmail")}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("enabled")} />
            Enabled
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
