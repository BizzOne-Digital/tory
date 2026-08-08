"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTestimonial } from "@/app/admin/actions/testimonials";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
import { useToast } from "@/components/admin/Toast";

type TestimonialRow = {
  _id: string;
  name: string;
  role?: string;
  quote: string;
  featured?: boolean;
  status?: string;
};

export function TestimonialsAdminClient({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteTestimonial(deleteId);
    setLoading(false);
    setDeleteId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Testimonial deleted", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client stories displayed on the testimonials page."
        actions={
          <Link
            href="/admin/testimonials/new"
            className="rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory"
          >
            New testimonial
          </Link>
        }
      />

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Name</DataTableHeaderCell>
            <DataTableHeaderCell>Quote</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {testimonials.length ? (
            testimonials.map((item) => (
              <DataTableRow key={item._id}>
                <DataTableCell>
                  <Link
                    href={`/admin/testimonials/${item._id}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.role ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      {item.role}
                    </span>
                  ) : null}
                </DataTableCell>
                <DataTableCell className="max-w-md truncate text-muted">
                  {item.quote}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={item.status ?? "published"} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex justify-end gap-3 text-sm">
                    <Link
                      href={`/admin/testimonials/${item._id}`}
                      className="text-gold hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item._id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={4} message="No testimonials yet." />
          )}
        </DataTableBody>
      </DataTable>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete testimonial?"
        destructive
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
