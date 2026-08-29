"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/(auth)/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, {});

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-rosewood-ink">
          UndanganJo
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl font-medium text-onsurface">
          Daftar
        </h1>

        <form action={action} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface">
            Nama lengkap
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 outline-none transition focus:border-rosewood-ink"
            />
          </label>

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
              autoComplete="new-password"
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
            {pending ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-onsurface-variant">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-rosewood-ink hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
