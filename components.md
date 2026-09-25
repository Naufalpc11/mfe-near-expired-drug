# Components Documentation - index.json

Dokumentasi ini menjelaskan struktur dan fungsi setiap komponen dalam file [index.json](index.json) untuk MockAPI Addon.

---

## 📋 Table of Contents

1. [Basic Information](#basic-information)
2. [Addon Tags & Types](#addon-tags--types)
3. [View Configuration](#view-configuration)
4. [Custom Views](#custom-views)
5. [Configuration](#configuration)
6. [Forms](#forms)
7. [Views](#views)
8. [Scripts](#scripts)
9. [APIs](#apis)
10. [Actions](#actions)

---

## 🏷️ Basic Information

```json
{
    "name": "Mockapi Test Addon",
    "addon_key": "mockapi",
    "version": "1.0.0",
    "description": "A mock API addon for testing purposes.",
    "author": "TheAkisTea",
    "license": "MIT"
}
```

| Field | Description |
|-------|-------------|
| `name` | Display name yang akan muncul di platform |
| `addon_key` | Unique identifier untuk addon, digunakan untuk referensi internal |
| `version` | Version number menggunakan semantic versioning |
| `description` | Deskripsi singkat fungsi addon |
| `author` | Pembuat atau maintainer addon |
| `license` | Lisensi penggunaan addon |

---

## 🏷️ Addon Tags & Types

```json
{
    "addon_tags": ["integration", "form", "module", "api"],
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "mokapi_view"
}
```

### Addon Tags

Addon tags menentukan di mana dan bagaimana addon akan muncul di platform:

#### 🔗 `integration`
- **Lokasi**: Muncul di menu Integration dan sebagai aksi pada Camunda
- **Komponen Relevan**:
  - `custom_views.CONFIGS` - View untuk konfigurasi operation
  - `custom_views.ACTIONS` - View yang muncul saat action dijalankan
- **Fungsi**: Addon dapat diintegrasikan sebagai step dalam workflow/process

#### 📝 `form`
- **Lokasi**: Membuat list form yang dapat diakses via MFE
- **Komponen Relevan**:
  - `custom_views.FORMS` - Mapping form key ke view component
  - `forms` - Deklarasi form definitions
- **Fungsi**: Menyediakan form interface untuk input data

#### 🧩 `module`
- **Lokasi**: Implementasi MFE di luar kategori integration/form
- **Fungsi**: Menu baru atau komponen independen yang tidak terikat workflow
- **Use Case**: Dashboard, reporting, monitoring, atau fitur standalone lainnya

#### 🌐 `api`
- **Lokasi**: Tersedia sebagai API endpoint yang dapat dipanggil
- **Komponen Relevan**:
  - `apis` - Definisi API endpoints
- **Fungsi**: Menyediakan service API untuk konsumsi external atau internal

### Type Configuration

| Field | Value | Description |
|-------|-------|-------------|
| `type` | `"REST"` | Tipe utama addon (REST, SOAP, SCRIPT, dll) |
| `view_type` | `"MFE"` | Menggunakan Micro Frontend architecture |
| `view_path` | `"views/dist"` | Path ke compiled MFE bundle |
| `component_scope` | `"mokapi_view"` | Scope name untuk Module Federation |

---

## 🖼️ View Configuration

### Custom Views Structure

```json
"custom_views": {
    "CONFIGS": {
        "CREATE": "create_view",
        "EDIT": "create_view"
    },
    "ACTIONS": {
        "postData": "create_view",
        "getData": "create_view",
        "deleteData": "create_view"
    },
    "FORMS": {
        "nib_list": "config_view"
    },
    "VIEWS": {
        "nib_list": "config_view"
    }
}
```

### CONFIGS Views
**Digunakan untuk**: Integration tag (menu Integration + Camunda actions)

View untuk konfigurasi operations:

| Key | Component | Usage |
|-----|-----------|--------|
| `CREATE` | `create_view` | Form untuk membuat data/konfigurasi baru |
| `EDIT` | `create_view` | Form untuk mengedit data/konfigurasi existing |

### ACTIONS Views
**Digunakan untuk**: Integration tag (Camunda workflow steps)

View yang ditampilkan saat action specific dijalankan:

| Action Key | Component | Description |
|------------|-----------|-------------|
| `postData` | `create_view` | View saat menjalankan POST operation |
| `getData` | `create_view` | View saat menjalankan GET operation |
| `deleteData` | `create_view` | View saat menjalankan DELETE operation |

**⚠️ Penting**: Action key di `custom_views.ACTIONS` harus match dengan key di section `actions`.

### FORMS Views
**Digunakan untuk**: Form tag (form list interface)

Mapping form definitions ke view components:

| Form Key | Component | Description |
|----------|-----------|-------------|
| `nib_list` | `config_view` | View untuk NIB List Form |

**⚠️ Penting**: Form key di `custom_views.FORMS` harus match dengan key di section `forms`.

### VIEWS Views
**Digunakan untuk**: Module tag (display components seperti tables)

Mapping view definitions ke view components:

| View Key | Component | Description |
|----------|-----------|-------------|
| `nib_list` | `config_view` | View untuk NIB List dalam format table |

**⚠️ Penting**: View key di `custom_views.VIEWS` harus match dengan key di section `views`.

---

## ⚙️ Configuration

```json
"config": {
    "url": {
        "type": "string",
        "description": "The URL of the mock API endpoint.",
        "default": "https://mock.alurkerja.com"
    },
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
        },
        {
            "key": "Authorization", 
            "value": "Bearer your_token_here",
            "type": "text"
        }
    ]
}
```

### URL Configuration
- **Type**: String input field
- **Purpose**: Base URL untuk semua REST API calls
- **Default**: `https://mock.alurkerja.com`

### Headers Configuration
Array of header objects yang akan disertakan dalam setiap HTTP request:

| Field | Description | Example |
|-------|-------------|---------|
| `key` | Header name | `"Content-Type"`, `"Authorization"` |
| `value` | Header value | `"application/json"`, `"Bearer token"` |
| `type` | Input type for UI | `"text"`, `"password"`, `"select"` |

---

## 📝 Forms

```json
"forms": {
    "nib_list": {
        "name": "NIB List Form",
        "description": "Form to collect NIB related information."
    }
}
```

**Digunakan untuk**: Form tag

Form definitions yang dapat diakses melalui form interface:

| Form Key | Name | Description |
|----------|------|-------------|
| `nib_list` | "NIB List Form" | Form untuk collect informasi NIB |

**Relationship**: 
- Form key `nib_list` direferensikan di `custom_views.FORMS.nib_list`
- Saat form dipilih, akan load component `config_view`

---

## 📊 Views

```json
"views": {
    "nib_list": {
        "name": "NIB List View",
        "description": "View to display NIB related information in table format."
    }
}
```

**Digunakan untuk**: Module tag (display components)

View definitions untuk komponen display seperti tables dan dashboard:

| View Key | Name | Description |
|----------|------|-------------|
| `nib_list` | "NIB List View" | View untuk menampilkan informasi NIB dalam format table |

**Relationship**: 
- View key `nib_list` direferensikan di `custom_views.VIEWS.nib_list`
- Saat view dipilih, akan load component `config_view`

---

## 🔧 Scripts

```json
"scripts": {
    "deleteData": {
        "description": "Script for deleting data by ID with soft/hard delete support.",
        "scripts": {
            "type": "python",
            "executable": "scripts/delete_data/delete_data.py"
        }
    }
}
```

**Digunakan untuk**: Actions dengan type `SCRIPT`

Definisi executable scripts yang dapat dipanggil oleh actions:

| Script Key | Type | Executable | Description |
|------------|------|------------|-------------|
| `deleteData` | `python` | `scripts/delete_data/delete_data.py` | Script untuk delete data dengan soft/hard delete support |

**Execution Contract**:
```bash
python3 scripts/delete_data/delete_data.py --run <execution_context>
```

**Input**: JSON execution context dengan format:
```json
{
    "variables": {},
    "parameters": {},
    "configuration": {},
    "runkey": "unique-run-id"
}
```

---

## 🌐 APIs

```json
"apis": {
    "getPartner": {
        "name": "Mock API",
        "description": "API for interacting with the mock data service.",
        "type": "SCRIPT",
        "script": "getData"
    },
    "getPartnerBank": {
        "name": "Mock API Bank", 
        "description": "API for interacting with the mock bank data service.",
        "type": "SCRIPT",
        "script": "getPartnerBank"
    }
}
```

**Digunakan untuk**: API tag

Definisi API endpoints yang dapat dipanggil external atau internal:

| API Key | Name | Type | Script | Description |
|---------|------|------|--------|-------------|
| `getPartner` | "Mock API" | `SCRIPT` | `getData` | API untuk interaksi dengan mock data service |
| `getPartnerBank` | "Mock API Bank" | `SCRIPT` | `getPartnerBank` | API untuk interaksi dengan mock bank data service |

**Note**: 
- `type: "SCRIPT"` berarti API akan mengeksekusi script tertentu
- `script` field mereferensikan ke script key (harus ada di section `scripts`)

---

## 🚀 Actions

Actions mendefinisikan operasi yang dapat dilakukan oleh addon. Setiap action memiliki endpoint dan dapat berupa REST call atau script execution.

### REST Actions

#### getData (GET)
```json
"getData": {
    "name": "Get Mock Data",
    "description": "Fetch data from the mock API.",
    "type": "REST",
    "method": "GET", 
    "endpoint": "/data/:id",
    "pathVariable": [
        {
            "key": "id",
            "value": "1",
            "type": "number",
            "required": false
        }
    ],
    "queryParams": [
        {
            "key": "limit",
            "value": "10", 
            "type": "number",
            "required": false
        }
    ]
}
```

**Features**:
- **Path Variables**: `:id` akan diganti dengan nilai dari `pathVariable`
- **Query Parameters**: `limit` parameter opsional
- **Generated URL**: `{config.url}/data/1?limit=10`

#### postData (POST)
```json
"postData": {
    "name": "Post Mock Data",
    "description": "Send data to the mock API.",
    "method": "POST",
    "type": "REST",
    "endpoint": "/api/bkpm/nib",
    "body": {
        "nomor": "1234567890123456",
        "id_kbli": "46100",
        "nama_pelaku_usaha": "PT Maju Jaya Abadi",
        "alamat_kantor": "${variables.initiator}",
        "no_telepon": "021-5551234",
        "email": "${variables.initiator}",
        "skala_usaha": "Mikro",
        "sertifikat_url": "https://example.com/files/sertifikat.pdf"
    }
}
```

**Features**:
- **Static Body**: Predefined JSON body untuk BKPM NIB format
- **Variable Interpolation**: `${variables.initiator}` akan diganti dengan nilai runtime
- **Generated URL**: `{config.url}/api/bkpm/nib`

### SCRIPT Actions

#### deleteData (SCRIPT)
```json
"deleteData": {
    "name": "Delete Mock Data",
    "description": "Delete data from the mock API.",
    "type": "SCRIPT",
    "endpoint": "deleteData"
}
```

**Features**:
- **Script Execution**: Mereferensikan ke `scripts.deleteData`
- **Endpoint**: Key yang menunjuk ke script definition
- **Execution**: Akan menjalankan `scripts/delete_data/delete_data.py`

---

## 🔄 Component Relationships

### Integration Flow (addon_tag: "integration")
```
Actions -> custom_views.ACTIONS -> View Component
   ↓
Scripts (jika type: SCRIPT) -> Python Execution
   ↓ 
REST Endpoints (jika type: REST) -> HTTP Request
```

### Form Flow (addon_tag: "form")
```
Forms -> custom_views.FORMS -> View Component -> User Input
```

### Views Flow (addon_tag: "module")
```
Views -> custom_views.VIEWS -> View Component -> Display Data (Tables/Dashboard)
```

### API Flow (addon_tag: "api")
```
APIs -> Scripts -> Python Execution -> Response
```

### Module Flow (addon_tag: "module")
```
Custom Views -> MFE Component -> Independent UI/Menu
```

---

## ✅ Validation Rules

### Form-View Mapping
- Form key di `forms` HARUS ada di `custom_views.FORMS`
- Form key di `custom_views.FORMS` HARUS ada di `forms`

### View-View Mapping
- View key di `views` HARUS ada di `custom_views.VIEWS`
- View key di `custom_views.VIEWS` HARUS ada di `views`

### Action-Script Mapping
- Action dengan `type: "SCRIPT"` HARUS memiliki `endpoint` yang ada di `scripts`
- Script key di `scripts` harus memiliki executable file yang valid

### Action-View Mapping
- Action key di `actions` dapat direferensikan di `custom_views.ACTIONS`
- Jika tidak ada view mapping, akan menggunakan default behavior

### API-Script Mapping  
- API dengan `type: "SCRIPT"` HARUS memiliki `script` field yang ada di `scripts`

---

## 🎯 Usage Examples

### Example: Integration Workflow
1. User memilih addon di menu Integration
2. Platform load `custom_views.CONFIGS.CREATE` → `create_view`
3. User configure action parameters
4. User trigger action `postData` 
5. Platform load `custom_views.ACTIONS.postData` → `create_view`
6. Platform execute REST POST ke `{config.url}/api/bkpm/nib`

### Example: Form Interface
1. User access form list (addon_tag: "form")
2. User pilih "NIB List Form" (`forms.nib_list`)
3. Platform load `custom_views.FORMS.nib_list` → `config_view` 
4. User input data melalui form interface

### Example: Views Interface
1. User access view list (addon_tag: "module")
2. User pilih "NIB List View" (`views.nib_list`)
3. Platform load `custom_views.VIEWS.nib_list` → `config_view`
4. User view data dalam format table atau dashboard

### Example: API Call
1. External system call API `getPartner`
2. Platform lookup `apis.getPartner.script` → `getData`
3. Platform lookup `scripts.getData` → execute script
4. Return response dari script execution

---

## 📚 Best Practices

1. **Consistent Naming**: Gunakan naming convention yang konsisten across components
2. **Key Mapping**: Pastikan key mapping antar section valid dan konsisten
3. **Script Contracts**: Follow execution context contract untuk script development
4. **View Components**: Register semua view components di MFE bundle
5. **Error Handling**: Implement proper error handling di scripts dan views
6. **Documentation**: Document setiap action, script, dan view untuk maintainability

---

## 🔍 Debugging Tips

- **Missing View**: Check `custom_views` mapping dan MFE bundle
- **Script Error**: Verify script executable path dan execution context
- **API Not Found**: Check `apis` section dan script mapping
- **Form Not Loading**: Verify form key consistency between `forms` dan `custom_views.FORMS`
- **Integration Issues**: Check action definition dan endpoint configuration