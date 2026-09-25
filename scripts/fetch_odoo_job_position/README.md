# Fetch Odoo Job Position Script

Script untuk mengambil data job position dari sistem Odoo ERP.

## Overview

Script ini mengikuti **General Action Executor contract** dan dapat:

- Mengambil daftar job position dari Odoo (model hr.job)
- Melakukan pencarian berdasarkan nama job position
- Filter berdasarkan department
- Mendukung pagination
- Mengembalikan data dalam format JSON standar

## Files

- `fetch_odoo_job_position.py` - Main script file
- `spec.md` - API specification lengkap
- `request.example.json` - Contoh request untuk testing
- `README.md` - Dokumentasi ini

## Quick Usage

### Basic Usage

```bash
python3 fetch_odoo_job_position.py --run request.example.json
```

### With JSON String

```bash
python3 fetch_odoo_job_position.py --run '{"variables":{},"parameters":{"search_term":"developer"},"configuration":{"url":"https://your-odoo.com","database":"your-db","username":"admin","password":"password"},"runkey":"test-001"}'
```

## Input Parameters

| Parameter   | Type   | Default | Description                       |
| ----------- | ------ | ------- | --------------------------------- |
| search_term | string | null    | Nama job position untuk pencarian |
| department  | string | null    | Filter berdasarkan department     |
| limit       | number | 100     | Maksimal record dikembalikan      |
| offset      | number | 0       | Offset untuk pagination           |

## Configuration Required

```json
{
  "url": "https://your-odoo-instance.com",
  "database": "your-database-name",
  "username": "your-username",
  "password": "your-password"
}
```

## Response Format

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
  "search_term": "",
  "department": "",
  "message": "Successfully fetched 2 job position(s)"
}
```

### Error Response

```json
{
  "status": "error",
  "data": {},
  "message": "Failed to fetch job positions",
  "error": "Error details",
  "traceback": "..."
}
```

## Testing

### 1. Test with Example File

```bash
cd scripts/fetch_odoo_job_position
python3 fetch_odoo_job_position.py --run request.example.json
```

### 2. Test Search Function

```bash
python3 fetch_odoo_job_position.py --run '{"variables":{},"parameters":{"search_term":"manager","limit":10},"configuration":{"url":"https://your-odoo.com","database":"your-db","username":"admin","password":"password"},"runkey":"test-search"}'
```

### 3. Test Department Filter

```bash
python3 fetch_odoo_job_position.py --run '{"variables":{},"parameters":{"department":"IT","limit":20},"configuration":{"url":"https://your-odoo.com","database":"your-db","username":"admin","password":"password"},"runkey":"test-department"}'
```

## Common Use Cases

### 1. Get All Job Positions

```json
{
  "parameters": {
    "limit": 100
  }
}
```

### 2. Search Developer Positions

```json
{
  "parameters": {
    "search_term": "developer",
    "limit": 50
  }
}
```

### 3. Get IT Department Positions

```json
{
  "parameters": {
    "department": "IT",
    "limit": 25
  }
}
```

### 4. Pagination Example

```json
{
  "parameters": {
    "limit": 20,
    "offset": 40
  }
}
```

## Error Handling

Script akan return status `error` dengan informasi detail jika:

- Credentials Odoo salah
- Database tidak ditemukan
- Network connection error
- Permission denied untuk akses model `hr.job`
- Invalid input parameters

## Dependencies

- Python 3.6+
- `requests` library
- Access ke Odoo instance dengan permission read pada `hr.job` model

## Performance Notes

- **Basic Search**: Fast, menggunakan Odoo name_search
- **Large Dataset**: Gunakan pagination dengan limit/offset
- **Network**: Response time tergantung koneksi ke Odoo instance

## Integration Examples

### Alurkerja Platform

Script ini dapat dipanggil dari Alurkerja platform sebagai action:

```json
{
  "action": "fetch_odoo_job_position",
  "parameters": {
    "search_term": "manager",
    "department": "Sales"
  }
}
```

### Workflow Integration

Dapat digunakan dalam workflow untuk:

- Job position validation
- Employee assignment
- Recruitment automation
- Organizational chart building

## Security Considerations

1. **Credentials**: Jangan hardcode credentials dalam code
2. **Permissions**: User harus memiliki read access ke hr.job
3. **Network**: Gunakan HTTPS untuk komunikasi dengan Odoo
4. **Data**: Handle job position information securely

## Troubleshooting

### Common Issues

1. **Login Failed**
   - Check credentials
   - Verify database name
   - Ensure Odoo instance accessible

2. **Permission Denied**
   - User needs read access to hr.job model
   - Check user groups and permissions

3. **Empty Results**
   - Check search_term spelling
   - Verify department name exists
   - Try without filters first

4. **Timeout Errors**
   - Reduce limit parameter
   - Check network connection
   - Verify Odoo instance performance

## Support

For issues or questions:

- Check `spec.md` for complete API documentation
- Review error messages in response
- Verify Odoo instance and permissions
- Test with minimal parameters first
