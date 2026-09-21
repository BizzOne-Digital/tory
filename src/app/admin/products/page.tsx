import { getAdminProducts } from "@/app/admin/actions/products";
import { ProductsAdminClient } from "@/components/admin/ProductsAdminClient";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return <ProductsAdminClient initialProducts={products} />;
}
