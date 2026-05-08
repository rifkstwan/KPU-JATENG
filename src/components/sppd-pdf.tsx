import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40, fontSize: 11,
    fontFamily: "Helvetica",
    color: "#000",
  },
  header: {
    textAlign: "center", marginBottom: 20,
    borderBottom: "2px solid #000", paddingBottom: 10,
  },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 11, marginBottom: 2 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 11, fontWeight: "bold",
    borderBottom: "1px solid #000",
    paddingBottom: 3, marginBottom: 8,
  },
  row: {
    flexDirection: "row", marginBottom: 5,
  },
  label: { width: 160, color: "#333" },
  value: { flex: 1, fontWeight: "bold" },
  badge: {
    padding: "2 8", borderRadius: 4,
    fontSize: 10, fontWeight: "bold",
  },
  footer: {
    marginTop: 40, flexDirection: "row",
    justifyContent: "flex-end",
  },
  ttd: { textAlign: "center", width: 200 },
  ttdLine: {
    marginTop: 60, borderBottom: "1px solid #000",
    marginBottom: 4,
  },
})

type SppdData = {
  nomorSppd: string
  tujuan: string
  maksud: string
  tglBerangkat: string
  tglKembali: string
  transport: string
  status: string
  createdAt: string
  user: {
    nama: string
    nip: string | null
    jabatan: string | null
    divisi: string | null
  }
}

export default function SppdPdf({ data }: { data: SppdData }) {
  const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  }

  const transportLabel: Record<string, string> = {
    DARAT: "Transportasi Darat",
    UDARA: "Transportasi Udara",
    KERETA: "Kereta Api",
    LAUT: "Transportasi Laut",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>KOMISI PEMILIHAN UMUM</Text>
          <Text style={styles.subtitle}>SURAT PERINTAH PERJALANAN DINAS (SPPD)</Text>
          <Text style={styles.subtitle}>Nomor: {data.nomorSppd}</Text>
        </View>

        {/* Info Pegawai */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA PEGAWAI</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>: {data.user.nama}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIP</Text>
            <Text style={styles.value}>: {data.user.nip || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jabatan</Text>
            <Text style={styles.value}>: {data.user.jabatan || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Divisi/Unit Kerja</Text>
            <Text style={styles.value}>: {data.user.divisi || "-"}</Text>
          </View>
        </View>

        {/* Info Perjalanan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETAIL PERJALANAN DINAS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tujuan</Text>
            <Text style={styles.value}>: {data.tujuan}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Maksud/Keperluan</Text>
            <Text style={styles.value}>: {data.maksud}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Berangkat</Text>
            <Text style={styles.value}>
              : {new Date(data.tglBerangkat).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Kembali</Text>
            <Text style={styles.value}>
              : {new Date(data.tglKembali).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Alat Transportasi</Text>
            <Text style={styles.value}>: {transportLabel[data.transport] || data.transport}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>: {statusLabel[data.status] || data.status}</Text>
          </View>
        </View>

        {/* Tanggal Surat */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Dikeluarkan pada: {new Date(data.createdAt).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </Text>
        </View>

        {/* TTD */}
        <View style={styles.footer}>
          <View style={styles.ttd}>
            <Text>Mengetahui,</Text>
            <Text>Kepala KPU</Text>
            <View style={styles.ttdLine} />
            <Text style={{ fontWeight: "bold" }}>( .......................... )</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>NIP. ................................</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}