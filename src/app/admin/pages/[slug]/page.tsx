import { notFound } from "next/navigation";
import { getAdminPage } from "@/app/admin/actions/pages";
import { PageEditor } from "@/components/admin/PageEditor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminPageEditPage({ params }: Props) {
  const { slug } = await params;
  const page = await getAdminPage(slug);
  if (!page) notFound();

  return <PageEditor page={page} />;
}
