#!/usr/bin/env python3
"""
Send Telegram Reminder Script
Mengirim reminder melalui Telegram kepada user yang belum memesan makan siang hari ini.
Mengikuti General Action Executor contract.
"""

import sys
import json
import argparse
import logging
from datetime import datetime, date
from typing import Dict, Any, List
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def get_database_connection(config: Dict[str, Any]):
    """
    Membuat koneksi database PostgreSQL
    
    Args:
        config: Database configuration
        
    Returns:
        PostgreSQL connection object
    """
    import psycopg2
    return psycopg2.connect(
        host=config.get("db_host", "localhost"),
        port=config.get("db_port", 5432),
        database=config.get("db_name"),
        user=config.get("db_user"),
        password=config.get("db_password")
    )


def get_users_ordered_today(conn, config: Dict[str, Any]) -> List[str]:
    """
    Mengambil daftar email user yang sudah order makan hari ini
    
    Args:
        conn: Database connection
        config: Configuration with table/column names
        
    Returns:
        List of email addresses
    """
    cursor = conn.cursor()
    
    # Konfigurasi nama tabel dan kolom (dengan default values)
    lunch_table = config.get("lunch_table", "lunch_data")
    email_column = config.get("lunch_email_column", "email")
    date_column = config.get("lunch_date_column", "order_date")
    
    today = date.today().strftime('%Y-%m-%d')
    
    query = f"""
        SELECT DISTINCT {email_column}
        FROM {lunch_table}
        WHERE DATE({date_column}) = %s
    """
    
    cursor.execute(query, (today,))
    results = cursor.fetchall()
    cursor.close()
    
    return [row[0] for row in results if row[0]]


