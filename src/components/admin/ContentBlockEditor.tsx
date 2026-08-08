"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { ContentBlock } from "@/types/cms";
import { FormField } from "./FormField";
import { Select } from "./Select";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";
import { Toggle } from "./Toggle";
import { MultiImageUploader } from "./ImageUploader";

const BLOCK_TYPES = [
  "text",
  "heading",
  "quote",
  "image",
  "gallery",
  "cta",
  "split",
  "html",
] as const;

type ContentBlockEditorProps = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  uploadFolder: string;
};

export function ContentBlockEditor({
  blocks,
  onChange,
  uploadFolder,
}: ContentBlockEditorProps) {
  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function update(index: number, patch: Partial<ContentBlock>) {
    const next = [...sorted];
    next[index] = { ...next[index], ...patch };
    onChange(next.map((b, i) => ({ ...b, order: i })));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((b, i) => ({ ...b, order: i })));
  }

  function remove(index: number) {
    onChange(
      sorted.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })),
    );
  }

  function add() {
    onChange([
      ...sorted,
      {
        type: "text",
        eyebrow: "",
        heading: "",
        body: "",
        alignment: "left",
        ctaLabel: "",
        ctaHref: "",
        images: [],
        enabled: true,
        order: sorted.length,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      {sorted.map((block, index) => (
        <div
          key={block._id?.toString() ?? `block-${index}`}
          className="rounded-sm border border-border bg-white p-4"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Block {index + 1}
              </span>
              <Toggle
                checked={block.enabled !== false}
                onChange={(enabled) => update(index, { enabled })}
                label="Enabled"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-sm p-1.5 hover:bg-stone-50 disabled:opacity-40"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === sorted.length - 1}
                className="rounded-sm p-1.5 hover:bg-stone-50 disabled:opacity-40"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-sm p-1.5 text-red-700 hover:bg-red-50"
                aria-label="Remove block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Type">
              <Select
                value={block.type}
                onChange={(e) =>
                  update(index, {
                    type: e.target.value as ContentBlock["type"],
                  })
                }
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Alignment">
              <Select
                value={block.alignment ?? "left"}
                onChange={(e) =>
                  update(index, {
                    alignment: e.target.value as ContentBlock["alignment"],
                  })
                }
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="center">Center</option>
                <option value="split-left">Split left</option>
                <option value="split-right">Split right</option>
              </Select>
            </FormField>
            <FormField label="Eyebrow">
              <TextInput
                value={block.eyebrow ?? ""}
                onChange={(e) => update(index, { eyebrow: e.target.value })}
              />
            </FormField>
            <FormField label="Heading">
              <TextInput
                value={block.heading ?? ""}
                onChange={(e) => update(index, { heading: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Body" className="mt-4">
            <TextArea
              value={block.body ?? ""}
              onChange={(e) => update(index, { body: e.target.value })}
              rows={5}
            />
          </FormField>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="CTA label">
              <TextInput
                value={block.ctaLabel ?? ""}
                onChange={(e) => update(index, { ctaLabel: e.target.value })}
              />
            </FormField>
            <FormField label="CTA href">
              <TextInput
                value={block.ctaHref ?? ""}
                onChange={(e) => update(index, { ctaHref: e.target.value })}
              />
            </FormField>
          </div>

          <div className="mt-4">
            <MultiImageUploader
              folder={uploadFolder}
              value={block.images ?? []}
              onChange={(images) => update(index, { images })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-4 py-2 text-sm hover:bg-stone-50"
      >
        <Plus className="h-4 w-4" />
        Add block
      </button>
    </div>
  );
}
