"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  archiveMessage,
  deleteMessage,
  markMessageRead,
} from "@/app/admin/actions/messages";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  EmptyRow,
} from "@/components/admin/DataTable";
import { Select } from "@/components/admin/Select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";

type MessageRow = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: boolean;
  createdAt?: string;
};

export function MessagesAdminClient({ messages }: { messages: MessageRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [readFilter, setReadFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (readFilter === "unread") return !m.read;
      if (readFilter === "read") return m.read;
      return true;
    });
  }, [messages, readFilter]);

  async function toggleRead(id: string, read: boolean) {
    setLoading(true);
    const result = await markMessageRead(id, read);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast(result.message ?? "Updated", "success");
    router.refresh();
  }

  async function handleArchive(id: string) {
    setLoading(true);
    const result = await archiveMessage(id);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Message archived", "success");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteMessage(deleteId);
    setLoading(false);
    setDeleteId(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Message deleted", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        description="Inquiries from the contact form."
      />

      <div className="mb-4">
        <Select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </Select>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>From</DataTableHeaderCell>
            <DataTableHeaderCell>Subject</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell>Date</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {filtered.length ? (
            filtered.map((message) => (
              <DataTableRow key={message._id}>
                <DataTableCell>
                  <Link
                    href={`/admin/messages/${message._id}`}
                    className="font-medium hover:underline"
                  >
                    {message.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted">
                    {message.email}
                  </span>
                </DataTableCell>
                <DataTableCell>{message.subject || "—"}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={message.read ? "read" : "unread"} />
                </DataTableCell>
                <DataTableCell className="text-muted">
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleDateString()
                    : "—"}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex justify-end gap-2 text-sm">
                    <Link
                      href={`/admin/messages/${message._id}`}
                      className="text-gold hover:underline"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        void toggleRead(message._id, !message.read)
                      }
                      className="text-muted hover:text-ink"
                    >
                      {message.read ? "Unread" : "Read"}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void handleArchive(message._id)}
                      className="text-muted hover:text-ink"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setDeleteId(message._id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} message="No messages." />
          )}
        </DataTableBody>
      </DataTable>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete message?"
        description="This permanently removes the message."
        confirmLabel="Delete"
        destructive
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
