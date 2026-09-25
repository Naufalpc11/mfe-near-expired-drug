import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps, AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function AssignmentDateFormView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue , watch ,  control} = form;
    const { token } = alurkerjaParams;

    const startDate = watch('startDate');
    const endDate = watch('endDate');

    React.useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diffMs = end.getTime() - start.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                setValue('totalJam', diffHours > 0 ? diffHours.toFixed(2) : '0');
            }
        }
    }, [startDate, endDate, setValue]);

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Waktu Pelaksanaan</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Tanggal Mulai Pelaksanaan
                </label>
                <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: "Tanggal mulai wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                className={`text-sm ${error ? 'border-red-500' : ''}`}
                                type="datetime-local"
                                {...field}
                            />
                            {error && <span className="text-xs text-red-500">{error.message}</span>}
                        </>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Tanggal Selesai Pelaksanaan
                </label>
                <Controller
                    name="endDate"
                    control={control}
                    rules={{
                        required: "Tanggal selesai wajib diisi",
                        validate: (value) => {
                            const startDate = form.getValues('startDate');
                            if (startDate && new Date(value) < new Date(startDate)) {
                                return "Tanggal selesai tidak boleh sebelum tanggal mulai";
                            }
                            return true;
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                className={`text-sm ${error ? 'border-red-500' : ''}`}
                                type="datetime-local"
                                {...field}
                            />
                            {error && <span className="text-xs text-red-500">{error.message}</span>}
                        </>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Total Jam
                </label>
                <Controller
                    name="totalJam"
                    control={control}
                    render={({ field }) => (
                        <Input
                            className="text-sm bg-gray-100"
                            type="text"
                            readOnly
                            placeholder="Akan muncul setelah mengisi tanggal"
                            {...field}
                        />
                    )}
                />
            </div>
        </div>
    );
}
