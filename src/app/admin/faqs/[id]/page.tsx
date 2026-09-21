import { notFound } from "next/navigation";
import { getAdminFaq, getFaqCategories } from "@/app/admin/actions/faqs";
import { FaqEditClient } from "@/components/admin/FaqEditClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminFaqEditPage({ params }: Props) {
  const { id } = await params;
  const [faq, categories] = await Promise.all([
    getAdminFaq(id),
    getFaqCategories(),
  ]);
  if (!faq) notFound();

  return (
    <FaqEditClient
      faq={{
        ...faq,
        _id: String(faq._id),
        categoryId: String(faq.categoryId),
      }}
      categories={categories}
    />
  );
}
