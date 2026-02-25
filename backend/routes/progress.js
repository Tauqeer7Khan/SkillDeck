const express = require('express');
const Progress = require('../models/Progress');
const Question = require('../models/Question');
const User = require('../models/User');
const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
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
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Submit question attempt
router.post('/submit', protect, async (req, res) => {
  try {
    const { 
      questionId, 
      status, 
      timeSpent, 
      score, 
      code, 
      attempts = 1 
    } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create or update progress record
    let progress = await Progress.findOne({
      user: req.user._id,
      question: questionId
    });

    if (progress) {
      // Update existing progress
      progress.status = status;
      progress.timeSpent += timeSpent;
      progress.attempts += attempts;
      progress.score = score;
      progress.code = code;
      progress.completedAt = new Date();
      
      // Generate feedback based on performance
      progress.feedback = generateFeedback(status, score, timeSpent);
      
      await progress.save();
    } else {
      // Create new progress record
      progress = new Progress({
        user: req.user._id,
        question: questionId,
        status,
        timeSpent,
        score,
        code,
        attempts,
        feedback: generateFeedback(status, score, timeSpent)
      });
      
      await progress.save();
    }

    // Update user stats
    await updateUserStats(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Progress submitted successfully',
      data: progress
    });
  } catch (error) {
    console.error('Submit progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit progress',
      error: error.message
    });
  }
});

// Get user's overall progress
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall stats
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const solvedQuestions = await Progress.countDocuments({
      user: userId,
      status: 'solved'
    });
    const attemptedQuestions = await Progress.countDocuments({
      user: userId,
      status: { $in: ['attempted', 'solved'] }
    });

    // Get progress by category
    const categoryProgress = await Progress.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'questions',
          localField: 'question',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      { $unwind: '$questionDetails' },
      {
        $group: {
          _id: '$questionDetails.category',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          totalTime: { $sum: '$timeSpent' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          solved: 1,
          completionRate: { $multiply: [{ $divide: ['$solved', '$total'] }, 100] },
          averageScore: { $round: ['$averageScore', 1] },
          totalTime: 1,
          _id: 0
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Progress.getRecentActivity(userId, 5);

    // Calculate streak
    const streak = await calculateStreak(userId);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalQuestions,
          solvedQuestions,
          attemptedQuestions,
          completionRate: totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0,
          streak
        },
        categoryProgress,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get progress overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress overview',
      error: error.message
    });
  }
});

// Get user's recent activity
router.get('/activity', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await Progress.getRecentActivity(req.user._id, parseInt(limit));

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity',
      error: error.message
    });
  }
});

// Get progress for specific question
router.get('/question/:questionId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      question: req.params.questionId
    }).populate('question', 'title difficulty category');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this question'
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get question progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get question progress',
      error: error.message
    });
  }
});

// Helper function to generate feedback
function generateFeedback(status, score, timeSpent) {
  const feedback = {
    strengths: [],
    weaknesses: [],
    suggestions: []
  };

  if (status === 'solved') {
    feedback.strengths.push('Successfully solved the problem');
    
    if (score >= 80) {
      feedback.strengths.push('Excellent solution quality');
    } else if (score >= 60) {
      feedback.suggestions.push('Consider optimizing your solution for better performance');
    } else {
      feedback.weaknesses.push('Solution needs improvement');
      feedback.suggestions.push('Review the approach and try to optimize');
    }
  } else {
    feedback.weaknesses.push('Problem not solved');
    feedback.suggestions.push('Try a different approach or review the concepts');
  }

  if (timeSpent > 1800) { // 30 minutes
    feedback.suggestions.push('Practice time management techniques');
  }

  return feedback;
}

// Helper function to update user stats
async function updateUserStats(userId) {
  const stats = await Progress.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalQuestionsSolved: {
          $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  const userStats = stats[0] || {
    totalQuestionsSolved: 0,
    totalTimeSpent: 0,
    averageScore: 0
  };

  await User.findByIdAndUpdate(userId, {
    $set: {
      'stats.totalQuestionsSolved': userStats.totalQuestionsSolved,
      'stats.totalTimeSpent': Math.round(userStats.totalTimeSpent / 60), // Convert to minutes
      'stats.averageScore': Math.round(userStats.averageScore || 0),
      'stats.lastActiveDate': new Date()
    }
  });
}

// Helper function to calculate streak
async function calculateStreak(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activities = await Progress.find({
    user: userId,
    completedAt: { $gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
  }).sort({ completedAt: -1 });

  if (activities.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);
  
  for (const activity of activities) {
    const activityDate = new Date(activity.completedAt);
    activityDate.setHours(0, 0, 0, 0);
    
    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (activityDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  return streak;
}

module.exports = router;
