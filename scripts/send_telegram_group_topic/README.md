# Send Telegram Group Topic Message

Script untuk mengirim pesan Telegram ke topik/thread tertentu di dalam group chat (Telegram Forum Groups).

## Deskripsi

Script ini akan:

1. Mengambil `group_name` dari variables → mencari `chat_id` di `vanya_group_chat`
2. Mengambil `topic_id` (`message_thread_id`) dari variables
3. Mengganti placeholder `${key}` di message dengan nilai dari variables
4. Mengirim message ke topik tertentu via Telegram Bot API menggunakan `message_thread_id`

> **Catatan:** Fitur ini hanya bekerja pada Telegram Supergroup yang mengaktifkan mode **Forum/Topics**.

## Input

### Variables

| Key | Wajib | Keterangan |
|---|---|---|
| `group_name` | Ya | Nama group sesuai `group_title` di `vanya_group_chat` |
| `topic_id` | Ya | `message_thread_id` dari topik Telegram (integer) |
| `*` | Tidak | Variable lain sebagai placeholder di message |

### Parameters

| Key | Wajib | Keterangan |
|---|---|---|
| `group_name` | Tidak | Key pada variables yang berisi nama group (default: `"group_name"`) |
| `topic_id` | Tidak | Key pada variables yang berisi topic ID (default: `"topic_id"`) |
| `message` | Ya | Template pesan. Gunakan `${variableName}` sebagai placeholder |

### Configuration

| Key | Wajib | Keterangan |
|---|---|---|
| `db_host` | Ya | PostgreSQL host |
| `db_port` | Tidak | PostgreSQL port (default: 5432) |
| `db_name` | Ya | Nama database |
| `db_user` | Ya | User database |
| `db_password` | Ya | Password database |
| `telegram_token` | Ya | Token Telegram bot |

> **Shortcut:** Jika `chat_id` / `chatId` sudah ada di variables, DB lookup dilewati.

## Cara Mendapatkan `topic_id`

Cara termudah untuk mendapatkan `message_thread_id` dari sebuah topik:

1. Buka Telegram Web (web.telegram.org)
2. Masuk ke group → pilih topik yang diinginkan
3. Lihat URL: `https://web.telegram.org/k/#-1001234567890_12345` — angka setelah `_` adalah `topic_id`

Atau gunakan bot listener dan log field `message.message_thread_id` dari update yang masuk.

## Output

### Success Response

```json
{
    "status": "success",
    "message": "Message sent successfully to group 'Tim Operasional' topic 12345",
    "data": {
        "group_name": "Tim Operasional",
        "chat_id": "-1001234567890",
        "topic_id": 12345,
        "message": "📢 Notifikasi dari Admin\n\nOrder ORD-98765 berstatus: Diproses.",
        "telegram_response": {
            "ok": true,
            "result": {}
        }
    },
    "runkey": "test-group-topic-001"
}
```

### Error Response

```json
{
    "status": "error",
    "message": "Topic ID variable 'topic_id' is required",
    "data": {
        "topic_id_key": "topic_id",
        "hint": "topic_id is the message_thread_id of the Telegram forum topic (integer)"
    },
    "runkey": "test-group-topic-001"
}
```

## Testing

```bash
# Test dengan file contoh
python3 send_telegram_group_topic.py --run request.example.json

# Test dengan JSON string inline
python3 send_telegram_group_topic.py --run '{
  "variables": {"group_name": "Tim Operasional", "topic_id": 12345, "info": "Server restarted"},
  "parameters": {"group_name": "group_name", "topic_id": "topic_id", "message": "⚠️ Info: ${info}"},
  "configuration": {
    "db_host": "localhost", "db_name": "mydb",
    "db_user": "postgres", "db_password": "secret",
    "telegram_token": "BOT_TOKEN_HERE"
  },
  "runkey": "test-001"
}'
```

## Requirements

```
psycopg2
requests
```
