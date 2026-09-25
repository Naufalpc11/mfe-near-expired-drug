# Javan Addon - Panduan Pengguna

Addon integrasi komprehensif untuk platform Alurkerja, menyediakan tools yang powerful untuk manajemen data, integrasi sistem eksternal, dan otomasi workflow.

## 📋 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Instalasi](#instalasi)
- [Aksi Yang Tersedia](#aksi-yang-tersedia)
- [Cara Penggunaan](#cara-penggunaan)
- [Panduan Konfigurasi](#panduan-konfigurasi)
- [Troubleshooting](#troubleshooting)

## 🎯 Gambaran Umum

Javan Addon menyediakan kemampuan integrasi esensial untuk workflow Alurkerja Anda:

- **Manajemen Data**: Fetch, post, dan manipulasi data dari berbagai sumber
- **Integrasi Eksternal**: Koneksi dengan Odoo, Telegram, PostgreSQL, dan lainnya
- **Tools Otomasi**: Kirim pengingat, proses pembayaran, dan kelola record
- **Pemrosesan Form**: Handle form kustom dan validasi data
- **Komunikasi**: Kirim notifikasi melalui Telegram dan channel lainnya

## 🚀 Instalasi

1. **Install Addon**:
   - Buka Alurkerja Addon Store
   - Cari "Javan Addon"
   - Klik "Install" dan ikuti petunjuk

2. **Verifikasi Instalasi**:
   - Masuk ke workflow builder
   - Cari aksi Javan Addon di action library
   - Test dengan aksi sederhana untuk memastikan konektivitas

## 📊 Aksi Yang Tersedia

### 🗄️ Manajemen Data
- **Delete Data**: Hapus record dari database
- **Get Record by Email**: Cari record spesifik menggunakan alamat email
- **Send Table List**: Generate dan distribute ringkasan tabel

### 🔗 Integrasi Odoo
- **Fetch Odoo Account**: Ambil informasi akun dari Odoo
- **Fetch Odoo Company**: Get data company dari sistem Odoo
- **Fetch Odoo Employee**: Akses record karyawan
- **Fetch Odoo Job Position**: Ambil data posisi pekerjaan
- **Fetch Odoo Journals**: Get jurnal entry dan data finansial
- **Fetch Odoo Partner**: Akses informasi partner/customer
- **Post Odoo Journals**: Buat jurnal entry baru di Odoo

### 💳 Pemrosesan Pembayaran
- **Post Data Payment**: Proses transaksi pembayaran dan data

### 📱 Komunikasi
- **Send Reminder**: Notifikasi pengingat otomatis
- **Send Telegram Message**: Kirim pesan melalui bot Telegram

## 🛠️ Cara Penggunaan

### Setup Workflow Dasar

1. **Buat Workflow Baru**:
   - Buka Alurkerja workflow builder
   - Klik "New Workflow"
   - Drag aksi Javan Addon ke canvas

2. **Konfigurasi Aksi**:
   - Double-click aksi untuk membuka konfigurasi
   - Isi parameter yang diperlukan
   - Setup kredensial koneksi jika diperlukan

3. **Test & Deploy**:
   - Gunakan test mode untuk verifikasi konfigurasi
   - Deploy workflow ketika siap

### Contoh: Mengirim Pesan Telegram

1. **Pilih Aksi**: Pilih "Send Telegram Message"
2. **Konfigurasi Parameter**:
   ```
   Bot Token: your_telegram_bot_token
   Chat ID: target_chat_id
   Message: "Hello from Alurkerja!"
   ```
3. **Test**: Klik "Test Action" untuk mengirim pesan sample
4. **Simpan**: Simpan konfigurasi dan deploy workflow

### Contoh: Mengambil Data Odoo

1. **Pilih Aksi**: Pilih "Fetch Odoo Employee"
2. **Konfigurasi Koneksi**:
   ```
   Server URL: https://your-odoo-server.com
   Database: your_database_name
   Username: your_username
   Password: your_password
   ```
3. **Set Filter** (Opsional):
   ```json
   {
     "department_id": 5,
     "active": true
   }
   ```
4. **Eksekusi**: Jalankan aksi untuk mengambil data karyawan

## ⚙️ Panduan Konfigurasi

### Konfigurasi Koneksi Odoo

Untuk aksi Odoo, Anda perlu mengkonfigurasi koneksi:

1. **Kredensial Server**:
   ```
   Server URL: https://server-odoo-anda.com
   Database: nama_database_anda
   Username: username_anda 
   Password: password_anda
   ```

2. **Parameter Opsional**:
   - **Domain Filter**: Filter data berdasarkan kriteria tertentu
   - **Fields**: Pilih field spesifik yang ingin diambil
   - **Limit**: Batasi jumlah record yang diambil

### Konfigurasi Telegram Bot

Untuk fitur Telegram:

1. **Buat Bot Telegram**:
   - Chat dengan @BotFather di Telegram
   - Gunakan perintah `/newbot`
   - Dapatkan Bot Token

2. **Konfigurasi di Javan Addon**:
   ```
   Bot Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   Chat ID: -1001234567890 (untuk grup) atau 987654321 (untuk user)
   ```

3. **Mendapatkan Chat ID**:
   - Kirim pesan ke bot
   - Akses `https://api.telegram.org/bot{BOT_TOKEN}/getUpdates`
   - Copy Chat ID dari response

### Konfigurasi Database

Untuk operasi database:

```json
{
  "connection_string": "postgresql://user:password@host:port/database",
  "table_name": "nama_tabel",
  "query_params": {
    "limit": 100,
    "offset": 0
  }
}
```

## 🔧 Troubleshooting

### Masalah Umum

#### 1. Koneksi Odoo Gagal
**Gejala**: Error "Connection failed" atau "Authentication failed"

**Solusi**:
- Pastikan URL server benar dan dapat diakses
- Verifikasi kredensial username dan password
- Cek apakah database name sudah sesuai
- Pastikan tidak ada firewall yang memblokir koneksi

#### 2. Telegram Message Tidak Terkirim
**Gejala**: Pesan tidak sampai di Telegram

**Solusi**:
- Verifikasi Bot Token masih valid
- Pastikan Chat ID benar
- Cek apakah bot sudah di-add ke grup (untuk grup chat)
- Pastikan bot memiliki permission untuk send messages

#### 3. Data Tidak Muncul
**Gejala**: Aksi berhasil tapi tidak ada data yang ditampilkan

**Solusi**:
- Cek filter yang digunakan, mungkin terlalu restrictive
- Verifikasi permission user untuk akses data
- Pastikan field yang diminta tersedia di database
- Cek log untuk error messages

#### 4. Workflow Timeout
**Gejala**: Workflow berhenti dengan timeout error

**Solusi**:
- Kurangi jumlah data yang di-fetch dengan limit
- Optimalkan query filter
- Periksa koneksi network
- Pertimbangkan untuk split operation menjadi beberapa step

### Tips Optimasi Performance

1. **Gunakan Filter yang Spesifik**: 
   - Selalu gunakan filter untuk membatasi data yang diambil
   - Hindari fetch all data sekaligus

2. **Batasi Field yang Diambil**:
   - Hanya ambil field yang benar-benar diperlukan
   - Ini akan mempercepat proses dan mengurangi bandwidth

3. **Implementasi Paging**:
   - Untuk data besar, gunakan limit dan offset
   - Proses data secara bertahap

4. **Cache Data yang Statis**:
   - Simpan data yang jarang berubah di variable
   - Avoid fetch data yang sama berulang-ulang

## 📚 Contoh Use Cases

### 1. Sinkronisasi Data Karyawan
```
Workflow: Daily Employee Sync
- Fetch Odoo Employee (pagi hari)
- Filter: active employees only
- Send Table List (kirim summary ke manager)
- Send Telegram Message (notifikasi completion)
```

### 2. Notifikasi Pembayaran Otomatis  
```
Workflow: Payment Notification
- Post Data Payment (process payment)
- Get Record by Email (ambil detail customer)
- Send Telegram Message (kirim konfirmasi ke customer)
```

### 3. Reminder Tagihan Bulanan
```
Workflow: Monthly Invoice Reminder
- Fetch Odoo Partner (ambil customer dengan tagihan)
- Filter: outstanding invoices
- Send Reminder (kirim email reminder)
- Send Telegram Message (notifikasi ke tim finance)
```

## 📞 Dukungan

Untuk pertanyaan atau masalah:
- Cek dokumentasi ini terlebih dahulu
- Hubungi tim support Alurkerja
- Buat ticket untuk bug reports
- Konsultasi dengan tim development untuk guidance

## 🔄 Update & Maintenance

### Cara Update Addon
1. Cek versi terbaru di Addon Store
2. Backup konfigurasi workflow yang ada
3. Update addon melalui Addon Store
4. Test workflow untuk memastikan kompatibilitas
5. Re-deploy workflow jika diperlukan

### Best Practices
- Selalu test di environment development dulu
- Backup konfigurasi sebelum update
- Monitor performance setelah update
- Update secara berkala untuk mendapat fitur terbaru dan security fixes