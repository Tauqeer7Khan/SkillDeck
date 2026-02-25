import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Send, Users, Clock, Code } from 'lucide-react';

const CollaborativeEditor = ({ roomId, question, onInterviewEnd }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const editorRef = useRef(null);
  const { sendMessage, lastMessage, isConnected } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const { type, data } = lastMessage;
      
      switch (type) {
        case 'room_state':
          setCode(data.code || '');
          setLanguage(data.language || 'javascript');
          setConnectedUsers(data.users || []);
          break;
          
        case 'user_joined':
          setConnectedUsers(prev => [...prev, data.userId]);
          break;
          
        case 'user_left':
          setConnectedUsers(prev => prev.filter(id => id !== data.userId));
          break;
          
        case 'code_change':
          if (data.userId !== getCurrentUserId()) {
            setCode(data.code);
            // Update editor without triggering onChange
            if (editorRef.current) {
              const model = editorRef.current.getModel();
              if (model) {
                model.setValue(data.code);
              }
            }
          }
          break;
          
        case 'cursor_position':
          setCursors(prev => ({
            ...prev,
            [data.userId]: { line: data.line, column: data.column }
          }));
          break;
          
        case 'typing_indicator':
          setTypingUsers(new Set(data.typingUsers));
          break;
          
        case 'chat_message':
          setChatMessages(prev => [...prev, data]);
          break;
          
        case 'interview_started':
          setInterviewStartTime(data.startTime);
          break;
          
        case 'interview_ended':
          onInterviewEnd(data);
          break;
      }
    }
  }, [lastMessage]);

  // Timer for interview duration
  useEffect(() => {
    let interval;
    if (interviewStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - interviewStartTime) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [interviewStartTime]);

  // Join room when component mounts
  useEffect(() => {
    if (isConnected && roomId) {
      sendMessage({
        type: 'join_room',
        data: { roomId }
      });
    }
  }, [isConnected, roomId]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    
    // Send code change to other users
    sendMessage({
      type: 'code_change',
      data: {
        roomId,
        code: newCode,
        selection: editorRef.current?.getSelection()
      }
    });
  }, [roomId, sendMessage]);

  // Handle cursor position changes
  const handleCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    
    const position = editorRef.current.getPosition();
    sendMessage({
      type: 'cursor_position',
      data: {
        roomId,
        line: position.lineNumber,
        column: position.column
      }
    });
  }, [roomId, sendMessage]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    sendMessage({
      type: 'typing_indicator',
      data: {
        roomId,
        isTyping: true
      }
    });

    // Clear typing indicator after 2 seconds
    setTimeout(() => {
      sendMessage({
        type: 'typing_indicator',
        data: {
          roomId,
          isTyping: false
        }
      });
    }, 2000);
  }, [roomId, sendMessage]);

  // Send chat message
  const sendChatMessage = useCallback(() => {
    if (!message.trim()) return;
    
    sendMessage({
      type: 'chat_message',
      data: {
        roomId,
        message: message.trim()
      }
    });
    
    setMessage('');
  }, [message, roomId, sendMessage]);

  // Start interview
  const startInterview = useCallback(() => {
    sendMessage({
      type: 'start_interview',
      data: {
        roomId,
        questionId: question?._id,
        interviewType: 'collaborative'
      }
    });
  }, [roomId, question, sendMessage]);

  // End interview
  const endInterview = useCallback(() => {
    sendMessage({
      type: 'end_interview',
      data: {
        roomId,
        feedback: {
          difficulty: question?.difficulty,
          completed: true,
          collaboration: true
        }
      }
    });
  }, [roomId, question, sendMessage]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current user ID (mock implementation)
  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || 'user1';
  };

  // Render cursor decorations
  const renderCursors = () => {
    if (!editorRef.current) return;
    
    const decorations = Object.entries(cursors).map(([userId, cursor]) => ({
      range: new monaco.Range(
        cursor.line - 1,
        cursor.column - 1,
        cursor.line - 1,
        cursor.column - 1
      ),
      options: {
        className: `cursor-${userId}`,
        hoverMessage: { value: `User ${userId}` },
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }));
    
    editorRef.current.deltaDecorations([], decorations);
  };

  useEffect(() => {
    renderCursors();
  }, [cursors]);

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Collaborative Session</h2>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''} connected
          </div>
        </div>

        {/* Question */}
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-foreground mb-2">Question</h3>
          <div className="text-sm text-foreground bg-muted p-3 rounded">
            {question?.title || 'Loading question...'}
          </div>
          {question?.description && (
            <div className="mt-2 text-xs text-muted-foreground">
              {question.description.substring(0, 100)}...
            </div>
          )}
        </div>

        {/* Connected Users */}
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-foreground mb-3">Active Users</h3>
          <div className="space-y-2">
            {connectedUsers.map(userId => (
              <div key={userId} className="flex items-center">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userId.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">User {userId}</p>
                  {typingUsers.has(userId) && (
                    <p className="text-xs text-muted-foreground">Typing...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground">Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">
                  {msg.userId.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    User {msg.userId} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-foreground bg-accent rounded p-2">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleTyping}
                placeholder="Type a message..."
                className="flex-1 input text-sm"
              />
              <button
                onClick={sendChatMessage}
                className="btn btn-primary p-2"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border border-input rounded px-3 py-1"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              
              {!interviewStartTime ? (
                <button
                  onClick={startInterview}
                  className="btn btn-success flex items-center"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Start Interview
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(elapsedTime)}
                  </div>
                  <button
                    onClick={endInterview}
                    className="btn btn-error"
                  >
                    End Interview
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              {isConnected ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Disconnected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onCursorPositionChange={handleCursorPosition}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: true,
              renderLineHighlight: 'gutter',
              occurrencesHighlight: true
            }}
            onMount={(editor) => {
              editorRef.current = editor;
              
              // Add custom cursor decorations
              editor.createDecorationsCollection();
              
              // Configure keyboard shortcuts
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                handleTyping();
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;
