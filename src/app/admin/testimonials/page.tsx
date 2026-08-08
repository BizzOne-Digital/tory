import { getAdminTestimonials } from "@/app/admin/actions/testimonials";
import { TestimonialsAdminClient } from "@/components/admin/TestimonialsAdminClient";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();
  return <TestimonialsAdminClient testimonials={testimonials} />;
}
