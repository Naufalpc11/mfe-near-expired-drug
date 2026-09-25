#!/usr/bin/env python3
"""
Script to send Telegram message to a group chat by group name lookup.
Execution: python3 send_telegram_group.py --run <execution_context>
"""

import json
import sys
import argparse
import html as html_module
import psycopg2
import requests
import re
from typing import Dict, Any, Optional
from datetime import date, datetime


def serialize_value(value):
    """Convert non-JSON-serializable values to strings"""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def html_to_text(raw_html: str) -> str:
    """Convert HTML fragment to Telegram-friendly plain text.

    - <li> becomes "• " on a new line (works even if </li> is missing)
    - <br>, </p>, </div>, </tr>, </h1..h6> become newlines
    - <ul>, <ol> and other tags are stripped
    - HTML entities (&amp;, &nbsp;, ...) are decoded
    """
    if not raw_html:
        return raw_html

    text = raw_html

    text = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</\s*(p|div|tr|h[1-6])\s*>', '\n', text, flags=re.IGNORECASE)

    text = re.sub(r'<\s*li[^>]*>', '\n• ', text, flags=re.IGNORECASE)
    text = re.sub(r'</\s*li\s*>', '', text, flags=re.IGNORECASE)

    text = re.sub(r'<[^>]+>', '', text)

    text = html_module.unescape(text)

    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()



