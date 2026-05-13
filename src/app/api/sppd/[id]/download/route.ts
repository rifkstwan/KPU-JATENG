import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sppd = await prisma.pengajuanSPPD.findUnique({
      where: { id },
      include: {
        user: { select: { nama: true, nip: true, jabatan: true, divisi: true } },
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

    const role = (session.user as { role?: string }).role ?? ""
    if (sppd.userId !== session.user.id && !["ADMIN", "APPROVER"].includes(role)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 })
    }

    if (sppd.status !== "APPROVED") {
      return NextResponse.json({ message: "SPPD belum disetujui" }, { status: 403 })
    }

    const fmt = (iso: string | Date) =>
      new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      })

    const approval = sppd.approvals[0]
    const anggaranNum = parseInt(sppd.anggaran.toString(), 10)
    const anggaranFormatted = anggaranNum > 0
      ? "Rp " + anggaranNum.toLocaleString("id-ID")
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
  .kop { text-align: center; margin-bottom: 6px; }
  .kop .a { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
  .kop .b { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .kop .c { font-size: 9pt; margin-top: 3px; }
  hr.tebal { border: none; border-top: 4px double #000; margin: 8px 0 16px; }
  hr.tipis { border: none; border-top: 1px solid #000; margin: 12px 0; }
  .judul { text-align: center; margin-bottom: 20px; }
  .judul h1 { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
  .judul h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-top: 2px; }
  .judul .nomor { font-size: 11pt; margin-top: 6px; }
  .slabel { font-weight: bold; font-size: 11.5pt; margin: 18px 0 8px; }
  table.d { width: 100%; border-collapse: collapse; }
  table.d td { padding: 3px 6px; font-size: 11.5pt; vertical-align: top; }
  table.d td:first-child { width: 38%; }
  table.d td:nth-child(2) { width: 4%; text-align: center; }
  .ttd-wrap { margin-top: 48px; display: flex; justify-content: flex-end; }
  .ttd-box { text-align: center; width: 260px; }
  .ttd-nama { font-weight: bold; text-decoration: underline; display: block; margin-top: 64px; font-size: 12pt; }
  .wm { text-align: center; margin-top: 32px; font-size: 9pt; color: #888; }
  .np { text-align: center; margin-bottom: 20px; }
  @media print { .np { display: none; } }
</style>
</head>
<body>
  <div class="np">
    <button onclick="window.print()"
      style="padding:10px 28px;background:#00205b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;margin:16px 0;">
      🖨️ Cetak / Simpan sebagai PDF
    </button>
  </div>

  <div class="kop">
    <div class="a">Komisi Pemilihan Umum</div>
    <div class="b">Provinsi Jawa Tengah</div>
    <div class="c">Jl. Veteran No. 1A Semarang 50231 &nbsp;|&nbsp; Telp. (024) 8412005</div>
  </div>
  <hr class="tebal"/>

  <div class="judul">
    <h1>Surat Perintah Perjalanan Dinas</h1>
    <h2>(SPPD)</h2>
    <div class="nomor">Nomor: ${sppd.nomorSppd}</div>
  </div>

  <p style="font-size:11.5pt;margin-bottom:12px;">
    Diberikan kepada pegawai sebagaimana tersebut di bawah ini:
  </p>

  <div class="slabel">I. Data Pegawai</div>
  <table class="d">
    <tr><td>Nama Lengkap</td><td>:</td><td><strong>${sppd.user.nama}</strong></td></tr>
    <tr><td>NIP</td><td>:</td><td>${sppd.user.nip ?? "-"}</td></tr>
    <tr><td>Jabatan</td><td>:</td><td>${sppd.user.jabatan ?? "-"}</td></tr>
    <tr><td>Divisi / Bagian</td><td>:</td><td>${sppd.user.divisi ?? "-"}</td></tr>
  </table>

  <hr class="tipis"/>

  <div class="slabel">II. Rincian Perjalanan Dinas</div>
  <table class="d">
    <tr><td>Tujuan</td><td>:</td><td>${sppd.tujuan}</td></tr>
    <tr><td>Maksud Perjalanan</td><td>:</td><td>${sppd.maksud}</td></tr>
    <tr><td>Tanggal Berangkat</td><td>:</td><td>${fmt(sppd.tglBerangkat)}</td></tr>
    <tr><td>Tanggal Kembali</td><td>:</td><td>${fmt(sppd.tglKembali)}</td></tr>
    <tr><td>Alat Transportasi</td><td>:</td><td>${sppd.transport.charAt(0) + sppd.transport.slice(1).toLowerCase()}</td></tr>
    <tr><td>Anggaran</td><td>:</td><td>${anggaranFormatted}</td></tr>
    ${sppd.catatan ? "<tr><td>Catatan</td><td>:</td><td>" + sppd.catatan + "</td></tr>" : ""}
  </table>

  <hr class="tipis"/>

  <p style="font-size:11.5pt;margin-top:14px;">
    Surat Perintah Perjalanan Dinas ini diterbitkan berdasarkan persetujuan pejabat
    yang berwenang dan berlaku untuk melaksanakan perjalanan dinas sebagaimana tersebut di atas.
  </p>

  <div class="ttd-wrap">
    <div class="ttd-box">
      <div style="font-size:11.5pt;">Semarang, ${fmt(new Date())}</div>
      <div style="font-size:11pt;margin-top:2px;">${approval?.approver?.jabatan ?? "Pejabat yang Berwenang"}</div>
      <span class="ttd-nama">${approval?.approver?.nama ?? ""}</span>
    </div>
  </div>

  <div class="wm">
    Dokumen ini digenerate otomatis oleh Sistem SPPD KPU Jawa Tengah &mdash; ${new Date().toLocaleString("id-ID")}
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
    console.error("[DOWNLOAD SPPD] Error:", (error as Error).message)
    console.error("[DOWNLOAD SPPD] Stack:", (error as Error).stack)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}