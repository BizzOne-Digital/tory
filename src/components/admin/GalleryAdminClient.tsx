"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createGalleryCategory,
  deleteGalleryCategory,
} from "@/app/admin/actions/gallery";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FormField } from "@/components/admin/FormField";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  EmptyRow,
} from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";
import { makeSlug } from "@/lib/slug";

type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  status?: string;
};

export function GalleryAdminClient({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createGalleryCategory({
      name,
      slug: slug || makeSlug(name),
      description: "",
      sortOrder: categories.length,
      status: "published",
    });
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Category created", "success");
    setName("");
    setSlug("");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteGalleryCategory(deleteId);
    setLoading(false);
    setDeleteId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Category deleted", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Manage gallery categories and images."
      />

      <form
        onSubmit={(e) => void handleCreate(e)}
        className="mb-6 rounded-sm border border-border bg-white p-5"
      >
        <h2 className="font-display text-lg text-ink">New category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Name" required>
            <TextInput
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(makeSlug(e.target.value));
              }}
              required
            />
          </FormField>
          <FormField label="Slug" required>
            <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </FormField>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory disabled:opacity-60"
        >
          Create category
        </button>
      </form>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Category</DataTableHeaderCell>
            <DataTableHeaderCell>Sort</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {categories.length ? (
            categories.map((cat) => (
              <DataTableRow key={cat._id}>
                <DataTableCell>
                  <Link
                    href={`/admin/gallery/${cat._id}`}
                    className="font-medium hover:underline"
                  >
                    {cat.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted">{cat.slug}</span>
                </DataTableCell>
                <DataTableCell>{cat.sortOrder ?? 0}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={cat.status ?? "published"} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex justify-end gap-3 text-sm">
                    <Link
                      href={`/admin/gallery/${cat._id}`}
                      className="text-gold hover:underline"
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteId(cat._id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={4} message="No categories yet." />
          )}
        </DataTableBody>
      </DataTable>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete category?"
        description="All images in this category will also be deleted."
        confirmLabel="Delete"
        destructive
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
