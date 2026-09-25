# Deklarasi Field MFE (`EXTERNAL_MICRO_FRONTEND_FORM`)

Dokumen ini menjelaskan **arti setiap key** pada deklarasi field Micro Frontend di Alurkerja,
**siapa yang mengonsumsi** key tersebut (platform vs. komponen MFE), dan **kenapa sebagian key
terlihat "tidak berefek"** — contoh paling sering: `"disabled": true` yang tetap bisa diisi user.

---

## 📋 Table of Contents

1. [Contoh Deklarasi Lengkap](#-contoh-deklarasi-lengkap)
2. [Prinsip Utama: Host Hanya Menitipkan, MFE yang Merender](#-prinsip-utama-host-hanya-menitipkan-mfe-yang-merender)
3. [Tabel Referensi Key](#-tabel-referensi-key)
4. [Kenapa `disabled: true` Tidak Terimplementasi?](#-kenapa-disabled-true-tidak-terimplementasi)
5. [Cara Menghormati `disabled` di Komponen](#-cara-menghormati-disabled-di-komponen)
6. [Konfigurasi Tambahan: `additional_mfe_config`](#-konfigurasi-tambahan-additional_mfe_config)
7. [Checklist Sebelum Bilang "Konfignya Bug"](#-checklist-sebelum-bilang-konfignya-bug)
8. [Catatan Platform (diisi tim)](#-catatan-platform-diisi-tim)

---

## 🧩 Contoh Deklarasi Lengkap

```json
{
  "ui_type": "EXTERNAL_MICRO_FRONTEND_FORM",
  "label": {
    "en": "External Micro Frontend Form",
    "id": "Formulir Micro Frontend Eksternal"
  },
  "name": "javan-addon_team_form_form_team_form",
  "url": "https://onprem.merapi.alurkerja.com/api/v1/integration/addons/javan-addon/views/remoteEntry.js",
  "component_scope": "javan_addon",
  "component_name": "analize_nota_view",
  "height": "",
  "width": "100%",
  "disabled": true,
  "edit_tabs": {
    "mfeConfig": {
      "additional_mfe_config": {}
    }
  },
  "additional_mfe_config": {
    "addonId": "1189"
  }
}
```

---

## 🎯 Prinsip Utama: Host Hanya Menitipkan, MFE yang Merender

Ada **dua kelompok key** dalam deklarasi di atas, dan ini sumber semua kebingungan:

| Kelompok | Siapa yang mengeksekusi | Contoh key |
|---|---|---|
| **Loader keys** | **Platform Alurkerja (host)** — dipakai untuk *menemukan & memuat* bundle Module Federation, lalu menentukan ukuran iframe/container-nya. | `url`, `component_scope`, `component_name`, `ui_type`, `height`, `width` |
| **Payload keys** | **Komponen MFE kamu** — host cuma menyalin seluruh objek deklarasi ini menjadi prop `props.item`, lalu *berhenti di situ*. | `label`, `disabled`, `constraints`, `placeholder`, `tooltip`, `additional_mfe_config`, dan key custom apa pun |

Untuk field bawaan Alurkerja (`TEXT_FIELD`, `SELECT`, dll.), host yang merender input-nya, jadi
host bisa memaksakan `disabled`/`required`/`placeholder`. Untuk `EXTERNAL_MICRO_FRONTEND_FORM`,
**yang merender adalah React component milikmu**. Host tidak punya cara memaksa `<input>` di dalam
JSX pihak ketiga menjadi disabled — maka semua payload key statusnya **advisory**: cuma data titipan.

> **Kalimat kuncinya:** payload key bukan perintah ke platform, melainkan **parameter yang harus
> dibaca sendiri oleh komponen MFE**. Kalau komponennya tidak membaca, key-nya tidak melakukan apa-apa.

Bentuk prop yang diterima komponen — lihat [AlurkerjaType.ts](views/src/type/AlurkerjaType.ts):

```typescript
export interface AlurkerjaMfeInputProps {
    props: {
        form: { setValue, register, control, watch, getValues };
        item: InputType;      // ← SELURUH JSON deklarasi di atas masuk ke sini
    };
    alurkerjaParams: {
        apiBaseUrl?: string;
        token: string;
        activeTenant: string;
        probis: string;
        taskId: string;
        [key: string]: any;
    };
}
```

---

## 📚 Tabel Referensi Key

| Key | Wajib | Dikonsumsi oleh | Fungsi & catatan |
|---|:---:|---|---|
| `ui_type` | ✅ | Host | Harus persis `EXTERNAL_MICRO_FRONTEND_FORM`. Ini yang membuat host memakai loader Module Federation alih-alih renderer field bawaan. |
| `name` | ✅ | Host + form | **Nama field di form state.** Ini key yang dipakai `form.setValue(name, ...)` / `getValues(name)` dan yang tersimpan ke variabel proses. Harus unik dalam satu form. |
| `label.en` / `label.id` | ➖ | **MFE** | Label multi-bahasa. Host *tidak* otomatis mencetak judul di atas MFE — kalau butuh judul, render sendiri dari `item.label`. |
| `url` | ✅ | Host | URL absolut ke `remoteEntry.js` hasil build [views/](views/). Salah host/protokol → MFE blank tanpa error di form. |
| `component_scope` | ✅ | Host | Nama global scope Module Federation. **Harus sama** dengan `component_scope` di [index.json](index.json) dan `name` di ModuleFederationPlugin ([views/webpack.config.js](views/webpack.config.js)). Di repo ini nilainya `javan_addon`. |
| `component_name` | ✅ | Host | Nama modul yang di-`exposes`, **tanpa prefix `./`**. Contoh: `exposes: { './analize_nota_view': ... }` → tulis `analize_nota_view`. Salah ketik = MFE tidak muncul. |
| `height` | ➖ | Host | Tinggi container. String CSS (`"400px"`, `"100%"`). Kosong = tinggi mengikuti konten. |
| `width` | ➖ | Host | Lebar container. String CSS. Umumnya `"100%"`. |
| `disabled` | ➖ | **MFE** | Niatnya "field read-only" (mis. saat form di tahap review/approval). **Tidak dipaksakan host** — lihat [bagian berikutnya](#-kenapa-disabled-true-tidak-terimplementasi). |
| `constraints.required` | ➖ | **MFE** | Sama seperti `disabled`: validasi wajib-isi harus kamu daftarkan sendiri lewat `form.register(name, { required: ... })`. |
| `placeholder`, `tooltip`, `defaultValue` | ➖ | **MFE** | Ikut terkirim di `item`, tapi tidak ada efek otomatis. Baca manual bila perlu. |
| `additional_mfe_config` | ➖ | **MFE** | **Kantong konfigurasi bebas** — cara resmi mengirim parameter custom ke komponen. [Detail di bawah](#-konfigurasi-tambahan-additional_mfe_config). |
| `edit_tabs.mfeConfig.additional_mfe_config` | ➖ | Form builder (UI) | Deklarasi agar form builder **menampilkan tab editor** untuk mengisi `additional_mfe_config`. Ini metadata untuk UI konfigurator, **bukan** nilai yang dibaca komponen. Nilai finalnya tetap ditulis ke `additional_mfe_config` di level atas. |

---

## ❓ Kenapa `disabled: true` Tidak Terimplementasi?

Karena **tidak ada bug di platform** — `disabled` memang tidak pernah ditegakkan (*enforced*) oleh
host untuk MFE. Host hanya menyalinnya ke `props.item.disabled`. Kalau komponennya tidak membaca
nilai itu, tidak ada yang berubah di layar.

Di repo ini, keduanya bisa dibuktikan berdampingan:

| Komponen | Baca `item.disabled`? | Hasil saat `"disabled": true` |
|---|:---:|---|
| [TeamFormView.tsx:128](views/src/form-custom/TeamFormView.tsx#L128) | ✅ Ya | Header, form input, tombol tambah, dan tombol hapus disembunyikan → benar-benar read-only. |
| [AnalizeNotaView.tsx:63](views/src/postgres-telegram/AnalizeNotaView.tsx#L63) | ❌ Tidak (hanya baca `additional_mfe_config`) | Tombol "Analisa" tetap aktif, user tetap bisa upload & submit. |

Jadi checklist `disabled` di konfigurator addon itu **valid dan tersimpan**; yang belum ada adalah
implementasinya di sisi komponen. Ini keputusan developer per-komponen, bukan setting yang hilang.

---

## 🛠️ Cara Menghormati `disabled` di Komponen

Pola yang dipakai [TeamFormView.tsx](views/src/form-custom/TeamFormView.tsx) — sembunyikan kontrol
input, tetap tampilkan datanya:

```tsx
export default function MyView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const isReadOnly = Boolean(item.disabled);

    return (
        <div className="space-y-4">
            {/* Kontrol input: sembunyikan saat read-only */}
            {!isReadOnly && (
                <button onClick={handleAnalyze} disabled={isLoading}>
                    Analisa Nota
                </button>
            )}

            {/* Hasil / data: tetap tampil di kedua mode */}
            {result && <ResultTable data={result} />}
        </div>
    );
}
```

Tiga hal yang sering terlewat saat mengimplementasikan `disabled`:

1. **Semua** tombol aksi (submit, tambah, hapus, upload) ikut dimatikan — bukan cuma yang utama.
2. Validasi `required` ikut dilepas, supaya form read-only tidak macet saat submit:
   ```tsx
   required: (!item.disabled && item.constraints?.required) ? 'Field wajib diisi' : false
   ```
3. Alternatif dari menyembunyikan: teruskan ke atribut native/library —
   `<input disabled={isReadOnly} />` atau `<Select isDisabled={isReadOnly} />`. Pilih satu gaya dan
   konsisten dalam satu komponen.

---

## ⚙️ Konfigurasi Tambahan: `additional_mfe_config`

Ini **jalur resmi** untuk mengirim parameter custom dari deklarasi addon ke komponen, tanpa perlu
menambah key baru ke skema field (key baru di luar skema berisiko dibuang oleh validator platform).

**1. Deklarasikan di JSON field:**

```json
{
  "ui_type": "EXTERNAL_MICRO_FRONTEND_FORM",
  "name": "analyze_receipt",
  "component_name": "analize_nota_view",
  "additional_mfe_config": {
    "addonId": "1189",
    "targetField": "total_amount",
    "maxFiles": "5",
    "autoAnalyze": "false"
  }
}
```

**2. Baca di komponen** — persis seperti [AnalizeNotaView.tsx:63](views/src/postgres-telegram/AnalizeNotaView.tsx#L63):

```tsx
const item = props.item;
const addonId = item.additional_mfe_config?.addonId ?? 3;
```

### Aturan main

- **Selalu pakai optional chaining + default.** Konfigurasi lama/instance lama bisa saja belum punya
  key-nya: `item.additional_mfe_config?.maxFiles ?? 5`.
- **Nilai dari form builder masuk sebagai string.** Perhatikan `"addonId": "1189"` — bertanda kutip.
  Konversi eksplisit sebelum dipakai sebagai angka atau boolean:
  ```tsx
  const maxFiles = Number(item.additional_mfe_config?.maxFiles ?? 5);
  const autoAnalyze = item.additional_mfe_config?.autoAnalyze === 'true'; // JANGAN Boolean("false")
  ```
- **Jangan simpan rahasia di sini.** Isinya terkirim ke browser dan terbaca di DevTools. Token/API key
  taruh di `config` addon ([index.json](index.json)) yang dipakai oleh script Python di sisi server.
- **`camelCase` untuk key-nya**, mengikuti `addonId` yang sudah ada.
- **Dokumentasikan setiap key baru** di README komponen — konfigurator addon tidak punya deskripsi
  field untuk kantong bebas ini, jadi README-lah satu-satunya sumber kebenaran.
- **Agar tab pengisiannya muncul di form builder**, sertakan juga:
  ```json
  "edit_tabs": { "mfeConfig": { "additional_mfe_config": {} } }
  ```

---

## ✅ Checklist Sebelum Bilang "Konfignya Bug"

Saat sebuah key di deklarasi terasa diabaikan, urut dari atas:

- [ ] Key-nya **loader key atau payload key**? Payload key (`disabled`, `label`, `constraints`,
      `placeholder`) memang tidak pernah ditegakkan host — komponen yang harus membacanya.
- [ ] Komponennya sudah `grep` untuk key tersebut? (`grep -rn "item.disabled" views/src`)
- [ ] `component_name` cocok dengan `exposes` di [views/webpack.config.js](views/webpack.config.js)
      (tanpa `./`)?
- [ ] `component_scope` cocok dengan `index.json` **dan** `ModuleFederationPlugin.name`?
- [ ] Sudah `npm run build` di [views/](views/) lalu publish ulang addon
      (`npx alurkerja-cli addon publish`)?
- [ ] Cache browser / `remoteEntry.js` sudah ter-refresh? Bundle lama sering masih di-serve.

---

## 📝 Catatan Platform (diisi tim)

> Bagian ini sengaja dikosongkan untuk diisi dengan penjelasan cara kerja dari sisi platform/host —
> hal-hal yang tidak bisa disimpulkan dari repo addon ini saja. Hapus komentar `<!-- -->` dan isi.

### Alur pemuatan MFE oleh host

<!-- SLOT: Jelaskan urutan host memuat MFE — kapan remoteEntry.js di-fetch, bagaimana
     component_scope di-resolve, di titik mana props.item dan alurkerjaParams disusun,
     dan apa yang terjadi kalau component_name tidak ditemukan. -->

_(belum diisi)_

### Perilaku `disabled` di sisi host

<!-- SLOT: Konfirmasi apakah host benar-benar tidak pernah menegakkan `disabled` untuk
     ui_type MFE, atau ada kondisi tertentu (mis. mode view-only task, form ter-submit)
     di mana host ikut campur. Sebutkan juga apakah nilainya dipakai untuk validasi
     backend saat submit. -->

_(belum diisi)_

### Sumber nilai `additional_mfe_config`

<!-- SLOT: Jelaskan dari mana nilai ini diisi (tab mfeConfig di form builder?), apakah
     ada type coercion di sisi platform, batas ukuran/kedalaman objek, dan apakah nilai
     nested (objek/array) didukung atau hanya string flat. -->

_(belum diisi)_

### Key lain yang dikenali platform

<!-- SLOT: Daftar key yang belum tercakup di tabel referensi — mis. visibility rules,
     conditional display, dependensi antar-field, atau key khusus versi platform tertentu. -->

_(belum diisi)_
