import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps, AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function IzinFormGanti({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue , watch ,  control} = form;
    const { token } = alurkerjaParams;

    // Watch values for calculations
    const tanggalMulai = watch('tanggalMulaiGantiJam');
    const tanggalSelesai = watch('tanggalSelesaiGantiJam');
    const durasiJam = watch('gantiJam') || 0;

    // Calculate duration
    useEffect(() => {
        if (tanggalMulai && tanggalSelesai) {
            const start = new Date(tanggalMulai);
            const end = new Date(tanggalSelesai);

            const diffTime = Math.abs(end.getTime() - start.getTime());
            let diffHours = diffTime / (1000 * 60 * 60); // Convert to hours


            diffHours = Math.max(0, diffHours);

            setValue('gantiJam', Math.round(diffHours * 10) / 10); // Round to 1 decimal
        } else {
            setValue('gantiJam', 0);
        }
    }, [tanggalMulai, tanggalSelesai, setValue]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tanggal Mulai dan Selesai */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', marginBottom: '0.25rem' }}>
                        Tanggal Mulai Ganti Jam <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Controller
                        name="tanggalMulaiGantiJam"
                        control={control}
                        rules={{ required: 'Tanggal mulai wajib diisi' }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input
                                    type="datetime-local"
                                    style={{ fontSize: '16px', width: '100%' }}
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', marginBottom: '0.25rem' }}>
                        Tanggal Selesai Ganti Jam <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Controller
                        name="tanggalSelesaiGantiJam"
                        control={control}
                        rules={{ required: 'Tanggal selesai wajib diisi' }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input
                                    type="datetime-local"
                                    style={{ fontSize: '16px', width: '100%' }}
                                    min={tanggalMulai}
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Durasi Izin (Read-only) - Full Width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', marginBottom: '0.25rem' }}>Jumlah Ganti Jam</label>
                <Controller
                    name="gantiJam"
                    control={control}
                    render={({ field }) => (
                        <div>
                            <Input
                                type="number"
                                style={{ fontSize: '16px', width: '100%', backgroundColor: '#f9fafb' }}
                                disabled
                                {...field}
                                value={field.value || 0}
                            />
                        </div>
                    )}
                />
            </div>

            {/* Warning when duration is 0 */}
            {durasiJam === 0 && (tanggalMulai || tanggalSelesai) && (
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
                        <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#92400e', margin: 0 }}>
                            ⚠️ Tidak dapat melakukan ganti jam
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#78350f', margin: '0.25rem 0 0 0' }}>
                            Silakan pilih tanggal dan waktu mulai serta tanggal dan waktu selesai yang valid. Tanggal selesai harus setelah tanggal mulai.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

