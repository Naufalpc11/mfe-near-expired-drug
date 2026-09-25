#!/usr/bin/env python3
"""
Script to get record from vanya_telegram_chat table by email
Execution: python3 get_record_by_email.py --run <execution_context>
"""

import json
import sys
import argparse
import psycopg2
from typing import Dict, Any, Optional
from datetime import date, datetime


def serialize_value(value):
    """Convert non-JSON-serializable values to strings"""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def get_record_by_email(db_config: Dict[str, Any], email: str) -> Optional[Dict[str, Any]]:
    """
    Get record from vanya_telegram_chat table by email
    
    Args:
        db_config: Database configuration (host, port, database, user, password)
        email: Email to search for
        
    Returns:
        Dictionary with record data or None if not found
    """
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        
        cursor = conn.cursor()
        
        # Query vanya_telegram_chat table by email
        cursor.execute(
            "SELECT * FROM vanya_telegram_chat WHERE username = %s LIMIT 1;",
            (email,)
        )
        
        row = cursor.fetchone()
        
        if row:
            columns = [desc[0] for desc in cursor.description]
            record = {key: serialize_value(value) for key, value in dict(zip(columns, row)).items()}
        else:
            record = None
        
        cursor.close()
        conn.close()
        
        return record
        
    except psycopg2.Error as e:
        raise Exception(f"Database error: {str(e)}")


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function
    
    Args:
        ctx: Execution context with variables, parameters, configuration, runkey
        
    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        # Extract parameters
        parameters = ctx.get('parameters', {})
        email = parameters.get('email', '').strip()
        
        if not email:
            return {
                "status": "error",
                "message": "Email parameter is required",
                "data": None,
                "runkey": ctx.get('runkey', '')
            }
        
        # Extract database configuration
        config = ctx.get('configuration', {})
        db_config = {
            'host': config.get('db_host'),
            'port': config.get('db_port', 5432),
            'database': config.get('db_name'),
            'user': config.get('db_user'),
            'password': config.get('db_password')
        }
        
        # Validate database configuration
        required_fields = ['host', 'database', 'user', 'password']
        missing_fields = [f for f in required_fields if not db_config.get(f)]
        
        if missing_fields:
            return {
                "status": "error",
                "message": f"Missing database configuration: {', '.join(missing_fields)}",
                "data": None,
                "runkey": ctx.get('runkey', '')
            }
        
        # Get record from database
        record = get_record_by_email(db_config, email)
        
        if record:
            return {
                "status": "success",
                "message": f"Record found for email: {email}",
                "data": {
                    "email": email,
                    "record": record,
                    "found": True
                },
                "runkey": ctx.get('runkey', '')
            }
        else:
            return {
                "status": "success",
                "message": f"No record found for email: {email}",
                "data": {
                    "email": email,
                    "record": None,
                    "found": False
                },
                "runkey": ctx.get('runkey', '')
            }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Execution failed: {str(e)}",
            "data": None,
            "runkey": ctx.get('runkey', '')
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description='Get record from vanya_telegram_chat by username')
    parser.add_argument('--run', required=True, 
                       help='Execution context (JSON file or JSON string)')
    
    args = parser.parse_args()
    
    try:
        # Parse input
        if args.run.startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        
        # Execute action
        result = run(ctx)
        
        # Output result
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result['status'] == 'success' else 1)
        
    except json.JSONDecodeError as e:
        error_result = {
            "status": "error",
            "message": f"Invalid JSON input: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)
        
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Script execution failed: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)


if __name__ == '__main__':
    main()
