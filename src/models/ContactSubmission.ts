import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";

const ContactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    meta: {
      userAgent: { type: String, default: "" },
      ipHash: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export type ContactSubmissionDocument = InferSchemaType<
  typeof ContactSubmissionSchema
>;
export const ContactSubmission = getModel(
  "ContactSubmission",
  ContactSubmissionSchema,
);
