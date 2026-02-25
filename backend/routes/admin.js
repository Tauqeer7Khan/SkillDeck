const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Progress = require('../models/Progress');
const router = express.Router();

// Middleware to protect routes and check admin role
const protectAndAdmin = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Get dashboard statistics
router.get('/dashboard', protectAndAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuestions = await Question.countDocuments();
    const activeUsers = await User.countDocuments({
      'stats.lastActiveDate': { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    });
    
    const totalSubmissions = await Progress.countDocuments();
    const successfulSubmissions = await Progress.countDocuments({ status: 'solved' });

    // Get category distribution
    const categoryStats = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDifficulty: { $avg: { $cond: [
            { $eq: ['$difficulty', 'easy'] }, 1,
            { $cond: [
              { $eq: ['$difficulty', 'medium'] }, 2,
              3
            ]}
          ]}}
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          avgDifficulty: { $round: ['$avgDifficulty', 1] },
          _id: 0
        }
      }
    ]);

    // Get user activity over time (last 30 days)
    const userActivity = await Progress.aggregate([
      {
        $match: {
          completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          submissions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          date: '$_id',
          submissions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalQuestions,
          activeUsers,
          totalSubmissions,
          successfulSubmissions,
          successRate: totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0
        },
        categoryStats,
        userActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
});

// Create new question
router.post('/questions', protectAndAdmin, async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const question = new Question(questionData);
    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
});

// Update question
router.put('/questions/:id', protectAndAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message
    });
  }
});

// Delete question (soft delete)
router.delete('/questions/:id', protectAndAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: false,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message
    });
  }
});

// Get all users with pagination
router.get('/users', protectAndAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Get user details with progress
router.get('/users/:id', protectAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's progress summary
    const progressSummary = await Progress.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          solvedQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    const summary = progressSummary[0] || {
      totalAttempts: 0,
      solvedQuestions: 0,
      averageScore: 0,
      totalTimeSpent: 0
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        progressSummary: {
          ...summary,
          totalTimeSpent: Math.round(summary.totalTimeSpent / 60) // Convert to minutes
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
});

// Update user role
router.put('/users/:id/role', protectAndAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// Get system analytics
router.get('/analytics', protectAndAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // User registration trends
    const userTrends = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          registrations: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          registrations: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Question difficulty distribution
    const difficultyDistribution = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          difficulty: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Top performers
    const topPerformers = await User.aggregate([
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'user',
          as: 'userProgress'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          totalSolved: { $size: '$userProgress' },
          averageScore: { $avg: '$userProgress.score' }
        }
      },
      { $sort: { totalSolved: -1, averageScore: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userTrends,
        difficultyDistribution,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

module.exports = router;
