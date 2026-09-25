#!/usr/bin/env python3
"""
Fetch Odoo Journals Script
Script untuk mengambil data journal dari Odoo berdasarkan company_id.
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


def fetch_journals(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    company_id: int,
    journal_type: Optional[str] = None,
    limit: int = 999,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Mengambil journals dari Odoo berdasarkan company_id
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        config: Konfigurasi Odoo
        company_id: ID company untuk filter journals
        journal_type: Tipe journal untuk filter (opsional: 'sale', 'purchase', 'cash', 'bank', 'general')
        limit: Jumlah maksimal record yang dikembalikan (default: 100)
        offset: Offset untuk pagination (default: 0)
    
    Returns:
        list: List of journal records
    """
    # Prepare domain filters
    domain = [('company_id', '=', company_id)]
    if journal_type:
        domain.append(('type', '=', journal_type))

    journals = _execute_kw(
        auth_info,
        'account.journal',
        'search_read',
        args=[domain],
        kwargs={
            "fields": [
                'id', 'sequence', 'name', 'type', 'code',
                'default_account_id', 'active', 'company_id',
            ],
            "limit": limit,
            "offset": offset,
            "order": "sequence, name",
            "context": {
                "lang": "en_US",
                "tz": "UTC",
                "uid": auth_info['uid'],
            },
        },
    ) or []

    if not isinstance(journals, list):
        raise Exception(f"Unexpected response format. Expected list, got: {type(journals)}")

    return journals


def get_journal_count(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    company_id: int,
    journal_type: Optional[str] = None
) -> int:
    """
    Mendapatkan total count journals untuk pagination
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        config: Konfigurasi Odoo
        company_id: ID company untuk filter journals
        journal_type: Tipe journal untuk filter (opsional)
    
    Returns:
        int: Total count journals
    """
    # Prepare domain filters
    domain = [('company_id', '=', company_id)]
    if journal_type:
        domain.append(('type', '=', journal_type))

    return _execute_kw(
        auth_info,
        'account.journal',
        'search_count',
        args=[domain],
        kwargs={
            "context": {
                "lang": "en_US",
                "tz": "UTC",
                "uid": auth_info['uid'],
            },
        },
    ) or 0


def format_journal_data(journals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Format data journal untuk response yang konsisten
    
    Args:
        journals: Raw journal data dari Odoo
    
    Returns:
        list: Formatted journal data
    """
    formatted_journals = []
    
    for journal in journals:
        try:
            # Extract company info
            company_data = journal.get('company_id', [])
            company_id = company_data[0] if isinstance(company_data, list) and company_data else company_data
            company_name = company_data[1] if isinstance(company_data, list) and len(company_data) > 1 else str(company_data)
            
            # Extract default account info
            default_account_data = journal.get('default_account_id', [])
            default_account_id = default_account_data[0] if isinstance(default_account_data, list) and default_account_data else default_account_data
            default_account_name = default_account_data[1] if isinstance(default_account_data, list) and len(default_account_data) > 1 else str(default_account_data)
            
            formatted_journal = {
                'id': journal.get('id'),
                'sequence': journal.get('sequence', 0),
                'name': journal.get('name', ''),
                'type': journal.get('type', ''),
                'code': journal.get('code', ''),
                'default_account': {
                    'id': default_account_id,
                    'name': default_account_name
                } if default_account_id else None,
                'active': journal.get('active', True),
                'company': {
                    'id': company_id,
                    'name': company_name
                }
            }
            
            formatted_journals.append(formatted_journal)
        except Exception as e:
            # Log error but continue with other journals
            print(f"Warning: Error formatting journal {journal.get('id', 'unknown')}: {e}", file=sys.stderr)
            continue
    
    return formatted_journals


def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function untuk mengambil journals dari Odoo
    
    Args:
        input_data: Input data sesuai General Action Executor contract
    
    Returns:
        dict: Result dalam format General Action Executor
            {
                "status": "ok|error",
                "data": {
                    "journals": [...],
                    "total_count": 10,
                    "limit": 100,
                    "offset": 0,
                    "company_id": 1
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
        
        # Validate required parameters
        company_id = parameters.get('company_id')
        if company_id is None:
            raise ValueError("Missing required parameter: company_id")
        
        company_id = int(company_id)
        
        # Extract optional parameters
        journal_type = parameters.get('journal_type')
        limit = int(parameters.get('limit', 100))
        offset = int(parameters.get('offset', 0))
        
        # Validate journal_type if provided
        valid_types = ['sale', 'purchase', 'cash', 'bank', 'general']
        if journal_type and journal_type not in valid_types:
            raise ValueError(f"Invalid journal_type. Must be one of: {', '.join(valid_types)}")
        
        # Step 1: Authenticate
        auth_info = authenticate_odoo(config)
        
        # Step 2: Get total count for pagination
        total_count = get_journal_count(
            auth_info,
            config,
            company_id,
            journal_type=journal_type
        )
        
        # Step 3: Fetch journals
        journals = fetch_journals(
            auth_info,
            config,
            company_id,
            journal_type=journal_type,
            limit=limit,
            offset=offset
        )
        
        # Step 4: Format journal data
        formatted_journals = format_journal_data(journals)
        
        # Return success response
        return {
            "status": "ok",
            "data": {
                "journals": formatted_journals,
                "total_count": total_count,
                "current_count": len(formatted_journals),
                "limit": limit,
                "offset": offset,
                "company_id": company_id,
                "journal_type": journal_type
            },
            "message": f"Successfully fetched {len(formatted_journals)} of {total_count} journal{'s' if total_count != 1 else ''} for company {company_id}"
        }
        
    except Exception as e:
        # Return error response with more details
        import traceback
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch journals",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


if __name__ == "__main__":
    # Parsing argument
    parser = argparse.ArgumentParser(description='Fetch journals from Odoo by company_id')
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