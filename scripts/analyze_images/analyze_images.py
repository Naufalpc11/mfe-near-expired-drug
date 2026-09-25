#!/usr/bin/env python3
"""
Script to analyze a list of base64-encoded images using OpenAI Vision API.
Execution: python3 analyze_images.py --run <execution_context>
"""

import json
import re
import sys
import argparse
import requests
from typing import Dict, Any, Tuple


def _strip_markdown_fences(text: str) -> str:
    """
    Strip ```json ... ``` (or any ```lang ... ```) markdown code fences if
    present. Returns the inner content, or the original text if no fences.
    """
    if not isinstance(text, str):
        return text
    stripped = text.strip()
    match = re.match(r"^```[a-zA-Z0-9_-]*\s*\n?(.*?)\n?```\s*$", stripped, re.DOTALL)
    if match:
        return match.group(1).strip()
    return stripped


def _strip_data_uri(b64_str: str) -> Tuple[str, str]:
    """
    Strip data URI prefix if present.

    Returns:
        (raw_base64, mime_type) — mime_type is empty if no data URI prefix.
    """
    if b64_str.startswith("data:"):
        try:
            header, payload = b64_str.split(",", 1)
            mime = header[5:].split(";", 1)[0].strip().lower()
            return payload, mime
        except ValueError:
            return b64_str, ""
    return b64_str, ""


def _is_pdf(b64_payload: str, mime: str = "") -> bool:
    """
    Detect PDF by MIME type or by the base64-encoded magic bytes.
    `%PDF` encodes to `JVBERi` at the start of any base64 PDF payload.
    """
    if mime == "application/pdf":
        return True
    return b64_payload[:6] == "JVBERi"


def _build_content_block(entry: str, index: int) -> Dict[str, Any]:
    """
    Build a single OpenAI content block from a base64 string. PDFs are sent
    natively via the `file` content type; images are sent via `image_url`.
    """
    raw_payload, mime = _strip_data_uri(entry)

    if _is_pdf(raw_payload, mime):
        return {
            "type": "file",
            "file": {
                "filename": f"document_{index}.pdf",
                "file_data": f"data:application/pdf;base64,{raw_payload}",
            },
        }

    if mime.startswith("image/"):
        image_url = f"data:{mime};base64,{raw_payload}"
    else:
        image_url = f"data:image/jpeg;base64,{raw_payload}"

    return {
        "type": "image_url",
        "image_url": {"url": image_url},
    }


