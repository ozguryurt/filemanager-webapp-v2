## FileManager App

Dosya ve klasör yönetimi için geliştirilmiş, React (Vite + TypeScript) tabanlı bir istemci ve Express tabanlı bir sunucudan oluşan basit bir uygulama.

### İçindekiler
- Proje Yapısı
- Kurulum
- Çalıştırma
- Ortam Değişkenleri
- İstemci (client) Komutları
- Sunucu (server) Komutları
- API Uç Noktaları
- Notlar ve İpuçları

### Proje Yapısı
```
FILEMANAGER_APP/
  client/      # Vite + React + TypeScript, TailwindCSS, Zustand, SWR
  server/      # Express, Multer, JWT, Archiver
  README.md
```

### Kurulum
Terminalde proje kök dizininde aşağıdaki adımları izleyin.

1) İstemci bağımlılıkları
```
cd client
npm install
```

2) Sunucu bağımlılıkları
```
cd ../server
npm install
```

### Çalıştırma
İki uygulama ayrı süreçlerde çalışır.

1) Sunucuyu başlatın
```
cd server
node app.js
```
Varsayılan port: `http://localhost:5000`

2) İstemciyi başlatın
```
cd ../client
npm run dev
```
Geliştirme sunucusu: Vite çıktısındaki yerel adres `http://localhost:5173`.

### Ortam Değişkenleri
Sunucu tarafında `dotenv` kuruludur ancak mevcut kod JWT gizli anahtarını ve portu app.js içinde sabit kullanır. İhtiyaç halinde aşağıdakiler gibi bir `.env` dosyası tanımlayabilir ve kodu buna göre güncelleyebilirsiniz:
```
PORT=5000
JWT_SECRET=your-secret
```

`.env` örnekleri:

- Client: `client/.env`
  ```
  VITE_API=http://localhost:5000
  ```
  - Prod için örnek: `VITE_API=https://api.yourdomain.com`

- Server: `server/.env` (opsiyonel – direkt olarak app.js dosyasından bunları düzenleyebilirsiniz)
  ```
  PORT=5000
  JWT_SECRET=your-secret-key
  ```
  - Bu tanımlamaları yaparsanız, sunucu kodunu `.env` değerlerini okuyacak şekilde güncellemeniz gerekecektir.

### İstemci (client) Komutları
`client/package.json` içerisinden:
- `npm run dev`: Geliştirme sunucusunu başlatır.
- `npm run build`: TypeScript derler ve prod derlemesi alır.
- `npm run preview`: Prod derlemesini lokalde önizler.
- `npm run lint`: ESLint ile denetim.

Kullanılan başlıca kütüphaneler:
- React 19, React Router 7
- Zustand (global state management), SWR (data fetch), TailwindCSS 4
- Vite, TypeScript

### Sunucu (server) Komutları
`server/package.json` temel komutlar:
- (Örnek) `node app.js`: Sunucuyu başlatır.

Kullanılan başlıca kütüphaneler:
- Express, CORS
- Multer (dosya yükleme), Archiver (klasör zip), JSON Web Token

### Kimlik Doğrulama
Sunucu JWT tabanlı doğrulama kullanır. Varsayılan kullanıcı adı ve parola:
- Kullanıcı adı: `admin`
- Parola: `admin`  (SHA256 ile yeni bir şifre tanımlayabilirsiniz)

Giriş sonrası dönen `token` değeri isteklerde `Authorization: Bearer <token>` başlığı ile gönderilmelidir.

### API Uç Noktaları
Tüm uç noktalar `http://localhost:5000` üzerinden yayınlanır. Kimlik doğrulama gerektiren uç noktalarda `Authorization` başlığı zorunludur.

- POST `/login`
  - Gövde: `{ "username": string, "password": string }`
  - Döner: `{ success: boolean, token?: string }`

- GET `/verify-token` (Auth gerekli)
  - Döner: `{ success: true, user: { username } }`

- GET `/files` (Auth gerekli)
  - Sorgu: `?path=alt/klasor` (opsiyonel)
  - Döner: İlgili dizindeki dosya/klasör listesi (dizi)

- POST `/upload` (Auth gerekli)
  - Form-Data: `file` alanı (tek dosya)
  - Sorgu: `?path=alt/klasor` (opsiyonel; yoksa kök `uploads/`)
  - Döner: `{ message: "File uploaded successfully" }`

- GET `/download-file` (Auth gerekli)
  - Sorgu: `?path=alt/klasor&fileName=dosya.ext`
  - Yanıt: Dosya indirme

- DELETE `/delete-file` (Auth gerekli)
  - Sorgu: `?path=alt/klasor&fileName=dosya.ext`
  - Döner: `{ message: 'File deleted successfully' }`

- POST `/create-folder` (Auth gerekli)
  - Gövde: `{ folderName: string, path?: string }`
  - Döner: `{ message: "Klasör oluşturuldu!" }`

- DELETE `/delete-folder` (Auth gerekli)
  - Sorgu: `?path=alt/klasor`
  - Döner: `{ message: "Folder deleted successfully" }`

- PUT `/edit-folder` (Auth gerekli)
  - Sorgu: `?path=mevcut/klasor`
  - Gövde: `{ newName: string }`
  - Döner: `{ message: "Folder renamed successfully" }`

- GET `/download-folder` (Auth gerekli)
  - Sorgu: `?path=alt/klasor`
  - Yanıt: İlgili klasörün ZIP indirmesi

### Notlar ve İpuçları
- Sunucu yüklemeleri `server/uploads/` dizinine yapar ve bu dizini statik olarak servis eder (`/uploads`).
- Windows üzerinde klasör isimlerinde boşluklar kullanılabilir; URL sorgularında otomatik kodlama/çözme yapılır. Gerekirse `encodeURIComponent` kullanın.
- Varsayılan JWT geçerlilik süresi 1 saattir. Süre dolduğunda yeniden giriş gerekir.