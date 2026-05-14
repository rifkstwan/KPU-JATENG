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
        user: { select: { nama: true, nip: true, jabatan: true, divisi: true, golongan: true } },
        approvals: {
          include: { approver: { select: { nama: true, nip: true, jabatan: true } } },
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

    const fmtBulan = (iso: string | Date) =>
      new Date(iso).toLocaleDateString("id-ID", {
        month: "long", year: "numeric",
      })

    const hitungHari = (mulai: string | Date, selesai: string | Date) => {
      const diff = new Date(selesai).getTime() - new Date(mulai).getTime()
      return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
    }

    const terbilang = [
      "", "satu", "dua", "tiga", "empat", "lima",
      "enam", "tujuh", "delapan", "sembilan", "sepuluh",
      "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
    ]

    const labelTransport: Record<string, string> = {
      DARAT:  "Kendaraan Dinas Operasional",
      UDARA:  "Pesawat Udara",
      KERETA: "Kereta Api",
      LAUT:   "Kapal Laut",
    }

    const approval  = sppd.approvals[0]
    const approverNama = approval?.approver?.nama ?? null
    const approverNip  = approval?.approver?.nip  ?? null
    const approvedAt   = approval?.approvedAt      ?? new Date()
    const hari         = hitungHari(sppd.tglBerangkat, sppd.tglKembali)

    const pengikutRows = [1,2,3,4,5].map(n => `
      <tr>
        <td style="font-size:10.5pt;padding:4px 6px">${n}.</td>
        <td style="padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
      </tr>
    `).join("")

    const gerakRows = [1,2,3].map(() => `
      <tr>
        <td style="height:30px;padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
        <td style="padding:4px 6px"></td>
      </tr>
    `).join("")

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>SPD - ${sppd.nomorSppd}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    color: #000;
    background: #f0f0f0;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 20mm 15mm 25mm;
    background: #fff;
  }
  .kop-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }
  .kop-right { font-size: 10.5pt; line-height: 1.9; }
  .judul {
    text-align: center;
    font-weight: bold;
    font-size: 13pt;
    text-decoration: underline;
    margin: 10px 0 8px;
    letter-spacing: 1px;
  }
  table.spd { width: 100%; border-collapse: collapse; font-size: 11pt; }
  table.spd td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: top;
    line-height: 1.7;
  }
  .no-col    { width: 28px; text-align: center; }
  .label-col { width: 200px; }
  .ttd-section { margin-top: 14px; display: flex; justify-content: flex-end; }
  .ttd-box { text-align: center; min-width: 230px; font-size: 11pt; line-height: 1.9; }
  .ttd-space { height: 72px; }
  .ttd-nama { font-weight: bold; text-decoration: underline; }
  .ttd-nip  { font-size: 10.5pt; }
  .gerak-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 6px; }
  .gerak-table td, .gerak-table th {
    border: 1px solid #000;
    padding: 4px 6px;
    text-align: center;
  }
  .gerak-table th { font-weight: bold; background: #fff; }
  .toolbar {
    position: fixed; top: 0; left: 0; right: 0;
    background: #fff; border-bottom: 1px solid #ddd;
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    font-family: Arial, sans-serif;
    z-index: 999;
  }
  .toolbar-title { font-size: 13px; font-weight: 700; color: #111; }
  .toolbar-sub   { font-size: 11px; color: #999; margin-top: 1px; }
  .btn-print {
    padding: 9px 22px; background: #003087; color: #fff;
    border: none; border-radius: 8px; font-size: 13px;
    font-weight: 700; cursor: pointer;
  }
  .spacer { height: 60px; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none !important; }
    .spacer  { display: none !important; }
    .page { width: 100%; margin: 0; padding: 15mm 15mm 10mm 20mm; }
  }
</style>
</head>
<body>

  <div class="toolbar">
    <div>
      <div class="toolbar-title">Surat Perjalanan Dinas (SPD)</div>
      <div class="toolbar-sub">${sppd.nomorSppd} &mdash; ${sppd.user.nama}</div>
    </div>
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>

  <div class="spacer"></div>

  <div class="page">

    <!-- KOP -->
    <div class="kop-row">
      <div>
        <div style="font-size:10.5pt">Kementerian Negara/Lembaga:</div>
        <div style="font-size:10.5pt;font-weight:bold">KOMISI PEMILIHAN UMUM</div>
      </div>
      <div>
        <div class="kop-right">Lembar Ke &nbsp;&nbsp;:</div>
        <div class="kop-right">Kode No. &nbsp;&nbsp;:</div>
        <div class="kop-right">Nomor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${sppd.nomorSppd}</div>
      </div>
    </div>

    <div class="judul">SURAT PERJALANAN DINAS (SPD)</div>

    <!-- TABEL UTAMA -->
    <table class="spd">
      <tbody>
        <tr>
          <td class="no-col">1</td>
          <td class="label-col">Pejabat Pembuat Komitmen</td>
          <td>${approverNama ?? "&mdash;"}</td>
        </tr>
        <tr>
          <td class="no-col">2</td>
          <td class="label-col">Nama/NIP Pegawai yang<br/>melaksanakan perjalanan dinas</td>
          <td>
            <strong>${sppd.user.nama}</strong><br/>
            NIP. ${sppd.user.nip ?? "-"}
          </td>
        </tr>
        <tr>
          <td class="no-col">3</td>
          <td class="label-col">
            a. Pangkat dan Golongan<br/>
            b. Jabatan / Instansi<br/>
            c. Tingkat Biaya Perjalanan Dinas
          </td>
          <td>
            a. ${(sppd.user as any).golongan ?? "-"}<br/>
            b. ${sppd.user.jabatan ?? "-"} / KPU Provinsi Jawa Tengah<br/>
            c. ${(sppd as any).tingkatBiaya ?? "B"}
          </td>
        </tr>
        <tr>
          <td class="no-col">4</td>
          <td class="label-col">Maksud Perjalanan Dinas</td>
          <td>${sppd.maksud}</td>
        </tr>
        <tr>
          <td class="no-col">5</td>
          <td class="label-col">Alat angkutan yang dipergunakan</td>
          <td>${labelTransport[sppd.transport] ?? "Kendaraan Dinas Operasional"}</td>
        </tr>
        <tr>
          <td class="no-col">6</td>
          <td class="label-col">
            a. Tempat berangkat<br/>
            b. Tempat tujuan
          </td>
          <td>
            a. ${(sppd as any).tempatBerangkat ?? "Semarang"}<br/>
            b. ${sppd.tujuan}
          </td>
        </tr>
        <tr>
          <td class="no-col">7</td>
          <td class="label-col">
            a. Lamanya Perjalanan Dinas<br/>
            b. Tanggal berangkat<br/>
            c. Tanggal harus kembali/tiba di<br/>&nbsp;&nbsp;&nbsp;tempat baru*)
          </td>
          <td>
            a. ${hari} (${terbilang[hari] ?? hari}) hari<br/>
            b. ${fmt(sppd.tglBerangkat)}<br/>
            c. ${fmt(sppd.tglKembali)}
          </td>
        </tr>
        <tr>
          <td class="no-col">8</td>
          <td class="label-col">Pengikut :</td>
          <td>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <th style="text-align:left;width:40%;font-size:10.5pt;padding-bottom:4px;font-weight:bold">Nama</th>
                <th style="text-align:center;width:30%;font-size:10.5pt;font-weight:bold">Tanggal Lahir</th>
                <th style="text-align:center;width:30%;font-size:10.5pt;font-weight:bold">Keterangan</th>
              </tr>
              ${pengikutRows}
            </table>
          </td>
        </tr>
        <tr>
          <td class="no-col">9</td>
          <td class="label-col">
            Pembebanan Anggaran<br/><br/>
            a. Instansi<br/>
            b. Akun
          </td>
          <td>
            &nbsp;<br/>
            a. KPU Provinsi Jawa Tengah<br/>
            b. ${(sppd as any).kodeAkun ?? "524119"}
          </td>
        </tr>
        <tr>
          <td class="no-col">10</td>
          <td class="label-col">Keterangan lain-lain</td>
          <td>
            Nomor SPT : &nbsp;&nbsp; ${sppd.nomorSppd}<br/><br/>
            Hasil pelaksanaan tugas ini harus segera dilaporkan
            kepada Pleno KPU Provinsi Jawa Tengah
            ${sppd.catatan ? `<br/><br/><em>Catatan: ${sppd.catatan}</em>` : ""}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- TANDA TANGAN -->
    <div class="ttd-section">
      <div class="ttd-box">
        <div>Dikeluarkan di &nbsp;: Semarang</div>
        <div>Tanggal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${fmtBulan(approvedAt)}</div>
        <div style="margin-top:6px">Pejabat Pembuat Komitmen</div>
        <div class="ttd-space"></div>
        <div class="ttd-nama">(${approverNama ?? "________________________"})</div>
        <div class="ttd-nip">NIP. ${approverNip ?? "____________________"}</div>
      </div>
    </div>

    <!-- TABEL GERAK II -->
    <div style="margin-top:14px;font-size:10pt">
      <div style="font-weight:bold;margin-bottom:4px;font-size:10.5pt">II. Tiba di</div>
      <table class="gerak-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:22%">Nama Tempat</th>
            <th rowspan="2" style="width:16%">Tiba<br/>Tanggal</th>
            <th rowspan="2" style="width:16%">Berangkat<br/>Tanggal</th>
            <th colspan="2">Lamanya</th>
            <th rowspan="2">Tanda Tangan<br/>Pejabat Yang Berwenang</th>
          </tr>
          <tr>
            <th style="width:8%">Hari</th>
            <th style="width:8%">Jam</th>
          </tr>
        </thead>
        <tbody>
          ${gerakRows}
        </tbody>
      </table>

      <!-- TABEL GERAK III -->
      <div style="margin-top:14px;font-weight:bold;font-size:10.5pt">III. Tiba kembali di :</div>
      <table class="gerak-table" style="margin-top:4px">
        <thead>
          <tr>
            <th style="width:30%">Tempat</th>
            <th style="width:35%">Tanggal</th>
            <th>Tanda Tangan Pejabat Yang Berwenang</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="height:32px;padding:4px 6px">Semarang</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:12px;font-size:10pt;line-height:1.7">
        Telah diperiksa, dengan keterangan bahwa perjalanan tersebut di atas benar
        dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam
        waktu yang sesingkat-singkatnya.
      </div>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <div class="ttd-box">
          <div>Pejabat Pembuat Komitmen</div>
          <div class="ttd-space"></div>
          <div class="ttd-nama">(${approverNama ?? "________________________"})</div>
          <div class="ttd-nip">NIP. ${approverNip ?? "____________________"}</div>
        </div>
      </div>
    </div>

  </div>

  <div style="height:48px"></div>

</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="SPD-${sppd.nomorSppd}.html"`,
      },
    })

  } catch (error) {
    console.error("[DOWNLOAD SPD] Error:", (error as Error).message)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}