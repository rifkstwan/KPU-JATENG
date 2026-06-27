"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Mail,
  Lock,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  UserCircle2,
} from "lucide-react"

type User = {
  id: string
  nama: string
  email: string
  role: string
  jabatan: string | null
  divisi: string | null
  createdAt: string
}

type FormData = {
  nama: string
  email: string
  password: string
  jabatan: string
  divisi: string
}

const emptyForm: FormData = { nama: "", email: "", password: "", jabatan: "", divisi: "" }

function getRoleColor(role: string) {
  switch (role) {
    case "CMS_ADMIN": return "bg-red-100 text-red-700 border border-red-200"
    case "ADMIN": return "bg-orange-100 text-orange-700 border border-orange-200"
    case "APPROVER": return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    default: return "bg-zinc-100 text-zinc-600 border border-zinc-200"
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "CMS_ADMIN": return "CMS Admin"
    case "ADMIN": return "Admin"
    case "APPROVER": return "Approver"
    default: return "Pegawai"
  }
}

function getInitials(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "from-red-700 to-red-900",
  "from-amber-600 to-amber-800",
  "from-rose-600 to-rose-800",
  "from-orange-600 to-orange-800",
  "from-red-500 to-rose-700",
]

export default function CMSUsersPage() {
  const [data, setData] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q
        ? data.filter(
            (u) =>
              u.nama.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.jabatan || "").toLowerCase().includes(q) ||
              (u.divisi || "").toLowerCase().includes(q)
          )
        : data
    )
  }, [search, data])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/users")
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function openCreate() {
    setEditingUser(null)
    setForm(emptyForm)
    setShowPassword(false)
    setShowModal(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setForm({
      nama: user.nama,
      email: user.email,
      password: "",
      jabatan: user.jabatan || "",
      divisi: user.divisi || "",
    })
    setShowPassword(false)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nama || !form.email) {
      showToast("error", "Nama dan email wajib diisi")
      return
    }
    if (!editingUser && !form.password) {
      showToast("error", "Password wajib diisi untuk user baru")
      return
    }

    setSaving(true)
    try {
      const url = editingUser ? `/api/cms/users/${editingUser.id}` : "/api/cms/users"
      const method = editingUser ? "PATCH" : "POST"
      const body: Record<string, string> = {
        nama: form.nama,
        email: form.email,
        jabatan: form.jabatan,
        divisi: form.divisi,
      }
      if (form.password) body.password = form.password

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) {
        showToast("error", json.error || "Gagal menyimpan")
      } else {
        showToast("success", editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan")
        setShowModal(false)
        loadData()
      }
    } catch {
      showToast("error", "Terjadi kesalahan server")
    }
    setSaving(false)
  }

  async function handleDelete(user: User) {
    setDeletingId(user.id)
    try {
      const res = await fetch(`/api/cms/users/${user.id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("success", "User berhasil dihapus")
        setData((prev) => prev.filter((u) => u.id !== user.id))
      } else {
        showToast("error", "Gagal menghapus user")
      }
    } catch {
      showToast("error", "Terjadi kesalahan server")
    }
    setDeletingId(null)
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Manajemen User CMS</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Kelola akun administrator portal KPU Jawa Tengah</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/20 active:scale-95 duration-150"
        >
          <Plus className="w-4 h-4" />
          Tambah Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Admin</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{data.length}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Akun aktif terdaftar</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 p-4 shadow-sm">
          <p className="text-xs text-red-700 font-medium uppercase tracking-wide">CMS Admin</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{data.filter((u) => u.role === "CMS_ADMIN").length}</p>
          <p className="text-xs text-red-500 mt-0.5">Pengelola konten portal</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Hasil Pencarian</p>
          <p className="text-3xl font-bold text-amber-800 mt-1">{filtered.length}</p>
          <p className="text-xs text-amber-500 mt-0.5">Dari {data.length} total data</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, jabatan, atau divisi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Administrator
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Jabatan / Divisi
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Terdaftar
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <Loader2 className="w-7 h-7 text-red-700 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Memuat data...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <UserCircle2 className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400 font-medium">Belum ada data administrator</p>
                  <p className="text-xs text-zinc-300 mt-1">Tambahkan admin CMS baru untuk memulai</p>
                </td>
              </tr>
            ) : (
              filtered.map((user, idx) => (
                <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors duration-150">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                          AVATAR_COLORS[idx % AVATAR_COLORS.length]
                        } flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}
                      >
                        {getInitials(user.nama)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{user.nama}</p>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {user.jabatan || user.divisi ? (
                      <div>
                        {user.jabatan && <p className="text-zinc-700 font-medium">{user.jabatan}</p>}
                        {user.divisi && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {user.divisi}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-300 text-xs italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-red-700 to-red-900">
                  <UserCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-900">
                    {editingUser ? "Edit Administrator" : "Tambah Administrator Baru"}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingUser ? `Memperbarui akun: ${editingUser.nama}` : "Buat akun CMS Admin baru"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@kpu-jateng.go.id"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                  Password{" "}
                  {!editingUser && <span className="text-red-500">*</span>}
                  {editingUser && <span className="text-zinc-400 font-normal normal-case">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? "••••••••" : "Minimal 6 karakter"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Jabatan & Divisi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                    Jabatan
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={form.jabatan}
                      onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                      placeholder="Staf IT, Ketua, dll."
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                    Divisi
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={form.divisi}
                      onChange={(e) => setForm({ ...form, divisi: e.target.value })}
                      placeholder="Teknologi Informasi, dll."
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Akun yang dibuat di sini akan memiliki role <strong>CMS_ADMIN</strong> dan dapat mengakses seluruh
                  modul pengelolaan konten portal KPU.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-100">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Hapus Administrator?</h3>
                <p className="text-xs text-zinc-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 mb-5 border border-zinc-200">
              <p className="text-sm font-semibold text-zinc-800">{confirmDelete.nama}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{confirmDelete.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {deletingId === confirmDelete.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
