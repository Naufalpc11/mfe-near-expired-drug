import React from "react";
import { AlurkerjaMfeProps } from "./type/AlurkerjaType";

export default function PostDataView({ form }: AlurkerjaMfeProps) {
    return (
        <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Post Data</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                    Fitur Post Data untuk mengirim data ke endpoint API.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                    Form dan konfigurasi akan ditampilkan di sini.
                </p>
            </div>
        </div>
    );
}
