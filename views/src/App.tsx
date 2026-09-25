import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './Header';
import CreateView from './CreateView';
import GetDataView from './GetDataView';
import PostDataView from './PostDataView';
import DetailView from './DetailView';
import EditView from './EditView';
import DebugView from './debug/DebugView';
import { useForm } from 'react-hook-form';
import ExampleForm from './debug/ExampleForm';

// biasalah-addon
import AssignmentDateFormView from './biasalah/AssignmentDateFormView';
import ParentFormView from './biasalah/ParentFormView';

// date-calculator
import IzinFormView from './date-calculator/IzinFormView';
import IzinFormPGView from './date-calculator/IzinFormPGView';
import IzinFormGanti from './date-calculator/IzinFormGanti';
import IzinWithFileFormView from './date-calculator/IzinWithFileFormView';

// form-custom
import TeamFormView from './form-custom/TeamFormView';
import OdooJournalFormView from './form-custom/OdooJournalFormView';
import PostOdooJournalFormView from './form-custom/PostOdooJournalFormView';

// n8n-izin
import ApprovalLeadInput from './n8n-izin/ApprovalLeadInput';
import CheckSisaCutiInput from './n8n-izin/CheckSisaCutiInput';

// n8n-basic-auth
import ConfigView from './n8n-basic-auth/ConfigView';
import ProjectCollabFormView from './n8n-basic-auth/ProjectCollabFormView';
import ManagerApprovalView from './n8n-basic-auth/ManagerApprovalView';
import AllocationRemainingView from './n8n-basic-auth/AllocationRemainingView';
import RemainingTaskView from './n8n-basic-auth/RemainingTaskView';

// team-multiple-select
import TeamMultipleSelectView from './team-multiple-select/TeamMultipleSelectView';

// postgres-telegram
import PgConfigView from './postgres-telegram/PgConfigView';
import PgActionView from './postgres-telegram/PgActionView';
import GetRecordView from './postgres-telegram/GetRecordView';
import SendTelegramView from './postgres-telegram/SendTelegramView';
import SendTelegramGroupView from './postgres-telegram/SendTelegramGroupView';
import SendTelegramGroupTopicView from './postgres-telegram/SendTelegramGroupTopicView';
import AnalizeNotaView from './postgres-telegram/AnalizeNotaView';

// odoo
import VendorPaymentView from './odoo/VendorPaymentView';
import JournalEntryView from './odoo/JournalEntryView';
import VendorListView from './odoo/VendorListView';

// alurkerja-testing
import SendReminderView from './alurkerja-testing/SendReminderView';

import 'alurkerja-ui/dist/style.css';

