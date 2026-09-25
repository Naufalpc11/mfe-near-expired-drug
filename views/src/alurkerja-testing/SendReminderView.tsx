import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "alurkerja-ui";
import { AlurkerjaMfeProps } from "./type/AlurkerjaType";

export default function SendReminderView({ form }: AlurkerjaMfeProps) {
    const { control } = form;

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    📱 Telegram Lunch Reminder
                </h3>
                <p className="text-sm text-blue-700">
                    Kirim reminder melalui Telegram kepada user yang belum memesan makan siang hari ini.
                </p>
            </div>

            <div className="space-y-4">
                {/* Message Template */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Template Pesan
                    </label>
                    <Controller
                        name="message_template"
                        control={control}
                        defaultValue="Halo {email}, aku lihat kamu belum pesan makan siang untuk hari ini. Apakah Kamu mau pesan makan siang untuk hari ini?"
                        render={({ field }) => (
                            <textarea
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="Masukkan template pesan reminder..."
                                {...field}
                            />
                        )}
                    />
                    <p className="text-xs text-gray-500">
                        Pesan yang akan dikirim ke user yang belum order makan siang
                    </p>
                </div>



                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                        ℹ️ Informasi Penting
                    </h4>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                        <li>Script akan mengecek data lunch_data untuk hari ini</li>
                        <li>User yang sudah order tidak akan menerima reminder</li>
                        <li>Pastikan bot token dan konfigurasi database sudah diatur</li>
                        <li>Pesan akan langsung dikirim ke Telegram user</li>
                    </ul>
                </div>

                {/* Configuration Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        ⚙️ Konfigurasi Required
                    </h4>
                    <div className="text-xs text-gray-700 space-y-1">
                        <p><strong>Database:</strong> db_name, db_user, db_password</p>
                        <p><strong>Telegram:</strong> bot_token</p>
                        <p><strong>Tables:</strong> lunch_data, telegram_account</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Konfigurasi ini diatur di level addon configuration
                    </p>
                </div>
            </div>
        </div>
    );
}
