# Prompt Eksekusi — UndanganJo

| | |
|---|---|
| **Versi** | 0.1 – Draft |
| **Tanggal** | 29 Agustus 2026 |
| **Rujukan** | `PRD-Platform-Undangan-Online.md`, `AGENTS.md`, `sprint.md` |

Dokumen ini berisi prompt siap-tempel untuk tiap sprint di `sprint.md`, ditujukan untuk coding agent (Claude Code atau sejenisnya). Urutan dan judul sprint di sini sama persis dengan `sprint.md` — kedua dokumen dipakai berdampingan: `sprint.md` untuk memahami *apa dan kenapa*, dokumen ini untuk *mengeksekusi*.

**Cara pakai:** tempel prompt apa adanya ke coding agent, ganti bagian dalam `[...]` sesuai kebutuhan. Jalankan berurutan — jangan mulai prompt sprint berikutnya sebelum sprint sebelumnya lolos tahap Review sesuai `AGENTS.md`.

---

## Sprint 0 — Fondasi Project

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md secara penuh sebelum mulai.

Task: Scaffold project Next.js (App Router, TypeScript, Tailwind) sesuai struktur folder
di AGENTS.md Bagian 4. Install @supabase/supabase-js dan @supabase/ssr, lalu buat
lib/supabase/client.ts dan lib/supabase/server.ts mengikuti pattern resmi @supabase/ssr.

Setelah itu, buat migration file awal (supabase/migrations/) untuk seluruh skema di PRD
Bagian 8, termasuk kolom-kolom yang mendukung jalur admin-assisted (customer_id nullable
di invitations, created_by_admin, customer_name, customer_phone, dan payment_method,
confirmed_by, payment_proof_url di orders). Aktifkan Row Level Security di setiap tabel
sejak migration pertama, bukan belakangan.

Acceptance criteria:
- Struktur folder app/(public), app/(auth), app/(customer), app/admin, app/api sudah ada.
- .env.example berisi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY.
- npm run build lolos tanpa error.
- Migration bisa dijalankan bersih di project Supabase baru (supabase db push).

Ikuti alur kerja di AGENTS.md (Read -> Thinking -> Build -> Review -> Fix -> Next Step)
untuk task ini, termasuk tahap Review yang memeriksa apakah RLS sudah benar sejak awal.
```

---

## Sprint 1 — Autentikasi & Dashboard Customer

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 6.B sebelum mulai.

Task: Implementasikan FR-B1, FR-B2, FR-B3.
- Halaman register & login (email/password) di app/(auth)/.
- Halaman dashboard di app/(customer)/dashboard/ yang menampilkan daftar undangan
  milik customer yang sedang login, dengan status masing-masing (draft/menunggu
  bayar/published). Tampilkan empty state yang layak kalau belum ada undangan.
- Middleware yang memastikan /dashboard/* hanya bisa diakses user yang sudah login,
  dan redirect ke /login kalau belum.

Acceptance criteria:
- RLS memastikan query dashboard hanya mengembalikan undangan dengan customer_id
  milik user yang login — uji dengan dua akun customer berbeda untuk memastikan
  tidak ada data bocor.
- Alur register -> login -> lihat dashboard kosong berjalan tanpa error.

Ikuti alur kerja di AGENTS.md. Pada tahap Review, khususnya pastikan pertanyaan
"apakah RLS sudah diuji dari sudut pandang customer lain" terjawab dengan bukti
konkret, bukan asumsi.
```

---

## Sprint 2 — Invitation Builder (Jalur Self-Serve)

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 6.C sebelum mulai.

Task: Implementasikan FR-C1 sampai FR-C7 di app/(customer)/dashboard/[id]/edit/.
- Form isi data: nama mempelai, tanggal, waktu & lokasi akad (dengan link Google
  Maps), waktu & lokasi resepsi, cerita/kisah pasangan, info hadiah digital.
- Upload galeri foto ke Supabase Storage bucket "gallery-photos" (batasi jumlah
  sesuai field max_photos di tabel packages).
- Upload/pilih musik latar ke bucket "music" (hanya untuk paket yang mendukung).
- Komponen pemilihan tema dari data di tabel themes (filter sesuai paket yang dibeli).
- Halaman preview yang menampilkan hasil akhir sebelum undangan disimpan/dipublish.

Acceptance criteria:
- Data tersimpan dengan benar ke tabel invitations sesuai skema di PRD.
- Upload foto/musik gagal ditangani dengan pesan error yang jelas ke user, tidak
  membuat form crash.
