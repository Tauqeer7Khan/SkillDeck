const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Question description is required']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['easy', 'medium', 'hard']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['array', 'string', 'stack', 'queue', 'linked-list', 'tree', 'graph', 'dynamic-programming', 'recursion', 'sorting', 'searching']
  },
  tags: [{
    type: String,
    trim: true
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  solution: {
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    code: {
      javascript: String,
      python: String,
      java: String,
      cpp: String
    }
  },
  hints: [String],
  points: {
    type: Number,
    default: 10
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);
