import { getAdminBlogPosts } from "@/app/admin/actions/blog";
import { BlogAdminClient } from "@/components/admin/BlogAdminClient";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();
  return (
    <BlogAdminClient
      posts={posts.map((p) => ({
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        status: p.status,
        publishDate: p.publishDate,
        updatedAt: p.updatedAt,
      }))}
    />
  );
}