def analyze_images_with_openai(
    openai_token: str,
    images: list,
    prompt: str,
    model: str = "gpt-4o",
    max_tokens: int = 1000
) -> str:
    """
    Analyze a list of base64-encoded images (or PDFs) using OpenAI API.
    Images are sent via Vision API (`image_url`); PDFs are sent natively
    via the `file` content type (OpenAI extracts text + visual per page).

    Args:
        openai_token: OpenAI API token
        images: List of base64-encoded strings (image or PDF, raw or data URI)
        prompt: Prompt to send with the files
        model: OpenAI model to use (default: gpt-4o — must support PDF input)
        max_tokens: Maximum tokens for response (default: 1000)

    Returns:
        Analysis result as string
    """
    url = "https://api.openai.com/v1/chat/completions"

    content = [{"type": "text", "text": prompt}]

    for idx, img in enumerate(images):
        if not isinstance(img, str) or not img.strip():
            continue
        content.append(_build_content_block(img.strip(), idx))

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": content
            }
        ],
        "max_tokens": max_tokens
    }

    headers = {
        "Authorization": f"Bearer {openai_token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        try:
            resp_json = response.json()
        except Exception:
            resp_json = {"raw": response.text}

        if not response.ok:
            error_msg = resp_json.get("error", {}).get("message", response.text)
            raise Exception(f"OpenAI API error {response.status_code}: {error_msg}")

        raw_content = resp_json["choices"][0]["message"]["content"]
        return _strip_markdown_fences(raw_content)

    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to call OpenAI API: {str(e)}")


def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function.

    Args:
        ctx: Execution context with variables, parameters, configuration, runkey

    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        if ctx is None:
            return {
                "status": "error",
                "message": "Execution context is None or invalid",
                "data": None,
                "runkey": ""
            }

        runkey = ctx.get('runkey', '')

        # ── Parameters ────────────────────────────────────────────────────────
        # Default values — used when caller does not override via `parameters`
        DEFAULT_IMAGES_KEY = 'image_list'
        DEFAULT_PROMPT = (
            'Analisa nota/struk ini. Ekstrak informasi seperti: nama merchant, tanggal transaksi, '
            'item-item yang dibeli beserta harganya, total, keperluan reimbursement, dan informasi penting lainnya. '
            'hanya kembalikan json dengan format tanpa informasi type returnkan dalam bentuk string bukan markdown sehingga langsung bisa di parse dengan json.parse di javascript '
            'totalkan semua subtotal harga item, jika total yang tertera di nota berbeda dengan hasil penjumlahan subtotal item, berikan warning "Total di nota tidak sesuai dengan jumlah item" '
            'jika ada 2 struk totalkan semua item dari kedua struk, jika ada item yang sama di kedua struk, jumlahkan harganya '
            'untuk field "purpose" (keperluan reimbursement): tentukan keperluan reimbursement dari nota tersebut (contoh: "Konsumsi", "Transportasi", "ATK", "Akomodasi", dll). Jika ada banyak keperluan berbeda, gunakan keperluan generalnya saja (contoh: "Konsumsi & Transportasi" digabung menjadi "Operasional"). '
            'untuk field "transactionDate" (tanggal transaksi): gunakan format DD/MM/YYYY (contoh: 21/05/2026). Jika ada banyak nota dengan tanggal berbeda, gunakan tanggal transaksi yang paling awal. '
            'untuk field "description": berikan summary informasi dari nota beserta rincian barang-barang yang dibeli (nama barang, jumlah/quantity, dan harga per item). Contoh: "Pembelian di Restoran X: Nasi Goreng 2x @25000, Es Teh 3x @5000, Ayam Bakar 1x @35000" atau "Belanja ATK di Toko Y: Pulpen 5x @3000, Buku Tulis 10x @5000". '
            'gunakan format JSON {total: number, merchant_name: string, transactionDate: string, purpose: string, description: string, items: [{name: string, price: number}], warnings: [string]}'
        )
        DEFAULT_MODEL = 'gpt-4o'
        DEFAULT_MAX_TOKENS = 1500

        # Read parameters from ctx with safe fallbacks to defaults
        parameters = ctx.get('parameters', {}) or {}

        images_key = parameters.get('images') or DEFAULT_IMAGES_KEY
        if not isinstance(images_key, str) or not images_key.strip():
            images_key = DEFAULT_IMAGES_KEY
        images_key = images_key.strip()

        prompt = parameters.get('prompt') or DEFAULT_PROMPT
        if not isinstance(prompt, str) or not prompt.strip():
            prompt = DEFAULT_PROMPT

        model = parameters.get('model') or DEFAULT_MODEL
        if not isinstance(model, str) or not model.strip():
            model = DEFAULT_MODEL
        model = model.strip()

        try:
            max_tokens = int(parameters.get('max_tokens') or DEFAULT_MAX_TOKENS)
            if max_tokens <= 0:
                max_tokens = DEFAULT_MAX_TOKENS
        except (TypeError, ValueError):
            max_tokens = DEFAULT_MAX_TOKENS

        # ── Variables ─────────────────────────────────────────────────────────
        variables = ctx.get('variables', {}) or {}

        images_data = variables.get(images_key, [])

        # Support JSON string containing a list
        if isinstance(images_data, str):
            try:
                images_data = json.loads(images_data)
            except Exception:
                images_data = [images_data]

        if not isinstance(images_data, list):
            images_data = [images_data]

        # Filter out empty entries
        images_data = [img for img in images_data if img and str(img).strip()]

        if not images_data:
            return {
                "status": "error",
                "message": f"No images found in variable '{images_key}'",
                "data": {
                    "images_key": images_key,
                    "available_variable_keys": list(variables.keys()) if variables else []
                },
                "runkey": runkey
            }

        # ── Configuration ─────────────────────────────────────────────────────
        config = ctx.get('configuration', {}) or {}
        openai_token = config.get('openai_token', '').strip()

        if not openai_token:
            return {
                "status": "error",
                "message": "openai_token is required in configuration",
                "data": {
                    "available_config_keys": list(config.keys()) if config else [],
                    "expected_key": "openai_token"
                },
                "runkey": runkey
            }

        # ── Analyze Images ────────────────────────────────────────────────────
        try:
            result = analyze_images_with_openai(openai_token, images_data, prompt, model, max_tokens)
        except Exception as ai_err:
            return {
                "status": "error",
                "message": str(ai_err),
                "data": {
                    "images_count": len(images_data),
                    "prompt": prompt,
                    "model": model
                },
                "runkey": runkey
            }

        return {
            "status": "success",
            "message": f"Successfully analyzed {len(images_data)} image(s)",
            "data": {
                "images_count": len(images_data),
                "prompt": prompt,
                "model": model,
                "result": result
            },
            "runkey": runkey
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Execution failed: {str(e)}",
            "data": {
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            "runkey": ctx.get('runkey', '') if ctx else ''
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Analyze images using OpenAI Vision API'
    )
    parser.add_argument(
        '--run', required=True,
        help='Execution context as a JSON file path or JSON string'
    )

    args = parser.parse_args()

    try:
        if args.run.startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r') as f:
                ctx = json.load(f)

        result = run(ctx)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0 if result['status'] == 'success' else 1)

    except json.JSONDecodeError as e:
        error_result = {
            "status": "error",
            "message": f"Invalid JSON input: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "data": None,
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
