import React from 'react';
import { Controller } from 'react-hook-form';
import { Input, InputDate, Select } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function PgActionView({ form }: AlurkerjaMfeProps) {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          Send PostgreSQL Table List to Telegram
        </h3>
        <p className="text-xs text-gray-600">
          This action will retrieve all tables from the configured PostgreSQL
          database and send the list to your specified Telegram chat or topic.
        </p>
      </div>

      {/* Chat ID */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Chat ID <span className="text-red-500">*</span>
        </label>
        <Controller
          name="chat_id"
          control={control}
          rules={{
            required: 'Chat ID is required',
            pattern: {
              value: /^-?\d+$/,
              message: 'Chat ID must be a valid number',
            },
          }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                className="text-sm font-mono"
                placeholder="-1001234567890"
                {...field}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                For groups, use negative numbers (e.g., -1001234567890)
              </p>
            </div>
          )}
        />
      </div>

      {/* Topic ID */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Topic ID (Optional)</label>
        <Controller
          name="topic_id"
          control={control}
          rules={{
            pattern: {
              value: /^\d*$/,
              message: 'Topic ID must be a number',
            },
          }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                className="text-sm font-mono"
                placeholder="123"
                {...field}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Required only for forum/topic groups. Leave empty for regular
                groups.
              </p>
            </div>
          )}
        />
      </div>

      {/* Helper Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-2">How to get Chat ID and Topic ID:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Private chat:</strong> Use{' '}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  @userinfobot
                </a>
              </li>
              <li>
                <strong>Groups:</strong> Add your bot and{' '}
                <a
                  href="https://t.me/getidsbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  @getidsbot
                </a>{' '}
                to the group
              </li>
              <li>
                <strong>Topics:</strong> The topic ID is visible in the topic
                URL
              </li>
              <li>
                <strong>Important:</strong> Your bot must be a member of the
                group/channel
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Expected Output:</h4>
        <div className="bg-white border rounded p-3 text-xs font-mono">
          <div className="space-y-1">
            <div>
              <strong>📊 Database:</strong> your_database_name
            </div>
            <div>
              <strong>Total Tables:</strong> N
            </div>
            <div className="mt-2">
              <strong>Table List:</strong>
              <div className="ml-4 mt-1">
                1. table_name_1
                <br />
                2. table_name_2
                <br />
                3. table_name_3
                <br />
                ...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
