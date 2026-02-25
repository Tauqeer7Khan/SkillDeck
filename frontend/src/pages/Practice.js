import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Code,
  Lightbulb,
  Trophy
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const Practice = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showHints, setShowHints] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchRandomQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSubmit();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, timeLeft]);

  const fetchRandomQuestion = async () => {
    setLoading(true);
    try {
      const response = await questionsAPI.getRandomQuestion();
      const questionData = response.data.data;
      setQuestion(questionData);
      setTimeLeft(questionData.timeLimit);
      setCode(getStarterCode(questionData, language));
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStarterCode = (question, lang) => {
    const starterCodes = {
      javascript: `// ${question.title}\n// Time Limit: ${question.timeLimit} seconds\n\nfunction solution() {\n  // Write your solution here\n  \n}\n\n// Example usage:\n// console.log(solution());`,
      python: `# ${question.title}\n# Time Limit: ${question.timeLimit} seconds\n\ndef solution():\n    # Write your solution here\n    pass\n\n# Example usage:\n# print(solution())`,
      java: `// ${question.title}\n// Time Limit: ${question.timeLimit} seconds\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`,
      cpp: `// ${question.title}\n// Time Limit: ${question.timeLimit} seconds\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`
    };
    return starterCodes[lang] || starterCodes.javascript;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(question?.timeLimit || 0);
    setCode(getStarterCode(question, language));
    setTestResults(null);
    setStartTime(null);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(getStarterCode(question, newLanguage));
  };

  const handleRunCode = async () => {
    if (!question) return;

    try {
      const response = await questionsAPI.validateSolution(question._id, {
        code,
        language
      });
      setTestResults(response.data.data);
    } catch (error) {
      console.error('Failed to validate solution:', error);
    }
  };

  const handleSubmit = async () => {
    if (!question || !startTime) return;

    const timeSpent = Math.round((new Date() - startTime) / 1000);
    const score = testResults?.score || 0;

    try {
      await progressAPI.submitProgress({
        questionId: question._id,
        status: score >= 70 ? 'solved' : 'attempted',
        timeSpent,
        score,
        code: {
          language,
          solution: code
        }
      });

      // Show success message
      if (score >= 70) {
        navigate('/dashboard', {
          state: {
            message: 'Congratulations! You solved the problem!',
            type: 'success'
          }
        });
      } else {
        navigate('/dashboard', {
          state: {
            message: 'Keep practicing! You can do better next time.',
            type: 'info'
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit progress:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No question available</h3>
        <button onClick={fetchRandomQuestion} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
          <p className="text-muted-foreground">Solve random questions to improve your skills</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeLeft <= 60 ? 'bg-error-100 text-error-800' : 'bg-accent text-foreground'
            }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          {!isRunning ? (
            <button onClick={handleStart} className="btn btn-primary flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Start
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button onClick={handlePause} className="btn btn-secondary flex items-center">
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={handleReset} className="btn btn-outline flex items-center">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Panel */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">{question.title}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${question.difficulty === 'easy' ? 'bg-success-100 text-success-800' :
                    question.difficulty === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-error-100 text-error-800'
                    }`}>
                    {question.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {question.points} pts
                  </span>
                </div>
              </div>
            </div>
            <div className="card-content space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-foreground whitespace-pre-wrap">{question.description}</p>
              </div>

              {question.examples && question.examples.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Examples</h3>
                  <div className="space-y-3">
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <div className="mb-2">
                          <span className="font-medium text-foreground">Input: </span>
                          <code className="bg-gray-200 px-2 py-1 rounded text-sm">{example.input}</code>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-foreground">Output: </span>
                          <code className="bg-gray-200 px-2 py-1 rounded text-sm">{example.output}</code>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="font-medium text-foreground">Explanation: </span>
                            <span className="text-muted-foreground">{example.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.constraints && question.constraints.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {question.constraints.map((constraint, index) => (
                      <li key={index} className="text-foreground">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {question.hints && question.hints.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHints ? 'Hide' : 'Show'} Hints
                  </button>
                  {showHints && (
                    <ul className="mt-2 space-y-2">
                      {question.hints.map((hint, index) => (
                        <li key={index} className="text-foreground bg-yellow-50 p-2 rounded">
                          💡 {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Solution</h3>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="text-sm border border-input rounded-md px-3 py-1"
                  disabled={isRunning}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>
            <div className="card-content">
              <Editor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => setCode(value)}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: !isRunning
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-foreground">Test Results</h3>
              </div>
              <div className="card-content">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Score</span>
                    <span className={`font-bold ${testResults.score >= 70 ? 'text-success-600' :
                      testResults.score >= 40 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                      {testResults.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${testResults.score >= 70 ? 'bg-success-600' :
                        testResults.score >= 40 ? 'bg-warning-600' : 'bg-error-600'
                        }`}
                      style={{ width: `${testResults.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {testResults.results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg ${result.passed ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-error-600 mr-2"></div>
                          )}
                          <span className="text-sm font-medium">
                            Test Case {index + 1}
                          </span>
                        </div>
                        <span className={`text-sm ${result.passed ? 'text-success-600' : 'text-error-600'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      {!result.passed && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div>Input: <code className="bg-accent px-1 rounded">{result.input}</code></div>
                          <div>Expected: <code className="bg-accent px-1 rounded">{result.expectedOutput}</code></div>
                          <div>Got: <code className="bg-accent px-1 rounded">{result.actualOutput}</code></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex space-x-3">
                  <button onClick={handleRunCode} className="btn btn-secondary">
                    Run Again
                  </button>
                  {testResults.score >= 70 && (
                    <button onClick={handleSubmit} className="btn btn-success flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Submit Solution
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRunCode}
              disabled={!isRunning || isPaused}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isRunning || isPaused}
              className="btn btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
