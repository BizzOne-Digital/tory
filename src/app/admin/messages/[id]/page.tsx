import { notFound } from "next/navigation";
import { getAdminMessage } from "@/app/admin/actions/messages";
import { MessageDetailClient } from "@/components/admin/MessageDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminMessageDetailPage({ params }: Props) {
  const { id } = await params;
  const message = await getAdminMessage(id);
  if (!message) notFound();
  return <MessageDetailClient message={message} />;
}
