import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
  variantLabel: z.string().trim().max(200).default(""),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(200, "Name is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .max(254),
    phone: z.string().trim().max(30, "Phone number is too long").default(""),
  }),
  shipping: z.object({
    line1: z
      .string()
      .trim()
      .min(1, "Address line is required")
      .max(200, "Address is too long"),
    line2: z.string().trim().max(200, "Address line is too long").default(""),
    city: z
      .string()
      .trim()
      .min(1, "City is required")
      .max(100, "City is too long"),
    region: z.string().trim().max(100, "Region is too long").default(""),
    postalCode: z
      .string()
      .trim()
      .min(1, "Postal code is required")
      .max(20, "Postal code is too long"),
    country: z
      .string()
      .trim()
      .min(2, "Country is required")
      .max(100, "Country is too long"),
    notes: z.string().trim().max(500, "Notes are too long").default(""),
  }),
  items: z
    .array(checkoutItemSchema)
    .min(1, "Cart cannot be empty")
    .max(50, "Too many line items"),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
