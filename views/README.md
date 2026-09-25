# MockAPI Views - Micro Frontend

Micro Frontend (MFE) client application untuk MockAPI service menggunakan React, TypeScript, dan Module Federation.

---

## 📋 Overview

Aplikasi ini menyediakan antarmuka web interaktif untuk mengelola dan berinteraksi dengan MockAPI service. Dibangun sebagai Micro Frontend yang dapat di-expose ke aplikasi host menggunakan Webpack Module Federation.

### Tech Stack

- **Framework**: React 18.2.0
- **Language**: TypeScript
- **Build Tool**: Webpack 5 with Module Federation
- **Styling**: TailwindCSS, Emotion
- **Form Management**: React Hook Form 7.45.1
- **Routing**: React Router DOM v7
- **UI Library**: Alurkerja UI
- **Maps**: Leaflet & React Leaflet

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
```

Server akan berjalan di `http://localhost:3001`

### Build Production

```bash
# Build untuk production
npm run build
```

Output akan berada di folder `dist/`

---

## 📁 Struktur Project

```
views/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── App.tsx                 # Main application component
│   ├── Header.tsx              # Navigation header
│   ├── index.js                # Entry point
│   ├── index.css               # Global styles
│   ├── bootstrap.js            # Bootstrap configuration
│   ├── CreateView.tsx          # Create data view
│   ├── EditView.tsx            # Edit data view
│   ├── DetailView.tsx          # Detail data view
│   ├── GetDataView.tsx         # Get data view
│   ├── PostDataView.tsx        # Post data view
│   ├── debug/
│   │   ├── DebugView.tsx       # Debug tools
│   │   └── ExampleForm.tsx     # Example form component
│   └── type/
│       └── AlurkerjaType.ts    # TypeScript type definitions
├── package.json                # Dependencies & scripts
├── webpack.config.js           # Webpack configuration
├── tailwind.config.js          # TailwindCSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Documentation (this file)
```

---

## 🔌 Module Federation

Aplikasi ini di-expose sebagai remote module yang dapat dikonsumsi oleh host application.

### Exposed Modules

| Module Name | Path | Description |
|-------------|------|-------------|
| `./create_view` | `./src/CreateView.tsx` | Form untuk membuat data baru |
| `./edit_view` | `./src/EditView.tsx` | Form untuk mengedit data |
| `./detail_view` | `./src/DetailView.tsx` | Tampilan detail data |
| `./getData_view` | `./src/GetDataView.tsx` | Tampilan untuk mengambil data |
| `./postData_view` | `./src/PostDataView.tsx` | Form untuk mengirim data |

### Module Federation Config

```javascript
{
  name: 'mokapi_view',
  filename: 'remoteEntry.js',
  exposes: { /* modules above */ },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-hook-form': { singleton: true },
    leaflet: { singleton: true }
  }
}
```

### Menggunakan di Host Application

```javascript
// webpack.config.js (Host)
new ModuleFederationPlugin({
  remotes: {
    mockapi_view: 'mokapi_view@http://localhost:3001/remoteEntry.js'
  }
})

// Component usage
const CreateView = React.lazy(() => import('mockapi_view/create_view'));
```

---

## 🎨 Features

### Available Views

1. **Home** - Dashboard utama dengan overview fitur
2. **Create View** - Form untuk membuat endpoint dan konfigurasi API baru
3. **Get Data** - Interface untuk mengambil data dari endpoint
4. **Post Data** - Form untuk mengirim data ke endpoint
5. **Detail View** - Menampilkan detail data dan konfigurasi
6. **Edit View** - Form untuk mengedit data yang sudah ada
7. **Debug View** - Tools untuk debugging dan testing

### Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Halaman utama |
| `/create` | `CreateView` | Create data page |
| `/get` | `GetDataView` | Get data page |
| `/post` | `PostDataView` | Post data page |
| `/detail` | `DetailView` | Detail view page |
| `/edit` | `EditView` | Edit data page |
| `/debug` | `DebugView` | Debug tools |
| `/example-form` | `ExampleForm` | Example form |

---

## 🛠️ Configuration Files

### webpack.config.js

Konfigurasi Webpack dengan Module Federation plugin:
- Entry point: `./src/index.js`
- Dev server port: `3001`
- Module federation untuk expose components
- Loaders: babel, css, postcss, asset

### tailwind.config.js

Konfigurasi TailwindCSS untuk styling:
- Content paths untuk purging
- Theme customization
- Plugin configuration

### tsconfig.json

Konfigurasi TypeScript:
- Target: ES6
- JSX: React
- Module resolution
- Type checking options

### postcss.config.js

Konfigurasi PostCSS untuk CSS processing:
- TailwindCSS plugin
- Autoprefixer plugin

---

## 📦 Dependencies

### Main Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.2.0 | UI framework |
| `react-dom` | 18.2.0 | React DOM renderer |
| `react-router-dom` | ^7.12.0 | Client-side routing |
| `react-hook-form` | 7.45.1 | Form management |
| `alurkerja-ui` | ^1.0.242 | UI component library |
| `leaflet` | ^1.9.4 | Interactive maps |
| `react-leaflet` | ^5.0.0 | React bindings for Leaflet |
| `lucide-react` | ^0.562.0 | Icon library |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `webpack` | 5.88.2 | Module bundler |
| `typescript` | ^5.9.3 | TypeScript compiler |
| `tailwindcss` | ^3.4.0 | CSS framework |
| `babel-loader` | 9.1.3 | Babel integration |
| `ts-loader` | ^9.5.4 | TypeScript loader |

---

## 🔧 Development

### Hot Module Replacement

Development server mendukung HMR untuk development yang lebih cepat:
```bash
npm start
```

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit
```

### Debugging

Gunakan Debug View di `/debug` untuk:
- Testing form components
- Inspecting component state
- API response testing

---

## 🚢 Deployment

### Build untuk Production

```bash
npm run build
```

### Static Hosting

Deploy folder `dist/` ke static hosting seperti:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Integration dengan Backend

Pastikan CORS dikonfigurasi dengan benar pada backend API untuk allow requests dari frontend domain.

---

## 📝 Environment Variables

Jika diperlukan, buat file `.env`:

```env
# API Base URL (jika diperlukan)
REACT_APP_API_URL=http://localhost:8080

# Module Federation Remote URL
REACT_APP_REMOTE_URL=http://localhost:3001
```

---

## 🐛 Troubleshooting

### Port Already in Use

Jika port 3001 sudah digunakan:
```bash
# Ubah port di webpack.config.js
devServer: {
  port: 3002, // Ganti dengan port lain
}
```

### Module Federation Issues

Pastikan shared dependencies version match antara host dan remote:
- React version harus sama
- React DOM version harus sama
- Singleton configuration sudah benar

### Build Errors

```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Private - Internal use only

---

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.
