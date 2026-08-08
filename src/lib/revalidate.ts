import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicContent(paths: string[] = []) {
  const defaults = [
    "/",
    "/shop",
    "/services",
    "/gallery",
    "/testimonials",
    "/faq",
    "/blog",
    "/contact",
    "/about",
  ];
  for (const p of new Set([...defaults, ...paths])) {
    revalidatePath(p);
  }
  revalidateTag("cms", "max");
  revalidateTag("settings", "max");
}
