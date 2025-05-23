const express = require("express");
const router = express.Router();
const { searchFood } = require("../controllers/foodController");

// Route untuk mencari informasi makanan
router.get("/search", searchFood);

module.exports = router;
