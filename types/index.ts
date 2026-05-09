export const ATTENDANCE_STATUSES = ["HADIR", "SAKIT", "IZIN", "ALPHA"] as const;
export const GENDERS = ["LAKI_LAKI", "PEREMPUAN"] as const;
export const USER_ROLES = ["ADMIN", "GURU"] as const;
export const STUDENT_STATUSES = ["AKTIF", "LULUS", "PINDAH", "KELUAR"] as const;
export const CLASS_HISTORY_STATUSES = ["AKTIF", "NAIK", "TINGGAL", "LULUS", "PINDAH", "KELUAR"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type Gender = (typeof GENDERS)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type StudentStatus = (typeof STUDENT_STATUSES)[number];
export type ClassHistoryStatus = (typeof CLASS_HISTORY_STATUSES)[number];

export type KelasSummary = {
  id: string;
  nama: string;
  tingkat: string;
  jurusan: string | null;
  tahunAjar: string;
  jumlahSiswa: number;
};

export type SiswaRow = {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string | null;
  alamat: string | null;
  foto: string | null;
  status: StudentStatus;
  kelasId: string;
  kelas: {
    id: string;
    nama: string;
  };
};

export type AbsensiInput = {
  siswaId: string;
  kelasId: string;
  tanggal: string;
  status: AttendanceStatus;
  keterangan?: string;
};

export type AbsensiRow = {
  id: string;
  tanggal: string;
  status: AttendanceStatus;
  keterangan: string | null;
  siswa: {
    id: string;
    nis: string;
    nama: string;
  };
  kelas: {
    id: string;
    nama: string;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

export type RekapRow = {
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  HADIR: number;
  SAKIT: number;
  IZIN: number;
  ALPHA: number;
  persentase: number;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kelasId: string | null;
  createdAt: string;
  kelas: {
    id: string;
    nama: string;
  } | null;
};

export type GuruLogRow = {
  id: string;
  tanggal: string;
  status: AttendanceStatus;
  keterangan: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  siswa: {
    id: string;
    nis: string;
    nama: string;
  };
  kelas: {
    id: string;
    nama: string;
  };
};

export type KegiatanGuruRow = {
  id: string;
  tanggal: string;
  jamMulai: string | null;
  jamSelesai: string | null;
  materi: string;
  kegiatan: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  kelas: {
    id: string;
    nama: string;
  };
};
