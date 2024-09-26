const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware to parse form-data and handle CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create uploads folder if it doesn't exist
    }
    cb(null, uploadDir); // Save the uploaded audio file in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Rename the file
  },
});

const upload = multer({ storage: storage });

// API route to handle noise removal
app.post("/api/remove-noise", upload.single("audio"), (req, res) => {
  const audioFilePath = req.file.path;
  const outputFilePath = `processed/${Date.now()}_processed.mp3`;

  // Command to execute Python noise removal script
  const script = `python remove_noise.py "${audioFilePath}" "${outputFilePath}"`;

  exec(script, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing script: ${stderr}`);
      return res.status(500).json({ error: "Error processing audio" });
    }

    // Respond with the URL of the processed audio file
    res.json({ processedAudioURL: `/download/${path.basename(outputFilePath)}` });
  });
});

// Serve processed audio files
app.use("/download", express.static(path.join(__dirname, "processed")));

// Create processed folder if it doesn't exist
const processedDir = path.join(__dirname, "processed");
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
