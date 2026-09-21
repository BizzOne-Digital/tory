import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  AdminUser,
  SiteSettings,
  Page,
  Product,
  Service,
  GalleryCategory,
  GalleryImage,
  Testimonial,
  FaqCategory,
  Faq,
  BlogPost,
} from "../src/models";
import type { ImageMeta } from "../src/models/shared";

const ROOT = path.resolve(__dirname, "..");

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@luccicreno.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "ChangeMe_SecurePass123!";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required. Set it in .env or .env.local");
  process.exit(1);
}

const UNSPLASH = {
  hero1:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
  hero2:
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
  hero3:
    "https://images.unsplash.com/photo-1483985988354-763728fb1773?w=1600&q=80",
  fashion1:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&q=80",
  fashion2:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
  fashion3:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  fashion4:
    "https://images.unsplash.com/photo-1525507119025-ed4c629a60a3?w=1200&q=80",
  fashion5:
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
  fashion6:
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
  luxury1:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
  luxury2:
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80",
  luxury3:
    "https://images.unsplash.com/photo-1581047135774-3f4828b1e4d8?w=1200&q=80",
  luxury4:
    "https://images.unsplash.com/photo-1594633312681-425a7b9568e2?w=1200&q=80",
  atelier1:
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80",
  atelier2:
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  portrait1:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
  portrait2:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  portrait3:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
  detail1:
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=80",
  detail2:
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=80",
  detail3:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80",
  detail4:
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80",
  editorial1:
    "https://images.unsplash.com/photo-1487222477894-8943ad31bf7b?w=1200&q=80",
  editorial2:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
  editorial3:
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80",
  editorial4:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80",
} as const;

function img(url: string, alt: string, caption = ""): ImageMeta {
  return { url, alt, caption, width: 1200, height: 1600 };
}

function productImg(filename: string, alt: string, caption = ""): ImageMeta {
  return img(`/uploads/products/${filename}`, alt, caption);
}

function pageImg(filename: string, alt: string, caption = ""): ImageMeta {
  return img(`/uploads/pages/${filename}`, alt, caption);
}

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await AdminUser.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      $set: {
        passwordHash,
        name: "LUCCI CRENO Admin",
        role: "admin",
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    },
    { upsert: true, new: true },
  );
  console.log("  ✓ AdminUser");
}

async function seedSiteSettings() {
  await SiteSettings.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        brandName: "LUCCI CRENO",
        shortStatement: "Create genuine luxury you wear…",
        email: "luccicreno873@yahoo.com",
        phone: "7174250354",
        socialHandle: "LUCCICRENO",
        socialLinks: {
          instagram: "https://instagram.com/LUCCICRENO",
          facebook: "",
          pinterest: "",
          twitter: "",
        },
        address: "Atelier District — By appointment",
        locationEnabled: true,
        businessHours: "Mon–Sat · 10:00–18:00 · Private fittings by appointment",
        footerDescription:
          "Timeless wearable luxury crafted for those who prefer enduring elegance over fleeting trends.",
        footerNavGroups: [
          {
            title: "Explore",
            links: [
              { label: "Shop", href: "/shop" },
              { label: "Services", href: "/services" },
            ],
          },
          {
            title: "House",
            links: [
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ],
          },
        ],
        currency: "USD",
        seasonalOffer: {
          active: true,
          text: "Summer Atelier Edit — select pieces with seasonal courtesy.",
          discountPercent: 15,
          ctaLabel: "Shop the edit",
          ctaHref: "/shop",
        },
        newsletterCta: "Enter the circle — private previews and atelier notes.",
        defaultSeo: {
          title: "LUCCI CRENO — Genuine Luxury You Wear",
          description:
            "Bespoke tailoring, couture edits, and timeless wardrobe pieces from the LUCCI CRENO atelier.",
          ogImage: UNSPLASH.hero1,
        },
        logoDisplay: { showWordmark: true, showMonogram: true },
        contactHeroImage: img(
          UNSPLASH.atelier1,
          "LUCCI CRENO atelier reception",
        ),
      },
    },
    { upsert: true, new: true },
  );
  console.log("  ✓ SiteSettings");
}

type PageSeed = {
  title: string;
  slug: string;
  route: string;
  hero: Record<string, unknown>;
  sections: Record<string, unknown>[];
  seo?: Record<string, string>;
};

