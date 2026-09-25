import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function GetRecordView({ form }: AlurkerjaMfeProps) {
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
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Get Record By Email
        </h3>
        <p className="text-xs text-gray-600">
          This action will retrieve a record from the telegram_account table
          based on the provided email address.
        </p>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                className="text-sm"
                placeholder="user@example.com"
                type="email"
                {...field}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter the email address to search in the telegram_account table
              </p>
            </div>
          )}
        />
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              How it works
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Searches the telegram_account table for matching email</li>
              <li>• Returns complete record if found</li>
              <li>• Returns null if no record matches</li>
              <li>• Uses database configuration from addon settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Expected Response */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold mb-2 text-gray-700">
          Expected Response:
        </h4>
        <pre className="text-xs bg-white p-2 rounded border border-gray-300 overflow-x-auto">
          {`{
  "status": "success",
  "message": "Record found for email: ...",
  "data": {
    "email": "user@example.com",
    "record": { ... },
    "found": true
  }
}`}
        </pre>
      </div>
    </div>
  );
}
