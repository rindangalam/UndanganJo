# PRD: UndanganJo — Platform Undangan Online

| | |
|---|---|
| **Versi** | 0.3 – Draft |
| **Tanggal** | 29 Agustus 2026 |
| **Status** | Draft untuk direview & disesuaikan |
| **Tech stack** | Next.js (App Router) + Supabase + Vercel |

> Catatan: nama produk, harga paket, dan beberapa angka di dokumen ini adalah **draft/contoh** — sesuaikan dengan riset pasar dan keputusan bisnis kamu sebelum dipakai sebagai acuan final.

---

## 1. Ringkasan & Latar Belakang

Platform yang memungkinkan pengguna membuat undangan pernikahan digital, membayar sesuai paket yang dipilih, lalu membagikannya ke tamu lewat link. Tamu dapat melihat detail acara, RSVP, dan mengirim ucapan tanpa install aplikasi apa pun.

Ada **dua jalur pemesanan** yang berjalan paralel:
1. **Self-serve** — customer isi sendiri semua data lewat dashboard, bayar via payment gateway (QRIS), undangan otomatis terbit.
2. **Dibantu admin (via WhatsApp)** — customer yang tidak ingin ribet isi form cukup pilih tema di halaman publik, hubungi admin lewat WhatsApp, nego & kasih data di sana, lalu admin yang input undangannya dan konfirmasi pembayaran secara manual.

**Masalah yang diselesaikan:**
- Undangan fisik mahal, lama proses cetak, dan tidak ramah lingkungan.
- Sebagian orang mau serba cepat isi sendiri (self-serve); sebagian lagi lebih nyaman dibantu langsung lewat chat — produk ini melayani dua segmen itu sekaligus tanpa membangun dua sistem terpisah.

## 2. Tujuan Produk & Metrik Sukses

**Tujuan bisnis (MVP):**
- Validasi apakah orang mau bayar untuk undangan online di platform ini, lewat kedua jalur (self-serve maupun dibantu admin).
- Jalankan bisnis tanpa butuh biaya infrastruktur besar di awal, dan tanpa harus semua transaksi lewat payment gateway (fleksibel terima transfer manual juga).

**Metrik sukses MVP (contoh, sesuaikan target):**
| Metrik | Target awal |
|---|---|
| Total undangan berhasil bayar (gabungan self-serve + admin) | 50 dalam 2 bulan pertama |
| Undangan dari jalur self-serve vs admin-assisted | Dilacak terpisah untuk tahu jalur mana lebih diminati |
| Waktu admin proses 1 undangan (dari deal WA sampai publish) | < 30 menit |
| Uptime halaman undangan publik | ≥99.5% |

## 3. Target Pengguna (Persona)

1. **Calon Pengantin — Self-Serve** — nyaman isi form sendiri, prioritas: kecepatan, kontrol penuh atas isi undangan, harga jelas di muka.
2. **Calon Pengantin — Dibantu Admin** — tidak mau ribet isi form, lebih nyaman kirim data & foto lewat chat WhatsApp seperti biasa mereka pesan jasa lain, oke bayar sedikit lebih personal/manual (transfer, bukan payment gateway).
3. **Tamu Undangan (Guest)** — menerima link lewat WhatsApp, mayoritas akses dari HP, butuh info jelas & RSVP tanpa install apa pun.
4. **Admin Platform** — mengelola pesanan dari dua jalur: memantau order self-serve, dan secara aktif membuatkan undangan + mengonfirmasi pembayaran manual untuk customer yang datang lewat WhatsApp.

## 4. Lingkup Produk

### In scope (MVP)
- Satu jenis acara: **pernikahan**.
- 2–3 pilihan tema visual siap pakai.
- **Jalur self-serve:** daftar akun → isi data → pilih tema → bayar via gateway (QRIS) → publish otomatis.
- **Jalur admin-assisted:** halaman tema publik dengan tombol "Pesan via WhatsApp" → nego di WA → admin input undangan & tandai pembayaran manual → publish.
- RSVP + buku ucapan (guestbook) untuk tamu — sama untuk undangan dari jalur mana pun.
- Admin panel: kelola order (gateway maupun manual), kelola undangan lintas customer, kelola tema & paket.