const PAGE_SEEDS: PageSeed[] = [
  {
    title: "Home",
    slug: "home",
    route: "/",
    seo: {
      title: "LUCCI CRENO — Home",
      description: "Discover genuine luxury you wear.",
    },
    hero: {
      eyebrow: "LUCCI CRENO",
      title: "Create Genuine Luxury You Wear",
      subtitle: "Bespoke tailoring & curated couture edits",
      body: "An atelier devoted to enduring elegance — crafted for those who wear their story with quiet confidence.",
      ctaLabel: "Explore the Collection",
      ctaHref: "/shop",
      secondaryCtaLabel: "Book a Fitting",
      secondaryCtaHref: "/contact",
      background: img(UNSPLASH.hero1, "Luxury fashion editorial"),
      images: [
        img(UNSPLASH.fashion1, "Evening gown detail"),
        img(UNSPLASH.luxury1, "Silk drape study"),
      ],
    },
    sections: [
      {
        key: "intro",
        type: "split",
        eyebrow: "The House",
        title: "Wearable Artistry",
        body: "Every piece begins with intention — silhouette, drape, and the quiet drama of impeccable construction.",
        images: [img(UNSPLASH.fashion2, "Atelier craftsmanship")],
        order: 0,
      },
      {
        key: "featured",
        type: "grid",
        title: "Seasonal Edit",
        body: "Curated silhouettes with 15% seasonal courtesy through the Summer Atelier Edit.",
        ctaLabel: "Shop Now",
        ctaHref: "/shop",
        images: [
          img(UNSPLASH.fashion3, "Structured blazer"),
          img(UNSPLASH.fashion4, "Silk midi dress"),
          img(UNSPLASH.fashion5, "Tailored trousers"),
        ],
        order: 1,
      },
      {
        key: "services-preview",
        type: "cards",
        title: "Atelier Services",
        body: "From bespoke tailoring to wardrobe curation — services designed around you.",
        ctaLabel: "View Services",
        ctaHref: "/services",
        images: [img(UNSPLASH.atelier2, "Private fitting room")],
        order: 2,
      },
      {
        key: "testimonials",
        type: "quote-carousel",
        title: "Client Stories",
        body: "Trusted by discerning clients who value craftsmanship over trends.",
        images: [img(UNSPLASH.portrait1, "Client portrait")],
        order: 3,
      },
    ],
  },
  {
    title: "Shop",
    slug: "shop",
    route: "/shop",
    seo: {
      title: "Shop — LUCCI CRENO",
      description: "Shop LUCCI CRENO apparel and accessories.",
    },
    hero: {
      eyebrow: "Collection",
      title: "The Shop",
      subtitle:
        "Hats, tees, sweatshirts, denim, and trousers — genuine luxury you wear.",
      background: pageImg(
        "shop-hero.png",
        "LUCCI CRENO collection on a clothing rack",
      ),
    },
    sections: [],
  },
  {
    title: "About",
    slug: "about",
    route: "/about",
    hero: {
      eyebrow: "Our Story",
      title: "The LUCCI CRENO Atelier",
      subtitle: "Heritage craft, contemporary vision",
      body: "Founded on the belief that luxury should be lived in — not locked away.",
      background: img(UNSPLASH.atelier1, "Atelier workspace"),
      images: [img(UNSPLASH.detail1, "Hand finishing detail")],
    },
    sections: [
      {
        key: "philosophy",
        type: "text",
        title: "Philosophy",
        body: "We create garments that honour the body and elevate everyday moments into quiet ceremony.",
        images: [img(UNSPLASH.luxury2, "Fabric selection")],
        order: 0,
      },
      {
        key: "craft",
        type: "split",
        title: "Craft & Materials",
        body: "Italian silks, Japanese wools, and heritage techniques passed through generations of makers.",
        images: [
          img(UNSPLASH.detail2, "Thread and needle"),
          img(UNSPLASH.detail3, "Pattern cutting"),
        ],
        order: 1,
      },
      {
        key: "team",
        type: "grid",
        title: "The Makers",
        body: "A small team of master tailors, pattern cutters, and stylists united by precision.",
        images: [
          img(UNSPLASH.portrait2, "Lead tailor"),
          img(UNSPLASH.portrait3, "Head stylist"),
        ],
        order: 2,
      },
    ],
  },
  {
    title: "Services",
    slug: "services",
    route: "/services",
    hero: {
      eyebrow: "Atelier Services",
      title: "Tailored to You",
      subtitle: "Bespoke, alterations, and wardrobe curation",
      body: "Every service begins with a conversation — your lifestyle, your silhouette, your vision.",
      background: img(UNSPLASH.hero2, "Bespoke fitting"),
      images: [img(UNSPLASH.fashion6, "Service showcase")],
    },
    sections: [
      {
        key: "overview",
        type: "intro",
        title: "What We Offer",
        body: "From one-of-a-kind commissions to seasonal wardrobe refreshes.",
        images: [img(UNSPLASH.luxury3, "Service mood")],
        order: 0,
      },
      {
        key: "process",
        type: "steps",
        title: "The Process",
        body: "Consultation → Fitting → Refinement → Delivery",
        images: [img(UNSPLASH.atelier2, "Consultation space")],
        order: 1,
      },
      {
        key: "booking",
        type: "cta",
        title: "Book Your Appointment",
        body: "Private fittings available by appointment.",
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        images: [img(UNSPLASH.detail4, "Appointment detail")],
        order: 2,
      },
    ],
  },
  {
    title: "Testimonials",
    slug: "testimonials",
    route: "/testimonials",
    hero: {
      eyebrow: "Client Voices",
      title: "Testimonials",
      subtitle: "Stories from our circle",
      background: img(UNSPLASH.portrait1, "Client testimonial hero"),
    },
    sections: [
      {
        key: "featured-quotes",
        type: "quotes",
        title: "What Clients Say",
        body: "Authentic experiences from those who wear LUCCI CRENO.",
        images: [img(UNSPLASH.portrait2, "Featured client")],
        order: 0,
      },
    ],
  },
  {
    title: "FAQs",
    slug: "faqs",
    route: "/faqs",
    hero: {
      eyebrow: "Support",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know",
      background: img(UNSPLASH.luxury4, "FAQ hero"),
    },
    sections: [
      {
        key: "help",
        type: "faq-list",
        title: "Common Questions",
        body: "Ordering, fittings, care, and returns — answered.",
        order: 0,
      },
    ],
  },
  {
    title: "Contact",
    slug: "contact",
    route: "/contact",
    hero: {
      eyebrow: "Get in Touch",
      title: "Contact",
      subtitle: "We'd love to hear from you",
      body: "Email luccicreno873@yahoo.com or call 7174250354.",
      background: img(UNSPLASH.atelier1, "Contact hero"),
    },
    sections: [
      {
        key: "form",
        type: "contact-form",
        title: "Send a Message",
        body: "For appointments, commissions, and general enquiries.",
        order: 0,
      },
      {
        key: "location",
        type: "map",
        title: "Visit the Atelier",
        body: "By appointment — Atelier District.",
        images: [img(UNSPLASH.atelier2, "Atelier exterior")],
        order: 1,
      },
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy",
    route: "/privacy",
    hero: {
      title: "Privacy Policy",
      subtitle: "How we protect your information",
      background: img(UNSPLASH.luxury1, "Privacy policy"),
    },
    sections: [
      {
        key: "privacy-body",
        type: "legal",
        title: "Your Privacy",
        body: "We collect only what is necessary to fulfil orders and appointments.",
        order: 0,
      },
    ],
  },
  {
    title: "Terms of Service",
    slug: "terms",
    route: "/terms",
    hero: {
      title: "Terms of Service",
      subtitle: "Terms governing use of our site and services",
      background: img(UNSPLASH.luxury2, "Terms of service"),
    },
    sections: [
      {
        key: "terms-body",
        type: "legal",
        title: "Agreement",
        body: "By using this site you agree to our terms of service.",
        order: 0,
      },
    ],
  },
  {
    title: "Shipping",
    slug: "shipping",
    route: "/shipping",
    hero: {
      title: "Shipping",
      subtitle: "Delivery information",
      background: img(UNSPLASH.detail1, "Shipping"),
    },
    sections: [
      {
        key: "shipping-info",
        type: "legal",
        title: "Shipping Policy",
        body: "Complimentary insured shipping on orders over $500. Standard delivery 5–7 business days.",
        order: 0,
      },
    ],
  },
  {
    title: "Returns",
    slug: "returns",
    route: "/returns",
    hero: {
      title: "Returns & Exchanges",
      subtitle: "Our return policy",
      background: img(UNSPLASH.detail2, "Returns"),
    },
    sections: [
      {
        key: "returns-info",
        type: "legal",
        title: "Return Policy",
        body: "Unworn items may be returned within 14 days. Bespoke commissions are final sale.",
        order: 0,
      },
    ],
  },
];

async function seedPages() {
  const pageSlugs = PAGE_SEEDS.map((p) => p.slug);
  await Page.deleteMany({ slug: { $nin: pageSlugs } });

  for (const p of PAGE_SEEDS) {
    await Page.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          title: p.title,
          route: p.route,
          status: "published",
          seo: p.seo ?? {
            title: `${p.title} — LUCCI CRENO`,
            description: p.hero.subtitle ?? "",
          },
          hero: p.hero,
          sections: p.sections,
        },
      },
      { upsert: true, new: true },
    );
  }
  console.log(`  ✓ Pages (${PAGE_SEEDS.length})`);
}

