#!/usr/bin/env python3
"""
Fetch Odoo Account Script
Script untuk mengambil data chart of accounts dari Odoo menggunakan sistem script.
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


def fetch_accounts(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    search_term: Optional[str] = None,
    account_type: Optional[str] = None,
    company_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Mengambil data chart of accounts dari Odoo
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        config: Konfigurasi Odoo
        search_term: Term pencarian untuk kode atau nama akun (opsional)
        account_type: Tipe akun - 'asset_receivable', 'asset_cash', 'asset_current', 
                      'asset_non_current', 'asset_prepayments', 'asset_fixed',
                      'liability_payable', 'liability_credit_card', 'liability_current',
                      'liability_non_current', 'equity', 'equity_unaffected',
                      'income', 'income_other', 'expense', 'expense_depreciation',
                      'expense_direct_cost', 'off_balance' (opsional)
        company_id: ID perusahaan (opsional, default: 1)
        limit: Jumlah maksimal record yang dikembalikan (default: 100)
        offset: Offset untuk pagination (default: 0)
    
    Returns:
        list: List of account records
    """
    # Build domain filter
    domain = []

    # Filter by company (Odoo 17+ uses company_ids as Many2many field)
    if company_id:
        domain.append(['company_ids', 'in', [company_id]])

    # Filter by search term (kode atau nama)
    if search_term:
        domain.append('|')
        domain.append(['code', 'ilike', search_term])
        domain.append(['name', 'ilike', search_term])

    # Filter by account type
    if account_type:
        domain.append(['account_type', '=', account_type])

    accounts = _execute_kw(
        auth_info,
        'account.account',
        'search_read',
        args=[domain],
        kwargs={
            "fields": [
                "id", "code", "name", "account_type", "reconcile",
                "currency_id", "company_ids", "create_date", "write_date",
            ],
            "limit": limit,
            "offset": offset,
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": auth_info['uid'],
                "allowed_company_ids": [company_id] if company_id else [1],
            },
        },
    ) or []
    
    # Format data
    formatted_accounts = []
    for account in accounts:
        formatted_account = {
            'id': account.get('id'),
            'code': account.get('code', ''),
            'name': account.get('name', ''),
            'display_name': f"{account.get('code', '')} {account.get('name', '')}".strip(),
            'account_type': account.get('account_type', ''),
            'reconcile': account.get('reconcile', False),
            'currency_id': format_relation_field(account.get('currency_id')),
            'company_ids': account.get('company_ids', []),
            'create_date': account.get('create_date', ''),
            'write_date': account.get('write_date', '')
        }
        formatted_accounts.append(formatted_account)
    
    return formatted_accounts


def format_relation_field(field_value):
    """
    Format relational field yang bisa berupa [id, name] atau False
    
    Args:
        field_value: Field value dari Odoo (bisa [id, name] atau False)
    
    Returns:
        dict atau None: {'id': id, 'name': name} atau None
    """
    if not field_value or field_value is False:
        return None
    
    if isinstance(field_value, list) and len(field_value) >= 2:
        return {
            'id': field_value[0],
            'name': field_value[1]
        }
    
    return None


def get_account_types_info():
    """
    Mengembalikan informasi tentang tipe-tipe akun yang tersedia
    
    Returns:
        dict: Informasi tipe akun
    """
    return {
        "asset_receivable": "Receivable",
        "asset_cash": "Bank and Cash",
        "asset_current": "Current Assets",
        "asset_non_current": "Non-current Assets",
        "asset_prepayments": "Prepayments",
        "asset_fixed": "Fixed Assets",
        "liability_payable": "Payable",
        "liability_credit_card": "Credit Card",
        "liability_current": "Current Liabilities",
        "liability_non_current": "Non-current Liabilities",
        "equity": "Equity",
        "equity_unaffected": "Current Year Earnings",
        "income": "Income",
        "income_other": "Other Income",
        "expense": "Expenses",
        "expense_depreciation": "Depreciation",
        "expense_direct_cost": "Cost of Revenue",
        "off_balance": "Off-Balance Sheet"
    }


