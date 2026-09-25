import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search,
    Calendar,
    AlertCircle,
    Building2,
    Layers,
    MapPin,
    FileText,
    CheckCircle2,
    Clock,
    RotateCcw,
    X,
    ShieldAlert,
    Info,
} from 'lucide-react';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';
import {
    MedicineItem,
    fetchMedicineMaster,
    calculateBatasRetur,
    FALLBACK_MEDICINES,
} from '../services/medicineData';

interface ExtendedMfeProps extends Partial<AlurkerjaMfeInputProps> {
    form?: any;
    [key: string]: any;
}

export default function MedicineAutoFillForm(allProps: ExtendedMfeProps) {
    // Dukung prop standar AlurkerjaMfeInputProps ({ props, alurkerjaParams }) maupun fallback ({ form, alurkerjaParams })
    const alurkerjaProps = allProps.props;
    const form = alurkerjaProps?.form ?? allProps.form;
    const itemConfig = alurkerjaProps?.item;
    const alurkerjaParams = allProps.alurkerjaParams;

    // Periksa status read-only / disabled sesuai panduan MFE AlurKerja
    const isDisabled = Boolean(itemConfig?.disabled);

    // Form value helpers
    const setValue = form?.setValue;
    const watch = form?.watch;
    const getValues = form?.getValues;

    // Watch process variables dari Form Context
    const watchedNamaObat = watch ? watch('nama_obat') : getValues?.('nama_obat');
    const watchedBentukSediaan = watch ? watch('bentuk_sediaan') : getValues?.('bentuk_sediaan');
    const watchedNoBatch = watch ? watch('no_batch') : getValues?.('no_batch');
    const watchedTanggalEd = watch ? watch('tanggal_ed') : getValues?.('tanggal_ed');
    const watchedQtySistem = watch ? watch('qty_sistem') : getValues?.('qty_sistem');
    const watchedPbfAsal = watch ? watch('pbf_asal') : getValues?.('pbf_asal');
    const watchedKebijakanRetur = watch ? watch('kebijakan_retur_hari') : getValues?.('kebijakan_retur_hari');
    const watchedBatasRetur = watch ? watch('batas_retur') : getValues?.('batas_retur');
    const watchedLokasiRak = watch ? watch('lokasi_rak') : getValues?.('lokasi_rak');
    const watchedCatatanTemuan = watch ? watch('catatan_temuan') : getValues?.('catatan_temuan');

    // Master Data State (40 sampel obat dari template)
    const [medicines, setMedicines] = useState<MedicineItem[]>(FALLBACK_MEDICINES);
    const [isLoadingMaster, setIsLoadingMaster] = useState(false);

    // Dropdown / Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load master persediaan obat
    useEffect(() => {
        let isMounted = true;
        const loadMedicines = async () => {
            setIsLoadingMaster(true);
            try {
                const data = await fetchMedicineMaster(alurkerjaParams);
                if (isMounted && data.length > 0) {
                    setMedicines(data);
                }
            } catch (err) {
                console.warn('Gagal memuat master obat, menggunakan data fallback lokal:', err);
            } finally {
                if (isMounted) {
                    setIsLoadingMaster(false);
                }
            }
        };

        loadMedicines();
        return () => {
            isMounted = false;
        };
    }, [alurkerjaParams?.apiBaseUrl, alurkerjaParams?.token]);

    // Handle klik di luar dropdown untuk menutup combobox
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter daftar obat berdasarkan query pencarian (nama atau no_batch)
    const filteredMedicines = useMemo(() => {
        if (!searchTerm.trim()) {
            return medicines;
        }
        const term = searchTerm.toLowerCase();
        return medicines.filter(
            (m) =>
                m.nama_obat.toLowerCase().includes(term) ||
                m.no_batch.toLowerCase().includes(term) ||
                m.pbf_asal.toLowerCase().includes(term)
        );
    }, [medicines, searchTerm]);

    // Handler ketika obat dipilih dari dropdown
    const handleSelectMedicine = (med: MedicineItem) => {
        if (!setValue) return;

        const calculatedBatas = calculateBatasRetur(med.tanggal_ed, med.kebijakan_retur_hari);

        // Bind semua variabel ke Camunda Form Context sesuai kontrak PRD
        setValue('nama_obat', med.nama_obat, { shouldValidate: true, shouldDirty: true });
        setValue('bentuk_sediaan', med.bentuk_sediaan, { shouldValidate: true, shouldDirty: true });
        setValue('no_batch', med.no_batch, { shouldValidate: true, shouldDirty: true });
        setValue('tanggal_ed', med.tanggal_ed, { shouldValidate: true, shouldDirty: true });
        setValue('qty_sistem', med.qty_sistem, { shouldValidate: true, shouldDirty: true });
        setValue('pbf_asal', med.pbf_asal, { shouldValidate: true, shouldDirty: true });
        setValue('kebijakan_retur_hari', med.kebijakan_retur_hari, { shouldValidate: true, shouldDirty: true });
        setValue('batas_retur', calculatedBatas, { shouldValidate: true, shouldDirty: true });

        if (med.lokasi_rak && !watchedLokasiRak) {
            setValue('lokasi_rak', med.lokasi_rak, { shouldValidate: true, shouldDirty: true });
        }

        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    // Handler perubahan kebijakan retur manual (dengan kalkulasi ulang dinamis ke batas_retur)
    const handleKebijakanReturChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!setValue) return;
        const val = e.target.value === '' ? '' : Number(e.target.value);
        setValue('kebijakan_retur_hari', val, { shouldValidate: true, shouldDirty: true });

        if (watchedTanggalEd) {
            const newBatas = calculateBatasRetur(watchedTanggalEd, val);
            setValue('batas_retur', newBatas, { shouldValidate: true, shouldDirty: true });
        }
    };

    // Handler reset pilihan obat
    const handleClearSelection = () => {
        if (!setValue || isDisabled) return;
        setValue('nama_obat', '', { shouldValidate: true, shouldDirty: true });
        setValue('bentuk_sediaan', '', { shouldValidate: true, shouldDirty: true });
        setValue('no_batch', '', { shouldValidate: true, shouldDirty: true });
        setValue('tanggal_ed', '', { shouldValidate: true, shouldDirty: true });
        setValue('qty_sistem', 0, { shouldValidate: true, shouldDirty: true });
        setValue('pbf_asal', '', { shouldValidate: true, shouldDirty: true });
        setValue('kebijakan_retur_hari', 60, { shouldValidate: true, shouldDirty: true });
        setValue('batas_retur', '', { shouldValidate: true, shouldDirty: true });
        setValue('lokasi_rak', '', { shouldValidate: true, shouldDirty: true });
        setValue('catatan_temuan', '', { shouldValidate: true, shouldDirty: true });
    };

    // Hitung status batas retur untuk indikator visual apoteker
    const returStatusInfo = useMemo(() => {
        if (!watchedBatasRetur) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const batasDate = new Date(watchedBatasRetur);
        if (isNaN(batasDate.getTime())) return null;

        const diffTime = batasDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                variant: 'danger',
                label: `Batas Retur Terlewat (${Math.abs(diffDays)} hari yang lalu)`,
                subText: 'Obat sudah melewati ambang batas retur distributor. Wajib diproses penanganan alternatif.',
            };
        } else if (diffDays <= 30) {
            return {
                variant: 'warning',
                label: `Kritis: Sisa ${diffDays} hari menuju Batas Retur`,
                subText: 'Segera ajukan retur ke PBF sebelum tanggal batas retur terlampaui.',
            };
        } else {
            return {
                variant: 'success',
                label: `Sisa ${diffDays} hari menuju Batas Retur`,
                subText: 'Waktu retur masih dalam batas aman kebijakan distributor.',
            };
        }
    }, [watchedBatasRetur]);

    const isMedicineSelected = Boolean(watchedNamaObat && watchedNoBatch);

    // =========================================================================
    // 1. TAMPILAN READ-ONLY / DISABLED (Digunakan pada UT-04, UT-05, UT-10 dll.)
    // =========================================================================
    if (isDisabled) {
        return (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                {/* Header Read-Only Bersih Tanpa Kotak Icon */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Ringkasan Data Obat Near-Expired
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Mode Tinjauan (Read-Only) • Task Evaluasi / Keputusan
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Proses BPMN Terkunci
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Ringkasan Utama */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Obat</span>
                                <div className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 font-medium">
                                    {watchedNamaObat || '-'}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor Batch</span>
                                <div className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono font-bold text-slate-800">
                                    {watchedNoBatch || '-'}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Bentuk Sediaan</span>
                                <div className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800">
                                    {watchedBentukSediaan || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                            <span className="block text-xs font-semibold text-slate-600 mb-1">
                                Tanggal ED
                            </span>
                            <span className="text-sm font-bold text-red-600">
                                {watchedTanggalEd || '-'}
                            </span>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                            <span className="block text-xs font-semibold text-slate-600 mb-1">
                                Qty Sistem
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                                {watchedQtySistem ?? 0} Unit
                            </span>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                            <span className="block text-xs font-semibold text-slate-600 mb-1">
                                Batas Retur
                            </span>
                            <span className="text-sm font-bold text-indigo-700">
                                {watchedBatasRetur || '-'}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                                ({watchedKebijakanRetur ?? 60} hari sebelum ED)
                            </span>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
                            <span className="block text-xs font-semibold text-slate-600 mb-1">
                                PBF Rekanan
                            </span>
                            <span className="text-xs font-semibold text-slate-800 truncate block">
                                {watchedPbfAsal || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Informasi Lokasi & Catatan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                            <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Lokasi Rak Fisik
                            </span>
                            <div className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800">
                                {watchedLokasiRak || 'Tidak dicantumkan'}
                            </div>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                            <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Catatan Temuan
                            </span>
                            <div className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-700 italic">
                                {watchedCatatanTemuan || 'Tidak ada catatan tambahan'}
                            </div>
                        </div>
                    </div>

                    {/* Badge Notifikasi Status Retur */}
                    {returStatusInfo && (
                        <div
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed mt-2 ${
                                returStatusInfo.variant === 'danger'
                                    ? 'border-red-200 bg-red-50/80 text-red-800'
                                    : returStatusInfo.variant === 'warning'
                                    ? 'border-amber-200 bg-amber-50/80 text-amber-800'
                                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                            }`}
                        >
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">{returStatusInfo.label}: </span>
                                <span>{returStatusInfo.subText}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================================
    // 2. TAMPILAN FORM EDITABLE / INTERAKTIF (Digunakan pada UT-01 Pencatatan)
    // =========================================================================
    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
            {/* Header Bersih Tanpa Wadah Kotak Kosong */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Pencatatan Obat Near-Expired
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Pilih batch obat dari persediaan untuk otomatisasi verifikasi data & batas retur distributor.
                    </p>
                </div>

                {isMedicineSelected && (
                    <button
                        type="button"
                        onClick={handleClearSelection}
                        className="border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors self-start"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ganti Pilihan Obat</span>
                    </button>
                )}
            </div>

            {/* Searchable Dropdown / Combobox dengan Padding Aman (Teks Tidak Menabrak Ikon) */}
            <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Cari & Pilih Obat dari Persediaan <span className="text-red-500">*</span>
                </label>

                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={
                            isLoadingMaster
                            ? 'Memuat master persediaan...'
                            : isMedicineSelected
                            ? `Terpilih: ${watchedNamaObat} (${watchedNoBatch}) - Ketik untuk cari lain...`
                            : 'Ketik nama obat atau nomor batch (contoh: Amoxicillin / AMX-2401)...'
                        }
                        style={{ paddingLeft: '40px', paddingRight: '40px' }}
                        className="py-2.5 w-full bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                        >
                        </button>
                    </div>
                </div>

                {/* Dropdown Popup Menu dengan z-50, shadow-2xl, dan tidak terpotong */}
                {isDropdownOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 divide-y divide-slate-100">
                        {filteredMedicines.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">
                                Tidak ada obat yang cocok dengan pencarian "{searchTerm}".
                            </div>
                        ) : (
                            filteredMedicines.map((med) => {
                                const isSelected = med.no_batch === watchedNoBatch;
                                return (
                                    <div
                                        key={`${med.no_batch}-${med.nama_obat}`}
                                        onClick={() => handleSelectMedicine(med)}
                                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-blue-50/80 hover:bg-blue-100/80'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-sm text-slate-900">
                                                    {med.nama_obat}
                                                </span>
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                    {med.no_batch}
                                                </span>
                                                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                    {med.bentuk_sediaan}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 space-x-3">
                                                <span>Stok: <strong className="text-slate-700">{med.qty_sistem}</strong></span>
                                                <span>•</span>
                                                <span>PBF: <strong className="text-slate-700">{med.pbf_asal}</strong></span>
                                                <span>•</span>
                                                <span className="text-red-600 font-medium">
                                                    ED: {med.tanggal_ed}
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Banner Peringatan Jika Belum Memilih Obat */}
            {!isMedicineSelected && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Perhatian: </span>
                        Silakan cari dan pilih obat di atas untuk mengisi parameter formulir secara otomatis.
                    </div>
                </div>
            )}

            {/* BAGIAN DATA AUTO-FILL & INPUT FORM */}
            {isMedicineSelected && (
                <div className="space-y-6 pt-1">
                    {/* 1. Baris Identitas Teknis Obat (Auto-filled) */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wider uppercase mb-3">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>Identitas Obat & Status Master</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Nama Obat (nama_obat)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={watchedNamaObat || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none font-medium cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Nomor Batch (no_batch)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={watchedNoBatch || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Bentuk Sediaan (bentuk_sediaan)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={watchedBentukSediaan || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Qty di Sistem (qty_sistem)
                                </label>
                                <input
                                    type="number"
                                    readOnly
                                    value={watchedQtySistem ?? 0}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    PBF Distributor Asal (pbf_asal)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={watchedPbfAsal || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Baris Kedaluwarsa & Kalkulasi Batas Retur Dinamis */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wider uppercase mb-3">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>Kedaluwarsa & Batas Retur Distributor</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Tanggal ED (tanggal_ed)
                                </label>
                                <input
                                    type="date"
                                    readOnly
                                    value={watchedTanggalEd || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-red-600 font-bold focus:outline-none cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Kebijakan Retur PBF (Hari)
                                    </label>
                                    <span className="text-[11px] text-slate-400">Default: 60/90</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={watchedKebijakanRetur ?? 60}
                                    onChange={handleKebijakanReturChange}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Contoh: 60"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Batas Retur Otomatis
                                    </label>
                                    <span className="text-[11px] text-blue-600 font-medium">Kalkulasi Otomatis</span>
                                </div>
                                <input
                                    type="date"
                                    readOnly
                                    value={watchedBatasRetur || ''}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-bold text-indigo-700 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Status Banner Kedaluwarsa/Retur */}
                        {returStatusInfo && (
                            <div
                                className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed mt-2 ${
                                    returStatusInfo.variant === 'danger'
                                        ? 'border-red-200 bg-red-50/80 text-red-800'
                                        : returStatusInfo.variant === 'warning'
                                        ? 'border-amber-200 bg-amber-50/80 text-amber-800'
                                        : 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                                    }`}
                            >
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">{returStatusInfo.label}: </span>
                                    <span>{returStatusInfo.subText}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Baris Input Fisik & Temuan Apoteker (lokasi_rak & catatan_temuan) */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wider uppercase mb-3">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>Observasi Fisik & Catatan Apotek</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Lokasi Rak Fisik (lokasi_rak)
                                </label>
                                <input
                                    type="text"
                                    value={watchedLokasiRak || ''}
                                    onChange={(e) =>
                                        setValue?.('lokasi_rak', e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                    placeholder="Contoh: Rak A-02 / Etalase Depan"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Catatan Temuan Fisik (catatan_temuan)
                                </label>
                                <textarea
                                    rows={2}
                                    value={watchedCatatanTemuan || ''}
                                    onChange={(e) =>
                                        setValue?.('catatan_temuan', e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                    placeholder="Catatan kondisi kemasan, segel, perubahan warna, dsb. (Opsional)"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