const PRODUCT_SEEDS = [
  {
    name: "LUCCICRENO Short Sleeve",
    slug: "luccicreno-short-sleeve",
    sku: "LC-TEE-SS-001",
    priceMinor: 4500,
    featured: true,
    isNewArrival: true,
    categories: ["T-Shirts"],
    collections: ["LUCCICRENO"],
    images: [
      productImg("short-sleeve-yellow.jpg", "LUCCICRENO short sleeve — yellow"),
      productImg("short-sleeve-pink.jpg", "LUCCICRENO short sleeve — pink"),
      productImg("short-sleeve-white.png", "LUCCICRENO short sleeve — white"),
    ],
    variants: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL"], inventory: 30 },
      {
        name: "Colour",
        options: ["Yellow", "Pink", "White"],
        inventory: 30,
      },
    ],
  },
  {
    name: "LUCCICRENO Coach Jacket",
    slug: "luccicreno-coach-jacket",
    sku: "LC-JKT-COACH-001",
    priceMinor: 18500,
    featured: true,
    isNewArrival: true,
    categories: ["Denim"],
    collections: ["LUCCICRENO"],
    images: [
      productImg("coach-jacket-front.jpg", "LUCCICRENO coach jacket — front"),
      productImg("coach-jacket-back.jpg", "LUCCICRENO coach jacket — back"),
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"], inventory: 20 },
    ],
  },
  {
    name: "Denim LUCCICRENO Truck",
    slug: "denim-luccicreno-truck",
    sku: "LC-JKT-DENIM-TRUCK-001",
    priceMinor: 20000,
    featured: true,
    isNewArrival: true,
    categories: ["Denim"],
    collections: ["LUCCICRENO"],
    images: [
      productImg("denim-truck-white.jpg", "Denim LUCCICRENO truck — white"),
      productImg("denim-truck-blue.jpg", "Denim LUCCICRENO truck — blue"),
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"], inventory: 20 },
      { name: "Colour", options: ["White", "Blue"], inventory: 20 },
    ],
  },
  {
    name: "LUCCICRENO Sweatshirt",
    slug: "luccicreno-sweatshirt",
    sku: "LC-SWT-001",
    priceMinor: 6500,
    featured: true,
    isNewArrival: true,
    categories: ["Sweatshirts"],
    collections: ["LUCCICRENO"],
    images: [
      productImg(
        "luccicreno-sweatshirt-brown.jpg",
        "LUCCICRENO sweatshirt — brown",
      ),
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"], inventory: 24 },
    ],
  },
  {
    name: "LUCCICRENO Stay Ready Cargo",
    slug: "luccicreno-stay-ready-cargo",
    sku: "LC-PNT-CARGO-001",
    priceMinor: 10000,
    featured: true,
    categories: ["Trousers"],
    collections: ["LUCCICRENO"],
    images: [
      productImg(
        "stay-ready-cargo.png",
        "LUCCICRENO stay ready cargo pants",
      ),
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"], inventory: 24 },
    ],
  },
  {
    name: "LUCCICRENO Cap Zone",
    slug: "luccicreno-cap-zone",
    sku: "LC-CAP-ZONE-001",
    priceMinor: 6500,
    featured: true,
    isNewArrival: true,
    categories: ["Hats"],
    collections: ["LUCCICRENO"],
    images: [
      productImg("cap-zone-black.jpg", "LUCCICRENO cap zone — black"),
      productImg("cap-zone-grey.jpg", "LUCCICRENO cap zone — grey"),
      productImg("cap-zone-red.jpg", "LUCCICRENO cap zone — red"),
    ],
    variants: [
      { name: "Size", options: ["7", "7 1/8", "7 1/4", "7 3/8", "7 1/2"], inventory: 20 },
      {
        name: "Colour",
        options: ["Black", "Grey", "Red"],
        inventory: 20,
      },
    ],
  },
];

