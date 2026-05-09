"use client"

type Props = {
  initials: string
  firstName: string
  role: string
}

export default function TopbarUser({ initials, firstName, role }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        padding: "6px 8px",
        borderRadius: "10px",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f5f6fa")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Avatar */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #00205b 0%, #0041a8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "12px",
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.5px",
      }}>
        {initials}
      </div>

      {/* Nama + Role */}
      <div>
        <div style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#1a1f36",
          lineHeight: 1.25,
        }}>
          {firstName}
        </div>
        <div style={{
          fontSize: "11px",
          color: "#8f95a3",
          lineHeight: 1.2,
        }}>
          {role.charAt(0) + role.slice(1).toLowerCase()}
        </div>
      </div>
    </div>
  )
}