// ─── navigation groups ────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    group: 'Base',
    color: 'blue',
    items: [
      { path: '/create',    label: 'Create View' },
      { path: '/get-data',  label: 'Get Data View' },
      { path: '/post-data', label: 'Post Data View' },
      { path: '/detail',    label: 'Detail View' },
      { path: '/edit',      label: 'Edit View' },
      { path: '/debug',     label: 'Debug / Example Form' },
    ],
  },
  {
    group: 'Biasalah',
    color: 'violet',
    items: [
      { path: '/biasalah/assignment-date', label: 'Assignment Date Form' },
      { path: '/biasalah/parent-form',     label: 'Parent Data Form' },
    ],
  },
  {
    group: 'Date Calculator',
    color: 'emerald',
    items: [
      { path: '/date-calculator/izin-form',      label: 'Izin Form' },
      { path: '/date-calculator/izin-form-pg',   label: 'Izin Form PG' },
      { path: '/date-calculator/izin-form-ganti',label: 'Izin Form Ganti' },
      { path: '/date-calculator/izin-with-file', label: 'Izin With File Form' },
    ],
  },
  {
    group: 'Form Custom',
    color: 'orange',
    items: [
      { path: '/form-custom/team-form',            label: 'Team Form' },
      { path: '/form-custom/odoo-journal-form',    label: 'Odoo Journal Form' },
      { path: '/form-custom/post-odoo-journal',    label: 'Post Odoo Journal Form' },
    ],
  },
  {
    group: 'N8N Izin',
    color: 'pink',
    items: [
      { path: '/n8n-izin/approval-lead',   label: 'Approval Lead Input' },
      { path: '/n8n-izin/check-sisa-cuti', label: 'Check Sisa Cuti Input' },
    ],
  },
  {
    group: 'N8N Basic Auth',
    color: 'cyan',
    items: [
      { path: '/n8n-basic-auth/config',               label: 'Config View' },
      { path: '/n8n-basic-auth/project-collab',       label: 'Project Collab Form' },
      { path: '/n8n-basic-auth/manager-approval',     label: 'Manager Approval View' },
      { path: '/n8n-basic-auth/allocation-remaining', label: 'Allocation Remaining View' },
      { path: '/n8n-basic-auth/remaining-task',       label: 'Remaining Task View' },
    ],
  },
  {
    group: 'Team Multiple Select',
    color: 'teal',
    items: [
      { path: '/team-multiple-select', label: 'Team Multiple Select' },
    ],
  },
  {
    group: 'Postgres & Telegram',
    color: 'indigo',
    items: [
      { path: '/postgres-telegram/pg-config',           label: 'PG Config View' },
      { path: '/postgres-telegram/pg-action',           label: 'PG Action View' },
      { path: '/postgres-telegram/get-record',          label: 'Get Record View' },
      { path: '/postgres-telegram/send-telegram',       label: 'Send Telegram View' },
      { path: '/postgres-telegram/send-telegram-group',       label: 'Send Telegram Group View' },
      { path: '/postgres-telegram/send-telegram-group-topic', label: 'Send Telegram Group Topic View' },
      { path: '/postgres-telegram/analize-nota',               label: 'Analisa Nota View' },
    ],
  },
  {
    group: 'Odoo',
    color: 'rose',
    items: [
      { path: '/odoo/vendor-payment', label: 'Vendor Payment View' },
      { path: '/odoo/journal-entry',  label: 'Journal Entry View' },
      { path: '/odoo/vendor-list',    label: 'Vendor List View' },
    ],
  },
  {
    group: 'Alurkerja Testing',
    color: 'yellow',
    items: [
      { path: '/alurkerja-testing/send-reminder', label: 'Send Reminder View' },
    ],
  },
];

// ─── Home ─────────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-800',
  violet: 'bg-violet-50 border-violet-200 text-violet-800',
  emerald:'bg-emerald-50 border-emerald-200 text-emerald-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  pink:   'bg-pink-50 border-pink-200 text-pink-800',
  cyan:   'bg-cyan-50 border-cyan-200 text-cyan-800',
  teal:   'bg-teal-50 border-teal-200 text-teal-800',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  rose:   'bg-rose-50 border-rose-200 text-rose-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const LINK_MAP: Record<string, string> = {
  blue:   'text-blue-600 hover:text-blue-900',
  violet: 'text-violet-600 hover:text-violet-900',
  emerald:'text-emerald-600 hover:text-emerald-900',
  orange: 'text-orange-600 hover:text-orange-900',
  pink:   'text-pink-600 hover:text-pink-900',
  cyan:   'text-cyan-600 hover:text-cyan-900',
  teal:   'text-teal-600 hover:text-teal-900',
  indigo: 'text-indigo-600 hover:text-indigo-900',
  rose:   'text-rose-600 hover:text-rose-900',
  yellow: 'text-yellow-600 hover:text-yellow-900',
};

