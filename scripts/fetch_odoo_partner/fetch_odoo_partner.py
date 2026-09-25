#!/usr/bin/env python3
"""
Fetch Odoo Partner Script
Script untuk mengambil data partner/vendor dari Odoo menggunakan sistem script.
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


def search_partners(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    search_term: Optional[str] = None,
    partner_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Mencari partners/vendors di Odoo
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        config: Konfigurasi Odoo
        search_term: Term pencarian untuk nama partner (opsional)
        partner_type: Tipe partner - 'supplier' atau 'customer' (opsional, default: supplier)
        limit: Jumlah maksimal record yang dikembalikan (default: 100)
        offset: Offset untuk pagination (default: 0)
    
    Returns:
        list: List of partner records
    """
    # Build domain filter for company partners only
    domain = [
        "|",
        ["parent_id", "=", False],
        ["is_company", "=", True],
    ]

    partners_raw = _execute_kw(
        auth_info,
        'res.partner',
        'name_search',
        args=[search_term or ""],
        kwargs={
            "operator": "ilike",
            "limit": limit,
            "args": domain,
        },
    ) or []

    partners = []
    
    for partner_data in partners_raw:
        if isinstance(partner_data, list) and len(partner_data) >= 2:
            # Format: [id, display_name]
            partners.append({
                'id': partner_data[0],
                'display_name': partner_data[1]
            })
        elif isinstance(partner_data, dict):
            # Format: {'id': 10, 'display_name': 'Name', ...}
            partners.append({
                'id': partner_data.get('id'),
                'display_name': partner_data.get('display_name')
            })
    
    return partners


def get_partner_bank_accounts(
    auth_info: Dict[str, Any],
    partner_id: int
) -> List[Dict[str, Any]]:
    """
    Mengambil informasi rekening bank dari partner
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        partner_id: ID partner/vendor
    
    Returns:
        list: List of bank account records
    """
    return _execute_kw(
        auth_info,
        'res.partner.bank',
        'search_read',
        args=[[['partner_id', '=', partner_id]]],
        kwargs={
            "fields": [
                "id", "acc_number", "acc_holder_name",
                "bank_id", "bank_name", "partner_id",
            ],
        },
    ) or []


def format_partner_data(
    partners: List[Dict[str, Any]],
    include_bank_accounts: bool = False,
    auth_info: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Format partner data untuk output
    
    Args:
        partners: List of raw partner records from Odoo
        include_bank_accounts: Not used (kept for compatibility)
        auth_info: Not used (kept for compatibility)
    
    Returns:
        list: Formatted partner data with id and display_name only
    """
    formatted_partners = []
    
    for partner in partners:
        formatted_partner = {
            "id": partner.get('id'),
            "display_name": partner.get('display_name')
        }
        
        formatted_partners.append(formatted_partner)
    
    return formatted_partners


def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function untuk mengambil data partner dari Odoo
    
    Args:
        input_data: Input sesuai General Action Executor contract
            {
                "variables": {},
                "parameters": {
                    "search_term": "optional vendor name to search",
                    "partner_type": "supplier|customer",
                    "limit": 100,
                    "offset": 0,
                    "include_bank_accounts": true/false
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
                    "partners": [...],
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
        partner_type = parameters.get('partner_type', 'supplier')
        limit = int(parameters.get('limit', 100))
        offset = int(parameters.get('offset', 0))
        include_bank_accounts = parameters.get('include_bank_accounts', False)
        
        # Step 1: Authenticate
        auth_info = authenticate_odoo(config)
        
        # Step 2: Search partners
        partners = search_partners(
            auth_info,
            config,
            search_term=search_term,
            partner_type=partner_type,
            limit=limit,
            offset=offset
        )
        
        # Step 3: Format partner data
        formatted_partners = format_partner_data(partners)
        
        # Return success response
        return {
            "status": "ok",
            "data": formatted_partners,
            "total_count": len(formatted_partners),
            "limit": limit,
            "offset": offset,
            "search_term": search_term,
            "partner_type": partner_type,
            "message": f"Successfully fetched {len(formatted_partners)} partner(s)"
        }
        
    except Exception as e:
        # Return error response with more details
        import traceback
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch partners",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


if __name__ == "__main__":
    # Parsing argument
    parser = argparse.ArgumentParser(description='Fetch partners from Odoo')
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
