const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 10000;

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create folders if they don't exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("video"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = "outputs/" + "no-audio-" + req.file.filename;

  ffmpeg(inputPath)
    .noAudio()
    .output(outputPath)
    .on("end", () => {
      console.log("Audio removed successfully.");
      res.json({ success: true, downloadUrl: `/download/${path.basename(outputPath)}` });
    })
    .on("error", (err) => {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "Failed to remove audio" });
    })
    .run();
});

// Serve processed videos
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "outputs", req.params.filename);
  res.download(filePath);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
