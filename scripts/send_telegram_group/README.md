# Send Telegram Group Message

Script untuk mengirim pesan Telegram ke group chat berdasarkan nama group.

## Deskripsi

Script ini akan:

1. Mengambil `group_name` dari variables
2. Mencari `chat_id` dari tabel `vanya_group_chat` berdasarkan `group_title` (case-insensitive)
3. Mengganti placeholder `${key}` di message dengan nilai dari variables
4. Mengirim message ke Telegram group chat

## Database Table

```sql
CREATE TABLE public.vanya_group_chat (
    id bigserial NOT NULL,
    chat_id text NOT NULL,
    group_title varchar(255) NOT NULL,
    is_default bool DEFAULT false NULL,
    created_at timestamptz NULL,
    updated_at timestamptz NULL,
    deleted_at timestamptz NULL,
    CONSTRAINT vanya_group_chat_pkey PRIMARY KEY (id)
);
```

## Input

### Variables

| Key | Wajib | Keterangan |
|---|---|---|
| `group_name` | Ya | Nama group sesuai `group_title` di `vanya_group_chat` |
| `*` | Tidak | Variable lain sebagai placeholder di message (`${key}`) |

> Nama key untuk `group_name` dapat dikustomisasi via `parameters.group_name`.

### Parameters

| Key | Wajib | Keterangan |
|---|---|---|
| `group_name` | Tidak | Key pada variables yang berisi nama group (default: `"group_name"`) |
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

> **Shortcut**: Jika `chat_id` atau `chatId` sudah tersedia di variables, DB lookup dilewati.

## Output

### Success Response

```json
{
    "status": "success",
    "message": "Message sent successfully to group 'Tim Operasional'",
    "data": {
        "group_name": "Tim Operasional",
        "chat_id": "-1001234567890",
        "message": "📢 Notifikasi dari Admin\n\nOrder ORD-98765 sekarang berstatus: Diproses.",
        "telegram_response": {
            "ok": true,
            "result": {}
        }
    },
    "runkey": "test-group-001"
}
```

### Error Response

```json
{
    "status": "error",
    "message": "No chat_id found for group: 'Tim Operasional'",
    "data": {
        "group_name": "Tim Operasional",
        "found": false,
        "hint": "Make sure the group_title exists in vanya_group_chat and is not soft-deleted."
    },
    "runkey": "test-group-001"
}
```

## Testing

```bash
# Test dengan file contoh
python3 send_telegram_group.py --run request.example.json

# Test dengan JSON string inline
python3 send_telegram_group.py --run '{
  "variables": {"group_name": "Tim Operasional", "info": "Server restarted"},
  "parameters": {"group_name": "group_name", "message": "⚠️ Info: ${info}"},
  "configuration": {
    "db_host": "localhost",
    "db_name": "mydb",
    "db_user": "postgres",
    "db_password": "secret",
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
