const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Get all clubs (public route for registration)
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find()
      .select('name description')
      .sort({ name: 1 });
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
});

// Get club by ID (protected route)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('advisor', 'firstName lastName email')
      .populate('managers', 'firstName lastName email')
      .populate('members', 'firstName lastName email');
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching club', error: error.message });
  }
});

// Create new club (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, description, advisor } = req.body;
    
    const club = new Club({
      name,
      description,
      advisor
    });
    
    await club.save();
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: 'Error creating club', error: error.message });
  }
});

// Update club (admin and club advisor only)
router.put('/:id', authenticate, authorize(['admin', 'clubAdvisor']), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // If user is club advisor, verify they are the advisor of this club
    if (req.user.role === 'clubAdvisor' && club.advisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this club' });
    }
    
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: 'Error updating club', error: error.message });
  }
});

// Add member to club
router.post('/:id/members', authenticate, authorize(['clubManager', 'admin']), async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // If user is club manager, verify they are a manager of this club
    if (req.user.role === 'clubManager' && !club.managers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add members to this club' });
    }
    
    if (club.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this club' });
    }
    
    club.members.push(userId);
    await club.save();
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member to club', error: error.message });
  }
});

// Remove member from club
router.delete('/:id/members/:userId', authenticate, authorize(['clubManager', 'admin']), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // If user is club manager, verify they are a manager of this club
    if (req.user.role === 'clubManager' && !club.managers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to remove members from this club' });
    }
    
    club.members = club.members.filter(member => member.toString() !== req.params.userId);
    await club.save();
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Error removing member from club', error: error.message });
  }
});

module.exports = router; 