#!/usr/bin/env python3
"""
Post Data Payment Script
Script untuk menyimpan data payment ke Odoo menggunakan sistem script.
Mengikuti General Action Executor contract.
"""

import sys
import json
import argparse
import requests
from datetime import datetime
from typing import Any, Dict, Optional


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


def _execute_kw(session: Dict[str, Any], model: str, method: str,
                args: list, kwargs: Optional[dict] = None) -> Any:
    return _jsonrpc_call(
        session['base_url'],
        service='object',
        method='execute_kw',
        args=[
            session['db'],
            session['uid'],
            session['password'],
            model,
            method,
            args,
            kwargs or {},
        ],
    )


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
    
    # Daftar format yang mungkin diterima
    date_formats = [
        '%Y-%m-%d',      # 2026-01-21
        '%d-%m-%Y',      # 21-01-2026
        '%d/%m/%Y',      # 21/01/2026
        '%Y/%m/%d',      # 2026/01/21
        '%m-%d-%Y',      # 01-21-2026
        '%m/%d/%Y',      # 01/21/2026
    ]
    
    for fmt in date_formats:
        try:
            # Parse date dengan format yang diberikan
            parsed_date = datetime.strptime(date_str.strip(), fmt)
            # Konversi ke format yang diharapkan Odoo (YYYY-MM-DD)
            return parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    # Jika tidak ada format yang cocok, raise error dengan informasi yang jelas
    raise ValueError(f"Date format '{date_str}' tidak dikenali. Format yang didukung: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD, MM-DD-YYYY, MM/DD/YYYY")


def authenticate_odoo(config):
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
        "base_url": base_url,
        "uid": uid,
        "db": config['database'],
        "password": config['password'],
    }


def search_or_create_partner(session, vendor_name):
    """
    Cari partner berdasarkan nama vendor, atau buat baru jika tidak ditemukan
    
    Args:
        session: Session info dari autentikasi
        vendor_name: Nama vendor untuk dicari/dibuat
    
    Returns:
        dict: Partner info
    """
    partner_domain = [
        "&",
        "|",
        ["company_id", "=", False],
        ["company_id", "parent_of", [1]],
        "|",
        ["parent_id", "=", False],
        ["is_company", "=", True],
    ]

    partners = _execute_kw(
        session,
        'res.partner',
        'name_search',
        args=[vendor_name],
        kwargs={
            "operator": "ilike",
            "args": partner_domain,
            "limit": 8,
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": session['uid'],
                "allowed_company_ids": [1],
                "default_is_company": True,
            },
        },
    ) or []

    if partners:
        partner_data = partners[0]
        if isinstance(partner_data, dict):
            return {"value": partner_data.get('id'), "display_name": partner_data.get('display_name')}
        elif isinstance(partner_data, list) and len(partner_data) >= 2:
            return {"value": partner_data[0], "display_name": partner_data[1]}

    new_partner_result = _execute_kw(
        session,
        'res.partner',
        'create',
        args=[{
            "name": vendor_name,
            "is_company": True,
            "supplier_rank": 1,
        }],
        kwargs={
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": session['uid'],
                "allowed_company_ids": [1],
            },
        },
    )

    if isinstance(new_partner_result, dict) and 'id' in new_partner_result:
        new_partner_id = new_partner_result['id']
    elif isinstance(new_partner_result, int):
        new_partner_id = new_partner_result
    elif isinstance(new_partner_result, list) and new_partner_result:
        new_partner_id = new_partner_result[0]
    else:
        raise Exception(f"Could not extract partner ID from creation result: {new_partner_result}")

    return {"value": new_partner_id, "display_name": vendor_name}


def create_partner_bank(session, partner_id, account_number, vendor_name):
    """
    Create atau update bank account untuk partner
    
    Args:
        session: Session info dari autentikasi
        partner_id: ID partner
        account_number: Nomor rekening
        vendor_name: Nama pemegang akun
    
    Returns:
        dict: Bank account info
    """
    # Ensure partner_id is valid integer
    if not partner_id or not isinstance(partner_id, (int, str)) or (isinstance(partner_id, str) and not str(partner_id).isdigit()):
        raise Exception(f"Invalid partner_id: {partner_id}")
    partner_id_int = int(partner_id)

    bank_ctx = {
        "lang": "en_US",
        "tz": "Asia/Jakarta",
        "uid": session['uid'],
        "allowed_company_ids": [1],
    }
    bank_domain = [
        ["partner_id", "=", partner_id_int],
        ["acc_number", "=", str(account_number)],
    ]

    # Already exists?
    existing = _execute_kw(
        session,
        'res.partner.bank',
        'search_read',
        args=[bank_domain],
        kwargs={
            "fields": ["id", "acc_number", "partner_id"],
            "context": bank_ctx,
        },
    ) or []
    if existing:
        return {'id': existing[0]['id']}

    try:
        bank_id = _execute_kw(
            session,
            'res.partner.bank',
            'create',
            args=[{
                "acc_number": str(account_number),
                "partner_id": partner_id_int,
                "acc_holder_name": str(vendor_name),
            }],
            kwargs={"context": bank_ctx},
        )
    except Exception as create_err:
        # If a unique-constraint race fired between our search and our create,
        # fall back to searching again rather than failing the whole flow.
        msg = str(create_err).lower()
        if "unique" in msg and "account number" in msg:
            fallback = _execute_kw(
                session,
                'res.partner.bank',
                'search_read',
                args=[bank_domain],
                kwargs={
                    "fields": ["id", "acc_number", "partner_id"],
                    "context": bank_ctx,
                },
            ) or []
            if fallback:
                return {'id': fallback[0]['id']}
        raise Exception(f"Bank account creation failed: {create_err}")

    if isinstance(bank_id, int):
        return {'id': bank_id}
    elif isinstance(bank_id, list) and bank_id:
        return {'id': bank_id[0]}
    else:
        raise Exception(f"Could not extract bank account ID from creation result: {bank_id}")


