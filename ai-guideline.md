# AI Development Guideline - MockAPI Addon

Panduan sistematis untuk AI/developer dalam mengembangkan fitur addon berdasarkan struktur yang dijelaskan di [components.md](components.md).

---

## 🔄 Development Flow

### Step 0: Reference Check
**SELALU** baca dan pahami [components.md](components.md) terlebih dahulu untuk memahami:
- Struktur komponen addon
- Addon tags dan fungsinya
- Mapping antar komponen
- Validation rules
- Best practices

---

### Step 1: Definisikan Action dan Tag

#### 1.1 Analisis Requirements
Berdasarkan request user, tentukan:
- **Addon tags** yang diperlukan: `integration`, `form`, `module`, `api`
- **Action type**: `REST` atau `SCRIPT`
- **Method** (jika REST): `GET`, `POST`, `PUT`, `DELETE`
- **Endpoint pattern**
- **Input/Output requirements**

⚠️ **WARNING: REST Actions Development Status**  
**REST actions masih dalam tahap development dan TIDAK DIREKOMENDASIKAN untuk production use.** Gunakan **SCRIPT actions** sebagai alternatif yang lebih stabil dan dapat diandalkan.

**📝 NOTE**: Section `config` di index.json hanya diperlukan untuk REST actions. Karena REST actions tidak direkomendasikan, section ini dapat dihilangkan atau diabaikan.

#### 1.2 Update Addon Tags
Edit [index.json](index.json) section `addon_tags`:

```json
{
    "addon_tags": ["integration", "form", "module", "api"],
    // Sesuaikan dengan kebutuhan fitur baru
}
```

**Tag Selection Guide**:
- **integration**: Untuk workflow/process integration + Camunda
- **form**: Untuk form interface dan data input
- **module**: Untuk standalone UI/menu baru
- **api**: Untuk API endpoints yang dapat dipanggil external

#### 1.3 Define Action Structure
Tentukan struktur action di [index.json](index.json):

⚠️ **PERINGATAN**: REST actions masih dalam development - gunakan SCRIPT actions untuk production.

**📝 NOTE**: Section `config` di index.json hanya diperlukan untuk REST actions. Karena menggunakan SCRIPT actions, section config dapat dihilangkan.

**SCRIPT Action Template** (**✅ RECOMMENDED**):
```json
"actionName": {
    "name": "Action Display Name",
    "description": "Action description",
    "type": "SCRIPT",
    "endpoint": "scriptKey"
}
```

**REST Action Template** (⚠️ **NOT RECOMMENDED - Development Only**):
```json
"actionName": {
    "name": "Action Display Name",
    "description": "Action description",
    "type": "REST",
    "method": "GET|POST|PUT|DELETE",
    "endpoint": "/api/endpoint/path",
    "pathVariable": [
        {
            "key": "id",
            "value": "default_value",
            "type": "string|number|boolean",
            "required": true|false
        }
    ],
    "queryParams": [
        {
            "key": "param_name",
            "value": "default_value",
            "type": "string|number|boolean",
            "required": true|false
        }
    ],
    "body": {
        // Static body structure atau parameter placeholders
    }
}
```

**SCRIPT Action Template**:
```json
"actionName": {
    "name": "Action Display Name",
    "description": "Action description",
    "type": "SCRIPT",
    "endpoint": "scriptKey"
}
```

---

### Step 2: Buatkan Script (Jika Diperlukan)

#### 2.1 Create Script Directory
Jika action type adalah `SCRIPT`, buat directory dan file:

```bash
mkdir -p scripts/action_name
touch scripts/action_name/action_name.py
touch scripts/action_name/request.example.json
touch scripts/action_name/README.md
```

#### 2.2 Implement Script
Buat script mengikuti execution contract:

