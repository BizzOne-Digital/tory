import { getFaqCategories, getFaqs } from "@/app/admin/actions/faqs";
import { FaqsAdminClient } from "@/components/admin/FaqsAdminClient";

export default async function AdminFaqsPage() {
  const [categories, faqs] = await Promise.all([
    getFaqCategories(),
    getFaqs(),
  ]);

  return (
    <FaqsAdminClient
      categories={categories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        slug: c.slug,
      }))}
      faqs={faqs.map((f) => ({
        _id: String(f._id),
        question: f.question,
        answer: f.answer,
        categoryId: String(f.categoryId),
        status: f.status,
      }))}
    />
  );
}
