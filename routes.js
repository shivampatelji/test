// routes.js
import express from 'express';
import bodyParser from 'body-parser';
import Record from './Record.js';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Retrieve all records
router.get('/records', async (req, res) => {
  try {
    const records = await Record.findAll();
    res.json(records);
  } catch (error) {
    console.error('Error retrieving records:', error);
    res
      .status(500)
      .json({ error: 'Error retrieving records from the database' });
  }
});

// Retrieve a single record by ID
router.get('/records/:id', async (req, res) => {
  const recordId = req.params.id;
  try {
    const record = await Record.findByPk(recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error retrieving record:', error);
    res
      .status(500)
      .json({ error: 'Error retrieving record from the database' });
  }
});

// Create a new record
router.post('/records', async (req, res) => {
  const { name, email } = req.body;
  try {
    const record = await Record.create({ name, email });
    res.json({
      message: 'Record created successfully',
      id: record.id,
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Error creating record in the database' });
  }
});

// Update a record
router.put('/records/:id', async (req, res) => {
  const recordId = req.params.id;
  const { name, email } = req.body;
  try {
    const record = await Record.findByPk(recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    record.name = name;
    record.email = email;
    await record.save();
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Error updating record in the database' });
  }
});

// Delete a record
router.delete('/records/:id', async (req, res) => {
  const recordId = req.params.id;
  try {
    const record = await Record.findByPk(recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    await record.destroy();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Error deleting record from the database' });
  }
});

export default router;
