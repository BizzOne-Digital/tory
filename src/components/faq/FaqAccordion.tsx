"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { FaqCategoryData, FaqData } from "@/types/cms";

type FaqAccordionProps = {
  categories: FaqCategoryData[];
  faqs: FaqData[];
};

export function FaqAccordion({ categories, faqs }: FaqAccordionProps) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c._id, c.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  return (
    <div>
      <label className="mb-8 block">
        <span className="eyebrow mb-2 block">Search FAQs</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Orders, fittings, care, returns…"
          className="w-full border border-border bg-ivory px-4 py-3 text-sm outline-none focus:border-gold md:max-w-xl"
        />
      </label>

      <div className="divide-y divide-border border-y border-border">
        {filtered.length ? (
          filtered.map((faq, i) => {
            const open = openId === faq._id;
            const panelId = `faq-panel-${faq._id}`;
            return (
              <Reveal key={faq._id} delay={i * 0.03}>
                <div className="py-5">
                  <button
                    type="button"
                    id={`faq-trigger-${faq._id}`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full items-start justify-between gap-6 text-left"
                    onClick={() => setOpenId(open ? null : faq._id)}
                  >
                    <span>
                      {faq.categoryId ? (
                        <span className="eyebrow mb-2 block text-gold">
                          {categoryMap.get(faq.categoryId) ?? "General"}
                        </span>
                      ) : null}
                      <span className="font-display text-xl text-ink">{faq.question}</span>
                    </span>
                    <span className="text-gold">{open ? "−" : "+"}</span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`faq-trigger-${faq._id}`}
                    hidden={!open}
                    className={cn("overflow-hidden transition-all", open ? "mt-4" : "")}
                  >
                    <div
                      className="max-w-3xl text-muted leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichText(faq.answer),
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            );
          })
        ) : (
          <p className="py-10 text-muted">No questions match your search.</p>
        )}
      </div>
    </div>
  );
}
