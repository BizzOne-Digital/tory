import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";

const AdminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Administrator" },
    role: { type: String, enum: ["admin"], default: "admin" },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema> & {
  _id: Schema.Types.ObjectId;
};

export const AdminUser = getModel("AdminUser", AdminUserSchema);