def get_telegram_users(conn, config: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Mengambil daftar user terdaftar di Telegram
    
    Args:
        conn: Database connection
        config: Configuration with table/column names
        
    Returns:
        List of dict with email and chat_id
    """
    cursor = conn.cursor()
    
    # Konfigurasi nama tabel dan kolom (dengan default values)
    telegram_table = config.get("telegram_table", "telegram_account")
    email_column = config.get("telegram_email_column", "email")
    chat_id_column = config.get("telegram_chat_id_column", "chatid")
    
    query = f"""
        SELECT {email_column}, {chat_id_column}
        FROM {telegram_table}
        WHERE {chat_id_column} IS NOT NULL
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    
    return [
        {"email": row[0], "chat_id": str(row[1])}
        for row in results if row[0] and row[1]
    ]


def send_telegram_message(bot_token: str, chat_id: str, message: str) -> Dict[str, Any]:
    """
    Mengirim pesan melalui Telegram Bot API
    
    Args:
        bot_token: Telegram bot token
        chat_id: Target chat ID
        message: Message to send
        
    Returns:
        Response dict
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        
        return {
            "success": True,
            "chat_id": chat_id,
            "message": "Message sent successfully"
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "chat_id": chat_id,
            "error": str(e)
        }


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Entry point untuk action script (wajib bernama 'run')
    
    Args:
        ctx: Execution context dengan struktur:
            - variables: Data runtime (dapat dimodifikasi)
            - parameters: Parameter dari user/trigger (read-only)
            - configuration: Konfigurasi addon/plugin
            - runkey: Unique identifier untuk tracing
    
    Returns:
        dict: Response dengan format standard
    """
    
    try:
        # Validate context
        if ctx is None:
            raise ValueError("Execution context is None")
        
        # Extract context with safe defaults
        parameters = ctx.get("parameters") if ctx.get("parameters") is not None else {}
        configuration = ctx.get("configuration") if ctx.get("configuration") is not None else {}
        runkey = ctx.get("runkey", "")
        
        # Validate configuration is not None
        if configuration is None:
            configuration = {}
        
        # Fallback: If configuration is empty, try to get from parameters
        # This allows flexibility in how config is passed
        if not configuration or not any(configuration.values()):
            logger.info("Configuration is empty, checking parameters for config values")
            # Check if db config exists in parameters
            if parameters.get("db_name"):
                configuration = {
                    "db_host": parameters.get("db_host", "localhost"),
                    "db_port": parameters.get("db_port", 5432),
                    "db_name": parameters.get("db_name"),
                    "db_user": parameters.get("db_user"),
                    "db_password": parameters.get("db_password"),
                    "telegram_token": parameters.get("telegram_token"),
                    "lunch_table": parameters.get("lunch_table", "lunch_data"),
                    "lunch_email_column": parameters.get("lunch_email_column", "email"),
                    "lunch_date_column": parameters.get("lunch_date_column", "order_date"),
                    "telegram_table": parameters.get("telegram_table", "telegram_account"),
                    "telegram_email_column": parameters.get("telegram_email_column", "email"),
                    "telegram_chat_id_column": parameters.get("telegram_chat_id_column", "chatid"),
                }
            else:
                # Last fallback: Use hardcoded config (for testing/development)
                logger.warning("No configuration found in context or parameters, using hardcoded fallback")
                configuration = {
                    "db_host": "50.50.50.101",
                    "db_port": 5432,
                    "db_name": "joglo_makansiang",
                    "db_user": "postgres",
                    "db_password": "J4v4nDev!@#",
                    "telegram_token": "7324458142:AAHqz3jPgc_GHAD2PowOp6ocI885xKA86r4",
                    "lunch_table": "lunch_data",
                    "lunch_email_column": "email",
                    "lunch_date_column": "tanggal",
                    "telegram_table": "telegram_account",
                    "telegram_email_column": "email",
                    "telegram_chat_id_column": "chatid",
                }
        
        # Get message template from parameters
        message_template = parameters.get("message_template", 
                                         "Halo {email}, aku lihat kamu belum pesan makan siang untuk hari ini. Apakah Kamu mau pesan makan siang untuk hari ini?")
        
        # Log configuration status
        logger.info(f"Using configuration: db_host={configuration.get('db_host')}, db_name={configuration.get('db_name')}")
        
        # Validate configuration
        required_configs = ["db_name", "db_user", "db_password", "telegram_token"]
        missing_configs = [cfg for cfg in required_configs if not configuration.get(cfg)]
        
        if missing_configs:
            raise ValueError(f"Missing required configuration: {', '.join(missing_configs)}")
        
        bot_token = configuration.get("telegram_token")
        
        # Connect to database
        conn = get_database_connection(configuration)
        
        # Get users who already ordered today
        users_ordered = get_users_ordered_today(conn, configuration)
        
        # Get all Telegram users
        telegram_users = get_telegram_users(conn, configuration)
        
        # Close database connection
        conn.close()
        
        # Find users who haven't ordered
        users_ordered_set = set(users_ordered)
        users_to_remind = [
            user for user in telegram_users 
            if user["email"] not in users_ordered_set
        ]
        
        # Send reminders
        results = []
        success_count = 0
        failed_count = 0
        
        for user in users_to_remind:
            # Replace {email} placeholder in message template
            personalized_message = message_template.replace("{email}", user["email"])
            
            result = send_telegram_message(
                bot_token=bot_token,
                chat_id=user["chat_id"],
                message=personalized_message
            )
            
            result["email"] = user["email"]
            results.append(result)
            
            if result["success"]:
                success_count += 1
            else:
                failed_count += 1
        
        # Prepare response
        return {
            "status": "ok",
            "message": f"Reminder sent to {success_count} users, {failed_count} failed",
            "data": {
                "total_telegram_users": len(telegram_users),
                "users_already_ordered": len(users_ordered),
                "users_reminded": len(users_to_remind),
                "success_count": success_count,
                "failed_count": failed_count,
                "results": results,
                "timestamp": datetime.now().isoformat()
            },
            "runkey": runkey
        }
        
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": f"Error executing reminder script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "traceback": traceback.format_exc(),
            "runkey": ctx.get("runkey", "") if ctx else ""
        }


def main():
    """Main function untuk handle command line arguments"""
    
    parser = argparse.ArgumentParser(
        description='Send Telegram reminder script - General Action Executor'
    )
    
    parser.add_argument(
        '--run',
        type=str,
        required=True,
        help='Execution context (JSON file path or JSON string)'
    )
    
    try:
        args = parser.parse_args()
        
        # Parse execution context
        if args.run.endswith('.json'):
            # Load dari file
            with open(args.run, 'r', encoding='utf-8') as f:
                ctx = json.load(f)
        else:
            # Parse dari JSON string
            ctx = json.loads(args.run)
        
        # Execute action via run entry point
        result = run(ctx)
        
        # Output JSON ke stdout
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Exit code berdasarkan status
        exit_code = 0 if result.get("status") == "ok" else 1
        sys.exit(exit_code)
        
    except json.JSONDecodeError as e:
        error_response = {
            "status": "error",
            "message": f"Invalid JSON format: {str(e)}",
            "error": "INVALID_INPUT",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(2)
        
    except Exception as e:
        error_response = {
            "status": "error",
            "message": f"Error executing reminder script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
