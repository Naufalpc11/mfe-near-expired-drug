#!/usr/bin/env python3
"""
Script to send Telegram message to a specific topic/thread inside a group chat.
Uses message_thread_id to target a Forum Topic in a Telegram Supergroup.
Execution: python3 send_telegram_group_topic.py --run <execution_context>
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


def get_chat_and_topic_id(
    db_config: Dict[str, Any],
    group_name: str,
    topic_name: str
) -> Optional[Dict[str, str]]:
    """
    Lookup chat_id and topic_id in a single JOIN query.

    Joins vanya_group_chat (by group_title) with vanya_group_topic (by topic_name)
    using the FK relationship: vanya_group_topic.group_chat_id → vanya_group_chat.chat_id

    Args:
        db_config: Database configuration (host, port, database, user, password)
        group_name: Group title to search for in vanya_group_chat (case-insensitive)
        topic_name: Topic name to search for in vanya_group_topic (case-insensitive)

    Returns:
        Dict with 'chat_id' and 'topic_id', or None if not found
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

        cursor.execute(
            """
            SELECT gc.chat_id, gt.topic_id
            FROM vanya_group_chat gc
            JOIN vanya_group_topic gt ON gt.group_chat_id = gc.chat_id
            WHERE LOWER(gc.group_title) = LOWER(%s)
              AND LOWER(gt.topic_name)  = LOWER(%s)
              AND gc.deleted_at IS NULL
              AND gt.deleted_at IS NULL
            LIMIT 1;
            """,
            (group_name, topic_name)
        )

        row = cursor.fetchone()

        cursor.close()
        conn.close()

        if row and row[0] and row[1]:
            return {'chat_id': str(row[0]), 'topic_id': str(row[1])}
        return None

    except psycopg2.Error as e:
        raise Exception(f"Database error: {str(e)}")


def replace_placeholders(message: str, variables: Dict[str, Any]) -> str:
    """
    Replace placeholders ${key} in message with values from variables.
    Also converts various newline formats to actual newlines.
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

def send_telegram_topic_message(
    bot_token: str,
    chat_id: str,
    topic_id: int,
    message: str
) -> Dict[str, Any]:
    """
    Send a message to a specific topic/thread inside a Telegram group.

    Args:
        bot_token: Telegram bot token
        chat_id: Telegram group chat ID
        topic_id: message_thread_id of the forum topic
        message: Message to send

    Returns:
        Response from Telegram API
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    message = html_to_text(message)

    payload = {
        "chat_id": chat_id,
        "message_thread_id": topic_id,
        "text": message,
    }

    try:
        response = requests.post(url, json=payload, timeout=10)

        # Parse response body first so we can include Telegram's error detail
        try:
            resp_json = response.json()
        except Exception:
            resp_json = {"raw": response.text}

        if not response.ok:
            tg_description = resp_json.get("description", response.text)
            tg_error_code  = resp_json.get("error_code", response.status_code)
            raise Exception(
                f"Telegram API error {tg_error_code}: {tg_description} "
                f"| payload: chat_id={chat_id!r}, message_thread_id={topic_id}"
            )

        return resp_json

    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to send Telegram message: {str(e)}")


