import type { Metadata } from "next";
import Link from "next/link";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Marquee } from "@/components/motion/marquee";
import { TextReveal } from "@/components/motion/text-reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { getPageBySlug } from "@/lib/queries/pages";
import { getSettings } from "@/lib/queries/settings";
import { safeQuery } from "@/lib/safe-query";
import type { PageData, SettingsData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("contact") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Contact",
    description:
      page?.seo?.description ??
      "Reach the LUCCI CRENO atelier for fittings, commissions, and private appointments.",
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    safeQuery(
      () => getPageBySlug("contact") as Promise<PageData | null>,
      null,
    ),
    safeQuery(() => getSettings() as Promise<SettingsData>, {}),
  ]);

  const formSection = page?.sections?.find((s) => s.key === "form");
  const locationSection = page?.sections?.find((s) => s.key === "location");

  const email = settings.email || "luccicreno873@yahoo.com";
  const handle = settings.socialHandle || "LUCCICRENO";

  const images = {
    hero: page?.hero?.background ?? settings.contactHeroImage,
    a: settings.contactHeroImage ?? page?.hero?.images?.[0],
    b: locationSection?.images?.[0] ?? page?.hero?.background,
    c: page?.hero?.images?.[0] ?? settings.contactHeroImage,
    d: page?.hero?.images?.[1] ?? locationSection?.images?.[0],
    e: page?.hero?.background,
  };

  const socials = [
    { label: "Instagram", href: settings.socialLinks?.instagram },
    { label: "Facebook", href: settings.socialLinks?.facebook },
    { label: "Pinterest", href: settings.socialLinks?.pinterest },
    { label: "Twitter", href: settings.socialLinks?.twitter },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <>
      <ServicesHero
        eyebrow={page?.hero?.eyebrow || "Get in Touch"}
        title={page?.hero?.title || "Contact"}
        subtitle={
          page?.hero?.subtitle ||
          "Private fittings, commissions, and atelier notes — we are listening."
        }
        background={images.hero}
      />

      <Marquee
        items={[
          "By Appointment",
          "Private Fittings",
          "Commissions",
          "Welcome Home",
          "LUCCI CRENO",
        ]}
        speed={36}
      />

      {/* Intro strip */}
      <section className="section-pad border-b border-border/70">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-gold">The Atelier</p>
            <TextReveal
              text="A conversation begins here"
              as="h2"
              className="mt-4 font-display text-3xl text-ink md:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                {formSection?.body ||
                  page?.hero?.body ||
                  "Share what you need — a fitting, a commission, or a quiet question. We reply within one business day."}
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-7">
            <ImageReveal className="relative col-span-2 aspect-[16/10] w-full sm:col-span-1 sm:aspect-[4/5]">
              <SafeImage src={images.a} alt="Atelier reception" fill sizes="40vw" />
            </ImageReveal>
            <ImageReveal
              delay={0.08}
              direction="right"
              className="relative col-span-2 aspect-[16/10] w-full sm:col-span-1 sm:mt-10 sm:aspect-[4/5]"
            >
              <SafeImage src={images.b} alt="Atelier exterior" fill sizes="40vw" />
            </ImageReveal>
          </div>
        </div>
      </section>

      {/* Form + details */}
      <section className="section-pad bg-cream/40">
        <div className="container-wide grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <p className="eyebrow text-gold">Message</p>
            <TextReveal
              text={formSection?.title || "Send a message"}
              as="h2"
              className="mt-3 font-display text-3xl text-ink md:text-4xl"
            />
            <Reveal delay={0.08} className="mt-8">
              <ContactForm />
            </Reveal>
          </div>

          <aside className="min-w-0 space-y-8 lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <div className="border border-border/80 bg-ivory/70 p-6 sm:p-8">
                <p className="eyebrow text-gold">Direct lines</p>
                <ul className="mt-6 space-y-5">
                  <li>
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                      Email
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block break-all text-lg text-ink no-underline transition-colors hover:text-ink-soft"
                    >
                      {email}
                    </a>
                  </li>
                  {settings.address ? (
                    <li>
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                        Location
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-ink">
                        {settings.address}
                      </p>
                    </li>
                  ) : null}
                  {settings.businessHours ? (
                    <li>
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                        Hours
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-muted">
                        {settings.businessHours}
                      </p>
                    </li>
                  ) : null}
                  <li>
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                      Social
                    </p>
                    <p className="mt-1 text-base text-ink">@{handle}</p>
                    {socials.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        {socials.map((s) => (
                          <li key={s.label}>
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[0.68rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft"
                            >
                              {s.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                </ul>
              </div>
            </Reveal>

            <ImageReveal className="relative aspect-[4/3] w-full overflow-hidden">
              <SafeImage
                src={images.c}
                alt="Contact editorial"
                fill
                sizes="40vw"
              />
            </ImageReveal>
          </aside>
        </div>
      </section>

      {/* Visit band */}
      <section className="relative min-h-[50vh] overflow-hidden md:min-h-[55vh]">
        <SafeImage
          src={images.d ?? images.b}
          alt="Visit the atelier"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="container-wide relative z-10 flex min-h-[50vh] flex-col justify-center py-16 md:min-h-[55vh]">
          <Reveal>
            <p className="eyebrow text-gold-soft">
              {locationSection?.title || "Visit"}
            </p>
            <h2 className="mt-4 max-w-xl font-display text-3xl text-ivory md:text-5xl">
              {locationSection?.body ||
                "The atelier welcomes you by appointment."}
            </h2>
            <p className="mt-5 max-w-md text-ivory/75">
              Private fittings and consultations — unhurried, considered, and
              entirely for you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Image mosaic — 5+ placements across page */}
      <section className="section-pad">
        <div className="container-wide">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow text-gold">Before you write</p>
            <TextReveal
              text="Perhaps this helps"
              as="h2"
              className="mt-3 font-display text-3xl text-ink md:text-4xl"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal className="space-y-4 lg:col-span-5">
              {[
                {
                  q: "How do I book a fitting?",
                  a: "Send a message with preferred dates — we will confirm a private slot.",
                },
                {
                  q: "Do you ship internationally?",
                  a: "Yes. Shipping details are confirmed with each order or commission.",
                },
                {
                  q: "Can I request alterations?",
                  a: "Alterations and refitting are among our atelier services.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="border-t border-border/80 pt-4 first:border-t-0 first:pt-0"
                >
                  <h3 className="font-display text-xl text-ink">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                </div>
              ))}
              <Link
                href="/faq"
                className="link-underline mt-4 inline-flex text-[0.72rem] uppercase tracking-[0.22em] text-ink no-underline"
              >
                View all FAQs →
              </Link>
            </Reveal>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-7">
              <ImageReveal className="relative aspect-[3/4] w-full">
                <SafeImage src={images.e} alt="Editorial one" fill sizes="30vw" />
              </ImageReveal>
              <ImageReveal
                delay={0.08}
                direction="up"
                className="relative mt-8 aspect-[3/4] w-full"
              >
                <SafeImage src={images.a} alt="Editorial two" fill sizes="30vw" />
              </ImageReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-ink px-4 py-16 text-ivory sm:px-6 md:py-20">
        <div className="container-wide flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl min-w-0">
            <p className="eyebrow text-gold">Welcome Home</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Something that feels forever starts with a note.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={`mailto:${email}`}
              className="btn-primary bg-gold text-center text-ink no-underline hover:bg-gold-soft"
            >
              Email us
            </a>
            <Link
              href="/services"
              className="btn-secondary border-ivory/40 text-center text-ivory no-underline hover:bg-ivory hover:text-ink"
            >
              View services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
