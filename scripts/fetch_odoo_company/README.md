# Fetch Odoo Company Script

Script untuk mengambil data company dari sistem Odoo menggunakan REST API.

## Cara Penggunaan

### Menjalankan Script

```bash
python3 fetch_odoo_company.py --run request.example.json
```

atau dengan JSON string langsung:

```bash
python3 fetch_odoo_company.py --run '{"variables":{},"parameters":{"search_term":"My Company","limit":50},"configuration":{"url":"your-odoo-instance.com","database":"your_database","username":"your_username","password":"your_password"},"runkey":"test-run-001"}'
```

## Flow Proses

1. **Autentikasi** - Login ke sistem Odoo
2. **Pencarian Company** - Mencari company berdasarkan kriteria
3. **Format Data** - Format data company untuk output

## Input Parameters

### Parameters (dari user)
- `search_term`: (Opsional) Nama company yang akan dicari (menggunakan partial match)
- `limit`: (Opsional) Jumlah maksimal record yang dikembalikan (default: 100)
- `offset`: (Opsional) Offset untuk pagination (default: 0)

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
    "companies": [
      {
        "id": 1,
        "display_name": "My Company"
      },
      {
        "id": 2,
        "display_name": "Another Company"
      }
    ],
    "total_count": 2,
    "limit": 100,
    "offset": 0,
    "search_term": null
  },
  "message": "Successfully fetched 2 companies"
}
```

Jika terjadi error:

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch companies",
  "error": "Error message here"
}
```

## Fitur

### 1. Pencarian Company
- **Full-text search**: Cari company berdasarkan nama (case-insensitive, partial match)
- **Pagination**: Support limit dan offset untuk pagination

### 2. Informasi Company
Data yang dikembalikan meliputi:
- ID unik company di Odoo
- Display name (nama tampilan company)

## Contoh Penggunaan

### 1. Ambil semua companies (default 100 records)
```json
{
  "parameters": {},
  "configuration": {...}
}
```

### 2. Cari company dengan nama tertentu
```json
{
  "parameters": {
    "search_term": "My Company"
  },
  "configuration": {...}
}
```

### 3. Pagination (ambil 20 record, skip 40 pertama)
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

Semua error akan dikembalikan dalam format standard dengan `status: "error"`.
