import React from 'react';
import { Controller } from 'react-hook-form';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';

// Static vendor list data
const VENDOR_OPTIONS = [
    { value: '', label: 'Pilih Vendor' },
    { value: 'vendor_001', label: 'PT. Teknologi Nusantara' },
    { value: 'vendor_002', label: 'CV. Mitra Sejahtera' },
    { value: 'vendor_003', label: 'PT. Global Solutions' },
    { value: 'vendor_004', label: 'CV. Inovasi Digital' },
    { value: 'vendor_005', label: 'PT. Prima Karya' },
    { value: 'vendor_006', label: 'CV. Berkah Jaya' },
    { value: 'vendor_007', label: 'PT. Mandiri Teknologi' },
    { value: 'vendor_008', label: 'CV. Sukses Bersama' },
    { value: 'vendor_009', label: 'PT. Harmoni Digital' },
    { value: 'vendor_010', label: 'CV. Cerdas Solusi' },
];

interface VendorListViewProps {
    props: AlurkerjaMfeInputProps;
}

const VendorListView: React.FC<AlurkerjaMfeInputProps> = ({ props }) => {
    const {form ,  item} = props;
    const { control } = form;

    return (
        <div className="flex flex-col gap-3 p-4">

            {/* Vendor Dropdown */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    {item.label?.id || item.label?.en || 'Vendor'} 
                    {item.constraints?.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <Controller
                    name={item.name || 'vendor_selection'}
                    control={control}
                    rules={{ 
                        required: item.constraints?.required ? `${item.label?.id || 'Vendor'} wajib dipilih` : false 
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <select
                                {...field}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                disabled={item.disabled}
                            >
                                {VENDOR_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error.message}</p>
                            )}
                            {item.tooltip?.enable && item.tooltip?.message && (
                                <p className="text-gray-500 text-xs mt-1">{item.tooltip.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

        </div>
    );
};

export default VendorListView;