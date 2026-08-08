import Link from "next/link";
import { getAdminServices } from "@/app/admin/actions/services";
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

export default async function AdminServicesPage() {
  const services = await getAdminServices();

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage listing cards and detail pages for atelier services."
        actions={
          <Link
            href="/admin/services/new"
            className="rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory"
          >
            New service
          </Link>
        }
      />

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Service</DataTableHeaderCell>
            <DataTableHeaderCell>Sort</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {services.length ? (
            services.map((service) => (
              <DataTableRow key={String(service._id)}>
                <DataTableCell>
                  <Link
                    href={`/admin/services/${service._id}`}
                    className="font-medium hover:underline"
                  >
                    {service.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted">
                    /services/{service.slug}
                  </span>
                </DataTableCell>
                <DataTableCell>{service.sortOrder ?? 0}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={service.status ?? "draft"} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Link
                    href={`/admin/services/${service._id}`}
                    className="text-sm text-gold hover:underline"
                  >
                    Edit
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={4} message="No services yet." />
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
