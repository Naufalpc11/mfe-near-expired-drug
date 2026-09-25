import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps, AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function ParentFormView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue , watch ,  control} = form;
    const { token } = alurkerjaParams;

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Data Orang Tua</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Nama Orang Tua
                </label>
                <Controller
                    name="nama_orangtua"
                    control={control}
                    rules={{ required: "Nama orang tua wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                className={`text-sm ${error ? 'border-red-500' : ''}`}
                                placeholder="Masukkan nama lengkap orang tua"
                                {...field}
                            />
                            {error && <span className="text-xs text-red-500">{error.message}</span>}
                        </>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Alamat Orang Tua
                </label>
                <Controller
                    name="alamat_orangtua"
                    control={control}
                    rules={{ required: "Alamat wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <textarea
                                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                                rows={3}
                                placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Kelurahan, Kecamatan)"
                                {...field}
                            />
                            {error && <span className="text-xs text-red-500">{error.message}</span>}
                        </>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Nomor Telepon
                </label>
                <Controller
                    name="no_telepon_orangtua"
                    control={control}
                    rules={{
                        required: "Nomor telepon wajib diisi",
                        pattern: {
                            value: /^[0-9+\-\s()]*$/,
                            message: "Format nomor telepon tidak valid"
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                className={`text-sm ${error ? 'border-red-500' : ''}`}
                                type="tel"
                                placeholder="Contoh: 081234567890"
                                {...field}
                            />
                            {error && <span className="text-xs text-red-500">{error.message}</span>}
                        </>
                    )}
                />
            </div>
        </div>
    );
}
