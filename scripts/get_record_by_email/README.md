# Get Record By Email Script

Script untuk mengambil record dari table `telegram_account` berdasarkan email.

## Usage

```bash
python3 get_record_by_email.py --run request.example.json
```

## Input Parameters

- `email` (required): Email yang akan dicari di database

## Configuration

Script ini menggunakan database configuration yang sama dengan action lain:

- `db_host`: PostgreSQL host
- `db_port`: PostgreSQL port
- `db_name`: Database name
- `db_user`: Database user
- `db_password`: Database password

## Output

Success (record found):

```json
{
  "status": "success",
  "message": "Record found for email: user@example.com",
  "data": {
    "email": "user@example.com",
    "record": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      ...
    },
    "found": true
  },
  "runkey": "test-run-002"
}
```

Success (no record found):

```json
{
  "status": "success",
  "message": "No record found for email: user@example.com",
  "data": {
    "email": "user@example.com",
    "record": null,
    "found": false
  },
  "runkey": "test-run-002"
}
```

Error:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "runkey": "test-run-002"
}
```
