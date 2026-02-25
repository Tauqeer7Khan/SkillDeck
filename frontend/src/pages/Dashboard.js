import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { progressAPI } from '../services/api';
import {
  Trophy,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Code,
  BarChart3,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await progressAPI.getOverview();
      setOverview(response.data.data.overview);
      setRecentActivity(response.data.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Questions Solved',
      value: overview?.solvedQuestions || 0,
      total: overview?.totalQuestions || 0,
      icon: Trophy,
      color: 'primary',
      link: '/questions'
    },
    {
      title: 'Completion Rate',
      value: `${overview?.completionRate || 0}%`,
      icon: Target,
      color: 'success',
      link: '/questions'
    },
    {
      title: 'Current Streak',
      value: `${overview?.streak || 0} days`,
      icon: Calendar,
      color: 'warning',
      link: '/practice'
    },
    {
      title: 'Time Spent',
      value: `${user?.stats?.totalTimeSpent || 0} min`,
      icon: Clock,
      color: 'secondary',
      link: '/progress'
    }
  ];

  const quickActions = [
    {
      title: 'Start Practice',
      description: 'Practice with random questions',
      icon: Code,
      link: '/practice',
      color: 'primary'
    },
    {
      title: 'Browse Questions',
      description: 'Explore questions by category',
      icon: BookOpen,
      link: '/questions',
      color: 'success'
    },
    {
      title: 'View Progress',
      description: 'Track your learning journey',
      icon: BarChart3,
      link: '/dashboard',
      color: 'warning'
    },
    {
      title: 'Update Profile',
      description: 'Manage your account settings',
      icon: Award,
      link: '/profile',
      color: 'secondary'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to continue your interview preparation journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'bg-primary-100 text-primary-600',
            success: 'bg-success-100 text-success-600',
            warning: 'bg-warning-100 text-warning-600',
            secondary: 'bg-secondary-100 text-secondary-600'
          };

          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    {stat.total && (
                      <p className="text-xs text-muted-foreground mt-1">
                        of {stat.total} total
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              primary: 'bg-primary-500 hover:bg-primary-600',
              success: 'bg-success-500 hover:bg-success-600',
              warning: 'bg-warning-500 hover:bg-warning-600',
              secondary: 'bg-secondary-500 hover:bg-secondary-600'
            };

            return (
              <Link
                key={index}
                to={action.link}
                className="group"
              >
                <div className="card hover:shadow-lg transition-all hover:scale-105">
                  <div className="card-content">
                    <div className={`w-12 h-12 rounded-lg ${colorClasses[action.color]} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-muted-foreground mr-2" />
              <h3 className="card-title">Recent Activity</h3>
            </div>
          </div>
          <div className="card-content">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border last:border-0 gap-2">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-foreground truncate">{activity.question?.title}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'solved'
                            ? 'bg-success-100 text-success-800'
                            : activity.status === 'attempted'
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-error-100 text-error-800'
                          }`}>
                          {activity.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(activity.timeSpent / 60)} min
                        </span>
                        {activity.score && (
                          <span className="text-sm text-muted-foreground">
                            Score: {activity.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <Link to="/practice" className="btn btn-primary mt-4">
                  Start Practicing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
              <h3 className="card-title">Your Progress</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{overview?.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overview?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {user?.stats?.averageScore || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Average Score</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-success-600">
                    {user?.stats?.totalQuestionsSolved || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Problems Solved</p>
                </div>
              </div>

              {/* Experience Level */}
              <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg">
                <Award className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold text-foreground">
                  {user?.profile?.experience?.charAt(0).toUpperCase() + user?.profile?.experience?.slice(1) || 'Beginner'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Current Level</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
