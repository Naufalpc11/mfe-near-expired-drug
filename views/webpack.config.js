const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  devServer: {
    port: 3001,
    historyApiFallback: true,
  },
  output: {
    publicPath: 'auto'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      { test: /\.(ts|tsx|js|jsx)$/, loader: 'babel-loader', exclude: /node_modules/ },
      { 
        test: /\.css$/, 
        use: [
          'style-loader', 
          'css-loader',
          'postcss-loader'
        ]
      },
      { 
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new ModuleFederationPlugin({
      name: 'javan_addon',
      filename: 'remoteEntry.js',
      exposes: {
        // Base views
        './create_view': './src/CreateView.tsx',
        './edit_view': './src/EditView.tsx',
        './detail_view': './src/DetailView.tsx',
        './getData_view': './src/GetDataView.tsx',
        './postData_view': './src/PostDataView.tsx',

        // biasalah-addon forms
        './assignment_date_view': './src/biasalah/AssignmentDateFormView.tsx',
        './parent_form_view': './src/biasalah/ParentFormView.tsx',

        // date-calculator forms
        './izin_form_view': './src/date-calculator/IzinFormView.tsx',
        './izin_form_pg_view': './src/date-calculator/IzinFormPGView.tsx',
        './izin_form_ganti': './src/date-calculator/IzinFormGanti.tsx',
        './izin_with_file_form_view': './src/date-calculator/IzinWithFileFormView.tsx',

        // form-custom forms
        './team_form_view': './src/form-custom/TeamFormView.tsx',
        './odoo_journal_form_view': './src/form-custom/OdooJournalFormView.tsx',
        './post_odoo_journal_form_view': './src/form-custom/PostOdooJournalFormView.tsx',

        // n8n-izin forms
        './approval_lead_input': './src/n8n-izin/ApprovalLeadInput.tsx',
        './check_sisa_cuti_input': './src/n8n-izin/CheckSisaCutiInput.tsx',

        // n8n_basic_auth forms
        './config_view': './src/n8n-basic-auth/ConfigView.tsx',
        './project_collab_form_view': './src/n8n-basic-auth/ProjectCollabFormView.tsx',
        './manager_approval_view': './src/n8n-basic-auth/ManagerApprovalView.tsx',
        './allocation_remaining_view': './src/n8n-basic-auth/AllocationRemainingView.tsx',
        './remaining_task_view': './src/n8n-basic-auth/RemainingTaskView.tsx',

        // team_multiple_select forms
        './team_multiple_select': './src/team-multiple-select/TeamMultipleSelectView.tsx',

        // postgres_telegram action views
        './pg_config_view': './src/postgres-telegram/PgConfigView.tsx',
        './pg_action_view': './src/postgres-telegram/PgActionView.tsx',
        './get_record_view': './src/postgres-telegram/GetRecordView.tsx',
        './send_telegram_view': './src/postgres-telegram/SendTelegramView.tsx',
        './send_telegram_group_view': './src/postgres-telegram/SendTelegramGroupView.tsx',
        './send_telegram_group_topic_view': './src/postgres-telegram/SendTelegramGroupTopicView.tsx',
        './analize_nota_view': './src/postgres-telegram/AnalizeNotaView.tsx',

        // odoo-addon action views
        './vendorPayment_view': './src/odoo/VendorPaymentView.tsx',
        './journalEntry_view': './src/odoo/JournalEntryView.tsx',
        './vendor_list_view': './src/odoo/VendorListView.tsx',

        // addon_alurkerja_testing action views
        './send_reminder_view': './src/alurkerja-testing/SendReminderView.tsx',

        // mfe-near-expired-drug
        './MedicineAutoFillForm': './src/components/MedicineAutoFillForm.tsx',
        './medicine_autofill_form': './src/components/MedicineAutoFillForm.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-hook-form': { singleton: true },
        leaflet: { singleton: true },
        'react-leaflet': { singleton: true },
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};