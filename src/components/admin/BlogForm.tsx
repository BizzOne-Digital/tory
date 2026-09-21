"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  archiveBlogPost,
  createBlogPost,
  updateBlogPost,
} from "@/app/admin/actions/blog";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";
import { makeSlug } from "@/lib/slug";
import type { ImageMeta } from "@/models/shared";
import type { ContentBlock } from "@/types/cms";

type BlogFormProps = {
  mode: "create" | "edit";
  post?: {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: { url: string; alt?: string };
    author?: string;
    category?: string;
    tags?: string[];
    publishDate?: string;
    status?: string;
    blocks?: ContentBlock[];
    seo?: { title?: string; description?: string; ogImage?: string };
    readingMinutes?: number;
  };
};

export function BlogForm({ mode, post }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState<ImageMeta | null>(
    post?.coverImage?.url
      ? {
          url: post.coverImage.url,
          alt: post.coverImage.alt ?? "",
          caption: "",
        }
      : null,
  );
  const [author, setAuthor] = useState(
    post?.author ?? "LUCCI CRENO Atelier",
  );
  const [category, setCategory] = useState(post?.category ?? "Journal");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [publishDate, setPublishDate] = useState(
    post?.publishDate
      ? new Date(post.publishDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [blocks, setBlocks] = useState<ContentBlock[]>(post?.blocks ?? []);
  const [seo, setSeo] = useState(post?.seo ?? {});
  const [readingMinutes, setReadingMinutes] = useState(
    String(post?.readingMinutes ?? 4),
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    return {
      title,
      slug: slug || makeSlug(title),
      excerpt,
      coverImage: coverImage
        ? {
            url: coverImage.url,
            alt: coverImage.alt ?? "",
            caption: coverImage.caption ?? "",
          }
        : undefined,
      author,
      category,
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      publishDate,
      status: status as "published" | "draft" | "scheduled" | "archived",
      blocks,
      seo: {
        title: seo.title ?? "",
        description: seo.description ?? "",
        ogImage: seo.ogImage ?? "",
        canonical: "",
      },
      readingMinutes: Number(readingMinutes) || 4,
    };
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = buildPayload();
    const result =
      mode === "create"
        ? await createBlogPost(
            payload as Parameters<typeof createBlogPost>[0],
          )
        : await updateBlogPost(
            post!._id,
            payload as Parameters<typeof updateBlogPost>[1],
          );

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }

    setSaved(true);
    toast(mode === "create" ? "Post created" : "Post saved", "success");
    if (mode === "create" && result.data?.id) {
      router.replace(`/admin/blog/${result.data.id}`);
    }
  }

  async function handleArchive() {
    if (!post) return;
    const result = await archiveBlogPost(post._id);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Post archived", "success");
    router.push("/admin/blog");
  }

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "New blog post" : post?.title ?? "Post"}
        backHref="/admin/blog"
        backLabel="All posts"
        actions={
          post?.slug && status === "published" ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="rounded-sm border border-border bg-white px-4 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Preview
            </Link>
          ) : null
        }
      />

      <div className="space-y-8">
        <section className="rounded-sm border border-border bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title" required>
              <TextInput
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (mode === "create" && !slug) setSlug(makeSlug(e.target.value));
                }}
              />
            </FormField>
            <FormField label="Slug" required>
              <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
            </FormField>
            <FormField label="Author">
              <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} />
            </FormField>
            <FormField label="Category">
              <TextInput
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </FormField>
            <FormField label="Publish date">
              <TextInput
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </FormField>
            <FormField label="Reading minutes">
              <TextInput
                type="number"
                min="1"
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(e.target.value)}
              />
            </FormField>
            <FormField label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </Select>
            </FormField>
            <FormField label="Tags (comma-separated)" className="sm:col-span-2">
              <TextInput value={tags} onChange={(e) => setTags(e.target.value)} />
            </FormField>
            <FormField label="Excerpt" className="sm:col-span-2">
              <TextArea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <ImageUploader
              folder="blog"
              label="Cover image"
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Content blocks</h2>
          <div className="mt-4">
            <ContentBlockEditor
              blocks={blocks}
              onChange={setBlocks}
              uploadFolder="blog"
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
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        label={mode === "create" ? "Create post" : "Save post"}
      />

      {mode === "edit" && post?.status !== "archived" ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleArchive()}
            className="text-sm text-red-700 hover:underline"
          >
            Archive post
          </button>
        </div>
      ) : null}
    </div>
  );
}
