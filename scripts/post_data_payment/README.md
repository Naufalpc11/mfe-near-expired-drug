# Post Data Payment Script

Script untuk menyimpan data pembayaran vendor ke sistem Odoo menggunakan REST API.

## Cara Penggunaan

### Menjalankan Script

```bash
python3 post_data_payment.py --run request.example.json
```

atau dengan JSON string langsung:

```bash
python3 post_data_payment.py --run '{"variables":{},"parameters":{"vendor_name":"Test Vendor","amount":"1000000","goods_services":"Jasa Konsultasi","date":"2026-01-21","memo":"Pembayaran konsultasi IT","account_number":"1234567890"},"configuration":{"url":"your-odoo-instance.com","database":"your_database","username":"your_username","password":"your_password"},"runkey":"test-run-001"}'
```

## Flow Proses

1. **Autentikasi** - Login ke sistem Odoo
2. **Pencarian Partner** - Mencari vendor berdasarkan nama
3. **Create Bank Account** - Membuat/update rekening bank partner
4. **Create Payment** - Membuat record pembayaran
5. **Confirm Payment** - Mengkonfirmasi pembayaran

## Input Parameters

### Parameters (dari user)
- `vendor_name`: Nama vendor yang akan dibayar
- `amount`: Jumlah pembayaran
- `goods_services`: Deskripsi barang/jasa
- `date`: Tanggal pembayaran (format: YYYY-MM-DD)
- `memo`: Catatan pembayaran
- `account_number`: Nomor rekening vendor

### Configuration (setup Odoo)
- `url`: URL instance Odoo
- `database`: Nama database Odoo
- `username`: Username untuk login
- `password`: Password untuk login
- `version`: Versi Odoo (opsional)

## Output

Script akan mengembalikan JSON dengan format:

```json
{
  "status": "ok",
  "message": "Payment for [vendor_name] successfully created and confirmed",
  "data": {
    "created_at": "2026-01-21T10:30:00",
    "partner_id": 123,
    "partner_name": "Vendor Name",
    "partner_bank_id": 456,
    "payment_id": 789,
    "amount": 1000000.0,
    "date": "2026-01-21",
    "memo": "Payment memo",
    "account_number": "1234567890",
    "goods_services": "Service description",
    "status": "confirmed"
  },
  "runkey": "unique-run-id"
}
```

## Error Handling

Jika terjadi error, output akan berformat:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "ERROR_CODE",
  "runkey": "unique-run-id"
}
```

## Dependencies

Script memerlukan library Python berikut:
- `requests` - untuk HTTP calls ke Odoo API
- `json` - untuk parsing JSON
- `argparse` - untuk command line arguments
- `datetime` - untuk timestamp

Install dependencies:
```bash
pip install requests
```