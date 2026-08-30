# Sprint Plan — UndanganJo

| | |
|---|---|
| **Versi** | 0.1 – Draft |
| **Tanggal** | 29 Agustus 2026 |
| **Rujukan** | `PRD-Platform-Undangan-Online.md`, `AGENTS.md`, `prompt.md` |

Dokumen ini memecah scope MVP UndanganJo (lihat PRD Bagian 4 & 11) menjadi 8 sprint yang berurutan. Setiap sprint mengasumsikan sprint sebelumnya sudah selesai dan lolos tahap Review sesuai `AGENTS.md`.

Dokumen ini fokus pada **apa yang dikerjakan dan kenapa** (tujuan, deliverable, kriteria selesai). Prompt eksekusi siap-tempel untuk tiap sprint ada di `prompt.md` — dua dokumen ini dipakai berdampingan, bukan menggantikan satu sama lain.

## Ringkasan Sprint

| Sprint | Fokus | Estimasi | FR Terkait (PRD) |
|---|---|---|---|
| 0 | Fondasi project & schema | 2–3 hari | — |
| 1 | Autentikasi & dashboard customer | 3–4 hari | B1–B3 |
| 2 | Invitation builder (self-serve) | 5–7 hari | C1–C7 |
| 3 | Halaman publik, RSVP & guestbook | 5–7 hari | D1–D5, E1–E4 |
| 4 | Payment gateway (self-serve) | 4–5 hari | F1–F5 |
| 5 | Admin panel inti | 5–6 hari | G1–G6 |
| 6 | Jalur admin-assisted (WhatsApp) | 3–4 hari | A4, C8, G7–G9 |
| 7 | QA, hardening & persiapan rilis | 3–5 hari | seluruh FR |

Total estimasi: kurang lebih 5–6 minggu untuk tim kecil/solo developer. Sesuaikan dengan kapasitas nyata tim kamu.

---

## Sprint 0 — Fondasi Project

**Estimasi:** 2–3 hari
**Tujuan:** Project berjalan lokal, terhubung ke Supabase, dan berhasil deploy pertama kali ke Vercel.

**Deliverable:**
- Struktur folder Next.js sesuai `AGENTS.md` Bagian 4.
- Project Supabase aktif + migration awal untuk seluruh tabel inti (`profiles`, `packages`, `themes`, `invitations`, `guests`, `wishes`, `orders`), termasuk kolom untuk jalur admin-assisted (`customer_id` nullable, `created_by_admin`, `payment_method`, dst — lihat PRD Bagian 8).
- Deploy awal ke Vercel sukses (boleh masih halaman kosong).

**Kriteria selesai:**
- Struktur folder `app/(public)`, `app/(auth)`, `app/(customer)`, `app/admin`, `app/api` sudah ada.
- `.env.example` berisi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `npm run build` lolos tanpa error.
- Migration bisa dijalankan bersih di project Supabase baru (`supabase db push`).
- RLS aktif di seluruh tabel sejak migration pertama.

---

## Sprint 1 — Autentikasi & Dashboard Customer

**Estimasi:** 3–4 hari
**FR terkait:** B1, B2, B3
**Tujuan:** Customer bisa daftar, login, dan melihat dashboard (masih kosong/empty state) yang hanya menampilkan data miliknya sendiri.

**Deliverable:**
- Halaman register & login (email/password).
- Halaman dashboard yang menampilkan daftar undangan milik customer beserta status (draft/menunggu bayar/published), dengan empty state yang layak.
- Middleware yang membatasi akses `/dashboard/*` hanya untuk user yang sudah login.

**Kriteria selesai:**
- RLS memastikan query dashboard hanya mengembalikan data milik customer yang login — teruji dengan minimal dua akun berbeda.
- Alur register → login → lihat dashboard kosong berjalan tanpa error.

---

## Sprint 2 — Invitation Builder (Jalur Self-Serve)

**Estimasi:** 5–7 hari
**FR terkait:** C1–C7
**Tujuan:** Customer bisa mengisi seluruh data undangan, upload foto & musik, memilih tema, dan melihat preview sebelum publish.

**Deliverable:**
- Form isi data lengkap: nama mempelai, jadwal & lokasi akad/resepsi (dengan link Google Maps), cerita pasangan, info hadiah digital.
- Upload galeri foto ke Supabase Storage (dibatasi sesuai `max_photos` paket) dan musik latar (khusus paket yang mendukung).
- Komponen pemilihan tema, difilter sesuai paket yang dibeli.
- Halaman preview sebelum undangan disimpan/dipublish.

**Kriteria selesai:**
- Data tersimpan dengan benar sesuai skema `invitations` di PRD.
- Kegagalan upload ditangani dengan pesan error yang jelas, tidak membuat form crash.
- Preview menampilkan data persis seperti yang akan tampil di halaman publik.
- Komponen builder didesain reusable untuk dipakai ulang oleh admin di Sprint 6.

---

## Sprint 3 — Halaman Publik, RSVP & Guestbook

