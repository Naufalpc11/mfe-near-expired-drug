import { Controller } from 'react-hook-form';
import { Input, Button } from 'alurkerja-ui';
import React from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function VendorPaymentView({ form }: AlurkerjaMfeProps) {
    const { control } = form;

    return (
        <div className="flex flex-col gap-3">
            {/* Nama Vendor */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Nama Vendor *
                </label>
                <Controller
                    name="vendor_name"
                    control={control}
                    rules={{ required: "Nama vendor wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                placeholder="Masukkan nama vendor"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Amount (Harga) *
                </label>
                <Controller
                    name="amount"
                    control={control}
                    rules={{
                        required: "Amount wajib diisi",
                        pattern: {
                            value: /^\d+(\.\d{1,2})?$/,
                            message: "Masukkan format angka yang valid (contoh: 1000.50)"
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    style={{
                                        paddingLeft: "10px"
                                    }}
                                >
                                    Rp
                                </span>
                                <Input
                                    style={{
                                        paddingLeft: "40px"
                                    }}
                                    className="text-sm w-full pl-10"
                                    placeholder="0.00"
                                    {...field}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Barang/Jasa */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Barang/Jasa *
                </label>
                <Controller
                    name="goods_services"
                    control={control}
                    rules={{ required: "Deskripsi barang/jasa wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                placeholder="Masukkan barang atau jasa yang diberikan vendor"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Tanggal *
                </label>
                <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Tanggal wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                            <span className='text-sm'>Date Format dd/mm/yyyy</span>
                        </div>
                    )}
                />
            </div>

            {/* Memo */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Memo
                </label>
                <Controller
                    name="memo"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="Catatan tambahan (opsional)"
                            {...field}
                        />
                    )}
                />
            </div>

            {/* Nomor Rekening */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Nomor Rekening *
                </label>
                <Controller
                    name="account_number"
                    control={control}
                    rules={{
                        required: "Nomor rekening wajib diisi",
                        pattern: {
                            value: /^\d+$/,
                            message: "Nomor rekening hanya boleh berisi angka"
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                placeholder="1234567890"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}