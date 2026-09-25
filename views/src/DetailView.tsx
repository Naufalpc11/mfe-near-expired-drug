import React from "react";
import { AlurkerjaMfeProps } from "./type/AlurkerjaType";

export default function DetailView({ form }: AlurkerjaMfeProps) {
    return (
        <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail View</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                    Detail view untuk melihat informasi lengkap tentang endpoint API.
                </p>
                <p className="text-sm text-green-600 mt-2">
                    Informasi detail endpoint, parameter, dan response akan ditampilkan di sini.
                </p>
            </div>
        </div>
    );
}
