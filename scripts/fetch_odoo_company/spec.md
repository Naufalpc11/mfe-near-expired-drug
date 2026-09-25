# Fetch Odoo Company API Specification

## Overview
API untuk mengambil data company dari sistem Odoo.

## Endpoint Type
**SCRIPT** - Executed via Python script

## Input Schema

### Request Structure
```json
{
  "variables": {},
  "parameters": {
    "search_term": "string (optional)",
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
| search_term | string | No | null | Nama company untuk pencarian (partial match, case-insensitive) |
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
    "companies": [
      {
        "id": "number",
        "display_name": "string"
      }
    ],
    "total_count": "number",
    "limit": "number",
    "offset": "number",
    "search_term": "string|null"
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

### Company Object

| Field | Type | Description |
|-------|------|-------------|
| id | number | ID unik company di Odoo |
| display_name | string | Nama display company |

## Business Logic

### 1. Authentication Flow
1. Script melakukan autentikasi ke Odoo menggunakan kredensial dari configuration
2. Mendapatkan session cookies untuk request selanjutnya
3. Mengekstrak UID untuk verifikasi login berhasil

### 2. Company Search Flow
1. Build filter berdasarkan parameters (search term jika ada)
2. Execute name_search di model res.company
3. Apply limit dan offset untuk pagination
4. Return results dengan id dan display_name

### 3. Data Formatting
1. Extract id dan display_name dari hasil search
2. Handle format response yang bisa berupa list atau dict
3. Return data dalam format standard

## Use Cases

### Use Case 1: List All Companies
**Scenario**: Menampilkan daftar semua company tanpa filter
```json
{
  "parameters": {},
  "configuration": {...}
}
```

### Use Case 2: Search Specific Company
**Scenario**: Mencari company dengan nama tertentu
```json
{
  "parameters": {
    "search_term": "My Company"
  },
  "configuration": {...}
}
```

### Use Case 3: Paginated Results
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
1. **res.company** - Main company model
   - Method: name_search
   - Returns: [[id, display_name], ...]

### Odoo API Endpoints
1. `/web/session/authenticate` - Authentication
2. `/web/dataset/call_kw/res.company/name_search` - Company search

## Performance Considerations

1. **Pagination**: Use limit dan offset untuk menghindari loading terlalu banyak data
2. **Caching**: Session cookies di-cache untuk efisiensi
3. **Simple Query**: name_search adalah method paling efisien untuk list data

## Security Considerations

1. **Credentials**: Password di-transmit via HTTPS
2. **Session Management**: Session cookies untuk autentikasi request
3. **Input Validation**: Validate required configuration fields
4. **Error Messages**: Tidak expose sensitive information di error messages
