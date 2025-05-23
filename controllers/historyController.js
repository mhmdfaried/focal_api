const { db } = require('../utils/db');
const admin = require('firebase-admin');

exports.getHistory = async (req, res) => {
  try {
    console.log('Fetching all history');

    // Ambil riwayat semua pengguna
    const historyRef = db.collection('history')
      .orderBy('timestamp', 'desc'); // Urutkan berdasarkan waktu

    const snapshot = await historyRef.get();

    let history = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Ambil nama pengguna berdasarkan userId dari koleksi 'users'
      const userDoc = await db.collection('users').doc(data.userId).get();
      if (!userDoc.exists) {
        continue; // Jika user tidak ditemukan, lanjutkan ke riwayat berikutnya
      }

      const userName = userDoc.data().name;

      // Membuat salinan data dan menambahkan nama user
      const historyItem = {
        id: doc.id,
        userId: data.userId,
        name: userName, // Tambahkan nama user
        originalInputs: data.originalInputs,
        productName: data.productName,
        gramPerServing: data.gramPerServing,
        grade: data.grade,
        timestamp: data.timestamp
      };

      history.push(historyItem);
    }

    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
