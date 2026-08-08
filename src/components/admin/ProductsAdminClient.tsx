"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  archiveProduct,
  duplicateProduct,
  getAdminProducts,
} from "@/app/admin/actions/products";
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
import { TextInput } from "@/components/admin/TextInput";
import { Select } from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toast";
import { formatMoney } from "@/lib/money";

type ProductRow = Awaited<ReturnType<typeof getAdminProducts>>[number];

export function ProductsAdminClient({
  initialProducts,
}: {
  initialProducts: ProductRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle)
      );
    });
  }, [initialProducts, q, status]);

  async function handleDuplicate(id: string) {
    setLoading(true);
    const result = await duplicateProduct(id);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Product duplicated", "success");
    if (result.data?.id) router.push(`/admin/products/${result.data.id}`);
  }

  async function handleArchive() {
    if (!archiveId) return;
    setLoading(true);
    const result = await archiveProduct(archiveId);
    setLoading(false);
    setArchiveId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Product archived", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Products / Pricing"
        description="Manage shop catalog, pricing in cents, variants, and SEO."
        actions={
          <Link
            href="/admin/products/new"
            className="rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory"
          >
            New product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, slug, SKU…"
          className="max-w-sm"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Product</DataTableHeaderCell>
            <DataTableHeaderCell>SKU</DataTableHeaderCell>
            <DataTableHeaderCell>Price</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {filtered.length ? (
            filtered.map((product) => (
              <DataTableRow key={String(product._id)}>
                <DataTableCell>
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted">
                    {product.slug}
                  </span>
                </DataTableCell>
                <DataTableCell>{product.sku}</DataTableCell>
                <DataTableCell>
                  {formatMoney(product.priceMinor, product.currency)}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={product.status ?? "draft"} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex justify-end gap-3 text-sm">
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="text-gold hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDuplicate(String(product._id))}
                      disabled={loading}
                      className="text-muted hover:text-ink"
                    >
                      Duplicate
                    </button>
                    {product.status !== "archived" ? (
                      <button
                        type="button"
                        onClick={() => setArchiveId(String(product._id))}
                        className="text-red-700 hover:underline"
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} message="No products match your filters." />
          )}
        </DataTableBody>
      </DataTable>

      <ConfirmDialog
        open={Boolean(archiveId)}
        title="Archive product?"
        description="Archived products are hidden from the shop but preserved for order history."
        confirmLabel="Archive"
        destructive
        loading={loading}
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </div>
  );
}