async function seedProducts() {
  const slugs = PRODUCT_SEEDS.map((p) => p.slug);
  const removed = await Product.deleteMany({ slug: { $nin: slugs } });
  if (removed.deletedCount > 0) {
    console.log(`  · Removed ${removed.deletedCount} legacy product(s)`);
  }

  for (const p of PRODUCT_SEEDS) {
    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          ...p,
          shortDescription: `LUCCI CRENO — ${p.name}`,
          description: `Crafted for the LUCCI CRENO wardrobe. ${p.name} belongs to our ${p.categories[0]} edit — genuine luxury you wear.`,
          currency: "USD",
          status: "published",
          inventory: 10,
          materialCare: "Follow care label. Store folded or on padded hanger.",
          shippingReturns: "Complimentary shipping. See returns policy.",
          tags: ["luxury", "atelier", p.categories[0].toLowerCase()],
          sortOrder: PRODUCT_SEEDS.indexOf(p),
        },
      },
      { upsert: true, new: true },
    );
  }
  console.log(`  ✓ Products (${PRODUCT_SEEDS.length})`);
}

function serviceSections(
  images: string[],
): Record<string, unknown>[] {
  return [
    {
      type: "heading",
      eyebrow: "Overview",
      heading: "What to Expect",
      body: "A personalised experience from first consultation to final fitting.",
      order: 0,
      enabled: true,
      images: [img(images[0], "Service overview")],
    },
    {
      type: "split",
      heading: "The Details",
      body: "Every stitch, seam, and silhouette is considered with your lifestyle in mind.",
      alignment: "split-left",
      order: 1,
      enabled: true,
      images: [
        img(images[1], "Detail one"),
        img(images[2], "Detail two"),
      ],
    },
    {
      type: "gallery",
      heading: "Portfolio",
      body: "Recent commissions and atelier moments.",
      order: 2,
      enabled: true,
      images: [
        img(images[3], "Portfolio one"),
        img(images[4], "Portfolio two"),
        img(images[0], "Portfolio three"),
      ],
    },
    {
      type: "text",
      heading: "Investment",
      body: "Pricing varies by fabric and complexity. Consultations are complimentary.",
      order: 3,
      enabled: true,
      images: [img(images[1], "Fabric swatches")],
    },
    {
      type: "cta",
      heading: "Begin Your Commission",
      ctaLabel: "Book Consultation",
      ctaHref: "/contact",
      order: 4,
      enabled: true,
      images: [img(images[2], "Consultation room")],
    },
  ];
}

