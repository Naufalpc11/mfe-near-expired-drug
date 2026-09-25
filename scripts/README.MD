# General Action Executor – Coding Guideline

Dokumen ini mendefinisikan **standar penulisan action script** untuk sistem **General Action Executor**.

Tujuan guideline ini adalah memastikan:
- Konsistensi antar action
- Kemudahan eksekusi oleh engine
- Keamanan dan prediktabilitas
- Kemudahan maintenance & review

---

## 1. Prinsip Dasar

### 1.1 Satu File = Satu Action

- Setiap action **HARUS** direpresentasikan oleh satu file executable
- Satu file hanya memiliki **satu tujuan aksi**

**✅ BENAR:**
```
delete_data.py
update_status.lua
sync_order.sh
```

**❌ SALAH:**
```
actions.py (berisi banyak fungsi)
```

---

### 1.2 Action Bersifat Stateless

- Action **TIDAK BOLEH** menyimpan state internal
- Semua data **HARUS** berasal dari execution context
- Semua hasil **HARUS** dikembalikan sebagai output

---

## 2. Execution Contract

### 2.1 Cara Menjalankan Action

Setiap action dijalankan dengan format CLI berikut:

```bash
<action-file> --run <request>
```

`<request>` dapat berupa:
- Path ke file JSON (request.json)
- JSON string langsung

### 2.2 Execution Context (Input Standar)

Action SELALU menerima input dengan struktur berikut:

```json
{
  "variables": {},
  "parameters": {},
  "configuration": {},
  "runkey": "unique-run-id"
}
```

#### Penjelasan Field

| Field | Deskripsi |
|-------|-----------|
| `variables` | Data runtime, boleh dimodifikasi |
| `parameters` | Parameter dari user / trigger, read-only |
| `configuration` | Konfigurasi addon / plugin |
| `runkey` | Identifier unik untuk tracing dan logging |

> **Catatan:** Action TIDAK PERLU mendeklarasikan input schema.

---

## 3. Entry Point Contract

### 3.1 Entry Point Wajib

Setiap action WAJIB memiliki satu entry point bernama `run`.

**Python:**
```python
def run(ctx):
    ...
```

**Lua:**
```lua
function run(ctx)
  ...
end
```

**JavaScript:**
```javascript
module.exports.run = (ctx) => {
  ...
}
```

**❌ Tidak diperbolehkan:**
- Multiple entrypoint
- Logic di luar `run`

---

## 4. Output Contract

### 4.1 Format Output

- Output WAJIB berupa JSON
- Output ditulis ke STDOUT
- Executor akan membaca output ini

**Contoh output sukses:**
```json
{
  "status": "ok",
  "message": "action executed",
  "data" : {"ai_output" : <output ai>},
  "runkey": "exec-uuid"
}
```

### 4.2 Mutasi Variables (Opsional)

Action BOLEH:
- Mengembalikan data untuk di-merge ke `variables`
- Tetapi TIDAK BOLEH mengubah `parameters` dan `configuration`

---

## 5. Error Handling

### 5.1 Business Error

Gunakan exception / error biasa.

**Python:**
```python
raise Exception("invalid state")
```

**Lua:**
```lua
error("invalid state")
```

Executor akan:
- Menangkap error
- Mengubahnya menjadi response standar

### 5.2 Exit Code Convention (Recommended)

| Exit Code | Arti |
|-----------|------|
| 0 | Success |
| 1 | Business error |
| 2 | Invalid input |
| >2 | Runtime / system error |

---

## 6. File Structure (Recommended)

```
scripts/
└── delete_data/
    ├── delete_data.py
    └── request.example.json
```

> 📌 `request.example.json` hanya untuk testing & dokumentasi

---

## 7. Contoh Implementasi (Python)

```python
import json
import argparse

def run(ctx):
    data_id = ctx["parameters"]["id"]

    if not data_id:
        raise Exception("id is required")

    return {
        "status": "ok",
        "deleted_id": data_id,
        "runkey": ctx["runkey"]
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", required=True)
    args = parser.parse_args()

    if args.run.endswith(".json"):
        with open(args.run) as f:
            ctx = json.load(f)
    else:
        ctx = json.loads(args.run)

    print(json.dumps(run(ctx)))
```

---

## 8. Security Rules

**Action DILARANG:**
- Mengakses filesystem di luar kebutuhan
- Melakukan network call tanpa konfigurasi
- Menjalankan shell command tanpa sandbox
- Mengubah environment host

**Executor BERHAK:**
- Membatasi CPU & memory
- Membatasi timeout
- Menolak action yang melanggar policy

---

## 9. Best Practices

**✅ DO:**
- Fokus pada logic aksi
- Gunakan `runkey` untuk logging
- Gunakan `configuration` untuk endpoint & credential
- Tulis action sekecil mungkin

**❌ DON'T:**
- Jangan hardcode credential
- Jangan menyimpan state
- Jangan membuat side effect tersembunyi

---

## 10. Filosofi Desain

Sistem ini terinspirasi oleh:
- Odoo Server Action
- Workflow engine execution context
- Declarative plugin system

**Tujuan utama:**
> Action yang sederhana untuk user, executor yang kuat untuk platform.

---

## 11. Penutup

Dengan mengikuti guideline ini:
- Action akan portable
- Mudah diuji
- Aman dijalankan
- Siap diorkestrasi dalam workflow

> **Dokumen ini bersifat kontrak antara plugin author dan executor.**
