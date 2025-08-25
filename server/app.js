// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require("cors")
const archiver = require("archiver");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ADMIN_USERNAME = 'admin';
// SHA256 ile şifrelenmiş password (default: admin)
const ADMIN_PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const JWT_SECRET = "zA5$7Nhpuwkft-ALd-HKine4xh}6SS"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.query.path ? path.join(UPLOADS_DIR, req.query.path) : UPLOADS_DIR;

    // Klasör yoksa oluştursun
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Gelen dosyanın ismi
  }
});

const upload = multer({ storage });

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Giriş
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  if (username === ADMIN_USERNAME && hashedPassword === ADMIN_PASSWORD_HASH) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" }); // 1 saat geçerli token
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/verify-token", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Klasör işlemleri
app.post("/create-folder", verifyToken, (req, res) => {
  const { folderName, path } = req.body;
  const folderPath = path ? `uploads/${path}/${folderName}` : `uploads/${folderName}`;

  if (!folderName) {
    return res.status(400).json({ error: "Klasör adı gerekli!" });
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    return res.json({ message: "Klasör oluşturuldu!" });
  } else {
    return res.status(400).json({ error: "Bu isimde bir klasör zaten var!" });
  }
});

app.delete("/delete-folder", verifyToken, (req, res) => {
  const dirPath = req.query.path ? decodeURIComponent(req.query.path) : null;

  if (!dirPath) {
    return res.status(400).json({ message: "Folder path is required" });
  }

  const folderPath = path.join(UPLOADS_DIR, dirPath);

  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true }); // Klasörü ve içindekileri silsin
      res.json({ message: "Folder deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting folder", error: err.message });
    }
  } else {
    res.status(404).json({ message: "Folder not found" });
  }
});

app.get("/download-folder", verifyToken, (req, res) => {
  const folderPath = req.query.path ? decodeURIComponent(req.query.path) : null;

  if (!folderPath) {
    return res.status(400).json({ error: "Klasör yolu gerekli!" });
  }

  const fullFolderPath = path.join(UPLOADS_DIR, folderPath);

  if (!fs.existsSync(fullFolderPath)) {
    return res.status(404).json({ error: "Klasör bulunamadı!" });
  }

  const folderName = path.basename(folderPath).replace(/\s+/g, "_");
  const zipFileName = `${folderName}.zip`;

  res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.directory(fullFolderPath, false);
  archive.pipe(res);

  archive.finalize().catch((err) => {
    console.error("ZIP oluşturma hatası:", err);
    res.status(500).json({ error: "Klasör sıkıştırma sırasında hata oluştu!" });
  });
});

app.put("/edit-folder", verifyToken, (req, res) => {
  const newName = req.body.newName;
  const dirPath = req.query.path ? decodeURIComponent(req.query.path) : null;

  if (!dirPath || !newName) {
    return res.status(400).json({ message: "Folder path and new name are required" });
  }

  const oldFolderPath = path.join(UPLOADS_DIR, dirPath);
  const newFolderPath = path.join(UPLOADS_DIR, path.dirname(dirPath), newName);

  if (!fs.existsSync(oldFolderPath)) {
    return res.status(404).json({ message: "Folder not found" });
  }

  if (fs.existsSync(newFolderPath)) {
    return res.status(400).json({ message: "A folder with the new name already exists" });
  }

  try {
    // Yeni klasörü oluştur
    fs.mkdirSync(newFolderPath);

    // Eski klasördeki tüm dosyaları yeni klasöre taşı
    fs.readdirSync(oldFolderPath).forEach(file => {
      const oldFilePath = path.join(oldFolderPath, file);
      const newFilePath = path.join(newFolderPath, file);
      fs.renameSync(oldFilePath, newFilePath);
    });

    // Eski klasörü sil
    fs.rmdirSync(oldFolderPath);

    res.json({ message: "Folder renamed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error renaming folder", error: err.message });
  }
});

// Dosya işlemleri
app.get('/files', verifyToken, (req, res) => {
  const { path: filePath } = req.query;

  if (filePath) {
    fs.readdir(`${UPLOADS_DIR}/${filePath}`, (err, files) => {
      if (err) return res.status(500).json({ message: 'Error reading directory with filePath' });
      res.json(files);
    });
  } else {
    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) return res.status(500).json({ message: 'Error reading directory' });
      res.json(files);
    });
  }
});

app.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully" });
});

app.get("/download-file", verifyToken, (req, res) => {
  const dirPath = req.query.path ? decodeURIComponent(req.query.path) : "";
  const fileName = req.query.fileName ? decodeURIComponent(req.query.fileName) : "";

  if (!fileName) {
    return res.status(400).json({ message: "File name is required" });
  }

  const filePath = path.join(UPLOADS_DIR, dirPath, fileName);

  // uploads klasörü tekrar yüklenmesin
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return res.status(403).json({ message: "Unauthorized access!" });
  }

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.delete('/delete-file', verifyToken, (req, res) => {
  const { path: dirPath, fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({ message: 'File name is required' });
  }

  const filePath = dirPath ? path.join(UPLOADS_DIR, dirPath, fileName) : path.join(UPLOADS_DIR, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});