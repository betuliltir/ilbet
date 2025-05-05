const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Updated import
const feedbackController = require('../controllers/feedbackController');

// Create new feedback (requires authentication)
router.post('/', auth, feedbackController.createFeedback);

// Get feedback for an event
router.get('/event/:eventId', feedbackController.getEventFeedback);

module.exports = router;