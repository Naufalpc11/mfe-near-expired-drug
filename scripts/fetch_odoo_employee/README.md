# Fetch Odoo Employee Script

Script untuk mengambil data employee dari sistem Odoo menggunakan REST API.

## Cara Penggunaan

### Menjalankan Script

```bash
python3 fetch_odoo_employee.py --run request.example.json
```

atau dengan JSON string langsung:

```bash
python3 fetch_odoo_employee.py --run '{"variables":{},"parameters":{"search_term":"John","limit":50},"configuration":{"url":"your-odoo-instance.com","database":"your_database","username":"your_username","password":"your_password"},"runkey":"test-run-001"}'
```

## Input Parameters

- `search_term`: (Opsional) Nama employee yang akan dicari (partial match)
- `limit`: (Opsional) Jumlah maksimal record yang dikembalikan (default: 100)
- `offset`: (Opsional) Offset untuk pagination (default: 0)

## Output

Script akan mengembalikan JSON dengan format:

```json
{
  "status": "ok",
  "data": [
    { "id": 1, "display_name": "John Doe" },
    { "id": 2, "display_name": "Jane Smith" }
  ],
  "total_count": 2,
  "limit": 100,
  "offset": 0,
  "search_term": null,
  "message": "Successfully fetched 2 employee(s)"
}
```

Jika terjadi error:

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch employees",
  "error": "Error message here"
}
```