**Template Script** (`scripts/action_name/action_name.py`):
```python
#!/usr/bin/env python3
"""
Script for [action description]
Execution: python3 action_name.py --run <execution_context>
"""

import json
import sys
import argparse
from typing import Dict, Any

def run(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main execution function
    
    Args:
        ctx: Execution context with variables, parameters, configuration, runkey
        
    Returns:
        Response dict with status, message, data, runkey
    """
    try:
        # Extract context
        variables = ctx.get('variables', {})
        parameters = ctx.get('parameters', {})
        configuration = ctx.get('configuration', {})
        runkey = ctx.get('runkey', '')
        
        # Validate required parameters
        # required_params = ['param1', 'param2']
        # for param in required_params:
        #     if param not in parameters:
        #         raise ValueError(f"Missing required parameter: {param}")
        
        # Business logic here
        result_data = {
            # Process results
        }
        
        return {
            "status": "ok",
            "message": "Action executed successfully",
            "data": result_data,
            "runkey": runkey
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e),
            "runkey": ctx.get('runkey', '')
        }

def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description='Action script')
    parser.add_argument('--run', required=True, 
                       help='Execution context (JSON file or JSON string)')
    
    args = parser.parse_args()
    
    try:
        # Parse input
        if args.run.startswith('{'):
            # JSON string
            ctx = json.loads(args.run)
        else:
            # JSON file
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        
        # Execute
        result = run(ctx)
        
        # Output JSON to STDOUT
        print(json.dumps(result, indent=2))
        
        # Exit codes
        if result.get('status') == 'ok':
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Execution failed: {str(e)}",
            "runkey": ""
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(2)

if __name__ == '__main__':
    main()
```

#### 2.3 Create Example Request
Buat `scripts/action_name/request.example.json`:

```json
{
    "variables": {
        "initiator": "user@example.com",
        "context_data": "sample_value"
    },
    "parameters": {
        "param1": "value1",
        "param2": 123,
        "param3": true
    },
    "configuration": {
        "url": "https://mock.alurkerja.com",
        "headers": [
            {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
            }
        ]
    },
    "runkey": "test-run-001"
}
```

#### 2.4 Update Script Configuration
Update [index.json](index.json) section `scripts`:

```json
"scripts": {
    "actionName": {
        "description": "Script description matching the action",
        "scripts": {
            "type": "python",
            "executable": "scripts/action_name/action_name.py"
        }
    }
}
```

#### 2.5 Test Script
```bash
# Test with example file
python3 scripts/action_name/action_name.py --run scripts/action_name/request.example.json

# Test with JSON string
python3 scripts/action_name/action_name.py --run '{"parameters":{"param1":"test"},"runkey":"test-123"}'
```

---

### Step 3: Tambahkan Action ke index.json

#### 3.1 Add to Actions Section
Edit [index.json](index.json) section `actions`:

```json
"actions": {
    // ... existing actions
    "newActionName": {
        // Action definition dari Step 1.3
    }
}
```

#### 3.2 Validation Checklist
- [ ] Action name unik dan descriptive
- [ ] Type sesuai (`REST` atau `SCRIPT`)
- [ ] Jika SCRIPT: endpoint key ada di section `scripts`
- [ ] Jika REST: method dan endpoint valid
- [ ] Parameters dan body structure sesuai requirements

---

### Step 4: Buatkan View Sesuai Request Example

#### 4.1 Analisis View Requirements
Berdasarkan `request.example.json` dan requirements:
- **Input fields** yang diperlukan
- **Form validation rules**
- **UI/UX requirements**
- **Data flow** dan interaction

#### 4.2 Create View Component
Buat component di `views/src/`:

**📝 PENTING**: Ada perbedaan pattern field antara **config views** dan **action views**:
- **Config Views** (CREATE/EDIT): Field menggunakan prefix `value.` → `value.param1`, `value.param2`
- **Action Views** (ACTIONS): Field **tanpa** prefix `value.` → `param1`, `param2`

**Template Component untuk CONFIG Views** (`views/src/ConfigView.tsx`):
```tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function ConfigView({ form }: AlurkerjaMfeProps) {
    const { control } = form;

    return (
        <div className="space-y-4">
            {/* ✅ CONFIG VIEWS: Field dengan prefix 'value.' */}
            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 1</label>
                <Controller
                    name="value.param1"  // ✅ Dengan 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <Input className="text-sm" placeholder="Masukkan parameter 1" {...field} />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 2</label>
                <Controller
                    name="value.param2"  // ✅ Dengan 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <Input 
                            className="text-sm" 
                            type="number"
                            placeholder="Masukkan parameter 2" 
                            {...field} 
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 3</label>
                <Controller
                    name="value.param3"  // ✅ Dengan 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                {...field}
                                checked={field.value || false}
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Enable Parameter 3
                            </label>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
```

