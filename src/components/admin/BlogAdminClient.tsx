"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { TextInput } from "@/components/admin/TextInput";

type BlogRow = {
  _id: string;
  title: string;
  slug: string;
  status?: string;
  publishDate?: string;
  updatedAt?: string;
};

export function BlogAdminClient({ posts }: { posts: BlogRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (status !== "all" && post.status !== status) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        post.title.toLowerCase().includes(needle) ||
        post.slug.toLowerCase().includes(needle)
      );
    });
  }, [posts, q, status]);

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Journal posts with rich content blocks."
        actions={
          <Link
            href="/admin/blog/new"
            className="rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory"
          >
            New post
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search posts…"
          className="max-w-sm"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Title</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell>Updated</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {filtered.length ? (
            filtered.map((post) => (
              <DataTableRow key={post._id}>
                <DataTableCell>
                  <Link
                    href={`/admin/blog/${post._id}`}
                    className="font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted">
                    /blog/{post.slug}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={post.status ?? "draft"} />
                </DataTableCell>
                <DataTableCell className="text-muted">
                  {post.updatedAt
                    ? new Date(post.updatedAt).toLocaleDateString()
                    : "—"}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Link
                    href={`/admin/blog/${post._id}`}
                    className="text-sm text-gold hover:underline"
                  >
                    Edit
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={4} message="No posts found." />
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
