"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addGalleryImages,
  deleteGalleryImage,
  moveGalleryImage,
  reorderGalleryImages,
  updateGalleryCategory,
  updateGalleryImage,
} from "@/app/admin/actions/gallery";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FormField } from "@/components/admin/FormField";
import { MultiImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";
import type { ImageMeta } from "@/models/shared";

type GalleryCategoryDetailProps = {
  category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
    status?: string;
  };
  images: {
    _id: string;
    categoryId: string;
    image: ImageMeta;
    title?: string;
    caption?: string;
    sortOrder?: number;
    status?: string;
  }[];
  allCategories: { _id: string; name: string }[];
};

export function GalleryCategoryDetailClient({
  category,
  images: initialImages,
  allCategories,
}: GalleryCategoryDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder ?? 0));
  const [status, setStatus] = useState(category.status ?? "published");
  const [images, setImages] = useState(initialImages);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSaveCategory() {
    setSaving(true);
    setError("");
    const result = await updateGalleryCategory(category._id, {
      name,
      sortOrder: Number(sortOrder) || 0,
      status: status as "published" | "draft",
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    setSaved(true);
    toast("Category saved", "success");
    router.refresh();
  }

  async function handleUpload(newImages: ImageMeta[]) {
    if (!newImages.length) return;
    setLoading(true);
    const result = await addGalleryImages(
      newImages.map((image, index) => ({
        categoryId: category._id,
        image: {
          url: image.url,
          alt: image.alt ?? "",
          caption: image.caption ?? "",
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          focalX: image.focalX ?? undefined,
          focalY: image.focalY ?? undefined,
        },
        title: "",
        caption: image.caption ?? "",
        sortOrder: images.length + index,
        status: "published" as const,
        featured: false,
        orientation: "auto" as const,
      })),
    );
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Images uploaded", "success");
    router.refresh();
  }

  async function handleReorder(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await reorderGalleryImages(
      category._id,
      next.map((img) => img._id),
    );
    router.refresh();
  }

  async function handleDeleteImage() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteGalleryImage(deleteId);
    setLoading(false);
    setDeleteId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Image deleted", "success");
    router.refresh();
  }

  async function handleMoveImage(imageId: string, newCategoryId: string) {
    const result = await moveGalleryImage(imageId, newCategoryId);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Image moved", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={category.name}
        description={`/${category.slug}`}
        backHref="/admin/gallery"
        backLabel="All categories"
      />

      <section className="mb-8 rounded-sm border border-border bg-white p-5">
        <h2 className="font-display text-lg text-ink">Category settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField label="Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Sort order">
            <TextInput
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>
        </div>
        <SaveBar
          saving={saving}
          saved={saved}
          error={error}
          onSave={() => void handleSaveCategory()}
          label="Save category"
        />
      </section>

      <section className="rounded-sm border border-border bg-white p-5">
        <MultiImageUploader
          folder="gallery"
          label="Upload images"
          value={[]}
          onChange={(uploaded) => void handleUpload(uploaded)}
        />

        <ul className="mt-6 space-y-4">
          {images.map((item, index) => (
            <li
              key={item._id}
              className="flex flex-col gap-3 rounded-sm border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <FormField label="Title">
                  <TextInput
                    defaultValue={item.title ?? ""}
                    onBlur={(e) =>
                      void updateGalleryImage(item._id, { title: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleReorder(index, -1)}
                  disabled={index === 0}
                  className="rounded-sm border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => void handleReorder(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded-sm border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                <Select
                  defaultValue={item.categoryId}
                  onChange={(e) =>
                    void handleMoveImage(item._id, e.target.value)
                  }
                  className="max-w-[160px] text-xs"
                >
                  {allCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      Move: {cat.name}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setDeleteId(item._id)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!images.length ? (
          <p className="mt-4 text-sm text-muted">No images in this category.</p>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete image?"
        destructive
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDeleteImage()}
      />
    </div>
  );
}