const SERVICE_SEEDS = [
  {
    name: "Bespoke Tailoring",
    slug: "bespoke-tailoring",
    shortDescription: "One-of-a-kind garments cut and finished to your exact measurements.",
    featured: true,
    sortOrder: 0,
    heroImage: UNSPLASH.hero2,
    images: [
      UNSPLASH.atelier1,
      UNSPLASH.detail1,
      UNSPLASH.detail2,
      UNSPLASH.fashion3,
      UNSPLASH.luxury2,
    ],
  },
  {
    name: "Alterations & Refitting",
    slug: "alterations-refitting",
    shortDescription: "Expert alterations to perfect the fit of ready-to-wear and heirloom pieces.",
    featured: false,
    sortOrder: 1,
    heroImage: UNSPLASH.detail2,
    images: [
      UNSPLASH.detail3,
      UNSPLASH.atelier2,
      UNSPLASH.detail4,
      UNSPLASH.fashion6,
      UNSPLASH.luxury3,
    ],
  },
  {
    name: "Wardrobe Curation",
    slug: "wardrobe-curation",
    shortDescription: "Seasonal edits and capsule wardrobes tailored to your lifestyle.",
    featured: true,
    sortOrder: 2,
    heroImage: UNSPLASH.fashion1,
    images: [
      UNSPLASH.fashion2,
      UNSPLASH.fashion4,
      UNSPLASH.luxury1,
      UNSPLASH.editorial1,
      UNSPLASH.editorial4,
    ],
  },
  {
    name: "Bridal & Occasion",
    slug: "bridal-occasion",
    shortDescription: "Couture gowns and occasion wear for life's most memorable moments.",
    featured: true,
    sortOrder: 3,
    heroImage: UNSPLASH.editorial2,
    images: [
      UNSPLASH.editorial3,
      UNSPLASH.fashion1,
      UNSPLASH.detail3,
      UNSPLASH.luxury4,
      UNSPLASH.hero3,
    ],
  },
];