def run(ctx):
    """
    Entry point untuk action script (wajib bernama 'run')
    
    Args:
        ctx: Execution context dengan struktur:
            - variables: Data runtime (dapat dimodifikasi)
            - parameters: Parameter dari user/trigger (read-only)
            - configuration: Konfigurasi addon/plugin
            - runkey: Unique identifier untuk tracing
    
    Returns:
        dict: Response dengan format standard
    """
    
    # Extract parameters dan configuration dari context
    parameters = ctx.get("parameters", {})
    configuration = ctx.get("configuration", {})
    runkey = ctx.get("runkey", "")
    
    # Validasi required configuration
    required_config = ["url", "database", "username", "password"]
    for config in required_config:
        if config not in configuration:
            return {
                "status": "error",
                "data": {},
                "message": f"Missing required configuration: {config}",
                "error": f"MISSING_CONFIG_{config.upper()}",
                "runkey": runkey
            }
    
    try:
        # Step 1: Authenticate dengan Odoo
        auth_info = authenticate_odoo(configuration)
        
        # Step 2: Extract parameters dengan default values
        search_term = parameters.get("search_term", None)
        account_type = parameters.get("account_type", None)
        company_id = parameters.get("company_id", 1)
        limit = parameters.get("limit", 999)
        offset = parameters.get("offset", 0)
        include_types_info = parameters.get("include_types_info", False)
        
        # Validasi limit dan offset
        try:
            limit = int(limit)
            offset = int(offset)
            if company_id:
                company_id = int(company_id)
        except (ValueError, TypeError):
            return {
                "status": "error",
                "data": {},
                "message": "Invalid parameter type: limit, offset, and company_id must be integers",
                "error": "INVALID_PARAMETER_TYPE",
                "runkey": runkey
            }
        
        # Step 3: Fetch accounts dari Odoo
        accounts = fetch_accounts(
            auth_info,
            configuration,
            search_term=search_term,
            account_type=account_type,
            company_id=company_id,
            limit=limit,
            offset=offset
        )
        
        # Prepare result data
        data_result = {
            "accounts": accounts,
            "total_count": len(accounts),
            "limit": limit,
            "offset": offset,
            "search_term": search_term,
            "account_type": account_type,
            "company_id": company_id
        }
        
        # Add account types info if requested
        if include_types_info:
            data_result["account_types"] = get_account_types_info()
        
        return {
            "status": "ok",
            "data": data_result,
            "message": f"Successfully fetched {len(accounts)} account(s)",
            "runkey": runkey
        }
        
    except Exception as e:
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch accounts",
            "error": str(e),
            "runkey": runkey
        }


def main():
    """Main function untuk handle command line arguments"""
    
    parser = argparse.ArgumentParser(
        description='Fetch Odoo Account script - General Action Executor'
    )
    
    parser.add_argument(
        '--run',
        type=str,
        required=True,
        help='Execution context (JSON file path or JSON string)'
    )
    
    try:
        args = parser.parse_args()
        
        # Parse execution context
        if args.run.endswith('.json'):
            # Load dari file
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        else:
            # Parse dari JSON string
            ctx = json.loads(args.run)
        
        # Execute action via run entry point
        result = run(ctx)
        
        # Output JSON ke stdout
        print(json.dumps(result, indent=2))
        
        # Exit code berdasarkan status
        exit_code = 0 if result.get("status") == "ok" else 1
        sys.exit(exit_code)
        
    except json.JSONDecodeError as e:
        error_response = {
            "status": "error",
            "message": f"Invalid JSON format: {str(e)}",
            "error": "INVALID_INPUT",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(2)
        
    except Exception as e:
        error_response = {
            "status": "error",
            "message": f"Error executing fetch account script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
