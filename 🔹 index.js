const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/remove-audio", upload.single("video"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `processed/${req.file.filename}_muted.mp4`;

  ffmpeg(inputPath)
    .noAudio()
    .output(outputPath)
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      res.status(500).send("Processing failed: " + err.message);
    })
    .run();
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
