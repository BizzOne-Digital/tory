"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createProduct,
  updateProduct,
} from "@/app/admin/actions/products";
import { FormField } from "@/components/admin/FormField";
import { MultiImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import { fromMinor, toMinor } from "@/lib/money";
import { makeSlug } from "@/lib/slug";
import type { ImageMeta } from "@/models/shared";

type Variant = {
  name: string;
  options: string[];
  sku: string;
  priceOverrideMinor?: number;
  inventory: number;
};

type ProductFormProps = {
  mode: "create" | "edit";
  product?: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription?: string;
    description?: string;
    priceMinor: number;
    compareAtPriceMinor?: number;
    currency?: string;
    categories?: string[];
    collections?: string[];
    tags?: string[];
    images?: ImageMeta[];
    variants?: Variant[];
    materialCare?: string;
    shippingReturns?: string;
    featured?: boolean;
    isNewArrival?: boolean;
    seasonal?: boolean;
    inventory?: number;
    status?: string;
    sortOrder?: number;
    seo?: { title?: string; description?: string; ogImage?: string };
  };
};

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? String(fromMinor(product.priceMinor)) : "",
  );
  const [compareAt, setCompareAt] = useState(
    product?.compareAtPriceMinor
      ? String(fromMinor(product.compareAtPriceMinor))
      : "",
  );
  const [categories, setCategories] = useState(
    (product?.categories ?? []).join(", "),
  );
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [images, setImages] = useState<ImageMeta[]>(product?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? []);
  const [materialCare, setMaterialCare] = useState(product?.materialCare ?? "");
  const [shippingReturns, setShippingReturns] = useState(
    product?.shippingReturns ?? "",
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [seasonal, setSeasonal] = useState(product?.seasonal ?? false);
  const [inventory, setInventory] = useState(String(product?.inventory ?? 0));
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [seo, setSeo] = useState(product?.seo ?? {});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    return {
      name,
      slug: slug || makeSlug(name),
      sku,
      shortDescription,
      description,
      priceMinor: toMinor(Number(price) || 0),
      compareAtPriceMinor: compareAt
        ? toMinor(Number(compareAt))
        : undefined,
      currency: "USD",
      categories: categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      collections: [],
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: images.map((img) => ({
        url: img.url,
        alt: img.alt ?? "",
        caption: img.caption ?? "",
        width: img.width ?? undefined,
        height: img.height ?? undefined,
        focalX: img.focalX ?? undefined,
        focalY: img.focalY ?? undefined,
      })),
      variants,
      materialCare,
      shippingReturns,
      featured,
      isNewArrival,
      seasonal,
      inventory: Number(inventory) || 0,
      status: status as "published" | "draft" | "archived",
      sortOrder: 0,
      seo: {
        title: seo.title ?? "",
        description: seo.description ?? "",
        ogImage: seo.ogImage ?? "",
        canonical: "",
      },
      editorial: { title: "", body: "", images: [] },
    };
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = buildPayload();
    const result =
      mode === "create"
        ? await createProduct(payload)
        : await updateProduct(product!._id, payload);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }

    setSaved(true);
    toast(mode === "create" ? "Product created" : "Product saved", "success");
    if (mode === "create" && result.data?.id) {
      router.replace(`/admin/products/${result.data.id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "New product" : product?.name ?? "Product"}
        backHref="/admin/products"
        backLabel="All products"
      />

      <div className="space-y-8">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Name" required>
              <TextInput
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (mode === "create" && !slug) setSlug(makeSlug(e.target.value));
                }}
              />
            </FormField>
            <FormField label="Slug" required>
              <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
            </FormField>
            <FormField label="SKU" required>
              <TextInput value={sku} onChange={(e) => setSku(e.target.value)} />
            </FormField>
            <FormField label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </FormField>
            <FormField label="Price (USD)" required>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </FormField>
            <FormField label="Compare at price">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
              />
            </FormField>
            <FormField label="Inventory">
              <TextInput
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
              />
            </FormField>
            <FormField label="Categories (comma-separated)">
              <TextInput
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
            </FormField>
            <FormField label="Tags (comma-separated)" className="sm:col-span-2">
              <TextInput value={tags} onChange={(e) => setTags(e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <Toggle checked={featured} onChange={setFeatured} label="Featured" />
            <Toggle checked={isNewArrival} onChange={setIsNewArrival} label="New" />
            <Toggle checked={seasonal} onChange={setSeasonal} label="Seasonal" />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Descriptions</h2>
          <div className="mt-4 space-y-4">
            <FormField label="Short description">
              <TextArea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
              />
            </FormField>
            <FormField label="Full description">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
              />
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <MultiImageUploader
            folder="products"
            value={images}
            onChange={setImages}
          />
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Variants</h2>
            <button
              type="button"
              onClick={() =>
                setVariants([
                  ...variants,
                  { name: "Size", options: [], sku: "", inventory: 0 },
                ])
              }
              className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
            >
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="rounded-sm border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Name">
                    <TextInput
                      value={variant.name}
                      onChange={(e) => {
                        const next = [...variants];
                        next[index] = { ...variant, name: e.target.value };
                        setVariants(next);
                      }}
                    />
                  </FormField>
                  <FormField label="Options (comma-separated)">
                    <TextInput
                      value={variant.options.join(", ")}
                      onChange={(e) => {
                        const next = [...variants];
                        next[index] = {
                          ...variant,
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setVariants(next);
                      }}
                    />
                  </FormField>
                  <FormField label="SKU">
                    <TextInput
                      value={variant.sku}
                      onChange={(e) => {
                        const next = [...variants];
                        next[index] = { ...variant, sku: e.target.value };
                        setVariants(next);
                      }}
                    />
                  </FormField>
                  <FormField label="Inventory">
                    <TextInput
                      type="number"
                      value={variant.inventory}
                      onChange={(e) => {
                        const next = [...variants];
                        next[index] = {
                          ...variant,
                          inventory: Number(e.target.value) || 0,
                        };
                        setVariants(next);
                      }}
                    />
                  </FormField>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVariants(variants.filter((_, i) => i !== index))
                  }
                  className="mt-2 inline-flex items-center gap-1 text-xs text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Material & shipping</h2>
          <div className="mt-4 space-y-4">
            <FormField label="Material & care">
              <TextArea
                value={materialCare}
                onChange={(e) => setMaterialCare(e.target.value)}
              />
            </FormField>
            <FormField label="Shipping & returns">
              <TextArea
                value={shippingReturns}
                onChange={(e) => setShippingReturns(e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">SEO</h2>
          <div className="mt-4 grid gap-4">
            <FormField label="Meta title">
              <TextInput
                value={seo.title ?? ""}
                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              />
            </FormField>
            <FormField label="Meta description">
              <TextArea
                value={seo.description ?? ""}
                onChange={(e) =>
                  setSeo({ ...seo, description: e.target.value })
                }
              />
            </FormField>
          </div>
        </section>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        label={mode === "create" ? "Create product" : "Save product"}
      />
    </div>
  );
}
