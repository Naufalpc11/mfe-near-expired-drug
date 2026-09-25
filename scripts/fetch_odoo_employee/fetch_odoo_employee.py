#!/usr/bin/env python3
"""
Fetch Odoo Employee Script
Script untuk mengambil data employee dari Odoo menggunakan sistem script.
Mengikuti General Action Executor contract.
"""

import sys
import json
import argparse
import requests
from typing import Dict, List, Any, Optional


def _normalize_base_url(url: str) -> str:
    base_url = url.rstrip('/')
    if not base_url.startswith('http'):
        base_url = f"https://{base_url}"
    return base_url


def _extract_odoo_error(error: Dict[str, Any]) -> str:
    if not isinstance(error, dict):
        return str(error)
    data = error.get('data') or {}
    return (
        data.get('message')
        or data.get('debug')
        or error.get('message')
        or 'Unknown Odoo error'
    )


def _jsonrpc_call(base_url: str, service: str, method: str, args: list) -> Any:
    response = requests.post(
        f"{base_url}/jsonrpc",
        json={
            "jsonrpc": "2.0",
            "method": "call",
            "params": {"service": service, "method": method, "args": args},
            "id": 1,
        },
        headers={'Content-Type': 'application/json'},
        timeout=30,
    )
    response.raise_for_status()
    body = response.json()
    if body.get('error'):
        raise Exception(_extract_odoo_error(body['error']))
    return body.get('result')


def _execute_kw(auth_info: Dict[str, Any], model: str, method: str,
                args: list, kwargs: Optional[dict] = None) -> Any:
    return _jsonrpc_call(
        auth_info['base_url'],
        service='object',
        method='execute_kw',
        args=[
            auth_info['db'],
            auth_info['uid'],
            auth_info['password'],
            model,
            method,
            args,
            kwargs or {},
        ],
    )


def authenticate_odoo(config: Dict[str, str]) -> Dict[str, Any]:
    """Authenticate via Odoo's external API (/jsonrpc, stateless)."""
    base_url = _normalize_base_url(config['url'])
    uid = _jsonrpc_call(
        base_url,
        service='common',
        method='authenticate',
        args=[config['database'], config['username'], config['password'], {}],
    )
    if not uid:
        raise Exception(
            "Login failed: Odoo returned no uid. "
            "Check database name, username, and password / API key."
        )
    return {
        'uid': uid,
        'base_url': base_url,
        'db': config['database'],
        'password': config['password'],
    }


def search_employees(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    search_term: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    employees_raw = _execute_kw(
        auth_info,
        'hr.employee',
        'name_search',
        args=[search_term or ""],
        kwargs={"operator": "ilike", "limit": limit},
    ) or []
    employees = []
    for emp in employees_raw:
        if isinstance(emp, list) and len(emp) >= 2:
            employees.append({
                'id': emp[0],
                'display_name': emp[1]
            })
        elif isinstance(emp, dict):
            employees.append({
                'id': emp.get('id'),
                'display_name': emp.get('display_name')
            })
    return employees


def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        config = input_data.get('configuration', {})
        parameters = input_data.get('parameters', {})
        required_config = ['url', 'database', 'username', 'password']
        for field in required_config:
            if not config.get(field):
                raise ValueError(f"Missing required configuration: {field}")
        search_term = parameters.get('search_term')
        limit = int(parameters.get('limit', 100))
        offset = int(parameters.get('offset', 0))
        auth_info = authenticate_odoo(config)
        employees = search_employees(
            auth_info,
            config,
            search_term=search_term,
            limit=limit,
            offset=offset
        )
        return {
            "status": "ok",
            "data": employees,
            "total_count": len(employees),
            "limit": limit,
            "offset": offset,
            "search_term": search_term,
            "message": f"Successfully fetched {len(employees)} employee(s)"
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch employees",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch employees from Odoo')
    parser.add_argument('--run', required=True, help='JSON input atau path ke file JSON')
    args = parser.parse_args()
    try:
        try:
            input_data = json.loads(args.run)
        except json.JSONDecodeError:
            with open(args.run, 'r') as f:
                input_data = json.load(f)
        result = main(input_data)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result['status'] == 'ok' else 1)
    except Exception as e:
        error_result = {
            "status": "error",
            "data": {},
            "message": "Failed to process input",
            "error": str(e)
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)
