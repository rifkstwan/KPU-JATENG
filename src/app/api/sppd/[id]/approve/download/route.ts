import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sppd = await prisma.pengajuanSPPD.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { nama: true, nip: true, jabatan: true, divisi: true },
        },
        approvals: {
          include: { approver: { select: { nama: true, jabatan: true } } },
          orderBy: { approvedAt: "desc" },
          take: 1,
        },
      },
    })

    if (!sppd) {
      return NextResponse.json({ message: "SPPD tidak ditemukan" }, { status: 404 })
    }

    if (sppd.status !== "APPROVED") {
      return NextResponse.json({ message: "SPPD belum disetujui" }, { status: 403 })
    }

    const role = (session.user as { role?: string }).role ?? ""
    if (sppd.userId !== session.user.id && !["ADMIN", "APPROVER"].includes(role)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    const fmt = (iso: string | Date) =>
      new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      })

    const approval = sppd.approvals[0]
    const anggaranFormatted = sppd.anggaran
      ? "Rp " + Number(sppd.anggaran).toLocaleString("id-ID")
      : "-"

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>SPPD - ${sppd.nomorSppd}</title>
<style>
  @page { size: A4; margin: 2.5cm 2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; line-height: 1.6; }
  .kop-text { text-align: center; margin-bottom: 6px; }
  .kop-text .instansi-atas { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
  .kop-text .instansi { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .kop-text .alamat { font-size: 9pt; margin-top: 3px; }
  .divider-tebal { border: none; border-top: 4px double #000; margin: 8px 0 16px; }
  .divider-tipis { border: none; border-top: 1px solid #000; margin: 10px 0; }
  .judul { text-align: center; margin-bottom: 20px; }
  .judul h1 { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .judul h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-top: 2px; }
  .judul .nomor { font-size: 11pt; margin-top: 6px; }
  .section-label { font-weight: bold; font-size: 11.5pt; margin: 18px 0 8px; }
  table.data { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  table.data td { padding: 3px 6px; font-size: 11.5pt; vertical-align: top; }
  table.data td:first-child { width: 38%; }
  table.data td:nth-child(2) { width: 4%; text-align: center; }
  .footer-wrap { margin-top: 48px; display: flex; justify-content: flex-end; }
  .ttd-box { text-align: center; width: 260px; }
  .ttd-box .nama-ttd { font-weight: bold; text-decoration: underline; display: block; margin-top: 60px; font-size: 12pt; }
  .watermark-wrap { text-align: center; margin-top: 32px; }
  .watermark { font-size: 9pt; color: #888; border: 1px dashed #ccc; padding: 6px 12px; border-radius: 4px; display: inline-block; }
  .no-print { text-align: center; margin-bottom: 20px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" style="padding:10px 28px;background:#00205b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
      🖨️ Cetak / Simpan sebagai PDF
    </button>
  </div>

  <div class="kop-text">
    <div class="instansi-atas">Komisi Pemilihan Umum</div>
    <div class="instansi">Provinsi Jawa Tengah</div>
    <div class="alamat">Jl. Veteran No. 1A Semarang 50231 | Telp. (024) 8412005</div>
  </div>
  <hr class="divider-tebal"/>

  <div class="judul">
    <h1>Surat Perintah Perjalanan Dinas</h1>
    <h2>(SPPD)</h2>
    <div class="nomor">Nomor: ${sppd.nomorSppd}</div>
  </div>

  <p style="margin-bottom:12px;font-size:11.5pt;">Diberikan kepada pegawai sebagaimana tersebut di bawah ini:</p>

  <div class="section-label">I. Data Pegawai</div>
  <table class="data">
    <tr><td>Nama Lengkap</td><td>:</td><td><strong>${sppd.user.nama}</strong></td></tr>
    <tr><td>NIP</td><td>:</td><td>${(sppd.user as { nip?: string | null }).nip ?? "-"}</td></tr>
    <tr><td>Jabatan</td><td>:</td><td>${sppd.user.jabatan ?? "-"}</td></tr>
    <tr><td>Divisi / Bagian</td><td>:</td><td>${sppd.user.divisi ?? "-"}</td></tr>
  </table>

  <hr class="divider-tipis"/>

  <div class="section-label">II. Rincian Perjalanan Dinas</div>
  <table class="data">
    <tr><td>Tujuan Perjalanan</td><td>:</td><td>${sppd.tujuan}</td></tr>
    <tr><td>Maksud Perjalanan</td><td>:</td><td>${sppd.maksud}</td></tr>
    <tr><td>Tanggal Berangkat</td><td>:</td><td>${fmt(sppd.tglBerangkat)}</td></tr>
    <tr><td>Tanggal Kembali</td><td>:</td><td>${fmt(sppd.tglKembali)}</td></tr>
    <tr><td>Alat Transportasi</td><td>:</td><td>${sppd.transport.charAt(0) + sppd.transport.slice(1).toLowerCase()}</td></tr>
    <tr><td>Anggaran Perjalanan</td><td>:</td><td>${anggaranFormatted}</td></tr>
    ${sppd.catatan ? `<tr><td>Catatan</td><td>:</td><td>${sppd.catatan}</td></tr>` : ""}
  </table>

  <hr class="divider-tipis"/>

  <p style="margin-top:14px;font-size:11.5pt;">
    Surat Perintah Perjalanan Dinas ini diterbitkan berdasarkan persetujuan pejabat yang berwenang
    dan berlaku untuk melaksanakan perjalanan dinas sebagaimana tersebut di atas.
  </p>

  <div class="footer-wrap">
    <div class="ttd-box">
      <div style="margin-bottom:2px;font-size:11.5pt;">Semarang, ${fmt(new Date())}</div>
      <div style="font-size:11pt;margin-bottom:2px;">${approval?.approver?.jabatan ?? "Pejabat yang Berwenang"}</div>
      <span class="nama-ttd">${approval?.approver?.nama ?? ""}</span>
    </div>
  </div>

  <div class="watermark-wrap">
    <span class="watermark">
      Dokumen ini digenerate otomatis oleh Sistem SPPD KPU Jawa Tengah
      &mdash; ${new Date().toLocaleString("id-ID")}
    </span>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="SPPD-${sppd.nomorSppd}.html"`,
      },
    })
  } catch (error) {
    console.error("[GET /api/sppd/:id/download]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}