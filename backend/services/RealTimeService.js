const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');

class RealTimeService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
    this.rooms = new Map(); // roomId -> Set of userIds
    this.codeSessions = new Map(); // roomId -> code state
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('WebSocket server initialized');
  }

  async handleConnection(ws, req) {
    try {
      // Extract token from query parameters
      const token = new URL(req.url, 'http://localhost').searchParams.get('token');
      
      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        ws.close(4002, 'Invalid user');
        return;
      }

      // Store client connection
      this.clients.set(user._id.toString(), {
        ws,
        user,
        lastActivity: Date.now()
      });

      // Send welcome message
      this.sendToUser(user._id, {
        type: 'connected',
        data: {
          userId: user._id,
          username: user.username
        }
      });

      // Handle messages
      ws.on('message', (message) => {
        this.handleMessage(user._id, JSON.parse(message.toString()));
      });

      ws.on('close', () => {
        this.handleDisconnection(user._id);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(user._id);
      });

    } catch (error) {
      console.error('Connection error:', error);
      ws.close(4003, 'Authentication failed');
    }
  }

  handleMessage(userId, message) {
    const { type, data } = message;
    
    switch (type) {
      case 'join_room':
        this.joinRoom(userId, data.roomId);
        break;
        
      case 'leave_room':
        this.leaveRoom(userId, data.roomId);
        break;
        
      case 'code_change':
        this.handleCodeChange(userId, data);
        break;
        
      case 'cursor_position':
        this.handleCursorPosition(userId, data);
        break;
        
      case 'typing_indicator':
        this.handleTypingIndicator(userId, data);
        break;
        
      case 'chat_message':
        this.handleChatMessage(userId, data);
        break;
        
      case 'start_interview':
        this.startInterview(userId, data);
        break;
        
      case 'end_interview':
        this.endInterview(userId, data);
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  }

  joinRoom(userId, roomId) {
    // Leave existing room
    this.leaveRoom(userId, this.getUserCurrentRoom(userId));
    
    // Join new room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.codeSessions.set(roomId, {
        code: '',
        language: 'javascript',
        cursors: new Map(),
        typing: new Set()
      });
    }
    
    this.rooms.get(roomId).add(userId);
    
    // Notify room members
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: {
        userId,
        roomSize: this.rooms.get(roomId).size
      }
    }, userId);

    // Send current room state to new user
    const session = this.codeSessions.get(roomId);
    this.sendToUser(userId, {
      type: 'room_state',
      data: {
        roomId,
        code: session.code,
        language: session.language,
        users: Array.from(this.rooms.get(roomId))
      }
    });
  }

  leaveRoom(userId, roomId) {
    if (!roomId || !this.rooms.has(roomId)) return;
    
    this.rooms.get(roomId).delete(userId);
    
    // Clean up empty rooms
    if (this.rooms.get(roomId).size === 0) {
      this.rooms.delete(roomId);
      this.codeSessions.delete(roomId);
    } else {
      // Remove user cursor from session
      const session = this.codeSessions.get(roomId);
      if (session) {
        session.cursors.delete(userId);
        session.typing.delete(userId);
      }
      
      // Notify remaining users
      this.broadcastToRoom(roomId, {
        type: 'user_left',
        data: {
          userId,
          roomSize: this.rooms.get(roomId).size
        }
      });
    }
  }

  handleCodeChange(userId, data) {
    const { roomId, code, selection } = data;
    const session = this.codeSessions.get(roomId);
    
    if (!session) return;
    
    // Update code in session
    session.code = code;
    
    // Broadcast to other users in room
    this.broadcastToRoom(roomId, {
      type: 'code_change',
      data: {
        userId,
        code,
        selection,
        timestamp: Date.now()
      }
    }, userId);
  }

  handleCursorPosition(userId, data) {
    const { roomId, line, column } = data;
    const session = this.codeSessions.get(roomId);
    
    if (!session) return;
    
    // Update cursor position
    session.cursors.set(userId, { line, column, timestamp: Date.now() });
    
    // Broadcast cursor position
    this.broadcastToRoom(roomId, {
      type: 'cursor_position',
      data: {
        userId,
        line,
        column,
        timestamp: Date.now()
      }
    }, userId);
  }

  handleTypingIndicator(userId, data) {
    const { roomId, isTyping } = data;
    const session = this.codeSessions.get(roomId);
    
    if (!session) return;
    
    if (isTyping) {
      session.typing.add(userId);
    } else {
      session.typing.delete(userId);
    }
    
    // Broadcast typing indicator
    this.broadcastToRoom(roomId, {
      type: 'typing_indicator',
      data: {
        userId,
        isTyping,
        typingUsers: Array.from(session.typing)
      }
    }, userId);
  }

  handleChatMessage(userId, data) {
    const { roomId, message } = data;
    
    // Store message in database (optional)
    // await ChatMessage.create({ userId, roomId, message });
    
    // Broadcast message
    this.broadcastToRoom(roomId, {
      type: 'chat_message',
      data: {
        userId,
        message,
        timestamp: Date.now()
      }
    });
  }

  async startInterview(userId, data) {
    const { roomId, questionId, interviewType } = data;
    
    // Create interview session
    const interviewSession = {
      id: roomId,
      questionId,
      type: interviewType, // 'collaborative', 'mock', 'assessment'
      participants: this.rooms.get(roomId) || new Set([userId]),
      startTime: Date.now(),
      status: 'active'
    };
    
    // Store session (could use Redis for production)
    // await redis.set(`interview:${roomId}`, JSON.stringify(interviewSession));
    
    // Notify participants
    this.broadcastToRoom(roomId, {
      type: 'interview_started',
      data: interviewSession
    });
  }

  async endInterview(userId, data) {
    const { roomId, feedback } = data;
    
    // Calculate interview metrics
    const session = this.codeSessions.get(roomId);
    const endTime = Date.now();
    const duration = endTime - (session?.startTime || endTime);
    
    const interviewResults = {
      roomId,
      duration,
      participantCount: this.rooms.get(roomId)?.size || 0,
      codeChanges: this.getCodeChangeCount(roomId),
      feedback,
      completedAt: endTime
    };
    
    // Save results to database
    // await InterviewResult.create(interviewResults);
    
    // Notify participants
    this.broadcastToRoom(roomId, {
      type: 'interview_ended',
      data: interviewResults
    });
    
    // Clean up room
    this.rooms.delete(roomId);
    this.codeSessions.delete(roomId);
  }

  getCodeChangeCount(roomId) {
    // This would be tracked in a real implementation
    return Math.floor(Math.random() * 50) + 10; // Mock data
  }

  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(roomId, message, excludeUserId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.forEach(userId => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message);
      }
    });
  }

  handleDisconnection(userId) {
    // Remove from all rooms
    const currentRoom = this.getUserCurrentRoom(userId);
    this.leaveRoom(userId, currentRoom);
    
    // Remove client
    this.clients.delete(userId);
    
    console.log(`User ${userId} disconnected`);
  }

  getUserCurrentRoom(userId) {
    for (const [roomId, users] of this.rooms) {
      if (users.has(userId)) {
        return roomId;
      }
    }
    return null;
  }

  // Health check and cleanup
  startHealthCheck() {
    setInterval(() => {
      const now = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes
      
      this.clients.forEach((client, userId) => {
        if (now - client.lastActivity > timeout) {
          client.ws.close(4000, 'Inactive');
          this.handleDisconnection(userId);
        }
      });
    }, 60000); // Check every minute
  }

  // Get room statistics
  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    const session = this.codeSessions.get(roomId);
    
    if (!room || !session) return null;
    
    return {
      participantCount: room.size,
      codeLength: session.code.length,
      activeCursors: session.cursors.size,
      typingUsers: session.typing.size,
      language: session.language
    };
  }

  // Broadcast system notifications
  broadcastSystemNotification(message, targetUsers = null) {
    const notification = {
      type: 'system_notification',
      data: {
        message,
        timestamp: Date.now()
      }
    };
    
    if (targetUsers) {
      targetUsers.forEach(userId => this.sendToUser(userId, notification));
    } else {
      this.clients.forEach((client, userId) => {
        this.sendToUser(userId, notification);
      });
    }
  }
}

module.exports = RealTimeService;
