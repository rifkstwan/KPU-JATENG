"use client"

import { useState } from "react"

export default function TopbarSearch() {
  const [keyword, setKeyword] = useState("")

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#f5f6fa",
        borderRadius: "10px",
        padding: "0 14px",
        width: 260,
        height: 42,
        border: "1px solid #eef0f4",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Cari sesuatu..."
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          width: "100%",
          fontSize: "13px",
          color: "#1a1f36",
        }}
      />
    </div>
  )
}