"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import { cn } from "@/lib/utils";

export function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactInput) {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Unable to send message");
      }
      setStatus("success");
      setMessage("Thank you — we will respond within one business day.");
      reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-5", className)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            className="field-input"
            autoComplete="name"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            className="field-input"
            autoComplete="email"
            placeholder="you@email.com"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone")}
            className="field-input"
            autoComplete="tel"
            placeholder="Optional"
          />
        </Field>
        <Field label="Subject" error={errors.subject?.message}>
          <input
            {...register("subject")}
            className="field-input"
            placeholder="Fitting, commission, enquiry…"
          />
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={6}
          className="field-input min-h-[160px] resize-y"
          placeholder="Tell us how we can help…"
        />
      </Field>

      <button
        type="submit"
        className="btn-primary w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>

      {message ? (
        <p
          role="status"
          className={cn(
            "text-sm",
            status === "error" ? "text-coral" : "text-sage",
          )}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="eyebrow mb-2 block text-muted">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-coral">{error}</span>
      ) : null}
    </label>
  );
}
