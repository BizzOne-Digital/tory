"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionError,
  actionSuccess,
  serializeDoc,
  type ActionResult,
} from "@/lib/admin/action-result";
import { requireSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { revalidatePublicContent } from "@/lib/revalidate";
import { makeSlug, uniqueSlug } from "@/lib/slug";
import { sanitizeRichText } from "@/lib/sanitize-html";
import {
  contentBlockSchema,
  imageMetaSchema,
  seoSchema,
  slugSchema,
} from "@/lib/validation/admin-shared";
import { BlogPost } from "@/models";

const blogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().default(""),
  coverImage: imageMetaSchema.optional(),
  author: z.string().default("LUCCI CRENO Atelier"),
  category: z.string().default("Journal"),
  tags: z.array(z.string().trim().max(50)).default([]),
  publishDate: z.string().optional(),
  status: z
    .enum(["published", "draft", "scheduled", "archived"])
    .default("draft"),
  blocks: z.array(contentBlockSchema).default([]),
  seo: seoSchema.optional(),
  readingMinutes: z.number().int().min(1).default(4),
});

export async function getAdminBlogPosts(filters?: { status?: string; q?: string }) {
  await requireSession();
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }
  if (filters?.q?.trim()) {
    query.$text = { $search: filters.q.trim() };
  }

  const posts = await BlogPost.find(query).sort({ updatedAt: -1 }).lean();
  return serializeDoc(posts);
}

export async function getAdminBlogPost(id: string) {
  await requireSession();
  await connectDB();
  const post = await BlogPost.findById(id).lean();
  if (!post) return null;
  return serializeDoc(post);
}

function sanitizeBlocks(blocks: z.infer<typeof contentBlockSchema>[]) {
  return blocks.map((b, i) => ({
    ...b,
    order: i,
    body: sanitizeRichText(b.body),
  }));
}

export async function createBlogPost(
  input: z.infer<typeof blogSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = blogSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid post data");
    }

    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.title, async (s) =>
      Boolean(await BlogPost.exists({ slug: s })),
    );

    const post = await BlogPost.create({
      ...data,
      slug,
      publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
      blocks: sanitizeBlocks(data.blocks),
      updatedBy: session.email,
    });

    if (post.status === "published") {
      revalidatePublicContent(["/blog", `/blog/${post.slug}`]);
    }
    revalidatePath("/admin/blog");
    return actionSuccess({ id: String(post._id) }, "Post created");
  } catch {
    return actionError("Failed to create post");
  }
}

export async function updateBlogPost(
  id: string,
  input: Partial<z.infer<typeof blogSchema>>,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = blogSchema.partial().safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid post data");
    }

    const patch: Record<string, unknown> = { updatedBy: session.email };
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      if (key === "blocks") {
        patch.blocks = sanitizeBlocks(value as z.infer<typeof contentBlockSchema>[]);
      } else if (key === "publishDate" && typeof value === "string") {
        patch.publishDate = new Date(value);
      } else {
        patch[key] = value;
      }
    }

    const post = await BlogPost.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!post) return actionError("Post not found");

    revalidatePublicContent(["/blog", `/blog/${post.slug}`]);
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${id}`);
    return actionSuccess(undefined, "Post saved");
  } catch {
    return actionError("Failed to update post");
  }
}

export async function archiveBlogPost(id: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: session.email } },
      { new: true },
    );
    if (!post) return actionError("Post not found");

    revalidatePublicContent(["/blog", `/blog/${post.slug}`]);
    revalidatePath("/admin/blog");
    return actionSuccess(undefined, "Post archived");
  } catch {
    return actionError("Failed to archive post");
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  return archiveBlogPost(id);
}

export async function suggestBlogSlug(title: string) {
  await requireSession();
  return makeSlug(title);
}
