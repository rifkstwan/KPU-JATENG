"use client"

import { useRouter } from "next/navigation"

type TopbarUserProps = {
  nama?: string | null
  role?: string | null
  image?: string | null
}

function getInitials(nama?: string | null) {
  if (!nama) return "U"
  return nama
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getRoleLabel(role?: string | null) {
  if (role === "ADMIN") return "Admin"
  if (role === "APPROVER") return "Approver"
  return "Pegawai"
}

export default function TopbarUser({ nama, role, image }: TopbarUserProps) {
  const initials = getInitials(nama)
  const router = useRouter()

  return (
    <div
      onClick={() => router.push("/dashboard/profil")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        borderRadius: "10px",
        padding: "6px 8px",
        transition: "background 150ms ease",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      title="Lihat profil"
    >
      {image ? (
        <img
          src={image}
          alt={nama ?? "User"}
          style={{
            width: 40,
            height: 40,
            borderRadius: "999px",
            objectFit: "cover",
            background: "#f3f4f6",
            boxShadow: "0 0 0 1px #e5e7eb",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "999px",
            background: "#0d3b8e",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}

      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36", marginBottom: "2px" }}>
          {nama || "User"}
        </div>
        <div style={{ fontSize: "12px", color: "#8b93a7", fontWeight: 500 }}>
          {getRoleLabel(role)}
        </div>
      </div>
    </div>
  )
}