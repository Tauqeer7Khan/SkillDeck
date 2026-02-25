const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    // Attempt standard connection first with a short timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('Standard MongoDB connection error:', err.message);
    console.log('Falling back to in-memory MongoDB server for testing...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      // Update env variable for future connections if needed
      process.env.MONGODB_URI = mongoUri;

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('In-memory MongoDB connected successfully');

      // Auto-seed data for the memory server so user can log in
      console.log('Seeding in-memory database...');
      try {
        const User = require('./models/User');
        const existingAdmin = await User.findOne({ email: 'admin@interviewprep.com' });
        if (!existingAdmin) {
          const user = new User({
            username: 'admin',
            email: 'admin@interviewprep.com',
            password: 'admin123',
            role: 'admin',
          });
          await user.save();
          console.log('Demo admin user generated (admin@interviewprep.com / admin123)');
        }
      } catch (seedErr) {
        console.error('Failed to seed in-memory db:', seedErr.message);
      }
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr.message);
    }
  }
};
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize WebSocket service
const RealTimeService = require('./services/RealTimeService');
const realTimeService = new RealTimeService();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  realTimeService.initialize(server);
  realTimeService.startHealthCheck();
});
