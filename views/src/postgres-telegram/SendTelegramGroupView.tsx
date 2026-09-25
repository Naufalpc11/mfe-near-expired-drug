import React from 'react';
import { Controller } from 'react-hook-form';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function SendTelegramGroupView({ form }: AlurkerjaMfeProps) {
  const { control } = form;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 ">
        <h3 className="text-2xl font-bold mb-2">👥 Send Telegram Group Message</h3>
        <p className="text-green-100">
          Kirim pesan Telegram ke group chat berdasarkan nama group. Chat ID
          dicari otomatis dari tabel{' '}
          <code className="bg-green-700 px-1.5 py-0.5 rounded text-xs font-mono">
            vanya_group_chat
          </code>{' '}
          menggunakan nama group yang diberikan.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Group Name Key */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Group Name Variable Key
          </label>
          <Controller
            name="group_name"
            control={control}
            defaultValue="group_name"
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="group_name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 font-mono text-sm ${
                    error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
                  }`}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{error.message}</span>
                  </p>
                )}
              </div>
            )}
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span>💡</span>
            <span>
              Key dari variable yang berisi nama group. Default:{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                group_name
              </code>{' '}
              — mengambil dari{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                variables.group_name
              </code>
            </span>
          </p>
        </div>

        {/* Message Template */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message Template <span className="text-red-500">*</span>
          </label>
          <Controller
            name="message"
            control={control}
            rules={{ required: 'Message is required' }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <textarea
                  {...field}
                  placeholder={`Enter your message template. Use \${variableName} for placeholders.\n\nExample:\n📢 Notifikasi dari \${senderName}!\n\nOrder <b>\${orderNumber}</b> berstatus: <b>\${status}</b>.\n\nMohon segera ditindaklanjuti.`}
                  rows={10}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 font-mono text-sm ${
                    error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
                  }`}
                  style={{ resize: 'vertical', minHeight: '200px' }}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{error.message}</span>
                  </p>
                )}
              </div>
            )}
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span>💡</span>
            <span>
              Gunakan{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                ${`{variableName}`}
              </code>{' '}
              untuk placeholder. Mendukung HTML tags seperti{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                &lt;b&gt;
              </code>
              ,{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                &lt;i&gt;
              </code>
              ,{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                &lt;code&gt;
              </code>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
