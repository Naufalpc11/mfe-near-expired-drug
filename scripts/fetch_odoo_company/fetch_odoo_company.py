#!/usr/bin/env python3
"""
Fetch Odoo Company Script
Script untuk mengambil data company dari Odoo menggunakan sistem script.
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
    """Pull the most informative message out of a JSON-RPC error envelope.

    Odoo's top-level `error.message` is almost always the generic
    "Odoo Server Error" — the real cause lives in `error.data.message`
    (user-facing) and `error.data.debug` (full traceback).
    """
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
    """Call Odoo's stateless external API at /jsonrpc.

    This endpoint is meant for headless integrations — no cookies, no CSRF,
    works the same way across Odoo versions (incl. 17/18/19).
    """
    response = requests.post(
        f"{base_url}/jsonrpc",
        json={
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": service,
                "method": method,
                "args": args,
            },
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


def authenticate_odoo(config: Dict[str, str]) -> Dict[str, Any]:
    """Authenticate against Odoo via /jsonrpc and return the uid.

    Args:
        config: { url, database, username, password }
                `password` may be an API key if the Odoo instance has
                "Require API key for external authentication" enabled.

    Returns:
        dict: { uid, base_url, db, password }  (password kept so subsequent
               execute_kw calls can be made — that's how Odoo's external API
               works, it has no session.)
    """
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


def search_companies(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    search_term: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Look up companies via res.company.name_search using execute_kw."""
    result = _jsonrpc_call(
        auth_info['base_url'],
        service='object',
        method='execute_kw',
        args=[
            auth_info['db'],
            auth_info['uid'],
            auth_info['password'],
            'res.company',
            'name_search',
            [search_term or ''],
            {'operator': 'ilike', 'limit': limit},
        ],
    )

    companies_raw = result or []
    companies = []
    for company_data in companies_raw:
        if isinstance(company_data, list) and len(company_data) >= 2:
            companies.append({
                'id': company_data[0],
                'display_name': company_data[1],
            })
        elif isinstance(company_data, dict):
            companies.append({
                'id': company_data.get('id'),
                'display_name': company_data.get('display_name'),
            })

    return companies


def format_company_data(
    companies: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Format company data untuk output
    
    Args:
        companies: List of raw company records from Odoo
    
    Returns:
        list: Formatted company data with id and display_name only
    """
    formatted_companies = []
    
    for company in companies:
        formatted_company = {
            "id": company.get('id'),
            "display_name": company.get('display_name')
        }
        
        formatted_companies.append(formatted_company)
    
    return formatted_companies


def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function untuk mengambil data company dari Odoo
    
    Args:
        input_data: Input sesuai General Action Executor contract
            {
                "variables": {},
                "parameters": {
                    "search_term": "optional company name to search",
                    "limit": 100,
                    "offset": 0
                },
                "configuration": {
                    "url": "odoo-instance-url",
                    "database": "db_name",
                    "username": "username",
                    "password": "password"
                },
                "runkey": "unique-run-key"
            }
    
    Returns:
        dict: Result dalam format General Action Executor
            {
                "status": "ok|error",
                "data": {
                    "companies": [...],
                    "total_count": 10,
                    "limit": 100,
                    "offset": 0
                },
                "message": "...",
                "error": "..." (if status == "error")
            }
    """
    try:
        # Extract parameters
        config = input_data.get('configuration', {})
        parameters = input_data.get('parameters', {})
        
        # Validate required configuration
        required_config = ['url', 'database', 'username', 'password']
        for field in required_config:
            if not config.get(field):
                raise ValueError(f"Missing required configuration: {field}")
        
        # Extract search parameters
        search_term = parameters.get('search_term')
        limit = int(parameters.get('limit', 100))
        offset = int(parameters.get('offset', 0))
        
        # Step 1: Authenticate
        auth_info = authenticate_odoo(config)
        
        # Step 2: Search companies
        companies = search_companies(
            auth_info,
            config,
            search_term=search_term,
            limit=limit,
            offset=offset
        )
        
        # Step 3: Format company data
        formatted_companies = format_company_data(companies)
        
        # Return success response
        return {
            "status": "ok",
            "data": formatted_companies,
            "total_count": len(formatted_companies),
            "limit": limit,
            "offset": offset,
            "search_term": search_term,
            "message": f"Successfully fetched {len(formatted_companies)} compan{'y' if len(formatted_companies) == 1 else 'ies'}"
        }
        
    except Exception as e:
        # Return error response with more details
        import traceback
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch companies",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


if __name__ == "__main__":
    # Parsing argument
    parser = argparse.ArgumentParser(description='Fetch companies from Odoo')
    parser.add_argument('--run', required=True, help='JSON input atau path ke file JSON')
    
    args = parser.parse_args()
    
    # Parse input JSON
    try:
        # Try to parse as JSON string first
        try:
            input_data = json.loads(args.run)
        except json.JSONDecodeError:
            # If fails, treat as file path
            with open(args.run, 'r') as f:
                input_data = json.load(f)
        
        # Execute main function
        result = main(input_data)
        
        # Print result as JSON
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
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
