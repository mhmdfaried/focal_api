// routes/profile.js
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfigurasi multer untuk upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Pastikan folder uploads sudah ada
      const uploadDir = './uploads/';
      
      // Buat folder jika belum ada
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // Batasi 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung'), false);
    }
  }
});

// Route untuk getProfile
router.get('/', auth, getProfile);

// Route untuk update profile (termasuk image)
router.put('/', 
  auth,  // Pastikan user sudah login
  upload.single('image'), // 'image' adalah nama field di form-data
  updateProfile
);

// Route untuk change password
router.put('/change-password', auth, changePassword);

// Route untuk delete account
router.delete('/', auth, deleteAccount);

module.exports = router;
