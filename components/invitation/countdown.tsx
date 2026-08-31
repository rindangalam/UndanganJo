"use client";

import { useEffect, useState } from "react";

export interface CountdownProps {
  targetDate: string | null;
  ink: string;
  dim: string;
  surface: string;
  hairline: string;
}

function parse(targetDate: string) {
  const d = new Date(targetDate + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function Countdown({ targetDate, ink, dim, surface, hairline }: CountdownProps) {
  const [now, setNow] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = parse(targetDate);
    if (!target) return;
    const id = setInterval(() => setNow(diff(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;

  const units = [
    { label: "Hari", value: now ? now.days : null },
    { label: "Jam", value: now ? now.hours : null },
    { label: "Menit", value: now ? now.minutes : null },
    { label: "Detik", value: now ? now.seconds : null },
  ];

  const reached = now != null && now.days + now.hours + now.minutes + now.seconds === 0;

  return (
    <section className={`px-8 py-14 text-center ${surface}`}>
      <h2 className={`mb-2 font-serif text-3xl font-medium italic ${ink}`}>
        {reached ? "Hari Bahagia Telah Tiba" : "Menuju Hari Bahagia"}
      </h2>
      <p className={`mb-8 text-body-md ${dim}`}>
        {reached
          ? "Terima kasih atas doa restu yang telah hadir."
          : "Hitung mundur menuju hari yang paling dinanti."}
      </p>
      {!reached && (
        <div className="mx-auto flex max-w-xs justify-center gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className={`flex flex-1 flex-col items-center rounded-xl border px-2 py-4 ${hairline} ${surface}`}
            >
              <span className={`font-serif text-2xl font-medium tabular-nums ${ink}`}>
                {u.value == null ? "--" : String(u.value).padStart(2, "0")}
              </span>
              <span className={`mt-1 text-label-sm uppercase tracking-widest ${dim}`}>
                {u.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
