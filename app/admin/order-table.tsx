"use client";

import { useMemo, useState } from "react";
import ConfirmPaidButton from "./confirm-paid-button";

export type TableOrder = {
  id: string;
  customerLabel: string;
  pkg: string;
  source: "Manual" | "Self-Serve";
  amount: number;
  status: string;
  statusLabel: string;
  payment_method: string;
};

const ORDER_STATUS: Record<string, string> = {
  paid: "bg-[#dae8d6] text-[#2f4a2e]",
  pending: "bg-secondary-container text-rosewood-ink",
  failed: "bg-error-container text-onerror-container",
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "Semua Sumber" },
  { value: "gateway", label: "Self-Serve" },
  { value: "manual", label: "Admin (WhatsApp)" },
];

const FILTER_STYLES =
  "rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none focus:border-rosewood-ink";

export default function OrderTable({ orders }: { orders: TableOrder[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (q) {
        const idLabel = `#${o.id.slice(0, 8).toUpperCase()}`;
        const haystack = `${o.customerLabel} ${idLabel} ${o.id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (status !== "all" && o.status !== status) return false;
      if (source !== "all" && o.payment_method !== source) return false;
      return true;
    });
  }, [orders, query, status, source]);

  const hasFilter = query !== "" || status !== "all" || source !== "all";

  return (
    <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari order ID / customer..."
          className={`${FILTER_STYLES} min-w-[220px] flex-1`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={FILTER_STYLES}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={FILTER_STYLES}
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasFilter ? (
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setSource("all");
            }}
            className="text-sm font-medium text-rosewood-ink hover:underline"
          >
            Reset
          </button>
        ) : null}
        <span className="ml-auto text-xs text-onsurface-variant">
          {filtered.length} dari {orders.length} order
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-body-md">
          <thead>
            <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
              <th className="px-5 py-3 font-semibold">Order ID</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Package</th>
              <th className="px-5 py-3 font-semibold">Source</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-onsurface-variant"
                >
                  {orders.length === 0
                    ? "Belum ada order."
                    : "Tidak ada order yang cocok dengan filter."}
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-outline-variant/60 transition last:border-0 hover:bg-surface-container-low"
                >
                  <td className="px-5 py-4 font-medium text-onsurface">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-onsurface">{o.customerLabel}</td>
                  <td className="px-5 py-4 text-onsurface-variant">{o.pkg}</td>
                  <td className="px-5 py-4 text-onsurface-variant">{o.source}</td>
                  <td className="px-5 py-4 text-onsurface">
                    {formatIDR(o.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-label-sm font-semibold ${
                        ORDER_STATUS[o.status] ?? "bg-surface-container text-onsurface-variant"
                      }`}
                    >
                      {o.statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {o.status === "pending" && o.payment_method === "manual" ? (
                      <ConfirmPaidButton orderId={o.id} />
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
