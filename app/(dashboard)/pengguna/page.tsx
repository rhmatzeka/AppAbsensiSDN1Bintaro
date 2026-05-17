"use client";

import { useSession } from "next-auth/react";
import { Edit2, Plus, Search, Trash2, UserCog } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useKelas } from "@/hooks/useKelas";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";
import type { UserRole, UserRow } from "@/types";

type UserForm = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  kelasId: string;
};

const emptyForm: UserForm = { name: "", email: "", password: "", role: "GURU", kelasId: "" };

export default function PenggunaPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { data, isLoading, mutate } = useUsers();
  const { data: kelas } = useKelas();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isAdmin = session?.user.role === "ADMIN";
  const kelasOptions = kelas ?? [];
  const users = useMemo(() => data ?? [], [data]);
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const roleLabel = user.role === "ADMIN" ? "admin" : "guru";
      return [user.name, user.email, roleLabel, user.kelas?.nama ?? ""].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [search, users]);

  function openCreate() {
    setForm({ ...emptyForm, kelasId: kelasOptions[0]?.id ?? "" });
    setOpen(true);
  }

  function openEdit(user: UserRow) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      kelasId: user.kelasId ?? ""
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Nama dan email wajib diisi", "error");
      return;
    }
    if (!form.id && form.password.length < 6) {
      showToast("Password minimal 6 karakter", "error");
      return;
    }
    if (form.role === "GURU" && !form.kelasId) {
      showToast("Guru wajib ditugaskan ke kelas", "error");
      return;
    }

    setSaving(true);
    const response = await fetch(form.id ? `/api/users/${form.id}` : "/api/users", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        kelasId: form.role === "GURU" ? form.kelasId : null
      })
    });
    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ message: "Gagal menyimpan user" }))) as { message?: string };
      showToast(data.message ?? "Gagal menyimpan user", "error");
      return;
    }

    setOpen(false);
    await mutate();
    showToast("User berhasil disimpan");
  }

  async function remove(user: UserRow) {
    if (!window.confirm(`Hapus user ${user.name}?`)) return;
    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({ message: "Gagal menghapus user" }))) as { message?: string };
      showToast(data.message ?? "Gagal menghapus user", "error");
      return;
    }
    await mutate();
    showToast("User berhasil dihapus");
  }

  if (!isAdmin) {
    return (
      <PageShell title="Manajemen User" description="Halaman ini hanya tersedia untuk admin.">
        <EmptyState title="Akses ditolak" description="Gunakan akun admin untuk mengelola user." />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Manajemen User"
      description="Tambahkan admin atau guru, atur role, dan tugaskan guru ke kelas."
      action={
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className="pl-10"
            placeholder="Cari nama, email, role, atau kelas"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <p className="text-sm font-medium text-neutral-500">
          {filteredUsers.length} dari {users.length} user
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : !users.length ? (
        <EmptyState title="User belum ada" description="Tambahkan user untuk mulai mengatur akses aplikasi." />
      ) : !filteredUsers.length ? (
        <EmptyState title="User tidak ditemukan" description="Ubah kata kunci pencarian untuk melihat data user." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Kelas</Th>
              <Th>Dibuat</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-orange-50/30">
                <Td className="font-semibold text-neutral-800">{user.name}</Td>
                <Td className="font-mono text-xs text-neutral-500">{user.email}</Td>
                <Td>
                  <Badge className={user.role === "ADMIN" ? "bg-neutral-900 text-white" : "bg-orange-50 text-orange-700"}>
                    {user.role === "ADMIN" ? "Admin" : "Guru"}
                  </Badge>
                </Td>
                <Td>{user.kelas?.nama ?? "-"}</Td>
                <Td className="text-xs text-neutral-400">{formatDate(user.createdAt, "d MMM yyyy")}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-amber-50 hover:text-amber-600" onClick={() => openEdit(user)} aria-label="Edit user">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => void remove(user)} aria-label="Hapus user">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={form.id ? "Edit User" : "Tambah User"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Nama</span>
            <Input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Email</span>
            <Input type="email" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Role</span>
            <Select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
              <option value="ADMIN">Admin</option>
              <option value="GURU">Guru</option>
            </Select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Kelas Guru</span>
            <Select value={form.kelasId} onChange={(event) => setForm((current) => ({ ...current, kelasId: event.target.value }))} disabled={form.role === "ADMIN"}>
              <option value="">Pilih kelas</option>
              {kelasOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </Select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">{form.id ? "Password Baru" : "Password"}</span>
            <Input
              type="password"
              required={!form.id}
              minLength={6}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={form.id ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter"}
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              <UserCog className="h-4 w-4" />
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
