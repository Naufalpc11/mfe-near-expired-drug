# Guideline: Membuat Micro Frontend (MFE) dengan AlurkerjaType Integration

Dokumen ini menjelaskan cara membuat Micro Frontend (MFE) yang terintegrasi dengan **AlurkerjaType** dan sistem Alurkerja.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [AlurkerjaType Structure](#alurkerjatype-structure)
3. [Setup Project](#setup-project)
4. [Component Structure](#component-structure)
5. [Best Practices](#best-practices)
6. [Example: Create View](#example-create-view)
7. [Testing](#testing)
8. [Module Federation](#module-federation)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Apa itu AlurkerjaType?

**AlurkerjaType** adalah TypeScript interface yang mendefinisikan kontrak antara MFE components dan Alurkerja platform. Ini memastikan:
- Consistency dalam data flow
- Type safety dengan TypeScript
- Proper integration dengan React Hook Form
- Access ke Alurkerja platform APIs

### Kapan Menggunakan MFE?

Gunakan MFE pattern ketika:
- Component perlu di-share across multiple applications
- Independent deployment diperlukan
- Team separation dengan clear boundaries
- Runtime loading of components

---

## 📦 AlurkerjaType Structure

### 1. AlurkerjaMfeProps

Interface utama yang **WAJIB** digunakan untuk semua MFE components:

```typescript
export interface AlurkerjaMfeProps {
    form: {
        setValue: (name: string, value: any) => void;
        register: any;
        control: any;
        watch: any;
        getValues: (name?: string) => any;
    },
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
    }
}
```

#### Properties Explanation

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `form` | Object | React Hook Form instance | ✅ Yes |
| `form.setValue` | Function | Set value programmatically | ✅ Yes |
| `form.register` | Function | Register input fields | ✅ Yes |
| `form.control` | Object | Controller for controlled inputs | ✅ Yes |
| `form.watch` | Function | Watch field values | ✅ Yes |
| `form.getValues` | Function | Get current form values | ✅ Yes |
| `alurkerjaParams` | Object | Platform configuration | ✅ Yes |
| `alurkerjaParams.apiBaseUrl` | String | API base URL | ⚠️ Optional |
| `alurkerjaParams.token` | String | Authentication token | ✅ Yes |
| `alurkerjaParams.activeTenant` | String | Current tenant ID | ✅ Yes |
| `alurkerjaParams.probis` | String | Business process ID | ✅ Yes |
| `alurkerjaParams.taskId` | String | Current task ID | ✅ Yes |

### 2. AlurkerjaInputType

Interface untuk custom input components (jika diperlukan):

```typescript
export type AlurkerjaInputType = {
    form: {
        setValue: (name: string, value: any) => void;
        register: any;
        control: any;
        watch: any;
        getValues: (name?: string) => any;
    },
    item: InputType;
}

export interface InputType {
    label: Label;
    name: string;
    placeholder: string;
    form_field_type: string;
    ui_type: string;
    defaultValue: null;
    tooltip: Tooltip;
    disabled: boolean;
    constraints: Constraints;
    [key: string]: any;
}
```

### 3. AlurkerjaMfeInputProps

Interface untuk form input components:

```typescript
export interface AlurkerjaMfeInputProps {
    props: AlurkerjaInputType;
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
    }
}
```

---

## 📝 Kapan Menggunakan Interface Mana?

### 🎯 Gunakan `AlurkerjaMfeProps`

**Untuk views dengan config dan action:**
- Create View
- Edit View  
- Detail View
- Get Data View
- Post Data View
- Views yang membutuhkan akses ke form dan alurkerja parameters secara langsung

**Contoh penggunaan:**
```typescript
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

const CreateView = ({ form, alurkerjaParams }: AlurkerjaMfeProps) => {
    // Akses langsung ke form methods
    const { setValue, register, watch } = form;
    
    // Akses ke alurkerja parameters
    const { token, activeTenant, probis } = alurkerjaParams;
    
    return (
        // Your view component
    );
};
```

### 🎯 Gunakan `AlurkerjaMfeInputProps`

**Untuk form input components:**
- Custom input fields
- Form controls yang membutuhkan item configuration
- Components yang handle individual form field logic

**Contoh penggunaan:**
```typescript
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';

const CustomInput = ({ props, alurkerjaParams }: AlurkerjaMfeInputProps) => {
    const { form, item } = props;
    
    // Akses ke form methods melalui props
    const { setValue, register } = form;
    
    // Akses ke item configuration
    const { label, name, placeholder, constraints } = item;
    
    return (
        // Your input component
    );
};
```

---

## 🚀 Setup Project

### 1. Install Dependencies

```bash
npm install react react-dom react-hook-form alurkerja-ui
npm install --save-dev @types/react @types/react-dom typescript
```

### 2. Create Type Definitions

Buat file `src/type/AlurkerjaType.ts`:

```typescript
export interface AlurkerjaMfeProps {
    form: {
        setValue: (name: string, value: any) => void;
        register: any;
        control: any;
        watch: any;
        getValues: (name?: string) => any;
    },
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
    }
}
```

### 3. Configure Module Federation

Update `webpack.config.js`:

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'your_mfe_name',
      filename: 'remoteEntry.js',
      exposes: {
        './create_view': './src/CreateView.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-hook-form': { singleton: true },
      }
    })
  ]
}
```

---

## 🏗️ Component Structure

### Anatomy of MFE Component

```tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

export default function YourView({ form, alurkerjaParams }: AlurkerjaMfeProps) {
    const { control, setValue, watch, getValues } = form;
    const { token, apiBaseUrl, activeTenant } = alurkerjaParams;
    
    // Your component logic here
    
    return (
        <div>
            {/* Your JSX here */}
        </div>
    );
}
```

### Key Points:

1. **Props Destructuring**: Selalu destructure `form` dan `alurkerjaParams`
2. **Type Safety**: Gunakan `AlurkerjaMfeProps` untuk props typing
3. **Controller Usage**: Gunakan `<Controller>` untuk controlled inputs
4. **Naming Convention**: Gunakan PascalCase dan suffix `View` (e.g., `CreateView`, `EditView`)

---

## ✅ Best Practices

### 1. Form Field Naming Convention

```tsx
// ✅ BENAR - Nested object structure
<Controller
    name="value.fieldName"
    control={control}
    render={({ field }) => <Input {...field} />}
/>

// ❌ SALAH - Flat structure
<Controller
    name="fieldName"
    control={control}
    render={({ field }) => <Input {...field} />}
/>
```

**Alasan**: Alurkerja platform expects data dalam struktur `{ value: { ... } }`

### 2. Controlled vs Uncontrolled Components

```tsx
// ✅ BENAR - Controlled dengan Controller
<Controller
    name="value.email"
    control={control}
    render={({ field }) => <Input {...field} />}
/>

// ❌ SALAH - Uncontrolled dengan register
<input {...register("value.email")} />
```

**Gunakan `Controller`** untuk:
- Custom components dari libraries (alurkerja-ui, MUI, etc.)
- Components yang memerlukan custom logic
- Better type safety

### 3. Default Values & Initialization

```tsx
import { useEffect } from 'react';

export default function YourView({ form }: AlurkerjaMfeProps) {
    const { setValue } = form;
    
    useEffect(() => {
        // Set default values on mount
        setValue('value.status', 'draft');
        setValue('value.createdAt', new Date().toISOString());
    }, [setValue]);
    
    return <div>...</div>;
}
```

### 4. Field Array Management

Untuk dynamic fields (array of objects):

```tsx
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
    control,
    name: 'value.items'
});

// Initialize with at least one item
useEffect(() => {
    if (fields.length === 0) {
        append({ key: '', value: '' });
    }
}, [fields, append]);
```

### 5. API Calls dengan alurkerjaParams

```tsx
const handleFetchData = async () => {
    const { apiBaseUrl, token, activeTenant } = alurkerjaParams;
    
    try {
        const response = await fetch(`${apiBaseUrl}/api/data`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': activeTenant,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        setValue('value.fetchedData', data);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
};
```

### 6. Error Handling

```tsx
import { useState } from 'react';

export default function YourView({ form }: AlurkerjaMfeProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        const values = form.getValues();
        
        if (!values.value?.name) {
            newErrors.name = 'Name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    return (
        <div>
            <Controller
                name="value.name"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <Input {...field} />
                        {errors.name && (
                            <span className="text-red-500 text-sm">{errors.name}</span>
                        )}
                    </div>
                )}
            />
        </div>
    );
}
```

---

## 📝 Example: Create View

### Complete CreateView Implementation

File: `src/CreateView.tsx`

```tsx
import React, { useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Input } from 'alurkerja-ui';
import { X, Plus } from 'lucide-react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

/**
 * CreateView Component
 * 
 * MFE component untuk membuat dokumen baru dengan support:
 * - Dynamic key-value pairs (variables)
 * - File name configuration
 * - Template document selection
 * 
 * @param {AlurkerjaMfeProps} props - Props dari Alurkerja platform
 * @returns {JSX.Element} Create form component
 */
export default function CreateView({ form, alurkerjaParams }: AlurkerjaMfeProps) {
    const { control, setValue, watch } = form;
    
    // Field array untuk manage dynamic variables
    const variablesField = useFieldArray({ 
        control, 
        name: 'value.variables' 
    });

    /**
     * Render key-value pair fields dengan add/remove functionality
     */
    const renderKeyValueFields = (
        fields: any, 
        append: any, 
        remove: any
    ) => (
        <div className="space-y-3">
            {fields.map((item: any, index: number) => (
                <div 
                    key={item.id} 
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                >
                    {/* Key Input */}
                    <Controller
                        name={`value.variables.${index}.key`}
                        control={control}
                        rules={{ required: 'Key is required' }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input 
                                    className="text-sm" 
                                    placeholder="Key" 
                                    {...field} 
                                />
                                {fieldState.error && (
                                    <span className="text-red-500 text-xs">
                                        {fieldState.error.message}
                                    </span>
                                )}
                            </div>
                        )}
                    />
                    
                    {/* Value Input */}
                    <Controller
                        name={`value.variables.${index}.value`}
                        control={control}
                        rules={{ required: 'Value is required' }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input 
                                    className="text-sm" 
                                    placeholder="Value" 
                                    {...field} 
                                />
                                {fieldState.error && (
                                    <span className="text-red-500 text-xs">
                                        {fieldState.error.message}
                                    </span>
                                )}
                            </div>
                        )}
                    />
                    
                    {/* Remove Button - Only show if more than 1 field */}
                    {fields.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="text-gray-400 hover:text-red-500 transition"
                            aria-label="Remove variable"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            ))}
            
            {/* Add Variable Button */}
            <button
                type="button"
                onClick={() => append({ key: '', value: '' })}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/90 mt-2"
            >
                <Plus size={14} /> Add Variable
            </button>
        </div>
    );

    /**
     * Initialize with one empty variable field
     */
    useEffect(() => {
        if (variablesField.fields.length === 0) {
            variablesField.append({ key: '', value: '' });
        }
    }, []);

    /**
     * Auto-generate default values on mount
     */
    useEffect(() => {
        const currentFileName = watch('value.fileName');
        if (!currentFileName) {
            const timestamp = new Date().getTime();
            setValue('value.fileName', `document_${timestamp}`);
        }
    }, [setValue, watch]);

    return (
        <div className="space-y-4">
            {/* File Name Section */}
            <div className="col-span-1 space-y-2">
                <label className="block text-sm font-medium mb-1">
                    Nama File <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="value.fileName"
                    control={control}
                    rules={{ 
                        required: 'Nama file wajib diisi',
                        pattern: {
                            value: /^[a-zA-Z0-9_-]+$/,
                            message: 'Nama file hanya boleh mengandung huruf, angka, underscore, dan dash'
                        }
                    }}
                    render={({ field, fieldState }) => (
                        <div>
                            <Input 
                                className="text-sm" 
                                placeholder="Masukkan nama file (contoh: document_001)" 
                                {...field} 
                            />
                            {fieldState.error && (
                                <span className="text-red-500 text-xs">
                                    {fieldState.error.message}
                                </span>
                            )}
                        </div>
                    )}
                />
                
                {/* Template Document Section */}
                <label className="block text-sm font-medium mb-1 mt-4">
                    Template Dokumen <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="value.template"
                    control={control}
                    rules={{ required: 'Template dokumen wajib diisi' }}
                    render={({ field, fieldState }) => (
                        <div>
                            <Input 
                                className="text-sm" 
                                placeholder="Masukkan template dokumen" 
                                {...field} 
                            />
                            {fieldState.error && (
                                <span className="text-red-500 text-xs">
                                    {fieldState.error.message}
                                </span>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Contoh: invoice_template, contract_template
                            </p>
                        </div>
                    )}
                />
            </div>

            {/* Variables Section */}
            <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">
                    Variables <span className="text-gray-500 text-xs">(Key-Value Pairs)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Define variables yang akan digunakan dalam template dokumen
                </p>
                {renderKeyValueFields(
                    variablesField.fields, 
                    variablesField.append, 
                    variablesField.remove
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-700">
                    💡 <strong>Tips:</strong> Variables akan di-replace dalam template. 
                    Contoh: Jika key = "customerName" dan value = "John Doe", 
                    maka {"{{customerName}}"} dalam template akan diganti dengan "John Doe"
                </p>
            </div>
        </div>
    );
}
```

### Expected Data Structure

Data yang dihasilkan oleh form di atas:

```json
{
  "value": {
    "fileName": "document_001",
    "template": "invoice_template",
    "variables": [
      { "key": "customerName", "value": "John Doe" },
      { "key": "amount", "value": "1000" },
      { "key": "date", "value": "2026-01-12" }
    ]
  }
}
```

### Usage in Host Application

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';

// Lazy load MFE component
const CreateView = React.lazy(() => import('mockapi_view/create_view'));

function HostApp() {
    const form = useForm({
        defaultValues: {
            value: {
                fileName: '',
                template: '',
                variables: []
            }
        }
    });

    const alurkerjaParams = {
        token: 'your-auth-token',
        activeTenant: 'tenant-123',
        probis: 'probis-456',
        taskId: 'task-789',
        apiBaseUrl: 'https://api.example.com'
    };

    const onSubmit = (data: any) => {
        console.log('Form Data:', data);
        // Process form data
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <React.Suspense fallback={<div>Loading...</div>}>
                <CreateView form={form} alurkerjaParams={alurkerjaParams} />
            </React.Suspense>
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

## 🧪 Testing

### Unit Testing with Jest & React Testing Library

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import CreateView from './CreateView';

const Wrapper = ({ children }: any) => {
    const form = useForm();
    const alurkerjaParams = {
        token: 'test-token',
        activeTenant: 'test-tenant',
        probis: 'test-probis',
        taskId: 'test-task'
    };
    
    return children({ form, alurkerjaParams });
};

describe('CreateView', () => {
    it('should render file name input', () => {
        render(
            <Wrapper>
                {(props: any) => <CreateView {...props} />}
            </Wrapper>
        );
        
        expect(screen.getByPlaceholderText(/nama file/i)).toBeInTheDocument();
    });
    
    it('should add new variable field', () => {
        render(
            <Wrapper>
                {(props: any) => <CreateView {...props} />}
            </Wrapper>
        );
        
        const addButton = screen.getByText(/add variable/i);
        fireEvent.click(addButton);
        
        const keyInputs = screen.getAllByPlaceholderText('Key');
        expect(keyInputs).toHaveLength(2);
    });
});
```

---

## 🔌 Module Federation

### Expose Component

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'mockapi_view',
  filename: 'remoteEntry.js',
  exposes: {
    './create_view': './src/CreateView.tsx',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
    'react-hook-form': { singleton: true, requiredVersion: '^7.45.1' },
  }
})
```

### Consume in Host

```javascript
// Host webpack.config.js
new ModuleFederationPlugin({
  remotes: {
    mockapi_view: 'mokapi_view@http://localhost:3001/remoteEntry.js'
  }
})
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Form values tidak tersimpan

**Problem**: Data tidak muncul saat submit

**Solution**: 
- Pastikan menggunakan `name="value.fieldName"` (prefix dengan `value.`)
- Gunakan `Controller` untuk controlled components

#### 2. Type errors pada form props

**Problem**: TypeScript error pada destructuring form

**Solution**:
```tsx
// ✅ BENAR
const { control, setValue } = form;

// ❌ SALAH
const { control } = props.form;
```

#### 3. Module Federation shared dependency conflict

**Problem**: Multiple React instances

**Solution**: Pastikan `singleton: true` di webpack config untuk react dan react-dom

#### 4. useFieldArray tidak initialize

**Problem**: Fields array kosong

**Solution**:
```tsx
useEffect(() => {
    if (fields.length === 0) {
        append({ key: '', value: '' });
    }
}, [fields, append]);
```

---

## 📚 Additional Resources

### Official Documentation

- [React Hook Form](https://react-hook-form.com/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Resources

- [Alurkerja UI Components](https://alurkerja-ui-docs.com)
- [Platform API Documentation](https://api.alurkerja.com/docs)

---

## 📋 Checklist untuk MFE Baru

Gunakan checklist ini saat membuat MFE component baru:

- [ ] Import `AlurkerjaMfeProps` dari `type/AlurkerjaType`
- [ ] Props type menggunakan `AlurkerjaMfeProps`
- [ ] Destructure `form` dan `alurkerjaParams`
- [ ] Semua field names prefix dengan `value.`
- [ ] Gunakan `Controller` untuk controlled inputs
- [ ] Handle default values dengan `useEffect`
- [ ] Add validation rules jika diperlukan
- [ ] Test dengan sample data
- [ ] Export component di webpack Module Federation
- [ ] Update README dengan usage instructions
- [ ] Add TypeScript types untuk custom props
- [ ] Handle error states
- [ ] Add loading states untuk async operations
- [ ] Test integration dengan host application

---

## 🤝 Contributing

Jika menemukan issues atau ingin menambahkan improvement:

1. Create issue di repository
2. Fork dan create branch baru
3. Implement changes dengan follow guideline ini
4. Submit Pull Request dengan clear description

---

## 📞 Support

Untuk pertanyaan atau bantuan:
- Technical issues: team-dev@company.com
- Documentation: docs@company.com
- Platform support: support@alurkerja.com

---

**Last Updated**: January 12, 2026  
**Version**: 1.0.0
