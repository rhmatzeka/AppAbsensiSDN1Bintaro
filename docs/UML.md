# UML Aplikasi Absensi SDN Bintaro 01

Dokumen ini merangkum rancangan UML aplikasi absensi siswa berbasis Next.js, NextAuth, Prisma, dan PostgreSQL. Diagram ditulis dengan Mermaid agar bisa langsung dilihat di GitHub.

## Ringkasan Sistem

- Aplikasi memiliki dua aktor utama: `ADMIN` dan `GURU`.
- `ADMIN` dapat mengelola data master, pengguna, laporan, log guru, dan proses kenaikan kelas.
- `GURU` dapat melihat data kelas yang ditugaskan, menginput absensi, dan mencatat kegiatan pembelajaran.
- Autentikasi memakai NextAuth Credentials dengan JWT session.
- Data utama disimpan di PostgreSQL melalui Prisma ORM.

## Use Case Diagram

```mermaid
flowchart LR
  Admin([Admin])
  Guru([Guru])

  subgraph Sistem["Aplikasi Absensi SDN Bintaro 01"]
    Login((Login))
    Dashboard((Lihat dashboard statistik))
    KelolaKelas((Kelola kelas))
    KelolaSiswa((Kelola siswa))
    LihatSiswa((Lihat data siswa))
    ImportSiswa((Import siswa CSV))
    KelolaPengguna((Kelola pengguna))
    InputAbsensi((Input absensi harian))
    DetailSiswa((Lihat detail siswa))
    RekapLaporan((Lihat rekap laporan))
    ExportCSV((Export CSV))
    PrintLaporan((Print laporan))
    CatatKegiatan((Catat kegiatan guru))
    LogGuru((Lihat log guru))
    KenaikanKelas((Proses kenaikan kelas))
  end

  Admin --> Login
  Admin --> Dashboard
  Admin --> KelolaKelas
  Admin --> KelolaSiswa
  Admin --> LihatSiswa
  Admin --> ImportSiswa
  Admin --> KelolaPengguna
  Admin --> InputAbsensi
  Admin --> DetailSiswa
  Admin --> RekapLaporan
  Admin --> ExportCSV
  Admin --> PrintLaporan
  Admin --> CatatKegiatan
  Admin --> LogGuru
  Admin --> KenaikanKelas

  Guru --> Login
  Guru --> Dashboard
  Guru --> LihatSiswa
  Guru --> InputAbsensi
  Guru --> DetailSiswa
  Guru --> RekapLaporan
  Guru --> ExportCSV
  Guru --> PrintLaporan
  Guru --> CatatKegiatan

  RekapLaporan --> ExportCSV
  RekapLaporan --> PrintLaporan
  InputAbsensi --> CatatKegiatan
```

## Class Diagram Domain

```mermaid
classDiagram
  class User {
    +String id
    +String name
    +String email
    +String password
    +Role role
    +String? kelasId
    +DateTime createdAt
  }

  class Kelas {
    +String id
    +String nama
    +String tingkat
    +String? jurusan
    +String tahunAjar
    +DateTime createdAt
  }

  class Siswa {
    +String id
    +String nis
    +String nama
    +JenisKelamin jenisKelamin
    +DateTime? tanggalLahir
    +String? alamat
    +String? foto
    +StatusSiswa status
    +String kelasId
    +DateTime createdAt
  }

  class Absensi {
    +String id
    +DateTime tanggal
    +StatusAbsensi status
    +String? keterangan
    +String siswaId
    +String kelasId
    +String userId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class RiwayatKelasSiswa {
    +String id
    +String siswaId
    +String? kelasId
    +String tahunAjar
    +StatusRiwayatKelas status
    +String? catatan
    +DateTime createdAt
  }

  class KegiatanGuru {
    +String id
    +DateTime tanggal
    +String? jamMulai
    +String? jamSelesai
    +String materi
    +String kegiatan
    +String? catatan
    +String userId
    +String kelasId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Role {
    <<enumeration>>
    ADMIN
    GURU
  }

  class StatusAbsensi {
    <<enumeration>>
    HADIR
    SAKIT
    IZIN
    ALPHA
  }

  class JenisKelamin {
    <<enumeration>>
    LAKI_LAKI
    PEREMPUAN
  }

  class StatusSiswa {
    <<enumeration>>
    AKTIF
    LULUS
    PINDAH
    KELUAR
  }

  class StatusRiwayatKelas {
    <<enumeration>>
    AKTIF
    NAIK
    TINGGAL
    LULUS
    PINDAH
    KELUAR
  }

  User --> Role : memiliki
  Siswa --> JenisKelamin : memiliki
  Siswa --> StatusSiswa : memiliki
  Absensi --> StatusAbsensi : memiliki
  RiwayatKelasSiswa --> StatusRiwayatKelas : memiliki

  Kelas "0..1" <-- "0..*" User : ditugaskan
  Kelas "1" <-- "0..*" Siswa : terdaftar
  Siswa "1" <-- "0..*" Absensi : memiliki
  Kelas "1" <-- "0..*" Absensi : dicatat untuk
  User "1" <-- "0..*" Absensi : diinput oleh
  Siswa "1" <-- "0..*" RiwayatKelasSiswa : riwayat
  Kelas "0..1" <-- "0..*" RiwayatKelasSiswa : tujuan/asal
  User "1" <-- "0..*" KegiatanGuru : mencatat
  Kelas "1" <-- "0..*" KegiatanGuru : berlangsung di
```

