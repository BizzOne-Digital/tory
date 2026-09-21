"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  serializeDoc,
  type ActionResult,
} from "@/lib/admin/action-result";
import { requireSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { ContactSubmission } from "@/models";

export async function getAdminMessages(filters?: {
  read?: "all" | "unread" | "read";
  archived?: boolean;
}) {
  await requireSession();
  await connectDB();

  const query: Record<string, unknown> = {
    archived: filters?.archived ?? false,
  };
  if (filters?.read === "unread") query.read = false;
  if (filters?.read === "read") query.read = true;

  const messages = await ContactSubmission.find(query)
    .sort({ createdAt: -1 })
    .lean();
  return serializeDoc(messages);
}

export async function getAdminMessage(id: string) {
  await requireSession();
  await connectDB();
  const message = await ContactSubmission.findById(id).lean();
  if (!message) return null;
  return serializeDoc(message);
}

export async function markMessageRead(
  id: string,
  read = true,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const message = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: { read } },
      { new: true },
    );
    if (!message) return actionError("Message not found");

    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${id}`);
    return actionSuccess(undefined, read ? "Marked as read" : "Marked as unread");
  } catch {
    return actionError("Failed to update message");
  }
}

export async function archiveMessage(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const message = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: { archived: true, read: true } },
      { new: true },
    );
    if (!message) return actionError("Message not found");

    revalidatePath("/admin/messages");
    return actionSuccess(undefined, "Message archived");
  } catch {
    return actionError("Failed to archive message");
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const message = await ContactSubmission.findByIdAndDelete(id);
    if (!message) return actionError("Message not found");

    revalidatePath("/admin/messages");
    return actionSuccess(undefined, "Message deleted");
  } catch {
    return actionError("Failed to delete message");
  }
}

export async function getUnreadMessageCount() {
  await requireSession();
  await connectDB();
  return ContactSubmission.countDocuments({ read: false, archived: false });
}