const Home: React.FC = () => (
  <div className="py-6 space-y-6">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Javan Addon — Component List</h2>
      <p className="text-sm text-gray-500 mt-1">Pilih komponen di bawah untuk membuka preview-nya.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {NAV_GROUPS.map(({ group, color, items }) => (
        <div key={group} className={`border rounded-lg p-4 ${COLOR_MAP[color]}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">{group}</h3>
          <ul className="space-y-1">
            {items.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`text-sm font-medium underline-offset-2 hover:underline ${LINK_MAP[color]}`}
                >
                  → {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const form = useForm();
  const alurkerjaParams = {
    apiBaseUrl: 'https://api.mockservice.com',
    token: 'abcdef123456',
    activeTenant: 'abc123xyz',
    probis: 'asdasdas',
    taskId: 'asdasd',
  };

  // Mock item untuk komponen yang butuh field metadata (dipakai saat preview dev)
  const mockItem = {
    label: { en: 'Preview Field', id: 'Preview Field' },
    name: 'preview_field',
    placeholder: '',
    form_field_type: 'text',
    ui_type: 'text',
    defaultValue: null,
    tooltip: { enable: false, message: '' },
    disabled: false,
    constraints: { required: false },
  };

  const p = { form, alurkerjaParams };
  // props-wrapper untuk komponen AlurkerjaMfeInputProps (butuh props.form + props.item)
  const pInput = { props: { form, item: mockItem }, alurkerjaParams };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="flex flex-1">
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
            <div className="p-[10px] border rounded-sm bg-white shadow-sm h-full">
              <Routes>
                {/* Base */}
                <Route path="/" element={<Home />} />
                <Route path="/create"    element={<CreateView   {...p} />} />
                <Route path="/get-data"  element={<GetDataView  {...p} />} />
                <Route path="/post-data" element={<PostDataView {...p} />} />
                <Route path="/detail"    element={<DetailView   {...p} />} />
                <Route path="/edit"      element={<EditView     {...p} />} />
                <Route path="/debug"     element={<ExampleForm />} />

                {/* Biasalah */}
                <Route path="/biasalah/assignment-date" element={<AssignmentDateFormView {...pInput} />} />
                <Route path="/biasalah/parent-form"     element={<ParentFormView         {...pInput} />} />

                {/* Date Calculator */}
                <Route path="/date-calculator/izin-form"       element={<IzinFormView       {...pInput} />} />
                <Route path="/date-calculator/izin-form-pg"    element={<IzinFormPGView     {...pInput} />} />
                <Route path="/date-calculator/izin-form-ganti" element={<IzinFormGanti      {...pInput} />} />
                <Route path="/date-calculator/izin-with-file"  element={<IzinWithFileFormView {...pInput} />} />

                {/* Form Custom */}
                <Route path="/form-custom/team-form"         element={<TeamFormView           {...pInput} />} />
                <Route path="/form-custom/odoo-journal-form" element={<OdooJournalFormView    {...pInput} />} />
                <Route path="/form-custom/post-odoo-journal" element={<PostOdooJournalFormView {...p} />} />

                {/* N8N Izin */}
                <Route path="/n8n-izin/approval-lead"   element={<ApprovalLeadInput  {...pInput} />} />
                <Route path="/n8n-izin/check-sisa-cuti" element={<CheckSisaCutiInput {...pInput} />} />

                {/* N8N Basic Auth */}
                <Route path="/n8n-basic-auth/config"               element={<ConfigView              {...p} />} />
                <Route path="/n8n-basic-auth/project-collab"       element={<ProjectCollabFormView   {...p} />} />
                <Route path="/n8n-basic-auth/manager-approval"     element={<ManagerApprovalView     {...p} />} />
                <Route path="/n8n-basic-auth/allocation-remaining" element={<AllocationRemainingView {...p} />} />
                <Route path="/n8n-basic-auth/remaining-task"       element={<RemainingTaskView       {...p} />} />

                {/* Team Multiple Select */}
                <Route path="/team-multiple-select" element={<TeamMultipleSelectView {...pInput} />} />

                {/* Postgres & Telegram */}
                <Route path="/postgres-telegram/pg-config"     element={<PgConfigView     {...p} />} />
                <Route path="/postgres-telegram/pg-action"     element={<PgActionView     {...p} />} />
                <Route path="/postgres-telegram/get-record"    element={<GetRecordView    {...p} />} />
                <Route path="/postgres-telegram/send-telegram"       element={<SendTelegramView      {...p} />} />
                <Route path="/postgres-telegram/send-telegram-group"       element={<SendTelegramGroupView      {...p} />} />
                <Route path="/postgres-telegram/send-telegram-group-topic" element={<SendTelegramGroupTopicView {...p} />} />
                <Route path="/postgres-telegram/analize-nota"               element={<AnalizeNotaView           {...p} />} />

                {/* Odoo */}
                <Route path="/odoo/vendor-payment" element={<VendorPaymentView {...p} />} />
                <Route path="/odoo/journal-entry"  element={<JournalEntryView  {...p} />} />
                <Route path="/odoo/vendor-list"    element={<VendorListView    {...pInput} />} />

                {/* Alurkerja Testing */}
                <Route path="/alurkerja-testing/send-reminder" element={<SendReminderView {...p} />} />
              </Routes>
            </div>
          </main>

          <DebugView
            form={form}
            data={{ alurkerjaParams, currentPath: window.location.pathname }}
            title="Debug Panel"
          />
        </div>
      </div>
    </Router>
  );
};

export default App;