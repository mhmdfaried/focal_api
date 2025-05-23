const tf = require("@tensorflow/tfjs");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Food label mapping
const FOOD_LABELS = {
  0: "Pempek",
  1: "Gado-gado",
  2: "Nasi Goreng",
  3: "Bakso kuah",
  4: "Sate ayam",
};

// L2 Regularizer class
class L2 extends tf.serialization.Serializable {
  static className = "L2";

  constructor(config) {
    super();
    this.l2 = config.l2;
  }

  apply(weights) {
    return tf.tidy(() => {
      const l2 = tf.mul(tf.scalar(this.l2), tf.sum(tf.square(weights)));
      return l2;
    });
  }

  getConfig() {
    return {
      l2: this.l2,
    };
  }

  static fromConfig(cls, config) {
    return new L2(config);
  }
}

// Register the regularizer
tf.serialization.registerClass(L2);

let model = null;

// Initialize model
const initModel = async () => {
  if (model) return model;

  try {
    console.log("Loading model...");
    model = await tf.loadLayersModel(
      "file://" + path.join(__dirname, "../../model/model.json"),
      {
        customObjects: { L2: L2 },
      }
    );
    console.log("Model loaded successfully");
    return model;
  } catch (err) {
    console.error("Error loading model:", err);
    throw err;
  }
};

// Preprocess image
const preprocessImage = async (imageBuffer) => {
  // Resize and convert to RGB using sharp
  const processedBuffer = await sharp(imageBuffer)
    .resize(224, 224)
    .toFormat("jpeg")
    .toBuffer();

  // Convert to tensor
  const image = tf.node.decodeImage(processedBuffer);

  // Normalize to [0,1]
  const normalized = image.div(255.0);

  // Add batch dimension
  const batched = normalized.expandDims(0);

  return batched;
};

const predict = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file gambar yang diupload",
      });
    }

    // Initialize model if not already loaded
    if (!model) {
      await initModel();
    }

    // Preprocess image
    const imageBuffer = fs.readFileSync(req.file.path);
    const tensor = await preprocessImage(imageBuffer);

    // Make prediction
    const prediction = model.predict(tensor);
    const result = await prediction.data();

    // Format results
    const formattedResults = Array.from(result).map((prob, idx) => ({
      label: FOOD_LABELS[idx],
      probability: prob,
      percentage: (prob * 100).toFixed(2) + "%",
    }));

    // Sort by probability
    formattedResults.sort((a, b) => b.probability - a.probability);

    // Get top prediction
    const topPrediction = formattedResults[0];

    // Clean up tensor
    tf.dispose([tensor, prediction]);

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Prediksi berhasil",
      data: {
        food: topPrediction.label,
        confidence: topPrediction.probability,
        allPredictions: formattedResults,
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat melakukan prediksi",
      error: error.message,
    });
  }
};

module.exports = {
  predict,
};
