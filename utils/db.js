//utils/db.js
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
  updatePassword,
  signInWithCredential,
  EmailAuthProvider,
} = require("firebase/auth");

var serviceAccount = require("../firebase-admin-config.json");

// Pastikan belum diinisialisasi sebelumnya
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "nutrirate-profilepicture", // Menambahkan bucket storage di sini
  });
}

// Konfigurasi Firebase client-side
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... konfigurasi lainnya dari Firebase Console
};

// Pastikan belum diinisialisasi sebelumnya
const firebaseApps = require("firebase/app").getApps();
const firebaseApp =
  firebaseApps.length === 0 ? initializeApp(firebaseConfig) : firebaseApps[0];

const firebaseAuth = getAuth(firebaseApp);

const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket(); // Menambahkan akses ke Firebase Storage

module.exports = {
  auth,
  db,
  bucket,
  firebaseAuth,
  signInWithEmailAndPassword,
  updatePassword,
  signInWithCredential,
  EmailAuthProvider,
};
