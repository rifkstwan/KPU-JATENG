-- AlterTable
ALTER TABLE "pengajuan_sppd" ADD COLUMN     "kodeAkun" TEXT,
ADD COLUMN     "tempatBerangkat" TEXT,
ADD COLUMN     "tingkatBiaya" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "golongan" TEXT;
