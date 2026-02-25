const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  status: {
    type: String,
    enum: ['attempted', 'solved', 'failed'],
    required: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  code: {
    language: String,
    solution: String
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique user-question combinations for solved questions
progressSchema.index({ user: 1, question: 1, status: 1 }, { unique: true });

// Static method to get user's overall progress
progressSchema.statics.getUserProgress = async function(userId) {
  const pipeline = [
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$user',
        totalQuestions: { $sum: 1 },
        solvedQuestions: {
          $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageScore: { $avg: '$score' },
        attempts: { $sum: '$attempts' }
      }
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'question',
        foreignField: '_id',
        as: 'questionDetails'
      }
    },
    {
      $unwind: '$questionDetails'
    },
    {
      $group: {
        _id: '$questionDetails.category',
        total: { $sum: 1 },
        solved: {
          $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
        }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get user's recent activity
progressSchema.statics.getRecentActivity = async function(userId, limit = 10) {
  return await this.find({ user: userId })
    .populate('question', 'title difficulty category')
    .sort({ completedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Progress', progressSchema);
