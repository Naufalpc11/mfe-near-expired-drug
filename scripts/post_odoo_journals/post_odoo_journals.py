#!/usr/bin/env python3
"""
Post Odoo Journal Script
Script untuk membuat journal entry (account.move) di Odoo menggunakan sistem script.
Mengikuti General Action Executor contract.
"""

import sys
import json
import argparse
import requests
from datetime import datetime
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


def parse_date_format(date_str):
    """
    Parse berbagai format date dan konversi ke format YYYY-MM-DD untuk Odoo
    
    Args:
        date_str: String tanggal dalam berbagai format
    
    Returns:
        str: Tanggal dalam format YYYY-MM-DD
    """
    if not date_str:
        return date_str
    
    date_formats = [
        '%Y-%m-%d',
        '%d-%m-%Y',
        '%d/%m/%Y',
        '%Y/%m/%d',
        '%m-%d-%Y',
        '%m/%d/%Y',
    ]
    
    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str.strip(), fmt)
            return parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    raise ValueError(f"Date format '{date_str}' tidak dikenali. Format yang didukung: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD, MM-DD-YYYY, MM/DD/YYYY")


def create_journal_entry(
    auth_info: Dict[str, Any],
    journal_id: int,
    date: str,
    ref: str,
    line_ids: List[Dict],
    company_id: int = 1
) -> Dict[str, Any]:
    """
    Membuat journal entry di Odoo
    
    Args:
        auth_info: Informasi autentikasi
        journal_id: ID journal
        date: Tanggal journal entry
        ref: Reference/memo
        line_ids: List of journal items (debit/credit lines, dapat menyertakan partner_id)
        company_id: ID company
    
    Returns:
        dict: Journal entry info
    """
    # Format line_ids untuk Odoo
    formatted_lines = []
    for idx, line in enumerate(line_ids):
        debit = float(line.get('debit', 0))
        credit = float(line.get('credit', 0))

        line_vals = {
            'account_id': int(line['account_id']) if line.get('account_id') else None,
            'name': line.get('name', '/'),
            'debit': debit,
            'credit': credit,
        }

        # Calculate and add balance
        # First line: balance = -1 * debit
        # Other lines: balance = debit - credit
        if idx == 0:
            line_vals['balance'] = -1 * debit
        else:
            line_vals['balance'] = credit

        # Add partner_id if provided in line item (convert to int)
        if line.get('partner_id'):
            line_vals['partner_id'] = int(line['partner_id'])

        # Add analytic account if provided (convert to int)
        if line.get('analytic_account_id'):
            line_vals['analytic_account_id'] = int(line['analytic_account_id'])

        formatted_lines.append((0, 0, line_vals))

    create_vals = {
        "journal_id": int(journal_id),
        "date": date,
        "ref": ref,
        "company_id": int(company_id),
        "line_ids": formatted_lines,
    }

    print("\n=== DEBUG: Create Journal Entry Values ===", file=sys.stderr)
    print(json.dumps(create_vals, indent=2, default=str), file=sys.stderr)
    print("==========================================\n", file=sys.stderr)

    move_id = _execute_kw(
        auth_info,
        'account.move',
        'create',
        args=[create_vals],
        kwargs={
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": auth_info['uid'],
                "allowed_company_ids": [int(company_id)],
            },
        },
    )

    if isinstance(move_id, int):
        return {'id': move_id}
    elif isinstance(move_id, list) and len(move_id) > 0:
        return {'id': move_id[0]}
    else:
        raise Exception(f"Could not extract journal entry ID from creation result: {move_id}")


def post_journal_entry(auth_info: Dict[str, Any], move_id: int) -> bool:
    """
    Post/confirm journal entry
    
    Args:
        auth_info: Informasi autentikasi
        move_id: ID journal entry yang akan di-post
    
    Returns:
        bool: True jika berhasil
    """
    print(f"\n=== DEBUG: Post Journal Entry move_id={move_id} ===\n", file=sys.stderr)

    _execute_kw(
        auth_info,
        'account.move',
        'action_post',
        args=[[move_id]],
        kwargs={
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": auth_info['uid'],
            },
        },
    )

    return True


def validate_line_items(line_ids: List[Dict]) -> None:
    """
    Validasi line items untuk memastikan balance
    
    Args:
        line_ids: List of journal items
    
    Raises:
        Exception: Jika total debit != total credit
    """
    total_debit = sum(float(line.get('debit', 0)) for line in line_ids)
    total_credit = sum(float(line.get('credit', 0)) for line in line_ids)
    
    if abs(total_debit - total_credit) > 0.01:  # Allow small rounding differences
        raise Exception(f"Journal entry is not balanced. Total Debit: {total_debit}, Total Credit: {total_credit}")
    
    if len(line_ids) < 2:
        raise Exception("Journal entry must have at least 2 lines (debit and credit)")


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
    
    parameters = ctx.get("parameters", {})
    configuration = ctx.get("configuration", {})
    runkey = ctx.get("runkey", "")
    
    # Validasi required parameters
    required_params = ["journal_id", "date", "line_ids"]
    for param in required_params:
        if param not in parameters:
            return {
                "status": "error",
                "data": {},
                "message": f"Missing required parameter: {param}",
                "error": f"MISSING_PARAMETER_{param.upper()}",
                "runkey": runkey
            }
    
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
        
        # Step 2: Parse date
        formatted_date = parse_date_format(parameters["date"])
        
        # Step 3: Validate line items
        line_ids = parameters["line_ids"]
        validate_line_items(line_ids)
        
        # Step 4: Get optional parameters
        company_id = parameters.get("company_id", 1)
        auto_post = parameters.get("auto_post", True)
        ref = parameters.get("ref", "/")
        
        # Step 5: Create journal entry
        journal_result = create_journal_entry(
            auth_info,
            journal_id=parameters["journal_id"],
            date=formatted_date,
            ref=ref,
            line_ids=line_ids,
            company_id=company_id
        )
        
        move_id = journal_result['id']
        
        # Step 6: Post journal entry if auto_post is True
        posted = False
        if auto_post:
            post_journal_entry(auth_info, move_id)
            posted = True
        
        # Prepare result data
        data_result = {
            "created_at": datetime.now().isoformat(),
            "move_id": move_id,
            "journal_id": parameters["journal_id"],
            "date": formatted_date,
            "ref": ref,
            "company_id": company_id,
            "line_count": len(line_ids),
            "total_debit": sum(float(line.get('debit', 0)) for line in line_ids),
            "total_credit": sum(float(line.get('credit', 0)) for line in line_ids),
            "status": "posted" if posted else "draft"
        }
        
        return {
            "status": "ok",
            "message": f"Journal entry successfully created and {'posted' if posted else 'saved as draft'}",
            "data": data_result,
            "runkey": runkey
        }
        
    except Exception as e:
        return {
            "status": "error",
            "data": {},
            "message": "Failed to create journal entry",
            "error": str(e),
            "runkey": runkey
        }


def main():
    """Main function untuk handle command line arguments"""
    
    parser = argparse.ArgumentParser(
        description='Post Odoo Journal script - General Action Executor'
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
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        else:
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
            "message": f"Error executing post journal script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