**Estimasi:** 5–7 hari
**FR terkait:** D1–D5, E1–E4
**Tujuan:** Undangan yang published bisa diakses tamu tanpa login, tamu bisa RSVP dan menulis ucapan, customer bisa melihat rekap.

**Deliverable:**
- Halaman publik `/[slug]`: render hanya jika `status = 'published'`, dengan countdown, galeri foto, musik latar (tombol mute), dan seluruh detail acara. Mobile-first, target < 2 detik load.
- Form RSVP (nama, status hadir/tidak, jumlah orang) tersimpan ke tabel `guests`.
- Form ucapan tersimpan ke tabel `wishes`, tampil di halaman publik.
- Rekap RSVP & daftar ucapan di dashboard customer, dengan opsi hapus ucapan tidak pantas.

**Kriteria selesai:**
- Undangan berstatus `draft` tidak bisa diakses publik lewat slug-nya.
- RSVP dan ucapan baru muncul tanpa perlu reload manual berkali-kali.
- Detail acara tetap terbaca walau JavaScript lambat load.

---

## Sprint 4 — Payment Gateway (Jalur Self-Serve)

**Estimasi:** 4–5 hari
**FR terkait:** F1–F5 (bagian gateway)
**Tujuan:** Customer bisa checkout paket, bayar via QRIS, dan undangan otomatis published setelah pembayaran sukses.

**Deliverable:**
- Order baru (status `pending`, `payment_method = 'gateway'`) dibuat saat customer checkout.
- Webhook payment gateway (Midtrans/Xendit) dengan verifikasi signature.
- Update otomatis `orders.status` dan `invitations.status` menjadi `published` setelah pembayaran sukses.
- Penanganan status gagal dengan pesan jelas ke user.

**Kriteria selesai:**
- Webhook menolak payload dengan signature tidak valid.
- Webhook idempotent — dipanggil dua kali dengan payload sama tidak menyebabkan efek ganda.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipanggil dari server (route handler), tidak pernah dari client.

---

## Sprint 5 — Admin Panel Inti

**Estimasi:** 5–6 hari
**FR terkait:** G1–G6
**Tujuan:** Admin bisa login terpisah, memantau seluruh order & undangan lintas customer, mengelola tema dan paket, serta melihat statistik dasar.

**Deliverable:**
- Login admin dengan pengecekan `role = 'admin'`, ditegakkan middleware di seluruh `app/admin/*`.
- Daftar semua order (filter status & sumber) dan daftar semua undangan lintas customer.
- CRUD tema dan CRUD paket.
- Statistik ringkas: total undangan, total pendapatan, order per status, perbandingan self-serve vs admin-assisted.

**Kriteria selesai:**
- User `role = 'customer'` yang mencoba akses `/admin/*` di-redirect, teruji langsung bukan diasumsikan.
- Statistik menghitung data secara akurat sesuai data uji.
- Seluruh operasi admin memakai service-role client yang hanya dipanggil server-side.

---

## Sprint 6 — Jalur Admin-Assisted (WhatsApp)

**Estimasi:** 3–4 hari
**FR terkait:** A4, C8, F5 (bagian manual), G7–G9
**Tujuan:** Customer bisa memesan tema lewat WhatsApp tanpa isi form, dan admin bisa memproses seluruh pemesanan itu dari admin panel sampai undangan terbit.

**Deliverable:**
- Halaman publik `/tema`: galeri tema, tiap tema punya tombol "Pesan via WhatsApp" (link `wa.me` dengan pesan ter-prefill nama tema, nomor admin dari env var).
- Alur "Buat Undangan Baru (Manual)" di admin panel, memakai ulang komponen builder dari Sprint 2, dengan field nama & nomor WA customer (`customer_id` boleh null).
- Admin bisa membuat/mengedit order manual, tandai lunas, upload bukti transfer opsional.
- Order manual yang ditandai lunas otomatis mempublish undangan terkait.

**Kriteria selesai:**
- Tombol WhatsApp membuka chat dengan pesan benar, tanpa request apa pun ke server.
- Undangan dengan `customer_id` null tetap bisa diakses publik setelah published, sama seperti undangan self-serve.
- RLS memastikan hanya admin yang bisa membuat/mengubah undangan dengan `customer_id` kosong.
- Komponen builder benar-benar reuse dari Sprint 2, bukan duplikasi kode.

---

## Sprint 7 — QA, Hardening & Persiapan Rilis

**Estimasi:** 3–5 hari
**FR terkait:** seluruh FR (regresi penuh)
**Tujuan:** Regresi menyeluruh kedua jalur pemesanan, uji keamanan, dan kesiapan rilis ke pengguna nyata.

**Deliverable:**
- Hasil uji end-to-end jalur self-serve dan jalur admin-assisted secara lengkap.
- Hasil uji RLS dari berbagai peran (customer A, customer B, non-admin ke `/admin`).
- Hasil uji edge case (`customer_id` null, webhook dipanggil dua kali, upload foto gagal di tengah jalan).
- Hasil pemeriksaan performa halaman publik di kondisi jaringan mobile.
- Hasil pemeriksaan tidak ada kredensial (service role key, payment gateway) yang ter-expose ke client.

