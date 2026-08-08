import { notFound } from "next/navigation";
import { getAdminProduct } from "@/app/admin/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();
  return <ProductForm mode="edit" product={product} />;
}
