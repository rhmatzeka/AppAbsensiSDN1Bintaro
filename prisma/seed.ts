import { PrismaClient, StatusAbsensi, JenisKelamin, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

const statuses: StatusAbsensi[] = [
  StatusAbsensi.HADIR,
  StatusAbsensi.HADIR,
  StatusAbsensi.HADIR,
  StatusAbsensi.HADIR,
  StatusAbsensi.HADIR,
  StatusAbsensi.SAKIT,
  StatusAbsensi.IZIN,
  StatusAbsensi.ALPHA
];

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function main() {
  await prisma.absensi.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.kelas.deleteMany();

  const kelasData = [
    { nama: "X IPA 1", tingkat: "X", jurusan: "IPA", tahunAjar: "2024/2025" },
    { nama: "XI IPS 2", tingkat: "XI", jurusan: "IPS", tahunAjar: "2024/2025" },
    { nama: "XII IPA 3", tingkat: "XII", jurusan: "IPA", tahunAjar: "2024/2025" }
  ];

  const kelas = await Promise.all(kelasData.map((item) => prisma.kelas.create({ data: item })));

  const adminPassword = await bcrypt.hash("admin123", 12);
  const guruPassword = await bcrypt.hash("guru123", 12);

  const [admin, guru] = await Promise.all([
    prisma.user.create({
      data: { name: "Administrator", email: "admin@sekolah.sch.id", password: adminPassword, role: Role.ADMIN }
    }),
    prisma.user.create({
      data: { name: "Guru Kelas", email: "guru@sekolah.sch.id", password: guruPassword, role: Role.GURU, kelasId: kelas[0].id }
    })
  ]);

  const siswa = [];
  for (const [kelasIndex, kelasItem] of kelas.entries()) {
    for (let i = 1; i <= 10; i += 1) {
      siswa.push(
        await prisma.siswa.create({
          data: {
            nis: `${202400 + kelasIndex * 100 + i}`,
            nama: `Siswa ${kelasItem.nama} ${i}`,
            jenisKelamin: i % 2 === 0 ? JenisKelamin.PEREMPUAN : JenisKelamin.LAKI_LAKI,
            tanggalLahir: new Date(2007 + kelasIndex, i % 12, Math.max(1, i)),
            alamat: `Jl. Pendidikan No. ${i}`,
            kelasId: kelasItem.id
          }
        })
      );
    }
  }

  for (let day = 0; day < 30; day += 1) {
    const tanggal = dateOnly(subDays(new Date(), day));
    if (tanggal.getDay() === 0) continue;

    for (const siswaItem of siswa) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await prisma.absensi.create({
        data: {
          tanggal,
          status,
          keterangan: status === StatusAbsensi.HADIR ? null : "Data contoh",
          siswaId: siswaItem.id,
          kelasId: siswaItem.kelasId,
          userId: siswaItem.kelasId === kelas[0].id ? guru.id : admin.id
        }
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