### Out of scope (ditunda ke fase berikutnya)
- Pencatatan lead terstruktur (form + tabel `leads`) sebelum masuk WhatsApp — untuk MVP, tombol WA langsung buka chat tanpa menyimpan data apa pun ke sistem.
- Custom domain per customer.
- Editor tema drag-and-drop / kustomisasi layout bebas.
- Jenis acara selain pernikahan.
- Blast WhatsApp otomatis, live streaming, program referral/afiliasi.

## 5. User Flow Utama

**Flow Customer — Self-Serve:**
1. Daftar/login → 2. Pilih paket → 3. Isi data undangan sendiri di dashboard → 4. Pilih tema → 5. Preview → 6. Bayar via gateway (QRIS) → 7. Undangan otomatis `published` → 8. Bagikan link → 9. Pantau RSVP & ucapan di dashboard.

**Flow Customer — Dibantu Admin (WhatsApp):**
1. Buka halaman publik `/tema` → lihat galeri tema.
2. Klik tombol **"Pesan via WhatsApp"** di tema yang diminati → langsung terbuka chat WA ke admin dengan pesan ter-prefill nama tema (link `wa.me`, tanpa form, tanpa simpan data ke sistem).
3. Nego & kirim detail (nama pasangan, jadwal, lokasi, foto, dll) — seluruhnya di WhatsApp.
4. Setelah deal, admin login ke admin panel → **"Buat Undangan Baru (Manual)"** → isi form builder yang sama dengan versi self-serve, berdasarkan info dari chat.
5. Admin buat order, catat nominal, kirim info rekening/QRIS statis ke customer via WA.
6. Customer transfer → admin tandai order **"Lunas"** (opsional upload bukti transfer) → undangan otomatis `published`.
7. Admin kirim link undangan jadi ke customer via WA.

**Flow Tamu (Guest):**
1. Buka link undangan → 2. Lihat detail acara & galeri → 3. Isi RSVP (hadir/tidak + jumlah orang) → 4. Tulis ucapan → 5. (Opsional) lihat info hadiah/angpao digital.

**Flow Admin (harian):**
1. Login admin → 2. Cek order self-serve yang perlu perhatian (jika ada kendala pembayaran) → 3. Proses permintaan baru dari WhatsApp (buat undangan manual + order manual) → 4. Tandai pembayaran manual yang sudah masuk → 5. Kelola daftar tema & paket bila perlu.

## 6. Functional Requirements

### A. Public Marketing Site
- FR-A1: Landing page menjelaskan produk, contoh tema, dan daftar paket + harga.
- FR-A2: Halaman contoh undangan (demo) yang bisa diakses tanpa akun.
- FR-A3: CTA jelas ke halaman daftar/pilih paket (self-serve) **dan** ke galeri tema untuk jalur WhatsApp.
- FR-A4: Halaman `/tema` — galeri tema publik, tiap tema punya tombol **"Pesan via WhatsApp"** berupa link `wa.me` dengan pesan ter-prefill nama tema tersebut. Murni link statis, tidak memanggil backend.

### B. Autentikasi & Dashboard Customer (khusus jalur self-serve)
- FR-B1: Registrasi & login via email (email/password, opsional magic link).
- FR-B2: Dashboard menampilkan daftar undangan milik customer beserta statusnya (draft/menunggu bayar/published).
- FR-B3: Customer hanya bisa melihat & mengubah data miliknya sendiri (ditegakkan lewat Row Level Security).

### C. Invitation Builder
- FR-C1: Form isi data: nama kedua mempelai, tanggal, waktu & lokasi akad, waktu & lokasi resepsi (dengan link Google Maps).
- FR-C2: Upload galeri foto (jumlah maksimum sesuai paket).
- FR-C3: Upload/pilih musik latar (khusus paket yang mencakup fitur ini).
- FR-C4: Field cerita/kisah pasangan (teks bebas).
- FR-C5: Field info hadiah digital (nomor rekening/e-wallet, ditampilkan opsional di halaman publik).
- FR-C6: Pilih tema dari daftar tema yang tersedia sesuai paket.
- FR-C7: Tombol "Preview" menampilkan hasil akhir sebelum publish.
- FR-C8: Form builder yang sama (FR-C1–C7) dapat diakses & diisi oleh **admin atas nama customer**, untuk jalur WhatsApp.

