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
import { formatMoney } from "@/lib/money";

type OrderRow = {
  _id: string;
  orderNumber: string;
  customer?: { name?: string; email?: string };
  totalMinor: number;
  currency?: string;
  status: string;
  createdAt?: string;
};

export function OrdersAdminClient({ orders }: { orders: OrderRow[] }) {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(needle) ||
        order.customer?.email?.toLowerCase().includes(needle) ||
        order.customer?.name?.toLowerCase().includes(needle)
      );
    });
  }, [orders, status, q]);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Review and update order status. Line item snapshots are never recalculated."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order #, customer…"
          className="max-w-sm"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Order</DataTableHeaderCell>
            <DataTableHeaderCell>Customer</DataTableHeaderCell>
            <DataTableHeaderCell>Total</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell>Date</DataTableHeaderCell>
            <DataTableHeaderCell />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {filtered.length ? (
            filtered.map((order) => (
              <DataTableRow key={order._id}>
                <DataTableCell className="font-medium">
                  {order.orderNumber}
                </DataTableCell>
                <DataTableCell>
                  <span>{order.customer?.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {order.customer?.email}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  {formatMoney(order.totalMinor, order.currency)}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={order.status} />
                </DataTableCell>
                <DataTableCell className="text-muted">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "—"}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="text-sm text-gold hover:underline"
                  >
                    View
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            <EmptyRow colSpan={6} message="No orders found." />
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
