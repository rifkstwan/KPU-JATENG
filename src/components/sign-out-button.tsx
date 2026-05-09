"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "8px",
        color: "rgba(255,255,255,0.55)",
        background: "transparent",
        border: "none",
        fontSize: "13.5px",
        fontWeight: 500,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(239,68,68,0.15)"
        e.currentTarget.style.color = "#fca5a5"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "rgba(255,255,255,0.55)"
      }}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span>Keluar</span>
    </button>
  )
}