**Kriteria selesai:**
- Seluruh poin di atas berstatus selesai dan terverifikasi, bukan diasumsikan.
- Rekomendasi eksplisit: siap rilis atau belum, beserta alasannya.

---

## Catatan

- Sprint ini disusun berurutan karena tiap sprint bergantung pada fondasi sprint sebelumnya (mis. Sprint 6 memakai ulang builder dari Sprint 2). Kalau perlu paralelisasi antar developer, pastikan dependency ini tetap dihormati.
- Kalau ada perubahan scope PRD di tengah jalan, sprint yang terdampak perlu direvisi bersamaan dengan `prompt.md` supaya kedua dokumen tetap sinkron.

---

## Catatan Go-Live Payment (Production) — Sprint 4

Status saat ini: integrasi Midtrans sudah terverifikasi **end-to-end di environment Sandbox** (order `pending`→`paid`, undangan → `published`, webhook otomatis **Completed**). Go-live ke Production **ditunda** atas keputusan pengguna (aktivitas go-live belum boleh dieksekusi sebelum konfirmasi).

Agar Production siap, item berikut **wajib** dikerjakan saat go-live (bukan di sprint berjalan):

1. **Rotate kredensial Midtrans Production** yang pernah ter-expose (jangan pakai key lama).
2. Di environment Vercel production (atau VPS saat self-host):
   - Set `MIDTRANS_IS_PRODUCTION=true` dan `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true`.
   - Ganti `MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` menjadi pasangan **Production** (bukan sandbox).
3. Di dashboard Midtrans **Production** (`dashboard.midtrans.com`):
   - Set **Payment Notification URL** → `https://undangan-jo.vercel.app/api/payment/notification`.
   - Set **Snap Finish URL** & **Error Payment URL** → `https://undangan-jo.vercel.app/dashboard`.
   - Verifikasi tombol "Test notification URL" menjadi **Tested** (menandakan signature server-key Production cocok).
4. Uji ulang alur pembayaran nyata di Production sebelum mengarahkan pengguna sungguhan.

Catatan: pengaturan di atas untuk environment Sandbox (`dashboard.sandbox.midtrans.com`) sudah disetel dan terverifikasi tersimpan.

---

## Catatan Status Sprint 5 & 6 — Selesai & Terverifikasi

Status Sprint 5 (Admin Panel Inti) dan Sprint 6 (Jalur Admin-Assisted) **selesai dan lolos uji end-to-end** di sandbox.

**Sprint 5 (G1–G6):**
- G1 login admin terpisah (`isAdminUser` + guard + `proxy.ts` + RLS `is_admin()`).
- G2 daftar order + filter, G3 daftar undangan lintas customer, G4 CRUD tema, G5 CRUD paket.
- G6 statistik ringkas → halaman baru `/admin/overview`.

**Bug regresi (Sprint 4 → 5) ditemukan & diperbaiki:** tabel order `/admin` sempat menampilkan 0 order walau DB berisi 4. Penyebab: join `customer:profiles(full_name)` ambigu karena `orders` kini punya 2 FK ke `profiles` (`customer_id` + `confirmed_by`). Diperbaiki dengan `profiles!orders_customer_id_fkey`. Setelah fix, daftar order tampil benar.

**Sprint 6 (A4, C8, G7–G9):**
- G7 buat undangan manual (customer_id null, `created_by_admin`), G8 order manual + tandai lunas (`confirmed_by`), G9 order lunas → undangan otomatis `published` (terverifikasi via DB & UI).
- Builder admin benar-benar **reuse** komponen `InvitationEditor` dari Sprint 2 (`app/admin/invitations/[id]/edit/page.tsx` mengimpor dari `app/(customer)/dashboard/[id]/edit/invitation-editor`), bukan duplikasi.
- RLS hanya admin yang bisa insert/update undangan `customer_id` kosong (kombinasi policy owner `auth.uid() = customer_id` + admin `is_admin()`).

**Fitur baru — Galeri `/tema` (deliverable A4 yang sebelumnya belum ada):**
- Sebelumnya hanya ada preview `/tema/modern-noir`; tidak ada galeri tema & tombol WhatsApp, dan `wa.me/` di landing/pricing masih kosong.
- Dibuat `app/(public)/tema/page.tsx` — galeri dinamis 3 tema aktif dari DB, tiap tema punya tombol "Pesan via WhatsApp" (prefill nama tema) dan "Buat Sendiri" → `/dashboard/new`.
- Helper `lib/whatsapp.ts` (`waNumber`, `waLink`, `waOrderMessage`) membaca nomor admin dari env `NEXT_PUBLIC_WA_NUMBER`; dipakai juga memperbaiki link `wa.me/` kosong di landing (`/`) dan `/pricing`.
- Nav "Themes" di `components/site-header.tsx` kini menuju `/tema`.

**Catatan Sprint 7 (QA) lanjutan:** verifikasi keamanan kredensial (service role key / payment gateway tidak ter-expose ke client) dan uji RLS lintas peran belum dilakukan menyeluruh.
