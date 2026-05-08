-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PEGAWAI', 'APPROVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusSPPD" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JenisTransport" AS ENUM ('DARAT', 'UDARA', 'KERETA', 'LAUT');

-- CreateEnum
CREATE TYPE "TipeSurat" AS ENUM ('SPT', 'SPPD');

-- CreateEnum
CREATE TYPE "TipeNotifikasi" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INFO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jabatan" TEXT,
    "divisi" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PEGAWAI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_sppd" (
    "id" TEXT NOT NULL,
    "nomorSppd" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "tglBerangkat" DATE NOT NULL,
    "tglKembali" DATE NOT NULL,
    "transport" "JenisTransport" NOT NULL DEFAULT 'DARAT',
    "anggaran" BIGINT NOT NULL DEFAULT 0,
    "maksud" TEXT NOT NULL,
    "catatan" TEXT,
    "status" "StatusSPPD" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_sppd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval" (
    "id" TEXT NOT NULL,
    "sppdId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "keputusan" "StatusSPPD" NOT NULL,
    "catatan" TEXT,
    "urutanLevel" INTEGER NOT NULL DEFAULT 1,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" TEXT NOT NULL,
    "sppdId" TEXT NOT NULL,
    "namaFile" TEXT NOT NULL,
    "urlFile" TEXT NOT NULL,
    "tipeDokumen" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_pdf" (
    "id" TEXT NOT NULL,
    "sppdId" TEXT NOT NULL,
    "tipeSurat" "TipeSurat" NOT NULL DEFAULT 'SPPD',
    "urlPdf" TEXT NOT NULL,
    "digenFerateOleh" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surat_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sppdId" TEXT,
    "pesan" TEXT NOT NULL,
    "tipe" "TipeNotifikasi" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengajuan_sppd_nomorSppd_key" ON "pengajuan_sppd"("nomorSppd");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "pengajuan_sppd" ADD CONSTRAINT "pengajuan_sppd_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval" ADD CONSTRAINT "approval_sppdId_fkey" FOREIGN KEY ("sppdId") REFERENCES "pengajuan_sppd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval" ADD CONSTRAINT "approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_sppdId_fkey" FOREIGN KEY ("sppdId") REFERENCES "pengajuan_sppd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_pdf" ADD CONSTRAINT "surat_pdf_sppdId_fkey" FOREIGN KEY ("sppdId") REFERENCES "pengajuan_sppd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_pdf" ADD CONSTRAINT "surat_pdf_digenFerateOleh_fkey" FOREIGN KEY ("digenFerateOleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_sppdId_fkey" FOREIGN KEY ("sppdId") REFERENCES "pengajuan_sppd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
