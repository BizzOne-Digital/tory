import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ImageMetaSchema, SeoSchema } from "./shared";

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "default" },
    brandName: { type: String, default: "LUCCI CRENO" },
    shortStatement: {
      type: String,
      default: "Create genuine luxury you wear…",
    },
    email: { type: String, default: "luccicreno873@yahoo.com" },
    phone: { type: String, default: "" },
    socialHandle: { type: String, default: "LUCCICRENO" },
    socialLinks: {
      instagram: { type: String, default: "https://instagram.com/LUCCICRENO" },
      facebook: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    address: { type: String, default: "Atelier District — By appointment" },
    locationEnabled: { type: Boolean, default: true },
    businessHours: {
      type: String,
      default: "Mon–Sat · 10:00–18:00 · Private fittings by appointment",
    },
    footerDescription: {
      type: String,
      default:
        "Timeless wearable luxury crafted for those who prefer enduring elegance over fleeting trends.",
    },
    footerNavGroups: [
      {
        title: String,
        links: [{ label: String, href: String }],
      },
    ],
    currency: { type: String, default: "USD" },
    seasonalOffer: {
      active: { type: Boolean, default: true },
      text: {
        type: String,
        default: "Summer Atelier Edit — select pieces with seasonal courtesy.",
      },
      discountPercent: { type: Number, default: 15 },
      ctaLabel: { type: String, default: "Shop the edit" },
      ctaHref: { type: String, default: "/shop" },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    newsletterCta: {
      type: String,
      default: "Enter the circle — private previews and atelier notes.",
    },
    defaultSeo: { type: SeoSchema, default: () => ({}) },
    logoDisplay: {
      showWordmark: { type: Boolean, default: true },
      showMonogram: { type: Boolean, default: true },
    },
    contactHeroImage: { type: ImageMetaSchema },
  },
  { timestamps: true },
);

export type SiteSettingsDocument = InferSchemaType<typeof SiteSettingsSchema>;

export const SiteSettings = getModel("SiteSettings", SiteSettingsSchema);
