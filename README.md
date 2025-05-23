# FoCal Backend API

Backend API untuk aplikasi FoCal - Aplikasi Analisis Kalori Makanan Indonesia menggunakan Machine Learning.

## Deskripsi

FoCal Backend API adalah layanan backend yang menyediakan endpoint untuk:

- Autentikasi pengguna
- Analisis kalori makanan menggunakan model machine learning
- Manajemen riwayat analisis
- Manajemen profil pengguna
- Informasi makanan Indonesia

## Teknologi yang Digunakan

- Node.js
- Express.js
- Firebase (Authentication & Database)
- Machine Learning Model
- JWT untuk autentikasi
- CSV Parser untuk dataset makanan

## Prasyarat

- Node.js (v14 atau lebih baru)
- npm atau yarn
- Firebase project
- Python (untuk model ML)

## Instalasi

1. Clone repository

```bash
git clone https://github.com/FoCal-PNJ/BackendAPI.git
cd BackendAPI
```

2. Install dependencies

```bash
npm install
```

3. Buat file `.env` di root directory dengan konfigurasi berikut:

```env
PORT=8080
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
JWT_SECRET=your_jwt_secret
```

4. Jalankan server

```bash
npm start
```

## Struktur Proyek

```
├── app.js              # Entry point aplikasi
├── routes/            # Definisi routes
├── controllers/       # Logic handler
├── middleware/        # Custom middleware
├── utils/            # Utility functions
├── ml-model/         # Model machine learning
└── makanan_indonesia_new.csv  # Dataset makanan
```

## API Endpoints

### Autentikasi

- `POST /auth/register` - Registrasi pengguna baru
- `POST /auth/login` - Login pengguna
- `POST /auth/logout` - Logout pengguna

### Prediksi Nutrisi

- `POST /predict` - Analisis nutrisi makanan

### Riwayat

- `GET /history` - Mendapatkan riwayat analisis
- `POST /history` - Menyimpan hasil analisis

### Profil

- `GET /profile` - Mendapatkan profil pengguna
- `PUT /profile` - Update profil pengguna

### Makanan

- `GET /food` - Mendapatkan daftar makanan
- `GET /food/:id` - Mendapatkan detail makanan

## Pengembangan

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Kontribusi

Kontribusi selalu diterima! Silakan buat issue atau pull request untuk berkontribusi.

## Lisensi

Distribusikan di bawah lisensi ISC. Lihat `LICENSE` untuk informasi lebih lanjut.

## Kontak

Tim FoCal PNJ - [@FoCal-PNJ](https://github.com/FoCal-PNJ)
