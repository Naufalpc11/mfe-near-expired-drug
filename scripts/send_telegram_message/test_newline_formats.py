#!/usr/bin/env python3
"""Test berbagai format newline"""

import json
import re

def replace_placeholders(message: str, variables: dict) -> str:
    """Test version of replace_placeholders"""
    pattern = r'\$\{([^}]+)\}'
    
    def replace(match):
        key = match.group(1)
        value = variables.get(key, match.group(0))
        value_str = str(value)
        # Handle double-escaped newlines (\\n -> \n)
        value_str = value_str.replace('\\\\n', '\n')
        # Handle single-escaped newlines (\n -> actual newline)
        value_str = value_str.replace('\\n', '\n')
        return value_str
    
    result = re.sub(pattern, replace, message)
    # Handle double-escaped newlines (\\n -> \n)
    result = result.replace('\\\\n', '\n')
    # Handle single-escaped newlines (\n -> actual newline)
    result = result.replace('\\n', '\n')
    
    return result

# Test cases
print("=== Test 1: Single escaped \\n ===")
vars1 = {
    'recommendation': '- item 1\n- item 2\n- item 3'
}
msg1 = 'Rekomendasi:\n${recommendation}'
result1 = replace_placeholders(msg1, vars1)
print(repr(result1))
print(result1)

print("\n=== Test 2: Double escaped \\\\n ===")
vars2 = {
    'recommendation': '- item 1\\n- item 2\\n- item 3'
}
msg2 = 'Rekomendasi:\\n${recommendation}'
result2 = replace_placeholders(msg2, vars2)
print(repr(result2))
print(result2)

print("\n=== Test 3: JSON parse dari string ===")
json_str = '{"recommendation": "- ya ini\\n- gitu juga bisa\\n- adalah pokoknya"}'
data = json.loads(json_str)
msg3 = 'Test:\\n${recommendation}'
result3 = replace_placeholders(msg3, data)
print(repr(result3))
print(result3)

print("\n=== Test 4: Actual newlines (literal) ===")
vars4 = {
    'recommendation': '''- item 1
- item 2
- item 3'''
}
msg4 = 'Rekomendasi:\n${recommendation}'
result4 = replace_placeholders(msg4, vars4)
print(repr(result4))
print(result4)

print("\n=== All tests completed ===")
