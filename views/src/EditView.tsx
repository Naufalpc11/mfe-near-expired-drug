import React from "react";
import { AlurkerjaMfeProps } from "./type/AlurkerjaType";

export default function EditView({ form }: AlurkerjaMfeProps) {
    return (
        <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Data</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                    Fitur Edit Data untuk mengubah konfigurasi endpoint yang sudah ada.
                </p>
                <p className="text-sm text-amber-600 mt-2">
                    Form edit dan opsi konfigurasi akan ditampilkan di sini.
                </p>
            </div>
        </div>
    );
}
