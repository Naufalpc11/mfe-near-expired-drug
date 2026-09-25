# Fetch Odoo Partner Script

Script untuk mengambil data partner/vendor dari sistem Odoo menggunakan REST API.

## Cara Penggunaan

### Menjalankan Script

```bash
python3 fetch_odoo_partner.py --run request.example.json
```

atau dengan JSON string langsung:

```bash
python3 fetch_odoo_partner.py --run '{"variables":{},"parameters":{"search_term":"Test","partner_type":"supplier","limit":50,"offset":0,"include_bank_accounts":true},"configuration":{"url":"your-odoo-instance.com","database":"your_database","username":"your_username","password":"your_password"},"runkey":"test-run-001"}'
```

## Flow Proses

1. **Autentikasi** - Login ke sistem Odoo
2. **Pencarian Partner** - Mencari partner berdasarkan kriteria
3. **Format Data** - Format data partner untuk output
4. **Ambil Bank Account** - (Opsional) Ambil informasi rekening bank

## Input Parameters

### Parameters (dari user)
- `search_term`: (Opsional) Nama vendor yang akan dicari (menggunakan partial match)
- `partner_type`: (Opsional) Tipe partner - "supplier" atau "customer" (default: "supplier")
- `limit`: (Opsional) Jumlah maksimal record yang dikembalikan (default: 100)
- `offset`: (Opsional) Offset untuk pagination (default: 0)
- `include_bank_accounts`: (Opsional) Apakah menyertakan informasi rekening bank (default: false)

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
    "partners": [
      {
        "id": 123,
        "name": "Vendor ABC",
        "display_name": "Vendor ABC",
        "email": "vendor@example.com",
        "phone": "+62123456789",
        "mobile": "+62987654321",
        "address": {
          "street": "Jl. Example No. 123",
          "street2": "",
          "city": "Jakarta",
          "state": "DKI Jakarta",
          "zip": "12345",
          "country": "Indonesia"
        },
        "vat": "01.234.567.8-901.000",
        "company_type": "company",
        "is_supplier": true,
        "is_customer": false,
        "website": "https://example.com",
        "notes": "Catatan vendor",
        "create_date": "2025-01-15 10:30:00",
        "write_date": "2026-01-20 14:45:00",
        "bank_accounts": [
          {
            "id": 456,
            "account_number": "1234567890",
            "account_holder": "Vendor ABC",
            "bank_name": "Bank Central Asia"
          }
        ]
      }
    ],
    "total_count": 1,
    "limit": 100,
    "offset": 0,
    "search_term": "Vendor ABC",
    "partner_type": "supplier"
  },
  "message": "Successfully fetched 1 partner(s)"
}
```

Jika terjadi error:

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch partners",
  "error": "Error message here"
}
```

## Fitur

### 1. Pencarian Partner
- **Full-text search**: Cari partner berdasarkan nama (case-insensitive, partial match)
- **Filter by type**: Filter berdasarkan supplier atau customer
- **Pagination**: Support limit dan offset untuk pagination

### 2. Informasi Partner
Data yang dikembalikan meliputi:
- Informasi dasar (ID, nama, email, telepon)
- Alamat lengkap
- NPWP/VAT
- Tipe perusahaan
- Status (supplier/customer)
- Website
- Catatan
- Tanggal pembuatan dan update terakhir

### 3. Bank Accounts (Optional)
Jika `include_bank_accounts` di-set `true`, script akan mengambil:
- Nomor rekening
- Nama pemegang rekening
- Nama bank

## Contoh Penggunaan

### 1. Ambil semua supplier (default 100 records)
```json
{
  "parameters": {},
  "configuration": {...}
}
```

### 2. Cari vendor dengan nama tertentu
```json
{
  "parameters": {
    "search_term": "PT Maju Jaya"
  },
  "configuration": {...}
}
```

### 3. Ambil customer dengan bank account
```json
{
  "parameters": {
    "partner_type": "customer",
    "include_bank_accounts": true
  },
  "configuration": {...}
}
```

### 4. Pagination (ambil 20 record, skip 40 pertama)
```json
{
  "parameters": {
    "limit": 20,
    "offset": 40
  },
  "configuration": {...}
}
```

## Error Handling

Script akan menangani berbagai error:
- Authentication failure
- Network errors
- Invalid configuration
- Search errors
- Bank account fetch errors (jika enabled)

Semua error akan dikembalikan dalam format standard dengan `status: "error"`.
