const express = require('express');
const multer = require('multer');
const AIResumeService = require('../services/AIResumeService');
const CodeExecutionService = require('../services/CodeExecutionService');
const router = express.Router();

// Initialize services
const aiResumeService = new AIResumeService();
const codeExecutionService = new CodeExecutionService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});

// Resume analysis endpoint
router.post('/resume/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const { jobDescription } = req.body;
    const analysis = await aiResumeService.analyzeResume(req.file.buffer, jobDescription);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Resume analysis failed',
      error: error.message
    });
  }
});

// Advanced code execution with security
router.post('/code/execute', async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    // Validate input
    if (!code || !language || !testCases) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: code, language, testCases'
      });
    }

    // Execute code in secure environment
    const result = await codeExecutionService.executeCode(code, language, testCases);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message
    });
  }
});

// Code similarity detection
router.post('/code/similarity', async (req, res) => {
  try {
    const { code, questionId } = req.body;

    // Get existing solutions for this question
    const existingSolutions = await Progress.find({
      question: questionId,
      status: 'solved'
    }).select('code.solution user createdAt').limit(100);

    // Check for plagiarism
    const similarities = await codeExecutionService.detectPlagiarism(
      code, 
      existingSolutions
    );

    res.status(200).json({
      success: true,
      data: {
        similarities,
        maxSimilarity: similarities.length > 0 ? Math.max(...similarities.map(s => s.similarity)) : 0,
        isSuspicious: similarities.some(s => s.similarity > 0.8)
      }
    });
  } catch (error) {
    console.error('Similarity detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Similarity detection failed',
      error: error.message
    });
  }
});

// Generate interview questions based on resume
router.post('/interview/generate', async (req, res) => {
  try {
    const { resumeText, difficulty, duration } = req.body;

    // AI-powered question generation
    const questions = await generateInterviewQuestions(resumeText, difficulty, duration);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Question generation failed',
      error: error.message
    });
  }
});

// Performance analysis and recommendations
router.post('/performance/analyze', async (req, res) => {
  try {
    const { userId, timeRange } = req.body;

    // Get user's recent performance data
    const performanceData = await getPerformanceData(userId, timeRange);
    
    // Generate AI-powered insights
    const analysis = await analyzePerformance(performanceData);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Performance analysis failed',
      error: error.message
    });
  }
});

// Helper function: Generate interview questions based on resume
async function generateInterviewQuestions(resumeText, difficulty, duration) {
  // Extract skills from resume
  const skills = aiResumeService.extractSkills(resumeText);
  const experience = aiResumeService.analyzeExperience(resumeText);
  
  // Generate questions based on skills and experience
  const questionTemplates = {
    'javascript': [
      'Explain the concept of closures in JavaScript with a practical example.',
      'How does the event loop work in Node.js?',
      'Describe the difference between `==` and `===` in JavaScript.'
    ],
    'python': [
      'Explain Python\'s GIL and its implications.',
      'How does garbage collection work in Python?',
      'Describe decorators in Python with an example.'
    ],
    'java': [
      'Explain the difference between `==` and `.equals()` in Java.',
      'How does the JVM memory model work?',
      'Describe Spring Boot auto-configuration.'
    ]
  };

  const questions = [];
  const questionCount = Math.floor(duration / 15); // 15 minutes per question

  Object.keys(skills).forEach(skillCategory => {
    if (questionTemplates[skillCategory]) {
      const categoryQuestions = questionTemplates[skillCategory];
      const selectedQuestions = categoryQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.ceil(questionCount / Object.keys(skills).length));
      
      questions.push(...selectedQuestions.map(q => ({
        question: q,
        category: skillCategory,
        difficulty: difficulty || 'medium',
        expectedDuration: 15,
        type: 'technical'
      })));
    }
  });

  // Add behavioral questions based on experience
  if (experience.totalYears > 0) {
    questions.push(
      {
        question: 'Describe a challenging technical problem you solved and your approach.',
        category: 'behavioral',
        difficulty: 'medium',
        expectedDuration: 10,
        type: 'behavioral'
      },
      {
        question: 'How do you stay updated with the latest technology trends?',
        category: 'behavioral',
        difficulty: 'easy',
        expectedDuration: 5,
        type: 'behavioral'
      }
    );
  }

  return questions.slice(0, questionCount);
}

// Helper function: Get performance data
async function getPerformanceData(userId, timeRange) {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return await Progress.aggregate([
    {
      $match: {
        user: userId,
        completedAt: { $gte: startDate, $lte: endDate }
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
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          category: '$questionDetails.category',
          difficulty: '$questionDetails.difficulty'
        },
        totalAttempts: { $sum: 1 },
        successfulAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$timeSpent' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
}

// Helper function: Analyze performance with AI
async function analyzePerformance(performanceData) {
  const analysis = {
    trends: {},
    strengths: [],
    weaknesses: [],
    recommendations: [],
    predictions: {}
  };

  // Calculate trends
  const dailyPerformance = {};
  performanceData.forEach(data => {
    const date = data._id.date;
    if (!dailyPerformance[date]) {
      dailyPerformance[date] = [];
    }
    dailyPerformance[date].push(data);
  });

  // Identify strengths and weaknesses
  const categoryPerformance = {};
  performanceData.forEach(data => {
    const category = data._id.category;
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = {
        attempts: 0,
        successes: 0,
        avgScore: 0
      };
    }
    
    categoryPerformance[category].attempts += data.totalAttempts;
    categoryPerformance[category].successes += data.successfulAttempts;
    categoryPerformance[category].avgScore += data.averageScore;
  });

  Object.entries(categoryPerformance).forEach(([category, perf]) => {
    const successRate = (perf.successes / perf.attempts) * 100;
    const avgScore = perf.avgScore / Object.keys(categoryPerformance).length;
    
    if (successRate > 80 && avgScore > 75) {
      analysis.strengths.push({
        category,
        successRate: Math.round(successRate),
        avgScore: Math.round(avgScore)
      });
    } else if (successRate < 50 || avgScore < 60) {
      analysis.weaknesses.push({
        category,
        successRate: Math.round(successRate),
        avgScore: Math.round(avgScore)
      });
    }
  });

  // Generate recommendations
  if (analysis.weaknesses.length > 0) {
    analysis.recommendations.push('Focus on improving performance in weaker categories');
  }
  
  if (analysis.strengths.length > 0) {
    analysis.recommendations.push('Leverage your strengths in advanced problems');
  }

  // Predict future performance
  const recentPerformance = performanceData.slice(-7); // Last 7 days
  if (recentPerformance.length > 0) {
    const avgRecentScore = recentPerformance.reduce((sum, data) => 
      sum + (data.averageScore || 0), 0) / recentPerformance.length;
    
    analysis.predictions.nextWeekScore = Math.round(avgRecentScore);
    analysis.predictions.improvementNeeded = avgRecentScore < 70;
  }

  return analysis;
}

module.exports = router;
