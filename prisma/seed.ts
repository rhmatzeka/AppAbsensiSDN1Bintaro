import { PrismaClient, StatusAbsensi, JenisKelamin, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

const kelasData = [
  { nama: "1A", tingkat: "1", jurusan: null, tahunAjar: "2025/2026" },
  { nama: "2A", tingkat: "2", jurusan: null, tahunAjar: "2025/2026" },
  { nama: "3A", tingkat: "3", jurusan: null, tahunAjar: "2025/2026" },
  { nama: "4A", tingkat: "4", jurusan: null, tahunAjar: "2025/2026" },
  { nama: "5A", tingkat: "5", jurusan: null, tahunAjar: "2025/2026" },
  { nama: "6A", tingkat: "6", jurusan: null, tahunAjar: "2025/2026" }
];

const studentsByClass = [
  [
    ["240101001", "Aisyah Putri Maharani", JenisKelamin.PEREMPUAN],
    ["240101002", "Raka Aditya Pratama", JenisKelamin.LAKI_LAKI],
    ["240101003", "Naila Zahra Fitri", JenisKelamin.PEREMPUAN],
    ["240101004", "Daffa Arkan Saputra", JenisKelamin.LAKI_LAKI],
    ["240101005", "Kayla Nur Azizah", JenisKelamin.PEREMPUAN],
    ["240101006", "Fathan Rizky Ramadhan", JenisKelamin.LAKI_LAKI],
    ["240101007", "Salsabila Khairunnisa", JenisKelamin.PEREMPUAN],
    ["240101008", "Alvaro Fikri Maulana", JenisKelamin.LAKI_LAKI],
    ["240101009", "Zahra Alya Safitri", JenisKelamin.PEREMPUAN],
    ["240101010", "Naufal Hafiz Prasetyo", JenisKelamin.LAKI_LAKI],
    ["240101011", "Kirana Anindya Lestari", JenisKelamin.PEREMPUAN],
    ["240101012", "Rafi Farrel Alfarizi", JenisKelamin.LAKI_LAKI]
  ],
  [
    ["230201001", "Aqila Syifa Humaira", JenisKelamin.PEREMPUAN],
    ["230201002", "Rayyan Danish Hakim", JenisKelamin.LAKI_LAKI],
    ["230201003", "Keisha Amira Putri", JenisKelamin.PEREMPUAN],
    ["230201004", "Bima Arya Nugraha", JenisKelamin.LAKI_LAKI],
    ["230201005", "Nadya Fitria Azzahra", JenisKelamin.PEREMPUAN],
    ["230201006", "Farel Andika Wijaya", JenisKelamin.LAKI_LAKI],
    ["230201007", "Citra Maharani Dewi", JenisKelamin.PEREMPUAN],
    ["230201008", "Gilang Ramadhan Yusuf", JenisKelamin.LAKI_LAKI],
    ["230201009", "Mikayla Salsabilla", JenisKelamin.PEREMPUAN],
    ["230201010", "Arsyad Ibrahim", JenisKelamin.LAKI_LAKI],
    ["230201011", "Hana Khansa Putri", JenisKelamin.PEREMPUAN],
    ["230201012", "Rizki Al Ghifari", JenisKelamin.LAKI_LAKI]
  ],
  [
    ["220301001", "Aurelia Nasywa Ramadhani", JenisKelamin.PEREMPUAN],
    ["220301002", "Rangga Mahesa Putra", JenisKelamin.LAKI_LAKI],
    ["220301003", "Salma Nur Azzahra", JenisKelamin.PEREMPUAN],
    ["220301004", "Kenzi Alvaro Saputra", JenisKelamin.LAKI_LAKI],
    ["220301005", "Naura Khadijah", JenisKelamin.PEREMPUAN],
    ["220301006", "Aldebaran Fathir", JenisKelamin.LAKI_LAKI],
    ["220301007", "Nasywa Putri Rahma", JenisKelamin.PEREMPUAN],
    ["220301008", "Farhan Maulana Akbar", JenisKelamin.LAKI_LAKI],
    ["220301009", "Rania Safira Aulia", JenisKelamin.PEREMPUAN],
    ["220301010", "Zidan Rafif Pratama", JenisKelamin.LAKI_LAKI],
    ["220301011", "Anindita Cahaya", JenisKelamin.PEREMPUAN],
    ["220301012", "Ilham Fadillah", JenisKelamin.LAKI_LAKI]
  ],
  [
    ["210401001", "Dinda Aulia Permata", JenisKelamin.PEREMPUAN],
    ["210401002", "Rafif Athallah", JenisKelamin.LAKI_LAKI],
    ["210401003", "Amelia Putri Santoso", JenisKelamin.PEREMPUAN],
    ["210401004", "Fauzan Dwi Prakoso", JenisKelamin.LAKI_LAKI],
    ["210401005", "Syifa Nurhaliza", JenisKelamin.PEREMPUAN],
    ["210401006", "Kevin Ardiansyah", JenisKelamin.LAKI_LAKI],
    ["210401007", "Larasati Ayu Wulandari", JenisKelamin.PEREMPUAN],
    ["210401008", "Bagas Satria Putra", JenisKelamin.LAKI_LAKI],
    ["210401009", "Tiara Putri Amanda", JenisKelamin.PEREMPUAN],
    ["210401010", "Reyhan Naufal Fikri", JenisKelamin.LAKI_LAKI],
    ["210401011", "Zahira Nabila", JenisKelamin.PEREMPUAN],
    ["210401012", "Dimas Arya Saputra", JenisKelamin.LAKI_LAKI]
  ],
  [
    ["200501001", "Maya Kirana Putri", JenisKelamin.PEREMPUAN],
    ["200501002", "Rizky Febrian", JenisKelamin.LAKI_LAKI],
    ["200501003", "Putri Azzahra Lestari", JenisKelamin.PEREMPUAN],
    ["200501004", "Muhammad Rafi Alfaruq", JenisKelamin.LAKI_LAKI],
    ["200501005", "Sabrina Nur Anjani", JenisKelamin.PEREMPUAN],
    ["200501006", "Aditya Bayu Pratama", JenisKelamin.LAKI_LAKI],
    ["200501007", "Nabila Fitriani", JenisKelamin.PEREMPUAN],
    ["200501008", "Rama Dwi Saputra", JenisKelamin.LAKI_LAKI],
    ["200501009", "Fathia Zahra Aprilia", JenisKelamin.PEREMPUAN],
    ["200501010", "Iqbal Maulana", JenisKelamin.LAKI_LAKI],
    ["200501011", "Aulia Rahma Syafira", JenisKelamin.PEREMPUAN],
    ["200501012", "Haikal Fikri Ramadhan", JenisKelamin.LAKI_LAKI]
  ],
  [
    ["190601001", "Najwa Shafira Humaira", JenisKelamin.PEREMPUAN],
    ["190601002", "Rafi Akmal Pratama", JenisKelamin.LAKI_LAKI],
    ["190601003", "Alya Nur Faradila", JenisKelamin.PEREMPUAN],
    ["190601004", "M Fadlan Ramadhan", JenisKelamin.LAKI_LAKI],
    ["190601005", "Keyla Azzahra Putri", JenisKelamin.PEREMPUAN],
    ["190601006", "Rizal Maulana Yusuf", JenisKelamin.LAKI_LAKI],
    ["190601007", "Dewi Rahmawati", JenisKelamin.PEREMPUAN],
    ["190601008", "Arkan Nabil Firdaus", JenisKelamin.LAKI_LAKI],
    ["190601009", "Siti Aulia Hasanah", JenisKelamin.PEREMPUAN],
    ["190601010", "Fikri Alamsyah", JenisKelamin.LAKI_LAKI],
    ["190601011", "Rara Sekar Ayu", JenisKelamin.PEREMPUAN],
    ["190601012", "Yoga Pratama", JenisKelamin.LAKI_LAKI]
  ]
] as const;

const addresses = [
  "Jl. Bintaro Permai No. 12, Pesanggrahan",
  "Jl. RC Veteran Raya Gg. Haji Naim No. 7",
  "Jl. Deplu Raya No. 18, Bintaro",
  "Jl. H. Som No. 24, Pondok Betung",
  "Jl. Pahlawan No. 5, Rempoa",
  "Jl. Cendrawasih No. 31, Bintaro",
  "Jl. Menjangan Raya No. 9, Pondok Ranji",
  "Jl. Elang Raya No. 14, Bintaro Jaya",
  "Jl. Merpati No. 22, Pesanggrahan",
  "Jl. Swadarma Raya No. 45, Ulujami",
  "Jl. Kesehatan Raya No. 3, Bintaro",
  "Jl. Kenanga No. 16, Petukangan Selatan"
];

const teacherNames = [
  "Ibu Siti Aminah",
  "Pak Ahmad Fauzi",
  "Ibu Rina Kartika",
  "Pak Dedi Setiawan",
  "Ibu Maya Lestari",
  "Pak Wahyu Hidayat"
];

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function birthDateForGrade(gradeIndex: number, studentIndex: number) {
  const currentYear = new Date().getFullYear();
  const age = 7 + gradeIndex;
  const year = currentYear - age;
  const month = (studentIndex * 3 + gradeIndex) % 12;
  const day = 3 + ((studentIndex * 5) % 24);
  return new Date(year, month, day);
}

function attendanceFor(studentIndex: number, dayOffset: number): StatusAbsensi {
  const roll = (studentIndex * 17 + dayOffset * 13 + (dayOffset % 5) * 7) % 100;

  if (roll < 84) return StatusAbsensi.HADIR;
  if (roll < 91) return StatusAbsensi.SAKIT;
  if (roll < 97) return StatusAbsensi.IZIN;
  return StatusAbsensi.ALPHA;
}

function noteFor(status: StatusAbsensi) {
  if (status === StatusAbsensi.HADIR) return null;
  if (status === StatusAbsensi.SAKIT) return "Demam / kurang sehat";
  if (status === StatusAbsensi.IZIN) return "Izin keluarga";
  return "Tanpa keterangan";
}

async function main() {
  await prisma.absensi.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.kelas.deleteMany();

  const kelas = await Promise.all(kelasData.map((item) => prisma.kelas.create({ data: item })));

  const adminPassword = await bcrypt.hash("admin123", 12);
  const guruPassword = await bcrypt.hash("guru123", 12);

  const admin = await prisma.user.create({
    data: { name: "Operator Sekolah", email: "admin@sekolah.sch.id", password: adminPassword, role: Role.ADMIN }
  });

  const teachers = await Promise.all(
    kelas.map((kelasItem, index) =>
      prisma.user.create({
        data: {
          name: teacherNames[index],
          email: `guru${index + 1}@sekolah.sch.id`,
          password: guruPassword,
          role: Role.GURU,
          kelasId: kelasItem.id
        }
      })
    )
  );

  await prisma.user.create({
    data: {
      name: "Guru Kelas",
      email: "guru@sekolah.sch.id",
      password: guruPassword,
      role: Role.GURU,
      kelasId: kelas[0].id
    }
  });

  const siswaData = [];
  for (const [kelasIndex, kelasItem] of kelas.entries()) {
    for (const [studentIndex, [nis, nama, jenisKelamin]] of studentsByClass[kelasIndex].entries()) {
      siswaData.push({
        nis,
        nama,
        jenisKelamin,
        tanggalLahir: birthDateForGrade(kelasIndex, studentIndex),
        alamat: addresses[studentIndex % addresses.length],
        kelasId: kelasItem.id
      });
    }
  }

  await prisma.siswa.createMany({ data: siswaData });

  const siswa = await prisma.siswa.findMany({
    orderBy: [{ kelas: { tingkat: "asc" } }, { nis: "asc" }]
  });

  const absensiData = [];
  for (let day = 0; day < 60; day += 1) {
    const tanggal = dateOnly(subDays(new Date(), day));
    const dayOfWeek = tanggal.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const [studentIndex, siswaItem] of siswa.entries()) {
      const status = attendanceFor(studentIndex, day);
      const teacher = teachers.find((item) => item.kelasId === siswaItem.kelasId);
      absensiData.push({
        tanggal,
        status,
        keterangan: noteFor(status),
        siswaId: siswaItem.id,
        kelasId: siswaItem.kelasId,
        userId: teacher?.id ?? admin.id
      });
    }
  }

  await prisma.absensi.createMany({ data: absensiData });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
