"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  archiveMessage,
  deleteMessage,
  markMessageRead,
} from "@/app/admin/actions/messages";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { useState } from "react";

type MessageDetailProps = {
  message: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    read?: boolean;
    createdAt?: string;
  };
};

export function MessageDetailClient({ message }: MessageDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!message.read) {
      void markMessageRead(message._id, true);
    }
  }, [message._id, message.read]);

  async function handleArchive() {
    setLoading(true);
    const result = await archiveMessage(message._id);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Archived", "success");
    router.push("/admin/messages");
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteMessage(message._id);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Deleted", "success");
    router.push("/admin/messages");
  }

  return (
    <div>
      <PageHeader
        title={message.subject || "Contact message"}
        description={`From ${message.name} · ${message.email}`}
        backHref="/admin/messages"
        backLabel="All messages"
        actions={<StatusBadge status={message.read ? "read" : "unread"} />}
      />

      <article className="rounded-sm border border-border bg-white p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted">Name</dt>
            <dd className="mt-1">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted">Email</dt>
            <dd className="mt-1">{message.email}</dd>
          </div>
          {message.phone ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Phone</dt>
              <dd className="mt-1">{message.phone}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted">Received</dt>
            <dd className="mt-1">
              {message.createdAt
                ? new Date(message.createdAt).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-border pt-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleArchive()}
          className="rounded-sm border border-border bg-white px-4 py-2 text-sm"
        >
          Archive
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setDeleteOpen(true)}
          className="rounded-sm bg-red-700 px-4 py-2 text-sm text-white"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete message?"
        destructive
        loading={loading}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
