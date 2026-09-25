import React from "react";
import { AlurkerjaMfeProps } from "./type/AlurkerjaType";

export default function GetDataView({ form }: AlurkerjaMfeProps) {
    return (
        <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Data</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">
                    Fitur Get Data untuk mengambil data dari endpoint API.
                </p>
                <p className="text-sm text-purple-600 mt-2">
                    Interface untuk mengambil dan menampilkan data dari API akan ditampilkan di sini.
                </p>
            </div>
        </div>
    );
}