async function seedServices() {
  for (const s of SERVICE_SEEDS) {
    await Service.findOneAndUpdate(
      { slug: s.slug },
      {
        $set: {
          name: s.name,
          shortDescription: s.shortDescription,
          mainImage: img(s.heroImage, s.name),
          ctaLabel: "Explore",
          featured: s.featured,
          sortOrder: s.sortOrder,
          status: "published",
          detail: {
            hero: {
              eyebrow: "Atelier Service",
              title: s.name,
              subtitle: s.shortDescription,
              background: img(s.heroImage, `${s.name} hero`),
              image: img(s.images[0], s.name),
            },
            longIntroduction: `${s.shortDescription} Our master tailors guide you through every step.`,
            sections: serviceSections(s.images),
            seo: {
              title: `${s.name} — LUCCI CRENO`,
              description: s.shortDescription,
            },
          },
        },
      },
      { upsert: true, new: true },
    );
  }
  console.log(`  ✓ Services (${SERVICE_SEEDS.length})`);
}

const GALLERY_CATEGORIES = [
  {
    slug: "runway",
    name: "Runway",
    description: "Moments from our seasonal presentations.",
    sortOrder: 0,
  },
  {
    slug: "lookbook",
    name: "Lookbook",
    description: "Curated editorial stills from recent collections.",
    sortOrder: 1,
  },
  {
    slug: "atelier",
    name: "Behind the Atelier",
    description: "Craft, process, and the makers behind LUCCI CRENO.",
    sortOrder: 2,
  },
  {
    slug: "details",
    name: "Details",
    description: "Close studies of texture, stitch, and silhouette.",
    sortOrder: 3,
  },
];

const GALLERY_IMAGES: Record<
  string,
  { title: string; url: string; featured?: boolean }[]
> = {
  runway: [
    { title: "Opening Look", url: UNSPLASH.editorial2, featured: true },
    { title: "Silk Procession", url: UNSPLASH.editorial3 },
    { title: "Finale Bow", url: UNSPLASH.hero3 },
    { title: "Backstage Moment", url: UNSPLASH.fashion6 },
  ],
  lookbook: [
    { title: "Golden Hour", url: UNSPLASH.fashion1, featured: true },
    { title: "Urban Elegance", url: UNSPLASH.fashion2 },
    { title: "Evening Light", url: UNSPLASH.fashion4 },
    { title: "Minimal Luxe", url: UNSPLASH.fashion5 },
  ],
  atelier: [
    { title: "Pattern Table", url: UNSPLASH.atelier1, featured: true },
    { title: "Fitting Room", url: UNSPLASH.atelier2 },
    { title: "Hand Stitching", url: UNSPLASH.detail1 },
    { title: "Fabric Library", url: UNSPLASH.luxury2 },
  ],
  details: [
    { title: "Silk Weave", url: UNSPLASH.detail2, featured: true },
    { title: "Button Work", url: UNSPLASH.detail3 },
    { title: "Hem Finish", url: UNSPLASH.detail4 },
    { title: "Embroidery", url: UNSPLASH.luxury4 },
  ],
};

async function seedGallery() {
  const categoryIds: Record<string, mongoose.Types.ObjectId> = {};

  for (const cat of GALLERY_CATEGORIES) {
    const doc = await GalleryCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          status: "published",
        },
      },
      { upsert: true, new: true },
    );
    categoryIds[cat.slug] = doc._id;
  }

  let imageCount = 0;
  for (const [catSlug, images] of Object.entries(GALLERY_IMAGES)) {
    const categoryId = categoryIds[catSlug];
    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      await GalleryImage.findOneAndUpdate(
        { categoryId, title: item.title },
        {
          $set: {
            image: img(item.url, item.title),
            caption: item.title,
            featured: item.featured ?? false,
            orientation: "auto",
            sortOrder: i,
            status: "published",
          },
        },
        { upsert: true, new: true },
      );
      imageCount += 1;
    }
  }
  console.log(
    `  ✓ Gallery (${GALLERY_CATEGORIES.length} categories, ${imageCount} images)`,
  );
}

const TESTIMONIAL_SEEDS = [
  {
    name: "Elena Marchetti",
    role: "Creative Director",
    location: "New York",
    quote:
      "LUCCI CRENO transformed my wardrobe. Every piece fits like it was made for me — because it was.",
    portrait: UNSPLASH.portrait1,
    featured: true,
    sortOrder: 0,
  },
  {
    name: "James Whitfield",
    role: "Architect",
    location: "Philadelphia",
    quote:
      "The bespoke tailoring is exceptional. Impeccable construction and a team that truly listens.",
    portrait: UNSPLASH.portrait2,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Sophia Chen",
    role: "Gallery Owner",
    location: "San Francisco",
    quote:
      "My bridal gown was a work of art. I felt extraordinary on the most important day of my life.",
    portrait: UNSPLASH.portrait3,
    featured: false,
    sortOrder: 2,
  },
  {
    name: "Amara Okonkwo",
    role: "Editor-in-Chief",
    location: "London",
    quote:
      "Wardrobe curation changed how I dress for work and travel. Effortless elegance, every day.",
    featured: true,
    sortOrder: 3,
  },
  {
    name: "Victoria Hayes",
    role: "Philanthropist",
    location: "Washington DC",
    quote:
      "The atelier's attention to detail is unmatched. LUCCI CRENO is genuine luxury you can live in.",
    featured: false,
    sortOrder: 4,
  },
  {
    name: "Daniel Reyes",
    role: "Film Producer",
    location: "Los Angeles",
    quote:
      "From consultation to delivery, the experience felt personal and unhurried. Exactly what luxury should be.",
    featured: false,
    sortOrder: 5,
  },
];

