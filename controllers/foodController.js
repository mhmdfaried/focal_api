const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Membaca dataset CSV
const readDataset = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, "../makanan_indonesia_new.csv"))
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

// Mencari makanan berdasarkan nama
const searchFood = async (req, res) => {
  try {
    const { nama_makanan } = req.query;

    if (!nama_makanan) {
      return res.status(400).json({
        status: "error",
        message: "Nama makanan harus diisi",
      });
    }

    const dataset = await readDataset();
    const food = dataset.find(
      (item) => item.nama_makanan.toLowerCase() === nama_makanan.toLowerCase()
    );

    if (!food) {
      return res.status(404).json({
        status: "error",
        message: "Makanan tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: {
        id: food.id,
        nama_makanan: food.nama_makanan,
        deskripsi: food.deskripsi,
        kategori: food.kategori,
        kalori: parseInt(food.kalori),
        status_kesehatan: food.status_kesehatan,
        jenis: food.jenis,
        keterangan_kalori: food.keterangan_kalori,
        lemak: food.lemak,
        karbohidrat: food.karbohidrat,
        protein: food.protein,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  searchFood,
};
