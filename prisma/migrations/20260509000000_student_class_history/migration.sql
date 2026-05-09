-- CreateEnum
CREATE TYPE "StatusSiswa" AS ENUM ('AKTIF', 'LULUS', 'PINDAH', 'KELUAR');

-- CreateEnum
CREATE TYPE "StatusRiwayatKelas" AS ENUM ('AKTIF', 'NAIK', 'TINGGAL', 'LULUS', 'PINDAH', 'KELUAR');

-- AlterTable
ALTER TABLE "Siswa" ADD COLUMN "status" "StatusSiswa" NOT NULL DEFAULT 'AKTIF';

-- CreateTable
CREATE TABLE "RiwayatKelasSiswa" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "kelasId" TEXT,
    "tahunAjar" TEXT NOT NULL,
    "status" "StatusRiwayatKelas" NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatKelasSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiwayatKelasSiswa_siswaId_tahunAjar_idx" ON "RiwayatKelasSiswa"("siswaId", "tahunAjar");

-- CreateIndex
CREATE INDEX "RiwayatKelasSiswa_tahunAjar_idx" ON "RiwayatKelasSiswa"("tahunAjar");

-- AddForeignKey
ALTER TABLE "RiwayatKelasSiswa" ADD CONSTRAINT "RiwayatKelasSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatKelasSiswa" ADD CONSTRAINT "RiwayatKelasSiswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
