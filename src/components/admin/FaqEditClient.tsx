"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFaqCategories, updateFaq } from "@/app/admin/actions/faqs";
import { FormField } from "@/components/admin/FormField";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";

type FaqEditProps = {
  faq: {
    _id: string;
    question: string;
    answer: string;
    categoryId: string;
    sortOrder?: number;
    status?: string;
  };
  categories: Awaited<ReturnType<typeof getFaqCategories>>;
};

export function FaqEditClient({ faq, categories }: FaqEditProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [categoryId, setCategoryId] = useState(faq.categoryId);
  const [sortOrder, setSortOrder] = useState(String(faq.sortOrder ?? 0));
  const [status, setStatus] = useState(faq.status ?? "published");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateFaq(faq._id, {
      question,
      answer,
      categoryId,
      sortOrder: Number(sortOrder) || 0,
      status: status as "published" | "draft",
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    setSaved(true);
    toast("FAQ saved", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Edit FAQ"
        backHref="/admin/faqs"
        backLabel="All FAQs"
      />

      <div className="space-y-4 rounded-sm border border-border bg-white p-5">
        <FormField label="Category">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((cat) => (
              <option key={String(cat._id)} value={String(cat._id)}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Question">
          <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
        </FormField>
        <FormField label="Answer">
          <TextArea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={8} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Sort order">
            <TextInput
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>
        </div>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
