buatkan saya script untuk menyimpan data  ke odoo  dengan sistem script

dengan payload parameter 
{
  "vendor_name": "123131",
  "amount": "31321321",
  "goods_services": "barnanya ini123",
  "date": "2026-01-20",
  "memo": "12312312321",
  "account_number": "123812038012"
}

dan payload config 
 {
    "url": "odoo.com",
    "database": "12312",
    "username": "username",
    "password": "passwrod",
    "version": "18"
  }

untuk sistemf flow pengerjaan bisa lihat delete_data.py

untuk flow saya perlu mengecek apakah ada partner dengan nama yang sesuai dengan menggunakan api 
/web/dataset/call_kw/res.partner/web_name_search
dengna payload sample berikut

{"id":25,"jsonrpc":"2.0","method":"call","params":{"model":"res.partner","method":"web_name_search","args":[],"kwargs":{"name":"","operator":"ilike","domain":["&","|",["company_id","=",false],["company_id","parent_of",[1]],"|",["parent_id","=",false],["is_company","=",true]],"limit":8,"context":{"lang":"en_US","tz":"Asia/Jakarta","uid":2,"allowed_company_ids":[1],"display_account_trust":true,"default_is_company":true},"specification":{"display_name":{}}}}}

dan lakukan upsert dengan cara 

/web/dataset/call_kw/res.partner.bank/web_save
dengan payload berikut 
{"id":39,"jsonrpc":"2.0","method":"call","params":{"model":"res.partner.bank","method":"web_save","args":[[],{"acc_number":"12312312312312312","clearing_number":"12312312312321","partner_id":3,"acc_holder_name":"AlurKerja","bank_id":false,"allow_out_payment":true,"l10n_id_qris_api_key":false,"l10n_id_qris_mid":false,"note":false}],"kwargs":{"context":{"lang":"en_US","tz":"Asia/Jakarta","uid":2,"allowed_company_ids":[1],"display_account_trust":true,"default_partner_id":3,"default_name":"12312312312312312"},"specification":{}}}}

jika sudah berhasil 
buat payment dengan

/web/dataset/call_kw/account.payment/web_save
{"id":45,"jsonrpc":"2.0","method":"call","params":{"model":"account.payment","method":"web_save","args":[[],{"state":"draft","partner_type":"supplier","company_id":1,"paired_internal_transfer_payment_id":false,"currency_id":12,"payment_type":"outbound","partner_id":3,"amount":12321312,"date":"2026-01-21","memo":"12312312312","journal_id":13,"payment_method_line_id":4,"payment_token_id":false,"partner_bank_id":10}],"kwargs":{"context":{"lang":"en_US","tz":"Asia/Jakarta","uid":2,"allowed_company_ids":[1],"default_payment_type":"outbound","default_partner_type":"supplier","default_move_journal_types":["bank","cash"],"display_account_trust":true},"specification":{"amount_available_for_refund":{},"state":{},"duplicate_payment_ids":{"fields":{"display_name":{}}},"id":{},"is_sent":{},"need_cancel_request":{},"is_reconciled":{},"is_matched":{},"payment_method_code":{},"show_partner_bank_account":{},"require_partner_bank_account":{},"available_payment_method_line_ids":{},"available_partner_bank_ids":{},"country_code":{},"partner_type":{},"reconciled_invoices_type":{},"company_id":{"fields":{}},"paired_internal_transfer_payment_id":{"fields":{}},"available_journal_ids":{},"currency_id":{"fields":{}},"reconciled_invoices_count":{},"reconciled_bills_count":{},"reconciled_statement_lines_count":{},"refunds_count":{},"name":{},"payment_type":{},"partner_id":{"fields":{"display_name":{}},"context":{"default_is_company":true}},"amount":{},"date":{},"memo":{},"journal_id":{"fields":{"display_name":{}}},"payment_method_line_id":{"fields":{"display_name":{}},"context":{"hide_payment_journal_id":1}},"suitable_payment_token_ids":{},"use_electronic_payment_method":{},"payment_token_id":{"fields":{"display_name":{}}},"partner_bank_id":{"fields":{"display_name":{}},"context":{"display_account_trust":true}},"source_payment_id":{"fields":{"display_name":{}}},"payment_transaction_id":{"fields":{"display_name":{}}},"qr_code":{},"move_id":{"fields":{}},"display_name":{}}}}}

dan 
lakukan konfirm dengan
/web/dataset/call_button/account.payment/action_post
{"id":48,"jsonrpc":"2.0","method":"call","params":{"args":[[9]],"kwargs":{"context":{"default_payment_type":"outbound","default_partner_type":"supplier","default_move_journal_types":["bank","cash"],"display_account_trust":true,"lang":"en_US","tz":"Asia/Jakarta","uid":2,"allowed_company_ids":[1]}},"method":"action_post","model":"account.payment"}}
