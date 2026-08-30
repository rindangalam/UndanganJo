import type { NextConfig } from "next";

// Vercel memakai adapter sendiri & tidak butuh standalone (Next 16.3 ada bug
// ENOENT .next/next-server.js.nft.json saat adapter + standalone digabung;
// lihat vercel/next.js#96646). Untuk build lain (Docker/VPS self-hosted),
// Vercel env tidak ada -> standalone tetap aktif (prinsip portabilitas).
const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
