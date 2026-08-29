# AGENTS.md — UndanganJo

Dokumen ini adalah instruksi kerja wajib untuk AI coding agent (Claude Code atau sejenisnya) yang mengerjakan codebase UndanganJo. Ikuti alur kerja di dokumen ini untuk **setiap** task, sekecil apa pun — tidak ada task yang boleh melewati siklus ini.

Rujukan produk lengkap ada di `PRD-Platform-Undangan-Online.md` pada root repo. Dokumen ini tidak menggantikan PRD, hanya mengatur *cara kerja* agent di dalam codebase.

---

## 1. Ringkasan Project

UndanganJo adalah platform pembuatan undangan pernikahan digital, dengan dua jalur pemesanan (self-serve dan dibantu admin via WhatsApp), RSVP & buku ucapan untuk tamu, serta admin panel.

**Tech stack:**
- Next.js (App Router, TypeScript) — hosting Vercel
- Supabase — Postgres, Auth, Storage, Row Level Security
- Payment gateway (Midtrans/Xendit, QRIS) untuk jalur self-serve

**Prinsip non-negotiable** (lihat Bagian 6): arsitektur harus tetap portable ke VPS self-hosted di masa depan. Jangan pernah mengambil jalan pintas yang mengorbankan prinsip ini demi kecepatan development.

---

## 2. Alur Kerja Wajib: Read → Thinking → Build → Review → Fix → Next Step

Setiap task — baik dari issue tracker, permintaan langsung, maupun temuan sendiri — **wajib** melewati keenam tahap berikut secara berurutan. Jangan skip tahap manapun, termasuk untuk perubahan yang terlihat sepele.

### 2.1 Read (Baca)

Sebelum menulis satu baris kode pun:

- Baca requirement terkait di `PRD-Platform-Undangan-Online.md` — pastikan paham FR (Functional Requirement) mana yang relevan dan kriteria sukses-nya.
- Baca kode yang sudah ada di area terdampak — jangan asumsikan pola/struktur, verifikasi langsung dari file-nya.
- Baca migration file terbaru di `supabase/migrations/` untuk memastikan pemahaman skema saat ini akurat, bukan berdasarkan ingatan dari task sebelumnya.
- Jika task menyentuh RLS, auth, atau alur pembayaran — baca ulang Bagian 6 dokumen ini sebelum lanjut.
- Jangan mulai membangun sebelum benar-benar paham *kenapa* task ini diperlukan, bukan cuma *apa* yang diminta.

### 2.2 Thinking (Berpikir & Rencana)

Sebelum implementasi, susun rencana singkat (boleh dalam bentuk checklist internal):

- File apa saja yang akan disentuh?
- Apakah perubahan ini berdampak ke RLS policy, tabel lain, atau flow lain yang sudah jalan (misal: perubahan di `invitations` bisa berdampak ke jalur self-serve *dan* admin-assisted sekaligus)?
- Apakah ini butuh migration file baru, atau cukup perubahan kode?
- Apakah ada edge case yang perlu diantisipasi dari awal (data kosong, `customer_id` null, order gateway vs manual, dsb)?
- Apakah solusi ini tetap portable (lihat Bagian 6), atau diam-diam menambah ketergantungan ke fitur eksklusif Vercel/Supabase cloud?

Jika rencana ini melibatkan keputusan produk (bukan cuma teknis) yang belum ada jawabannya di PRD — berhenti, dan tanyakan ke pengguna sebelum lanjut ke tahap Build.

### 2.3 Build (Bangun)

- Ikuti struktur folder & konvensi yang sudah ada (lihat Bagian 4) — jangan bikin pola baru tanpa alasan kuat.
- Perubahan skema database **selalu** lewat migration file (`supabase/migrations/`), tidak pernah lewat edit manual di dashboard Supabase.
- Tulis kode sekecil dan sefokus mungkin untuk task ini — hindari scope creep ke area lain yang tidak diminta.
- Untuk fitur yang menyentuh data sensitif (pembayaran, data tamu, akses admin), pastikan RLS policy ditulis bersamaan dengan schema-nya, bukan ditambahkan belakangan.

### 2.4 Review (Tinjau — Grilling)

Ini tahap paling ketat: perlakukan hasil kerja sendiri seperti sedang diinterogasi reviewer yang skeptis, bukan sekadar "kelihatannya jalan". Jawab tiap poin berikut secara eksplisit sebelum lanjut:

