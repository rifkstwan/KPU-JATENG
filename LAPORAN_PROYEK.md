# 📋 LAPORAN PROYEK LENGKAP
## Sistem Informasi Surat Perintah Perjalanan Dinas (SPPD)
### KPU Provinsi Jawa Tengah

---

**Nama Proyek:** SPPD-KPU Jawa Tengah  
**Versi:** 0.1.0  
**Tanggal Laporan:** 26 Juni 2026  
**Status:** Dalam Pengembangan  

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Gambaran Umum Proyek](#2-gambaran-umum-proyek)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Technology Stack](#4-technology-stack)
5. [Struktur Direktori Proyek](#5-struktur-direktori-proyek)
6. [Desain Database](#6-desain-database)
7. [Sistem Autentikasi & Otorisasi](#7-sistem-autentikasi--otorisasi)
8. [Fitur Aplikasi](#8-fitur-aplikasi)
9. [Halaman & Routing](#9-halaman--routing)
10. [API Endpoints](#10-api-endpoints)
11. [Komponen UI](#11-komponen-ui)
12. [Alur Bisnis Proses](#12-alur-bisnis-proses)
13. [Data Seeder & Akun Default](#13-data-seeder--akun-default)
14. [Konfigurasi & Environment](#14-konfigurasi--environment)
15. [Riwayat Migrasi Database](#15-riwayat-migrasi-database)
16. [Statistik Proyek](#16-statistik-proyek)
17. [Panduan Instalasi & Penggunaan](#17-panduan-instalasi--penggunaan)
18. [Potensi Pengembangan Lanjutan](#18-potensi-pengembangan-lanjutan)

---

## 1. PENDAHULUAN

### 1.1 Latar Belakang

Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah memerlukan sistem digital untuk mengelola Surat Perintah Perjalanan Dinas (SPPD) secara efisien. Proses manual yang selama ini berlaku memiliki keterbatasan dalam hal pelacakan status, transparansi persetujuan, dan pembuatan laporan.

Proyek **SPPD-KPU** dibangun sebagai solusi aplikasi web modern yang mendigitalisasi seluruh proses pengajuan, persetujuan, dan pelaporan perjalanan dinas, sekaligus menyediakan landing page publik untuk informasi layanan KPU.

### 1.2 Tujuan Proyek

| No | Tujuan | Deskripsi |
|----|--------|-----------|
| 1 | Digitalisasi SPPD | Menghilangkan proses manual pengajuan perjalanan dinas |
| 2 | Transparansi Approval | Menyediakan alur persetujuan digital yang dapat dilacak |
| 3 | Laporan & Rekap | Menghasilkan laporan dan rekap anggaran secara otomatis |
| 4 | Manajemen User | Mengelola data pegawai, approver, dan admin |
| 5 | Landing Page Publik | Menyediakan informasi layanan KPU untuk masyarakat |
| 6 | CMS Admin | Content Management System untuk mengelola konten landing page |

### 1.3 Ruang Lingkup

Sistem ini mencakup **3 (tiga) modul utama**:

1. **Modul SPPD Internal** — Pengajuan, persetujuan, dan pelaporan perjalanan dinas
2. **Modul Landing Page Publik** — Website informasi publik KPU Jawa Tengah
3. **Modul CMS Admin** — Pengelolaan konten landing page

---

## 2. GAMBARAN UMUM PROYEK

### 2.1 Deskripsi Singkat

SPPD-KPU adalah aplikasi web full-stack berbasis **Next.js 16** dengan database **PostgreSQL** yang dikelola melalui **Prisma ORM**. Aplikasi ini memiliki tiga area utama:

```
┌─────────────────────────────────────────────────────────┐
│                    SPPD-KPU SYSTEM                      │
├────────────────┬─────────────────┬──────────────────────┤
│   SPPD INTERNAL│  LANDING PAGE   │     CMS ADMIN        │
│   (/dashboard) │     (/)         │     (/cms)           │
├────────────────┼─────────────────┼──────────────────────┤
│ • Pengajuan    │ • Hero Section  │ • Kelola Berita      │
│ • Approval     │ • Berita        │ • Kelola Layanan     │
│ • Laporan      │ • Layanan       │ • Kelola Publikasi   │
│ • Notifikasi   │ • Publikasi     │ • Kelola Tentang KPU │
│ • Profil       │ • Kontak        │ • Kelola Kritik/Saran│
│ • Admin User   │ • Kritik/Saran  │ • Kelola User CMS    │
│ • Pengaturan   │ • Tentang KPU   │ • Dashboard CMS      │
└────────────────┴─────────────────┴──────────────────────┘
```

### 2.2 Target Pengguna

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **PEGAWAI** | Staf KPU yang mengajukan SPPD | Dashboard, Pengajuan, Daftar SPPD, Notifikasi, Profil |
| **APPROVER** | Pejabat yang menyetujui/menolak SPPD | Dashboard, Review Pengajuan, Semua SPPD, Laporan, Notifikasi, Profil |
| **ADMIN** | Administrator sistem SPPD | Semua fitur + Manajemen User + Laporan & Rekap |
| **CMS_ADMIN** | Administrator konten landing page | CMS Dashboard, Berita, Layanan, Publikasi, Tentang KPU, Kritik/Saran, User CMS |

---

## 3. ARSITEKTUR SISTEM

### 3.1 Arsitektur Aplikasi

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Landing Page  │  │  SPPD App    │  │   CMS Admin      │   │
│  │ (Public)      │  │  (Dashboard) │  │   (CMS Panel)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│                     Next.js 16 Server                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              App Router (Server Components)              │ │
│  ├─────────────┬────────────────┬──────────────────────────┤ │
│  │   Pages/    │   API Routes/  │     Middleware            │ │
│  │   Layouts   │   Endpoints    │   (Auth Guard)           │ │
│  ├─────────────┴────────────────┴──────────────────────────┤ │
│  │              NextAuth.js v5 (2 instances)                │ │
│  │         ┌──────────────┐  ┌──────────────┐              │ │
│  │         │ SPPD Auth    │  │  CMS Auth    │              │ │
│  │         │ (/api/auth)  │  │ (/api/auth/  │              │ │
│  │         │              │  │  cms)        │              │ │
│  │         └──────────────┘  └──────────────┘              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                    Prisma ORM v7.8                       │ │
│  │              (with PrismaPg Adapter)                     │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │ TCP :5432
┌────────────────────────────▼─────────────────────────────────┐
│                     PostgreSQL Database                       │
│         (13 Tabel + 6 Enum + 5 Migrasi)                     │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Pola Arsitektur

| Aspek | Implementasi |
|-------|-------------|
| **Rendering** | Server-Side Rendering (SSR) + Server Components |
| **Routing** | App Router (file-system based routing) |
| **Data Fetching** | Server Components langsung query database via Prisma |
| **API Design** | RESTful API Routes (Next.js Route Handlers) |
| **Authentication** | JWT-based via NextAuth.js v5 (2 instance terpisah) |
| **Database Access** | Prisma ORM dengan PostgreSQL adapter |
| **State Management** | Server-first, minimal client state |
| **Styling** | Tailwind CSS v4 + Inline Styles |

---

## 4. TECHNOLOGY STACK

### 4.1 Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 19.2.4 | UI library |
| **Next.js** | 16.2.6 | Full-stack React framework |
| **TypeScript** | ^5 | Static typing |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **Lucide React** | ^1.14.0 | Icon library |
| **React Hook Form** | ^7.75.0 | Form management |
| **@hookform/resolvers** | ^5.2.2 | Form validation resolvers |
| **Zod** | ^4.4.3 | Schema validation |
| **next-themes** | ^0.4.6 | Dark mode support |
| **class-variance-authority** | ^0.7.1 | Component variants |
| **clsx** | ^2.1.1 | Conditional classnames |
| **tailwind-merge** | ^3.5.0 | Merge Tailwind classes |
| **date-fns** | ^4.1.0 | Date utility |

### 4.2 Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js API Routes** | 16.2.6 | REST API endpoints |
| **Prisma ORM** | ^7.8.0 | Database ORM |
| **@prisma/adapter-pg** | ^7.8.0 | PostgreSQL adapter |
| **pg** | ^8.20.0 | PostgreSQL client |
| **NextAuth.js** | ^5.0.0-beta.31 | Authentication |
| **bcryptjs** | ^3.0.3 | Password hashing |

### 4.3 PDF Generation

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **@react-pdf/renderer** | ^4.5.1 | Generate PDF surat SPPD |

### 4.4 Database

| Teknologi | Fungsi |
|-----------|--------|
| **PostgreSQL** | Relational database utama |

### 4.5 Development Tools

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **ESLint** | ^9 | Code linting |
| **eslint-config-next** | 16.2.6 | Next.js ESLint rules |
| **ts-node** | ^10.9.2 | TypeScript execution (seeder) |
| **@tailwindcss/postcss** | ^4 | PostCSS plugin |

---

## 5. STRUKTUR DIREKTORI PROYEK

```
kpu_jateng/
├── 📄 package.json              # Dependencies & scripts
├── 📄 next.config.ts            # Konfigurasi Next.js
├── 📄 tsconfig.json             # Konfigurasi TypeScript
├── 📄 postcss.config.mjs        # PostCSS config
├── 📄 eslint.config.mjs         # ESLint config
├── 📄 prisma.config.ts          # Prisma config
├── 📄 check_user.js             # Script cek user
├── 📄 update_db.js / .ts        # Script update database
│
├── 📁 prisma/                   # Database Layer
│   ├── 📄 schema.prisma         # Schema database (284 baris)
│   ├── 📄 seed.ts               # Data seeder utama
│   ├── 📄 seed-cms.ts           # Data seeder CMS
│   └── 📁 migrations/           # 5 migrasi database
│       ├── 📁 20260507201709_init/
│       ├── 📁 20260511014952_add_foto_user/
│       ├── 📁 20260514140259_add_spd_fields/
│       ├── 📁 20260624150820_add_cms_and_landing_page/
│       └── 📁 20260624151204_add_unique_nama_layanan/
│
├── 📁 public/                   # Static Assets
│   ├── 🖼️ logo-kpu.png          # Logo KPU
│   ├── 🖼️ logo-jateng.svg       # Logo Jawa Tengah
│   ├── 🖼️ hero-bg.png           # Background hero section
│   ├── 🖼️ berita-1..5.png/jpg   # Gambar berita
│   └── 🖼️ opini-1..5.jpg/jpeg  # Gambar opini
│
└── 📁 src/                      # Source Code
    ├── 📄 middleware.ts          # Auth middleware (CMS guard)
    │
    ├── 📁 types/
    │   └── 📄 next-auth.d.ts    # NextAuth type augmentation
    │
    ├── 📁 lib/                  # Utility & Configuration
    │   ├── 📄 auth.ts           # NextAuth config (SPPD)
    │   ├── 📄 auth-cms.ts       # NextAuth config (CMS)
    │   ├── 📄 cms-auth-guard.ts # CMS auth guard helper
    │   ├── 📄 prisma.ts         # Prisma client singleton
    │   └── 📄 utils.ts          # Utility functions (cn, dll)
    │
    ├── 📁 components/           # Reusable Components
    │   ├── 📄 download-pdf-button.tsx
    │   ├── 📄 nav-link.tsx
    │   ├── 📄 notif-bell.tsx
    │   ├── 📄 sign-out-button.tsx
    │   ├── 📄 sppd-pdf.tsx
    │   ├── 📄 topbar-search.tsx
    │   ├── 📄 topbar-user.tsx
    │   │
    │   ├── 📁 cms/              # CMS Components
    │   │   ├── 📄 CMSHeader.tsx
    │   │   ├── 📄 CMSLoginForm.tsx
    │   │   ├── 📄 CMSSidebar.tsx
    │   │   └── 📄 DashboardFilters.tsx
    │   │
    │   └── 📁 public/           # Landing Page Components
    │       ├── 📄 top-nav.tsx
    │       ├── 📄 hero-section.tsx
    │       ├── 📄 news-section.tsx
    │       ├── 📄 publications-section.tsx
    │       ├── 📄 opinion-section.tsx
    │       ├── 📄 quick-links.tsx
    │       └── 📄 footer.tsx
    │
    └── 📁 app/                  # Pages & Routes
        ├── 📄 layout.tsx        # Root layout
        ├── 📄 globals.css       # Global styles
        ├── 📄 providers.tsx     # Theme/Session providers
        │
        ├── 📁 (public)/         # Landing Page (Public)
        │   ├── 📄 layout.tsx    # Public layout (TopNav+Footer)
        │   ├── 📄 page.tsx      # Homepage
        │   ├── 📁 berita/       # Halaman berita
        │   ├── 📁 kontak/       # Halaman kontak
        │   ├── 📁 kritik-saran/ # Form kritik & saran
        │   ├── 📁 layanan/      # Informasi layanan
        │   └── 📁 tentang/      # Tentang KPU
        │
        ├── 📁 (sppd)/           # SPPD Auth Group
        │   └── 📁 login/        # Halaman login SPPD
        │
        ├── 📁 cms-login/        # Halaman login CMS
        │
        ├── 📁 cms/              # CMS Admin Panel
        │   ├── 📄 layout.tsx    # CMS layout (Sidebar+Header)
        │   ├── 📁 dashboard/    # CMS Dashboard
        │   ├── 📁 berita/       # Kelola berita
        │   ├── 📁 layanan/      # Kelola layanan
        │   ├── 📁 publikasi/    # Kelola publikasi
        │   ├── 📁 tentang/      # Kelola profil KPU
        │   ├── 📁 kritik-saran/ # Kelola kritik & saran
        │   └── 📁 users/        # Kelola user CMS
        │
        ├── 📁 dashboard/        # SPPD Internal Dashboard
        │   ├── 📄 layout.tsx    # Dashboard layout (Sidebar+Topbar)
        │   ├── 📄 page.tsx      # Dashboard utama (role-based)
        │   ├── 📁 pengajuan/    # Form pengajuan SPPD
        │   │   └── 📁 edit/     # Edit pengajuan
        │   ├── 📁 sppd/         # Daftar semua SPPD
        │   ├── 📁 approval/     # Review & approval SPPD
        │   ├── 📁 laporan/      # Laporan & rekap
        │   ├── 📁 notifikasi/   # Pusat notifikasi
        │   ├── 📁 admin/        # Manajemen user
        │   ├── 📁 profil/       # Profil & ubah password
        │   └── 📁 pengaturan/   # Pengaturan akun
        │
        └── 📁 api/              # API Route Handlers
            ├── 📁 auth/
            │   ├── 📁 [...nextauth]/  # NextAuth SPPD handler
            │   └── 📁 cms/            # NextAuth CMS handler
            ├── 📁 pengajuan/     # CRUD pengajuan SPPD
            │   └── 📁 [id]/      # Operasi per-ID
            ├── 📁 approval/      # Proses approval
            │   └── 📁 [id]/      # Approve/Reject per-ID
            ├── 📁 sppd/          # Data SPPD
            │   └── 📁 [id]/      # Detail per-ID
            ├── 📁 admin/
            │   └── 📁 users/     # CRUD user admin
            ├── 📁 notifikasi/    # Notifikasi
            │   ├── 📁 mark-read/ # Tandai sudah dibaca
            │   └── 📁 mark-all-read/ # Tandai semua dibaca
            ├── 📁 profil/        # Update profil
            │   ├── 📁 foto/      # Upload foto
            │   └── 📁 password/  # Ganti password
            ├── 📁 search/        # Global search
            ├── 📁 layanan/       # Data layanan
            ├── 📁 cms/           # CMS API
            │   ├── 📁 berita/
            │   ├── 📁 kritik-saran/
            │   ├── 📁 layanan/
            │   ├── 📁 notifications/
            │   ├── 📁 publikasi/
            │   ├── 📁 tentang/
            │   └── 📁 users/
            └── 📁 public/        # Public API
                └── 📁 kritik-saran/
```

---

## 6. DESAIN DATABASE

### 6.1 Diagram Entity Relationship

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    User       │────<│  PengajuanSPPD   │>────│   Approval   │
│ (users)       │     │ (pengajuan_sppd) │     │ (approval)   │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)       │     │ id (PK)          │     │ id (PK)      │
│ nama          │     │ nomorSppd (UQ)   │     │ sppdId (FK)  │
│ nip (UQ)      │     │ userId (FK)      │     │ approverId(FK│
│ email (UQ)    │     │ tujuan           │     │ keputusan    │
│ password      │     │ tglBerangkat     │     │ catatan      │
│ jabatan       │     │ tglKembali       │     │ urutanLevel  │
│ divisi        │     │ transport        │     │ approvedAt   │
│ golongan      │     │ anggaran (BigInt)│     └──────────────┘
│ role (Enum)   │     │ maksud           │
│ foto          │     │ catatan          │     ┌──────────────┐
│ createdAt     │     │ status (Enum)    │>────│   Dokumen    │
│ updatedAt     │     │ tempatBerangkat  │     │ (dokumen)    │
└───────┬───────┘     │ tingkatBiaya     │     ├──────────────┤
        │             │ kodeAkun         │     │ id (PK)      │
        │             │ createdAt        │     │ sppdId (FK)  │
        │             │ updatedAt        │     │ namaFile     │
        │             └────────┬─────────┘     │ urlFile      │
        │                      │               │ tipeDokumen  │
        │                      │               │ uploadedAt   │
        │             ┌────────▼─────────┐     └──────────────┘
        │             │   SuratPdf       │
        │             │ (surat_pdf)      │     ┌──────────────┐
        │             ├──────────────────┤     │  Notifikasi  │
        │             │ id (PK)          │     │ (notifikasi) │
        └─────────────│ sppdId (FK)      │     ├──────────────┤
                      │ tipeSurat (Enum) │     │ id (PK)      │
                      │ urlPdf           │     │ userId (FK)  │
                      │ digenFerateOleh  │     │ sppdId (FK)  │
                      │ generatedAt      │     │ pesan        │
                      └──────────────────┘     │ tipe (Enum)  │
                                               │ isRead       │
┌──────────────┐  ┌──────────────┐             │ createdAt    │
│   Account    │  │   Session    │             └──────────────┘
│ (accounts)   │  │ (sessions)   │
├──────────────┤  ├──────────────┤    ┌───────────────────────┐
│ id (PK)      │  │ id (PK)      │    │ VerificationToken     │
│ userId (FK)  │  │ sessionToken │    │ (verification_tokens) │
│ type         │  │ userId (FK)  │    ├───────────────────────┤
│ provider     │  │ expires      │    │ identifier (UQ)       │
│ refresh_token│  └──────────────┘    │ token (UQ)            │
│ access_token │                      │ expires               │
│ expires_at   │                      └───────────────────────┘
└──────────────┘

─── LANDING PAGE MODELS ───────────────────────────────────────

┌────────────────┐  ┌──────────────┐  ┌──────────────────────┐
│InformasiLayanan│  │  KritikSaran │  │     TentangKPU       │
│(informasi_     │  │(kritik_saran)│  │  (tentang_kpu)       │
│  layanan)      │  ├──────────────┤  ├──────────────────────┤
├────────────────┤  │ id (PK)      │  │ id (PK)              │
│ id (PK)        │  │ nama         │  │ profil (Text)        │
│ namaLayanan(UQ)│  │ kontak       │  │ visi (Text)          │
│ persyaratan    │  │ isi (Text)   │  │ misi (Text)          │
│ jamPelayanan   │  │ status (Enum)│  │ alamat               │
│ alurPelayanan  │  │ balasan(Text)│  │ telepon              │
│ urutan         │  │ createdAt    │  │ email                │
│ aktif          │  │ updatedAt    │  │ mapEmbedUrl           │
│ createdAt      │  └──────────────┘  │ updatedAt            │
│ updatedAt      │                    └──────────────────────┘
└────────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   KontakKPU  │  │    Berita    │  │  Publikasi   │
│ (kontak_kpu) │  │  (berita)    │  │ (publikasi)  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ label        │  │ judul        │  │ judul        │
│ telepon      │  │ slug (UQ)    │  │ url          │
│ email        │  │ ringkasan    │  │ tanggal      │
│ whatsapp     │  │ konten(Text) │  │ published    │
│ urutan       │  │ gambarUrl    │  │ createdAt    │
│ aktif        │  │ kategori     │  │ updatedAt    │
│ createdAt    │  │ sumber       │  └──────────────┘
│ updatedAt    │  │ published    │
└──────────────┘  │ createdAt    │
                  │ updatedAt    │
                  └──────────────┘
```

### 6.2 Daftar Tabel Database

| No | Tabel | Nama DB | Jumlah Kolom | Deskripsi |
|----|-------|---------|--------------|-----------|
| 1 | User | `users` | 12 | Data pengguna sistem |
| 2 | PengajuanSPPD | `pengajuan_sppd` | 14 | Data pengajuan perjalanan dinas |
| 3 | Approval | `approval` | 6 | Data persetujuan/penolakan |
| 4 | Dokumen | `dokumen` | 5 | Dokumen lampiran SPPD |
| 5 | SuratPdf | `surat_pdf` | 5 | Surat PDF yang digenerate |
| 6 | Notifikasi | `notifikasi` | 6 | Notifikasi pengguna |
| 7 | Account | `accounts` | 11 | OAuth account (NextAuth) |
| 8 | Session | `sessions` | 4 | Session user (NextAuth) |
| 9 | VerificationToken | `verification_tokens` | 3 | Token verifikasi |
| 10 | InformasiLayanan | `informasi_layanan` | 7 | Data layanan publik |
| 11 | KritikSaran | `kritik_saran` | 6 | Kritik & saran masyarakat |
| 12 | TentangKPU | `tentang_kpu` | 8 | Profil, visi, misi KPU |
| 13 | KontakKPU | `kontak_kpu` | 7 | Data kontak KPU |
| 14 | Berita | `berita` | 9 | Berita & informasi |
| 15 | Publikasi | `publikasi` | 6 | Publikasi/dokumen publik |

### 6.3 Daftar Enum

| No | Enum | Nilai | Digunakan Di |
|----|------|-------|-------------|
| 1 | **Role** | `PEGAWAI`, `APPROVER`, `ADMIN`, `CMS_ADMIN` | User.role |
| 2 | **StatusSPPD** | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED` | PengajuanSPPD.status, Approval.keputusan |
| 3 | **JenisTransport** | `DARAT`, `UDARA`, `KERETA`, `LAUT` | PengajuanSPPD.transport |
| 4 | **TipeSurat** | `SPT`, `SPPD` | SuratPdf.tipeSurat |
| 5 | **TipeNotifikasi** | `PENDING`, `APPROVED`, `REJECTED`, `INFO` | Notifikasi.tipe |
| 6 | **KritikSaranStatus** | `BELUM_DIBACA`, `SUDAH_DIBACA`, `DIBALAS` | KritikSaran.status |

### 6.4 Relasi Antar Tabel

| Relasi | Tipe | Deskripsi |
|--------|------|-----------|
| User → PengajuanSPPD | One-to-Many | Satu user bisa punya banyak pengajuan |
| User → Approval | One-to-Many | Satu approver bisa punya banyak approval |
| User → SuratPdf | One-to-Many | Satu user bisa generate banyak surat |
| User → Notifikasi | One-to-Many | Satu user bisa punya banyak notifikasi |
| User → Account | One-to-Many | OAuth accounts |
| User → Session | One-to-Many | Active sessions |
| PengajuanSPPD → Approval | One-to-Many | Satu SPPD bisa punya banyak approval |
| PengajuanSPPD → Dokumen | One-to-Many | Satu SPPD bisa punya banyak dokumen |
| PengajuanSPPD → SuratPdf | One-to-Many | Satu SPPD bisa punya banyak surat PDF |
| PengajuanSPPD → Notifikasi | One-to-Many | Notifikasi terkait SPPD |

---

## 7. SISTEM AUTENTIKASI & OTORISASI

### 7.1 Dual Authentication System

Aplikasi ini menggunakan **dua instance NextAuth.js** yang terpisah:

#### Instance 1: SPPD Authentication (`/api/auth/[...nextauth]`)

| Konfigurasi | Nilai |
|-------------|-------|
| **Strategy** | JWT |
| **Provider** | Credentials (email + password) |
| **Login Page** | `/login` |
| **Roles** | PEGAWAI, APPROVER, ADMIN |
| **File** | `src/lib/auth.ts` |

#### Instance 2: CMS Authentication (`/api/auth/cms`)

| Konfigurasi | Nilai |
|-------------|-------|
| **Strategy** | JWT |
| **Provider** | Credentials (email + password) |
| **Login Page** | `/cms-login` |
| **Role Required** | CMS_ADMIN |
| **Custom Cookie** | `cms-session-token` |
| **File** | `src/lib/auth-cms.ts` |

### 7.2 Middleware Protection

```typescript
// File: src/middleware.ts
// Melindungi semua route /cms/* kecuali /cms-login
// Mengecek session token dari 4 kemungkinan cookie name
```

| Route Pattern | Proteksi |
|---------------|----------|
| `/cms/*` | Middleware redirect ke `/cms-login` jika tidak ada token |
| `/dashboard/*` | Server-side auth check, redirect ke `/login` |
| `/(public)/*` | Publik, tanpa proteksi |

### 7.3 Password Hashing

- Algoritma: **bcrypt** via `bcryptjs`
- Salt rounds: **12**

### 7.4 JWT Token Payload

```typescript
{
  id: string       // User ID
  email: string    // Email
  name: string     // Nama
  role: string     // Role enum
}
```

---

## 8. FITUR APLIKASI

### 8.1 Modul SPPD Internal

#### 8.1.1 Dashboard (Role-Based)

| Role | Fitur Dashboard |
|------|----------------|
| **PEGAWAI** | Greeting banner, Statistik (Total SPPD, Menunggu, Disetujui, Total Anggaran), Riwayat Pengajuan terbaru, Quick action "Ajukan SPPD Baru" |
| **APPROVER** | Greeting banner, Statistik (Menunggu Review, Diproses Hari Ini, Total Diproses), Antrian Terbaru, Riwayat Keputusan, Quick action "Review Pengajuan" |
| **ADMIN** | Greeting banner, Statistik (Total Pengguna per role, Menunggu, Disetujui, Total Anggaran), Tabel SPPD Terbaru, Quick action "Kelola User" & "Laporan" |

#### 8.1.2 Pengajuan SPPD

| Fitur | Deskripsi |
|-------|-----------|
| Form Pengajuan | Form lengkap dengan field tujuan, maksud, tanggal, transport, anggaran, catatan |
| Auto-generate Nomor | Format: `SPPD/YYYY/MMDD/RAND` |
| Status Awal | DRAFT |
| Kirim ke Approval | Ubah status menjadi PENDING |
| Edit Draft | Dapat mengedit SPPD yang masih DRAFT |
| Validasi | Server-side validation untuk field wajib |

#### 8.1.3 Daftar SPPD

| Fitur | Deskripsi |
|-------|-----------|
| Tampilan List | Daftar SPPD dengan status badge berwarna |
| Filter | Filter berdasarkan status |
| Role-based View | PEGAWAI hanya melihat SPPD miliknya, ADMIN/APPROVER melihat semua |

#### 8.1.4 Approval System

| Fitur | Deskripsi |
|-------|-----------|
| Review List | Daftar pengajuan dengan status PENDING |
| Detail View | Detail lengkap pengajuan sebelum keputusan |
| Approve/Reject | Tombol aksi dengan form catatan |
| Notifikasi | Otomatis kirim notifikasi ke pengaju |
| Multi-level | Support `urutanLevel` untuk multi-level approval |

#### 8.1.5 Laporan & Rekap

| Fitur | Deskripsi |
|-------|-----------|
| Rekap Data | Rekap SPPD berdasarkan periode |
| Filter | Filter berdasarkan tanggal, status, dll |
| Statistik | Statistik anggaran dan jumlah SPPD |

#### 8.1.6 Notifikasi

| Fitur | Deskripsi |
|-------|-----------|
| Real-time Bell | Bell icon dengan badge hitungan belum dibaca |
| Dropdown Preview | Preview 5 notifikasi terbaru di topbar |
| Halaman Notifikasi | Daftar semua notifikasi |
| Mark as Read | Tandai satu atau semua sudah dibaca |
| Tipe Notifikasi | PENDING, APPROVED, REJECTED, INFO |

#### 8.1.7 Manajemen User (Admin Only)

| Fitur | Deskripsi |
|-------|-----------|
| Daftar User | List semua user dengan detail |
| Tambah User | Form create user baru |
| Edit User | Edit data user termasuk role |
| Hapus User | Delete user |
| Reset Password | Admin bisa reset password user |

#### 8.1.8 Profil & Pengaturan

| Fitur | Deskripsi |
|-------|-----------|
| Lihat Profil | Tampilkan data profil lengkap |
| Edit Profil | Form ubah nama, jabatan, divisi, dll |
| Upload Foto | Upload foto profil |
| Ganti Password | Form ganti password lama ke baru |
| Pengaturan | Halaman pengaturan akun |

#### 8.1.9 PDF Generation

| Fitur | Deskripsi |
|-------|-----------|
| Generate SPPD PDF | Generate surat SPPD dalam format PDF |
| Download | Button download PDF |
| Template | Template resmi surat SPPD |

#### 8.1.10 Global Search

| Fitur | Deskripsi |
|-------|-----------|
| Search Bar | Search bar di topbar |
| Multi-entity | Cari di SPPD, user, dan lainnya |
| Results | Hasil pencarian dengan link langsung |

### 8.2 Modul Landing Page Publik

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| **Homepage** | `/` | Hero section, Quick links, Berita, Publikasi, Opini |
| **Berita** | `/berita` | Daftar berita KPU |
| **Layanan** | `/layanan` | Informasi layanan publik (persyaratan, jam, alur) |
| **Tentang** | `/tentang` | Profil, visi, misi KPU |
| **Kontak** | `/kontak` | Informasi kontak KPU |
| **Kritik & Saran** | `/kritik-saran` | Form pengiriman kritik dan saran |

#### Komponen Landing Page:

| Komponen | Deskripsi |
|----------|-----------|
| `TopNav` | Navigasi utama responsive |
| `HeroSection` | Banner utama dengan gambar background |
| `QuickLinks` | Link cepat ke layanan |
| `NewsSection` | Section berita terbaru |
| `PublicationsSection` | Section publikasi dokumen |
| `OpinionSection` | Section opini/editorial |
| `Footer` | Footer dengan informasi kontak |

### 8.3 Modul CMS Admin

| Halaman CMS | URL | Deskripsi |
|-------------|-----|-----------|
| **Login CMS** | `/cms-login` | Halaman login khusus CMS Admin |
| **Dashboard** | `/cms/dashboard` | Overview konten & statistik |
| **Berita** | `/cms/berita` | CRUD berita |
| **Layanan** | `/cms/layanan` | CRUD informasi layanan |
| **Publikasi** | `/cms/publikasi` | CRUD publikasi/dokumen |
| **Tentang** | `/cms/tentang` | Edit profil, visi, misi KPU |
| **Kritik/Saran** | `/cms/kritik-saran` | Manage kritik/saran & balas |
| **Users** | `/cms/users` | Manage user CMS |

#### Komponen CMS:

| Komponen | Deskripsi |
|----------|-----------|
| `CMSSidebar` | Sidebar navigasi CMS |
| `CMSHeader` | Header dengan user info & notifikasi kritik/saran |
| `CMSLoginForm` | Form login CMS |
| `DashboardFilters` | Filter untuk dashboard CMS |

---

## 9. HALAMAN & ROUTING

### 9.1 Route Map Lengkap

#### Public Routes (Tanpa Login)

| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `(public)/page.tsx` | Homepage |
| `/berita` | `(public)/berita/page.tsx` | Daftar berita |
| `/layanan` | `(public)/layanan/page.tsx` | Informasi layanan |
| `/tentang` | `(public)/tentang/page.tsx` | Tentang KPU |
| `/kontak` | `(public)/kontak/page.tsx` | Kontak KPU |
| `/kritik-saran` | `(public)/kritik-saran/page.tsx` | Form kritik & saran |
| `/login` | `(sppd)/login/page.tsx` | Login SPPD |
| `/cms-login` | `cms-login/page.tsx` | Login CMS |

#### Dashboard Routes (Perlu Login SPPD)

| Route | File | Akses Role |
|-------|------|------------|
| `/dashboard` | `dashboard/page.tsx` | ALL (role-based view) |
| `/dashboard/pengajuan` | `dashboard/pengajuan/page.tsx` | PEGAWAI |
| `/dashboard/pengajuan/edit` | `dashboard/pengajuan/edit/` | PEGAWAI |
| `/dashboard/sppd` | `dashboard/sppd/page.tsx` | ALL |
| `/dashboard/approval` | `dashboard/approval/page.tsx` | APPROVER, ADMIN |
| `/dashboard/laporan` | `dashboard/laporan/page.tsx` | APPROVER, ADMIN |
| `/dashboard/notifikasi` | `dashboard/notifikasi/page.tsx` | ALL |
| `/dashboard/admin` | `dashboard/admin/page.tsx` | ADMIN |
| `/dashboard/profil` | `dashboard/profil/page.tsx` | ALL |
| `/dashboard/pengaturan` | `dashboard/pengaturan/page.tsx` | ALL |

#### CMS Routes (Perlu Login CMS_ADMIN)

| Route | File | Deskripsi |
|-------|------|-----------|
| `/cms/dashboard` | `cms/dashboard/` | CMS Dashboard |
| `/cms/berita` | `cms/berita/` | Kelola berita |
| `/cms/layanan` | `cms/layanan/` | Kelola layanan |
| `/cms/publikasi` | `cms/publikasi/` | Kelola publikasi |
| `/cms/tentang` | `cms/tentang/` | Kelola profil KPU |
| `/cms/kritik-saran` | `cms/kritik-saran/` | Kelola kritik/saran |
| `/cms/users` | `cms/users/` | Kelola user CMS |

### 9.2 Sidebar Navigation (Per Role)

#### PEGAWAI

```
📊 Dashboard         → /dashboard
📄 Daftar SPPD       → /dashboard/sppd
➕ Ajukan SPPD       → /dashboard/pengajuan
🔔 Notifikasi        → /dashboard/notifikasi
👤 Profil Saya       → /dashboard/profil
──────────────────
⚙️  Pengaturan       → /dashboard/pengaturan
🚪 Keluar
```

#### APPROVER

```
📊 Dashboard         → /dashboard
✅ Review Pengajuan   → /dashboard/approval
📄 Semua SPPD        → /dashboard/sppd
📈 Laporan           → /dashboard/laporan
🔔 Notifikasi        → /dashboard/notifikasi
👤 Profil Saya       → /dashboard/profil
──────────────────
⚙️  Pengaturan       → /dashboard/pengaturan
🚪 Keluar
```

#### ADMIN

```
📊 Dashboard         → /dashboard
📄 Semua SPPD        → /dashboard/sppd
✅ Manajemen Approval → /dashboard/approval
📈 Laporan & Rekap   → /dashboard/laporan
🔔 Notifikasi        → /dashboard/notifikasi
👥 Manajemen User    → /dashboard/admin
👤 Profil Saya       → /dashboard/profil
──────────────────
⚙️  Pengaturan       → /dashboard/pengaturan
🚪 Keluar
```

---

## 10. API ENDPOINTS

### 10.1 Authentication API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler (signin, signout, session) |
| `GET` | `/api/auth/[...nextauth]` | NextAuth handler (CSRF, providers) |
| `POST` | `/api/auth/cms/[...nextauth]` | CMS NextAuth handler |
| `GET` | `/api/auth/cms/[...nextauth]` | CMS NextAuth handler |

### 10.2 Pengajuan SPPD API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/pengajuan` | PEGAWAI | Buat pengajuan SPPD baru |
| `PATCH` | `/api/pengajuan/[id]` | PEGAWAI | Update/submit pengajuan |
| `DELETE` | `/api/pengajuan/[id]` | PEGAWAI | Hapus pengajuan draft |

### 10.3 SPPD API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/sppd` | ALL | Daftar SPPD (filtered by role) |
| `GET` | `/api/sppd/[id]` | ALL | Detail SPPD |

### 10.4 Approval API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/approval/[id]` | APPROVER/ADMIN | Approve atau reject SPPD |

### 10.5 Admin API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/admin/users` | ADMIN | Daftar semua user |
| `POST` | `/api/admin/users` | ADMIN | Tambah user baru |
| `PATCH` | `/api/admin/users/[id]` | ADMIN | Edit user |
| `DELETE` | `/api/admin/users/[id]` | ADMIN | Hapus user |

### 10.6 Notifikasi API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/notifikasi` | ALL | Daftar notifikasi user |
| `POST` | `/api/notifikasi/mark-read` | ALL | Tandai notifikasi dibaca |
| `POST` | `/api/notifikasi/mark-all-read` | ALL | Tandai semua dibaca |

### 10.7 Profil API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/profil` | ALL | Data profil user |
| `PATCH` | `/api/profil` | ALL | Update profil |
| `POST` | `/api/profil/foto` | ALL | Upload foto profil |
| `PATCH` | `/api/profil/password` | ALL | Ganti password |

### 10.8 Search API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/search?q=...` | ALL | Global search |

### 10.9 Layanan API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/layanan` | Public | Daftar layanan |

### 10.10 CMS API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET/POST` | `/api/cms/berita` | CMS_ADMIN | CRUD berita |
| `GET/POST` | `/api/cms/kritik-saran` | CMS_ADMIN | Manage kritik/saran |
| `GET/POST` | `/api/cms/layanan` | CMS_ADMIN | CRUD layanan |
| `GET` | `/api/cms/notifications` | CMS_ADMIN | Notifikasi CMS |
| `GET/POST` | `/api/cms/publikasi` | CMS_ADMIN | CRUD publikasi |
| `GET/PATCH` | `/api/cms/tentang` | CMS_ADMIN | Kelola profil KPU |
| `GET/POST` | `/api/cms/users` | CMS_ADMIN | Manage user CMS |

### 10.11 Public API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/public/kritik-saran` | Public | Submit kritik/saran dari website |

---

## 11. KOMPONEN UI

### 11.1 Layout Components

| Komponen | File | Deskripsi |
|----------|------|-----------|
| Root Layout | `app/layout.tsx` | Layout HTML utama dengan providers |
| Providers | `app/providers.tsx` | Theme & session providers |
| Public Layout | `(public)/layout.tsx` | Layout landing page (TopNav + Footer) |
| Dashboard Layout | `dashboard/layout.tsx` | Layout SPPD (Sidebar + Topbar) |
| CMS Layout | `cms/layout.tsx` | Layout CMS (CMSSidebar + CMSHeader) |

### 11.2 SPPD Dashboard Components

| Komponen | File | Ukuran | Deskripsi |
|----------|------|--------|-----------|
| NavLink | `nav-link.tsx` | 1.4 KB | Sidebar navigation link dengan active state |
| SignOutButton | `sign-out-button.tsx` | 1.3 KB | Tombol keluar dari sistem |
| NotifBell | `notif-bell.tsx` | 9.9 KB | Bell notifikasi dengan dropdown dan badge |
| TopbarSearch | `topbar-search.tsx` | 14 KB | Search bar global dengan hasil instan |
| TopbarUser | `topbar-user.tsx` | 2.3 KB | User info di topbar dengan foto profil |
| DownloadPdfButton | `download-pdf-button.tsx` | 1.4 KB | Tombol download surat PDF |
| SppdPdf | `sppd-pdf.tsx` | 5.4 KB | Template PDF surat SPPD |

### 11.3 CMS Components

| Komponen | File | Ukuran | Deskripsi |
|----------|------|--------|-----------|
| CMSSidebar | `CMSSidebar.tsx` | 5.6 KB | Sidebar navigasi CMS |
| CMSHeader | `CMSHeader.tsx` | 13.4 KB | Header CMS dengan notifikasi kritik/saran |
| CMSLoginForm | `CMSLoginForm.tsx` | 17.8 KB | Form login CMS yang lengkap |
| DashboardFilters | `DashboardFilters.tsx` | 5.1 KB | Filter komponen untuk dashboard CMS |

### 11.4 Landing Page Components

| Komponen | File | Ukuran | Deskripsi |
|----------|------|--------|-----------|
| TopNav | `top-nav.tsx` | 3.9 KB | Navigasi utama website |
| HeroSection | `hero-section.tsx` | 1.7 KB | Banner hero dengan background image |
| NewsSection | `news-section.tsx` | 7.2 KB | Section berita terbaru |
| PublicationsSection | `publications-section.tsx` | 4.6 KB | Section publikasi |
| OpinionSection | `opinion-section.tsx` | 7.1 KB | Section opini/editorial |
| QuickLinks | `quick-links.tsx` | 1.8 KB | Quick links ke layanan |
| Footer | `footer.tsx` | 6.7 KB | Footer lengkap |

---

## 12. ALUR BISNIS PROSES

### 12.1 Alur Pengajuan SPPD

```
                    PEGAWAI                          APPROVER/ADMIN
                    ──────                           ──────────────
                       │
                       ▼
              ┌─────────────────┐
              │ Buat Pengajuan  │
              │ (Status: DRAFT) │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Edit / Lengkapi │
              │ Data Pengajuan  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Submit/Kirim    │
              │(Status: PENDING)│
              └────────┬────────┘
                       │
                       │ ──── Notifikasi ────▶  ┌─────────────────┐
                       │                         │ Review Pengajuan│
                       │                         └────────┬────────┘
                       │                                  │
                       │                         ┌────────▼────────┐
                       │                         │   Keputusan?    │
                       │                         └───┬─────────┬───┘
                       │                             │         │
                       │                  ┌──────────▼──┐ ┌────▼─────────┐
                       │                  │  APPROVED    │ │  REJECTED    │
              ◀── Notifikasi ────         │  (Disetujui)│ │  (Ditolak)   │
                       │                  └─────────────┘ └──────────────┘
                       ▼
              ┌─────────────────┐
              │ Generate PDF    │
              │ Surat SPPD      │
              └─────────────────┘
```

### 12.2 Alur Status SPPD

```
  ┌───────┐     Submit     ┌─────────┐     Approve    ┌──────────┐
  │ DRAFT │ ─────────────▶ │ PENDING │ ─────────────▶ │ APPROVED │
  └───────┘                └─────────┘                 └──────────┘
                                │
                                │ Reject
                                ▼
                           ┌──────────┐
                           │ REJECTED │
                           └──────────┘
```

### 12.3 Alur Kritik & Saran (Landing Page → CMS)

```
  Masyarakat                                      CMS Admin
  ──────────                                      ─────────
      │                                                │
      ▼                                                │
 ┌────────────┐                                        │
 │ Isi Form   │                                        │
 │ Kritik/    │                                        │
 │ Saran      │                                        │
 └─────┬──────┘                                        │
       │                                               │
       ▼                                               │
 ┌────────────┐    Notifikasi     ┌────────────┐       │
 │ Tersimpan  │ ────────────────▶ │ CMS Header │       │
 │ Status:    │                   │ Badge Count│       │
 │ BELUM_     │                   └─────┬──────┘       │
 │ DIBACA     │                         │              ▼
 └────────────┘                   ┌─────▼──────┐ ┌──────────┐
                                  │ Buka &     │ │  Balas   │
                                  │ Baca       │ │  Kritik/ │
                                  │ (SUDAH_    │ │  Saran   │
                                  │ DIBACA)    │ │ (DIBALAS)│
                                  └────────────┘ └──────────┘
```

---

## 13. DATA SEEDER & AKUN DEFAULT

### 13.1 Akun Default SPPD

| Role | Email | Password | Nama |
|------|-------|----------|------|
| PEGAWAI | `pegawai@kpu.go.id` | `password123` | Budi Santoso |
| APPROVER | `approver@kpu.go.id` | `password123` | Drs. Ahmad Fauzi |
| ADMIN | `admin@kpu.go.id` | `password123` | Siti Rahmawati |

### 13.2 Akun Default CMS

| Role | Email | Password | Nama |
|------|-------|----------|------|
| CMS_ADMIN | `admin.cms@kpu-jateng.go.id` | `Admin@CMS123` | Admin CMS KPU |

### 13.3 Data Sample

#### Pengajuan SPPD

| Nomor | Tujuan | Transport | Anggaran | Status |
|-------|--------|-----------|----------|--------|
| SPPD-2025-001 | Jakarta | UDARA | Rp 3.500.000 | APPROVED |
| SPPD-2025-002 | Semarang | DARAT | Rp 800.000 | PENDING |
| SPPD-2025-003 | Yogyakarta | KERETA | Rp 2.100.000 | PENDING |

#### Informasi Layanan

| Layanan | Jam Pelayanan |
|---------|---------------|
| Layanan Informasi Pemilih | Senin - Jumat, 08.00 - 16.00 WIB |
| Layanan Pendaftaran Calon | Senin - Jumat, 08.00 - 15.00 WIB |
| Layanan Pengaduan | Senin - Jumat, 08.00 - 16.00 WIB |

#### Kontak KPU

| Label | Telepon | Email |
|-------|---------|-------|
| Sekretariat Umum | (024) 8311523 | kpu-jatengprov@kpu.go.id |
| Bagian Humas | (024) 8311524 | humas.kpu-jateng@kpu.go.id |
| Bagian IT & Teknis | (024) 8311525 | it.kpu-jateng@kpu.go.id |

#### Tentang KPU

| Field | Value |
|-------|-------|
| Alamat | Jl. Veteran No.1A, Semarang, Jawa Tengah 50233 |
| Telepon | (024) 8311523 |
| Email | kpu-jatengprov@kpu.go.id |

---

## 14. KONFIGURASI & ENVIRONMENT

### 14.1 Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_SECRET` | Secret key untuk NextAuth SPPD |
| `CMS_NEXTAUTH_SECRET` | Secret key untuk NextAuth CMS (fallback ke AUTH_SECRET) |
| `NEXTAUTH_URL` | Base URL aplikasi |

### 14.2 Next.js Configuration

```typescript
// next.config.ts
{
  images: {
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}
```

### 14.3 Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `dev` | `NODE_OPTIONS='--max-old-space-size=4096' next dev --webpack` | Development server |
| `build` | `NODE_OPTIONS='--max-old-space-size=4096' next build` | Production build |
| `start` | `next start` | Production server |
| `seed` | `ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts` | Database seeding |

---

## 15. RIWAYAT MIGRASI DATABASE

| No | Migrasi | Tanggal | Deskripsi |
|----|---------|---------|-----------|
| 1 | `20260507201709_init` | 7 Mei 2026 | Schema awal: User, PengajuanSPPD, Approval, Dokumen, SuratPdf, Notifikasi, Account, Session, VerificationToken |
| 2 | `20260511014952_add_foto_user` | 11 Mei 2026 | Tambah field `foto` pada tabel User |
| 3 | `20260514140259_add_spd_fields` | 14 Mei 2026 | Tambah field `tempatBerangkat`, `tingkatBiaya`, `kodeAkun` pada PengajuanSPPD |
| 4 | `20260624150820_add_cms_and_landing_page` | 24 Juni 2026 | Tambah model landing page: InformasiLayanan, KritikSaran, TentangKPU, KontakKPU, Berita, Publikasi. Tambah role CMS_ADMIN dan enum KritikSaranStatus |
| 5 | `20260624151204_add_unique_nama_layanan` | 24 Juni 2026 | Tambah constraint unique pada `namaLayanan` di InformasiLayanan |

---

## 16. STATISTIK PROYEK

### 16.1 Statistik Kode Sumber

| Metrik | Nilai |
|--------|-------|
| **Total File Source** | 119 file (.ts / .tsx) |
| **Total Lines of Code** | ~16.803 baris |
| **Bahasa Utama** | TypeScript / TSX |
| **File Terbesar** | `dashboard/approval/client.tsx` (35.1 KB) |

### 16.2 Distribusi File per Modul

| Modul | Jumlah File | Deskripsi |
|-------|-------------|-----------|
| **Dashboard Pages** | ~20 file | Halaman-halaman SPPD internal |
| **API Routes** | ~25 file | Endpoint REST API |
| **Components** | 19 file | Komponen UI reusable |
| **CMS Pages** | ~8 file | Halaman CMS admin |
| **Public Pages** | ~7 file | Halaman landing page |
| **Lib/Config** | 5 file | Auth, Prisma, utilities |
| **Database** | 3 file | Schema + 2 seeder |

### 16.3 Statistik Database

| Metrik | Nilai |
|--------|-------|
| **Jumlah Tabel** | 15 tabel |
| **Jumlah Enum** | 6 enum |
| **Jumlah Migrasi** | 5 migrasi |
| **Schema Lines** | 284 baris |

---

## 17. PANDUAN INSTALASI & PENGGUNAAN

### 17.1 Prasyarat

| Software | Versi Minimum |
|----------|---------------|
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | 9+ |

### 17.2 Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd kpu_jateng

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database dan secret key

# 4. Setup database
npx prisma migrate dev

# 5. Seed database dengan data awal
npx prisma db seed

# 6. Jalankan development server
npm run dev
```

### 17.3 Akses Aplikasi

| Modul | URL | Deskripsi |
|-------|-----|-----------|
| Landing Page | `http://localhost:3000` | Website publik |
| Login SPPD | `http://localhost:3000/login` | Login pegawai/approver/admin |
| Dashboard | `http://localhost:3000/dashboard` | Panel SPPD (setelah login) |
| Login CMS | `http://localhost:3000/cms-login` | Login admin CMS |
| CMS Panel | `http://localhost:3000/cms/dashboard` | Panel CMS (setelah login) |

### 17.4 Panduan Penggunaan Singkat

#### Sebagai PEGAWAI:
1. Login dengan akun pegawai
2. Klik "Ajukan SPPD Baru" di dashboard
3. Isi form pengajuan (tujuan, tanggal, transport, anggaran, dst.)
4. Simpan sebagai DRAFT atau langsung Submit
5. Pantau status pengajuan di "Daftar SPPD"
6. Cek notifikasi untuk update status

#### Sebagai APPROVER:
1. Login dengan akun approver
2. Lihat antrian pengajuan di "Review Pengajuan"
3. Klik detail pengajuan untuk mereview
4. Approve atau Reject dengan catatan
5. Lihat riwayat keputusan di dashboard

#### Sebagai ADMIN:
1. Login dengan akun admin
2. Akses semua fitur SPPD + Manajemen User
3. Kelola user (tambah, edit, hapus, reset password)
4. Lihat laporan & rekap SPPD

#### Sebagai CMS_ADMIN:
1. Login di `/cms-login`
2. Kelola konten landing page (berita, layanan, publikasi, dst.)
3. Baca dan balas kritik/saran dari masyarakat

---

## 18. POTENSI PENGEMBANGAN LANJUTAN

| No | Fitur | Prioritas | Deskripsi |
|----|-------|-----------|-----------|
| 1 | Export Excel/PDF Laporan | Tinggi | Export laporan SPPD ke format Excel atau PDF |
| 2 | Multi-level Approval | Tinggi | Implementasi approval bertingkat (sudah ada field `urutanLevel`) |
| 3 | Upload Dokumen Lampiran | Tinggi | Upload bukti perjalanan dan kwitansi |
| 4 | Email Notification | Sedang | Kirim notifikasi via email selain in-app |
| 5 | Dashboard Analytics | Sedang | Grafik dan chart untuk analisis data SPPD |
| 6 | Mobile Responsive | Sedang | Optimasi tampilan untuk perangkat mobile |
| 7 | Audit Trail | Sedang | Log semua perubahan data untuk audit |
| 8 | Print SPPD | Rendah | Cetak langsung surat SPPD dari browser |
| 9 | Integrasi SIMPEG | Rendah | Integrasi dengan sistem kepegawaian |
| 10 | Dark Mode | Rendah | Dukungan tema gelap (sudah ada `next-themes`) |
| 11 | Rate Limiting | Rendah | Pembatasan akses API |
| 12 | Unit & E2E Testing | Tinggi | Automated testing untuk kualitas kode |

---

## LAMPIRAN

### A. Daftar Dependency Lengkap

#### Production Dependencies (22 packages)

```json
"@auth/prisma-adapter": "^2.11.2"
"@hookform/resolvers": "^5.2.2"
"@prisma/adapter-pg": "^7.8.0"
"@prisma/client": "^7.8.0"
"@radix-ui/react-slot": "^1.2.4"
"@react-pdf/renderer": "^4.5.1"
"bcryptjs": "^3.0.3"
"class-variance-authority": "^0.7.1"
"clsx": "^2.1.1"
"date-fns": "^4.1.0"
"lucide-react": "^1.14.0"
"next": "16.2.6"
"next-auth": "^5.0.0-beta.31"
"next-themes": "^0.4.6"
"pg": "^8.20.0"
"prisma": "^7.8.0"
"react": "19.2.4"
"react-dom": "19.2.4"
"react-hook-form": "^7.75.0"
"tailwind-merge": "^3.5.0"
"zod": "^4.4.3"
```

#### Dev Dependencies (8 packages)

```json
"@tailwindcss/postcss": "^4"
"@types/bcryptjs": "^2.4.6"
"@types/node": "^20"
"@types/pg": "^8.20.0"
"@types/react": "^19"
"@types/react-dom": "^19"
"eslint": "^9"
"eslint-config-next": "16.2.6"
"tailwindcss": "^4"
"ts-node": "^10.9.2"
"typescript": "^5"
```

### B. Static Assets

| File | Ukuran | Deskripsi |
|------|--------|-----------|
| `logo-kpu.png` | 167 KB | Logo resmi KPU |
| `logo-jateng.svg` | 927 KB | Logo Provinsi Jawa Tengah |
| `hero-bg.png` | 623 KB | Background hero section |
| `berita-1..5` | 510-668 KB | Gambar berita |
| `opini-1..5` | 29-55 KB | Gambar opini |

---

> **Dokumen ini dibuat secara otomatis berdasarkan analisis source code proyek SPPD-KPU Jawa Tengah.**  
> **Tanggal Generate:** 26 Juni 2026  
> **Total Halaman Tercetak Estimasi:** ~25 halaman  
