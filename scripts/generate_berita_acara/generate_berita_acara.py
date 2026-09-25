#!/usr/bin/env python3
"""
Script to generate official Berita Acara Pemusnahan Obat (Permenkes No. 73 Tahun 2016)
Execution: python3 generate_berita_acara.py --run <execution_context>
"""

import os
import sys
import json
import argparse
import base64
import random
import subprocess
from datetime import datetime
from typing import Dict, Any, Tuple


HARI_MAP = {
    0: "Senin",
    1: "Selasa",
    2: "Rabu",
    3: "Kamis",
    4: "Jumat",
    5: "Sabtu",
    6: "Minggu"
}

BULAN_MAP = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember"
}


def get_digital_signature_base64() -> str:
    """
    Menghasilkan aset SVG tanda tangan digital apoteker medis hitam transparan beresolusi tinggi (base64)
    """
    svg_signature = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 85" width="220" height="75">
        <path d="M 22 55 Q 35 15 48 42 T 62 30 T 78 52 Q 95 18 112 45 T 128 35 Q 148 28 178 38 T 205 42" 
              fill="none" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 38 64 Q 105 48 198 56" 
              fill="none" stroke="#1e293b" stroke-width="2.0" stroke-linecap="round"/>
        <path d="M 125 22 L 132 58" 
              fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 52 40 Q 65 20 72 45" 
              fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="188" cy="38" r="2" fill="#0f172a"/>
        <text x="145" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="8" font-style="italic" fill="#64748b" font-weight="600">Digital Verified APJ</text>
    </svg>"""
    return base64.b64encode(svg_signature.encode('utf-8')).decode('utf-8')


def format_date_indo(dt: datetime) -> Tuple[str, str]:
    """
    Mengubah objek datetime menjadi format hari dan tanggal bahasa Indonesia resmi
    """
    hari = HARI_MAP.get(dt.weekday(), "Hari")
    bulan = BULAN_MAP.get(dt.month, "Bulan")
    tgl_lengkap = f"{dt.day} {bulan} {dt.year}"
    return hari, tgl_lengkap


def create_html_berita_acara(data: Dict[str, Any], nomor_ba: str, dt_musnah: datetime) -> str:
    """
    Menyusun template HTML Berita Acara Pemusnahan Obat berstandar Permenkes No. 73 Tahun 2016
    """
    hari_indo, tgl_lengkap_indo = format_date_indo(dt_musnah)
    _, tgl_cetak = format_date_indo(datetime.now())
    signature_base64 = get_digital_signature_base64()

    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Berita Acara Pemusnahan Obat - {nomor_ba}</title>
    <style>
        @page {{
            size: A4;
            margin: 15mm 20mm;
        }}
        body {{
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #111827;
            background-color: #ffffff;
            margin: 0;
            padding: 10px;
        }}
        .kop-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }}
        .kop-logo {{
            width: 80px;
            vertical-align: middle;
            text-align: center;
        }}
        .kop-logo svg {{
            width: 65px;
            height: 65px;
        }}
        .kop-text {{
            text-align: center;
            vertical-align: middle;
        }}
        .kop-text h2 {{
            margin: 0;
            font-size: 15pt;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
        }}
        .kop-text p {{
            margin: 2px 0;
            font-size: 8.5pt;
            color: #334155;
        }}
        .kop-divider {{
            border-top: 2px solid #0f172a;
            border-bottom: 1px solid #0f172a;
            height: 2px;
            margin-bottom: 14px;
        }}
        .doc-title {{
            text-align: center;
            margin-bottom: 18px;
        }}
        .doc-title h3 {{
            margin: 0;
            font-size: 12.5pt;
            text-decoration: underline;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
        }}
        .doc-title p {{
            margin: 4px 0 0 0;
            font-size: 10pt;
            font-weight: bold;
            color: #1e293b;
        }}
        p.content {{
            text-align: justify;
            margin: 8px 0;
            text-indent: 28px;
        }}
        .party-table {{
            width: 100%;
            margin: 6px 0 10px 18px;
            border-collapse: collapse;
            font-size: 10.5pt;
        }}
        .party-table td {{
            padding: 2px 4px;
            vertical-align: top;
        }}
        .party-table td.label {{
            width: 180px;
        }}
        .party-table td.colon {{
            width: 10px;
        }}
        table.med-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 9.5pt;
        }}
        table.med-table th, table.med-table td {{
            border: 1px solid #1e293b;
            padding: 6px 8px;
            text-align: left;
        }}
        table.med-table th {{
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
        }}
        .signatures {{
            width: 100%;
            margin-top: 28px;
            border-collapse: collapse;
        }}
        .signatures td {{
            width: 50%;
            vertical-align: top;
            text-align: center;
            padding: 0 10px;
            font-size: 10.5pt;
        }}
        .sig-space {{
            height: 75px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .sig-img {{
            height: 68px;
            max-width: 180px;
            object-fit: contain;
        }}
        .tembusan {{
            margin-top: 30px;
            font-size: 8.5pt;
            color: #475569;
        }}
        .tembusan ol {{
            margin: 3px 0 0 18px;
            padding: 0;
        }}
    </style>
</head>
<body>

    <!-- KOP RESMI APOTEK -->
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="14" fill="#1e3a8a"/>
                    <path d="M32 14V50M14 32H50" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
                    <circle cx="32" cy="32" r="26" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="4 3"/>
                </svg>
            </td>
            <td class="kop-text">
                <h2>APOTEK SEHAT FARMA</h2>
                <p><strong>SURAT IZIN APOTEK (SIA): 503/SIA/DPMPTSP/2022/089</strong></p>
                <p>Jl. Jenderal Sudirman No. 45, Kota Semarang, Jawa Tengah 50241 | Telp: (024) 8451234</p>
                <p>Email: layanan@apoteksehatfarma.co.id • Website: www.apoteksehatfarma.co.id</p>
            </td>
        </tr>
    </table>
    <div class="kop-divider"></div>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title">
        <h3>BERITA ACARA PEMUSNAHAN OBAT KEDALUWARSA / RUSAK</h3>
        <p>Nomor: {nomor_ba}</p>
    </div>

    <!-- PARAGRAF PEMBUKA -->
    <p class="content">
        Pada hari ini, <strong>{hari_indo}</strong> tanggal <strong>{tgl_lengkap_indo}</strong>, bertempat di sarana Apotek Sehat Farma, sesuai dengan ketentuan <strong>Peraturan Menteri Kesehatan Republik Indonesia Nomor 73 Tahun 2016 tentang Standar Pelayanan Kefarmasian di Apotek</strong> dan pedoman Badan Pengawas Obat dan Makanan (BPOM), kami yang bertanda tangan di bawah ini:
    </p>

    <table class="party-table">
        <tr>
            <td class="label">1. Nama Lengkap</td>
            <td class="colon">:</td>
            <td><strong>{data['nama_apj']}</strong></td>
        </tr>
        <tr>
            <td class="label">&nbsp;&nbsp;&nbsp;&nbsp;Nomor SIPA</td>
            <td class="colon">:</td>
            <td>{data['sipa_apj']}</td>
        </tr>
        <tr>
            <td class="label">&nbsp;&nbsp;&nbsp;&nbsp;Jabatan</td>
            <td class="colon">:</td>
            <td>Apoteker Penanggung Jawab (APJ)</td>
        </tr>
        <tr>
            <td class="label">2. Nama Saksi / TTK</td>
            <td class="colon">:</td>
            <td><strong>{data['nama_saksi']}</strong></td>
        </tr>
        <tr>
            <td class="label">&nbsp;&nbsp;&nbsp;&nbsp;Jabatan</td>
            <td class="colon">:</td>
            <td>Tenaga Teknis Kefarmasian (TTK) / Saksi Pemusnahan</td>
        </tr>
    </table>

    <p class="content">
        Menyatakan telah bersama-sama melaksanakan pemusnahan persediaan sediaan farmasi yang telah melampaui masa kedaluwarsa (Expired Date) dan tidak dapat dilakukan pengembalian (retur) ke pihak distributor rekanan, dengan rincian data sebagai berikut:
    </p>

    <!-- TABEL RINCIAN OBAT -->
    <table class="med-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Nama Obat</th>
                <th style="width: 12%;">Bentuk Sediaan</th>
                <th style="width: 14%;">No. Batch</th>
                <th style="width: 10%;">Jumlah</th>
                <th style="width: 18%;">PBF / Distributor</th>
                <th style="width: 16%;">Metode Pemusnahan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">1</td>
                <td><strong>{data['nama_obat']}</strong></td>
                <td>{data['bentuk_sediaan']}</td>
                <td style="font-family: monospace; font-weight: bold; text-align: center;">{data['no_batch']}</td>
                <td style="text-align: center; font-weight: bold;">{data['qty_aktual']} Unit</td>
                <td>{data['pbf_asal']}</td>
                <td>{data['metode_pemusnahan']}</td>
            </tr>
        </tbody>
    </table>

    <p style="margin: 6px 0; font-size: 10pt;">
        <strong>Lokasi Penyimpanan Asal:</strong> {data['lokasi_rak']} &nbsp;|&nbsp; 
        <strong>Keterangan / Catatan Temuan:</strong> {data['catatan_temuan']}
    </p>

    <p class="content">
        Pemusnahan sediaan farmasi di atas dilaksanakan dengan metode <strong>{data['metode_pemusnahan']}</strong> sesuai standar operasional prosedur penanganan limbah medis padat/cair dan limbah bahan berbahaya dan beracun (B3), guna mencegah peredaran kembali obat ilegal serta pencemaran lingkungan hidup.
    </p>

    <p class="content">
        Demikian Berita Acara Pemusnahan Obat ini kami buat dengan sebenarnya dan penuh rasa tanggung jawab dalam rangkap 3 (tiga) untuk dipergunakan sebagaimana mestinya.
    </p>

    <!-- KOLOM TANDA TANGAN -->
    <table class="signatures">
        <tr>
            <td>
                Saksi Pelaksana (TTK),<br>
                Apotek Sehat Farma
                <div class="sig-space" style="padding-top: 40px; height: 35px;">
                    <span style="font-size: 9pt; color: #94a3b8;">[ Tanda Tangan Fisik ]</span>
                </div>
                <strong><u>{data['nama_saksi']}</u></strong><br>
                Tenaga Teknis Kefarmasian
            </td>
            <td>
                Kota Semarang, {tgl_cetak}<br>
                Apoteker Penanggung Jawab (APJ),
                <div class="sig-space">
                    <img class="sig-img" src="data:image/svg+xml;base64,{signature_base64}" alt="Digital Signature APJ" />
                </div>
                <strong><u>{data['nama_apj']}</u></strong><br>
                {data['sipa_apj']}
            </td>
        </tr>
    </table>

    <!-- TEMBUSAN -->
    <div class="tembusan">
        <strong>Tembusan disampaikan kepada Yth.:</strong>
        <ol>
            <li>Kepala Balai Besar Pengawas Obat dan Makanan (BBPOM) di Semarang</li>
            <li>Kepala Dinas Kesehatan Kota Semarang</li>
            <li>Arsip Apotek Sehat Farma</li>
        </ol>
    </div>

</body>
</html>
"""
    return html


