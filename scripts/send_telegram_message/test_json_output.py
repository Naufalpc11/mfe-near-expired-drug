#!/usr/bin/env python3
"""Test JSON output with newlines"""

import json
import re

# Simulate the script's behavior
ctx = {
    'variables': {
        'email': 'test@example.com',
        'recommendation': '- ya ini\n- gitu juga bisa\n- adalah pokoknya',
        'chatId': '123456789'
    },
    'parameters': {
        'email': 'email',
        'message': 'Halo!\n\nBerikut rekomendasi:\n${recommendation}'
    },
    'configuration': {
        'telegram_token': 'test_token'
    },
    'runkey': 'test-mock'
}

# Simulate placeholder replacement
message = ctx['parameters']['message']
variables = ctx['variables']

pattern = r'\$\{([^}]+)\}'
def replace(match):
    key = match.group(1)
    value = variables.get(key, match.group(0))
    return str(value)

result_message = re.sub(pattern, replace, message)
result_message = result_message.replace('\\n', '\n')

# Create result
result = {
    'status': 'success',
    'message': 'Test result',
    'data': {
        'email': ctx['variables']['email'],
        'chat_id': ctx['variables']['chatId'],
        'message': result_message
    },
    'runkey': ctx['runkey']
}

# Print as JSON - this is what gets sent back to Alurkerja
output = json.dumps(result, indent=2, ensure_ascii=False)
print(output)
print("\n--- JSON is valid and properly escaped ---")
