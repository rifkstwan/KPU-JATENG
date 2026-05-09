export default function NotifikasiPage() {
  // Nanti diganti fetch dari DB
  const notifikasi: {
    id: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
  }[] = []

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}>
        <div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1a1f36",
            margin: 0,
            lineHeight: 1.3,
          }}>
            Notifikasi
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#8f95a3",
            margin: "4px 0 0",
          }}>
            Informasi terbaru terkait pengajuan SPPD Anda
          </p>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #eef0f4",
        overflow: "hidden",
      }}>
        {/* Card Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #eef0f4",
          fontWeight: 600,
          fontSize: "14px",
          color: "#1a1f36",
        }}>
          Semua Notifikasi
        </div>

        {/* Konten */}
        {notifikasi.length === 0 ? (
          // Empty State
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 24px",
            gap: "12px",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8ccd8" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <div style={{ fontWeight: 600, fontSize: "15px", color: "#1a1f36" }}>
              Belum ada notifikasi
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3", textAlign: "center" }}>
              Notifikasi akan muncul saat ada pembaruan terkait pengajuan SPPD Anda
            </div>
          </div>
        ) : (
          // List Notifikasi
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifikasi.map((n, i) => (
              <div key={n.id} style={{
                padding: "16px 20px",
                borderBottom: i < notifikasi.length - 1 ? "1px solid #eef0f4" : "none",
                background: n.isRead ? "#fff" : "#f0f5ff",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}>
                {/* Dot unread */}
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: n.isRead ? "transparent" : "#00205b",
                  marginTop: "6px",
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#1a1f36",
                    marginBottom: "4px",
                  }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#8f95a3" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "11px", color: "#c0c4ce", marginTop: "6px" }}>
                    {new Date(n.createdAt).toLocaleString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}