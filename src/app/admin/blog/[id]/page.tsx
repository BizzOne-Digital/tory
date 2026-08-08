import { notFound } from "next/navigation";
import { getAdminBlogPost } from "@/app/admin/actions/blog";
import { BlogForm } from "@/components/admin/BlogForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditBlogPage({ params }: Props) {
  const { id } = await params;
  const post = await getAdminBlogPost(id);
  if (!post) notFound();

  return (
    <BlogForm
      mode="edit"
      post={{
        ...post,
        _id: String(post._id),
        publishDate: post.publishDate,
      }}
    />
  );
}
