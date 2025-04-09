const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/remove-audio', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `outputs/output-${Date.now()}.mp4`;

  ffmpeg(inputPath)
    .noAudio()
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Processing failed');
    })
    .run();
});

app.get('/', (req, res) => {
  res.send('✅ FFmpeg Audio Remover is live!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
