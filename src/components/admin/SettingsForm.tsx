"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveSiteSettings } from "@/app/admin/actions/settings";
import { FormField } from "@/components/admin/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import type { ImageMeta } from "@/models/shared";
import type { SettingsData } from "@/types/cms";

export function SettingsForm({ settings }: { settings: SettingsData & { _id?: string } }) {
  const { toast } = useToast();
  const router = useRouter();

  const [brandName, setBrandName] = useState(settings.brandName ?? "");
  const [shortStatement, setShortStatement] = useState(settings.shortStatement ?? "");
  const [email, setEmail] = useState(settings.email ?? "");
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [socialHandle, setSocialHandle] = useState(settings.socialHandle ?? "");
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram ?? "");
  const [facebook, setFacebook] = useState(settings.socialLinks?.facebook ?? "");
  const [pinterest, setPinterest] = useState(settings.socialLinks?.pinterest ?? "");
  const [twitter, setTwitter] = useState(settings.socialLinks?.twitter ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [locationEnabled, setLocationEnabled] = useState(
    settings.locationEnabled ?? true,
  );
  const [businessHours, setBusinessHours] = useState(settings.businessHours ?? "");
  const [footerDescription, setFooterDescription] = useState(
    settings.footerDescription ?? "",
  );
  const [currency, setCurrency] = useState(settings.currency ?? "USD");
  const [offerActive, setOfferActive] = useState(
    settings.seasonalOffer?.active ?? false,
  );
  const [offerText, setOfferText] = useState(settings.seasonalOffer?.text ?? "");
  const [offerPercent, setOfferPercent] = useState(
    String(settings.seasonalOffer?.discountPercent ?? 0),
  );
  const [offerCtaLabel, setOfferCtaLabel] = useState(
    settings.seasonalOffer?.ctaLabel ?? "",
  );
  const [offerCtaHref, setOfferCtaHref] = useState(
    settings.seasonalOffer?.ctaHref ?? "",
  );
  const [newsletterCta, setNewsletterCta] = useState(settings.newsletterCta ?? "");
  const [seoTitle, setSeoTitle] = useState(settings.defaultSeo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    settings.defaultSeo?.description ?? "",
  );
  const [showWordmark, setShowWordmark] = useState(
    settings.logoDisplay?.showWordmark ?? true,
  );
  const [showMonogram, setShowMonogram] = useState(
    settings.logoDisplay?.showMonogram ?? true,
  );
  const [contactHeroImage, setContactHeroImage] = useState<ImageMeta | null>(
    settings.contactHeroImage ?? null,
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await saveSiteSettings({
      brandName,
      shortStatement,
      email,
      phone,
      socialHandle,
      socialLinks: { instagram, facebook, pinterest, twitter },
      address,
      locationEnabled,
      businessHours,
      footerDescription,
      footerNavGroups: settings.footerNavGroups ?? [],
      currency,
      seasonalOffer: {
        active: offerActive,
        text: offerText,
        discountPercent: Number(offerPercent) || 0,
        ctaLabel: offerCtaLabel,
        ctaHref: offerCtaHref,
      },
      newsletterCta,
      defaultSeo: {
        title: seoTitle,
        description: seoDescription,
        ogImage: settings.defaultSeo?.ogImage ?? "",
        canonical: "",
      },
      logoDisplay: { showWordmark, showMonogram },
      contactHeroImage: contactHeroImage
        ? {
            url: contactHeroImage.url,
            alt: contactHeroImage.alt ?? "",
            caption: contactHeroImage.caption ?? "",
          }
        : undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      return;
    }
    setSaved(true);
    toast("Settings saved", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Global site configuration, contact details, offers, and default SEO."
      />

      <div className="space-y-8">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Brand</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Brand name">
              <TextInput value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </FormField>
            <FormField label="Currency">
              <TextInput value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </FormField>
            <FormField label="Short statement" className="sm:col-span-2">
              <TextArea
                value={shortStatement}
                onChange={(e) => setShortStatement(e.target.value)}
              />
            </FormField>
            <Toggle
              checked={showWordmark}
              onChange={setShowWordmark}
              label="Show wordmark"
            />
            <Toggle
              checked={showMonogram}
              onChange={setShowMonogram}
              label="Show monogram"
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Email">
              <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="Address" className="sm:col-span-2">
              <TextInput value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormField>
            <FormField label="Business hours" className="sm:col-span-2">
              <TextInput
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
              />
            </FormField>
            <Toggle
              checked={locationEnabled}
              onChange={setLocationEnabled}
              label="Show location"
            />
          </div>
          <div className="mt-4">
            <ImageUploader
              folder="settings"
              label="Contact hero image"
              value={contactHeroImage}
              onChange={setContactHeroImage}
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Social</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Handle">
              <TextInput
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
              />
            </FormField>
            <FormField label="Instagram">
              <TextInput value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </FormField>
            <FormField label="Facebook">
              <TextInput value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </FormField>
            <FormField label="Pinterest">
              <TextInput value={pinterest} onChange={(e) => setPinterest(e.target.value)} />
            </FormField>
            <FormField label="Twitter / X">
              <TextInput value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Footer & offers</h2>
          <div className="mt-4 space-y-4">
            <FormField label="Footer description">
              <TextArea
                value={footerDescription}
                onChange={(e) => setFooterDescription(e.target.value)}
              />
            </FormField>
            <FormField label="Newsletter CTA">
              <TextInput
                value={newsletterCta}
                onChange={(e) => setNewsletterCta(e.target.value)}
              />
            </FormField>
            <Toggle
              checked={offerActive}
              onChange={setOfferActive}
              label="Seasonal offer active"
            />
            <FormField label="Offer text">
              <TextArea value={offerText} onChange={(e) => setOfferText(e.target.value)} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Discount %">
                <TextInput
                  type="number"
                  value={offerPercent}
                  onChange={(e) => setOfferPercent(e.target.value)}
                />
              </FormField>
              <FormField label="CTA label">
                <TextInput
                  value={offerCtaLabel}
                  onChange={(e) => setOfferCtaLabel(e.target.value)}
                />
              </FormField>
              <FormField label="CTA href">
                <TextInput
                  value={offerCtaHref}
                  onChange={(e) => setOfferCtaHref(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-xl text-ink">Default SEO</h2>
          <div className="mt-4 grid gap-4">
            <FormField label="Meta title">
              <TextInput value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </FormField>
            <FormField label="Meta description">
              <TextArea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </FormField>
          </div>
        </section>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
