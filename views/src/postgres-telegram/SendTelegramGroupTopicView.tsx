import React from 'react';
import { Controller } from 'react-hook-form';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function SendTelegramGroupTopicView({ form }: AlurkerjaMfeProps) {
  const { control } = form;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-2">🗂️ Send Telegram Group Topic Message</h3>
        <p className="text-violet-100">
          Kirim pesan Telegram ke <strong>topik/thread tertentu</strong> di dalam group chat.
          Group dicari dari tabel{' '}
          <code className="bg-violet-700 px-1.5 py-0.5 rounded text-xs font-mono">
            vanya_group_chat
          </code>
          , lalu topic ID dicari dari tabel{' '}
          <code className="bg-violet-700 px-1.5 py-0.5 rounded text-xs font-mono">
            vanya_group_topic
          </code>{' '}
          berdasarkan nama topik yang diberikan.
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
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 font-mono text-sm ${error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-violet-500 focus:ring-violet-200'
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
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">group_name</code>
            </span>
          </p>
        </div>

        {/* Topic Name Key */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Topic Name Variable Key <span className="text-red-500">*</span>
          </label>
          <Controller
            name="topic_name"
            control={control}
            defaultValue="topic_name"
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="topic_name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 font-mono text-sm ${error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-violet-500 focus:ring-violet-200'
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
              Key dari variable yang berisi nama topik. Default:{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">topic_name</code>
              {' '}— akan di-lookup ke tabel{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">vanya_group_topic</code>
              {' '}untuk mendapatkan{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">message_thread_id</code>
            </span>
          </p>
        </div>

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
                  placeholder="Enter your message template. Use ${variableName} for placeholders.
        
        Example:
        Hello ${fullName}!
        
        Your order ${orderNumber} has been ${status}.
        
        Thank you!"
                  rows={10}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 font-mono text-sm ${error
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  style={{
                    resize: 'vertical',
                    minHeight: '200px',
                  }}
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
              Gunakan ${`{variableName}`} untuk placeholder yang akan diganti
              dengan nilai dari variables
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
