import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicContent(paths: string[] = []) {
  const defaults = [
    "/",
    "/shop",
    "/services",
    "/testimonials",
    "/faq",
    "/contact",
    "/about",
  ];
  for (const p of new Set([...defaults, ...paths])) {
    revalidatePath(p);
  }
  revalidateTag("cms", "max");
  revalidateTag("settings", "max");
}
