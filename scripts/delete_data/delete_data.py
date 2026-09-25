#!/usr/bin/env python3
"""
Delete Data Script
Simulasi mendelete sebuah data berdasarkan ID yang diterima dari execution context.
Mengikuti General Action Executor contract.
"""

import sys
import json
import argparse
from datetime import datetime


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
    
    # Extract parameters dari context
    parameters = ctx.get("parameters", {})
    runkey = ctx.get("runkey", "")
    
    force = parameters.get("force", False)
    reason = parameters.get("reason", "")
    
    
    # Simulasi delete berhasil
    delete_type = "hard" if force else "soft"
    
    data_result = {
        "deleted_at": datetime.now().isoformat(),
        "delete_type": delete_type
    }
    
    # Tambahkan reason jika ada
    if reason:
        data_result["reason"] = reason
    
    return {
        "status": "ok",
        "message": "Data with ID successfully",
        "data": data_result,
        "runkey": runkey
    }


def main():
    """Main function untuk handle command line arguments"""
    
    parser = argparse.ArgumentParser(
        description='Delete data script - General Action Executor'
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
            "message": f"Error executing delete script: {str(e)}",
            "error": "EXECUTION_ERROR",
            "runkey": ""
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