- Preview menampilkan data persis seperti yang akan tampil di halaman publik nanti.

Ikuti alur kerja di AGENTS.md. Pada tahap Thinking, pikirkan dulu apakah builder ini
strukturnya bisa dipakai ulang oleh admin di Sprint 6 (FR-C8) — desain komponennya
supaya reusable, jangan tulis ulang dari nol nanti.
```

---

## Sprint 3 — Halaman Publik, RSVP & Guestbook

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 6.D dan 6.E sebelum mulai.

Task: Implementasikan FR-D1 sampai FR-D5, dan FR-E1 sampai FR-E4.
- Halaman publik app/(public)/[slug]/page.tsx: render data undangan hanya jika
  status = 'published'. Tampilkan countdown ke tanggal acara, galeri foto, musik
  latar dengan tombol mute, seluruh detail acara. Wajib mobile-first dan ringan
  (target < 2 detik load di koneksi mobile rata-rata).
- Form RSVP (nama, status hadir/tidak, jumlah orang) tersimpan ke tabel guests.
- Form kirim ucapan tersimpan ke tabel wishes, tampil di halaman publik.
- Di dashboard customer, tampilkan rekap RSVP (jumlah konfirmasi hadir) dan daftar
  ucapan, dengan opsi hapus ucapan yang tidak pantas (FR-E4).

Acceptance criteria:
- Undangan berstatus draft TIDAK bisa diakses publik lewat slug-nya (redirect atau 404).
- RSVP dan ucapan baru muncul di halaman publik tanpa perlu reload manual berkali-kali.
- Halaman publik tetap fungsional walau JavaScript lambat load (progressive enhancement
  untuk bagian penting seperti detail acara).

Ikuti alur kerja di AGENTS.md. Pada tahap Review, uji secara eksplisit skenario akses
undangan berstatus draft langsung lewat URL slug-nya oleh pihak yang tidak berkepentingan.
```

---

## Sprint 4 — Payment Gateway (Jalur Self-Serve)

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 6.F sebelum mulai.

Task: Implementasikan FR-F1 sampai FR-F5 untuk jalur self-serve, menggunakan
[Midtrans/Xendit — pilih salah satu] Snap dengan dukungan QRIS.
- Saat customer klik "Bayar" di dashboard, buat row baru di tabel orders dengan
  status 'pending' dan payment_method = 'gateway'.
- Buat route handler app/api/webhooks/[gateway]/route.ts yang menerima callback
  dari payment gateway, WAJIB memverifikasi signature sebelum memproses payload.
- Setelah verifikasi sukses dan status pembayaran 'paid', update orders.status dan
  otomatis ubah invitations.status menjadi 'published'.
- Tangani status 'failed' dengan mengembalikan user ke halaman checkout dengan
  pesan yang jelas.

Acceptance criteria:
- Webhook menolak payload yang signature-nya tidak valid (uji dengan payload palsu).
- Webhook bersifat idempotent — dipanggil dua kali dengan payload sama tidak
  menyebabkan efek ganda (misal invitation ter-publish dua kali atau duplikasi order).
- SUPABASE_SERVICE_ROLE_KEY yang dipakai untuk update status dari webhook hanya
  dipanggil di server (route handler), tidak pernah lewat client.

Ikuti alur kerja di AGENTS.md. Pada tahap Review, khususnya uji ulang pertanyaan
soal idempotency webhook dan keamanan signature verification — ini bagian paling
kritikal dari sprint ini.
```

---

## Sprint 5 — Admin Panel Inti

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 6.G (FR-G1 s.d. FR-G6)
sebelum mulai.

Task:
- Login admin terpisah dengan pengecekan role = 'admin' di tabel profiles (FR-G1),
  ditegakkan lewat middleware untuk seluruh route di app/admin/*.
- Halaman daftar semua order (gateway + manual) dengan filter status dan sumber
  (FR-G2), daftar semua undangan lintas customer (FR-G3).
- CRUD tema (FR-G4) dan paket (FR-G5) — termasuk validasi input harga dan field wajib.
- Halaman statistik ringkas: total undangan, total pendapatan, order per status,
  perbandingan jumlah self-serve vs admin-assisted (FR-G6).

Acceptance criteria:
- User dengan role 'customer' yang mencoba akses /admin/* di-redirect, bukan
  menerima data admin (uji langsung, jangan asumsikan middleware jalan benar).
- Statistik menghitung data secara akurat sesuai data uji yang ada.
- Semua operasi admin (CRUD tema/paket) memakai service-role client yang hanya
  dipanggil server-side.

Ikuti alur kerja di AGENTS.md. Pada tahap Review, pastikan pertanyaan "hanya
role admin yang boleh CRUD undangan dengan customer_id kosong" (dari AGENTS.md
Bagian 6) sudah terjawab dan teruji, bukan cuma diasumsikan karena UI-nya di
bawah /admin.
```

