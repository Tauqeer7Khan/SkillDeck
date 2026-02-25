# Smart Interview Preparation Platform 🚀

A comprehensive AI-based interview preparation platform that helps users practice DSA questions, track progress, and improve their coding skills for technical interviews.

## 🌟 Features

### 🎯 Core Features
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Question Bank**: Curated DSA questions across multiple categories (Array, String, Stack, etc.)
- **Timed Practice**: Timer-based coding tests to simulate real interview conditions
- **Progress Analytics**: Comprehensive dashboard with performance metrics and insights
- **Admin Panel**: Full administrative control for question and user management
- **Code Editor**: Monaco editor with syntax highlighting and multiple language support

### 📊 Analytics & Tracking
- Real-time progress tracking
- Performance metrics and statistics
- Streak tracking and gamification elements
- Category-wise progress analysis
- Time management analytics

### 🛠 Technical Features
- RESTful API architecture
- Responsive design with Tailwind CSS
- Modern React with hooks and context
- MongoDB for data persistence
- Secure authentication and authorization

## 🏗 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Code editing experience
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "project smart interview preparation"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # Seed the database with sample data
   cd backend
   node seeds/questions.js
   ```

5. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/health

## 📁 Project Structure

```
project smart interview preparation/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── seeds/           # Database seeding scripts
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables (Backend)
Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-interview-prep
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Environment Variables (Frontend)
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Questions Endpoints
- `GET /api/questions` - Get all questions with filters
- `GET /api/questions/:id` - Get specific question
- `GET /api/questions/random/practice` - Get random practice question
- `POST /api/questions/:id/validate` - Validate solution

### Progress Endpoints
- `POST /api/progress/submit` - Submit question attempt
- `GET /api/progress/overview` - Get user progress overview
- `GET /api/progress/activity` - Get recent activity

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question

## 🎯 Usage Guide

### For Students
1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Questions**: Explore questions by category and difficulty
3. **Practice**: Solve problems with timer and instant feedback
4. **Track Progress**: Monitor your improvement over time
5. **Set Goals**: Define target roles and companies for personalized experience

### For Admins
1. **Access Admin Panel**: Use admin credentials to access dashboard
2. **Manage Questions**: Add, edit, or remove questions
3. **Monitor Users**: View user statistics and activity
4. **Analytics**: Track platform usage and performance

## 🏆 Demo Account

For testing purposes, use these credentials:

- **Email**: admin@interviewprep.com
- **Password**: admin123
- **Role**: Admin (access to all features)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-production-db-url
JWT_SECRET=your-secure-production-secret
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 🎉 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Monaco Editor for the excellent code editing experience
- MongoDB for the flexible database solution

---

**Built with ❤️ for developers preparing for technical interviews**
