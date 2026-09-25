# Fetch Odoo Job Position API Specification

## Overview

API untuk mengambil data job position dari sistem Odoo.

## Endpoint Type

**SCRIPT** - Executed via Python script

## Input Schema

### Request Structure

```json
{
  "variables": {},
  "parameters": {
    "search_term": "string (optional)",
    "department": "string (optional)",
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

| Parameter   | Type   | Required | Default | Description                                                         |
| ----------- | ------ | -------- | ------- | ------------------------------------------------------------------- |
| search_term | string | No       | null    | Nama job position untuk pencarian (partial match, case-insensitive) |
| department  | string | No       | null    | Filter berdasarkan department                                       |
| limit       | number | No       | 100     | Jumlah maksimal record yang dikembalikan                            |
| offset      | number | No       | 0       | Offset untuk pagination                                             |

### Configuration Description

| Field    | Type   | Required | Description                                       |
| -------- | ------ | -------- | ------------------------------------------------- |
| url      | string | Yes      | URL instance Odoo (e.g., "https://your-odoo.com") |
| database | string | Yes      | Nama database Odoo                                |
| username | string | Yes      | Username untuk autentikasi                        |
| password | string | Yes      | Password untuk autentikasi                        |

## Output Schema

### Success Response

```json
{
  "status": "ok",
  "data": [
    {
      "id": 1,
      "display_name": "Software Developer"
    },
    {
      "id": 2,
      "display_name": "Project Manager"
    }
  ],
  "total_count": 2,
  "limit": 100,
  "offset": 0,
  "search_term": null,
  "department": null,
  "message": "Successfully fetched 2 job position(s)"
}
```

### Error Response

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch job positions",
  "error": "Login failed: Invalid credentials",
  "traceback": "..."
}
```

## Usage Examples

### Basic Search

```json
{
  "variables": {},
  "parameters": {
    "search_term": "developer",
    "limit": 50
  },
  "configuration": {
    "url": "https://your-odoo.com",
    "database": "your-database",
    "username": "admin",
    "password": "admin-password"
  },
  "runkey": "fetch-job-position-example-001"
}
```

### Department Filter

```json
{
  "variables": {},
  "parameters": {
    "department": "IT",
    "limit": 20
  },
  "configuration": {
    "url": "https://your-odoo.com",
    "database": "your-database",
    "username": "admin",
    "password": "admin-password"
  },
  "runkey": "fetch-job-position-example-002"
}
```

### Pagination

```json
{
  "variables": {},
  "parameters": {
    "limit": 25,
    "offset": 50
  },
  "configuration": {
    "url": "https://your-odoo.com",
    "database": "your-database",
    "username": "admin",
    "password": "admin-password"
  },
  "runkey": "fetch-job-position-example-003"
}
```

## Error Codes

| Code              | Message                        | Description                               |
| ----------------- | ------------------------------ | ----------------------------------------- |
| AUTH_FAILED       | Login failed                   | Invalid credentials atau connection error |
| MISSING_CONFIG    | Missing required configuration | Field konfigurasi wajib tidak diisi       |
| SEARCH_FAILED     | Search failed                  | Error saat mencari job position           |
| PERMISSION_DENIED | Permission denied              | User tidak memiliki akses ke model hr.job |

## Notes

1. **Performance**: Script menggunakan `name_search` method untuk pencarian yang efisien
2. **Security**: Script memerlukan user dengan akses read ke model `hr.job`
3. **Pagination**: Gunakan `limit` dan `offset` untuk handling large dataset
4. **Search**: Parameter `search_term` melakukan pencarian pada field `name` dengan operator `ilike`

## Testing

### Command Line Test

```bash
cd scripts/fetch_odoo_job_position
python3 fetch_odoo_job_position.py --run request.example.json
```

### Direct JSON Test

```bash
python3 fetch_odoo_job_position.py --run '{"variables":{},"parameters":{"search_term":"manager","limit":10},"configuration":{"url":"https://odoo.example.com","database":"production","username":"admin","password":"password"},"runkey":"test-001"}'
```
