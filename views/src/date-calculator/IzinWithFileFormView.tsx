import React, { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps, AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function IzinWithFileFormView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue , watch ,  control} = form;
    const { token } = alurkerjaParams;

    const [fileError, setFileError] = useState<string>('');

    // Watch values for calculations
    const tanggalMulai = watch('tanggalMulai');
    const tanggalSelesai = watch('tanggalSelesai');
    const pilihJam = watch('pilihJam') || false;
    const jamMulai = watch('jamMulai');
    const jamSelesai = watch('jamSelesai');
    const uploadedFile = watch('uploadedFile');
    const durasiJam = watch('durasiJam') || 0;
    const durasiHari = watch('durasiHari') || 0;

    // Calculate minimum date allowed
    const getMinDate = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // If current time is after 16:30, start from tomorrow
        if (currentHour >= 17 || (currentHour === 16 && currentMinute >= 30)) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        // Otherwise, start from today
        return now.toISOString().split('T')[0];
    };

    const minDate = getMinDate();

    // Generate time options (08:00 - 17:00, every 30 minutes)
    // useMemo to recalculate when tanggalMulai changes
    const jamMulaiOptions = useMemo(() => {
        const generateTimeOptions = () => {
            const times: string[] = [];
            let currentHour: number;
            let currentMinute: number;

            // Check if selected date is today
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let isToday = false;
            if (tanggalMulai) {
                const selectedDate = new Date(tanggalMulai);
                // Compare only year, month, and day
                isToday = selectedDate.getFullYear() === today.getFullYear() &&
                         selectedDate.getMonth() === today.getMonth() &&
                         selectedDate.getDate() === today.getDate();
            }

            if (isToday) {
                // Start from current time rounded to next 30-minute interval
                const nowHour = now.getHours();
                const nowMinute = now.getMinutes();

                // Round up to next 30-minute interval
                if (nowMinute <= 30) {
                    currentHour = nowHour;
                    currentMinute = 30;
                } else {
                    currentHour = nowHour + 1;
                    currentMinute = 0;
                }

                // If current time is after 17:00 or before 08:00, start from 08:00
                if (currentHour < 8 || currentHour > 17) {
                    currentHour = 8;
                    currentMinute = 0;
                }
            } else {
                // For other dates (past or future), start from 08:00
                currentHour = 8;
                currentMinute = 0;
            }

            while (currentHour <= 17) {
                if (currentHour === 17 && currentMinute > 0) break;
                if (currentHour === 12) {
                    currentHour += 1;
                    continue;
                }
                times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
                currentMinute += 30;
                if (currentMinute >= 60) {
                    currentMinute = 0;
                    currentHour += 1;
                }
            }
            return times;
        };
        return generateTimeOptions();
    }, [tanggalMulai]); // Re-calculate when tanggalMulai changes

    // Generate jam selesai options based on jam mulai
    const jamSelesaiOptions = useMemo(() => {
        if (!jamMulai) return [];

        const times: string[] = [];
        const startHour = parseInt(jamMulai.split(':')[0]);
        const startMinute = parseInt(jamMulai.split(':')[1]);

        let currentHour = startHour;
        let currentMinute = startMinute === 0 ? 30 : 0;

        if (currentMinute === 0) {
            currentHour += 1;
        }

        while (currentHour <= 17) {
            if (currentHour === 17 && currentMinute > 0) break;
            if (currentHour === 12) {
                currentHour += 1;
                continue;
            }
            times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
            currentMinute += 30;
            if (currentMinute >= 60) {
                currentMinute = 0;
                currentHour += 1;
            }
        }
        return times;
    }, [jamMulai]); // Re-calculate when jamMulai changes

    // Reset jamMulai if current selection is not available in new options
    useEffect(() => {
        if (pilihJam && jamMulai && !jamMulaiOptions.includes(jamMulai)) {
            setValue('jamMulai', '');
            setValue('jamSelesai', '');
        }
    }, [tanggalMulai, jamMulaiOptions, jamMulai, pilihJam, setValue]);

    // Reset jamSelesai if current selection is not available in new options
    useEffect(() => {
        if (pilihJam && jamSelesai && !jamSelesaiOptions.includes(jamSelesai)) {
            setValue('jamSelesai', '');
        }
    }, [jamMulai, jamSelesaiOptions, jamSelesai, pilihJam, setValue]);

    // Calculate duration
    useEffect(() => {
        if (!pilihJam) {
            // Calculate based on dates
            if (tanggalMulai && tanggalSelesai) {
                const start = new Date(tanggalMulai);
                const end = new Date(tanggalSelesai);

                // Set time to start of day for accurate day calculation
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
                const diffHours = diffDays * 8; // Assuming 8 working hours per day

                setValue('durasiJam', diffHours);
                setValue('durasiHari', diffDays);
            } else {
                setValue('durasiJam', 0);
                setValue('durasiHari', 0);
            }
        } else {
            // Calculate based on time
            if (jamMulai && jamSelesai && tanggalMulai && tanggalSelesai) {
                const start = new Date(tanggalMulai);
                const end = new Date(tanggalSelesai);

                const [startHour, startMin] = jamMulai.split(':').map(Number);
                const [endHour, endMin] = jamSelesai.split(':').map(Number);

                let breakTime = 1;
                if (startHour > 12) {
                    breakTime = 0;
                }

                start.setHours(startHour, startMin, 0, 0);
                end.setHours(endHour, endMin, 0, 0);

                const diffTime = Math.abs(end.getTime() - start.getTime());
                let diffHours = diffTime / (1000 * 60 * 60); // Convert to hours

                // Subtract 1 hour for lunch break (istirahat)
                diffHours = Math.max(0, diffHours - breakTime);

                setValue('durasiJam', Math.round(diffHours * 10) / 10); // Round to 1 decimal
                setValue('durasiHari', 0);
            } else {
                setValue('durasiJam', 0);
                setValue('durasiHari', 0);
            }
        }
    }, [tanggalMulai, tanggalSelesai, pilihJam, jamMulai, jamSelesai, setValue]);

    // Reset jam fields when switch changes and auto-set tanggalSelesai
    useEffect(() => {
        if (!pilihJam) {
            setValue('jamMulai', '');
            setValue('jamSelesai', '');
        } else {
            // When Pilih Jam = Ya, set tanggalSelesai = tanggalMulai
            if (tanggalMulai) {
                setValue('tanggalSelesai', tanggalMulai);
            }
        }
    }, [pilihJam, tanggalMulai, setValue]);

    // File validation function
    const validateFile = (file: File): string | null => {
        // Allowed file types
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];

        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.doc', '.docx'];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            // Check by extension if MIME type check fails
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            if (!allowedExtensions.includes(fileExtension)) {
                return 'Tipe file tidak valid. Hanya file PDF, gambar (JPG, PNG, GIF, WEBP), dan dokumen Word (DOC, DOCX) yang diperbolehkan.';
            }
        }

        // Check file size (max 1MB)
        const maxSize = 1 * 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
            return 'Ukuran file terlalu besar. Maksimal 1MB.';
        }

        return null;
    };

    // Convert file to base64
    const fileToBase64 = (file: File) =>
        new Promise<string | ArrayBuffer | null>((resolve, reject) => {

            // check iff file is blob
            if (!(file instanceof Blob)) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });


    // Handle file change
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setFileError('');
            setValue('uploadedFile', null);
            return;
        }

        const error = validateFile(file);
        if (error) {
            setFileError(error);
            event.target.value = ''; // Reset input
            setValue('uploadedFile', null);
        } else {
            try {
                // Convert file to base64
                const base64String = await fileToBase64(file);

                // Ensure we have a valid string result
                if (!base64String || typeof base64String !== 'string') {
                    throw new Error('Failed to convert file to base64');
                }

                // Store base64 string with file metadata
                const fileData = {
                    value: base64String.split('base64,')[1] || base64String,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };

                setFileError('');
                setValue('uploadedFile', fileData);
            } catch (error) {
                setFileError('Gagal membaca file. Silakan coba lagi.');
                event.target.value = '';
                setValue('uploadedFile', null);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tanggal Mulai dan Selesai */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        Tanggal Mulai Izin <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Controller
                        name="tanggalMulai"
                        control={control}
                        rules={{ required: 'Tanggal mulai wajib diisi' }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input
                                    type="date"
                                    style={{ fontSize: '0.875rem', width: '100%' }}
                                    min={minDate}
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* Hide Tanggal Selesai when Pilih Jam = Ya */}
                {!pilihJam && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                            Tanggal Selesai Izin <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <Controller
                            name="tanggalSelesai"
                            control={control}
                            rules={{ required: !pilihJam ? 'Tanggal selesai wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <Input
                                        type="date"
                                        style={{ fontSize: '0.875rem', width: '100%' }}
                                        min={tanggalMulai || minDate}
                                        {...field}
                                    />
                                    {fieldState.error && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Switch Pilih Jam */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Pilih Jam</label>
                <Controller
                    name="pilihJam"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                style={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    height: '1.5rem',
                                    width: '2.75rem',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    transition: 'background-color 0.2s',
                                    outline: 'none',
                                    backgroundColor: field.value ? '#2563eb' : '#d1d5db',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        height: '1rem',
                                        width: '1rem',
                                        transform: field.value ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                                        borderRadius: '9999px',
                                        backgroundColor: 'white',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                            </button>
                            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                                {field.value ? 'Ya' : 'Tidak'}
                            </span>
                        </div>
                    )}
                />
            </div>

            {/* Jam Mulai dan Selesai - Only show when pilihJam is true */}
            {pilihJam && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                            Jam Mulai Izin <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <Controller
                            name="jamMulai"
                            control={control}
                            rules={{ required: pilihJam ? 'Jam mulai wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <select
                                        key={`jam-mulai-${jamMulaiOptions.length}-${jamMulaiOptions[0] || 'empty'}`}
                                        style={{
                                            fontSize: '0.875rem',
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            outline: 'none'
                                        }}
                                        {...field}
                                    >
                                        <option value="">Pilih jam mulai</option>
                                        {jamMulaiOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldState.error && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                            Jam Selesai Izin <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <Controller
                            name="jamSelesai"
                            control={control}
                            rules={{ required: pilihJam ? 'Jam selesai wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <select
                                        key={`jam-selesai-${jamSelesaiOptions.length}-${jamSelesaiOptions[0] || 'empty'}`}
                                        style={{
                                            fontSize: '0.875rem',
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            outline: 'none'
                                        }}
                                        {...field}
                                        disabled={!jamMulai}
                                    >
                                        <option value="">Pilih jam selesai</option>
                                        {jamSelesaiOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldState.error && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Durasi Izin (Read-only) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Durasi Izin (Jam)</label>
                    <Controller
                        name="durasiJam"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <Input
                                    type="number"
                                    style={{ fontSize: '0.875rem', width: '100%', backgroundColor: '#f9fafb' }}
                                    disabled
                                    {...field}
                                    value={field.value || 0}
                                />
                                {pilihJam && (
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        * Sudah dikurangi 1 jam istirahat
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Durasi Izin (Hari)</label>
                    <Controller
                        name="durasiHari"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                style={{ fontSize: '0.875rem', width: '100%', backgroundColor: '#f9fafb' }}
                                disabled
                                {...field}
                                value={field.value || 0}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Warning when duration is 0 */}
            {durasiJam === 0 && durasiHari === 0 && (tanggalMulai || tanggalSelesai || jamMulai || jamSelesai) && (
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <svg
                        style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b', flexShrink: 0 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', margin: 0 }}>
                            Peringatan: Durasi izin tidak valid
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#78350f', margin: '0.25rem 0 0 0' }}>
                            {!pilihJam
                                ? 'Silakan pilih tanggal mulai dan tanggal selesai yang valid. Tanggal selesai harus sama atau setelah tanggal mulai.'
                                : 'Silakan pilih jam mulai dan jam selesai yang valid. Jam selesai harus setelah jam mulai.'}
                        </p>
                    </div>
                </div>
            )}

            {/* File Upload */}
            <div className="flex flex-col">
                <label className="mr-1 font-medium after:content-['*'] after:text-red-400 after:text-sm">
                    Upload Dokumen Pendukung
                </label>
                <span className="text-sm text-gray-600 my-2">Max File size 1 MB</span>
                <Controller
                    name="uploadedFile"
                    control={control}
                    rules={{
                        required: 'File dokumen wajib diupload',
                        validate: (value) => {
                            if (!value) return 'File dokumen wajib diupload';
                            // Check if it's our file data object with base64
                            if (value && typeof value === 'object' && 'base64' in value && 'name' in value) {
                                return true;
                            }
                            return 'File tidak valid';
                        }
                    }}
                    render={({ fieldState }) => (
                        <div className="flex flex-col w-full gap-4">
                            <div
                                className="alurkerja-form w-full flex flex-col justify-center items-center cursor-pointer rounded border-2 border-gray-200 border-dashed"
                                onClick={() => document.getElementById('file-upload-input')?.click()}
                            >
                                <input
                                    id="file-upload-input"
                                    type="file"
                                    accept="image/jpeg,.jpg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    tabIndex={-1}
                                />
                                <div className="flex flex-col items-center justify-center gap-2 pt-5 pb-6">
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 512 512"
                                        height="2em"
                                        width="2em"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="text-gray-400"
                                    >
                                        <path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Klik untuk mengunggah, atau drag file</span>
                                    </p>
                                </div>
                            </div>

                            {uploadedFile && typeof uploadedFile === 'object' && 'name' in uploadedFile && (
                                <div className="text-gray-600 border-2 border-b-0 border-gray-200 rounded">
                                    <div className="flex items-center justify-between p-2 border-b-2">
                                        <div className="flex items-center gap-x-2">
                                            <svg
                                                stroke="currentColor"
                                                fill="currentColor"
                                                strokeWidth="0"
                                                viewBox="0 0 384 512"
                                                height="1em"
                                                width="1em"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M384 121.941V128H256V0h6.059a24 24 0 0 1 16.97 7.029l97.941 97.941a24.002 24.002 0 0 1 7.03 16.971zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zm-135.455 16c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.491-48 48-48zm208 240h-256l.485-48.485L104.545 328c4.686-4.686 11.799-4.201 16.485.485L160.545 368 264.06 264.485c4.686-4.686 12.284-4.686 16.971 0L320.545 304v112z"></path>
                                            </svg>
                                            <span>{uploadedFile.name}</span>
                                        </div>
                                        <div className="flex items-center gap-x-2">
                                            <span>{(uploadedFile.size / 1024).toFixed(2)} KB</span>
                                            <div className="cursor-pointer">
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    strokeWidth="0"
                                                    viewBox="0 0 24 24"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path>
                                                </svg>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setValue('uploadedFile', null);
                                                    setFileError('');
                                                    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                            >
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    strokeWidth="0"
                                                    viewBox="0 0 448 512"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(fieldState.error || fileError) && (
                                <p className="text-xs text-red-500 mt-2">
                                    {fieldState.error?.message || fileError}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

