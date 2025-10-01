/**
 * MAIN SERVER FILE
 * Sets up Express + Socket.IO server
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const store = require('./storage/memoryStore');
const setupSocketHandlers = require('./socket/socketHandler');

const app = express();
const httpServer = createServer(app);

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== SOCKET.IO SETUP ====================
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify your React Native app's origin
    methods: ["GET", "POST"]
  }
});

// Setup socket event handlers
setupSocketHandlers(io);

// ==================== REST API ROUTES (minimal for v1) ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Chat server v1 is live!',
    timestamp: new Date().toISOString()
  });
});

// Get all users (for testing)
app.get('/users', (req, res) => {
  const users = store.getAllUsers();
  res.json({ users });
});

// Get messages for a room (for testing)
app.get('/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  const messages = store.getMessages(roomId);
  res.json({ roomId, messages });
});

// Debug endpoint - see all data
app.get('/debug', (req, res) => {
  res.json(store.getDebugInfo());
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Chat Server v1 Started!          ║
║   📡 Port: ${PORT}                       ║
║   🌐 http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
  `);
});