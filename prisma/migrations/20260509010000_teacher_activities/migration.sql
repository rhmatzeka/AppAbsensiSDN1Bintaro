-- CreateTable
CREATE TABLE "KegiatanGuru" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jamMulai" TEXT,
    "jamSelesai" TEXT,
    "materi" TEXT NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "catatan" TEXT,
    "userId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KegiatanGuru_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KegiatanGuru_tanggal_idx" ON "KegiatanGuru"("tanggal");

-- CreateIndex
CREATE INDEX "KegiatanGuru_userId_tanggal_idx" ON "KegiatanGuru"("userId", "tanggal");

-- CreateIndex
CREATE INDEX "KegiatanGuru_kelasId_tanggal_idx" ON "KegiatanGuru"("kelasId", "tanggal");

-- AddForeignKey
ALTER TABLE "KegiatanGuru" ADD CONSTRAINT "KegiatanGuru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KegiatanGuru" ADD CONSTRAINT "KegiatanGuru_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