- **Kesesuaian requirement** — apakah hasilnya benar-benar memenuhi FR terkait di PRD, atau cuma mendekati?
- **Keamanan data** — apakah RLS policy sudah diuji dari sudut pandang customer lain (bukan cuma "punya sendiri")? Apakah `SUPABASE_SERVICE_ROLE_KEY` ada kemungkinan bocor ke kode client-side?
- **Edge case** — bagaimana perilaku sistem kalau `customer_id` null (undangan dibuat admin)? Kalau webhook payment dipanggil dua kali (idempotency)? Kalau upload foto gagal di tengah jalan?
- **Regresi** — apakah perubahan ini berpotensi merusak flow lain yang sebelumnya sudah jalan (self-serve vs admin-assisted, gateway vs manual payment)?
- **Portabilitas** — apakah ada dependency baru yang diam-diam mengunci ke Vercel/Supabase cloud tanpa alasan kuat?
- **Performa & mobile** — apakah halaman publik (`/[slug]`) tetap ringan dan mobile-first?

Kalau ada satu saja poin di atas yang jawabannya "belum yakin" — itu berarti belum lolos review, lanjut ke tahap Fix.

### 2.5 Fix (Perbaiki)

- Perbaiki semua temuan dari tahap Review sebelum menyatakan task selesai.
- Setelah fix, ulangi tahap Review untuk bagian yang diperbaiki — jangan asumsikan sekali fix langsung bersih.
- Kalau ada temuan yang di luar scope task saat ini tapi cukup penting (misal bug lama yang kebetulan ketemu), catat sebagai temuan terpisah di laporan Next Step — jangan diam-diam diperbaiki tanpa disebutkan, dan jangan juga membesarkan scope task tanpa persetujuan.

### 2.6 Next Step (Langkah Berikutnya)

Tutup setiap task dengan ringkasan singkat dan jelas:

- Apa yang sudah dikerjakan dan sudah lolos tahap Review.
- File apa saja yang berubah (termasuk migration file baru, jika ada).
- Apakah ada keputusan yang butuh konfirmasi dari pengguna sebelum lanjut.
- Rekomendasi task logis berikutnya, kalau ada.

Jangan biarkan task "menggantung" tanpa status yang jelas di akhir percakapan.

---

## 3. Prinsip Umum Selama Bekerja

- Lebih baik bertanya di tahap Thinking daripada membangun sesuatu berdasarkan asumsi yang salah.
- Jangan pernah membuat keputusan produk (harga, copy, keputusan scope) atas nama pengguna — itu keputusan bisnis, bukan teknis.
- Konsistensi lebih penting daripada "cara yang lebih elegan" — ikuti pola yang sudah ada di codebase kecuali ada alasan kuat untuk berubah, dan jelaskan alasan itu di tahap Next Step.

---

## 4. Struktur Folder & Konvensi

```
/app
  /(public)          → landing page, /pricing, /tema, /[slug]
  /(auth)            → /login, /register
  /(customer)        → /dashboard/* (khusus jalur self-serve)
  /admin             → admin panel
  /api               → route handler (webhook payment, dsb)
/lib
  /supabase/client.ts   → browser client
  /supabase/server.ts   → server component client
  /supabase/admin.ts    → service-role client (server-only, JANGAN import di client component)
/middleware.ts        → proteksi role-based (/admin, /dashboard)
/supabase/migrations/  → semua perubahan schema, tanpa terkecuali
```

Konvensi penamaan: file & folder `kebab-case`, komponen React `PascalCase`, fungsi/variabel `camelCase`, kolom database `snake_case`.

---

## 5. Perintah Penting

```bash
npm run dev              # jalankan development server
npm run build             # build production (harus lolos sebelum PR/merge)
npm run lint               # cek lint & type errors
supabase db push           # apply migration terbaru ke project Supabase
supabase migration new <nama>  # buat migration file baru
```

`npm run build` wajib lolos tanpa error sebelum task dianggap selesai di tahap Review.

---

## 6. Aturan Keamanan & Portabilitas (Non-Negotiable)

- **RLS wajib aktif** di semua tabel yang menyimpan data customer/tamu — tidak ada pengecualian "sementara".
- **`SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server** (`lib/supabase/admin.ts` dan route handler server-side) — tidak pernah di komponen client, tidak pernah di kode yang dikirim ke browser.
- **Hindari fitur eksklusif Vercel** kalau ada alternatif portable: gunakan Supabase Storage (bukan Vercel Blob), Supabase Postgres/`pg_cron` (bukan Vercel KV/Cron) kecuali benar-benar tidak ada alternatif.
- **`next.config.js` tetap `output: 'standalone'`** — jangan dihapus atau diubah tanpa alasan yang didiskusikan.
- **Schema selalu lewat migration file** — ini syarat utama supaya nanti bisa direplikasi 1:1 ke instance Supabase self-hosted saat migrasi ke VPS.
- Webhook payment **harus** memverifikasi signature dari payment gateway sebelum memproses — jangan pernah percaya payload webhook mentah-mentah.
