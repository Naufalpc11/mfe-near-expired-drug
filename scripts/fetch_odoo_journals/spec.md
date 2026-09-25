# Fetch Odoo Journals API Specification

## Overview
API untuk mengambil daftar journal dari sistem Odoo berdasarkan company_id.

## Endpoint Type
**SCRIPT** - Executed via Python script

## Input Schema

### Request Structure
```json
{
  "variables": {},
  "parameters": {
    "company_id": "number (required)",
    "journal_type": "string (optional)",
    "limit": "number (optional, default: 100)",
    "offset": "number (optional, default: 0)"
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
| company_id | number | Yes | - | ID company untuk filter journals |
| journal_type | string | No | null | Tipe journal untuk filter. Valid values: 'sale', 'purchase', 'cash', 'bank', 'general' |
| limit | number | No | 100 | Jumlah maksimal record yang dikembalikan |
| offset | number | No | 0 | Offset untuk pagination |

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
    "journals": [
      {
        "id": "number",
        "name": "string",
        "code": "string", 
        "type": "string",
        "sequence": "number",
        "active": "boolean",
        "company": {
          "id": "number",
          "name": "string"
        },
        "currency": {
          "id": "number",
          "name": "string"
        } | null,
        "default_account": {
          "id": "number", 
          "name": "string"
        } | null,
        "bank_account_id": "number" | false,
        "profit_account_id": "number" | false,
        "loss_account_id": "number" | false
      }
    ],
    "total_count": "number",
    "current_count": "number", 
    "limit": "number",
    "offset": "number",
    "company_id": "number",
    "journal_type": "string" | null
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
  "error": "string",
  "traceback": "string"
}
```

## Response Fields Description

### Success Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Always "ok" for successful requests |
| data.journals | array | Array of journal objects |
| data.total_count | number | Total jumlah journals yang sesuai filter |
| data.current_count | number | Jumlah journals dalam response saat ini |
| data.limit | number | Limit yang digunakan untuk pagination |
| data.offset | number | Offset yang digunakan untuk pagination |
| data.company_id | number | Company ID yang digunakan untuk filter |
| data.journal_type | string/null | Journal type yang digunakan untuk filter |
| message | string | Descriptive success message |

### Journal Object Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier journal |
| name | string | Nama journal |
| code | string | Kode journal |
| type | string | Tipe journal (sale/purchase/cash/bank/general) |
| sequence | number | Urutan journal |
| active | boolean | Status aktif journal |
| company.id | number | ID company pemilik journal |
| company.name | string | Nama company pemilik journal |
| currency.id | number | ID mata uang journal (nullable) |
| currency.name | string | Nama mata uang journal (nullable) |
| default_account.id | number | ID default account journal (nullable) |
| default_account.name | string | Nama default account journal (nullable) |
| bank_account_id | number/false | ID bank account yang terkait |
| profit_account_id | number/false | ID profit account yang terkait |
| loss_account_id | number/false | ID loss account yang terkait |

### Error Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Always "error" for failed requests |
| data | object | Empty object |
| message | string | Human-readable error description |
| error | string | Technical error message |
| traceback | string | Full error traceback for debugging |

## Examples

### Example 1: Fetch All Journals for Company
```json
{
  "variables": {},
  "parameters": {
    "company_id": 1
  },
  "configuration": {
    "url": "https://demo.odoo.com",
    "database": "demo",
    "username": "admin",
    "password": "admin"
  },
  "runkey": "fetch-all-journals-001"
}
```

### Example 2: Fetch Sales Journals Only
```json
{
  "variables": {},
  "parameters": {
    "company_id": 1,
    "journal_type": "sale",
    "limit": 10
  },
  "configuration": {
    "url": "https://demo.odoo.com",
    "database": "demo", 
    "username": "admin",
    "password": "admin"
  },
  "runkey": "fetch-sale-journals-001"
}
```

### Example 3: Paginated Request
```json
{
  "variables": {},
  "parameters": {
    "company_id": 1,
    "limit": 20,
    "offset": 40
  },
  "configuration": {
    "url": "https://demo.odoo.com",
    "database": "demo",
    "username": "admin", 
    "password": "admin"
  },
  "runkey": "fetch-journals-page-3-001"
}
```

## Error Cases

### Missing Required Parameters
```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch journals",
  "error": "Missing required parameter: company_id"
}
```

### Invalid Journal Type
```json
{
  "status": "error", 
  "data": {},
  "message": "Failed to fetch journals",
  "error": "Invalid journal_type. Must be one of: sale, purchase, cash, bank, general"
}
```

### Authentication Failed
```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch journals", 
  "error": "Login failed: Invalid username or password"
}
```

### Company Not Found
```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch journals",
  "error": "Company with ID 999 not found or access denied"
}
```

## Usage Notes

1. **Company ID adalah parameter wajib** - Script tidak akan berjalan tanpa company_id
2. **Journal Type Validation** - Hanya nilai yang valid yang diterima (sale, purchase, cash, bank, general)
3. **Pagination Support** - Gunakan limit dan offset untuk mengambil data dalam batch
4. **Total Count** - Response selalu menyertakan total_count untuk keperluan pagination UI
5. **Relational Data** - Field yang berupa relasi (company, currency, dll) dikembalikan sebagai object dengan id dan name
6. **Active Records Only** - Script mengambil semua records (active dan inactive), gunakan field 'active' untuk filtering di aplikasi

## Security Considerations

1. **Credential Protection** - Jangan simpan credentials dalam kode
2. **Access Control** - User harus memiliki read access pada model account.journal
3. **Company Access** - User harus memiliki akses ke company yang diminta
4. **Rate Limiting** - Implementasikan rate limiting jika digunakan dalam production

## Performance Notes

1. **Indexing** - Pastikan field company_id dan type memiliki database index
2. **Large Datasets** - Untuk company dengan banyak journals, gunakan pagination
3. **Network** - Response time bergantung pada koneksi ke server Odoo
4. **Caching** - Pertimbangkan caching untuk data yang jarang berubah