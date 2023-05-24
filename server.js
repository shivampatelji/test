const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydatabase',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Retrieve all records
app.get('/records', (req, res) => {
  connection.query('SELECT * FROM records', (err, results) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res
        .status(500)
        .json({ error: 'Error retrieving records from the database' });
    }
    res.json(results);
  });
});

// Retrieve a single record by ID
app.get('/records/:id', (req, res) => {
  const recordId = req.params.id;
  connection.query(
    'SELECT * FROM records WHERE id = ?',
    [recordId],
    (err, results) => {
      if (err) {
        console.error('Error executing MySQL query: ' + err.stack);
        return res
          .status(500)
          .json({ error: 'Error retrieving record from the database' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json(results[0]);
    }
  );
});

// Create a new record
app.post('/records', (req, res) => {
  const { name, email } = req.body;
  connection.query(
    'INSERT INTO records (name, email) VALUES (?, ?)',
    [name, email],
    (err, results) => {
      if (err) {
        console.error('Error executing MySQL query: ' + err.stack);
        return res
          .status(500)
          .json({ error: 'Error creating record in the database' });
      }
      res.json({
        message: 'Record created successfully',
        id: results.insertId,
      });
    }
  );
});

// Update a record
app.put('/records/:id', (req, res) => {
  const recordId = req.params.id;
  const { name, email } = req.body;
  connection.query(
    'UPDATE records SET name = ?, email = ? WHERE id = ?',
    [name, email, recordId],
    (err) => {
      if (err) {
        console.error('Error executing MySQL query: ' + err.stack);
        return res
          .status(500)
          .json({ error: 'Error updating record in the database' });
      }
      res.json({ message: 'Record updated successfully' });
    }
  );
});

// Delete a record
app.delete('/records/:id', (req, res) => {
  const recordId = req.params.id;
  connection.query('DELETE FROM records WHERE id = ?', [recordId], (err) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res
        .status(500)
        .json({ error: 'Error deleting record from the database' });
    }
    res.json({ message: 'Record deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
