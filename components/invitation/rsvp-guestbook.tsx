"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RsvpGuestbookPalette {
  accent: string;
  ink: string;
  dim: string;
  surface: string;
  hairline: string;
}

export interface RsvpGuestbookProps {
  invitationId: string;
  palette: RsvpGuestbookPalette;
}

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

const MAX_MESSAGE = 500;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RsvpGuestbook({
  invitationId,
  palette,
}: RsvpGuestbookProps) {
  const supabase = createClient();

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvpAttending, setRsvpAttending] = useState<boolean | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);

  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");

  const [rsvpMsg, setRsvpMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [wishMsg, setWishMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const refreshWishes = () =>
    supabase
      .from("wishes")
      .select("id, name, message, created_at")
      .eq("invitation_id", invitationId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setWishes(data as Wish[]);
      });

  useEffect(() => {
    if (!UUID_RE.test(invitationId)) return;
    let ignore = false;
    supabase
      .from("wishes")
      .select("id, name, message, created_at")
      .eq("invitation_id", invitationId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!ignore && data) setWishes(data as Wish[]);
      });
    return () => {
      ignore = true;
    };
  }, [supabase, invitationId]);

  async function submitRsvp(e: FormEvent) {
    e.preventDefault();
    if (!rsvpName.trim()) {
      setRsvpMsg({ kind: "err", text: "Nama wajib diisi." });
      return;
    }
    setSending(true);
    setRsvpMsg(null);
    const { error } = await supabase.from("guests").insert({
      invitation_id: invitationId,
      name: rsvpName.trim(),
      attending: rsvpAttending,
      guest_count: Math.max(1, rsvpCount || 1),
    });
    setSending(false);
    if (error) {
      setRsvpMsg({ kind: "err", text: "Gagal menyimpan RSVP. Coba lagi." });
      return;
    }
    setRsvpMsg({ kind: "ok", text: "Terima kasih! RSVP kamu tercatat." });
    setRsvpName("");
    setRsvpCount(1);
    setRsvpAttending(null);
  }

  async function submitWish(e: FormEvent) {
    e.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) {
      setWishMsg({ kind: "err", text: "Nama dan pesan wajib diisi." });
      return;
    }
    setSending(true);
    setWishMsg(null);
    const { error } = await supabase.from("wishes").insert({
      invitation_id: invitationId,
      name: wishName.trim(),
      message: wishMessage.trim().slice(0, MAX_MESSAGE),
    });
    setSending(false);
    if (error) {
      setWishMsg({ kind: "err", text: "Gagal mengirim ucapan. Coba lagi." });
      return;
    }
    setWishMsg({ kind: "ok", text: "Ucapan terkirim. Terima kasih!" });
    setWishName("");
    setWishMessage("");
    refreshWishes();
  }

  const btn = `w-full rounded-full px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider transition disabled:opacity-60 ${palette.accent}`;
  const input = `w-full rounded-lg border bg-transparent px-4 py-3 text-body-md outline-none focus:ring-1 ${palette.hairline} ${palette.ink} focus:ring-1`;

  const pill = (active: boolean) =>
    `flex-1 rounded-full border px-4 py-2.5 text-label-sm font-semibold transition ${palette.hairline} ${
      active
        ? `${palette.accent} !border-transparent`
        : `bg-transparent ${palette.dim}`
    }`;

  return (
    <div className="flex flex-col gap-16">
      {/* RSVP */}
      <section id="rsvp" className="px-8 py-14 text-center">
        <h2 className={`mb-2 font-serif text-3xl font-medium italic ${palette.ink}`}>
          RSVP Kehadiran
        </h2>
        <p className={`mb-8 text-body-md ${palette.dim}`}>
          Konfirmasi kehadiran untuk memastikan kursi menanti kamu.
        </p>
        <form onSubmit={submitRsvp} className="mx-auto flex max-w-sm flex-col gap-4 text-left">
          <label className="flex flex-col gap-1.5">
            <span className={`text-label-sm font-semibold uppercase tracking-widest ${palette.dim}`}>
              Nama
            </span>
            <input
              name="rsvp-name"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              placeholder="Nama lengkap"
              className={input}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className={`text-label-sm font-semibold uppercase tracking-widest ${palette.dim}`}>
              Status
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRsvpAttending(true)} className={pill(rsvpAttending === true)}>
                Hadir
              </button>
              <button type="button" onClick={() => setRsvpAttending(false)} className={pill(rsvpAttending === false)}>
                Tidak Hadir
              </button>
            </div>
          </div>
          {rsvpAttending && (
            <label className="flex flex-col gap-1.5">
              <span className={`text-label-sm font-semibold uppercase tracking-widest ${palette.dim}`}>
                Jumlah Orang
              </span>
              <select
                name="rsvp-count"
                value={rsvpCount}
                onChange={(e) => setRsvpCount(Number(e.target.value))}
                className={`${input} ${palette.accent}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} orang
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" disabled={sending} className={`${btn} mt-2`}>
            {sending ? "Menyimpan..." : "Kirim RSVP"}
          </button>
          {rsvpMsg && (
            <p
              className={`mt-1 text-center text-body-md ${
                rsvpMsg.kind === "ok" ? palette.accent : "text-error"
              }`}
            >
              {rsvpMsg.text}
            </p>
          )}
        </form>
      </section>

      {/* Guestbook */}
      <section id="guestbook" className={`border-t px-8 py-14 ${palette.hairline}`}>
        <h2 className={`mb-2 text-center font-serif text-3xl font-medium italic ${palette.ink}`}>
          Buku Ucapan
        </h2>
        <p className={`mb-8 text-center text-body-md ${palette.dim}`}>
          Tinggalkan doa dan ucapan untuk kami.
        </p>

        <form onSubmit={submitWish} className="mx-auto flex max-w-sm flex-col gap-4 text-left">
          <label className="flex flex-col gap-1.5">
            <span className={`text-label-sm font-semibold uppercase tracking-widest ${palette.dim}`}>
              Nama
            </span>
            <input
              name="wish-name"
              value={wishName}
              onChange={(e) => setWishName(e.target.value)}
              placeholder="Nama kamu"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={`text-label-sm font-semibold uppercase tracking-widest ${palette.dim}`}>
              Ucapan
            </span>
            <textarea
              name="wish-message"
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              maxLength={MAX_MESSAGE}
              rows={4}
              placeholder="Tulis doa & ucapan..."
              className={`${input} resize-none`}
            />
            <span className={`self-end text-xs ${palette.dim}`}>
              {wishMessage.length}/{MAX_MESSAGE}
            </span>
          </label>
          <button type="submit" disabled={sending} className={`${btn} mt-2`}>
            {sending ? "Mengirim..." : "Kirim Ucapan"}
          </button>
          {wishMsg && (
            <p
              className={`mt-1 text-center text-body-md ${
                wishMsg.kind === "ok" ? palette.accent : "text-error"
              }`}
            >
              {wishMsg.text}
            </p>
          )}
        </form>

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-4 text-left">
          {wishes.length === 0 ? (
            <p className={`text-center text-body-md ${palette.dim}`}>
              Belum ada ucapan. Jadilah yang pertama.
            </p>
          ) : (
            wishes.map((w) => (
              <div key={w.id} className={`rounded-xl border p-4 ${palette.hairline} ${palette.surface}`}>
                <p className={`text-label-sm font-semibold uppercase tracking-widest ${palette.ink}`}>
                  {w.name}
                </p>
                <p className={`mt-1 whitespace-pre-line text-body-md ${palette.dim}`}>
                  {w.message}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
