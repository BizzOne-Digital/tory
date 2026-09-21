import { notFound } from "next/navigation";
import { getAdminService } from "@/app/admin/actions/services";
import { ServiceForm } from "@/components/admin/ServiceForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditServicePage({ params }: Props) {
  const { id } = await params;
  const service = await getAdminService(id);
  if (!service) notFound();
  return <ServiceForm mode="edit" service={service} />;
}
