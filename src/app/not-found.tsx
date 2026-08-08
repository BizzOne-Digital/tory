import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 -z-10">
        <SafeImage
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
          alt=""
          fill
          sizes="100vw"
          className="opacity-20"
        />
      </div>
      <p className="eyebrow text-gold">404</p>
      <h1 className="mt-4 font-display text-5xl text-ink md:text-6xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted">
        The page you sought has left the atelier. Return home or explore the collection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary no-underline">
          Welcome home
        </Link>
        <Link href="/shop" className="btn-secondary no-underline">
          Shop collection
        </Link>
      </div>
    </div>
  );
}