def analyze_images_with_openai(
    openai_token: str,
    images: list,
    prompt: str = "Analyze these images and describe what you see."
) -> str:
    """
    Analyze a list of base64-encoded images using OpenAI Vision API.

    Args:
        openai_token: OpenAI API token
        images: List of base64-encoded image strings (raw base64 or data URI)
        prompt: Prompt to send with the images

    Returns:
        Analysis result as string
    """
    url = "https://api.openai.com/v1/chat/completions"

    content = [{"type": "text", "text": prompt}]

    for img in images:
        if not isinstance(img, str) or not img.strip():
            continue
        img = img.strip()
        # Accept both raw base64 and data URI (data:image/...;base64,...)
        if img.startswith("data:"):
            image_url = img
        else:
            image_url = f"data:image/jpeg;base64,{img}"

        content.append({
            "type": "image_url",
            "image_url": {"url": image_url}
        })

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": content
            }
        ],
        "max_tokens": 1000
    }

    headers = {
        "Authorization": f"Bearer {openai_token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        try:
            resp_json = response.json()
        except Exception:
            resp_json = {"raw": response.text}

        if not response.ok:
            error_msg = resp_json.get("error", {}).get("message", response.text)
            raise Exception(f"OpenAI API error {response.status_code}: {error_msg}")

        return resp_json["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to call OpenAI API: {str(e)}")


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
        group_name_key  = parameters.get('group_name', 'group_name').strip()
        topic_name_key  = parameters.get('topic_name', 'topic_name').strip()
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

        topic_name = variables.get(topic_name_key, '').strip()

        if not topic_name:
            return {
                "status": "error",
                "message": f"Topic name variable '{topic_name_key}' is required",
                "data": {
                    "topic_name_key": topic_name_key,
                    "available_variable_keys": list(variables.keys()) if variables else [],
                    "hint": "topic_name akan di-lookup ke tabel vanya_group_topic untuk mendapatkan topic_id"
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

        required_db_fields = ['host', 'database', 'user', 'password']
        missing_fields = [f for f in required_db_fields if not db_config.get(f)]

        if missing_fields:
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

        # ── DB Lookup: JOIN vanya_group_chat + vanya_group_topic ──────────────
        # Finds chat_id (from group_title) and topic_id (from topic_name) in one query.
        lookup = get_chat_and_topic_id(db_config, group_name, topic_name)

        if not lookup:
            return {
                "status": "error",
                "message": f"No record found for group '{group_name}' and topic '{topic_name}'",
                "data": {
                    "group_name": group_name,
                    "topic_name": topic_name,
                    "found": False,
                    "hint": (
                        "Pastikan group_title ada di vanya_group_chat "
                        "dan topic_name ada di vanya_group_topic untuk group tersebut, "
                        "keduanya tidak soft-deleted."
                    )
                },
                "runkey": ctx.get('runkey', '')
            }

        chat_id      = lookup['chat_id']
        topic_id_str = lookup['topic_id']

        try:
            topic_id = int(topic_id_str)
        except (ValueError, TypeError):
            return {
                "status": "error",
                "message": f"topic_id dari database bukan integer yang valid: '{topic_id_str}'",
                "data": {"topic_id_str": topic_id_str},
                "runkey": ctx.get('runkey', '')
            }

        # ── Image Analysis via OpenAI (optional) ──────────────────────────────
        images_key = parameters.get('images', '').strip()
        if images_key:
            images_data = variables.get(images_key, [])

            # Support JSON string containing a list
            if isinstance(images_data, str):
                try:
                    images_data = json.loads(images_data)
                except Exception:
                    images_data = [images_data]

            if not isinstance(images_data, list):
                images_data = [images_data]

            # Filter out empty entries
            images_data = [img for img in images_data if img and str(img).strip()]

            if images_data:
                openai_token = config.get('openai_token', '').strip()
                if not openai_token:
                    return {
                        "status": "error",
                        "message": "openai_token is required in configuration when images parameter is provided",
                        "data": {
                            "available_config_keys": list(config.keys()) if config else [],
                            "expected_key": "openai_token"
                        },
                        "runkey": ctx.get('runkey', '')
                    }

                image_prompt = parameters.get(
                    'image_prompt',
                    'Analyze these images and describe what you see.'
                ).strip()

                try:
                    ai_analysis = analyze_images_with_openai(openai_token, images_data, image_prompt)
                    # Expose result as ${ai_analysis} inside the message template
                    variables['ai_analysis'] = ai_analysis
                except Exception as ai_err:
                    return {
                        "status": "error",
                        "message": f"Image analysis failed: {str(ai_err)}",
                        "data": {
                            "images_count": len(images_data),
                            "images_key": images_key
                        },
                        "runkey": ctx.get('runkey', '')
                    }

        # ── Send Message to Topic ─────────────────────────────────────────────
        final_message = replace_placeholders(message_template, variables)

        try:
            telegram_response = send_telegram_topic_message(bot_token, chat_id, topic_id, final_message)
        except Exception as send_err:
            return {
                "status": "error",
                "message": str(send_err),
                "data": {
                    "group_name": group_name,
                    "chat_id": chat_id,
                    "topic_name": topic_name,
                    "topic_id": topic_id,
                    "message_sent": final_message,
                    "telegram_payload": {
                        "chat_id": chat_id,
                        "message_thread_id": topic_id,
                    }
                },
                "runkey": ctx.get('runkey', '')
            }

        return {
            "status": "success",
            "message": f"Message sent successfully to group '{group_name}' topic '{topic_name}' (id={topic_id})",
            "data": {
                "group_name": group_name,
                "chat_id": chat_id,
                "topic_name": topic_name,
                "topic_id": topic_id,
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
        description='Send Telegram message to a specific topic inside a group chat'
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
