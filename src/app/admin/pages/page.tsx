import Link from "next/link";
import { getAdminPages } from "@/app/admin/actions/pages";
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
import { StatusBadge } from "@/components/admin/StatusBadge";

const PAGE_ORDER = [
  "home",
  "about",
  "services",
  "gallery",
  "testimonials",
  "faqs",
  "blog",
  "contact",
  "privacy",
  "terms",
  "shipping",
  "returns",
];

export default async function AdminPagesListPage() {
  const pages = await getAdminPages();
  const sorted = [...pages].sort((a, b) => {
    const ai = PAGE_ORDER.indexOf(a.slug);
    const bi = PAGE_ORDER.indexOf(b.slug);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Manage hero content, sections, and SEO for site pages."
      />

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Page</DataTableHeaderCell>
            <DataTableHeaderCell>Route</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell>Updated</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {sorted.length ? (
            sorted.map((page) => (
              <DataTableRow key={page.slug}>
                <DataTableCell>
                  <span className="font-medium">{page.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {page.slug}
                  </span>
                </DataTableCell>
                <DataTableCell>{page.route}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={page.status ?? "published"} />
                </DataTableCell>
                <DataTableCell className="text-muted">
                  {page.updatedAt
                    ? new Date(page.updatedAt).toLocaleDateString()
                    : "—"}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Link
                    href={`/admin/pages/${page.slug}`}
                    className="text-sm text-gold hover:underline"
                  >
                    Edit
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} message="No pages found. Run seed script." />
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
