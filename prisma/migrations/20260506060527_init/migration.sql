-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GURU');

-- CreateEnum
CREATE TYPE "StatusAbsensi" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPHA');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GURU',
    "kelasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "jurusan" TEXT,
    "tahunAjar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "foto" TEXT,
    "kelasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absensi" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "status" "StatusAbsensi" NOT NULL,
    "keterangan" TEXT,
    "siswaId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Absensi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nis_key" ON "Siswa"("nis");

-- CreateIndex
CREATE INDEX "Absensi_kelasId_tanggal_idx" ON "Absensi"("kelasId", "tanggal");

-- CreateIndex
CREATE INDEX "Absensi_tanggal_idx" ON "Absensi"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "Absensi_siswaId_tanggal_key" ON "Absensi"("siswaId", "tanggal");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