**Template Component untuk ACTION Views** (`views/src/ActionView.tsx`):
```tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function ActionView({ form }: AlurkerjaMfeProps) {
    const { control } = form;

    return (
        <div className="space-y-4">
            {/* ✅ ACTION VIEWS: Field TANPA prefix 'value.' */}
            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 1</label>
                <Controller
                    name="param1"  // ✅ TANPA 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <Input className="text-sm" placeholder="Masukkan parameter 1" {...field} />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 2</label>
                <Controller
                    name="param2"  // ✅ TANPA 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <Input 
                            className="text-sm" 
                            type="number"
                            placeholder="Masukkan parameter 2" 
                            {...field} 
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm mb-1">Parameter 3</label>
                <Controller
                    name="param3"  // ✅ TANPA 'value.' prefix
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                {...field}
                                checked={field.value || false}
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Enable Parameter 3
                            </label>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
```
#### 4.3 Register Component
Update `views/src/App.tsx`:

```tsx
// Import new component
import ConfigView from './ConfigView';
import ActionView from './ActionView';

// Register component dalam App
const App = () => {
    return (
        <div>
            {/* Existing components */}
            <ConfigView />
            <ActionView />
        </div>
    );
};

// Export untuk Module Federation
export { ConfigView, ActionView };
```

**📝 Note**: View components hanya berisi form fields tanpa action buttons atau submit logic. Form handling dilakukan oleh platform parent component.

#### 4.4 Expose Component in Webpack
**⚠️ WAJIB**: Update `views/webpack.config.js` untuk mengexpose component baru:

```javascript
// dalam ModuleFederationPlugin configuration
exposes: {
    // ✅ Existing components
    './create_view': './src/CreateView.tsx',     // Config view (dengan value. prefix)
    './edit_view': './src/EditView.tsx', 
    './detail_view': './src/DetailView.tsx',
    './getData_view': './src/GetDataView.tsx',   // Action view (tanpa value. prefix)
    './postData_view': './src/PostDataView.tsx', // Action view (tanpa value. prefix)
    
    // ✅ TAMBAHKAN: Component baru
    './config_view': './src/ConfigView.tsx',     // Untuk CONFIG views (CREATE/EDIT)
    './action_view': './src/ActionView.tsx',     // Untuk ACTION views
    './your_new_view': './src/YourNewView.tsx'   // Component lain sesuai kebutuhan
}
```

**Pattern Guidelines**:
- **Config Views** (CREATE/EDIT): Gunakan CreateView.tsx sebagai template dengan `value.` prefix
- **Action Views** (ACTIONS): Gunakan PostDataView.tsx sebagai referensi dengan field langsung tanpa prefix

**Important Notes**:
- **Key naming**: `'./component_name'` harus match dengan value di `custom_views`
- **File path**: Pastikan path ke component file benar 
- **Convention**: Gunakan snake_case untuk key (misal: `action_view`, `config_view`)
- **Consistency**: Key di webpack harus sama dengan value di `custom_views` mapping

#### 4.5 Update Custom Views Configuration
Edit [index.json](index.json) section `custom_views`:

**Untuk Integration** (addon_tag: "integration"):
```json
"custom_views": {
    "CONFIGS": {
        "CREATE": "config_view",  // ✅ Config view dengan 'value.' prefix (seperti CreateView.tsx)
        "EDIT": "config_view"     // ✅ Config view dengan 'value.' prefix
    },
    "ACTIONS": {
        "newActionName": "action_view"  // ✅ Action view tanpa 'value.' prefix (seperti PostDataView.tsx)
    }
}
```