def create_payment(session, partner_id, partner_bank_id, amount, date, memo):
    """
    Create payment record
    
    Args:
        session: Session info dari autentikasi
        partner_id: ID partner
        partner_bank_id: ID bank account partner
        amount: Jumlah pembayaran
        date: Tanggal pembayaran
        memo: Memo/catatan
    
    Returns:
        dict: Payment info
    """
    payment_vals = {
        "state": "draft",
        "partner_type": "supplier",
        "company_id": 1,
        "currency_id": 12,
        "payment_type": "outbound",
        "partner_id": partner_id,
        "amount": float(amount),
        "date": date,
        "memo": memo,
        "journal_id": 13,
        "payment_method_line_id": 4,
        "partner_bank_id": partner_bank_id,
    }

    payment_result = _execute_kw(
        session,
        'account.payment',
        'create',
        args=[payment_vals],
        kwargs={
            "context": {
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": session['uid'],
                "allowed_company_ids": [1],
                "default_payment_type": "outbound",
                "default_partner_type": "supplier",
                "default_move_journal_types": ["bank", "cash"],
            },
        },
    )

    if isinstance(payment_result, dict) and 'id' in payment_result:
        return payment_result
    elif isinstance(payment_result, int):
        return {'id': payment_result}
    elif isinstance(payment_result, list) and payment_result:
        return {'id': payment_result[0]}
    else:
        raise Exception(f"Could not extract payment ID from creation result: {payment_result}")


def confirm_payment(session, payment_id):
    """
    Konfirmasi payment (action_post)
    
    Args:
        session: Session info dari autentikasi
        payment_id: ID payment yang akan dikonfirmasi
    
    Returns:
        dict: Hasil konfirmasi
    """
    # Ensure payment_id is integer
    if isinstance(payment_id, dict):
        payment_id = payment_id.get('id', payment_id)
    payment_id = int(payment_id)

    result = _execute_kw(
        session,
        'account.payment',
        'action_post',
        args=[[payment_id]],
        kwargs={
            "context": {
                "default_payment_type": "outbound",
                "default_partner_type": "supplier",
                "default_move_journal_types": ["bank", "cash"],
                "lang": "en_US",
                "tz": "Asia/Jakarta",
                "uid": session['uid'],
                "allowed_company_ids": [1],
            },
        },
    )
    return result if result is not None else True


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
    
    # Validasi required parameters
    required_params = ["vendor_name", "amount", "goods_services", "date", "memo", "account_number"]
    for param in required_params:
        if param not in parameters:
            raise Exception(f"Missing required parameter: {param}")
    
    # Validasi required configuration
    required_config = ["url", "database", "username", "password"]
    for config in required_config:
        if config not in configuration:
            raise Exception(f"Missing required configuration: {config}")
    
    try:
        # Step 1: Authenticate dengan Odoo
        session = authenticate_odoo(configuration)
        
        # Step 2: Search or create partner berdasarkan vendor_name
        partner = search_or_create_partner(session, parameters["vendor_name"])
        partner_id = partner.get('value') if partner else None
        
        if not partner_id:
            raise Exception(f"Could not obtain valid partner ID. Partner result: {partner}")
        
        # Step 3: Create/Update partner bank account
        bank_result = create_partner_bank(
            session, 
            partner_id, 
            parameters["account_number"], 
            parameters["vendor_name"]
        )
        partner_bank_id = bank_result['id']

        # Step 4: Parse dan konversi format date
        formatted_date = parse_date_format(parameters["date"])
        
        # Step 5: Create payment
        payment_result = create_payment(
            session,
            partner_id,
            partner_bank_id,
            parameters["amount"],
            formatted_date,
            parameters["memo"]
        )
        payment_id = payment_result['id']
        
        # Step 6: Confirm payment
        payment_id_int = payment_result['id']
        confirm_result = confirm_payment(session, payment_id_int)
        
        # Prepare result data
        data_result = {
            "created_at": datetime.now().isoformat(),
            "partner_id": partner_id,
            "partner_name": parameters["vendor_name"],
            "partner_bank_id": partner_bank_id,
            "payment_id": payment_id,
            "amount": float(parameters["amount"]),
            "date": formatted_date,  # Gunakan formatted date
            "memo": parameters["memo"],
            "account_number": parameters["account_number"],
            "goods_services": parameters["goods_services"],
            "status": "confirmed"
        }
        
        return {
            "status": "ok",
            "message": f"Payment for {parameters['vendor_name']} successfully created and confirmed",
            "data": data_result,
            "runkey": runkey
        }
        
    except Exception as e:
        raise Exception(f"Failed to create payment: {str(e)}")


def main():
    """Main function untuk handle command line arguments"""
    
    parser = argparse.ArgumentParser(
        description='Post data payment script - General Action Executor'
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
            "message": f"Error executing post payment script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
