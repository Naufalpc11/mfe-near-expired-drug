# PostgreSQL Telegram Table List Script

Script untuk mengambil daftar table dari PostgreSQL dan mengirimkannya ke Telegram.

## Requirements

```bash
pip install psycopg2-binary requests
```

## Usage

```bash
python3 send_table_list.py --run request.example.json
```

Atau dengan JSON string:

```bash
python3 send_table_list.py --run '{"parameters":{"chat_id":"-1001234567890","topic_id":"123"},"configuration":{"db_host":"localhost","db_port":5432,"db_name":"my_database","db_user":"postgres","db_password":"password","telegram_token":"YOUR_BOT_TOKEN"},"runkey":"test-001"}'
```

## Configuration

### Database Configuration (configuration)

- `db_host`: PostgreSQL host (required)
- `db_port`: PostgreSQL port (default: 5432)
- `db_name`: Database name (required)
- `db_user`: Database username (required)
- `db_password`: Database password (required)
- `telegram_token`: Telegram bot token (required)

### Parameters (parameters)

- `chat_id`: Telegram chat ID or group ID (required)
- `topic_id`: Topic ID untuk forum/topic groups (optional)

## Response Format

Success:

```json
{
  "status": "ok",
  "message": "Successfully sent N tables to Telegram",
  "data": {
    "database": "my_database",
    "tables_count": 5,
    "tables": ["table1", "table2", "table3"],
    "chat_id": "-1001234567890",
    "topic_id": "123"
  },
  "runkey": "test-run-001"
}
```

Error:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "runkey": "test-run-001"
}
```

## Telegram Message Format

The script sends a formatted HTML message to Telegram:

```
📊 Database: my_database

Total Tables: 5

Table List:
1. users
2. orders
3. products
4. categories
5. settings
```

## Getting Telegram Chat ID

1. For private chat: Use [@userinfobot](https://t.me/userinfobot)
2. For groups: Add bot to group and use [@getidsbot](https://t.me/getidsbot)
3. For topics: Topic ID is visible in the topic URL

## Notes

- Script mengambil tables dari schema `public` saja
- Mendukung topic/forum groups dengan parameter `topic_id`
- Message format menggunakan HTML parse mode
- Timeout untuk Telegram API: 30 detik
