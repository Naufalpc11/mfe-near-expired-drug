import { Controller, useFieldArray } from 'react-hook-form';
import { Input, Button } from 'alurkerja-ui';
import React, { useEffect } from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

interface LineItem {
    account_id: number | string;
    name: string;
    debit: number | string;
    credit: number | string;
    balance: number | string;
    partner_id?: number | string;
}

export default function JournalEntryView({ form, alurkerjaParams }: AlurkerjaMfeProps) {
    const { control, watch, setValue } = form;
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: "line_ids"
    });

    // Watch all line items
    const lineItems = watch("line_ids") || [];

    // Load default values from Camunda variables
    useEffect(() => {
        if (alurkerjaParams?.variables) {
            const vars = alurkerjaParams.variables;
            
            // Set form values from Camunda variables
            if (vars.journalId) setValue('journal_id', vars.journalId);
            if (vars.entryDate) setValue('date', vars.entryDate);
            if (vars.reference) setValue('ref', vars.reference);
            if (vars.companyId) setValue('company_id', vars.companyId);
            if (typeof vars.autoPost !== 'undefined') setValue('auto_post', vars.autoPost);
            
            // Set line_ids from Camunda variables
            if (vars.lineItems && Array.isArray(vars.lineItems) && vars.lineItems.length > 0) {
                setValue('line_ids', vars.lineItems);
            }
        }
    }, [alurkerjaParams, setValue]);

    // Calculate totals
    const calculateTotals = () => {
        let totalDebit = 0;
        let totalCredit = 0;
        let totalBalance = 0;
        
        lineItems.forEach((item: LineItem) => {
            totalDebit += parseFloat(String(item.debit || 0));
            totalCredit += parseFloat(String(item.credit || 0));
            totalBalance += parseFloat(String(item.balance || 0));
        });

        return { totalDebit, totalCredit, totalBalance };
    };

    const { totalDebit, totalCredit, totalBalance } = calculateTotals();

    // Initialize with 2 lines: line 1 with debit, line 2 with credit
    useEffect(() => {
        if (fields.length === 0) {
            // Add both lines together
            append([
                { account_id: '', name: '', debit: 0, credit: 0, balance: 0, partner_id: '' },
                { account_id: '', name: '', debit: 0, credit: 0, balance: 0, partner_id: '' }
            ]);
        }
    }, []);
    // Transform string values to numbers for API submission
    useEffect(() => {
        const subscription = watch((formData) => {
            // Only transform when form data exists
            if (formData.journal_id && typeof formData.journal_id === 'string') {
                const numValue = parseFloat(formData.journal_id);
                if (!isNaN(numValue)) {
                    setValue('journal_id', numValue, { shouldValidate: false, shouldDirty: false });
                }
            }
            
            if (formData.company_id && typeof formData.company_id === 'string') {
                const numValue = parseFloat(formData.company_id);
                if (!isNaN(numValue)) {
                    setValue('company_id', numValue, { shouldValidate: false, shouldDirty: false });
                }
            }

            // Transform line_ids numeric fields
            if (formData.line_ids && Array.isArray(formData.line_ids)) {
                formData.line_ids.forEach((item: any, index: number) => {
                    // Transform account_id
                    if (item.account_id && typeof item.account_id === 'string') {
                        const numValue = parseFloat(item.account_id);
                        if (!isNaN(numValue)) {
                            setValue(`line_ids.${index}.account_id`, numValue, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                    
                    // Transform debit
                    if (item.debit !== undefined && typeof item.debit === 'string') {
                        const numValue = parseFloat(item.debit);
                        if (!isNaN(numValue)) {
                            setValue(`line_ids.${index}.debit`, numValue, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                    
                    // Transform credit
                    if (item.credit !== undefined && typeof item.credit === 'string') {
                        const numValue = parseFloat(item.credit);
                        if (!isNaN(numValue)) {
                            setValue(`line_ids.${index}.credit`, numValue, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                    
                    // Transform balance
                    if (item.balance !== undefined && typeof item.balance === 'string') {
                        const numValue = parseFloat(item.balance);
                        if (!isNaN(numValue)) {
                            setValue(`line_ids.${index}.balance`, numValue, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                    
                    // Transform partner_id
                    if (item.partner_id && typeof item.partner_id === 'string') {
                        const numValue = parseFloat(item.partner_id);
                        if (!isNaN(numValue)) {
                            setValue(`line_ids.${index}.partner_id`, numValue, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                });
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, setValue]);
    // Auto-calculate balance based on line position
    useEffect(() => {
        if (lineItems.length === 0) return;
        
        lineItems.forEach((item: LineItem, index: number) => {
            const debit = parseFloat(String(item.debit || 0));
            const credit = parseFloat(String(item.credit || 0));
            
            // First line: balance = -1 * debit
            // All other lines: balance = -1 * credit
            const calculatedBalance = index === 0 ? -1 * debit : -1 * credit;
            
            // Only update if balance is different (avoid infinite loop)
            const currentBalance = parseFloat(String(item.balance || 0));
            if (Math.abs(currentBalance - calculatedBalance) > 0.001) {
                setValue(`line_ids.${index}.balance`, calculatedBalance);
            }
        });
    }, [lineItems.map(item => `${item.debit}-${item.credit}`).join('|')]);

    const removeLine = (index: number) => {
        if (fields.length > 2) {
            remove(index);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Journal ID */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Journal ID *
                </label>
                <Controller
                    name="journal_id"
                    control={control}
                    rules={{ 
                        required: "Journal ID wajib diisi"
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                placeholder="13"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Gunakan fetch_odoo_journals untuk mendapatkan ID</p>
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
                                placeholder="2024-01-15"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD, DD/MM/YYYY, atau DD-MM-YYYY</p>
                        </div>
                    )}
                />
            </div>

            {/* Reference */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Reference/Memo *
                </label>
                <Controller
                    name="ref"
                    control={control}
                    rules={{ required: "Reference wajib diisi" }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <Input
                                className="text-sm w-full"
                                placeholder="Journal Entry - Payment Example"
                                {...field}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Company ID */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    Company ID
                </label>
                <Controller
                    name="company_id"
                    control={control}
                    defaultValue={1}
                    render={({ field }) => (
                        <Input
                            className="text-sm w-full"
                            placeholder="1"
                            {...field}
                        />
                    )}
                />
            </div>

            {/* Auto Post */}
            <div className="flex items-center gap-2">
                <Controller
                    name="auto_post"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm text-gray-700">
                                Auto Post Entry (uncheck untuk save as draft)
                            </label>
                        </div>
                    )}
                />
            </div>

            {/* Line Items Section */}
            <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">Journal Items *</h3>
                </div>

                {/* Balance Summary */}
                <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Total Debit:</span>
                            <span className="ml-2">Rp {totalDebit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                            <span className="font-medium">Total Credit:</span>
                            <span className="ml-2">Rp {totalCredit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="flex flex-col gap-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border border-gray-300 rounded-md bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700">
                                    Line {index + 1}: {index === 0 ? 'Debit' : 'Credit'}
                                </h4>
                                {fields.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLine(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Account ID */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">Account ID *</label>
                                    <Controller
                                        name={`line_ids.${index}.account_id`}
                                        control={control}
                                        rules={{ 
                                            required: "Account ID wajib diisi"
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <Input
                                                    className="text-sm w-full"
                                                    placeholder="57"
                                                    {...field}
                                                />
                                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Name/Description */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">Description</label>
                                    <Controller
                                        name={`line_ids.${index}.name`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                className="text-sm w-full"
                                                placeholder="Description"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Debit */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">Debit *</label>
                                    <Controller
                                        name={`line_ids.${index}.debit`}
                                        control={control}
                                        rules={{
                                            required: "Debit wajib diisi"
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <Input
                                                    className="text-sm w-full"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Credit */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">Credit *</label>
                                    <Controller
                                        name={`line_ids.${index}.credit`}
                                        control={control}
                                        rules={{
                                            required: "Credit wajib diisi"
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <Input
                                                    className="text-sm w-full"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Partner ID (Optional) */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">Partner ID (Optional)</label>
                                    <Controller
                                        name={`line_ids.${index}.partner_id`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                className="text-sm w-full"
                                                placeholder="10"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="text-xs text-gray-500 space-y-1">
                    <p>• Minimal 2 line items diperlukan</p>
                    <p>• Gunakan fetch_odoo_account untuk mendapatkan Account ID yang valid</p>
                </div>
            </div>
        </div>
    );
}
