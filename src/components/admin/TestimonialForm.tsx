"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createTestimonial,
  updateTestimonial,
} from "@/app/admin/actions/testimonials";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import type { ImageMeta } from "@/models/shared";

type TestimonialFormProps = {
  mode: "create" | "edit";
  testimonial?: {
    _id: string;
    name: string;
    role?: string;
    location?: string;
    quote: string;
    portrait?: { url: string; alt?: string };
    featured?: boolean;
    sortOrder?: number;
    status?: string;
  };
};

export function TestimonialForm({ mode, testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [location, setLocation] = useState(testimonial?.location ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [portrait, setPortrait] = useState<ImageMeta | null>(
    testimonial?.portrait?.url
      ? {
          url: testimonial.portrait.url,
          alt: testimonial.portrait.alt ?? "",
          caption: "",
        }
      : null,
  );
  const [featured, setFeatured] = useState(testimonial?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(testimonial?.sortOrder ?? 0));
  const [status, setStatus] = useState(testimonial?.status ?? "published");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = {
      name,
      role,
      location,
      quote,
      portrait: portrait
        ? { url: portrait.url, alt: portrait.alt ?? "", caption: portrait.caption ?? "" }
        : undefined,
      featured,
      sortOrder: Number(sortOrder) || 0,
      status: status as "published" | "draft",
    };

    const result =
      mode === "create"
        ? await createTestimonial(payload)
        : await updateTestimonial(testimonial!._id, payload);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }

    setSaved(true);
    toast(mode === "create" ? "Created" : "Saved", "success");
    if (mode === "create" && result.data?.id) {
      router.replace(`/admin/testimonials/${result.data.id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "New testimonial" : testimonial?.name ?? ""}
        backHref="/admin/testimonials"
        backLabel="All testimonials"
      />

      <div className="space-y-6 rounded-sm border border-border bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Role">
            <TextInput value={role} onChange={(e) => setRole(e.target.value)} />
          </FormField>
          <FormField label="Location">
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>
          <div className="flex items-end">
            <Toggle checked={featured} onChange={setFeatured} label="Featured" />
          </div>
        </div>
        <FormField label="Quote" required>
          <TextArea value={quote} onChange={(e) => setQuote(e.target.value)} rows={5} />
        </FormField>
        <ImageUploader
          folder="testimonials"
          label="Portrait"
          value={portrait}
          onChange={setPortrait}
        />
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        label={mode === "create" ? "Create" : "Save"}
      />
    </div>
  );
}
