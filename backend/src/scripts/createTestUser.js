require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'sevvalelif@sabanciuniv.edu' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create new user
    const user = new User({
      firstName: 'Sevval',
      lastName: 'Elif',
      email: 'sevvalelif@sabanciuniv.edu',
      password: '123456',
      role: 'student',
      studentId: 'STUDENT123'
    });

    await user.save();
    console.log('Test user created successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

createTestUser(); 