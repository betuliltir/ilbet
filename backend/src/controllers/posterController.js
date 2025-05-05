const Poster = require('../models/Poster');
const Club = require('../models/Club');
const User = require('../models/User');

// Submit a new poster
const submitPoster = async (req, res) => {
  try {
    const { title, imageUrl, clubId } = req.body;
    
    // Check if user is a club manager
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.userType !== 'clubManager') {
      return res.status(403).json({ message: 'Not authorized to submit posters' });
    }
    
    // Verify the user manages this club
    const club = await Club.findOne({ 
      _id: clubId,
      managers: { $in: [req.user.userId] }
    });
    
    if (!club) {
      return res.status(403).json({ message: 'Not authorized to submit posters for this club' });
    }
    
    const poster = new Poster({
      title,
      imageUrl,
      club: clubId,
      submittedBy: req.user.userId,
    });
    
    await poster.save();
    
    res.status(201).json({
      message: 'Poster submitted successfully',
      poster
    });
  } catch (error) {
    console.error('Error submitting poster:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posters for a club
const getClubPosters = async (req, res) => {
  try {
    const { clubId } = req.params;
    
    // Check if user is authorized to view these posters
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Club managers can only see their club's posters
    if (user.userType === 'clubManager') {
      const club = await Club.findOne({ 
        _id: clubId,
        managers: { $in: [req.user.userId] }
      });
      
      if (!club) {
        return res.status(403).json({ message: 'Not authorized to view posters for this club' });
      }
    }
    
    const posters = await Poster.find({ club: clubId })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'firstName lastName email');
    
    res.json(posters);
  } catch (error) {
    console.error('Error fetching club posters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific poster
const getPosterById = async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email')
      .populate('club', 'name');
    
    if (!poster) {
      return res.status(404).json({ message: 'Poster not found' });
    }
    
    res.json(poster);
  } catch (error) {
    console.error('Error fetching poster:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posters (admin only)
const getAllPosters = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only admins can view all posters
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all posters' });
    }
    
    const posters = await Poster.find()
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'firstName lastName email')
      .populate('club', 'name');
    
    res.json(posters);
  } catch (error) {
    console.error('Error fetching all posters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update poster status (admin only)
const updatePosterStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update poster status' });
    }
    
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ message: 'Poster not found' });
    }
    
    poster.status = status;
    poster.feedback = feedback || '';
    poster.updatedAt = Date.now();
    
    await poster.save();
    
    res.json({
      message: 'Poster status updated successfully',
      poster
    });
  } catch (error) {
    console.error('Error updating poster status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// The key change: Make sure to export functions correctly
module.exports = {
  submitPoster,
  getClubPosters,
  getPosterById,
  getAllPosters,
  updatePosterStatus
};