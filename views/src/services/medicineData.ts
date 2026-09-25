export interface MedicineItem {
    nama_obat: string;
    bentuk_sediaan: string;
    no_batch: string;
    tanggal_ed: string; // Format baku ISO: YYYY-MM-DD
    qty_sistem: number;
    pbf_asal: string;
    kebijakan_retur_hari: number;
    batas_retur?: string; // Format: YYYY-MM-DD
    lokasi_rak?: string;
    catatan_temuan?: string;
}

/**
 * Data lengkap 40 sampel obat dari template master persediaan apotek (Persediaan-Obat-template.xlsx)
 * Digunakan sebagai fallback offline / dev mode maupun saat endpoint API belum dikonfigurasi.
 */
export const FALLBACK_MEDICINES: MedicineItem[] = [
    {
        nama_obat: 'Amoxicillin 500mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'AMX-2401',
        tanggal_ed: '2026-10-31',
        qty_sistem: 20,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Paracetamol 500mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'PCT-2405',
        tanggal_ed: '2026-11-15',
        qty_sistem: 50,
        pbf_asal: 'PT Tempo Scan Pacific',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Cefixime 100mg',
        bentuk_sediaan: 'Kapsul',
        no_batch: 'CFX-2389',
        tanggal_ed: '2026-10-20',
        qty_sistem: 15,
        pbf_asal: 'PT Dexa Medica',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Ciprofloxacin 500mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'CPR-2412',
        tanggal_ed: '2026-12-10',
        qty_sistem: 25,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Metformin 500mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'MTF-2501',
        tanggal_ed: '2028-05-15',
        qty_sistem: 100,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Amlodipine 10mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'AML-2408',
        tanggal_ed: '2026-11-25',
        qty_sistem: 40,
        pbf_asal: 'PT Dexa Medica',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Simvastatin 20mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'SMV-2403',
        tanggal_ed: '2026-10-18',
        qty_sistem: 30,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Asam Mefenamat 500mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'AMF-2410',
        tanggal_ed: '2026-12-05',
        qty_sistem: 35,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Ibuprofen 400mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'IBP-2395',
        tanggal_ed: '2026-10-12',
        qty_sistem: 20,
        pbf_asal: 'PT Tempo Scan Pacific',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Dexamethasone 0,5mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'DXM-2402',
        tanggal_ed: '2026-11-30',
        qty_sistem: 60,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Cetirizine 10mg',
        bentuk_sediaan: 'Tablet',
        no_batch: 'CTZ-2415',
        tanggal_ed: '2027-01-15',
        qty_sistem: 45,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Lansoprazole 30mg',
        bentuk_sediaan: 'Kapsul',
        no_batch: 'LNZ-2380',
        tanggal_ed: '2026-10-22',
        qty_sistem: 18,
        pbf_asal: 'PT Dexa Medica',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Omeprazole 20mg',
        bentuk_sediaan: 'Kapsul',
        no_batch: 'OMP-2405',
        tanggal_ed: '2026-10-05',
        qty_sistem: 12,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Clindamycin 300mg',
        bentuk_sediaan: 'Kapsul',
        no_batch: 'CLN-2407',
        tanggal_ed: '2026-11-18',
        qty_sistem: 22,
        pbf_asal: 'PT Dexa Medica',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Neurobion Forte',
        bentuk_sediaan: 'Tablet',
        no_batch: 'NRB-2419',
        tanggal_ed: '2027-02-20',
        qty_sistem: 30,
        pbf_asal: 'PT Enseval Putera Megatrading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Paracetamol Sirup 60ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'PCT-2309',
        tanggal_ed: '2026-10-15',
        qty_sistem: 15,
        pbf_asal: 'PT Anugrah Argon Medica',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Sanmol Drop 15ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'SNM-2401',
        tanggal_ed: '2026-11-10',
        qty_sistem: 10,
        pbf_asal: 'PT Caprifarmindo',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Amoxicillin Sirup Kering 60ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'AMX-2311',
        tanggal_ed: '2026-10-08',
        qty_sistem: 14,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Antasida Doen Suspensi 60ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'ATD-2404',
        tanggal_ed: '2026-12-15',
        qty_sistem: 25,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'OBH Combi Batuk Berdahak 100ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'OBH-2412',
        tanggal_ed: '2026-11-28',
        qty_sistem: 20,
        pbf_asal: 'PT Combiphar',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Vicks Formula 44 54ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'VCF-2390',
        tanggal_ed: '2026-10-25',
        qty_sistem: 12,
        pbf_asal: 'PT Enseval Putera Megatrading',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Curcuma Plus Sirup 120ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'CRC-2418',
        tanggal_ed: '2027-01-30',
        qty_sistem: 16,
        pbf_asal: 'PT Soho Industri Pharmasi',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Bodrexin Sirup Jeruk 60ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'BDX-2406',
        tanggal_ed: '2026-12-20',
        qty_sistem: 18,
        pbf_asal: 'PT Tempo Scan Pacific',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Multivitamin Sirup 100ml',
        bentuk_sediaan: 'Sirup',
        no_batch: 'MVT-2311',
        tanggal_ed: '2026-10-05',
        qty_sistem: 8,
        pbf_asal: 'PT Enseval Putera Megatrading',
        kebijakan_retur_hari: 0,
    },
    {
        nama_obat: 'Insto Regular Tetes Mata 7,5ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'INS-2403',
        tanggal_ed: '2026-10-20',
        qty_sistem: 25,
        pbf_asal: 'PT Combiphar',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Insto Dry Eyes 7,5ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'IDE-2408',
        tanggal_ed: '2026-11-12',
        qty_sistem: 15,
        pbf_asal: 'PT Combiphar',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Cendo Xitrol Tetes Mata 5ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'CDX-2399',
        tanggal_ed: '2026-10-14',
        qty_sistem: 20,
        pbf_asal: 'PT Parit Padang Global',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Cendo Fenicol Tetes Mata 5ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'CDF-2402',
        tanggal_ed: '2026-11-05',
        qty_sistem: 10,
        pbf_asal: 'PT Parit Padang Global',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Erlamycetin Tetes Telinga 10ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'ERL-2410',
        tanggal_ed: '2026-12-08',
        qty_sistem: 14,
        pbf_asal: 'PT Mensa Bina Sukses',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Otolin Tetes Telinga 10ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'OTL-2385',
        tanggal_ed: '2026-10-18',
        qty_sistem: 8,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Iliadin Nasal Spray 10ml',
        bentuk_sediaan: 'Tetes',
        no_batch: 'ILD-2411',
        tanggal_ed: '2027-02-15',
        qty_sistem: 12,
        pbf_asal: 'PT Merck Indonesia',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Kalpanax Krim 10g',
        bentuk_sediaan: 'Krim',
        no_batch: 'KLP-2411',
        tanggal_ed: '2026-11-15',
        qty_sistem: 30,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Hydrocortisone Krim 2,5% 5g',
        bentuk_sediaan: 'Krim',
        no_batch: 'HDR-2401',
        tanggal_ed: '2026-10-28',
        qty_sistem: 22,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Pi Kang Shuang Krim 5g',
        bentuk_sediaan: 'Krim',
        no_batch: 'PKS-2394',
        tanggal_ed: '2026-10-09',
        qty_sistem: 15,
        pbf_asal: 'PT Sinar Herba Radix',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Gentamicin Salep Kulit 5g',
        bentuk_sediaan: 'Salep',
        no_batch: 'GNT-2280',
        tanggal_ed: '2026-10-10',
        qty_sistem: 30,
        pbf_asal: 'PT Mensa Bina Sukses',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Salep 88 6g',
        bentuk_sediaan: 'Salep',
        no_batch: 'S88-2415',
        tanggal_ed: '2027-03-20',
        qty_sistem: 50,
        pbf_asal: 'PT MECCAYA',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Oxytetracycline Salep Mata 3,5g',
        bentuk_sediaan: 'Salep',
        no_batch: 'OXY-2406',
        tanggal_ed: '2026-11-02',
        qty_sistem: 18,
        pbf_asal: 'PT Kimia Farma Trading',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Bioplacenton Gel 15g',
        bentuk_sediaan: 'Gel',
        no_batch: 'BPC-2409',
        tanggal_ed: '2026-12-12',
        qty_sistem: 24,
        pbf_asal: 'PT Kalbe Farma',
        kebijakan_retur_hari: 60,
    },
    {
        nama_obat: 'Voltaren Emulgel 20g',
        bentuk_sediaan: 'Gel',
        no_batch: 'VLT-2414',
        tanggal_ed: '2027-01-10',
        qty_sistem: 16,
        pbf_asal: 'PT Novartis Indonesia',
        kebijakan_retur_hari: 90,
    },
    {
        nama_obat: 'Ceftriaxone Injeksi 1g',
        bentuk_sediaan: 'Injeksi',
        no_batch: 'CFT-2408',
        tanggal_ed: '2026-10-25',
        qty_sistem: 10,
        pbf_asal: 'PT Dexa Medica',
        kebijakan_retur_hari: 60,
    },
];

