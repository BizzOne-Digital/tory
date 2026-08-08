"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { FormField } from "@/components/admin/FormField";
import { TextInput } from "@/components/admin/TextInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Unable to sign in");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Unable to sign in right now");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo variant="monogram" className="mx-auto h-14 w-14 text-gold" />
          <h1 className="mt-4 font-display text-3xl text-ink">Admin Sign In</h1>
          <p className="mt-2 text-sm text-muted">
            LUCCI CRENO content & commerce portal
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-sm border border-border bg-white p-6 shadow-sm"
        >
          {error ? (
            <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <FormField label="Email" htmlFor="email" required>
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <TextInput
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-sm bg-ink px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ivory hover:bg-ink-soft disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
