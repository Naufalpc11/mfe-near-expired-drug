#!/usr/bin/env python3
"""
Script to get PostgreSQL tables and send to Telegram
Execution: python3 send_table_list.py --run <execution_context>
"""

import json
import sys
import argparse
import requests
import psycopg2
from typing import Dict, Any, List
from datetime import date, datetime


def serialize_value(value):
    """Convert non-JSON-serializable values to strings"""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def get_postgres_tables(db_config: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get list of records from vanya_telegram_chat and lunch_data tables
    
    Args:
        db_config: Database configuration (host, port, database, user, password)
        
    Returns:
        Dictionary with table names as keys and list of records as values
    """
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        
        cursor = conn.cursor()
        
        result = {}
        
        # Query telegram_account table
        cursor.execute("SELECT * FROM vanya_telegram_chat ORDER BY id;")
        columns = [desc[0] for desc in cursor.description]
        telegram_records = [
            {key: serialize_value(value) for key, value in dict(zip(columns, row)).items()}
            for row in cursor.fetchall()
        ]
        result['telegram_account'] = telegram_records
        
        # Query lunch_data table
        cursor.execute("SELECT * FROM vanya_order_makan_siang ORDER BY id;")
        columns = [desc[0] for desc in cursor.description]
        lunch_records = [
            {key: serialize_value(value) for key, value in dict(zip(columns, row)).items()}
            for row in cursor.fetchall()
        ]
        result['lunch_data'] = lunch_records
        
        cursor.close()
        conn.close()
        
        return result
        
    except psycopg2.Error as e:
        raise Exception(f"Database connection error: {str(e)}")


def send_to_telegram(bot_token: str, chat_id: str, topic_id: str, message: str) -> bool:
    """
    Send message to Telegram chat/topic
    
    Args:
        bot_token: Telegram bot token
        chat_id: Chat ID or group ID
        topic_id: Topic ID (optional, for forum/topic groups)
        message: Message to send
        
    Returns:
        True if successful
    """
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        
        # Add topic/thread ID if provided
        if topic_id and topic_id.strip():
            payload["message_thread_id"] = int(topic_id)
        
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        if not result.get('ok'):
            raise Exception(f"Telegram API error: {result.get('description', 'Unknown error')}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to send Telegram message: {str(e)}")


def format_table_list(table_data: Dict[str, List[Dict[str, Any]]], db_name: str) -> str:
    """
    Format table records as HTML message
    
    Args:
        table_data: Dictionary with table names and their records
        db_name: Database name
        
    Returns:
        Formatted HTML message
    """
    if not table_data:
        return f"<b>📊 Database: {db_name}</b>\n\nℹ️ No data found."
    
    message = f"<b>📊 Database: {db_name}</b>\n\n"
    
    # Format telegram_account table
    telegram_records = table_data.get('telegram_account', [])
    message += f"<b>📱 telegram_account ({len(telegram_records)} records)</b>\n"
    if telegram_records:
        for record in telegram_records:
            message += f"• ID: {record.get('id', 'N/A')}"
            # Add other relevant fields
            for key, value in record.items():
                if key != 'id':
                    message += f" | {key}: {value}"
            message += "\n"
    else:
        message += "  (empty)\n"
    
    message += "\n"
    
    # Format lunch_data table
    lunch_records = table_data.get('lunch_data', [])
    message += f"<b>🍽️ lunch_data ({len(lunch_records)} records)</b>\n"
    if lunch_records:
        for record in lunch_records:
            message += f"• ID: {record.get('id', 'N/A')}"
            # Add other relevant fields
            for key, value in record.items():
                if key != 'id':
                    message += f" | {key}: {value}"
            message += "\n"
    else:
        message += "  (empty)\n"
    
    return message


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function
    
    Args:
        ctx: Execution context with configuration and parameters
        
    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        # Extract context
        configuration = ctx.get('configuration', {})
        parameters = ctx.get('parameters', {})
        runkey = ctx.get('runkey', '')
        
        # Validate database configuration
        db_config = {
            'host': configuration.get('db_host'),
            'port': configuration.get('db_port', 5432),
            'database': configuration.get('db_name'),
            'user': configuration.get('db_user'),
            'password': configuration.get('db_password')
        }
        
        required_db_fields = ['host', 'database', 'user', 'password']
        for field in required_db_fields:
            if not db_config.get(field):
                raise ValueError(f"Missing required database configuration: {field}")
        
        # Validate Telegram configuration
        bot_token = configuration.get('telegram_token')
        if not bot_token:
            raise ValueError("Missing required configuration: telegram_token")
        
        # Validate parameters
        chat_id = parameters.get('chat_id')
        if not chat_id:
            raise ValueError("Missing required parameter: chat_id")
        
        topic_id = parameters.get('topic_id', '')
        
        # Get records from PostgreSQL
        table_data = get_postgres_tables(db_config)
        
        # Format message
        message = format_table_list(table_data, db_config['database'])
        
        # Send to Telegram
        send_to_telegram(bot_token, chat_id, topic_id, message)
        
        # Calculate total records
        total_records = sum(len(records) for records in table_data.values())
        
        return {
            "status": "ok",
            "message": f"Successfully sent {total_records} records from {len(table_data)} tables to Telegram",
            "data": {
                "database": db_config['database'],
                "telegram_account_count": len(table_data.get('telegram_account', [])),
                "lunch_data_count": len(table_data.get('lunch_data', [])),
                "table_data": table_data,
                "chat_id": chat_id,
                "topic_id": topic_id if topic_id else None
            },
            "runkey": runkey
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "data": None,
            "runkey": ctx.get('runkey', '')
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Get PostgreSQL tables and send to Telegram'
    )
    parser.add_argument(
        '--run',
        required=True,
        help='Execution context (JSON file or JSON string)'
    )
    
    args = parser.parse_args()
    
    try:
        # Parse input
        if args.run.startswith('{'):
            # JSON string
            ctx = json.loads(args.run)
        else:
            # JSON file
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        
        # Execute
        result = run(ctx)
        
        # Output JSON to STDOUT
        print(json.dumps(result, indent=2))
        
        # Exit codes
        if result.get('status') == 'ok':
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Execution failed: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)


if __name__ == '__main__':
    main()