def get_chat_id_by_group_name(db_config: Dict[str, Any], group_name: str) -> Optional[str]:
    """
    Get chat_id from vanya_group_chat table by group_title (case-insensitive).

    Args:
        db_config: Database configuration (host, port, database, user, password)
        group_name: Group title to search for

    Returns:
        chat_id as string or None if not found
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

        # Query vanya_group_chat by group_title (case-insensitive, soft-delete aware)
        cursor.execute(
            """
            SELECT chat_id
            FROM vanya_group_chat
            WHERE LOWER(group_title) = LOWER(%s)
              AND deleted_at IS NULL
            LIMIT 1;
            """,
            (group_name,)
        )

        row = cursor.fetchone()

        cursor.close()
        conn.close()

        if row and row[0]:
            return str(row[0])
        return None

    except psycopg2.Error as e:
        raise Exception(f"Database error: {str(e)}")


def replace_placeholders(message: str, variables: Dict[str, Any]) -> str:
    """
    Replace placeholders ${key} in message with values from variables.
    Also converts various newline formats to actual newlines.

    Args:
        message: Message template with placeholders
        variables: Dictionary of variable values

    Returns:
        Message with replaced placeholders and converted newlines
    """
    pattern = r'\$\{([^}]+)\}'

    def replace(match):
        key = match.group(1)
        value = variables.get(key, match.group(0))
        value_str = str(value)
        value_str = value_str.replace('\\\\n', '\n')
        value_str = value_str.replace('\\n', '\n')
        return value_str

    result = re.sub(pattern, replace, message)

    result = result.replace('\\\\n', '\n')
    result = result.replace('\\n', '\n')

    return result


def send_telegram_message(bot_token: str, chat_id: str, message: str) -> Dict[str, Any]:
    """
    Send a message to a Telegram group chat.

    Args:
        bot_token: Telegram bot token
        chat_id: Telegram group chat ID
        message: Message to send

    Returns:
        Response from Telegram API
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    message = html_to_text(message)

    payload = {
        "chat_id": chat_id,
        "text": message,
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to send Telegram message: {str(e)}")


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function.

    Args:
        ctx: Execution context with variables, parameters, configuration, runkey

    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        if ctx is None:
            return {
                "status": "error",
                "message": "Execution context is None or invalid",
                "data": None,
                "runkey": ""
            }

        # ── Parameters ────────────────────────────────────────────────────────
        parameters = ctx.get('parameters', {})
        group_name_key = parameters.get('group_name', 'group_name').strip()
        message_template = parameters.get('message', '').strip()

        if not message_template:
            return {
                "status": "error",
                "message": "Message parameter is required",
                "data": {
                    "parameters": parameters,
                    "available_param_keys": list(parameters.keys()) if parameters else []
                },
                "runkey": ctx.get('runkey', '')
            }

        # ── Variables ─────────────────────────────────────────────────────────
        variables = ctx.get('variables', {}) or {}

        group_name = variables.get(group_name_key, '').strip()

        if not group_name:
            return {
                "status": "error",
                "message": f"Group name variable '{group_name_key}' is required",
                "data": {
                    "group_name_key": group_name_key,
                    "available_variable_keys": list(variables.keys()) if variables else [],
                    "parameters": parameters
                },
                "runkey": ctx.get('runkey', '')
            }

        # ── Configuration ─────────────────────────────────────────────────────
        config = ctx.get('configuration', {}) or {}

        db_config = {
            'host': config.get('db_host'),
            'port': config.get('db_port', 5432),
            'database': config.get('db_name'),
            'user': config.get('db_user'),
            'password': config.get('db_password')
        }

        bot_token = config.get('telegram_token', '').strip()

        if not bot_token:
            return {
                "status": "error",
                "message": "Bot token is required in configuration (telegram_token)",
                "data": {
                    "available_config_keys": list(config.keys()) if config else [],
                    "expected_key": "telegram_token"
                },
                "runkey": ctx.get('runkey', '')
            }

        # Allow chat_id override from variables (skip DB lookup)
        chat_id = variables.get('chatId') or variables.get('chat_id')

        required_db_fields = ['host', 'database', 'user', 'password']
        missing_fields = [f for f in required_db_fields if not db_config.get(f)]

        if not chat_id and missing_fields:
            return {
                "status": "error",
                "message": f"Missing database configuration: {', '.join(missing_fields)}",
                "data": {
                    "missing_fields": missing_fields,
                    "available_config_keys": list(config.keys()) if config else [],
                    "db_config": {k: ('***HIDDEN***' if k == 'password' else v) for k, v in db_config.items()}
                },
                "runkey": ctx.get('runkey', '')
            }

        # ── DB Lookup ─────────────────────────────────────────────────────────
        if not chat_id:
            chat_id = get_chat_id_by_group_name(db_config, group_name)

        if not chat_id:
            return {
                "status": "error",
                "message": f"No chat_id found for group: '{group_name}'",
                "data": {
                    "group_name": group_name,
                    "found": False,
                    "db_config": {k: ('***HIDDEN***' if k == 'password' else v) for k, v in db_config.items()},
                    "hint": "Make sure the group_title exists in vanya_group_chat and is not soft-deleted."
                },
                "runkey": ctx.get('runkey', '')
            }

        # ── Send Message ──────────────────────────────────────────────────────
        final_message = replace_placeholders(message_template, variables)
        telegram_response = send_telegram_message(bot_token, chat_id, final_message)

        return {
            "status": "success",
            "message": f"Message sent successfully to group '{group_name}'",
            "data": {
                "group_name": group_name,
                "chat_id": chat_id,
                "message": final_message,
                "telegram_response": telegram_response
            },
            "runkey": ctx.get('runkey', '')
        }

    except Exception as e:
        debug_info = {
            "parameters": ctx.get('parameters', {}) if ctx else None,
            "variables": {k: v for k, v in (ctx.get('variables', {}) if ctx else {}).items()},
            "configuration": {
                k: ('***HIDDEN***' if k in ['telegram_token', 'db_password', 'password', 'token'] else v)
                for k, v in (ctx.get('configuration', {}) if ctx else {}).items()
            } if ctx and ctx.get('configuration') else None,
            "error_type": type(e).__name__,
            "error_details": str(e)
        }

        return {
            "status": "error",
            "message": f"Execution failed: {str(e)}",
            "data": debug_info,
            "runkey": ctx.get('runkey', '') if ctx else ''
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Send Telegram message to a group chat by group name'
    )
    parser.add_argument(
        '--run', required=True,
        help='Execution context as a JSON file path or JSON string'
    )

    args = parser.parse_args()

    try:
        if args.run.startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r') as f:
                ctx = json.load(f)

        result = run(ctx)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0 if result['status'] == 'success' else 1)

    except json.JSONDecodeError as e:
        error_result = {
            "status": "error",
            "message": f"Invalid JSON input: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)

    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Script execution failed: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)


if __name__ == '__main__':
    main()
