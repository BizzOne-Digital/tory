import type { Model, Schema } from "mongoose";
import mongoose from "mongoose";

/** Prevent model recompilation during Next.js hot reload. */
export function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}
