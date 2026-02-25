import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionsAPI, progressAPI } from '../services/api';
import {
  ArrowLeft,
  Clock,
  Star,
  Tag,
  Play,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await questionsAPI.getQuestion(id);
      setQuestion(response.data.data);
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getQuestionProgress(id);
      setProgress(response.data.data);
    } catch (error) {
      // Progress might not exist, which is fine
      console.log('No progress found for this question');
    }
  };

  const difficultyColors = {
    easy: 'bg-success-100 text-success-800',
    medium: 'bg-warning-100 text-warning-800',
    hard: 'bg-error-100 text-error-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Question not found</h3>
        <Link to="/questions" className="btn btn-primary">
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/questions"
          className="flex items-center text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {progress && (
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${progress.status === 'solved' ? 'bg-success-100 text-success-800' :
              progress.status === 'attempted' ? 'bg-warning-100 text-warning-800' :
                'bg-accent text-foreground'
              }`}>
              {progress.status === 'solved' ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-1" />
              )}
              {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
            </div>
          )}
          <Link
            to={`/practice?question=${id}`}
            className="btn btn-primary flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Solve Problem
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Details */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <h1 className="card-title text-2xl">{question.title}</h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[question.difficulty]}`}>
                    {question.difficulty}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {question.points} pts
                  </span>
                </div>
              </div>
            </div>
            <div className="card-content space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Problem Description</h2>
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{question.description}</p>
                </div>
              </div>

              {/* Examples */}
              {question.examples && question.examples.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Examples</h2>
                  <div className="space-y-4">
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-muted p-4 rounded-lg">
                        <div className="mb-3">
                          <span className="font-semibold text-foreground">Example {index + 1}:</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-muted-foreground">Input: </span>
                            <code className="bg-card px-3 py-1 rounded border border-border text-sm">
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Output: </span>
                            <code className="bg-card px-3 py-1 rounded border border-border text-sm">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-medium text-muted-foreground">Explanation: </span>
                              <span className="text-foreground">{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {question.constraints && question.constraints.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Constraints</h2>
                  <ul className="space-y-2">
                    {question.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        <span className="text-foreground">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {question.hints && question.hints.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Hints</h2>
                  <div className="space-y-3">
                    {question.hints.map((hint, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">💡</span>
                          <span className="text-foreground">{hint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-foreground">Quick Info</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Limit
                </div>
                <span className="font-medium">{question.timeLimit}s</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Star className="h-4 w-4 mr-2" />
                  Points
                </div>
                <span className="font-medium">{question.points}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-4 w-4 mr-2" />
                  Category
                </div>
                <span className="font-medium capitalize">{question.category.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-foreground">Tags</h3>
              </div>
              <div className="card-content">
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress Info */}
          {progress && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-foreground">Your Progress</h3>
              </div>
              <div className="card-content space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${progress.status === 'solved' ? 'bg-success-100 text-success-800' :
                    progress.status === 'attempted' ? 'bg-warning-100 text-warning-800' :
                      'bg-accent text-foreground'
                    }`}>
                    {progress.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attempts</span>
                  <span className="font-medium">{progress.attempts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Spent</span>
                  <span className="font-medium">{Math.round(progress.timeSpent / 60)} min</span>
                </div>

                {progress.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Best Score</span>
                    <span className="font-medium">{progress.score}%</span>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <Link
                    to={`/practice?question=${id}`}
                    className="btn btn-primary w-full"
                  >
                    {progress.status === 'solved' ? 'Practice Again' : 'Solve Now'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Related Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-foreground">Actions</h3>
            </div>
            <div className="card-content space-y-3">
              <Link
                to={`/practice?question=${id}`}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Solving
              </Link>

              <Link
                to={`/questions/category/${question.category}`}
                className="btn btn-outline w-full flex items-center justify-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Similar Problems
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
