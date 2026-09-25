#!/usr/bin/env python3
"""
Script to scan medicine inventory for near-expired items based on distributor return policy.
Execution: python3 scan_near_expired.py --run <execution_context>
"""

import os
import sys
import json
import argparse
from datetime import datetime, date, timedelta
from typing import Dict, Any, List


# Dataset master 40 obat sesuai Persediaan-Obat-template.xlsx
MASTER_INVENTORY = [
    {"nama_obat": "Amoxicillin 500mg", "bentuk_sediaan": "Tablet", "no_batch": "AMX-2401", "tanggal_ed": "2026-10-31", "qty_sistem": 20, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-01"},
    {"nama_obat": "Paracetamol 500mg", "bentuk_sediaan": "Tablet", "no_batch": "PCT-2405", "tanggal_ed": "2026-11-15", "qty_sistem": 50, "pbf_asal": "PT Tempo Scan Pacific", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak A-02"},
    {"nama_obat": "Cefixime 100mg", "bentuk_sediaan": "Kapsul", "no_batch": "CFX-2389", "tanggal_ed": "2026-10-20", "qty_sistem": 15, "pbf_asal": "PT Dexa Medica", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak B-01"},
    {"nama_obat": "Ciprofloxacin 500mg", "bentuk_sediaan": "Tablet", "no_batch": "CPR-2412", "tanggal_ed": "2026-12-10", "qty_sistem": 25, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-03"},
    {"nama_obat": "Metformin 500mg", "bentuk_sediaan": "Tablet", "no_batch": "MTF-2501", "tanggal_ed": "2028-05-15", "qty_sistem": 100, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-04"},
    {"nama_obat": "Amlodipine 10mg", "bentuk_sediaan": "Tablet", "no_batch": "AML-2408", "tanggal_ed": "2026-11-25", "qty_sistem": 40, "pbf_asal": "PT Dexa Medica", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak A-05"},
    {"nama_obat": "Simvastatin 20mg", "bentuk_sediaan": "Tablet", "no_batch": "SMV-2403", "tanggal_ed": "2026-10-18", "qty_sistem": 30, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-06"},
    {"nama_obat": "Asam Mefenamat 500mg", "bentuk_sediaan": "Tablet", "no_batch": "AMF-2410", "tanggal_ed": "2026-12-05", "qty_sistem": 35, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak A-07"},
    {"nama_obat": "Ibuprofen 400mg", "bentuk_sediaan": "Tablet", "no_batch": "IBP-2395", "tanggal_ed": "2026-10-12", "qty_sistem": 20, "pbf_asal": "PT Tempo Scan Pacific", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak A-08"},
    {"nama_obat": "Dexamethasone 0,5mg", "bentuk_sediaan": "Tablet", "no_batch": "DXM-2402", "tanggal_ed": "2026-11-30", "qty_sistem": 60, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-09"},
    {"nama_obat": "Cetirizine 10mg", "bentuk_sediaan": "Tablet", "no_batch": "CTZ-2415", "tanggal_ed": "2027-01-15", "qty_sistem": 45, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-10"},
    {"nama_obat": "Lansoprazole 30mg", "bentuk_sediaan": "Kapsul", "no_batch": "LNZ-2380", "tanggal_ed": "2026-10-22", "qty_sistem": 18, "pbf_asal": "PT Dexa Medica", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak B-02"},
    {"nama_obat": "Omeprazole 20mg", "bentuk_sediaan": "Kapsul", "no_batch": "OMP-2405", "tanggal_ed": "2026-10-05", "qty_sistem": 12, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak B-03"},
    {"nama_obat": "Clindamycin 300mg", "bentuk_sediaan": "Kapsul", "no_batch": "CLN-2407", "tanggal_ed": "2026-11-18", "qty_sistem": 22, "pbf_asal": "PT Dexa Medica", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak B-04"},
    {"nama_obat": "Neurobion Forte", "bentuk_sediaan": "Tablet", "no_batch": "NRB-2419", "tanggal_ed": "2027-02-20", "qty_sistem": 30, "pbf_asal": "PT Enseval Putera Megatrading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak A-11"},
    {"nama_obat": "Paracetamol Sirup 60ml", "bentuk_sediaan": "Sirup", "no_batch": "PCT-2309", "tanggal_ed": "2026-10-15", "qty_sistem": 15, "pbf_asal": "PT Anugrah Argon Medica", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-01"},
    {"nama_obat": "Sanmol Drop 15ml", "bentuk_sediaan": "Sirup", "no_batch": "SNM-2401", "tanggal_ed": "2026-11-10", "qty_sistem": 10, "pbf_asal": "PT Caprifarmindo", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-02"},
    {"nama_obat": "Amoxicillin Sirup Kering 60ml", "bentuk_sediaan": "Sirup", "no_batch": "AMX-2311", "tanggal_ed": "2026-10-08", "qty_sistem": 14, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak C-03"},
    {"nama_obat": "Antasida Doen Suspensi 60ml", "bentuk_sediaan": "Sirup", "no_batch": "ATD-2404", "tanggal_ed": "2026-12-15", "qty_sistem": 25, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-04"},
    {"nama_obat": "OBH Combi Batuk Berdahak 100ml", "bentuk_sediaan": "Sirup", "no_batch": "OBH-2412", "tanggal_ed": "2026-11-28", "qty_sistem": 20, "pbf_asal": "PT Combiphar", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-05"},
    {"nama_obat": "Vicks Formula 44 54ml", "bentuk_sediaan": "Sirup", "no_batch": "VCF-2390", "tanggal_ed": "2026-10-25", "qty_sistem": 12, "pbf_asal": "PT Enseval Putera Megatrading", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-06"},
    {"nama_obat": "Curcuma Plus Sirup 120ml", "bentuk_sediaan": "Sirup", "no_batch": "CRC-2418", "tanggal_ed": "2027-01-30", "qty_sistem": 16, "pbf_asal": "PT Soho Industri Pharmasi", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak C-07"},
    {"nama_obat": "Bodrexin Sirup Jeruk 60ml", "bentuk_sediaan": "Sirup", "no_batch": "BDX-2406", "tanggal_ed": "2026-12-20", "qty_sistem": 18, "pbf_asal": "PT Tempo Scan Pacific", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak C-08"},
    {"nama_obat": "Multivitamin Sirup 100ml", "bentuk_sediaan": "Sirup", "no_batch": "MVT-2311", "tanggal_ed": "2026-10-05", "qty_sistem": 8, "pbf_asal": "PT Enseval Putera Megatrading", "kebijakan_retur_hari": 0, "status_stok": "active", "lokasi_rak": "Rak C-09"},
    {"nama_obat": "Insto Regular Tetes Mata 7,5ml", "bentuk_sediaan": "Tetes", "no_batch": "INS-2403", "tanggal_ed": "2026-10-20", "qty_sistem": 25, "pbf_asal": "PT Combiphar", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak D-01"},
    {"nama_obat": "Insto Dry Eyes 7,5ml", "bentuk_sediaan": "Tetes", "no_batch": "IDE-2408", "tanggal_ed": "2026-11-12", "qty_sistem": 15, "pbf_asal": "PT Combiphar", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak D-02"},
    {"nama_obat": "Cendo Xitrol Tetes Mata 5ml", "bentuk_sediaan": "Tetes", "no_batch": "CDX-2399", "tanggal_ed": "2026-10-14", "qty_sistem": 20, "pbf_asal": "PT Parit Padang Global", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak D-03"},
    {"nama_obat": "Cendo Fenicol Tetes Mata 5ml", "bentuk_sediaan": "Tetes", "no_batch": "CDF-2402", "tanggal_ed": "2026-11-05", "qty_sistem": 10, "pbf_asal": "PT Parit Padang Global", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak D-04"},
    {"nama_obat": "Erlamycetin Tetes Telinga 10ml", "bentuk_sediaan": "Tetes", "no_batch": "ERL-2410", "tanggal_ed": "2026-12-08", "qty_sistem": 14, "pbf_asal": "PT Mensa Bina Sukses", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak D-05"},
    {"nama_obat": "Otolin Tetes Telinga 10ml", "bentuk_sediaan": "Tetes", "no_batch": "OTL-2385", "tanggal_ed": "2026-10-18", "qty_sistem": 8, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak D-06"},
    {"nama_obat": "Iliadin Nasal Spray 10ml", "bentuk_sediaan": "Tetes", "no_batch": "ILD-2411", "tanggal_ed": "2027-02-15", "qty_sistem": 12, "pbf_asal": "PT Merck Indonesia", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak D-07"},
    {"nama_obat": "Kalpanax Krim 10g", "bentuk_sediaan": "Krim", "no_batch": "KLP-2411", "tanggal_ed": "2026-11-15", "qty_sistem": 30, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-01"},
    {"nama_obat": "Hydrocortisone Krim 2,5% 5g", "bentuk_sediaan": "Krim", "no_batch": "HDR-2401", "tanggal_ed": "2026-10-28", "qty_sistem": 22, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-02"},
    {"nama_obat": "Pi Kang Shuang Krim 5g", "bentuk_sediaan": "Krim", "no_batch": "PKS-2394", "tanggal_ed": "2026-10-09", "qty_sistem": 15, "pbf_asal": "PT Sinar Herba Radix", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-03"},
    {"nama_obat": "Gentamicin Salep Kulit 5g", "bentuk_sediaan": "Salep", "no_batch": "GNT-2280", "tanggal_ed": "2026-10-10", "qty_sistem": 30, "pbf_asal": "PT Mensa Bina Sukses", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-04"},
    {"nama_obat": "Salep 88 6g", "bentuk_sediaan": "Salep", "no_batch": "S88-2415", "tanggal_ed": "2027-03-20", "qty_sistem": 50, "pbf_asal": "PT MECCAYA", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-05"},
    {"nama_obat": "Oxytetracycline Salep Mata 3,5g", "bentuk_sediaan": "Salep", "no_batch": "OXY-2406", "tanggal_ed": "2026-11-02", "qty_sistem": 18, "pbf_asal": "PT Kimia Farma Trading", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak E-06"},
    {"nama_obat": "Bioplacenton Gel 15g", "bentuk_sediaan": "Gel", "no_batch": "BPC-2409", "tanggal_ed": "2026-12-12", "qty_sistem": 24, "pbf_asal": "PT Kalbe Farma", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Rak E-07"},
    {"nama_obat": "Voltaren Emulgel 20g", "bentuk_sediaan": "Gel", "no_batch": "VLT-2414", "tanggal_ed": "2027-01-10", "qty_sistem": 16, "pbf_asal": "PT Novartis Indonesia", "kebijakan_retur_hari": 90, "status_stok": "active", "lokasi_rak": "Rak E-08"},
    {"nama_obat": "Ceftriaxone Injeksi 1g", "bentuk_sediaan": "Injeksi", "no_batch": "CFT-2408", "tanggal_ed": "2026-10-25", "qty_sistem": 10, "pbf_asal": "PT Dexa Medica", "kebijakan_retur_hari": 60, "status_stok": "active", "lokasi_rak": "Kulkas Medis 01"}
]


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fungsi utama eksekusi pemindaian harian stok near-expired
    """
    try:
        parameters = ctx.get('parameters', {}) or {}
        variables = ctx.get('variables', {}) or {}

        # Tanggal referensi scan (default: hari ini)
        ref_date_str = parameters.get('scan_date') or variables.get('scan_date')
        if ref_date_str:
            try:
                today = datetime.strptime(str(ref_date_str).split('T')[0], '%Y-%m-%d').date()
            except Exception:
                today = date.today()
        else:
            today = date.today()

        # Daftar persediaan (gunakan input custom jika disuplai di parameters/variables, jika tidak pakai master)
        inventory_input = parameters.get('inventory') or variables.get('inventory')
        inventory = inventory_input if isinstance(inventory_input, list) and len(inventory_input) > 0 else MASTER_INVENTORY

        near_expired_items = []
        summary_by_urgency = {
            "OVERDUE_RETURN": 0,
            "CRITICAL_RETURN": 0,
            "WARNING_RETURN": 0,
            "MONITORING": 0
        }

        for item in inventory:
            try:
                nama_obat = item.get('nama_obat') or item.get('name') or 'Obat Tanpa Nama'
                no_batch = item.get('no_batch') or item.get('batch_no') or '-'
                bentuk_sediaan = item.get('bentuk_sediaan') or item.get('dosage_form') or 'Tablet'
                pbf_asal = item.get('pbf_asal') or item.get('supplier') or '-'
                status_stok = str(item.get('status_stok') or 'active').strip().upper()
                lokasi_rak = item.get('lokasi_rak') or '-'

                # Qty sistem
                qty_raw = item.get('qty_sistem', item.get('qty', item.get('stock', 0)))
                try:
                    qty_sistem = int(qty_raw)
                except (ValueError, TypeError):
                    qty_sistem = 0

                # Kebijakan retur hari
                kebijakan_raw = item.get('kebijakan_retur_hari', 60)
                try:
                    kebijakan_retur_hari = int(kebijakan_raw)
                except (ValueError, TypeError):
                    kebijakan_retur_hari = 60

                # Tanggal ED
                ed_raw = str(item.get('tanggal_ed') or item.get('expired_date') or '').split('T')[0]
                if not ed_raw:
                    continue

                ed_date = datetime.strptime(ed_raw, '%Y-%m-%d').date()

                # Hitung selisih hari menuju ED dan Batas Retur
                selisih_hari_ed = (ed_date - today).days
                batas_retur_date = ed_date - timedelta(days=kebijakan_retur_hari)
                selisih_hari_batas_retur = (batas_retur_date - today).days

                # Filter kriteria PRD:
                # Obat masuk kategori near-expired jika selisih_hari_ed <= kebijakan_retur_hari dan status_stok == 'ACTIVE'
                # (atau jika batas retur sudah terlewati / mendekati)
                is_near_expired = (selisih_hari_ed <= kebijakan_retur_hari) and (status_stok == 'ACTIVE')

                if is_near_expired:
                    # Klasifikasi tingkat urgensi
                    if selisih_hari_batas_retur < 0:
                        urgency = "OVERDUE_RETURN"
                        summary_by_urgency["OVERDUE_RETURN"] += 1
                        rekomendasi = (
                            f"Batas retur telah terlewati ({abs(selisih_hari_batas_retur)} hari lalu). "
                            "Wajib proses Berita Acara Pemusnahan Obat (Permenkes 73/2016) atau penanganan alternatif."
                        )
                    elif selisih_hari_batas_retur <= 14:
                        urgency = "CRITICAL_RETURN"
                        summary_by_urgency["CRITICAL_RETURN"] += 1
                        rekomendasi = (
                            f"Mendesak: Sisa {selisih_hari_batas_retur} hari menuju batas retur distributor. "
                            "Segera terbitkan tiket pengajuan retur ke PBF."
                        )
                    elif selisih_hari_batas_retur <= 30:
                        urgency = "WARNING_RETURN"
                        summary_by_urgency["WARNING_RETURN"] += 1
                        rekomendasi = (
                            f"Peringatan: Sisa {selisih_hari_batas_retur} hari menuju batas retur. "
                            "Persiapkan verifikasi fisik obat dan faktur penerimaan."
                        )
                    else:
                        urgency = "MONITORING"
                        summary_by_urgency["MONITORING"] += 1
                        rekomendasi = (
                            f"Dalam pemantauan: Sisa {selisih_hari_batas_retur} hari sebelum batas retur. "
                            "Prioritaskan pengeluaran stok (FEFO)."
                        )

                    near_expired_items.append({
                        "nama_obat": nama_obat,
                        "no_batch": no_batch,
                        "bentuk_sediaan": bentuk_sediaan,
                        "tanggal_ed": ed_date.strftime('%Y-%m-%d'),
                        "qty_sistem": qty_sistem,
                        "pbf_asal": pbf_asal,
                        "kebijakan_retur_hari": kebijakan_retur_hari,
                        "batas_retur": batas_retur_date.strftime('%Y-%m-%d'),
                        "sisa_hari_ed": selisih_hari_ed,
                        "sisa_hari_batas_retur": selisih_hari_batas_retur,
                        "lokasi_rak": lokasi_rak,
                        "urgency": urgency,
                        "rekomendasi_tindakan": rekomendasi
                    })

            except Exception as item_err:
                continue

        # Urutkan berdasarkan sisa hari batas retur terpendek (paling mendesak di awal)
        near_expired_items.sort(key=lambda x: x["sisa_hari_batas_retur"])

        # Format tiket-tiket yang perlu diterbitkan
        tickets_to_generate = [
            {
                "nama_obat": x["nama_obat"],
                "no_batch": x["no_batch"],
                "bentuk_sediaan": x["bentuk_sediaan"],
                "tanggal_ed": x["tanggal_ed"],
                "qty_sistem": x["qty_sistem"],
                "pbf_asal": x["pbf_asal"],
                "kebijakan_retur_hari": x["kebijakan_retur_hari"],
                "batas_retur": x["batas_retur"],
                "urgency": x["urgency"],
                "rekomendasi_tindakan": x["rekomendasi_tindakan"]
            }
            for x in near_expired_items
        ]

        return {
            "status": "success",
            "message": (
                f"Pemindaian selesai pada {today.strftime('%Y-%m-%d')}: "
                f"Ditemukan {len(near_expired_items)} obat near-expired dari {len(inventory)} total persediaan."
            ),
            "data": {
                "scan_date": today.strftime('%Y-%m-%d'),
                "total_scanned": len(inventory),
                "total_near_expired": len(near_expired_items),
                "summary_by_urgency": summary_by_urgency,
                "near_expired_items": near_expired_items,
                "tickets_to_generate": tickets_to_generate
            },
            "runkey": ctx.get('runkey', '')
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Gagal menjalankan scan near-expired: {str(e)}",
            "data": None,
            "runkey": ctx.get('runkey', '')
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description='Daily Cron Scan for Near-Expired Medicine Inventory')
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
