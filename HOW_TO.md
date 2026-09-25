# HOW-TO: Membuat ChatGPT API Integration Addon untuk Alurkerja

Dokumen ini menjelaskan langkah-langkah pembuatan addon ChatGPT API Integration dari awal hingga deployment.

---

## 📋 Prerequisites

- Node.js & npm terinstall
- Python 3.x terinstall
- Alurkerja CLI (`npx alurkerja-cli`)
- Code editor (VS Code, dll)
- Access ke Alurkerja platform

---

## 🚀 Langkah-Langkah Pembuatan

### **Step 1: Membuat index.json dan Definisi Dasar Addon**

Buat file `index.json` di root folder project dengan struktur dasar addon.

**File: `index.json`**
```json
{
    "name": "ChatGPT-API-Integration",
    "addon_key": "chatgpt-api-integration",
    "version": "1.0.0",
    "description": "ChatGPT API integration addon untuk Alurkerja platform.",
    "author": "TheAkisTea",
    "license": "MIT",
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "chatgpt_view",
    "custom_views": {},
    "config": {},
    "scripts": {},
    "actions": {}
}
```

**Penjelasan:**
- `name`: Nama addon yang akan ditampilkan
- `addon_key`: Identifier unik untuk addon (kebab-case)
- `version`: Versi addon mengikuti semantic versioning
- `type`: REST untuk REST API integration
- `view_type`: MFE untuk Micro Frontend
- `view_path`: Path ke hasil build frontend
- `component_scope`: Scope untuk komponen React

**Publish addon:**
```bash
npx alurkerja-cli addon publish
```

---

### **Step 2: Membuat View untuk Konfigurasi Plugin**

Buat struktur folder views dan komponen untuk konfigurasi ChatGPT.

#### 2.1 Setup Project Frontend

```bash
cd views
npm install
```

#### 2.2 Buat Component untuk Konfigurasi

**File: `views/src/ChatGPTConfigForm.tsx`**

Buat form konfigurasi yang menerima:
- API Key
- Model selection (gpt-3.5-turbo, gpt-4, dll)
- Temperature
- Max tokens
- System prompt

Komponen harus mengimplementasikan interface `AlurkerjaMfeProps`:

```typescript
import React from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

const ChatGPTConfigForm: React.FC<AlurkerjaMfeProps> = ({ form, alurkerjaParams }) => {
    const { register, setValue, watch } = form;
    
    return (
        <div className="space-y-4">
            {/* Form fields untuk konfigurasi */}
            <div>
                <label>API Key</label>
                <input {...register('api_key')} type="password" />
            </div>
            <div>
                <label>Model</label>
                <select {...register('model')}>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                </select>
            </div>
            {/* Field lainnya... */}
        </div>
    );
};

export default ChatGPTConfigForm;
```

#### 2.3 Expose Component di Webpack Module Federation

Untuk membuat component dapat diakses oleh Alurkerja platform, kita perlu mengekspose component melalui webpack Module Federation.

