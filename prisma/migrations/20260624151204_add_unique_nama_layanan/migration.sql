/*
  Warnings:

  - A unique constraint covering the columns `[namaLayanan]` on the table `informasi_layanan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "informasi_layanan_namaLayanan_key" ON "informasi_layanan"("namaLayanan");
