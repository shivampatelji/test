// server.js

import express from 'express';
import multer from 'multer';
import mysql from 'mysql2';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const app = express();
const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors());
app.use('/uploads', express.static(join(__dirname, 'uploads')));
// Set up MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydatabase',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Define routes
app.post('/upload', upload.single('image'), (req, res) => {
  const { filename } = req.file;

  // Save the image filename to the database
  const sql = `INSERT INTO images (filename) VALUES (?)`;
  connection.query(sql, [filename], (err, result) => {
    if (err) {
      console.error('Error saving image to database:', err);
      return res
        .status(500)
        .json({ error: 'Failed to save image to database' });
    }
    res.status(200).json({ message: 'Image uploaded successfully' });
  });
});

app.get('/images', (req, res) => {
  // Fetch all images from the database
  const sql = `SELECT * FROM images`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching images from database:', err);
      return res
        .status(500)
        .json({ error: 'Failed to fetch images from database' });
    }
    res.status(200).json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
