"use client"

import { useState } from "react"

type Role = "PEGAWAI" | "APPROVER" | "ADMIN"

type User = {
  id: string
  nama: string
  divisi: string
  email: string
  nip: string
  jabatan: string
  role: Role
  jumlahSppd: number
}

const dummyUsers: User[] = [
  {
    id: "1",
    nama: "Budi Santoso",
    divisi: "Teknis",
    email: "pegawai@kpu.go.id",
    nip: "197001012000011001",
    jabatan: "Staf Teknis",
    role: "PEGAWAI",
    jumlahSppd: 2,
  },
  {
    id: "2",
    nama: "Drs. Ahmad Fauzi",
    divisi: "Umum",
    email: "approver@kpu.go.id",
    nip: "196505151990031002",
    jabatan: "Kepala Sub Bagian",
    role: "APPROVER",
    jumlahSppd: 1,
  },
  {
    id: "3",
    nama: "Siti Rahmawati",
    divisi: "IT",
    email: "admin@kpu.go.id",
    nip: "198203142005012001",
    jabatan: "Admin Sistem",
    role: "ADMIN",
    jumlahSppd: 0,
  },
]

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  PEGAWAI:  { label: "Pegawai",  color: "#1a6fc4", bg: "#e8f1fb" },
  APPROVER: { label: "Approver", color: "#0a6640", bg: "#e3f4ec" },
  ADMIN:    { label: "Admin",    color: "#7c3aed", bg: "#ede9fe" },
}

// ── Icons ──
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

// ── Avatar ──
function Avatar({ nama, role }: { nama: string; role: Role }) {
  const initials = nama.split(" ").map(n => n[0]).slice(0, 2).join("")
  const colors: Record<Role, string> = {
    PEGAWAI:  "linear-gradient(135deg, #1a6fc4, #2d9bf0)",
    APPROVER: "linear-gradient(135deg, #0a6640, #12a05b)",
    ADMIN:    "linear-gradient(135deg, #7c3aed, #a855f7)",
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: colors[role],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: "12px", fontWeight: 700,
      flexShrink: 0, letterSpacing: "0.5px",
    }}>
      {initials}
    </div>
  )
}

// ── Modal ──
type ModalProps = {
  user?: User | null
  onClose: () => void
  onSave: (u: Omit<User, "id" | "jumlahSppd">) => void
}

