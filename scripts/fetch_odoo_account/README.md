# Fetch Odoo Account Script

Script untuk mengambil data chart of accounts (akun) dari sistem Odoo menggunakan REST API.

## Cara Penggunaan

### Menjalankan Script

```bash
python3 fetch_odoo_account.py --run request.example.json
```

atau dengan JSON string langsung:

```bash
python3 fetch_odoo_account.py --run '{"variables":{},"parameters":{"search_term":"1000","account_type":"asset_current","company_id":1,"limit":50,"offset":0,"include_types_info":true},"configuration":{"url":"your-odoo-instance.com","database":"your_database","username":"your_username","password":"your_password"},"runkey":"test-run-001"}'
```

## Flow Proses

1. **Autentikasi** - Login ke sistem Odoo
2. **Pencarian Account** - Mencari akun berdasarkan kriteria
3. **Format Data** - Format data account untuk output

## Input Parameters

### Parameters (dari user)
- `search_term`: (Opsional) Kode atau nama akun yang akan dicari (menggunakan partial match)
- `account_type`: (Opsional) Tipe akun, pilihan:
  - `asset_receivable` - Receivable
  - `asset_cash` - Bank and Cash
  - `asset_current` - Current Assets
  - `asset_non_current` - Non-current Assets
  - `asset_prepayments` - Prepayments
  - `asset_fixed` - Fixed Assets
  - `liability_payable` - Payable
  - `liability_credit_card` - Credit Card
  - `liability_current` - Current Liabilities
  - `liability_non_current` - Non-current Liabilities
  - `equity` - Equity
  - `equity_unaffected` - Current Year Earnings
  - `income` - Income
  - `income_other` - Other Income
  - `expense` - Expenses
  - `expense_depreciation` - Depreciation
  - `expense_direct_cost` - Cost of Revenue
  - `off_balance` - Off-Balance Sheet
- `company_id`: (Opsional) ID perusahaan (default: 1)
- `limit`: (Opsional) Jumlah maksimal record yang dikembalikan (default: 100)
- `offset`: (Opsional) Offset untuk pagination (default: 0)
- `include_types_info`: (Opsional) Apakah menyertakan informasi daftar tipe akun (default: false)

### Configuration (setup Odoo)
- `url`: URL instance Odoo
- `database`: Nama database Odoo
- `username`: Username untuk login
- `password`: Password untuk login

## Output

Script akan mengembalikan JSON dengan format:

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
        "currency_id": {
          "id": 12,
          "name": "IDR"
        },
        "company_id": {
          "id": 1,
          "name": "My Company"
        },
        "group_id": {
          "id": 5,
          "name": "Current Assets"
        },
        "note": "",
        "create_date": "2025-01-15 10:30:00",
        "write_date": "2026-01-20 14:45:00"
      }
    ],
    "total_count": 1,
    "limit": 100,
    "offset": 0,
    "search_term": "Cash",
    "account_type": "asset_cash",
    "company_id": 1,
    "account_types": {
      "asset_receivable": "Receivable",
      "asset_cash": "Bank and Cash",
      "asset_current": "Current Assets",
      "income": "Income",
      "expense": "Expenses"
    }
  },
  "message": "Successfully fetched 1 account(s)"
}
```

Jika terjadi error:

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch accounts",
  "error": "Error message here"
}
```

## Error Handling

Script akan mengembalikan error response jika:
- Konfigurasi tidak lengkap
- Autentikasi gagal
- Parameter tidak valid
- Koneksi ke Odoo gagal
- Data tidak ditemukan

## Dependencies

Script memerlukan library Python berikut:
- `requests` - untuk HTTP calls ke Odoo API
- `json` - untuk parsing JSON
- `argparse` - untuk command line arguments

Install dependencies:
```bash
pip install requests
```

## Contoh Penggunaan

### 1. Ambil semua akun
```json
{
  "variables": {},
  "parameters": {},
  "configuration": {
    "url": "https://accountingalurkerja.odoo.com/",
    "database": "accountingalurkerja",
    "username": "admin@example.com",
    "password": "password"
  },
  "runkey": "fetch-account-001"
}
```

### 2. Cari akun berdasarkan kode
```json
{
  "variables": {},
  "parameters": {
    "search_term": "1000"
  },
  "configuration": {
    "url": "https://accountingalurkerja.odoo.com/",
    "database": "accountingalurkerja",
    "username": "admin@example.com",
    "password": "password"
  },
  "runkey": "fetch-account-002"
}
```

### 3. Filter berdasarkan tipe akun
```json
{
  "variables": {},
  "parameters": {
    "account_type": "expense",
    "limit": 50
  },
  "configuration": {
    "url": "https://accountingalurkerja.odoo.com/",
    "database": "accountingalurkerja",
    "username": "admin@example.com",
    "password": "password"
  },
  "runkey": "fetch-account-003"
}
```

### 4. Ambil dengan informasi tipe akun
```json
{
  "variables": {},
  "parameters": {
    "include_types_info": true,
    "company_id": 1
  },
  "configuration": {
    "url": "https://accountingalurkerja.odoo.com/",
    "database": "accountingalurkerja",
    "username": "admin@example.com",
    "password": "password"
  },
  "runkey": "fetch-account-004"
}
```
