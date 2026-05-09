// src/components/notif-bell.tsx
"use client";
import { useState } from "react";

export default function NotifBell({ count = 0 }: { count?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
          position: "relative",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
        title="Notifikasi"
      >
        {/* Bell SVG icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge notif merah */}
        {count > 0 && (
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            background: "#ef4444",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            border: "2px solid #fff",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown notifikasi */}
      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          width: 320,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb",
          zIndex: 100,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
              Notifikasi
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {count} baru
            </span>
          </div>
          <div style={{ padding: "12px 18px", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
            Belum ada notifikasi terbaru
          </div>
        </div>
      )}
    </div>
  );
}