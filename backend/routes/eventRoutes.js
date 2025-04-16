const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// Event routes
router.post('/', authMiddleware, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

// Participant routes
router.post('/:id/participants', authMiddleware, eventController.addParticipant);
router.delete('/:id/participants', authMiddleware, eventController.removeParticipant);
router.get('/:id/participants', authMiddleware, eventController.getParticipants);

// Feedback routes
router.post('/:eventId/feedback', authMiddleware, feedbackController.submitFeedback);
router.get('/:eventId/feedback', authMiddleware, feedbackController.getEventFeedback);

module.exports = router; 