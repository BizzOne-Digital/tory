import { notFound } from "next/navigation";
import {
  getGalleryCategories,
  getGalleryCategory,
} from "@/app/admin/actions/gallery";
import { GalleryCategoryDetailClient } from "@/components/admin/GalleryCategoryDetailClient";

type Props = { params: Promise<{ categoryId: string }> };

export default async function AdminGalleryCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  const data = await getGalleryCategory(categoryId);
  if (!data) notFound();
  const allCategories = await getGalleryCategories();

  return (
    <GalleryCategoryDetailClient
      category={data.category}
      images={data.images}
      allCategories={allCategories.map((c) => ({
        _id: String(c._id),
        name: c.name,
      }))}
    />
  );
}
