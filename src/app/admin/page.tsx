import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { connectDB } from "@/lib/db/connect";
import { formatMoney } from "@/lib/money";
import {
  BlogPost,
  ContactSubmission,
  Faq,
  GalleryImage,
  Order,
  Page,
  Product,
  Service,
  Testimonial,
} from "@/models";

export default async function AdminDashboardPage() {
  await connectDB();

  const [
    productCount,
    activeServices,
    galleryImages,
    testimonialCount,
    faqCount,
    blogPublished,
    blogDraft,
    orderCounts,
    unreadMessages,
    recentPages,
    recentProducts,
    recentOrders,
  ] = await Promise.all([
    Product.countDocuments({ status: { $ne: "archived" } }),
    Service.countDocuments({ status: "published" }),
    GalleryImage.countDocuments({ status: "published" }),
    Testimonial.countDocuments({ status: "published" }),
    Faq.countDocuments({ status: "published" }),
    BlogPost.countDocuments({ status: "published" }),
    BlogPost.countDocuments({ status: "draft" }),
    Order.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    ContactSubmission.countDocuments({ read: false, archived: false }),
    Page.find().sort({ updatedAt: -1 }).limit(5).lean(),
    Product.find().sort({ updatedAt: -1 }).limit(5).lean(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const ordersByStatus = Object.fromEntries(
    orderCounts.map((row) => [row._id, row.count]),
  );

  const stats = [
    {
      label: "Products",
      value: productCount,
      href: "/admin/products",
      icon: ShoppingBag,
    },
    {
      label: "Active services",
      value: activeServices,
      href: "/admin/services",
      icon: Sparkles,
    },
    {
      label: "Gallery images",
      value: galleryImages,
      href: "/admin/gallery",
      icon: ImageIcon,
    },
    {
      label: "Testimonials",
      value: testimonialCount,
      href: "/admin/testimonials",
      icon: Star,
    },
    { label: "FAQs", value: faqCount, href: "/admin/faqs", icon: HelpCircle },
    {
      label: "Blog published",
      value: blogPublished,
      href: "/admin/blog",
      icon: BookOpen,
    },
    {
      label: "Blog drafts",
      value: blogDraft,
      href: "/admin/blog?status=draft",
      icon: BookOpen,
    },
    {
      label: "Unread messages",
      value: unreadMessages,
      href: "/admin/messages?read=unread",
      icon: MessageSquare,
    },
  ];

  const quickActions = [
    { label: "Edit home page", href: "/admin/pages/home" },
    { label: "Add product", href: "/admin/products/new" },
    { label: "New service", href: "/admin/services/new" },
    { label: "Site settings", href: "/admin/settings" },
    { label: "View orders", href: "/admin/orders" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of your LUCCI CRENO site content and commerce."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-sm border border-border bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-3xl text-ink">
                    {stat.value}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-gold" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Orders by status</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "completed",
              "cancelled",
            ].map((status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-sm bg-[#faf8f5] px-3 py-2"
              >
                <dt className="text-sm capitalize text-muted">{status}</dt>
                <dd className="font-medium text-ink">
                  {ordersByStatus[status] ?? 0}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-sm text-gold hover:underline"
          >
            Manage orders →
          </Link>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm hover:bg-[#faf8f5]"
                >
                  {action.label}
                  <span className="text-gold">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-lg text-ink">Recent page updates</h2>
          <ul className="mt-4 space-y-3">
            {recentPages.length ? (
              recentPages.map((page) => (
                <li key={String(page._id)}>
                  <Link
                    href={`/admin/pages/${page.slug}`}
                    className="block text-sm hover:underline"
                  >
                    <span className="font-medium">{page.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {page.updatedAt
                        ? new Date(page.updatedAt).toLocaleString()
                        : "—"}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No pages yet.</li>
            )}
          </ul>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-lg text-ink">Recent products</h2>
          <ul className="mt-4 space-y-3">
            {recentProducts.length ? (
              recentProducts.map((product) => (
                <li key={String(product._id)}>
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="flex items-center justify-between gap-2 text-sm hover:underline"
                  >
                    <span>{product.name}</span>
                    <StatusBadge status={product.status ?? "draft"} />
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No products yet.</li>
            )}
          </ul>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-lg text-ink">Recent orders</h2>
          <ul className="mt-4 space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <li key={String(order._id)}>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="block text-sm hover:underline"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="mt-0.5 block text-xs text-muted">
                      {formatMoney(order.totalMinor, order.currency)} ·{" "}
                      {order.customer?.name}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No orders yet.</li>
            )}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Package className="h-4 w-4" />
            Order line snapshots are preserved on status changes.
          </div>
        </section>
      </div>
    </div>
  );
}