// Alias untuk menjaga kompatibilitas import sebelumnya
export const DEFAULT_MEDICINE_LIST = FALLBACK_MEDICINES;

/**
 * Menghitung batas retur = tanggal_ed - (kebijakan_retur_hari dalam milidetik).
 * Menghasilkan string berformat YYYY-MM-DD dengan null-safety & validasi tanggal.
 */
export function calculateBatasRetur(
    tanggalEd: string | undefined | null,
    kebijakanHari: number | string | undefined | null
): string {
    if (!tanggalEd) return '';

    let edDate: Date;
    // Dukung format YYYY-MM-DD atau ISO string
    if (typeof tanggalEd === 'string' && tanggalEd.includes('-')) {
        const parts = tanggalEd.split('T')[0].split('-');
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            edDate = new Date(y, m, d);
        } else {
            edDate = new Date(tanggalEd);
        }
    } else {
        edDate = new Date(tanggalEd);
    }

    if (isNaN(edDate.getTime())) {
        return '';
    }

    const days = Number(kebijakanHari);
    if (isNaN(days) || days < 0) {
        return '';
    }

    const returMs = edDate.getTime() - (days * 24 * 60 * 60 * 1000);
    const returDate = new Date(returMs);

    if (isNaN(returDate.getTime())) {
        return '';
    }

    const year = returDate.getFullYear();
    const month = String(returDate.getMonth() + 1).padStart(2, '0');
    const day = String(returDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Mengambil data master persediaan obat.
 * Jika alurkerjaParams memiliki apiBaseUrl dan token, lakukan HTTP GET ke endpoint AlurKerja.
 * Jika gagal atau berjalan di mode standalone/dev, fallback ke FALLBACK_MEDICINES tanpa melempar fatal error.
 */
export async function fetchMedicineMaster(alurkerjaParams?: {
    apiBaseUrl?: string;
    token?: string;
    [key: string]: any;
}): Promise<MedicineItem[]> {
    if (alurkerjaParams?.apiBaseUrl && alurkerjaParams?.token) {
        try {
            const cleanBaseUrl = alurkerjaParams.apiBaseUrl.replace(/\/+$/, '');
            const response = await fetch(`${cleanBaseUrl}/api/v1/persediaan-obat`, {
                headers: {
                    'Authorization': `Bearer ${alurkerjaParams.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const json = await response.json();
                const list = Array.isArray(json)
                    ? json
                    : (json?.data ?? json?.content ?? json?.items ?? []);

                if (Array.isArray(list) && list.length > 0) {
                    return list.map((item: any) => ({
                        nama_obat: item.nama_obat || item.name || '',
                        bentuk_sediaan: item.bentuk_sediaan || item.dosage_form || 'Tablet',
                        no_batch: item.no_batch || item.batch_no || '',
                        tanggal_ed: item.tanggal_ed || item.expired_date || '',
                        qty_sistem: Number(item.qty_sistem ?? item.qty ?? item.stock ?? 0),
                        pbf_asal: item.pbf_asal || item.supplier || '',
                        kebijakan_retur_hari: Number(item.kebijakan_retur_hari ?? 60),
                        lokasi_rak: item.lokasi_rak || item.rack_location || '',
                        catatan_temuan: item.catatan_temuan || '',
                    }));
                }
            } else {
                console.warn(`[fetchMedicineMaster] Endpoint responded with status ${response.status}. Using fallback seed.`);
            }
        } catch (err) {
            console.warn('[fetchMedicineMaster] Network/API error, falling back to local seed data:', err);
        }
    }

    return FALLBACK_MEDICINES;
}
