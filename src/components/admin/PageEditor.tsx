"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { savePage } from "@/app/admin/actions/pages";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader, MultiImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import type { PageHero } from "@/types/cms";

type PageSection = {
  _id?: string;
  key: string;
  type: string;
  title?: string;
  eyebrow?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  images?: PageHero["images"];
  enabled?: boolean;
  order?: number;
  meta?: Record<string, unknown>;
};

type PageEditorProps = {
  page: {
    slug: string;
    title: string;
    route: string;
    status?: string;
    hero?: PageHero;
    sections?: PageSection[];
    seo?: { title?: string; description?: string; ogImage?: string };
  };
};

export function PageEditor({ page }: PageEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(page.title);
  const [status, setStatus] = useState(page.status ?? "published");
  const [hero, setHero] = useState<PageHero>(page.hero ?? {});
  const [sections, setSections] = useState<PageSection[]>(
    [...(page.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
  const [seo, setSeo] = useState(page.seo ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateSection(index: number, patch: Partial<PageSection>) {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setSaved(false);
  }

  function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await savePage({
      slug: page.slug,
      title,
      status: status as "published" | "draft",
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
      sections: sections.map((s, i) => ({
        key: s.key,
        type: s.type,
        title: s.title ?? "",
        eyebrow: s.eyebrow ?? "",
        body: s.body ?? "",
        ctaLabel: s.ctaLabel ?? "",
        ctaHref: s.ctaHref ?? "",
        secondaryCtaLabel: s.secondaryCtaLabel ?? "",
        secondaryCtaHref: s.secondaryCtaHref ?? "",
        images: s.images ?? [],
        enabled: s.enabled !== false,
        order: i,
        meta: s.meta ?? {},
      })),
      seo: {
        title: seo.title ?? "",
        description: seo.description ?? "",
        ogImage: seo.ogImage ?? "",
        canonical: "",
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    setSaved(true);
    toast("Page saved", "success");
  }

  return (
    <div>
      <PageHeader
        title={page.title}
        description={`Route: ${page.route}`}
        backHref="/admin/pages"
        backLabel="All pages"
      />

      <div className="space-y-8">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">General</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Title">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Hero</h2>
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
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              />
            </FormField>
            <FormField label="Body" className="sm:col-span-2">
              <TextArea
                value={hero.body ?? ""}
                onChange={(e) => setHero({ ...hero, body: e.target.value })}
              />
            </FormField>
            <FormField label="CTA label">
              <TextInput
                value={hero.ctaLabel ?? ""}
                onChange={(e) => setHero({ ...hero, ctaLabel: e.target.value })}
              />
            </FormField>
            <FormField label="CTA href">
              <TextInput
                value={hero.ctaHref ?? ""}
                onChange={(e) => setHero({ ...hero, ctaHref: e.target.value })}
              />
            </FormField>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ImageUploader
              folder="pages"
              label="Background"
              value={hero.background ?? null}
              onChange={(background) =>
                setHero({ ...hero, background: background ?? undefined })
              }
            />
            <MultiImageUploader
              folder="pages"
              label="Hero images"
              value={hero.images ?? []}
              onChange={(images) => setHero({ ...hero, images })}
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Sections</h2>
          <div className="mt-4 space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.key + String(section._id ?? index)}
                className="rounded-sm border border-border p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{section.title || section.key}</p>
                    <p className="text-xs text-muted">{section.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={section.enabled !== false}
                      onChange={(enabled) => updateSection(index, { enabled })}
                      label="Enabled"
                    />
                    <button
                      type="button"
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                      className="rounded-sm p-1.5 hover:bg-stone-50 disabled:opacity-40"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 1)}
                      disabled={index === sections.length - 1}
                      className="rounded-sm p-1.5 hover:bg-stone-50 disabled:opacity-40"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Title">
                    <TextInput
                      value={section.title ?? ""}
                      onChange={(e) =>
                        updateSection(index, { title: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Eyebrow">
                    <TextInput
                      value={section.eyebrow ?? ""}
                      onChange={(e) =>
                        updateSection(index, { eyebrow: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Body" className="sm:col-span-2">
                    <TextArea
                      value={section.body ?? ""}
                      onChange={(e) =>
                        updateSection(index, { body: e.target.value })
                      }
                    />
                  </FormField>
                </div>
                <div className="mt-4">
                  <MultiImageUploader
                    folder="pages"
                    value={section.images ?? []}
                    onChange={(images) => updateSection(index, { images })}
                  />
                </div>
              </div>
            ))}
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
            <FormField label="OG image URL">
              <TextInput
                value={seo.ogImage ?? ""}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
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
      />
    </div>
  );
}