def convert_html_to_pdf(html_path: str, pdf_path: str) -> bool:
    """
    Mengonversi file HTML menjadi dokumen PDF resmi menggunakan Headless Browser (Edge/Chrome) jika tersedia.
    """
    possible_browsers = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "msedge",
        "chrome",
        "google-chrome",
        "chromium-browser"
    ]

    for browser in possible_browsers:
        if os.path.exists(browser) or (isinstance(browser, str) and not os.path.isabs(browser)):
            try:
                cmd = [
                    browser,
                    "--headless",
                    "--disable-gpu",
                    f"--print-to-pdf={pdf_path}",
                    html_path
                ]
                res = subprocess.run(cmd, capture_output=True, timeout=15)
                if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
                    return True
            except Exception as e:
                continue

    return False


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fungsi utama eksekusi service task generate_berita_acara
    """
    try:
        variables = ctx.get('variables', {}) or {}
        parameters = ctx.get('parameters', {}) or {}
        
        # Gabungkan parameter dengan prioritas variables (Camunda) lalu parameters
        def get_val(key: str, default: Any = ""):
            v = variables.get(key)
            if v is not None and str(v).strip() != "":
                return v
            p = parameters.get(key)
            if p is not None and str(p).strip() != "":
                return p
            return default

        # Ekstraksi variabel sesuai kontrak PRD
        nama_obat = get_val('nama_obat', 'Amoxicillin 500mg')
        no_batch = get_val('no_batch', 'AMX-2401')
        bentuk_sediaan = get_val('bentuk_sediaan', 'Tablet')
        
        # Qty aktual dengan fallback ke qty_sistem
        qty_raw = get_val('qty_aktual', get_val('qty_sistem', 20))
        try:
            qty_aktual = int(qty_raw)
        except (ValueError, TypeError):
            qty_aktual = 20

        pbf_asal = get_val('pbf_asal', 'PT Kimia Farma Trading')
        lokasi_rak = get_val('lokasi_rak', 'Rak A-01')
        
        tanggal_musnah_raw = get_val('tanggal_musnah', datetime.now().strftime('%Y-%m-%d'))
        metode_pemusnahan = get_val('metode_pemusnahan', 'Dilarutkan & dinetralkan lalu dibuang melalui IPAL limbah medis farmasi')
        nama_saksi = get_val('nama_saksi', 'Rina Wulandari, A.Md.Farm.')
        catatan_temuan = get_val('catatan_temuan', 'Obat telah melampaui tanggal kedaluwarsa dan batas retur distributor.')
        
        nama_apj = get_val('nama_apj', 'Apoteker Penanggung Jawab, S.Farm., Apt.')
        sipa_apj = get_val('sipa_apj', 'SIPA: 19950812/SIPA-33.74/2023/2045')

        # Parsing tanggal pemusnahan
        try:
            dt_musnah = datetime.strptime(str(tanggal_musnah_raw).split('T')[0], '%Y-%m-%d')
        except Exception:
            dt_musnah = datetime.now()

        # Generate nomor surat dinamis BA-MUSNAH/{YYYY}/{MM}/{random_id}
        random_id = f"{random.randint(1000, 9999)}"
        nomor_ba = f"BA-MUSNAH/{dt_musnah.strftime('%Y')}/{dt_musnah.strftime('%m')}/{random_id}"

        doc_data = {
            'nama_obat': nama_obat,
            'no_batch': no_batch,
            'bentuk_sediaan': bentuk_sediaan,
            'qty_aktual': qty_aktual,
            'pbf_asal': pbf_asal,
            'lokasi_rak': lokasi_rak,
            'tanggal_musnah': dt_musnah.strftime('%Y-%m-%d'),
            'metode_pemusnahan': metode_pemusnahan,
            'nama_saksi': nama_saksi,
            'catatan_temuan': catatan_temuan,
            'nama_apj': nama_apj,
            'sipa_apj': sipa_apj,
        }

        # Susun HTML
        html_content = create_html_berita_acara(doc_data, nomor_ba, dt_musnah)

        # Direktori output
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        views_public_dir = os.path.join(base_dir, "views", "public", "documents")
        root_public_dir = os.path.join(base_dir, "public", "documents")

        os.makedirs(views_public_dir, exist_ok=True)
        os.makedirs(root_public_dir, exist_ok=True)

        doc_filename_base = f"berita-acara-{random_id}"
        html_file_path = os.path.join(views_public_dir, f"{doc_filename_base}.html")
        pdf_file_path = os.path.join(views_public_dir, f"{doc_filename_base}.pdf")

        # Tulis dokumen HTML
        with open(html_file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Salin ke root public dir untuk redundansi akses statis
        root_html_file_path = os.path.join(root_public_dir, f"{doc_filename_base}.html")
        with open(root_html_file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Konversi ke PDF
        pdf_success = convert_html_to_pdf(html_file_path, pdf_file_path)
        if pdf_success and os.path.exists(pdf_file_path):
            # Salin ke root public dir juga
            root_pdf_file_path = os.path.join(root_public_dir, f"{doc_filename_base}.pdf")
            try:
                with open(pdf_file_path, "rb") as rf, open(root_pdf_file_path, "wb") as wf:
                    wf.write(rf.read())
            except Exception:
                pass
            pdf_url = f"/documents/{doc_filename_base}.pdf"
        else:
            # Fallback jika konverter PDF belum terpasang, gunakan tautan dokumen HTML
            pdf_url = f"/documents/{doc_filename_base}.html"

        return {
            "status": "success",
            "message": f"Berita Acara Pemusnahan Obat berhasil diterbitkan: {nomor_ba}",
            "data": {
                "nomor_ba": nomor_ba,
                "pdf_berita_acara_url": pdf_url,
                "html_berita_acara_url": f"/documents/{doc_filename_base}.html",
                "status_ba": "GENERATED",
                "nama_obat": nama_obat,
                "no_batch": no_batch,
                "qty_dimusnahkan": qty_aktual,
                "tanggal_musnah": dt_musnah.strftime('%Y-%m-%d'),
                "metode_pemusnahan": metode_pemusnahan,
                "nama_apj": nama_apj,
                "sipa_apj": sipa_apj,
                "nama_saksi": nama_saksi
            },
            "runkey": ctx.get('runkey', '')
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Gagal membuat Berita Acara: {str(e)}",
            "data": None,
            "runkey": ctx.get('runkey', '')
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description='Generate Berita Acara Pemusnahan Obat Permenkes No. 73/2016')
    parser.add_argument('--run', required=True, help='Execution context (JSON string or path to JSON file)')
    args = parser.parse_args()

    try:
        if args.run.strip().startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r', encoding='utf-8') as f:
                ctx = json.load(f)

        result = run(ctx)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result['status'] == 'success' else 1)

    except json.JSONDecodeError as e:
        err = {"status": "error", "message": f"Invalid JSON input: {str(e)}", "data": None, "runkey": ""}
        print(json.dumps(err, indent=2))
        sys.exit(2)
    except Exception as e:
        err = {"status": "error", "message": f"Script execution error: {str(e)}", "data": None, "runkey": ""}
        print(json.dumps(err, indent=2))
        sys.exit(2)


if __name__ == '__main__':
    main()
