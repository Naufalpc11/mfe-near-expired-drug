#!/usr/bin/env python3
"""
Script to send Telegram message to private chat
Execution: python3 send_telegram_message.py --run <execution_context>
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


def get_chat_id_by_email(db_config: Dict[str, Any], email: str) -> Optional[str]:
    """
    Get chat_id from vanya_telegram_chat table by email
    
    Args:
        db_config: Database configuration (host, port, database, user, password)
        email: Email to search for
        
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
        
        # Query vanya_telegram_chat table by email to get chat_id
        cursor.execute(
            "SELECT chat_id FROM vanya_telegram_chat WHERE username = %s LIMIT 1;",
            (email,)
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
    Replace placeholders ${key} in message with values from variables
    Also converts various newline formats to actual newlines
    
    Args:
        message: Message template with placeholders
        variables: Dictionary of variable values
        
    Returns:
        Message with replaced placeholders and converted newlines
    """
    # Find all ${...} patterns
    pattern = r'\$\{([^}]+)\}'
    
    def replace(match):
        key = match.group(1)
        value = variables.get(key, match.group(0))  # Keep placeholder if key not found
        # Convert value to string and handle newlines in variable values
        value_str = str(value)
        # Handle double-escaped newlines (\\n -> \n)
        value_str = value_str.replace('\\\\n', '\n')
        # Handle single-escaped newlines (\n -> actual newline)
        value_str = value_str.replace('\\n', '\n')
        return value_str
    
    # Replace placeholders
    result = re.sub(pattern, replace, message)
    
    # Also handle newlines in the template itself
    # Handle double-escaped newlines (\\n -> \n)
    result = result.replace('\\\\n', '\n')
    # Handle single-escaped newlines (\n -> actual newline)
    result = result.replace('\\n', '\n')
    
    return result

def html_to_text(raw_html: str) -> str:
    """Convert HTML fragment to Telegram-friendly plain text.

    - <li> becomes "• " with a trailing newline
    - <br>, </p>, </div>, </tr> become newlines
    - <ul>, <ol> and other tags are stripped
    - HTML entities (&amp;, &nbsp;, ...) are decoded
    """
    if not raw_html:
        return raw_html

    text = raw_html

    # Block-level boundaries → newline
    text = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</\s*(p|div|tr|h[1-6])\s*>', '\n', text, flags=re.IGNORECASE)

    # List items → bullet (newline before guarantees a line break even when
    # the previous <li> isn't closed)
    text = re.sub(r'<\s*li[^>]*>', '\n• ', text, flags=re.IGNORECASE)
    text = re.sub(r'</\s*li\s*>', '', text, flags=re.IGNORECASE)

    # Strip every other tag (including ul/ol wrappers)
    text = re.sub(r'<[^>]+>', '', text)

    # Decode entities (&amp;, &nbsp;, &lt;, ...)
    text = html_module.unescape(text)

    # Collapse 3+ consecutive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def send_telegram_message(bot_token: str, chat_id: str, message: str) -> Dict[str, Any]:
    """
    Send message to Telegram private chat
    
    Args:
        bot_token: Telegram bot token
        chat_id: Telegram chat ID
        message: Message to send
        
    Returns:
        Response from Telegram API
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    message = html_to_text(message)

    payload = {
        "chat_id": chat_id,
        "text": message
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to send Telegram message: {str(e)}")


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function
    
    Args:
        ctx: Execution context with variables, parameters, configuration, runkey
        
    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        # Validate context
        if ctx is None:
            return {
                "status": "error",
                "message": "Execution context is None or invalid",
                "data": None,
                "runkey": ""
            }
        
        # Extract parameters
        parameters = ctx.get('parameters', {})
        email_key = parameters.get('email', 'email').strip()  # Key for email variable
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
        
        # Extract variables
        variables = ctx.get('variables', {})
        
        # Validate variables object
        if variables is None:
            variables = {}
        
        email = variables.get(email_key, '').strip()
        
        if not email:
            return {
                "status": "error",
                "message": f"Email variable '{email_key}' is required",
                "data": {
                    "email_key": email_key,
                    "available_variable_keys": list(variables.keys()) if variables else [],
                    "parameters": parameters
                },
                "runkey": ctx.get('runkey', '')
            }
        
        # Extract configuration
        config = ctx.get('configuration', {})
        
        # Validate configuration object
        if config is None:
            config = {}
        
        db_config = {
            'host': config.get('db_host'),
            'port': config.get('db_port', 5432),
            'database': config.get('db_name'),
            'user': config.get('db_user'),
            'password': config.get('db_password')
        }
        
        bot_token = config.get('telegram_token', '').strip()
        
        if not bot_token:
            # Debug: show available config keys (without values for security)
            available_keys = list(config.keys()) if config else []
            return {
                "status": "error",
                "message": "Bot token is required in configuration",
                "data": {
                    "available_config_keys": available_keys,
                    "expected_key": "telegram_token"
                },
                "runkey": ctx.get('runkey', '')
            }
        
        # Validate database configuration
        required_fields = ['host', 'database', 'user', 'password']
        missing_fields = [f for f in required_fields if not db_config.get(f)]
        
        # Check if chat_id provided directly in variables (skip DB lookup)
        chat_id = variables.get('chatId') or variables.get('chat_id')
        
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
        
        # Get chat_id from database if not provided
        if not chat_id:
            chat_id = get_chat_id_by_email(db_config, email)
        
        if not chat_id:
            return {
                "status": "error",
                "message": f"No chat_id found for email: {email}",
                "data": {
                    "email": email,
                    "found": False,
                    "db_config": {k: ('***HIDDEN***' if k == 'password' else v) for k, v in db_config.items()},
                    "searched_in_variables": ['chatId', 'chat_id']
                },
                "runkey": ctx.get('runkey', '')
            }
        
        # Replace placeholders in message
        final_message = replace_placeholders(message_template, variables)
        
        # Send Telegram message
        telegram_response = send_telegram_message(bot_token, chat_id, final_message)
        
        return {
            "status": "success",
            "message": f"Message sent successfully to {email}",
            "data": {
                "email": email,
                "chat_id": chat_id,
                "message": final_message,
                "telegram_response": telegram_response
            },
            "runkey": ctx.get('runkey', '')
        }
        
    except Exception as e:
        # Prepare debug info (hide sensitive data)
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
    parser = argparse.ArgumentParser(description='Send Telegram message to private chat')
    parser.add_argument('--run', required=True, 
                       help='Execution context (JSON file or JSON string)')
    
    args = parser.parse_args()
    
    try:
        # Parse input
        if args.run.startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        
        # Execute action
        result = run(ctx)
        
        # Output result with proper JSON encoding
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Exit with appropriate code
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
