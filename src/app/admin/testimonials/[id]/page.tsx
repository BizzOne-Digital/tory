import { notFound } from "next/navigation";
import { getAdminTestimonial } from "@/app/admin/actions/testimonials";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditTestimonialPage({ params }: Props) {
  const { id } = await params;
  const testimonial = await getAdminTestimonial(id);
  if (!testimonial) notFound();
  return <TestimonialForm mode="edit" testimonial={testimonial} />;
}
