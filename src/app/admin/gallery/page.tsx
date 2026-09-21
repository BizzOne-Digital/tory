import { getGalleryCategories } from "@/app/admin/actions/gallery";
import { GalleryAdminClient } from "@/components/admin/GalleryAdminClient";

export default async function AdminGalleryPage() {
  const categories = await getGalleryCategories();
  return <GalleryAdminClient categories={categories} />;
}
