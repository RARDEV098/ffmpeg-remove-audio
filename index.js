const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

const upload = multer({ dest: "uploads/" });

ffmpeg.setFfmpegPath(ffmpegPath);

app.post("/upload", upload.single("video"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `outputs/output-${Date.now()}.mp4`;

  ffmpeg(inputPath)
    .noAudio()
    .save(outputPath)
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      res.status(500).send("Error processing video.");
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
