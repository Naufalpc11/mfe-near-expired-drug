# Fetch Odoo Partner API Specification

## Overview
API untuk mengambil data partner/vendor dari sistem Odoo.

## Endpoint Type
**SCRIPT** - Executed via Python script

## Input Schema

### Request Structure
```json
{
  "variables": {},
  "parameters": {
    "search_term": "string (optional)",
    "partner_type": "supplier|customer (optional, default: supplier)",
    "limit": "number (optional, default: 100)",
    "offset": "number (optional, default: 0)",
    "include_bank_accounts": "boolean (optional, default: false)"
  },
  "configuration": {
    "url": "string (required)",
    "database": "string (required)",
    "username": "string (required)",
    "password": "string (required)"
  },
  "runkey": "string (required)"
}
```

### Parameters Description

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search_term | string | No | null | Nama partner untuk pencarian (partial match, case-insensitive) |
| partner_type | string | No | "supplier" | Tipe partner: "supplier" atau "customer" |
| limit | number | No | 100 | Jumlah maksimal record yang dikembalikan |
| offset | number | No | 0 | Offset untuk pagination |
| include_bank_accounts | boolean | No | false | Apakah menyertakan informasi rekening bank |

### Configuration Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | URL instance Odoo (e.g., "https://your-odoo.com") |
| database | string | Yes | Nama database Odoo |
| username | string | Yes | Username untuk autentikasi |
| password | string | Yes | Password untuk autentikasi |

## Output Schema

### Success Response
```json
{
  "status": "ok",
  "data": {
    "partners": [
      {
        "id": "number",
        "name": "string",
        "display_name": "string",
        "email": "string",
        "phone": "string",
        "mobile": "string",
        "address": {
          "street": "string",
          "street2": "string",
          "city": "string",
          "state": "string",
          "zip": "string",
          "country": "string"
        },
        "vat": "string",
        "company_type": "company|person",
        "is_supplier": "boolean",
        "is_customer": "boolean",
        "website": "string",
        "notes": "string",
        "create_date": "string (ISO datetime)",
        "write_date": "string (ISO datetime)",
        "bank_accounts": [
          {
            "id": "number",
            "account_number": "string",
            "account_holder": "string",
            "bank_name": "string"
          }
        ]
      }
    ],
    "total_count": "number",
    "limit": "number",
    "offset": "number",
    "search_term": "string|null",
    "partner_type": "string"
  },
  "message": "string"
}
```

### Error Response
```json
{
  "status": "error",
  "data": {},
  "message": "string",
  "error": "string"
}
```

## Response Fields Description

### Partner Object

| Field | Type | Description |
|-------|------|-------------|
| id | number | ID unik partner di Odoo |
| name | string | Nama partner |
| display_name | string | Nama display partner |
| email | string | Email address |
| phone | string | Nomor telepon |
| mobile | string | Nomor mobile |
| address | object | Objek berisi informasi alamat lengkap |
| vat | string | NPWP atau Tax ID |
| company_type | string | Tipe entitas: "company" atau "person" |
| is_supplier | boolean | Apakah partner adalah supplier |
| is_customer | boolean | Apakah partner adalah customer |
| website | string | Website URL |
| notes | string | Catatan internal |
| create_date | string | Tanggal pembuatan record |
| write_date | string | Tanggal update terakhir |
| bank_accounts | array | Array berisi informasi rekening bank (jika include_bank_accounts=true) |

### Bank Account Object

| Field | Type | Description |
|-------|------|-------------|
| id | number | ID rekening bank di Odoo |
| account_number | string | Nomor rekening |
| account_holder | string | Nama pemegang rekening |
| bank_name | string | Nama bank |

## Business Logic

### 1. Authentication Flow
1. Script melakukan autentikasi ke Odoo menggunakan kredensial dari configuration
2. Mendapatkan session cookies untuk request selanjutnya
3. Mengekstrak UID untuk verifikasi login berhasil

### 2. Partner Search Flow
1. Build domain filter berdasarkan parameters:
   - Default: filter supplier (supplier_rank > 0)
   - Jika partner_type="customer": filter customer (customer_rank > 0)
   - Jika search_term disediakan: tambahkan filter nama (case-insensitive, partial match)
2. Execute search_read di model res.partner
3. Apply limit dan offset untuk pagination
4. Order results by name (ascending)

### 3. Bank Account Fetch (Optional)
Jika include_bank_accounts = true:
1. Untuk setiap partner, query model res.partner.bank
2. Filter by partner_id
3. Ambil informasi rekening: nomor, pemegang, nama bank
4. Tambahkan ke data partner

### 4. Data Formatting
1. Extract dan format field-field yang diperlukan
2. Handle null values dengan default empty string
3. Format relational fields (state_id, country_id) untuk menampilkan nama
4. Struktur address dalam nested object
5. Add computed fields (is_supplier, is_customer)

## Use Cases

### Use Case 1: List All Suppliers
**Scenario**: Menampilkan daftar semua supplier tanpa filter
```json
{
  "parameters": {},
  "configuration": {...}
}
```

### Use Case 2: Search Specific Vendor
**Scenario**: Mencari vendor dengan nama tertentu
```json
{
  "parameters": {
    "search_term": "PT Maju Jaya"
  },
  "configuration": {...}
}
```

### Use Case 3: Get Customer List with Bank Details
**Scenario**: Ambil daftar customer lengkap dengan informasi rekening
```json
{
  "parameters": {
    "partner_type": "customer",
    "include_bank_accounts": true
  },
  "configuration": {...}
}
```

### Use Case 4: Paginated Results
**Scenario**: Load data dengan pagination (20 per halaman)
```json
{
  "parameters": {
    "limit": 20,
    "offset": 0
  },
  "configuration": {...}
}
```

## Error Scenarios

| Error Type | Condition | Response |
|------------|-----------|----------|
| Authentication Failed | Invalid credentials | status: "error", error: "Login failed: ..." |
| Missing Configuration | Required config field missing | status: "error", error: "Missing required configuration: ..." |
| Network Error | Cannot reach Odoo server | status: "error", error: "Connection error..." |
| Search Failed | Odoo API error during search | status: "error", error: "Search failed: ..." |
| Invalid JSON | Input JSON malformed | status: "error", error: "Failed to process input" |

## Integration Points

### Odoo Models Used
1. **res.partner** - Main partner/vendor model
   - Fields: name, email, phone, address, vat, etc.
   - Domain filters: supplier_rank, customer_rank

2. **res.partner.bank** - Bank account information
   - Fields: acc_number, acc_holder_name, bank_id, bank_name
   - Relation: partner_id → res.partner

### Odoo API Endpoints
1. `/web/session/authenticate` - Authentication
2. `/web/dataset/call_kw` - Model operations (search_read)

## Performance Considerations

1. **Pagination**: Use limit dan offset untuk menghindari loading terlalu banyak data
2. **Bank Accounts**: Include bank accounts hanya jika diperlukan (additional queries)
3. **Field Selection**: Script sudah optimize field selection untuk performa
4. **Caching**: Session cookies di-cache untuk efisiensi

## Security Considerations

1. **Credentials**: Password di-transmit via HTTPS
2. **Session Management**: Session cookies untuk autentikasi request
3. **Input Validation**: Validate required configuration fields
4. **Error Messages**: Tidak expose sensitive information di error messages
