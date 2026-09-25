import { Controller, useFieldArray } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import React from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function CreateView({ form }: AlurkerjaMfeProps) {
    const { control } = form;
    const variablesField = useFieldArray({ control, name: 'value.variables' });

    const renderKeyValueFields = (fields: any, append: any, remove: any) => (
        <div className="space-y-3">
            {fields.map((item: any, index: number) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                    <Controller
                        name={`value.variables.${index}.key`}
                        control={control}
                        render={({ field }) => <Input className="text-sm" placeholder="Key" {...field} />}
                    />
                    <Controller
                        name={`value.variables.${index}.value`}
                        control={control}
                        render={({ field }) => <Input className="text-sm" placeholder="Value" {...field} />}
                    />
                    {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 transition">
                            <X size={16} />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={() => append({ key: '', value: '' })}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/90 mt-2"
            >
                <Plus size={14} /> Add Variable
            </button>
        </div>
    );

    useEffect(() => {
        if (variablesField.fields.length === 0) variablesField.append({ key: '', value: '' });
    }, []);

    return (
        <div className="space-y-4">
            <div className="col-span-1 space-y-2">
                <label className="block text-sm mb-1">Nama File</label>
                <Controller
                    name="value.fileName"
                    control={control}
                    render={({ field }) => (
                        <Input className="text-sm" placeholder="Masukkan nama file" {...field} />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm mb-1">Variables</label>
                {renderKeyValueFields(variablesField.fields, variablesField.append, variablesField.remove)}
            </div>
        </div>
    );
}
