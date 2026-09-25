# Send Telegram Reminder Script

Script untuk mengirim reminder melalui Telegram kepada user yang belum memesan makan siang hari ini.

## Deskripsi

Script ini akan:
1. Mengambil data user yang sudah order makan hari ini dari database (`lunch_data`)
2. Mengambil semua user terdaftar di Telegram dari database (`telegram_account`)
3. Membandingkan dan mencari user yang belum order
4. Mengirim pesan reminder via Telegram Bot API ke masing-masing chat_id

## Dependencies

```bash
pip install requests psycopg2-binary
```

## Parameters

### Input Parameters (dari `parameters`)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message_template` | string | No | "Halo {email}, aku lihat kamu belum pesan makan siang untuk hari ini. Apakah Kamu mau pesan makan siang untuk hari ini?" | Template pesan yang akan dikirim. Gunakan `{email}` sebagai placeholder untuk email user. |

### Configuration (dari `configuration`)

| Config | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `db_host` | string | No | "localhost" | Database host |
| `db_port` | integer | No | 5432 | Database port |
| `db_name` | string | **Yes** | - | Nama database |
| `db_user` | string | **Yes** | - | Database username |
| `db_password` | string | **Yes** | - | Database password |
| `telegram_token` | string | **Yes** | - | Telegram bot token |
| `lunch_table` | string | No | "lunch_data" | Nama tabel lunch data |
| `lunch_email_column` | string | No | "email" | Nama kolom email di lunch_data |
| `lunch_date_column` | string | No | "order_date" | Nama kolom tanggal order |
| `telegram_table` | string | No | "telegram_account" | Nama tabel telegram account |
| `telegram_email_column` | string | No | "email" | Nama kolom email di telegram_account |
| `telegram_chat_id_column` | string | No | "chat_id" | Nama kolom chat_id |

## Database Schema

### Table: lunch_data
```sql
CREATE TABLE lunch_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    order_date DATETIME NOT NULL,
    -- kolom lainnya...
);
```

### Table: telegram_account
```sql
CREATE TABLE telegram_account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    -- kolom lainnya...
);
```

## Cara Testing

### 1. Test dengan Example File

```bash
python3 send_reminder.py --run request.example.json
```

### 2. Test dengan JSON String

```bash
python3 send_reminder.py --run '{"parameters":{"message_template":"Test message"},"configuration":{"db_name":"test_db","db_user":"user","db_password":"pass","telegram_token":"token"},"runkey":"test-001"}'
```

## Output Example

### Success Response

```json
{
  "status": "ok",
  "message": "Reminder sent to 5 users, 0 failed",
  "data": {
    "total_telegram_users": 10,
    "users_already_ordered": 5,
    "users_reminded": 5,
    "success_count": 5,
    "failed_count": 0,
    "results": [
      {
        "success": true,
        "chat_id": "123456789",
        "message": "Message sent successfully",
        "email": "user1@example.com"
      }
    ],
    "timestamp": "2026-01-30T10:00:00"
  },
  "runkey": "test-reminder-001"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error executing reminder script: Missing required configuration: telegram_token",
  "error": "EXECUTION_ERROR",
  "runkey": "test-reminder-001"
}
```

## Telegram Bot Setup

1. Buat bot baru melalui [@BotFather](https://t.me/botfather)
2. Gunakan command `/newbot` dan ikuti instruksi
3. Simpan bot token yang diberikan
4. Tambahkan bot token ke configuration

## Mendapatkan Chat ID

User dapat mendapatkan chat_id mereka dengan:
1. Kirim pesan ke bot
2. Akses URL: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
3. Cari field `chat.id` dari response

## Security Notes

- **JANGAN** commit bot token ke repository
- Simpan bot token di environment variable atau secret management
- Gunakan database credentials yang aman
- Batasi akses database hanya untuk read-only jika memungkinkan

## Troubleshooting

### Error: Missing required configuration
- Pastikan semua konfigurasi required sudah diisi
- Check `db_name`, `db_user`, `db_password`, `telegram_token`

### Error: Database connection failed
- Verify database credentials
- Check database host dan port
- Pastikan database server running

### Error: Telegram API error
- Verify bot token valid
- Check chat_id format (harus string)
- Pastikan bot tidak di-block oleh user

### No messages sent
- Check apakah ada user yang belum order
- Verify query database mengambil data dengan benar
- Check tanggal hari ini sesuai dengan timezone database
