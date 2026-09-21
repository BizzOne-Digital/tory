"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ImageMeta } from "@/models/shared";
import { cn } from "@/lib/utils";
import { TextInput } from "./TextInput";

type ImageUploaderProps = {
  folder: string;
  value?: ImageMeta | null;
  onChange: (image: ImageMeta | null) => void;
  label?: string;
  className?: string;
};

export function ImageUploader({
  folder,
  value,
  onChange,
  label = "Image",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("alt", value?.alt ?? "");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      onChange(data.image as ImageMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft/80">
        {label}
      </p>
      {value?.url ? (
        <div className="relative overflow-hidden rounded-sm border border-border bg-white">
          <div className="relative aspect-[4/3] max-h-48 w-full">
            <Image
              src={value.url}
              alt={value.alt || "Uploaded image"}
              fill
              className="object-cover"
              sizes="320px"
            />
          </div>
          <div className="space-y-2 border-t border-border p-3">
            <TextInput
              value={value.alt ?? ""}
              onChange={(e) =>
                onChange({ ...value, alt: e.target.value })
              }
              placeholder="Alt text"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-white px-4 py-8 text-sm text-muted hover:border-gold hover:text-ink disabled:opacity-60"
        >
          <ImagePlus className="h-6 w-6" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

type MultiImageUploaderProps = {
  folder: string;
  value: ImageMeta[];
  onChange: (images: ImageMeta[]) => void;
  label?: string;
};

export function MultiImageUploader({
  folder,
  value,
  onChange,
  label = "Images",
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError("");
    const uploaded: ImageMeta[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? "Upload failed");
        }
        uploaded.push(data.image as ImageMeta);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft/80">
          {label}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-gold hover:underline disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Add images"}
        </button>
      </div>
      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className="relative overflow-hidden rounded-sm border border-border bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={img.url}
                  alt={img.alt || "Image"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="space-y-1 p-2">
                <TextInput
                  value={img.alt ?? ""}
                  onChange={(e) => {
                    const next = [...value];
                    next[index] = { ...img, alt: e.target.value };
                    onChange(next);
                  }}
                  placeholder="Alt"
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-[0.65rem] text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No images yet.</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
