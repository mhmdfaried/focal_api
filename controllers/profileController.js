// controllers/profileController.js

const { db, auth, bucket, firebaseAuth, sendPasswordResetEmail, firebaseApp } = require('../utils/db');
const { signInWithEmailAndPassword, getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword} = require('firebase/auth');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
    try {
      const userDoc = await db.collection('users').doc(req.userId).get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'Profil tidak ditemukan' });
      }
  
      const userData = userDoc.data();
      res.json({
        name: userData.name,
        email: userData.email,
        image: userData.image,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };
  
  exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email } = req.body;

        const updateData = {};

        // Update nama jika ada
        if (name) {
            updateData.name = name;
        }

        // Update email jika ada
        if (email) {
          // Validasi email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ message: 'Format email tidak valid' });
          }

          // Update email di Authentication
          try {
              await auth.updateUser(userId, {
                  email: email
              });
              updateData.email = email;
          } catch (authError) {
              console.error('Error updating email in Authentication:', authError);
              return res.status(500).json({ 
                  message: 'Gagal memperbarui email di Authentication',
                  error: authError.message 
              });
          }
      }

        // Cek apakah ada file upload
        if (req.file) {
            console.log('File Details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                path: req.file.path,
                size: req.file.size
            });

            // Validasi ekstensi file
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.heic'];
            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Format file tidak didukung' });
            }

            // Nama file unik dan lokasi destinasi di bucket
            const fileName = `profile-${userId}${fileExtension}`;
            const destination = `profile-images/${fileName}`;

            // Hapus file profil lama jika ada sebelum upload file baru
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data();

                if (userData.image) {
                    // Ekstrak nama file dari URL yang ada
                    const oldFileName = userData.image.split('/').pop();
                    const oldFileDestination = `profile-images/${oldFileName}`;

                    // Hapus file lama dari bucket
                    const oldFile = bucket.file(oldFileDestination);
                    await oldFile.delete();
                }
            } catch (deleteError) {
                console.error('Error deleting old profile image:', deleteError);
                // Lanjutkan proses meskipun penghapusan file lama gagal
            }

            // Upload file baru ke bucket Firebase Storage
            await bucket.upload(req.file.path, {
                destination: destination,
                metadata: {
                    contentType: req.file.mimetype,
                    metadata: {
                        userId: userId
                    }
                }
            });

            // Ambil referensi file di bucket
            const uploadedFile = bucket.file(destination);

            // URL publik dari file yang diunggah
            const publicUrl = `https://storage.googleapis.com/nutrirate-profilepicture/${destination}`;
            updateData.image = publicUrl;

            // Hapus file sementara setelah upload selesai
            fs.unlinkSync(req.file.path);
        }

        // Update Firestore jika ada perubahan (kode tetap sama)
        if (Object.keys(updateData).length > 0) {
            await db.collection('users').doc(userId).update(updateData);
        } else {
            return res.status(400).json({ message: 'Tidak ada data yang diperbarui' });
        }

        // Ambil data terbaru dari Firestore
        const updatedUserDoc = await db.collection('users').doc(userId).get();
        const updatedUserData = updatedUserDoc.data();

        res.json({ 
            message: 'Profil berhasil diperbarui',
            user: {
                name: updatedUserData.name,
                email: updatedUserData.email,
                image: updatedUserData.image
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);

        // Hapus file sementara jika terjadi error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            message: 'Terjadi kesalahan pada server',
            error: error.message 
        });
    }
};

  exports.changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validasi input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
      }
  
      // Dapatkan user saat ini
      const currentUser = firebaseAuth.currentUser;
  
      if (!currentUser) {
        return res.status(401).json({ message: 'Pengguna tidak terautentikasi' });
      }
  
      try {
        // Buat kredensial
        const credential = EmailAuthProvider.credential(
          currentUser.email, 
          currentPassword
        );
  
        // Re-autentikasi pengguna
        await reauthenticateWithCredential(currentUser, credential);
  
        // Update password
        await updatePassword(currentUser, newPassword);
  
        res.json({ message: 'Password berhasil diubah' });
      } catch (authError) {
        console.error('Authentication error:', authError);
        
        // Tangani berbagai kesalahan otentikasi
        if (authError.code === 'auth/wrong-password') {
          return res.status(401).json({ message: 'Password saat ini salah' });
        }
        
        if (authError.code === 'auth/invalid-credential') {
          return res.status(401).json({ message: 'Kredensial tidak valid' });
        }
        
        return res.status(401).json({ message: 'Gagal mengotentikasi pengguna' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Password anda tidak sesuai!' });
    }
  };
  
  exports.deleteAccount = async (req, res) => {
    try {
      // Hapus akun dari Firebase Authentication
      await auth.deleteUser(req.userId);
  
      // Hapus data pengguna dari Firestore
      await db.collection('users').doc(req.userId).delete();
  
      res.json({ message: 'Akun berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };