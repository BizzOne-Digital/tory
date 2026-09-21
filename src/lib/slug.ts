import slugify from "slugify";

export function makeSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
) {
  let slug = makeSlug(base) || "item";
  let attempt = 0;
  while (await exists(slug)) {
    attempt += 1;
    slug = `${makeSlug(base) || "item"}-${attempt}`;
  }
  return slug;
}