## ERD Database

```mermaid
erDiagram
  USER {
    string id PK
    string name
    string email UK
    string password
    Role role
    string kelasId FK "nullable"
    datetime createdAt
  }

  KELAS {
    string id PK
    string nama
    string tingkat
    string jurusan "nullable"
    string tahunAjar
    datetime createdAt
  }

  SISWA {
    string id PK
    string nis UK
    string nama
    JenisKelamin jenisKelamin
    datetime tanggalLahir "nullable"
    string alamat "nullable"
    string foto "nullable"
    StatusSiswa status
    string kelasId FK
    datetime createdAt
  }

  ABSENSI {
    string id PK
    date tanggal
    StatusAbsensi status
    string keterangan "nullable"
    string siswaId FK
    string kelasId FK
    string userId FK
    datetime createdAt
    datetime updatedAt
  }

  RIWAYAT_KELAS_SISWA {
    string id PK
    string siswaId FK
    string kelasId FK "nullable"
    string tahunAjar
    StatusRiwayatKelas status
    string catatan "nullable"
    datetime createdAt
  }

  KEGIATAN_GURU {
    string id PK
    date tanggal
    string jamMulai "nullable"
    string jamSelesai "nullable"
    string materi
    string kegiatan
    string catatan "nullable"
    string userId FK
    string kelasId FK
    datetime createdAt
    datetime updatedAt
  }

  KELAS ||--o{ USER : "menugaskan guru"
  KELAS ||--o{ SISWA : "berisi siswa"
  SISWA ||--o{ ABSENSI : "memiliki absensi"
  KELAS ||--o{ ABSENSI : "memiliki absensi"
  USER ||--o{ ABSENSI : "menginput absensi"
  SISWA ||--o{ RIWAYAT_KELAS_SISWA : "memiliki riwayat"
  KELAS |o--o{ RIWAYAT_KELAS_SISWA : "menjadi kelas riwayat"
  USER ||--o{ KEGIATAN_GURU : "mencatat kegiatan"
  KELAS ||--o{ KEGIATAN_GURU : "memiliki kegiatan"
```

## Sequence Diagram Login

```mermaid
sequenceDiagram
  actor Pengguna
  participant LoginPage as Halaman Login
  participant NextAuth as NextAuth Credentials
  participant Prisma as Prisma Client
  participant DB as PostgreSQL

  Pengguna->>LoginPage: Isi email dan password
  LoginPage->>NextAuth: signIn(credentials)
  NextAuth->>Prisma: user.findUnique(email)
  Prisma->>DB: SELECT user by email
  DB-->>Prisma: Data user dan hash password
  Prisma-->>NextAuth: User
  NextAuth->>NextAuth: bcrypt.compare(password, hash)

  alt Kredensial valid
    NextAuth->>NextAuth: Buat JWT berisi role dan kelasId
    NextAuth-->>LoginPage: Session aktif
    LoginPage-->>Pengguna: Redirect ke /dashboard
  else Kredensial tidak valid
    NextAuth-->>LoginPage: Error login
    LoginPage-->>Pengguna: Tampilkan pesan gagal
  end
```

## Sequence Diagram Input Absensi

```mermaid
sequenceDiagram
  actor Petugas as Admin/Guru
  participant Page as Halaman Absensi
  participant API as API /api/absensi
  participant Auth as requireUser()
  participant Prisma as Prisma Client
  participant DB as PostgreSQL

  Petugas->>Page: Pilih kelas, tanggal, dan status siswa
  Page->>API: POST tanggal + items absensi
  API->>Auth: Validasi session
  Auth-->>API: User aktif

  alt Role GURU
    API->>API: Pastikan kelasId sesuai kelas guru
    API->>Prisma: siswa.count(id in items, kelasId guru)
    Prisma->>DB: Validasi siswa berada di kelas guru
    DB-->>Prisma: Jumlah siswa valid
    Prisma-->>API: Count valid
  end

  API->>Prisma: $transaction(absensi.upsert per siswa)
  Prisma->>DB: INSERT/UPDATE absensi berdasarkan siswaId + tanggal
  DB-->>Prisma: Transaksi berhasil
  Prisma-->>API: ok
  API-->>Page: { ok: true }
  Page-->>Petugas: Data absensi tersimpan
```

## Sequence Diagram Rekap Laporan

