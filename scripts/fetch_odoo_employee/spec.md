# Fetch Odoo Employee API Specification

## Overview
API untuk mengambil data employee dari sistem Odoo.

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

### Output Schema

```json
{
  "status": "ok",
  "data": [
    { "id": 1, "display_name": "John Doe" }
  ],
  "total_count": 1,
  "limit": 100,
  "offset": 0,
  "search_term": null,
  "message": "Successfully fetched 1 employee(s)"
}
```

## Business Logic
- Autentikasi ke Odoo
- Query model `hr.employee` dengan method `name_search`
- Return id dan display_name
- Support search, limit, offset
- Error handling standard
