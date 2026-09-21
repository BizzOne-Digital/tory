"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createService,
  updateService,
} from "@/app/admin/actions/services";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { Tabs } from "@/components/admin/Tabs";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import { makeSlug } from "@/lib/slug";
import type { ImageMeta } from "@/models/shared";
import type { ContentBlock } from "@/types/cms";
import type { PageHero } from "@/types/cms";

type ServiceFormProps = {
  mode: "create" | "edit";
  service?: {
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    mainImage?: { url: string; alt?: string };
    ctaLabel?: string;
    featured?: boolean;
    sortOrder?: number;
    status?: string;
    detail?: {
      hero?: PageHero;
      longIntroduction?: string;
      sections?: ContentBlock[];
      seo?: { title?: string; description?: string; ogImage?: string };
    };
  };
};

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState("listing");

  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(
    service?.shortDescription ?? "",
  );
  const [mainImage, setMainImage] = useState<ImageMeta | null>(
    service?.mainImage?.url
      ? {
          url: service.mainImage.url,
          alt: service.mainImage.alt ?? "",
          caption: "",
        }
      : null,
  );
  const [ctaLabel, setCtaLabel] = useState(service?.ctaLabel ?? "Explore");
  const [featured, setFeatured] = useState(service?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(service?.sortOrder ?? 0));
  const [status, setStatus] = useState(service?.status ?? "draft");

  const [hero, setHero] = useState<PageHero>(service?.detail?.hero ?? {});
  const [longIntroduction, setLongIntroduction] = useState(
    service?.detail?.longIntroduction ?? "",
  );
  const [sections, setSections] = useState<ContentBlock[]>(
    service?.detail?.sections ?? [],
  );
  const [seo, setSeo] = useState(service?.detail?.seo ?? {});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    return {
      name,
      slug: slug || makeSlug(name),
      shortDescription,
      mainImage: mainImage
        ? { url: mainImage.url, alt: mainImage.alt ?? "", caption: mainImage.caption ?? "" }
        : undefined,
      ctaLabel,
      featured,
      sortOrder: Number(sortOrder) || 0,
      status: status as "published" | "draft" | "archived",
      detail: {
        hero: {
          eyebrow: hero.eyebrow ?? "",
          title: hero.title ?? "",
          subtitle: hero.subtitle ?? "",
          body: hero.body ?? "",
          ctaLabel: hero.ctaLabel ?? "",
          ctaHref: hero.ctaHref ?? "",
          secondaryCtaLabel: hero.secondaryCtaLabel ?? "",
          secondaryCtaHref: hero.secondaryCtaHref ?? "",
          background: hero.background,
          images: hero.images ?? [],
        },
        longIntroduction,
        sections,
        seo: {
          title: seo.title ?? "",
          description: seo.description ?? "",
          ogImage: seo.ogImage ?? "",
          canonical: "",
        },
      },
    };
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = buildPayload();
    const result =
      mode === "create"
        ? await createService(
            payload as Parameters<typeof createService>[0],
          )
        : await updateService(
            service!._id,
            payload as Parameters<typeof updateService>[1],
          );

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }

    setSaved(true);
    toast(mode === "create" ? "Service created" : "Service saved", "success");
    if (mode === "create" && result.data?.id) {
      router.replace(`/admin/services/${result.data.id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "New service" : service?.name ?? "Service"}
        backHref="/admin/services"
        backLabel="All services"
        actions={
          service?.slug && status === "published" ? (
            <Link
              href={`/services/${service.slug}`}
              target="_blank"
              className="rounded-sm border border-border bg-white px-4 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Preview
            </Link>
          ) : null
        }
      />

      <Tabs
        tabs={[
          { id: "listing", label: "Listing" },
          { id: "detail", label: "Detail page" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6 space-y-8">
        {tab === "listing" ? (
          <section className="rounded-sm border border-border bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name" required>
                <TextInput
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (mode === "create" && !slug) {
                      setSlug(makeSlug(e.target.value));
                    }
                  }}
                />
              </FormField>
              <FormField label="Slug" required>
                <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
              </FormField>
              <FormField label="Short description" className="sm:col-span-2">
                <TextArea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </FormField>
              <FormField label="CTA label">
                <TextInput
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                />
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
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </FormField>
              <div className="flex items-end">
                <Toggle checked={featured} onChange={setFeatured} label="Featured" />
              </div>
            </div>
            <div className="mt-4">
              <ImageUploader
                folder="services"
                label="Main image"
                value={mainImage}
                onChange={setMainImage}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-sm border border-border bg-white p-5">
              <h2 className="font-display text-xl text-ink">Detail hero</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Eyebrow">
                  <TextInput
                    value={hero.eyebrow ?? ""}
                    onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                  />
                </FormField>
                <FormField label="Title">
                  <TextInput
                    value={hero.title ?? ""}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  />
                </FormField>
                <FormField label="Subtitle" className="sm:col-span-2">
                  <TextInput
                    value={hero.subtitle ?? ""}
                    onChange={(e) =>
                      setHero({ ...hero, subtitle: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="mt-4">
                <ImageUploader
                  folder="services"
                  label="Hero background"
                  value={hero.background ?? null}
                  onChange={(background) =>
                    setHero({ ...hero, background: background ?? undefined })
                  }
                />
              </div>
            </section>

            <section className="rounded-sm border border-border bg-white p-5">
              <FormField label="Long introduction">
                <TextArea
                  value={longIntroduction}
                  onChange={(e) => setLongIntroduction(e.target.value)}
                  rows={8}
                />
              </FormField>
            </section>

            <section className="rounded-sm border border-border bg-white p-5">
              <h2 className="font-display text-xl text-ink">Content sections</h2>
              <div className="mt-4">
                <ContentBlockEditor
                  blocks={sections}
                  onChange={setSections}
                  uploadFolder="services"
                />
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
          </>
        )}
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        label={mode === "create" ? "Create service" : "Save service"}
      />
    </div>
  );
}
