# Send Telegram Message

Script untuk mengirim pesan Telegram ke private chat berdasarkan email user.

## Deskripsi

Script ini akan:

1. Mengambil email dari variables
2. Mencari chat_id dari database berdasarkan email
3. Mengganti placeholder ${key} di message dengan nilai dari variables
4. Mengirim message ke Telegram private chat

## Input

### Variables

- `email` (required): Email user yang akan dicari chat_id-nya
- `*`: Variable lain yang bisa digunakan sebagai placeholder di message (contoh: `fullName`, `orderNumber`, dll)

### Parameters

- `message` (required): Message template yang akan dikirim. Bisa menggunakan placeholder `${variableName}` yang akan diganti dengan value dari variables

### Configuration

- `db_host` (required): PostgreSQL host
- `db_port` (optional): PostgreSQL port (default: 5432)
- `db_name` (required): Database name
- `db_user` (required): Database user
- `db_password` (required): Database password
- `bot_token` (required): Telegram bot token

## Output

### Success Response

```json
{
    "status": "success",
    "message": "Message sent successfully to user@example.com",
    "data": {
        "email": "user@example.com",
        "chat_id": "123456789",
        "message": "Hello John Doe!\n\nYour order ORD-12345 has been Completed.",
        "telegram_response": {
            "ok": true,
            "result": {...}
        }
    },
    "runkey": "test-run-001"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "No chat_id found for email: user@example.com",
  "data": {
    "email": "user@example.com",
    "found": false
  },
  "runkey": "test-run-001"
}
```

## Testing

```bash
# Test dengan example file
python3 send_telegram_message.py --run request.example.json

# Test dengan JSON string
python3 send_telegram_message.py --run '{"variables":{"email":"user@example.com","fullName":"John"},"parameters":{"message":"Hello ${fullName}!"},"configuration":{"db_host":"localhost","db_name":"testdb","db_user":"user","db_password":"pass","telegram_token":"token"},"runkey":"test-123"}'
```

## Requirements

- Python 3.x
- psycopg2
- requests

Install dependencies:

```bash
pip install psycopg2-binary requests
```

## Database Schema

Script ini mengasumsikan table `telegram_account` dengan struktur:

- `email` (varchar): Email user
- `chat_id` (varchar/bigint): Telegram chat ID

## Message Placeholder

Message dapat menggunakan placeholder yang akan diganti dengan nilai dari variables:

- `${fullName}` → Diganti dengan value dari `variables.fullName`
- `${orderNumber}` → Diganti dengan value dari `variables.orderNumber`
- dll.

Contoh:

```
Message template: "Hello ${fullName}! Your order ${orderNumber} is ${status}."
Variables: {"fullName": "John", "orderNumber": "ORD-123", "status": "Ready"}
Result: "Hello John! Your order ORD-123 is Ready."
```

## Error Handling

Script akan return error jika:

- Email tidak ditemukan di variables
- Message tidak ditemukan di parameters
- Bot token tidak ditemukan di configuration
- Database configuration tidak lengkap
- Chat_id tidak ditemukan untuk email tersebut
- Gagal mengirim message ke Telegram
