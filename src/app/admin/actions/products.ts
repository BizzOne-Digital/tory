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
import {
  productCreateSchema,
  productUpdateSchema,
} from "@/lib/validation/product";
import { Product } from "@/models";

export async function getAdminProducts(filters?: {
  q?: string;
  status?: string;
}) {
  await requireSession();
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }
  if (filters?.q?.trim()) {
    query.$text = { $search: filters.q.trim() };
  }

  const products = await Product.find(query)
    .sort({ updatedAt: -1 })
    .lean();
  return serializeDoc(products);
}

export async function getAdminProduct(id: string) {
  await requireSession();
  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return serializeDoc(product);
}

export async function createProduct(
  input: z.infer<typeof productCreateSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = productCreateSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid product data",
      );
    }

    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.name, async (s) =>
      Boolean(await Product.exists({ slug: s })),
    );

    const product = await Product.create({
      ...data,
      slug,
      updatedBy: session.email,
    });

    revalidatePublicContent(["/shop", `/shop/${product.slug}`]);
    revalidatePath("/admin/products");
    return actionSuccess({ id: String(product._id) }, "Product created");
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionError("Unauthorized");
    }
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return actionError("Slug or SKU already exists");
    }
    return actionError("Failed to create product");
  }
}

export async function updateProduct(
  id: string,
  input: z.infer<typeof productUpdateSchema>,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = productUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid product data",
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { ...parsed.data, updatedBy: session.email } },
      { new: true },
    );
    if (!product) return actionError("Product not found");

    revalidatePublicContent(["/shop", `/shop/${product.slug}`]);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return actionSuccess(undefined, "Product saved");
  } catch {
    return actionError("Failed to update product");
  }
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    await connectDB();
    const source = await Product.findById(id).lean();
    if (!source) return actionError("Product not found");

    const baseName = `${source.name} Copy`;
    const slug = await uniqueSlug(makeSlug(baseName), async (s) =>
      Boolean(await Product.exists({ slug: s })),
    );
    const sku = await uniqueSlug(`${source.sku}-copy`, async (s) =>
      Boolean(await Product.exists({ sku: s.toUpperCase() })),
    );

    const rest = { ...(source as Record<string, unknown>) };
    delete rest._id;
    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.__v;

    const product = await Product.create({
      ...rest,
      name: baseName,
      slug,
      sku: sku.toUpperCase().slice(0, 50),
      status: "draft",
      updatedBy: session.email,
    });

    revalidatePath("/admin/products");
    return actionSuccess({ id: String(product._id) }, "Product duplicated");
  } catch {
    return actionError("Failed to duplicate product");
  }
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: session.email } },
      { new: true },
    );
    if (!product) return actionError("Product not found");

    revalidatePublicContent(["/shop", `/shop/${product.slug}`]);
    revalidatePath("/admin/products");
    return actionSuccess(undefined, "Product archived");
  } catch {
    return actionError("Failed to archive product");
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return archiveProduct(id);
}
