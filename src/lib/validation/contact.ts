import { z } from "zod";

export const contactSchema = z.object({
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
  subject: z.string().trim().max(200, "Subject is too long").default(""),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactInput = z.infer<typeof contactSchema>;
