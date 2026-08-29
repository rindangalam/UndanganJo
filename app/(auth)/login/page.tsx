"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-rosewood-ink">
          UndanganJo
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl font-medium text-onsurface">
          Masuk
        </h1>

        <form action={action} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 outline-none transition focus:border-rosewood-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface">
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 outline-none transition focus:border-rosewood-ink"
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-onerror-container">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-rosewood-ink px-4 py-3 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-onsurface-variant">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-rosewood-ink hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