async function seedTestimonials() {
  for (const t of TESTIMONIAL_SEEDS) {
    await Testimonial.findOneAndUpdate(
      { name: t.name },
      {
        $set: {
          role: t.role,
          location: t.location,
          quote: t.quote,
          portrait: t.portrait
            ? img(t.portrait, t.name)
            : undefined,
          featured: t.featured,
          sortOrder: t.sortOrder,
          status: "published",
        },
      },
      { upsert: true, new: true },
    );
  }
  console.log(`  ✓ Testimonials (${TESTIMONIAL_SEEDS.length})`);
}

const FAQ_CATEGORIES = [
  { slug: "orders-shipping", name: "Orders & Shipping", sortOrder: 0 },
  { slug: "services-fittings", name: "Services & Fittings", sortOrder: 1 },
];

const FAQ_SEEDS: Record<string, { question: string; answer: string }[]> = {
  "orders-shipping": [
    {
      question: "How long does shipping take?",
      answer:
        "Standard delivery is 5–7 business days. Express options are available at checkout.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes. International shipping rates and timelines are calculated at checkout.",
    },
    {
      question: "Is shipping complimentary?",
      answer: "Orders over $500 include complimentary insured shipping within the US.",
    },
    {
      question: "Can I track my order?",
      answer:
        "You will receive a tracking number by email once your order ships.",
    },
    {
      question: "What if my item arrives damaged?",
      answer:
        "Contact us within 48 hours with photos. We will arrange a replacement or refund.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer:
        "Complimentary gift wrapping is available — select the option at checkout.",
    },
  ],
  "services-fittings": [
    {
      question: "How do I book a fitting?",
      answer:
        "Email luccicreno873@yahoo.com or call 7174250354 to schedule a private appointment.",
    },
    {
      question: "Are consultations complimentary?",
      answer:
        "Initial consultations for bespoke and curation services are complimentary.",
    },
    {
      question: "How long does bespoke tailoring take?",
      answer:
        "Typical turnaround is 6–8 weeks depending on fabric availability and complexity.",
    },
    {
      question: "Can you alter garments not purchased from LUCCI CRENO?",
      answer:
        "Yes. We offer expert alterations on ready-to-wear and heirloom pieces.",
    },
    {
      question: "What is your return policy?",
      answer:
        "Unworn ready-to-wear items may be returned within 14 days. Bespoke pieces are final sale.",
    },
    {
      question: "Do you offer virtual consultations?",
      answer:
        "Yes. Virtual fittings are available for wardrobe curation and initial bespoke discussions.",
    },
  ],
};

async function seedFaqs() {
  const categoryIds: Record<string, mongoose.Types.ObjectId> = {};

  for (const cat of FAQ_CATEGORIES) {
    const doc = await FaqCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          sortOrder: cat.sortOrder,
          status: "published",
        },
      },
      { upsert: true, new: true },
    );
    categoryIds[cat.slug] = doc._id;
  }

  let faqCount = 0;
  for (const [catSlug, faqs] of Object.entries(FAQ_SEEDS)) {
    const categoryId = categoryIds[catSlug];
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      await Faq.findOneAndUpdate(
        { question: faq.question },
        {
          $set: {
            answer: faq.answer,
            categoryId,
            sortOrder: i,
            status: "published",
          },
        },
        { upsert: true, new: true },
      );
      faqCount += 1;
    }
  }
  console.log(`  ✓ FAQs (${FAQ_CATEGORIES.length} categories, ${faqCount} items)`);
}