function UserModal({ user, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    nama:    user?.nama    || "",
    divisi:  user?.divisi  || "",
    email:   user?.email   || "",
    nip:     user?.nip     || "",
    jabatan: user?.jabatan || "",
    role:    user?.role    || ("PEGAWAI" as Role),
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e5ec",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#1a1f36",
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.15s",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9ca3af",
    marginBottom: "6px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  }

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#00205b"
  }
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#e2e5ec"
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,20,40,0.4)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: "16px",
          width: "100%", maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "22px 24px 20px",
          borderBottom: "1px solid #f0f1f5",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36" }}>
              {user ? "Edit User" : "Tambah User Baru"}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
              {user ? `Edit data untuk ${user.nama}` : "Isi form untuk menambahkan user"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "8px",
              border: "1.5px solid #e2e5ec", background: "#fff",
              cursor: "pointer", color: "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Nama + Divisi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input
                style={inputStyle}
                value={form.nama}
                onChange={e => set("nama", e.target.value)}
                placeholder="Nama lengkap"
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={labelStyle}>Divisi</label>
              <input
                style={inputStyle}
                value={form.divisi}
                onChange={e => set("divisi", e.target.value)}
                placeholder="Divisi / Unit"
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="email@kpu.go.id"
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          {/* Row 3: NIP + Jabatan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>NIP</label>
              <input
                style={inputStyle}
                value={form.nip}
                onChange={e => set("nip", e.target.value)}
                placeholder="18 digit NIP"
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={labelStyle}>Jabatan</label>
              <input
                style={inputStyle}
                value={form.jabatan}
                onChange={e => set("jabatan", e.target.value)}
                placeholder="Jabatan"
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          {/* Row 4: Role */}
          <div>
            <label style={labelStyle}>Role</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, cursor: "pointer", paddingRight: "36px" }}
                value={form.role}
                onChange={e => set("role", e.target.value)}
                onFocus={focusHandler}
                onBlur={blurHandler}
              >
                <option value="PEGAWAI">Pegawai</option>
                <option value="APPROVER">Approver</option>
                <option value="ADMIN">Admin</option>
              </select>
              {/* Custom chevron */}
              <div style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none", color: "#9ca3af",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px 22px",
          borderTop: "1px solid #f0f1f5",
          display: "flex", gap: "10px", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px", borderRadius: "10px",
              border: "1.5px solid #e2e5ec", background: "#fff",
              fontSize: "13px", fontWeight: 600, color: "#4b5563",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => onSave(form)}
            style={{
              padding: "10px 22px", borderRadius: "10px",
              border: "none", background: "#00205b",
              fontSize: "13px", fontWeight: 700, color: "#fff",
              cursor: "pointer",
            }}
          >
            {user ? "Simpan Perubahan" : "Tambah User"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Halaman Utama ──
export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(dummyUsers)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<"ALL" | Role>("ALL")
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.nip.includes(search)
    const matchRole = filterRole === "ALL" || u.role === filterRole
    return matchSearch && matchRole
  })

  const handleSave = (form: Omit<User, "id" | "jumlahSppd">) => {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u))
    } else {
      setUsers(prev => [...prev, { ...form, id: Date.now().toString(), jumlahSppd: 0 }])
    }
    setShowModal(false)
    setEditUser(null)
  }

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteConfirm(null)
  }

  const statCards = [
    { label: "Total User",  value: users.length,                                    color: "#00205b", bg: "#e8edf7" },
    { label: "Pegawai",     value: users.filter(u => u.role === "PEGAWAI").length,   color: "#1a6fc4", bg: "#e8f1fb" },
    { label: "Approver",    value: users.filter(u => u.role === "APPROVER").length,  color: "#0a6640", bg: "#e3f4ec" },
    { label: "Admin",       value: users.filter(u => u.role === "ADMIN").length,     color: "#7c3aed", bg: "#ede9fe" },
  ]

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: "999px",
        border: `1.5px solid ${active ? "#00205b" : "#e2e5ec"}`,
        background: active ? "#00205b" : "#fff",
        color: active ? "#fff" : "#6b7280",
        fontSize: "12px", fontWeight: 600, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "#e8edf7", color: "#00205b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconUsers />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
            Manajemen User
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginLeft: "46px" }}>
          {users.length} user terdaftar di sistem
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "14px", marginBottom: "24px",
      }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "14px",
            border: "1px solid #eef0f4",
            padding: "18px 20px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "12px",
              background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>
                {s.value}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, lineHeight: 1.3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Card tabel */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Toolbar */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f5f6fa",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "12px",
          flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f5f6fa", borderRadius: "10px",
            padding: "9px 14px", border: "1px solid #eef0f4",
            flex: "1 1 220px", maxWidth: 300,
          }}>
            <IconSearch />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, NIP..."
              style={{
                border: "none", background: "transparent",
                fontSize: "13px", color: "#1a1f36", outline: "none",
                width: "100%", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {pill("Semua",    filterRole === "ALL",      () => setFilterRole("ALL"))}
            {pill("Pegawai",  filterRole === "PEGAWAI",  () => setFilterRole("PEGAWAI"))}
            {pill("Approver", filterRole === "APPROVER", () => setFilterRole("APPROVER"))}
            {pill("Admin",    filterRole === "ADMIN",    () => setFilterRole("ADMIN"))}
          </div>

          {/* Tambah button */}
          <button
            onClick={() => { setEditUser(null); setShowModal(true) }}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 18px", borderRadius: "10px",
              border: "none", background: "#00205b",
              color: "#fff", fontSize: "13px", fontWeight: 700,
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <IconPlus />
            Tambah User
          </button>
        </div>

        {/* Tabel */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fc" }}>
                {["User", "Email", "NIP", "Jabatan", "Role", "SPPD", "Aksi"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #f0f1f5",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: "48px", textAlign: "center",
                    color: "#9ca3af", fontSize: "14px",
                  }}>
                    Tidak ada user ditemukan
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const rc = roleConfig[u.role]
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid #f5f6fa",
                      background: i % 2 === 0 ? "#fff" : "#fafbfc",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f5f8ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc")}
                  >
                    {/* User */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar nama={u.nama} role={u.role} />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36" }}>
                            {u.nama}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{u.divisi}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>
                      {u.email}
                    </td>

                    {/* NIP */}
                    <td style={{
                      padding: "14px 16px", fontSize: "12px",
                      color: "#6b7280", fontVariantNumeric: "tabular-nums",
                    }}>
                      {u.nip}
                    </td>

                    {/* Jabatan */}
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>
                      {u.jabatan}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px", borderRadius: "999px",
                        background: rc.bg, color: rc.color,
                        fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.3px",
                      }}>
                        {rc.label}
                      </span>
                    </td>

                    {/* SPPD count */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "8px",
                        background: "#f5f6fa", color: "#6b7280",
                        fontSize: "12px", fontWeight: 600,
                      }}>
                        <IconDoc />
                        {u.jumlahSppd}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => { setEditUser(u); setShowModal(true) }}
                          style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "6px 12px", borderRadius: "8px",
                            border: "1.5px solid #e2e5ec", background: "#fff",
                            fontSize: "12px", fontWeight: 600, color: "#374151",
                            cursor: "pointer",
                          }}
                        >
                          <IconEdit /> Edit
                        </button>

                        {deleteConfirm === u.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => handleDelete(u.id)}
                              style={{
                                padding: "6px 10px", borderRadius: "8px",
                                border: "none", background: "#dc2626",
                                fontSize: "12px", fontWeight: 600, color: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                padding: "6px 10px", borderRadius: "8px",
                                border: "1.5px solid #e2e5ec", background: "#fff",
                                fontSize: "12px", fontWeight: 600, color: "#6b7280",
                                cursor: "pointer",
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: "5px",
                              padding: "6px 12px", borderRadius: "8px",
                              border: "1.5px solid #fecaca", background: "#fff5f5",
                              fontSize: "12px", fontWeight: 600, color: "#dc2626",
                              cursor: "pointer",
                            }}
                          >
                            <IconTrash /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid #f0f1f5",
          fontSize: "12px", color: "#9ca3af",
        }}>
          Menampilkan {filtered.length} dari {users.length} user
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}