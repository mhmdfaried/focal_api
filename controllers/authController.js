// controllers/authController.js
const { db, auth, firebaseAuth, firebaseApp } = require("../utils/db");
const { signInWithEmailAndPassword, getAuth } = require("firebase/auth");

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
const { sendPasswordResetEmail } = require("firebase/auth");

exports.register = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nama, email, dan password wajib diisi" });
    }

    // Buat pengguna di Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Simpan data pengguna ke Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      image: defaultImage,
    });

    res
      .status(201)
      .json({ message: "Registrasi berhasil", userId: userRecord.uid });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      const idToken = await user.getIdToken();

      res.status(200).json({
        message: "Login berhasil",
        userId: user.uid,
        email: user.email,
        token: idToken, // Ini adalah token yang bisa digunakan tim mobile
      });
    } catch (authError) {
      console.error("Authentication error details:", authError);

      // Tangani kesalahan Firebase Authentication berdasarkan kode
      if (authError.code === "auth/wrong-password") {
        return res.status(401).json({ message: "Email atau password salah" });
      }
      if (authError.code === "auth/user-not-found") {
        return res.status(404).json({ message: "Email tidak terdaftar" });
      }

      // Jika kesalahan tidak teridentifikasi
      res.status(500).json({ message: "Email atau Password salah" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Pada Firebase Authentication, logout biasanya dilakukan di sisi client
    // Di sisi server, kita bisa memberi response sukses
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Gagal logout" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // Cek apakah user ada di Firebase Authentication
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log("User ditemukan:", userRecord.uid);
    } catch (userCheckError) {
      console.error("Error cek user:", userCheckError);
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    // Pastikan menggunakan firebaseAuth yang sudah dikonfigurasi
    await sendPasswordResetEmail(firebaseAuth, email);

    res.status(200).json({
      message: "Link reset password telah dikirim ke email Anda",
      email: email,
    });
  } catch (error) {
    console.error("Error lengkap:", error);

    // Tambahkan penanganan error lebih komprehensif
    switch (error.code) {
      case "auth/user-not-found":
        return res.status(404).json({ message: "Email tidak terdaftar" });
      case "auth/invalid-email":
        return res.status(400).json({ message: "Format email tidak valid" });
      case "auth/too-many-requests":
        return res
          .status(429)
          .json({ message: "Terlalu banyak permintaan. Coba lagi nanti." });
      default:
        return res.status(500).json({
          message: "Gagal mengirim email reset password",
          errorDetails: error.message,
        });
    }
  }
};