const BLOG_SEEDS = [
  {
    slug: "art-of-bespoke-tailoring",
    title: "The Art of Bespoke Tailoring",
    excerpt: "Inside the LUCCI CRENO atelier — where every garment tells a story.",
    cover: UNSPLASH.atelier1,
    category: "Craft",
    tags: ["bespoke", "tailoring", "atelier"],
    readingMinutes: 6,
  },
  {
    slug: "summer-atelier-edit",
    title: "Summer Atelier Edit: 15% Seasonal Courtesy",
    excerpt: "Our curated selection of warm-weather essentials with seasonal courtesy.",
    cover: UNSPLASH.fashion1,
    category: "Collections",
    tags: ["seasonal", "edit", "summer"],
    readingMinutes: 4,
  },
  {
    slug: "fabric-guide-italian-silk",
    title: "Fabric Guide: Italian Silk",
    excerpt: "Why we source the finest Italian silks for our signature pieces.",
    cover: UNSPLASH.luxury2,
    category: "Materials",
    tags: ["silk", "fabric", "craft"],
    readingMinutes: 5,
  },
  {
    slug: "wardrobe-capsule-foundation",
    title: "Building a Capsule Wardrobe Foundation",
    excerpt: "Five essential pieces that anchor a timeless wardrobe.",
    cover: UNSPLASH.fashion2,
    category: "Style",
    tags: ["capsule", "wardrobe", "essentials"],
    readingMinutes: 7,
  },
];

function blogBlocks(
  cover: string,
  extraImages: string[],
): Record<string, unknown>[] {
  return [
    {
      type: "heading",
      eyebrow: "Journal",
      heading: "Introduction",
      body: "Welcome to the atelier journal — notes on craft, style, and the LUCCI CRENO philosophy.",
      order: 0,
      enabled: true,
      images: [],
    },
    {
      type: "image",
      heading: "Featured",
      body: "",
      order: 1,
      enabled: true,
      images: [img(cover, "Featured image")],
    },
    {
      type: "text",
      heading: "The Story",
      body: "Luxury is not loud. It is the weight of silk, the precision of a hand-finished seam, the confidence of a silhouette that belongs to you alone.",
      order: 2,
      enabled: true,
      images: [],
    },
    {
      type: "split",
      heading: "In Detail",
      body: "We believe in garments that endure — in construction, in style, and in the memories they accompany.",
      alignment: "split-right",
      order: 3,
      enabled: true,
      images: [
        img(extraImages[0], "Detail study one"),
        img(extraImages[1], "Detail study two"),
      ],
    },
    {
      type: "gallery",
      heading: "Visual Notes",
      order: 4,
      enabled: true,
      images: [
        img(extraImages[2], "Gallery one"),
        img(extraImages[0], "Gallery two"),
      ],
    },
    {
      type: "cta",
      heading: "Explore the Collection",
      ctaLabel: "Shop Now",
      ctaHref: "/shop",
      order: 5,
      enabled: true,
      images: [img(extraImages[1], "CTA image")],
    },
  ];
}

async function seedBlogPosts() {
  const blogImages = [
    [UNSPLASH.detail1, UNSPLASH.detail2, UNSPLASH.detail3],
    [UNSPLASH.fashion3, UNSPLASH.fashion4, UNSPLASH.fashion5],
    [UNSPLASH.luxury1, UNSPLASH.luxury3, UNSPLASH.luxury4],
    [UNSPLASH.editorial1, UNSPLASH.editorial3, UNSPLASH.editorial4],
  ];

  for (let i = 0; i < BLOG_SEEDS.length; i++) {
    const post = BLOG_SEEDS[i];
    await BlogPost.findOneAndUpdate(
      { slug: post.slug },
      {
        $set: {
          title: post.title,
          excerpt: post.excerpt,
          coverImage: img(post.cover, post.title),
          author: "LUCCI CRENO Atelier",
          category: post.category,
          tags: post.tags,
          publishDate: new Date(Date.now() - i * 86_400_000 * 7),
          status: "published",
          blocks: blogBlocks(post.cover, blogImages[i]),
          readingMinutes: post.readingMinutes,
          seo: {
            title: `${post.title} — LUCCI CRENO Journal`,
            description: post.excerpt,
            ogImage: post.cover,
          },
        },
      },
      { upsert: true, new: true },
    );
  }
  console.log(`  ✓ Blog posts (${BLOG_SEEDS.length})`);
}

async function main() {
  console.log("\n🌱 Seeding LUCCI CRENO database…\n");

  await mongoose.connect(MONGODB_URI!, {
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    await seedAdminUser();
    await seedSiteSettings();
    await seedPages();
    await seedProducts();
    await seedServices();
    await seedGallery();
    await seedTestimonials();
    await seedFaqs();
    await seedBlogPosts();

    console.log("\n✅ Seed complete (idempotent — safe to re-run).\n");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
