"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createFaq,
  createFaqCategory,
  deleteFaq,
  deleteFaqCategory,
} from "@/app/admin/actions/faqs";
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
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";
import { makeSlug } from "@/lib/slug";

type FaqCategory = { _id: string; name: string; slug: string };
type FaqRow = {
  _id: string;
  question: string;
  answer: string;
  categoryId: string;
  status?: string;
};

export function FaqsAdminClient({
  categories,
  faqs,
}: {
  categories: FaqCategory[];
  faqs: FaqRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategoryId, setFaqCategoryId] = useState(categories[0]?._id ?? "");
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createFaqCategory({
      name: catName,
      slug: catSlug || makeSlug(catName),
      sortOrder: categories.length,
      status: "published",
    });
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Category created", "success");
    setCatName("");
    setCatSlug("");
    router.refresh();
  }

  async function handleCreateFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqCategoryId) {
      toast("Create a category first", "error");
      return;
    }
    setLoading(true);
    const result = await createFaq({
      question: faqQuestion,
      answer: faqAnswer,
      categoryId: faqCategoryId,
      sortOrder: faqs.length,
      status: "published",
    });
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("FAQ created", "success");
    setFaqQuestion("");
    setFaqAnswer("");
    router.refresh();
  }

  async function handleDeleteCategory() {
    if (!deleteCatId) return;
    setLoading(true);
    const result = await deleteFaqCategory(deleteCatId);
    setLoading(false);
    setDeleteCatId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Category deleted", "success");
    router.refresh();
  }

  async function handleDeleteFaq() {
    if (!deleteFaqId) return;
    setLoading(true);
    const result = await deleteFaq(deleteFaqId);
    setLoading(false);
    setDeleteFaqId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("FAQ deleted", "success");
    router.refresh();
  }

  const categoryName = (id: string) =>
    categories.find((c) => c._id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Organize frequently asked questions by category."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={(e) => void handleCreateCategory(e)}
          className="rounded-sm border border-border bg-white p-5"
        >
          <h2 className="font-display text-lg text-ink">New category</h2>
          <div className="mt-4 space-y-3">
            <FormField label="Name" required>
              <TextInput
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!catSlug) setCatSlug(makeSlug(e.target.value));
                }}
                required
              />
            </FormField>
            <FormField label="Slug" required>
              <TextInput value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
            </FormField>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory"
          >
            Create category
          </button>
        </form>

        <form
          onSubmit={(e) => void handleCreateFaq(e)}
          className="rounded-sm border border-border bg-white p-5"
        >
          <h2 className="font-display text-lg text-ink">New FAQ</h2>
          <div className="mt-4 space-y-3">
            <FormField label="Category">
              <select
                value={faqCategoryId}
                onChange={(e) => setFaqCategoryId(e.target.value)}
                className="field-input w-full rounded-sm bg-white text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Question" required>
              <TextInput
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Answer" required>
              <TextArea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                rows={4}
                required
              />
            </FormField>
          </div>
          <button
            type="submit"
            disabled={loading || !categories.length}
            className="mt-4 rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory disabled:opacity-60"
          >
            Create FAQ
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Categories</h2>
        <DataTable className="mt-4">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>Name</DataTableHeaderCell>
              <DataTableHeaderCell>Slug</DataTableHeaderCell>
              <DataTableHeaderCell />
            </tr>
          </DataTableHead>
          <DataTableBody>
            {categories.length ? (
              categories.map((cat) => (
                <DataTableRow key={cat._id}>
                  <DataTableCell>{cat.name}</DataTableCell>
                  <DataTableCell className="text-muted">{cat.slug}</DataTableCell>
                  <DataTableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteCatId(cat._id)}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </DataTableCell>
                </DataTableRow>
              ))
            ) : (
              <EmptyRow colSpan={3} message="No categories." />
            )}
          </DataTableBody>
        </DataTable>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">All FAQs</h2>
        <DataTable className="mt-4">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>Question</DataTableHeaderCell>
              <DataTableHeaderCell>Category</DataTableHeaderCell>
              <DataTableHeaderCell />
            </tr>
          </DataTableHead>
          <DataTableBody>
            {faqs.length ? (
              faqs.map((faq) => (
                <DataTableRow key={faq._id}>
                  <DataTableCell>{faq.question}</DataTableCell>
                  <DataTableCell>{categoryName(faq.categoryId)}</DataTableCell>
                  <DataTableCell className="text-right">
                    <Link
                      href={`/admin/faqs/${faq._id}`}
                      className="mr-3 text-sm text-gold hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteFaqId(faq._id)}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </DataTableCell>
                </DataTableRow>
              ))
            ) : (
              <EmptyRow colSpan={3} message="No FAQs yet." />
            )}
          </DataTableBody>
        </DataTable>
      </section>

      <ConfirmDialog
        open={Boolean(deleteCatId)}
        title="Delete category?"
        description="All FAQs in this category will also be deleted."
        destructive
        loading={loading}
        onCancel={() => setDeleteCatId(null)}
        onConfirm={() => void handleDeleteCategory()}
      />
      <ConfirmDialog
        open={Boolean(deleteFaqId)}
        title="Delete FAQ?"
        destructive
        loading={loading}
        onCancel={() => setDeleteFaqId(null)}
        onConfirm={() => void handleDeleteFaq()}
      />
    </div>
  );
}
