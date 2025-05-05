const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Send back the file path
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'File uploaded successfully',
      filePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;