```mermaid
sequenceDiagram
  actor Pengguna as Admin/Guru
  participant Page as Halaman Laporan
  participant API as API /api/absensi/rekap
  participant Auth as requireUser()
  participant Prisma as Prisma Client
  participant DB as PostgreSQL

  Pengguna->>Page: Pilih kelas dan periode laporan
  Page->>API: GET kelasId, periode, bulan/tahun atau rentang tanggal
  API->>Auth: Validasi session
  Auth-->>API: User aktif
  API->>API: Hitung start dan end periode
  API->>Prisma: siswa.findMany(status AKTIF, include absensi periode)
  Prisma->>DB: Query siswa dan absensi
  DB-->>Prisma: Data siswa + absensi
  Prisma-->>API: Dataset laporan
  API->>API: Hitung HADIR, SAKIT, IZIN, ALPHA, persentase
  API-->>Page: RekapRow[]
  Page-->>Pengguna: Tampilkan tabel, grafik, export CSV, atau print
```

## Activity Diagram Kenaikan Kelas

```mermaid
flowchart TD
  Start([Mulai]) --> Auth{User login?}
  Auth -- Tidak --> Login[Redirect ke login]
  Auth -- Ya --> Role{Role ADMIN?}
  Role -- Tidak --> Forbidden[Akses ditolak]
  Role -- Ya --> PilihTA[Pilih tahun ajar asal dan tahun ajar baru]
  PilihTA --> AmbilData[GET /api/kenaikan-kelas]
  AmbilData --> TampilkanSaran[Tampilkan siswa, kelas tujuan, dan saran status]
  TampilkanSaran --> Review[Admin review aksi: NAIK, TINGGAL, LULUS, PINDAH, KELUAR]
  Review --> Submit[POST /api/kenaikan-kelas]
  Submit --> Validasi{Data valid?}
  Validasi -- Tidak --> Error[Tampilkan error validasi]
  Validasi -- Ya --> Transaksi[Transaksi database]
  Transaksi --> UpdateSiswa[Update status dan kelas siswa]
  Transaksi --> BuatRiwayat[Create RiwayatKelasSiswa]
  UpdateSiswa --> Selesai([Selesai])
  BuatRiwayat --> Selesai
```

## Component Diagram

```mermaid
flowchart LR
  Browser[Browser Pengguna]

  subgraph NextApp[Next.js App Router]
    Pages[Dashboard Pages]
    Components[UI Components]
    Hooks[React Hooks]
    Middleware[Middleware Auth Redirect]
    Auth[NextAuth Credentials]
    API[Route Handlers /api]
  end

  subgraph Server[Server Runtime]
    Prisma[Prisma Client]
    Bcrypt[bcryptjs]
  end

  DB[(PostgreSQL)]

  Browser --> Pages
  Pages --> Components
  Pages --> Hooks
  Hooks --> API
  Browser --> Middleware
  Middleware --> Auth
  API --> Auth
  Auth --> Bcrypt
  Auth --> Prisma
  API --> Prisma
  Prisma --> DB
```

## Kontrol Akses Utama

| Fitur | Admin | Guru |
| --- | --- | --- |
| Login dan dashboard | Ya | Ya |
| Kelola pengguna | Ya | Tidak |
| Kelola kelas | Ya | Ya, endpoint dan halaman kelas tersedia untuk user login saat ini |
| Tambah, edit, hapus siswa | Ya | Tidak |
| Lihat siswa | Ya | Ya, dibatasi kelas yang ditugaskan saat tidak memilih kelas lain |
| Input absensi | Ya | Ya, hanya kelas yang ditugaskan |
| Rekap laporan | Ya | Ya |
| Lihat log guru | Ya | Tidak |
| Catat kegiatan guru | Ya | Ya, guru hanya kelas yang ditugaskan |
| Kenaikan kelas | Ya | Tidak |

## Endpoint Terkait

| Modul | Endpoint | Fungsi Utama |
| --- | --- | --- |
| Auth | `/api/auth/[...nextauth]` | Login credentials dan session JWT |
| Dashboard | `/api/dashboard/stats` | Statistik siswa, hadir hari ini, dan chart kelas |
| Kelas | `/api/kelas`, `/api/kelas/[id]` | CRUD data kelas |
| Siswa | `/api/siswa`, `/api/siswa/[id]` | CRUD, pagination, pencarian, dan import bulk siswa |
| Absensi | `/api/absensi`, `/api/absensi/[id]` | List, detail, dan upsert absensi harian |
| Rekap | `/api/absensi/rekap` | Rekap mingguan atau bulanan per siswa |
| Pengguna | `/api/users`, `/api/users/[id]` | CRUD akun admin dan guru |
| Kegiatan | `/api/kegiatan`, `/api/kegiatan/[id]` | Catatan materi dan kegiatan guru |
| Log Guru | `/api/logs/guru` | Audit input absensi oleh guru |
| Kenaikan Kelas | `/api/kenaikan-kelas` | Proses naik kelas, tinggal kelas, lulus, pindah, atau keluar |
