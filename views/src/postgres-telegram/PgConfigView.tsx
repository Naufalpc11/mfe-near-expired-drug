import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

// ─── reusable field helpers ───────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  control: any;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}

function ConfigField({ label, name, control, placeholder, type = 'text', required = false, hint }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field, fieldState }) => (
          <>
            <Input className="text-sm w-full" type={type} placeholder={placeholder} {...field} />
            {fieldState.error && (
              <p className="text-xs text-red-500">{fieldState.error.message}</p>
            )}
            {hint && !fieldState.error && (
              <p className="text-xs text-gray-400">{hint}</p>
            )}
          </>
        )}
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

function Section({ title, badge, children }: SectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {badge && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PgConfigView({ form }: AlurkerjaMfeProps) {
  const { control } = form;

  return (
    <div className="space-y-5">

      {/* ── 1. PostgreSQL ─────────────────────────────────────────── */}
      <Section title="PostgreSQL Database" badge="db_host · db_port · db_name · db_user · db_password">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <ConfigField
              label="Host"
              name="value.db_host"
              control={control}
              placeholder="192.168.1.10 atau localhost"
              required
            />
          </div>
          <ConfigField
            label="Port"
            name="value.db_port"
            control={control}
            placeholder="5432"
            type="number"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ConfigField
            label="Database Name"
            name="value.db_name"
            control={control}
            placeholder="nama_database"
            required
          />
          <ConfigField
            label="DB Username"
            name="value.db_user"
            control={control}
            placeholder="postgres"
            required
          />
        </div>
        <ConfigField
          label="DB Password"
          name="value.db_password"
          control={control}
          type="password"
          placeholder="••••••••"
          required
        />
      </Section>

      {/* ── 2. Telegram ───────────────────────────────────────────── */}
      <Section title="Telegram Bot" badge="telegram_token">
        <ConfigField
          label="Bot Token"
          name="value.telegram_token"
          control={control}
          type="password"
          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
          required
          hint="Dapatkan token dari @BotFather di Telegram"
        />
      </Section>

      {/* ── 3. Odoo ───────────────────────────────────────────────── */}
      <Section title="Odoo API" badge="url · database · username · password">
        <ConfigField
          label="Base URL"
          name="value.url"
          control={control}
          placeholder="https://yourcompany.odoo.com/"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ConfigField
            label="Database"
            name="value.database"
            control={control}
            placeholder="nama-database-odoo"
            required
          />
          <ConfigField
            label="Username / Email"
            name="value.username"
            control={control}
            placeholder="admin@example.com"
            required
          />
        </div>
        <ConfigField
          label="Password"
          name="value.password"
          control={control}
          type="password"
          placeholder="••••••••"
          required
        />
      </Section>

      {/* ── 4. Table Mapping (Send Reminder) ──────────────────────── */}
      <Section
        title="Table Mapping"
        badge="lunch_table · telegram_table · columns"
      >
        <p className="text-xs text-gray-500">
          Digunakan oleh <span className="font-mono bg-gray-100 px-1 rounded">sendReminder</span> untuk mengidentifikasi tabel &amp; kolom di PostgreSQL.
        </p>

        {/* Lunch table */}
        <div className="border border-dashed border-gray-300 rounded p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Lunch Table</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ConfigField
              label="Table Name"
              name="value.lunch_table"
              control={control}
              placeholder="lunch_data"
            />
            <ConfigField
              label="Email Column"
              name="value.lunch_email_column"
              control={control}
              placeholder="email"
            />
            <ConfigField
              label="Date Column"
              name="value.lunch_date_column"
              control={control}
              placeholder="tanggal"
            />
          </div>
        </div>

        {/* Telegram account table */}
        <div className="border border-dashed border-gray-300 rounded p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telegram Account Table</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ConfigField
              label="Table Name"
              name="value.telegram_table"
              control={control}
              placeholder="telegram_account"
            />
            <ConfigField
              label="Email Column"
              name="value.telegram_email_column"
              control={control}
              placeholder="email"
            />
            <ConfigField
              label="Chat ID Column"
              name="value.telegram_chat_id_column"
              control={control}
              placeholder="chatid"
            />
          </div>
        </div>
      </Section>

      {/* ── 5. OpenAI ──────────────────────────────────────────────── */}
      <Section title="OpenAI" badge="openai_token">
        <ConfigField
          label="API Token"
          name="value.openai_token"
          control={control}
          type="password"
          placeholder="sk-••••••••••••••••••••••••••••••••"
          hint="Digunakan oleh analyze_images untuk menganalisa gambar via OpenAI Vision API"
        />
      </Section>

      {/* ── Info box ──────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Catatan Konfigurasi</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Isi bagian <strong>PostgreSQL</strong> jika menggunakan script: get_record_by_email, send_telegram_message, send_table_list, sendReminder.</li>
            <li>Isi bagian <strong>Odoo API</strong> jika menggunakan script: fetch_odoo_*, post_odoo_journals, post_odoo_payment.</li>
            <li>Isi bagian <strong>Table Mapping</strong> hanya untuk script: sendReminder.</li>
            <li>Isi bagian <strong>OpenAI</strong> jika menggunakan script: analyze_images.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
