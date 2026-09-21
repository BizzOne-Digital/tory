import { notFound } from "next/navigation";
import { getAdminOrder } from "@/app/admin/actions/orders";
import { OrderDetailClient } from "@/components/admin/OrderDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
