"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  nama: string
  nip: string | null
  email: string
  jabatan: string | null
  divisi: string | null
  role: string
  createdAt: string
  _count: { pengajuan: number }
}

const roleColor: Record<string, string> = {
  ADMIN: "#7c3aed",
  APPROVER: "#01696f",
  PEGAWAI: "#2563eb",
}
const roleBg: Record<string, string> = {
  ADMIN: "#ede9fe",
  APPROVER: "#cedcd8",
  PEGAWAI: "#dbeafe",
}

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    nama: "", email: "", nip: "", jabatan: "", divisi: "",
    role: "PEGAWAI", password: "",
  })

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: "6px", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box" as const,
  }

  const openAdd = () => {
    setEditUser(null)
    setForm({ nama: "", email: "", nip: "", jabatan: "", divisi: "", role: "PEGAWAI", password: "" })
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ nama: u.nama, email: u.email, nip: u.nip || "", jabatan: u.jabatan || "", divisi: u.divisi || "", role: u.role, password: "" })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId("form")
    try {
      const url = editUser ? `/api/admin/users/${editUser.id}` : "/api/admin/users"
      const method = editUser ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        router.refresh()
        const data = await res.json()
        if (editUser) {
          setUsers(users.map(u => u.id === editUser.id ? { ...u, ...data } : u))
        } else {
          setUsers([...users, { ...data, _count: { pengajuan: 0 } }])
        }
      } else {
        const err = await res.json()
        alert(err.error || "Gagal menyimpan user.")
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus user "${nama}"? Semua data SPPD-nya akan ikut terhapus.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) setUsers(users.filter(u => u.id !== id))
      else alert("Gagal menghapus user.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      {/* Tombol Tambah */}
      <div style={{ marginBottom: "16px" }}>
        <button onClick={openAdd} style={{
          background: "#01696f", color: "white", border: "none",
          padding: "10px 20px", borderRadius: "6px",
          fontWeight: 600, cursor: "pointer", fontSize: "0.875rem",
        }}>
          ＋ Tambah User
        </button>
      </div>

      {/* Tabel */}
      <div style={{
        background: "white", border: "1px solid #e5e7eb",
        borderRadius: "8px", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nama", "Email", "NIP", "Jabatan", "Role", "SPPD", "Aksi"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "0.75rem", color: "#666", fontWeight: 600,
                  borderBottom: "1px solid #e5e7eb",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{u.nama}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{u.divisi || "-"}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.email}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.nip || "-"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.jabatan || "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: roleBg[u.role] || "#f3f4f6",
                    color: roleColor[u.role] || "#374151",
                    padding: "2px 8px", borderRadius: "9999px",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555", textAlign: "center" }}>
                  {u._count.pengajuan}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(u)} style={{
                      background: "none", border: "1px solid #01696f",
                      color: "#01696f", padding: "4px 10px",
                      borderRadius: "4px", cursor: "pointer",
                      fontSize: "0.75rem", fontWeight: 600,
                    }}>
                      ✏️ Edit
                    </button>
                    <button
                      disabled={loadingId === u.id}
                      onClick={() => void handleDelete(u.id, u.nama)}
                      style={{
                        background: "none", border: "1px solid #dc2626",
                        color: "#dc2626", padding: "4px 10px",
                        borderRadius: "4px", cursor: "pointer",
                        fontSize: "0.75rem", fontWeight: 600,
                      }}>
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
        }}>
          <div style={{
            background: "white", borderRadius: "10px",
            padding: "24px", width: "480px", maxWidth: "90vw",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px" }}>
              {editUser ? "Edit User" : "Tambah User Baru"}
            </h2>
            <form onSubmit={e => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Nama Lengkap</label>
                <input style={inputStyle} required value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Email</label>
                <input type="email" style={inputStyle} required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>
                  Password {editUser && <span style={{ color: "#999", fontWeight: 400 }}>(kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" style={inputStyle}
                  required={!editUser} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editUser ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>NIP</label>
                <input style={inputStyle} value={form.nip}
                  onChange={e => setForm({ ...form, nip: e.target.value })}
                  placeholder="Nomor Induk Pegawai" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Jabatan</label>
                <input style={inputStyle} value={form.jabatan}
                  onChange={e => setForm({ ...form, jabatan: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Divisi</label>
                <input style={inputStyle} value={form.divisi}
                  onChange={e => setForm({ ...form, divisi: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Role</label>
                <select style={inputStyle} value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="PEGAWAI">PEGAWAI</option>
                  <option value="APPROVER">APPROVER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  background: "none", border: "1px solid #d1d5db",
                  padding: "8px 20px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                }}>
                  Batal
                </button>
                <button type="submit" disabled={loadingId === "form"} style={{
                  background: loadingId === "form" ? "#9ca3af" : "#01696f",
                  color: "white", border: "none",
                  padding: "8px 20px", borderRadius: "6px",
                  cursor: loadingId === "form" ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                }}>
                  {loadingId === "form" ? "Menyimpan..." : "💾 Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}