---

## Sprint 6 — Jalur Admin-Assisted (WhatsApp)

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md Bagian 5 (Flow Customer via
Admin) dan Bagian 6 (FR-A4, FR-C8, FR-F5, FR-G7 s.d. FR-G9) sebelum mulai.

Task:
- Halaman publik app/(public)/tema/page.tsx: galeri tema, tiap tema punya tombol
  "Pesan via WhatsApp" berupa link wa.me dengan pesan ter-prefill nama tema.
  Nomor WA admin diambil dari environment variable, bukan hardcode. Ini murni
  link statis, tidak memanggil backend atau menyimpan data apa pun (FR-A4).
- Di admin panel, tambahkan alur "Buat Undangan Baru (Manual)" yang memakai ulang
  komponen builder dari Sprint 2 (FR-C8), dengan tambahan field nama & nomor WA
  customer sebagai referensi (customer_id boleh null).
- Admin bisa membuat/mengedit order manual: input nominal, tandai status lunas,
  upload bukti transfer opsional ke Storage (FR-G8).
- Order manual yang ditandai lunas otomatis mengubah invitations.status menjadi
  'published' (FR-G9), sama seperti alur gateway di Sprint 4.

Acceptance criteria:
- Tombol WhatsApp membuka chat dengan pesan yang benar berisi nama tema, tanpa
  request apa pun ke server.
- Undangan yang dibuat admin dengan customer_id null tetap bisa diakses publik
  di /[slug] setelah published, sama seperti undangan self-serve.
- RLS memastikan hanya role admin yang bisa membuat/mengubah undangan dengan
  customer_id kosong.

Ikuti alur kerja di AGENTS.md. Pada tahap Thinking, pastikan reuse komponen
builder dari Sprint 2 benar-benar terjadi, bukan duplikasi kode form yang mirip.
```

---

## Sprint 7 — QA, Hardening & Persiapan Rilis

```
Baca AGENTS.md dan PRD-Platform-Undangan-Online.md secara penuh sebelum mulai.

Task: Lakukan tahap Review (Grilling) versi penuh terhadap seluruh aplikasi,
bukan per fitur seperti sprint sebelumnya. Jalankan checklist berikut secara
eksplisit dan laporkan hasilnya satu per satu:

1. Uji end-to-end jalur self-serve: daftar -> isi undangan -> bayar -> published
   -> tamu RSVP & kirim ucapan -> customer lihat rekap.
2. Uji end-to-end jalur admin-assisted: buka /tema -> klik WA -> admin buat
   undangan manual -> admin tandai lunas -> published -> tamu akses & RSVP.
3. Uji RLS dengan minimal dua akun customer berbeda dan satu akun non-admin
   yang mencoba akses /admin/* — pastikan tidak ada kebocoran data di kedua
   jalur.
4. Uji seluruh edge case yang tercantum di AGENTS.md Bagian 2.4 (Review):
   customer_id null, webhook dipanggil dua kali, upload foto gagal di tengah
   jalan.
5. Cek performa halaman publik [/slug] di kondisi jaringan mobile yang disimulasikan
   throttle, pastikan tetap mendekati target < 2 detik.
6. Cek tidak ada SUPABASE_SERVICE_ROLE_KEY atau kredensial payment gateway yang
   ter-expose di kode client-side (grep menyeluruh, bukan sampling).

Untuk setiap temuan, perbaiki di tahap Fix, lalu ulangi bagian checklist yang
relevan sampai bersih. Tutup dengan laporan Next Step yang mencantumkan status
akhir seluruh 6 poin di atas dan rekomendasi apakah project sudah siap dirilis
ke pengguna nyata.
```

---

## Catatan Penggunaan

- Ganti `[Midtrans/Xendit — pilih salah satu]` di Sprint 4 sesuai payment gateway yang jadi keputusan final.
- Kalau ada task tambahan di luar 8 sprint di `sprint.md` (misal perbaikan bug lintas sprint), tetap gunakan format prompt yang sama: rujuk `AGENTS.md` dan bagian PRD yang relevan di awal prompt, cantumkan acceptance criteria eksplisit, dan tutup dengan instruksi mengikuti siklus Read → Thinking → Build → Review → Fix → Next Step.
