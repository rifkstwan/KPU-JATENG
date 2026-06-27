-- CreateEnum
CREATE TYPE "KritikSaranStatus" AS ENUM ('BELUM_DIBACA', 'SUDAH_DIBACA', 'DIBALAS');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CMS_ADMIN';

-- CreateTable
CREATE TABLE "informasi_layanan" (
    "id" TEXT NOT NULL,
    "namaLayanan" TEXT NOT NULL,
    "persyaratan" TEXT NOT NULL,
    "jamPelayanan" TEXT NOT NULL,
    "alurPelayanan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informasi_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kritik_saran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,
    "isi" TEXT NOT NULL,
    "status" "KritikSaranStatus" NOT NULL DEFAULT 'BELUM_DIBACA',
    "balasan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kritik_saran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentang_kpu" (
    "id" TEXT NOT NULL,
    "profil" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT,
    "email" TEXT,
    "mapEmbedUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tentang_kpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kontak_kpu" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "telepon" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kontak_kpu_pkey" PRIMARY KEY ("id")
);