### D. Halaman Undangan Publik (`/[slug]`)
- FR-D1: Dapat diakses tanpa login oleh siapa pun yang punya link.
- FR-D2: Menampilkan seluruh data yang diisi (nama, jadwal, lokasi, galeri, cerita, musik autoplay dengan tombol mute).
- FR-D3: Countdown menuju tanggal acara.
- FR-D4: Halaman hanya bisa diakses publik jika status undangan = `published` (baik dari pembayaran gateway maupun manual oleh admin).
- FR-D5: Responsif penuh untuk mobile.

### E. RSVP & Guestbook
- FR-E1: Form RSVP: nama tamu, status hadir/tidak, jumlah orang yang hadir.
- FR-E2: Form kirim ucapan (nama + pesan), tampil di halaman publik.
- FR-E3: Customer (atau admin, untuk undangan yang dibuatkan) bisa melihat rekap RSVP.
- FR-E4: Moderasi dasar — hapus ucapan yang tidak pantas.

### F. Payment & Order Management
- FR-F1: Integrasi payment gateway yang mendukung QRIS (Midtrans atau Xendit) — untuk jalur self-serve.
- FR-F2: Order self-serve otomatis dibuat berstatus `pending` saat customer pilih paket.
- FR-F3: Webhook dari payment gateway mengupdate status order menjadi `paid`/`failed`.
- FR-F4: Undangan otomatis berubah status ke `published` hanya setelah order berstatus `paid` (gateway) atau ditandai lunas oleh admin (manual).
- FR-F5: Order dapat memiliki `payment_method` = `gateway` atau `manual`, dibedakan di data dan tampilan admin panel.

### G. Admin Panel
- FR-G1: Login admin terpisah (role-based, bukan akun customer biasa).
- FR-G2: Daftar semua order (gateway + manual) + status pembayaran, dapat difilter/cari, termasuk filter berdasarkan sumber (self-serve/WhatsApp).
- FR-G3: Daftar semua undangan aktif lintas customer.
- FR-G4: CRUD daftar tema (nama, thumbnail, status premium/tidak).
- FR-G5: CRUD daftar paket & harga.
- FR-G6: Statistik ringkas (jumlah undangan, total pendapatan, order per status, **perbandingan jumlah order self-serve vs admin-assisted**).
- FR-G7: Admin dapat membuat undangan baru secara manual atas nama customer (memakai form builder yang sama, FR-C8), mengisi nama & nomor WhatsApp customer sebagai data referensi (tanpa perlu akun customer).
- FR-G8: Admin dapat membuat/mengedit order manual — input nominal, tandai status lunas, opsional upload bukti transfer sebagai arsip.
- FR-G9: Order manual yang ditandai lunas otomatis mengubah status undangan terkait menjadi `published`.

## 7. Non-Functional Requirements

- **Performa:** halaman undangan publik target waktu muat < 2 detik pada koneksi mobile rata-rata Indonesia.
- **Ketersediaan:** target uptime 99.5% untuk halaman publik.
- **Keamanan:** Row Level Security aktif di semua tabel; hanya `role = 'admin'` yang boleh membuat/mengubah undangan dengan `customer_id` kosong (hasil input manual); `service_role key` Supabase hanya dipakai server-side; verifikasi signature pada webhook payment.
- **Mobile-first:** desain dan performa dioptimalkan untuk HP.
- **Privasi data:** data tamu & data customer yang diinput manual (nama, nomor WA) hanya dipakai untuk keperluan undangan terkait.
- **Portabilitas:** arsitektur disiapkan agar bisa dipindah dari Vercel/Supabase cloud ke VPS self-hosted di kemudian hari tanpa perombakan besar.

## 8. Model Data (ringkas)

