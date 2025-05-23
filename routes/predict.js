const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { predict } = require("../controllers/predictController");

const router = express.Router();

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Hanya terima file gambar
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
    }
    cb(null, true);
  },
});

router.post("/predict", upload.single("image"), predict);

module.exports = router;
