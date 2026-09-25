# Fetch Odoo Journals

Script untuk mengambil daftar journal dari Odoo berdasarkan company_id.

## Deskripsi

Script ini menggunakan Odoo JSON-RPC API untuk mengambil data journal dari model `account.journal` berdasarkan company_id yang diberikan. Script mendukung filtering berdasarkan tipe journal dan pagination.

## Fitur

- Autentikasi otomatis ke Odoo
- Filter journal berdasarkan company_id (wajib)
- Filter berdasarkan tipe journal (opsional): sale, purchase, cash, bank, general
- Pagination dengan limit dan offset
- Format output yang konsisten
- Error handling yang komprehensif
- Total count untuk keperluan pagination

## Cara Penggunaan

### Command Line

```bash
# Menggunakan file JSON
python fetch_odoo_journals.py --run request.example.json

# Menggunakan JSON string langsung
python fetch_odoo_journals.py --run '{"configuration": {"url": "...", ...}, "parameters": {"company_id": 1, ...}}'
```

### Parameter Input

Script mengikuti format General Action Executor dengan struktur input:

```json
{
  "variables": {},
  "parameters": {
    "company_id": 1,
    "journal_type": "sale",
    "limit": 50,
    "offset": 0
  },
  "configuration": {
    "url": "https://your-odoo-instance.com",
    "database": "your-database",
    "username": "your-username",
    "password": "your-password"
  },
  "runkey": "unique-run-key"
}
```

#### Parameter Wajib

- `company_id` (integer): ID company untuk filter journals

#### Parameter Opsional

- `journal_type` (string): Tipe journal untuk filter
  - Pilihan: `sale`, `purchase`, `cash`, `bank`, `general`
  - Default: semua tipe
- `limit` (integer): Jumlah maksimal record per page
  - Default: 100
- `offset` (integer): Offset untuk pagination
  - Default: 0

### Output

Script mengembalikan data dalam format JSON:

```json
{
  "status": "ok",
  "data": {
    "journals": [
      {
        "id": 1,
        "name": "Customer Invoices",
        "code": "INV",
        "type": "sale",
        "sequence": 5,
        "active": true,
        "company": {
          "id": 1,
          "name": "My Company"
        },
        "currency": {
          "id": 1,
          "name": "USD"
        },
        "default_account": {
          "id": 123,
          "name": "Account Receivable"
        },
        "bank_account_id": false,
        "profit_account_id": false,
        "loss_account_id": false
      }
    ],
    "total_count": 15,
    "current_count": 10,
    "limit": 50,
    "offset": 0,
    "company_id": 1,
    "journal_type": "sale"
  },
  "message": "Successfully fetched 10 of 15 journals for company 1"
}
```

## Contoh Penggunaan

### 1. Mengambil semua journals untuk company ID 1

```bash
python fetch_odoo_journals.py --run '{
  "parameters": {"company_id": 1},
  "configuration": {"url": "...", "database": "...", "username": "...", "password": "..."}
}'
```

### 2. Mengambil hanya journals tipe "sale"

```bash
python fetch_odoo_journals.py --run '{
  "parameters": {"company_id": 1, "journal_type": "sale"},
  "configuration": {"url": "...", "database": "...", "username": "...", "password": "..."}
}'
```

### 3. Pagination - ambil 20 record mulai dari record ke-10

```bash
python fetch_odoo_journals.py --run '{
  "parameters": {"company_id": 1, "limit": 20, "offset": 10},
  "configuration": {"url": "...", "database": "...", "username": "...", "password": "..."}
}'
```

## Error Handling

Script mengembalikan status error dengan informasi detail jika terjadi masalah:

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch journals",
  "error": "Missing required parameter: company_id",
  "traceback": "..."
}
```

## Field Journal yang Dikembalikan

- `id`: ID journal
- `name`: Nama journal
- `code`: Kode journal
- `type`: Tipe journal (sale, purchase, cash, bank, general)
- `sequence`: Urutan journal
- `active`: Status aktif journal
- `company`: Informasi company (id dan name)
- `currency`: Informasi mata uang (jika ada)
- `default_account`: Account default journal
- `bank_account_id`: ID bank account (jika ada)
- `profit_account_id`: ID profit account (jika ada)
- `loss_account_id`: ID loss account (jika ada)

## Dependensi

- Python 3.6+
- requests
- json
- argparse

## Troubleshooting

1. **Authentication Error**: Pastikan URL, database, username, dan password benar
2. **Company Not Found**: Pastikan company_id yang diberikan valid dan exist
3. **Permission Error**: Pastikan user memiliki akses read pada model account.journal
4. **Network Error**: Pastikan koneksi ke server Odoo stabil