Skema dasar (`profiles`, `packages`, `themes`, `invitations`, `guests`, `wishes`, `orders`) mengikuti rancangan arsitektur sebelumnya, dengan penyesuaian untuk mendukung jalur admin-assisted:

```sql
-- invitations: dukung dibuat admin tanpa akun customer
alter table invitations
  alter column customer_id drop not null,      -- boleh null jika dibuat admin
  add column created_by_admin boolean default false,
  add column customer_name text,                -- referensi, bukan akun login
  add column customer_phone text;

-- orders: dukung pembayaran manual yang dikonfirmasi admin
alter table orders
  add column payment_method text default 'gateway',  -- gateway | manual
  add column confirmed_by uuid references profiles(id),
  add column payment_proof_url text;                  -- opsional
```

Tidak ada tabel `leads` di MVP ini — permintaan via WhatsApp tidak dicatat ke sistem sampai admin memutuskan untuk membuat undangannya.

## 9. Tech Stack & Arsitektur (ringkas)

- **Frontend & backend logic:** Next.js (App Router), hosting di Vercel.
- **Database, Auth, Storage:** Supabase (Postgres + RLS, Auth email/magic link, Storage untuk foto & musik).
- **Payment:** Midtrans atau Xendit (mendukung QRIS) untuk jalur self-serve; transfer manual/QRIS statis untuk jalur admin-assisted.
- **Migrasi masa depan:** direncanakan bisa pindah ke VPS (Supabase self-hosted via Docker/Coolify) tanpa mengganti kode aplikasi, hanya mengganti environment variable.

## 10. Paket & Monetisasi (Draft — perlu divalidasi ke pasar)

| Paket | Harga (contoh) | Fitur |
|---|---|---|
| Basic | Rp150.000 | 1 tema standar, RSVP & ucapan, maks. 20 foto, tanpa musik |
| Premium | Rp300.000 | Pilihan beberapa tema, RSVP unlimited, musik latar, maks. 50 foto |
| Deluxe | Rp500.000 | Semua fitur Premium + galeri video, prioritas dukungan |

Harga sama berlaku untuk kedua jalur pemesanan — hanya cara pembayaran & siapa yang input data yang berbeda.

## 11. Roadmap & Milestone

- **Fase 1 – MVP:** builder undangan dasar, 1–3 tema, halaman publik, RSVP + ucapan, **jalur self-serve dan jalur WhatsApp+admin berjalan bersamaan sejak awal**.
- **Fase 2:** admin panel lebih matang (laporan konversi, dsb), tambah pilihan tema.
- **Fase 3:** fitur lanjutan (custom domain, galeri video, live streaming, pencatatan lead terstruktur jika volume WhatsApp sudah tinggi) — di titik ini juga jadi momen evaluasi apakah perlu pindah ke VPS.

## 12. Risiko & Asumsi

- **Asumsi:** tim kecil/solo development di awal, budget terbatas, prioritas validasi ide dulu sebelum investasi infrastruktur besar.
- **Risiko pasar:** kompetisi cukup ramai di kategori undangan online Indonesia — perlu diferensiasi.
- **Risiko teknis:** ketergantungan pada Supabase free tier selama masa pengembangan (auto-pause setelah 7 hari tidak aktif) — perlu workaround (cron ping) sebelum live ke pelanggan.
- **Risiko operasional (jalur WhatsApp):** rekonsiliasi pembayaran manual rawan human error (admin lupa tandai lunas, salah nominal) — perlu SOP sederhana & idealnya notifikasi/reminder di admin panel untuk order manual yang masih `pending` lebih dari X jam.
- **Risiko pembayaran (jalur self-serve):** proses KYC merchant di payment gateway (Midtrans/Xendit) bisa makan waktu — mulai proses ini lebih awal, jangan mepet saat mau launch.

## 13. Ringkasan Out of Scope MVP

Pencatatan lead terstruktur (tabel `leads`), custom domain per customer, editor tema bebas (drag-and-drop), jenis acara selain pernikahan, blast WhatsApp otomatis, live streaming, program referral/afiliasi.