**Untuk Form** (addon_tag: "form"):
```json
"forms": {
    "action_form": {
        "name": "Action Form",
        "description": "Form for action configuration"
    }
},
"custom_views": {
    "FORMS": {
        "action_form": "action_view"  // ✅ Harus match dengan key di webpack exposes
    }
}
```

**Untuk Views** (addon_tag: "module" atau display components):
```json
"views": {
    "nib_list": {
        "name": "NIB List View",
        "description": "View to display NIB related information in table format."
    }
},
"custom_views": {
    "VIEWS": {
        "nib_list": "config_view"  // ✅ Untuk table dan display components
    }
}
```

**⚠️ Validation**: Pastikan value di `custom_views` (contoh: `"action_view"`) sama persis dengan key di `webpack.config.js` exposes (contoh: `'./action_view'`)

#### 4.6 Build Frontend
```bash
cd views
npm run build
cd ..
```

**⚠️ PENTING**: Build akan gagal jika ada component yang direferensikan di `custom_views` tapi tidak di-expose di webpack atau tidak ada file componentnya.

---

## 🔍 Validation & Testing

### Pre-Deployment Checklist
- [ ] [components.md](components.md) telah dipahami
- [ ] Addon tags sesuai dengan use case
- [ ] Action definition complete dan valid
- [ ] **AVOID REST actions** - gunakan SCRIPT actions untuk production
- [ ] Script (jika ada) mengikuti execution contract
- [ ] Script tested dengan example request
- [ ] View component implemented dan registered
- [ ] **✅ Component exposed in webpack.config.js** - pastikan semua component di `custom_views` sudah di-expose
- [ ] **✅ Component mapping consistent** - value di `custom_views` harus match dengan key di webpack exposes
- [ ] Custom views mapping configured
- [ ] Frontend built successfully
- [ ] Key mapping antar section konsisten

### Testing Flow
1. **Script Testing**: Test dengan `request.example.json`
2. **Integration Testing**: Test action execution end-to-end
3. **View Testing**: Test form submission dan data flow
4. **Build Testing**: Verify frontend build berhasil

---

## 📋 Common Patterns

### Pattern 1: Simple REST Action (⚠️ **NOT RECOMMENDED**)
```json
// ⚠️ AVOID: REST actions masih dalam development
// Gunakan SCRIPT action sebagai gantinya
"getData": {
    "name": "Get Data", 
    "type": "REST",    // ⚠️ NOT RECOMMENDED
    "method": "GET",
    "endpoint": "/api/data/:id"
}
```

### Pattern 2: **RECOMMENDED** Script Action
```json
// Action untuk complex processing
"processData": {
    "name": "Process Data",
    "type": "SCRIPT", 
    "endpoint": "processData"
},
// Dengan script configuration
"scripts": {
    "processData": {
        "description": "Complex data processing",
        "scripts": {
            "type": "python",
            "executable": "scripts/process_data/process_data.py"
        }
    }
}
```

### Pattern 3: Form-Based Action
```json
// Form definition
"forms": {
    "data_input": {
        "name": "Data Input Form",
        "description": "Form for data input"
    }
},
// View mapping
"custom_views": {
    "FORMS": {
        "data_input": "input_view"
    }
}
```

---

## ⚠️ Important Notes

1. **⚠️ REST Actions Status**: REST actions masih dalam tahap development dan **TIDAK DIREKOMENDASIKAN** untuk production. **Gunakan SCRIPT actions** sebagai alternatif yang stabil.
2. **📝 Config Section**: Section `config` di index.json hanya diperlukan untuk REST actions. Karena tidak menggunakan REST actions, section ini dapat dihilangkan dari index.json.
3. **✅ Component Exposure**: Setiap component yang direferensikan di `custom_views` **WAJIB** di-expose di `views/webpack.config.js` dengan key yang sama
4. **Key Consistency**: Pastikan key mapping antar section konsisten
5. **Script Contract**: Semua script harus mengikuti execution context format
6. **Error Handling**: Implement proper error handling di script dan view
7. **Type Safety**: Gunakan TypeScript interfaces untuk type safety

### 📝 Interface Usage Guidelines

