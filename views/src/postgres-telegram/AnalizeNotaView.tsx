import React, { useEffect, useState } from 'react';
import { AlurkerjaInputType, AlurkerjaMfeInputProps, AlurkerjaMfeProps } from '../type/AlurkerjaType';


function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Return raw base64 without the data URI prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

/** Normalize receipt_file value — bisa File, File[], FileList, atau array of any */
function normalizeFiles(raw: any): File[] {
    if (!raw) return [];
    if (raw instanceof FileList) return Array.from(raw);
    if (raw instanceof File) return [raw];
    if (Array.isArray(raw)) return raw.filter((f) => f instanceof File);
    return [];
}

/**
 * Parse DD/MM/YYYY string into a valid Date object.
 * Returns null if format/value invalid (e.g. "32/13/2026", "abc", "Feb 30").
 */
function parseDDMMYYYY(str: string): Date | null {
    if (typeof str !== 'string' || !str.trim()) return null;
    const parts = str.trim().split('/');
    if (parts.length !== 3) return null;
    const dd = Number(parts[0]);
    const mm = Number(parts[1]);
    const yyyy = Number(parts[2]);
    if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) return null;
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1900 || yyyy > 2100) return null;
    const date = new Date(yyyy, mm - 1, dd);
    if (isNaN(date.getTime())) return null;
    // Guard against silent rollover (e.g. Feb 30 → Mar 2)
    if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
    return date;
}

export default function AnalizeNotaView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [extractedTotal, setExtractedTotal] = useState<number | null>(null);
    const [extractedPurpose, setExtractedPurpose] = useState<string | null>(null);
    const [extractedDate, setExtractedDate] = useState<string | null>(null);
    const [extractedDescription, setExtractedDescription] = useState<string | null>(null);

    const apiBase =
        alurkerjaParams?.apiBaseUrl ||
        'https://api.javan.alurkerja.com';

    const form = props.form;
    const item = props.item;
    const addonId = item.additional_mfe_config?.addonId ?? 3;
    const receipt_file = form.watch('receipt_file');


    const handleAnalyze = async () => {
        setResult(null);
        setErrorMsg(null);

        // Ambil file dari form value receipt_file
        const raw = form.getValues('receipt_file');
        const files = normalizeFiles(raw);

        if (files.length === 0) {
            setErrorMsg('Tidak ada file pada receipt_file. Pastikan field sudah diisi sebelum menganalisa.');
            return;
        }

        setIsLoading(true);

        try {
            const base64Images = await Promise.all(files.map(fileToBase64));

            const payload = {
                variables: {
                    image_list: base64Images,
                },
                parameters: {
                    images: 'image_list',
                },
            };

            const apiUrl = `${apiBase}/api/v1/integration/addons/javan-addon/${addonId}/api/analyze_images`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${alurkerjaParams?.token || ''}`,
                    'Content-Type': 'application/json',
                    'x-active-tenant': 'production',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || `HTTP error ${response.status}`);
            }

            setResult(data);

            // Extract fields from result and set to form
            try {
                const rawResult = data?.data?.data?.result;
                // Safety net: strip markdown code fences (```json ... ```)
                // in case the backend didn't already strip them.
                const resultStr = typeof rawResult === 'string'
                    ? rawResult.trim().replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
                    : rawResult;
                if (resultStr) {
                    const parsed = JSON.parse(resultStr);
                    if (parsed?.total !== undefined) {
                        form.setValue('total', parsed.total);
                        setExtractedTotal(parsed.total);
                    }
                    if (parsed?.purpose !== undefined && parsed.purpose !== null && parsed.purpose !== '') {
                        form.setValue('reimbursement', parsed.purpose);
                        setExtractedPurpose(parsed.purpose);
                    }
                    if (parsed?.transactionDate !== undefined && parsed.transactionDate !== null && parsed.transactionDate !== '') {
                        const dateValue = parseDDMMYYYY(String(parsed.transactionDate));
                        if (dateValue) {
                            form.setValue('transactionDate', dateValue);
                            setExtractedDate(parsed.transactionDate);
                        }
                    }
                    if (parsed?.description !== undefined && parsed.description !== null && parsed.description !== '') {
                        form.setValue('description', parsed.description);
                        setExtractedDescription(parsed.description);
                    }
                }
            } catch {
                // result bukan valid JSON, skip
            }
        } catch (err: any) {
            setErrorMsg(err?.message || 'Terjadi kesalahan saat menganalisa gambar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setErrorMsg(null);
        setExtractedTotal(null);
        setExtractedPurpose(null);
        setExtractedDate(null);
        setExtractedDescription(null);
    };

    // Untuk tampilan info file yang sudah dipilih di form
    const previewFiles = normalizeFiles(form.getValues('receipt_file'));

    return (
        <div className="space-y-4">

            <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm"
            >
                {isLoading ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Menganalisa...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.5 3.5 0 0114.5 20.5h-5a3.5 3.5 0 01-2.469-1.025l-.347-.347z" />
                        </svg>
                        Analisa Nota
                    </>
                )}
            </button>

            {/* ── Total extracted ────────────────────────────────────────── */}
            {(extractedTotal !== null || extractedPurpose !== null || extractedDate !== null || extractedDescription !== null) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-semibold text-blue-700">Field berikut telah diisi otomatis:</p>
                    </div>
                    <ul className="text-xs text-blue-700 list-disc list-inside space-y-0.5 pl-1">
                        {extractedTotal !== null && (
                            <li><span className="font-semibold">total</span>: Rp {extractedTotal.toLocaleString('id-ID')}</li>
                        )}
                        {extractedPurpose !== null && (
                            <li><span className="font-semibold">purpose</span>: {extractedPurpose}</li>
                        )}
                        {extractedDate !== null && (
                            <li><span className="font-semibold">transaction_date</span>: {extractedDate}</li>
                        )}
                        {extractedDescription !== null && (
                            <li><span className="font-semibold">description</span>: {extractedDescription}</li>
                        )}
                    </ul>
                </div>
            )}

            {/* ── Error ──────────────────────────────────────────────────── */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-red-700">Gagal menganalisa</p>
                            <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                        Coba lagi
                    </button>
                </div>
            )}

            {/* ── Result ─────────────────────────────────────────────────── */}
            {result && result.status === 'success' && result.data && (
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold text-green-700">
                                Berhasil menganalisa {result.data.images_count} gambar
                            </p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-600">Hasil Analisa</span>
                            <span className="ml-auto text-xs text-gray-400 font-mono">{result.data.model}</span>
                        </div>
                        <div className="p-3 bg-white">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {result.data.result}
                            </pre>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full px-4 py-2.5 border border-amber-400 text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                        Analisa Ulang
                    </button>
                </div>
            )}

            {result && result.status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-700">Error dari server</p>
                    <p className="text-xs text-red-600 mt-1">{result.message}</p>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                        Coba lagi
                    </button>
                </div>
            )}
        </div>
    );
}
