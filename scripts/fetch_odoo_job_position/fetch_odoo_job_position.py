#!/usr/bin/env python3
"""
Fetch Odoo Job Position Script
Script untuk mengambil data job position dari Odoo menggunakan sistem script.
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


def search_job_positions(
    auth_info: Dict[str, Any],
    config: Dict[str, str],
    search_term: Optional[str] = None,
    department: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Mencari job positions di Odoo
    
    Args:
        auth_info: Informasi autentikasi dari authenticate_odoo()
        config: Konfigurasi Odoo
        search_term: Term pencarian untuk nama job position (opsional)
        department: Department filter (opsional)
        limit: Jumlah maksimal record yang dikembalikan (default: 100)
        offset: Offset untuk pagination (default: 0)
    
    Returns:
        list: List of job position records
    """
    job_positions_raw = _execute_kw(
        auth_info,
        'hr.job',
        'name_search',
        args=[search_term or ""],
        kwargs={"operator": "ilike", "limit": limit},
    ) or []
    job_positions = []
    
    for job_data in job_positions_raw:
        if isinstance(job_data, list) and len(job_data) >= 2:
            # Format: [id, display_name]
            job_positions.append({
                'id': job_data[0],
                'display_name': job_data[1]
            })
        elif isinstance(job_data, dict):
            # Format: {'id': 10, 'display_name': 'Name', ...}
            job_positions.append({
                'id': job_data.get('id'),
                'display_name': job_data.get('display_name')
            })
    
    return job_positions


def format_job_position_data(job_positions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Format job position data untuk output
    
    Args:
        job_positions: List of raw job position records from Odoo
    
    Returns:
        list: Formatted job position data with id and display_name only
    """
    formatted_job_positions = []
    
    for job_position in job_positions:
        formatted_job_position = {
            "id": job_position.get('id'),
            "display_name": job_position.get('display_name')
        }
        
        formatted_job_positions.append(formatted_job_position)
    
    return formatted_job_positions


def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function untuk mengambil data job position dari Odoo
    
    Args:
        input_data: Input sesuai General Action Executor contract
            {
                "variables": {},
                "parameters": {
                    "search_term": "optional job position name to search",
                    "department": "optional department",
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
                    "job_positions": [...],
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
        department = parameters.get('department')
        limit = int(parameters.get('limit', 100))
        offset = int(parameters.get('offset', 0))
        
        # Step 1: Authenticate
        auth_info = authenticate_odoo(config)
        
        # Step 2: Search job positions
        job_positions = search_job_positions(
            auth_info,
            config,
            search_term=search_term,
            department=department,
            limit=limit,
            offset=offset
        )
        
        # Step 3: Format job position data
        formatted_job_positions = format_job_position_data(job_positions)
        
        # Return success response
        return {
            "status": "ok",
            "data": formatted_job_positions,
            "total_count": len(formatted_job_positions),
            "limit": limit,
            "offset": offset,
            "search_term": search_term,
            "department": department,
            "message": f"Successfully fetched {len(formatted_job_positions)} job position(s)"
        }
        
    except Exception as e:
        # Return error response with more details
        import traceback
        return {
            "status": "error",
            "data": {},
            "message": "Failed to fetch job positions",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


if __name__ == "__main__":
    # Parsing argument
    parser = argparse.ArgumentParser(description='Fetch job positions from Odoo')
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