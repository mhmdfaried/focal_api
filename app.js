const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // ⬅️ Tambahkan ini
require("dotenv").config();

const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const historyRoutes = require("./routes/history");
const profileRoutes = require("./routes/profile");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

// Aktifkan CORS secara global ⬇️
app.use(
  cors({
    origin: process.env.URL_DOMAIN, // ganti dengan domain frontend kamu
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/predict", predictRoutes);
app.use("/history", historyRoutes);
app.use("/profile", profileRoutes);
app.use("/food", foodRoutes);

const PORT = process.env.PORT || 8080;

const server = app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server startup error:", err);
  });

server.setTimeout(30000); // 30 detik timeout