**File: `views/webpack.config.js`** (update bagian `exposes`)

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  devServer: {
    port: 3001,
    historyApiFallback: true,
  },
  output: {
    publicPath: 'auto'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      { test: /\.(ts|tsx|js|jsx)$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'chatgpt_view',  // Harus sama dengan component_scope di index.json
      filename: 'remoteEntry.js',
      exposes: {
        './chat_gpt_config': './src/ChatGPTConfigForm.tsx',  // Expose config form
        // Component lain akan ditambahkan di sini
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-hook-form': { singleton: true },
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
```

**Penjelasan:**
- `name`: Harus sama dengan `component_scope` di `index.json` (`chatgpt_view`)
- `exposes`: Mapping antara key yang akan digunakan dan path file component
  - `'./chat_gpt_config'`: Key yang akan direferensi di `index.json` → `custom_views.CONFIGS.CREATE`
  - `'./src/ChatGPTConfigForm.tsx'`: Path relatif ke file component
- `shared`: Dependencies yang di-share dengan host application untuk menghindari duplikasi

#### 2.4 Expose Component di Bootstrap

**File: `views/src/bootstrap.js`**

```javascript
import ChatGPTConfigForm from './ChatGPTConfigForm';

export default {
    chat_gpt_config: ChatGPTConfigForm,
    // component lain akan ditambahkan di sini
};
```

**Screenshot yang diharapkan:**
> 📸 **[IMAGE: Form konfigurasi dengan field API Key, Model, Temperature, Max Tokens, System Prompt]**

#### 2.5 Build Frontend

```bash
npm run build
```

**Publish addon:**
```bash
cd ..
npx alurkerja-cli addon publish
```

---

### **Step 3: Konfigurasi Custom Views untuk CREATE dan EDIT**

Update `index.json` untuk menambahkan custom views.

**File: `index.json`**

```json
{
    "name": "ChatGPT-API-Integration",
    "addon_key": "chatgpt-api-integration",
    "version": "1.0.0",
    "description": "ChatGPT API integration addon untuk Alurkerja platform.",
    "author": "TheAkisTea",
    "license": "MIT",
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "chatgpt_view",
    "custom_views": {
        "CONFIGS": {
            "CREATE": "chat_gpt_config",
            "EDIT": "chat_gpt_config"
        }
    },
    "config": {},
    "scripts": {},
    "actions": {}
}
```

**Penjelasan:**
- `CONFIGS.CREATE`: Component yang digunakan saat membuat konfigurasi baru
- `CONFIGS.EDIT`: Component yang digunakan saat mengedit konfigurasi

**Publish addon:**
```bash
npx alurkerja-cli addon publish
```

#### Testing View

Buka Alurkerja platform dan navigasi ke:
1. Settings > Addons/Integrations
2. Pilih ChatGPT API Integration
3. Klik "Create Configuration"

**Screenshot yang diharapkan:**
> 📸 **[IMAGE: Tampilan form konfigurasi pada Alurkerja platform dengan semua field yang dibuat]**

---

### **Step 4: Menambahkan Action sendCompletionRequest**

Update `index.json` untuk menambahkan action yang akan digunakan dalam BPMN.

**File: `index.json`** (tambahkan section `actions`)

```json
{
    "name": "ChatGPT-API-Integration",
    "addon_key": "chatgpt-api-integration",
    "version": "1.0.0",
    "description": "ChatGPT API integration addon untuk Alurkerja platform.",
    "author": "TheAkisTea",
    "license": "MIT",
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "chatgpt_view",
    "custom_views": {
        "CONFIGS": {
            "CREATE": "chat_gpt_config",
            "EDIT": "chat_gpt_config"
        }
    },
    "config": {},
    "scripts": {},
    "actions": {
        "sendCompletionRequest": {
            "name": "Ask ChatGPT",
            "description": "Mengirim pertanyaan ke ChatGPT dan mendapat response AI.",
            "type": "SCRIPT",
            "endpoint": "sendCompletionRequest"
        }
    }
}
```

**Penjelasan:**
- `sendCompletionRequest`: Key identifier untuk action
- `name`: Nama action yang ditampilkan di UI
- `type`: SCRIPT berarti action mengeksekusi Python script
- `endpoint`: Mengarah ke key di section `scripts` (akan dibuat di step berikutnya)

**Publish addon:**
```bash
npx alurkerja-cli addon publish
```

---

### **Step 5: Membuat View untuk sendCompletionRequest Action**

#### 5.1 Buat Component View untuk Action

**File: `views/src/AskChatGPTView.tsx`**

```typescript
import React, { useState } from 'react';
import { AlurkerjaMfeProps } from '../type/AlurkerjaType';

const AskChatGPTView: React.FC<AlurkerjaMfeProps> = ({ form, alurkerjaParams }) => {
    const { register, setValue, watch } = form;
    
    return (
        <div className="space-y-4">
            <div>
                <label>Prompt/Question</label>
                <textarea 
                    {...register('prompt')} 
                    rows={4}
                    placeholder="Masukkan pertanyaan untuk ChatGPT..."
                />
            </div>
            <div>
                <label>Temperature (0-2)</label>
                <input 
                    {...register('temperature')} 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="2"
                    defaultValue="0.7"
                />
            </div>
            <div>
                <label>Max Tokens</label>
                <input 
                    {...register('max_tokens')} 
                    type="number"
                    defaultValue="1000"
                />
            </div>
        </div>
    );
};

export default AskChatGPTView;
```

#### 5.2 Expose Component di Webpack Module Federation

Update webpack configuration untuk mengekspose component action view.

**File: `views/webpack.config.js`** (update bagian `exposes`)

```javascript
plugins: [
    new ModuleFederationPlugin({
      name: 'chatgpt_view',
      filename: 'remoteEntry.js',
      exposes: {
        './chat_gpt_config': './src/ChatGPTConfigForm.tsx',
        './ask_chatgpt_view': './src/AskChatGPTView.tsx',  // ⭐ Tambahkan baris ini
      }4
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-hook-form': { singleton: true },
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
```

**Penjelasan:**
- `'./ask_chatgpt_view'`: Key yang akan direferensi di `index.json` → `custom_views.ACTIONS.sendCompletionRequest`
- `'./src/AskChatGPTView.tsx'`: Path relatif ke file component

#### 5.3 Expose Component di Bootstrap

**File: `views/src/bootstrap.js`** (update)

```javascript
import ChatGPTConfigForm from './ChatGPTConfigForm';
import AskChatGPTView from './AskChatGPTView';

export default {
    chat_gpt_config: ChatGPTConfigForm,
    ask_chatgpt_view: AskChatGPTView,
};
```

#### 5.3 Update index.json untuk Action View

**File: `index.json`** (update custom_views)

```json
{
    "name": "ChatGPT-API-Integration",
    "addon_key": "chatgpt-api-integration",
    "version": "1.0.0",
    "de5cription": "ChatGPT API integration addon untuk Alurkerja platform.",
    "author": "TheAkisTea",
    "license": "MIT",
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "chatgpt_view",
    "custom_views": {
        "CONFIGS": {
            "CREATE": "chat_gpt_config",
            "EDIT": "chat_gpt_config"
        },
        "ACTIONS": {
            "sendCompletionRequest": "ask_chatgpt_view"
        }
    },
    "config": {},
    "scripts": {},
    "actions": {
        "sendCompletionRequest": {
            "name": "Ask ChatGPT",
            "description": "Mengirim pertanyaan ke ChatGPT dan mendapat response AI.",
            "type": "SCRIPT",
            "endpoint": "sendCompletionRequest"
        }
    }
}
```

#### 5.4 Build Frontend

```bash
cd views
npm run build
cd ..
```

**Publish addon:**
```bash
npx alurkerja-cli addon publish
```

---

### **Step 6: Testing Integration dengan BPMN**

Setelah addon dipublish, test apakah action sudah muncul pada BPMN builder.

#### 6.1 Buat BPMN Diagram

1. Buka Alurkerja platform
2. Navigasi ke Process Designer / BPMN Builder
3. Buat diagram baru atau buka yang sudah ada

#### 6.2 Tambahkan Service Task

1. Drag & drop **Service Task** ke canvas
2. Klik pada Service Task tersebut
3. Pada properties panel, pilih **Integration**
4. Cari dan pilih **ChatGPT API Integration**
5. Pilih action **Ask ChatGPT**

**Screenshot yang diharapkan:**
> 📸 **[IMAGE: BPMN canvas dengan Service Task yang sudah dikonfigurasi dengan ChatGPT integration, menampilkan form input prompt, temperature, dan max_tokens]**

#### 6.3 Konfigurasi Parameters

Isi parameter untuk testing:
- **Prompt**: "Jelaskan apa itu workflow automation"
- **Temperature**: 0.7
- **Max Tokens**: 500

**Screenshot yang diharapkan:**
> 📸 **[IMAGE: Dialog konfigurasi action di BPMN dengan field yang sudah terisi]**

---

### **Step 7: Membuat Script dan Testing**

#### 7.1 Buat Folder Script

```bash
mkdir -p scripts/send_completion_request
```

#### 7.2 Buat Python Script

**File: `scripts/send_completion_request/send_completion_request.py`**

```python
import json
import argparse
import requests

def run(ctx):
    """
    Mengirim request ke ChatGPT API dan mengembalikan response.
    
    Execution Context:
    - ctx["parameters"]: Input dari user (prompt, temperature, max_tokens)
    - ctx["configuration"]: Konfigurasi addon (api_key, model)
    - ctx["runkey"]: Unique run identifier
    """
    
    # Ambil configuration dari addon
    config = ctx.get("configuration", {})
    api_key = config.get("api_key")
    model = config.get("model", "gpt-3.5-turbo")
    
    # Ambil parameters dari user
    params = ctx.get("parameters", {})
    prompt = params.get("prompt", "")
    temperature = float(params.get("temperature", 0.7))
    max_tokens = int(params.get("max_tokens", 1000))
    system_prompt = config.get("system_prompt", "You are a helpful assistant.")
    
    # Validasi
    if not api_key:
        raise Exception("API Key tidak ditemukan dalam konfigurasi")
    
    if not prompt:
        raise Exception("Prompt tidak boleh kosong")
    
    # Prepare request ke OpenAI API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    # Send request
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]
        
        # Return output sesuai contract
        return {
            "status": "ok",
            "message": "ChatGPT response received successfully",
            "data": {
                "ai_output": ai_response,
                "model_used": model,
                "tokens_used": result.get("usage", {})
            },
            "runkey": ctx.get("runkey")
        }
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to call ChatGPT API: {str(e)}")
    except KeyError as e:
        raise Exception(f"Unexpected response format: {str(e)}")


if __name__ == "__main__":
    # Parsing arguments sesuai contract
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", required=True, help="Execution context (JSON file or string)")
    args = parser.parse_args()
    
    # Load context
    if args.run.endswith(".json"):
        with open(args.run, 'r') as f:
            ctx = json.load(f)
    else:
        ctx = json.loads(args.run)
    
    # Execute and print output
    try:
        result = run(ctx)
        print(json.dumps(result))
    except Exception as e:
        # Error handling
        error_output = {
            "status": "error",
            "message": str(e),
            "runkey": ctx.get("runkey")
        }
        print(json.dumps(error_output))
        exit(1)
```

**Penjelasan Script:**
- Mengimplementasikan function `run(ctx)` sesuai contract
- Menerima execution context dengan `variables`, `parameters`, `configuration`, `runkey`
- Memanggil OpenAI ChatGPT API
- Mengembalikan output dalam format JSON standar

#### 7.3 Buat Requirements File

**File: `scripts/requirements.txt`**

```txt
requests==2.31.0
```

#### 7.4 Install Dependencies

```bash
pip install -r scripts/requirements.txt
```

#### 7.5 Buat Request Example untuk Testing

**File: `scripts/send_completion_request/request.example.json`**

```json
{
  "variables": {},
  "parameters": {
    "prompt": "Jelaskan apa itu workflow automation dalam 3 paragraf",
    "temperature": 0.7,
    "max_tokens": 500
  },
  "configuration": {
    "api_key": "sk-xxx...xxx",
    "model": "gpt-3.5-turbo",
    "system_prompt": "You are a helpful assistant that explains technical concepts clearly."
  },
  "runkey": "test-run-12345"
}
```

#### 7.6 Update index.json dengan Script Declaration

**File: `index.json`** (update section scripts)

```json
{
    "name": "ChatGPT-API-Integration",
    "addon_key": "chatgpt-api-integration",
    "version": "1.0.0",
    "description": "ChatGPT API integration addon untuk Alurkerja platform.",
    "author": "TheAkisTea",
    "license": "MIT",
    "type": "REST",
    "view_type": "MFE",
    "view_path": "views/dist",
    "component_scope": "chatgpt_view",
    "custom_views": {
        "CONFIGS": {
            "CREATE": "chat_gpt_config",
            "EDIT": "chat_gpt_config"
        },
        "ACTIONS": {
            "sendCompletionRequest": "ask_chatgpt_view"
        }
    },
    "config": {},
    "scripts": {
        "sendCompletionRequest": {
            "description": "Script untuk mengirim request ke ChatGPT API dan mendapat response.",
            "scripts": {
                "type": "python",
                "executable": "scripts/send_completion_request/send_completion_request.py"
            }
        }
    },
    "actions": {
        "sendCompletionRequest": {
            "name": "Ask ChatGPT",
            "description": "Mengirim pertanyaan ke ChatGPT dan mendapat response AI.",
            "type": "SCRIPT",
            "endpoint": "sendCompletionRequest"
        }
    }
}
```

**Penjelasan:**
- `scripts.sendCompletionRequest`: Deklarasi script yang akan dieksekusi
- `type`: python (bisa juga lua, javascript, dll)
- `executable`: Path relatif ke script file
- `endpoint` di `actions` mengarah ke key di `scripts`

#### 7.7 Testing Script Secara Lokal

Sesuai dengan guideline di `scripts/README.MD`, test script menggunakan command:

```bash
python scripts/send_completion_request/send_completion_request.py \
  --run scripts/send_completion_request/request.example.json
```

**Expected Output:**

```json
{
  "status": "ok",
  "message": "ChatGPT response received successfully",
  "data": {
    "ai_output": "Workflow automation adalah...",
    "model_used": "gpt-3.5-turbo",
    "tokens_used": {
      "prompt_tokens": 25,
      "completion_tokens": 150,
      "total_tokens": 175
    }
  },
  "runkey": "test-run-12345"
}
```

#### 7.8 Testing dengan Test Integration Script

Jika ada script `test_integration.py`, gunakan untuk testing yang lebih comprehensive:

```bash
python scripts/test_integration.py
```

**Publish addon final:**
```bash
npx alurkerja-cli addon publish
```

---

## ✅ Checklist Final

Pastikan semua hal berikut sudah dilakukan:

- [ ] **index.json** lengkap dengan semua section (custom_views, scripts, actions)
- [ ] **Views** sudah dibuat dan di-build (`views/dist` ada isinya)
- [ ] **Components** sudah di-expose di `bootstrap.js`
- [ ] **Script** sudah dibuat dan mengikuti contract (input/output JSON)
- [ ] **Testing lokal** berhasil (script dapat dijalankan dengan `--run`)
- [ ] **BPMN integration** terlihat dan bisa dipilih
- [ ] **Dependencies** terinstall (`npm install`, `pip install -r requirements.txt`)
- [ ] **Publish** sudah dilakukan di setiap major step

---

## 📚 Reference Documents

- **Root README.md**: Panduan lengkap struktur addon dan deployment
- **scripts/README.MD**: Contract dan guideline untuk action scripts
- **views/GUIDELINE.md**: Panduan membuat Micro Frontend dengan AlurkerjaType

---

## 🐛 Troubleshooting

### Issue: View tidak muncul setelah publish

**Solusi:**
1. Pastikan `views/dist` sudah ada dan terisi
2. Check `view_path` di `index.json` sudah benar
3. Rebuild frontend: `cd views && npm run build`
4. Publish ulang: `npx alurkerja-cli addon publish`

### Issue: Action tidak muncul di BPMN

**Solusi:**
1. Check `actions` dan `scripts` section di `index.json`
2. Pastikan `endpoint` di `actions` match dengan key di `scripts`
3. Publish ulang addon
4. Refresh halaman BPMN builder

### Issue: Script error saat execution

**Solusi:**
1. Test script secara lokal dengan `request.example.json`
2. Check error message di console
3. Pastikan dependencies terinstall
4. Validasi input/output sesuai contract

### Issue: Configuration tidak tersimpan

**Solusi:**
1. Check implementasi `form.setValue` di component
2. Pastikan field menggunakan `register` dari react-hook-form
3. Check browser console untuk error

---

## 🎉 Selesai!

Addon ChatGPT API Integration siap digunakan pada platform Alurkerja. User dapat:

1. **Mengkonfigurasi** API key dan parameter ChatGPT
2. **Menggunakan action** dalam BPMN workflow
3. **Mendapatkan response** AI dari ChatGPT
4. **Mengintegrasikan** dengan proses bisnis otomatis

---

**Created by:** TheAkisTea  
**Date:** January 22, 2026  
**Version:** 1.0.0
