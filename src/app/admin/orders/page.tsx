import { getAdminOrders } from "@/app/admin/actions/orders";
import { OrdersAdminClient } from "@/components/admin/OrdersAdminClient";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <OrdersAdminClient orders={orders} />;
}
