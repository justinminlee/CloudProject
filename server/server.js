const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const compression = require('compression');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(compression()); // Enable gzip compression for faster responses

// Set up a folder for storing compressed files
const compressedFolderPath = path.join(__dirname, 'compressed_files');
if (!fs.existsSync(compressedFolderPath)) {
    fs.mkdirSync(compressedFolderPath);
}

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the frontend build (if you have a build folder for your React app)
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'compressed_files')));

app.get('/', (req, res) => {
  res.send('Hello, this is your file compression server!');
});



// API endpoint for file compression
app.post('/compress', upload.array('files'), (req, res) => {
  console.log('Compression endpoint triggered');
  try {
      // Use archiver to compress files
      const archive = archiver('zip', {
          zlib: { level: 9 } // Set compression level to maximum
      });

      const zipFileName = `compressed_${Date.now()}.zip`;
      const zipFilePath = path.join(compressedFolderPath, zipFileName);

      const output = fs.createWriteStream(zipFilePath);
      archive.pipe(output);

      req.files.forEach(file => {
          const filename = file.originalname;
          archive.append(file.buffer, { name: filename });
      });

      archive.finalize();

      output.on('close', () => {
          res.download(zipFilePath, zipFileName, (err) => {
              if (err) {
                  console.error('Error during file download:', err);
              }
              // Clean up: Delete the compressed file after download
              fs.unlinkSync(zipFilePath);
          });
      });
  } catch (error) {
      console.error('Error during compression:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
