const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');
const auth = require('../middleware/auth');

// Make sure posterController.submitPoster is a function
console.log(typeof posterController.submitPoster);

// Submit a new poster (club managers only)
router.post('/', auth, posterController.submitPoster);

// Get all posters for a club
router.get('/club/:clubId', auth, posterController.getClubPosters);

// Get a specific poster
router.get('/:id', auth, posterController.getPosterById);

// Get all posters for university admin
router.get('/', auth, posterController.getAllPosters);

// Update poster status (admin only)
router.put('/:id/status', auth, posterController.updatePosterStatus);

module.exports = router;