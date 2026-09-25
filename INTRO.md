# MockAPI Addon

Mock API addon for Alurkerja integration platform, supporting both REST and SCRIPT actions with customizable views.

## 📋 Table of Contents

- [Overview](#overview)
- [AI Development Guide](#ai-development-guide)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)

## 🎯 Overview

This addon provides:
- **Mock API functionality** for testing and development
- **SCRIPT actions** (recommended) for reliable execution
- **REST actions** (development stage) for HTTP endpoints
- **Custom MFE views** with TypeScript support
- **Form integration** with React Hook Form
- **Alurkerja platform integration** with type safety

## 🤖 AI Development Guide

### Step-by-Step AI Generation Process

Follow these steps untuk menggunakan AI dalam mengembangkan fitur addon:

#### 1. 📝 Definisikan Action di index.json

Mulai dengan mendefinisikan struktur dasar action di `index.json`:

```json
{
    "addon_tags": ["integration", "form", "module", "api"],
    "actions": {
        "your_action_name": {
            "name": "Your Action Display Name",
            "description": "Brief description of what this action does",
            "type": "SCRIPT",
            "method": null,
            "endpoint": null,
            "script_path": "scripts/your_action_name/script.py"
        }
    },
    "custom_views": {
        "your_action_name_config": "./ConfigView",
        "your_action_name_result": "./ResultView"
    }
}
```

**Template untuk berbagai jenis action:**
- **Data Processing**: `"addon_tags": ["integration", "api"]`
- **Form Handler**: `"addon_tags": ["form", "integration"]` 
- **UI Module**: `"addon_tags": ["module", "form"]`
- **External Integration**: `"addon_tags": ["integration", "api"]`

#### 2. 🔧 Buatkan Script Sesuai Keperluan Action

Buat script di `scripts/your_action_name/script.py` dengan template:

```python
#!/usr/bin/env python3
import json
import argparse
import sys

def run(context):
    """
    Main execution function
    
    Args:
        context (dict): Execution context from Alurkerja platform
        
    Returns:
        dict: Result object with status and data
    """
    try:
        # Extract input parameters
        params = context.get('parameters', {})
        
        # Your business logic here
        result_data = process_your_logic(params)
        
        return {
            "status": "success",
            "message": "Action executed successfully",
            "data": result_data
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Execution failed: {str(e)}",
            "data": None
        }

def process_your_logic(params):
    """Implement your specific business logic here"""
    # Example processing
    return {
        "processed": True,
        "input_received": params,
        "timestamp": "2026-01-28T10:00:00Z"
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Action script')
    parser.add_argument('--run', required=True,
                       help='Execution context (JSON file or JSON string)')
    
    args = parser.parse_args()
    
    try:
        if args.run.startswith('{'):
            ctx = json.loads(args.run)
        else:
            with open(args.run, 'r') as f:
                ctx = json.load(f)
        
        result = run(ctx)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"Script execution failed: {str(e)}",
            "data": None
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)
```

**Setelah membuat script, update index.json:**
- Pastikan `script_path` menunjuk ke file script yang benar
- Update `description` sesuai dengan fungsi actual script

#### 3. ➕ Tambahkan Action ke index.json

Lengkapi action definition dengan informasi yang akurat:

```json
{
    "actions": {
        "your_action_name": {
            "name": "Your Final Action Name",
            "description": "Detailed description based on actual implementation", 
            "type": "SCRIPT",
            "method": null,
            "endpoint": null,
            "script_path": "scripts/your_action_name/script.py",
            "input_schema": {
                "type": "object",
                "properties": {
                    "required_param": {
                        "type": "string",
                        "description": "Description of required parameter"
                    }
                },
                "required": ["required_param"]
            }
        }
    }
}
```

#### 4. 🎨 Buatkan View Sesuai dengan request.example.json

Buat `scripts/your_action_name/request.example.json` terlebih dahulu:

```json
{
    "parameters": {
        "input_field": "sample_value",
        "config_option": "default_setting"
    },
    "context": {
        "user_id": "user123",
        "tenant_id": "tenant456"
    }
}
```

Kemudian buat views di `views/src/`:

**ConfigView.tsx** (untuk input parameters):
```tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function ConfigView({ form, alurkerjaParams }: AlurkerjaMfeProps) {
    const { control } = form;
    
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    Input Field
                </label>
                <Controller
                    name="value.input_field"
                    control={control}
                    render={({ field }) => (
                        <Input
                            placeholder="Enter input value"
                            {...field}
                        />
                    )}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-1">
                    Config Option
                </label>
                <Controller
                    name="value.config_option"
                    control={control}
                    render={({ field }) => (
                        <Input
                            placeholder="Enter config option"
                            {...field}
                        />
                    )}
                />
            </div>
        </div>
    );
}
```

**ResultView.tsx** (untuk menampilkan hasil):
```tsx
import React from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function ResultView({ form }: AlurkerjaMfeProps) {
    const values = form.watch();
    const resultData = values?.action_result;
    
    if (!resultData) {
        return <div>No result data available</div>;
    }
    
    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Execution Result</h3>
                <div className="space-y-2">
                    <div>
                        <strong>Status:</strong> {resultData.status}
                    </div>
                    <div>
                        <strong>Message:</strong> {resultData.message}
                    </div>
                    {resultData.data && (
                        <div>
                            <strong>Data:</strong>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                {JSON.stringify(resultData.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

**Update `views/webpack.config.js`:**
```javascript
exposes: {
    './ConfigView': './src/ConfigView.tsx',
    './ResultView': './src/ResultView.tsx',
    // ... existing exports
}
```

### 🧪 Testing Your Implementation

1. **Test Script:**
```bash
cd scripts/your_action_name
python3 script.py --run request.example.json
```

2. **Build Frontend:**
```bash
cd views
npm run build
```

3. **Verify Components:**
- Check that views render correctly
- Test form submission
- Verify action execution

### 📚 AI Development Best Practices

- **Follow Type Safety**: Always use `AlurkerjaMfeProps` for views with config/actions, `AlurkerjaMfeInputProps` for form inputs
- **Consistent Naming**: Keep action names, file paths, and view keys consistent
- **Error Handling**: Implement proper error handling in both scripts and views
- **Documentation**: Update comments and descriptions as you develop
- **Testing**: Test each component individually before integration

## 📁 Project Structure

```
mockapi/
├── index.json              # Main configuration
├── ai-guideline.md         # AI development guidelines  
├── components.md           # Component structure docs
├── scripts/               # Action scripts
│   └── action_name/
│       ├── script.py      # Main execution script
│       └── request.example.json
└── views/                 # MFE frontend components
    ├── src/
    │   ├── ConfigView.tsx  # Configuration views
    │   ├── ResultView.tsx  # Result display views
    │   └── type/
    │       └── AlurkerjaType.ts
    └── webpack.config.js   # Module federation config
```

## 🚀 Getting Started

1. **Clone Repository**
2. **Install Dependencies**: `cd views && npm install`
3. **Read Documentation**: Start with [components.md](components.md) and [ai-guideline.md](ai-guideline.md)
4. **Follow AI Development Guide** above for creating new features

## 📖 Documentation

- **[ai-guideline.md](ai-guideline.md)** - Comprehensive AI development guide
- **[components.md](components.md)** - Component structure and mapping
- **[views/GUIDELINE.md](views/GUIDELINE.md)** - MFE development guideline
- **[scripts/README.MD](scripts/README.MD)** - Script development guide

## 🤝 Contributing

1. Follow the AI Development Guide above
2. Ensure all tests pass
3. Update documentation as needed
4. Submit PR with clear description

## 📞 Support

For questions or issues:
- Check existing documentation first
- Create GitHub issue for bugs
- Contact development team for guidance