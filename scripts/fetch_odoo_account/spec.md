# Specification: Fetch Odoo Account

Script untuk mengambil data chart of accounts dari model `account.account` di Odoo.

## Model Odoo
**Model**: `account.account`

## Method API
- **Method**: `search_read`
- **Endpoint**: `/web/dataset/call_kw/account.account/search_read`

## Request Payload

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "model": "account.account",
    "method": "search_read",
    "args": [],
    "kwargs": {
      "domain": [
        ["company_id", "=", 1],
        "|",
        ["code", "ilike", "search_term"],
        ["name", "ilike", "search_term"]
      ],
      "fields": [
        "id",
        "code",
        "name",
        "account_type",
        "internal_group",
        "reconcile",
        "deprecated",
        "currency_id",
        "company_id",
        "group_id",
        "note",
        "create_date",
        "write_date"
      ],
      "limit": 100,
      "offset": 0,
      "context": {
        "lang": "en_US",
        "tz": "Asia/Jakarta",
        "uid": 2,
        "allowed_company_ids": [1]
      }
    }
  },
  "id": 1
}
```

## Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | ID unik akun |
| `code` | String | Kode akun (contoh: 101000) |
| `name` | String | Nama akun (contoh: Cash) |
| `account_type` | Selection | Tipe akun (asset_cash, expense, dll) |
| `internal_group` | String | Grup internal akun |
| `reconcile` | Boolean | Apakah akun bisa direkonsiliasi |
| `deprecated` | Boolean | Apakah akun sudah tidak digunakan |
| `currency_id` | Many2one | Mata uang akun |
| `company_id` | Many2one | Perusahaan pemilik akun |
| `group_id` | Many2one | Grup akun |
| `note` | Text | Catatan tambahan |
| `create_date` | Datetime | Tanggal pembuatan |
| `write_date` | Datetime | Tanggal update terakhir |

## Account Types

Odoo menyediakan berbagai tipe akun:

### Assets
- `asset_receivable` - Receivable (Piutang)
- `asset_cash` - Bank and Cash (Kas & Bank)
- `asset_current` - Current Assets (Aset Lancar)
- `asset_non_current` - Non-current Assets (Aset Tidak Lancar)
- `asset_prepayments` - Prepayments (Pembayaran di Muka)
- `asset_fixed` - Fixed Assets (Aset Tetap)

### Liabilities
- `liability_payable` - Payable (Hutang)
- `liability_credit_card` - Credit Card (Kartu Kredit)
- `liability_current` - Current Liabilities (Kewajiban Lancar)
- `liability_non_current` - Non-current Liabilities (Kewajiban Tidak Lancar)

### Equity
- `equity` - Equity (Ekuitas)
- `equity_unaffected` - Current Year Earnings (Laba Tahun Berjalan)

### Income
- `income` - Income (Pendapatan)
- `income_other` - Other Income (Pendapatan Lain)

### Expense
- `expense` - Expenses (Biaya)
- `expense_depreciation` - Depreciation (Depresiasi)
- `expense_direct_cost` - Cost of Revenue (HPP)

### Other
- `off_balance` - Off-Balance Sheet (Di Luar Neraca)

## Domain Filters

Script mendukung filter berikut:

1. **Company Filter**: `["company_id", "=", company_id]`
2. **Search Term**: `"|", ["code", "ilike", term], ["name", "ilike", term]`
3. **Account Type**: `["account_type", "=", type]`

## Use Cases

### 1. Ambil Semua Akun
```json
{
  "parameters": {
    "company_id": 1,
    "limit": 100
  }
}
```

### 2. Cari Berdasarkan Kode
```json
{
  "parameters": {
    "search_term": "1000",
    "company_id": 1
  }
}
```

### 3. Filter Tipe Akun
```json
{
  "parameters": {
    "account_type": "expense",
    "company_id": 1,
    "limit": 50
  }
}
```

### 4. Pagination
```json
{
  "parameters": {
    "company_id": 1,
    "limit": 20,
    "offset": 20
  }
}
```

## Response Format

```json
{
  "status": "ok",
  "data": {
    "accounts": [
      {
        "id": 123,
        "code": "101000",
        "name": "Cash",
        "display_name": "101000 Cash",
        "account_type": "asset_cash",
        "internal_group": "asset",
        "reconcile": false,
        "deprecated": false,
        "currency_id": {"id": 12, "name": "IDR"},
        "company_id": {"id": 1, "name": "My Company"},
        "group_id": {"id": 5, "name": "Current Assets"},
        "note": "",
        "create_date": "2025-01-15 10:30:00",
        "write_date": "2026-01-20 14:45:00"
      }
    ],
    "total_count": 1,
    "limit": 100,
    "offset": 0,
    "search_term": null,
    "account_type": null,
    "company_id": 1
  },
  "message": "Successfully fetched 1 account(s)",
  "runkey": "fetch-account-001"
}
```

## Integration Notes

1. **Authentication**: Script harus authenticate terlebih dahulu menggunakan `/web/session/authenticate`
2. **Session**: Gunakan cookies dari authentication untuk request berikutnya
3. **Context**: Sertakan `allowed_company_ids` di context untuk multi-company
4. **Error Handling**: Handle error dari Odoo API dengan proper error message
5. **Pagination**: Gunakan `limit` dan `offset` untuk data besar
