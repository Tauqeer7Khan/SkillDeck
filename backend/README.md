# Smart Interview Preparation Platform - Backend

A comprehensive backend API for an AI-based interview preparation platform that helps users practice DSA questions, track progress, and improve their coding skills.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Question Management**: Comprehensive DSA question bank with categories and difficulty levels
- **Progress Tracking**: Detailed analytics and progress monitoring
- **Admin Panel**: Full administrative control over questions and users
- **Real-time Analytics**: User activity tracking and performance metrics

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Questions
- `GET /api/questions` - Get all questions with filters
- `GET /api/questions/:id` - Get specific question
- `GET /api/questions/category/:category` - Get questions by category
- `GET /api/questions/random/practice` - Get random practice question
- `POST /api/questions/:id/validate` - Validate solution

### Progress
- `POST /api/progress/submit` - Submit question attempt
- `GET /api/progress/overview` - Get user progress overview
- `GET /api/progress/activity` - Get recent activity
- `GET /api/progress/question/:questionId` - Get question-specific progress

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/analytics` - Get system analytics

## 🗄 Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String, // 'user' or 'admin'
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    experience: String,
    targetRole: String,
    targetCompany: String
  },
  stats: {
    totalQuestionsSolved: Number,
    totalTimeSpent: Number,
    averageScore: Number,
    streak: Number,
    lastActiveDate: Date
  }
}
```

### Question Model
```javascript
{
  title: String,
  description: String,
  difficulty: String, // 'easy', 'medium', 'hard'
  category: String, // 'array', 'string', 'stack', etc.
  tags: [String],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean
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
  points: Number,
  timeLimit: Number,
  isActive: Boolean,
  createdBy: ObjectId
}
```

### Progress Model
```javascript
{
  user: ObjectId,
  question: ObjectId,
  status: String, // 'attempted', 'solved', 'failed'
  attempts: Number,
  timeSpent: Number,
  score: Number,
  code: {
    language: String,
    solution: String
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  completedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart-interview-prep
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Seeding

To populate the database with sample questions:

```bash
node seeds/questions.js
```

This will create:
- An admin user (email: admin@interviewprep.com, password: admin123)
- Sample DSA questions across different categories

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Input validation and sanitization
- Role-based access control

## 📊 Analytics and Monitoring

The platform provides comprehensive analytics:

- User registration trends
- Question difficulty distribution
- Performance metrics
- Activity tracking
- Progress analytics

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

## 🚀 Deployment

### Environment Variables for Production
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRE=7d
```

### Deployment Platforms
- **Render**: Recommended for easy deployment
- **Heroku**: Alternative option
- **AWS**: For advanced scaling needs
- **DigitalOcean**: Cost-effective option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