**Gunakan `AlurkerjaMfeProps` untuk:**
- **Config Views**: Views untuk konfigurasi action/workflow
- **Action Views**: Views untuk menampilkan hasil/output action
- **Main Views**: Views yang membutuhkan akses langsung ke form dan alurkerja parameters

```typescript
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

const ConfigView = ({ form, alurkerjaParams }: AlurkerjaMfeProps) => {
    const { setValue, register, watch } = form;
    const { token, activeTenant, probis } = alurkerjaParams;
    // View logic here
};
```

**Gunakan `AlurkerjaMfeInputProps` untuk:**
- **Custom Form Inputs**: Input components yang memerlukan item configuration
- **Reusable Form Controls**: Components yang dapat dipakai ulang untuk berbagai form
- **Field-specific Logic**: Components yang handle individual form field behavior

```typescript
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';

const CustomInput = ({ props, alurkerjaParams }: AlurkerjaMfeInputProps) => {
    const { form, item } = props;
    const { setValue, register } = form;
    const { label, name, constraints } = item;
    // Input logic here
};
```

8. **Build Process**: Selalu build frontend setelah perubahan view
9. **Documentation**: Update dokumentasi setelah menambah fitur baru

---

## 🎯 Quick Reference

### File Locations
- **Configuration**: [index.json](index.json)
- **Scripts**: `scripts/<action_name>/`
- **Views**: `views/src/`
- **Documentation**: [components.md](components.md)

### Key Commands
```bash
# Test script
python3 scripts/<action>/script.py --run request.example.json

# Build frontend
cd views && npm run build

# Commit changes
git add . && git commit -m "Add <feature>" && git push
```

### Support Files
- [scripts/README.MD](scripts/README.MD) - Script development guideline
- [views/GUIDELINE.md](views/GUIDELINE.md) - MFE development guideline
- [components.md](components.md) - Component structure documentation

---

## 🔍 Debugging Tips

- **Missing View**: Check `custom_views` mapping dan MFE bundle
- **Component Not Found**: Verify component di-expose di `webpack.config.js` dengan key yang benar
- **Build Failed**: Check apakah semua component yang direferensikan sudah ada filenya dan di-expose
- **Script Error**: Verify script executable path dan execution context
- **API Not Found**: Check `apis` section dan script mapping
- **Form Not Loading**: Verify form key consistency between `forms` dan `custom_views.FORMS`
- **Integration Issues**: Check action definition dan endpoint configuration
- **Webpack Expose Error**: Pastikan key di exposes tidak menggunakan spasi atau karakter khusus, gunakan underscore

---

## 🔧 Webpack Component Exposure Quick Reference

**Current Exposed Components** (dari `views/webpack.config.js`):
```javascript
exposes: {
    './create_view': './src/CreateView.tsx',     // ✅ Config view - field dengan 'value.' prefix
    './edit_view': './src/EditView.tsx',         // ✅ Config view - field dengan 'value.' prefix
    './detail_view': './src/DetailView.tsx',
    './getData_view': './src/GetDataView.tsx',   // ✅ Action view - field tanpa 'value.' prefix
    './postData_view': './src/PostDataView.tsx', // ✅ Action view - field tanpa 'value.' prefix
}
```

**Pattern Reference**:
- **CONFIG Views**: `CreateView.tsx` - field format: `value.param1`, `value.param2` 
- **ACTION Views**: `PostDataView.tsx` - field format: `param1`, `param2` (tanpa prefix)

**Menambah Component Baru**:
1. **Untuk Config Views**: Gunakan pattern CreateView.tsx dengan `value.` prefix
2. **Untuk Action Views**: Gunakan pattern PostDataView.tsx tanpa `value.` prefix
3. Buat file component di `views/src/YourComponent.tsx`
4. Tambahkan ke webpack exposes: `'./your_component': './src/YourComponent.tsx'`
5. Update `custom_views` di index.json dengan value `"your_component"`
6. Build: `cd views && npm run build`

**⚠️ Remember**: Value di `custom_views` harus exact match dengan key di webpack exposes (tanpa `./`)