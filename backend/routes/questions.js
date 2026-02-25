const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

// Middleware to protect routes (will be imported from auth)
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
    req.user = await require('../models/User').findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Get all questions with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const questions = await Question.find(filter)
      .select('title difficulty category tags points timeLimit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
});

// Get single question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Don't send solution and test cases in normal view
    const questionForUser = {
      _id: question._id,
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      category: question.category,
      tags: question.tags,
      examples: question.examples,
      constraints: question.constraints,
      timeLimit: question.timeLimit,
      points: question.points,
      hints: question.hints
    };

    res.status(200).json({
      success: true,
      data: questionForUser
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
});

// Get questions by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { difficulty, page = 1, limit = 10 } = req.query;

    const filter = { 
      category: category.toLowerCase(), 
      isActive: true 
    };

    if (difficulty) filter.difficulty = difficulty;

    const skip = (page - 1) * limit;

    const questions = await Question.find(filter)
      .select('title difficulty category tags points timeLimit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get questions by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions by category',
      error: error.message
    });
  }
});

// Get random question for practice
router.get('/random/practice', protect, async (req, res) => {
  try {
    const { difficulty, category } = req.query;

    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const count = await Question.countDocuments(filter);
    
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found matching the criteria'
      });
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter)
      .select('title description difficulty category tags examples constraints timeLimit points hints')
      .skip(random);

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get random question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get random question',
      error: error.message
    });
  }
});

// Validate solution (for practice mode)
router.post('/:id/validate', protect, async (req, res) => {
  try {
    const { code, language } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // This is a simplified validation
    // In a real application, you would run the code in a sandboxed environment
    const visibleTestCases = question.testCases.filter(tc => !tc.isHidden);
    
    // Mock validation - replace with actual code execution logic
    const results = visibleTestCases.map(testCase => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "Mock output", // Replace with actual execution
      passed: Math.random() > 0.3 // Mock pass/fail
    }));

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const score = Math.round((passedTests / totalTests) * 100);

    res.status(200).json({
      success: true,
      data: {
        results,
        score,
        passedTests,
        totalTests,
        timeComplexity: question.solution.timeComplexity,
        spaceComplexity: question.solution.spaceComplexity
      }
    });
  } catch (error) {
    console.error('Validate solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate solution',
      error: error.message
    });
  }
});

module.exports = router;
