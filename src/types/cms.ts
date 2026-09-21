import type { ImageMeta } from "@/models/shared";

export type SettingsData = {
  brandName?: string;
  shortStatement?: string;
  email?: string;
  phone?: string;
  socialHandle?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    twitter?: string;
  };
  address?: string;
  locationEnabled?: boolean;
  businessHours?: string;
  footerDescription?: string;
  footerNavGroups?: { title: string; links: { label: string; href: string }[] }[];
  currency?: string;
  seasonalOffer?: {
    active?: boolean;
    text?: string;
    discountPercent?: number;
    ctaLabel?: string;
    ctaHref?: string;
  };
  newsletterCta?: string;
  defaultSeo?: { title?: string; description?: string; ogImage?: string };
  logoDisplay?: { showWordmark?: boolean; showMonogram?: boolean };
  contactHeroImage?: ImageMeta;
};

export type PageHero = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  background?: ImageMeta;
  images?: ImageMeta[];
};

export type PageSection = {
  key: string;
  type: string;
  title?: string;
  eyebrow?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  images?: ImageMeta[];
  enabled?: boolean;
  order?: number;
  meta?: Record<string, unknown>;
};

export type PageData = {
  title: string;
  slug: string;
  route: string;
  seo?: { title?: string; description?: string; ogImage?: string };
  hero?: PageHero;
  sections?: PageSection[];
  blocks?: ContentBlock[];
};

export type ContentBlock = {
  _id?: string;
  type: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  alignment?: string;
  ctaLabel?: string;
  ctaHref?: string;
  images?: ImageMeta[];
  enabled?: boolean;
  order?: number;
};

export type ProductData = {
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
  variants?: {
    _id?: string;
    name: string;
    options?: string[];
    sku?: string;
    priceOverrideMinor?: number;
    inventory?: number;
  }[];
  materialCare?: string;
  shippingReturns?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  seasonal?: boolean;
  inventory?: number;
  seo?: { title?: string; description?: string; ogImage?: string };
  editorial?: {
    title?: string;
    body?: string;
    images?: ImageMeta[];
  };
};

export type ServiceData = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  mainImage?: ImageMeta;
  ctaLabel?: string;
  featured?: boolean;
  detail?: {
    hero?: PageHero;
    longIntroduction?: string;
    sections?: ContentBlock[];
    seo?: { title?: string; description?: string; ogImage?: string };
  };
};

export type BlogPostData = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: ImageMeta;
  author?: string;
  category?: string;
  tags?: string[];
  publishDate?: string;
  blocks?: ContentBlock[];
  seo?: { title?: string; description?: string; ogImage?: string };
  readingMinutes?: number;
};

export type TestimonialData = {
  _id: string;
  name: string;
  role?: string;
  location?: string;
  quote: string;
  portrait?: ImageMeta;
  featured?: boolean;
};

export type FaqData = {
  _id: string;
  question: string;
  answer: string;
  categoryId?: string;
};

export type FaqCategoryData = {
  _id: string;
  name: string;
  slug: string;
};

export type GalleryImageData = {
  _id: string;
  categoryId: string;
  image: ImageMeta;
  title?: string;
  caption?: string;
  orientation?: string;
};

export type GalleryCategoryData = {
  _id: string;
  name: string;
  slug: string;
};
