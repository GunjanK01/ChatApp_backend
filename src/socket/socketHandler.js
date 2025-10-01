/**
 * SOCKET.IO EVENT HANDLERS
 * All real-time communication logic lives here
 */

const { v4: uuidv4 } = require('uuid');
const store = require('../storage/memoryStore');

function setupSocketHandlers(io) {
  
  // ==================== CONNECTION ====================
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // ---------- USER AUTHENTICATION/IDENTIFICATION ----------
    socket.on('authenticate', (data) => {
      const { userId, name } = data;
      
      // Add user to store
      store.addUser(userId, socket.id, name);
      
      // Confirm authentication
      socket.emit('authenticated', {
        success: true,
        userId: userId,
        message: `Welcome ${name}!`
      });

      console.log(`✅ User authenticated: ${name} (${userId})`);
    });

    // ---------- JOIN ROOM (1:1 chat) ----------
    socket.on('join_room', (data) => {
      const { roomId } = data;
      
      // Join the socket.io room (enables broadcasting to room)
      socket.join(roomId);
      
      // Get or create room
      let room = store.getRoom(roomId);
      if (!room) {
        // Extract user IDs from roomId if it follows pattern "room_user1_user2"
        const participants = roomId.replace('room_', '').split('_');
        room = store.createRoom(roomId, participants);
      }

      // Send existing messages to user
      const messages = store.getMessages(roomId);
      socket.emit('previous_messages', {
        roomId: roomId,
        messages: messages
      });

      console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);
    });

    // ---------- LEAVE ROOM ----------
    socket.on('leave_room', (data) => {
      const { roomId } = data;
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
    });

    // ---------- SEND MESSAGE ----------
    socket.on('send_message', (data) => {
      const { roomId, text, tempId } = data;
      
      // Get sender info
      const sender = store.getUserBySocket(socket.id);
      if (!sender) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Create message object
      const message = {
        id: uuidv4(), // Generate unique message ID
        roomId: roomId,
        senderId: sender.id,
        senderName: sender.name,
        text: text,
        tempId: tempId, // Client's temporary ID for optimistic UI
        timestamp: new Date().toISOString()
      };

      // Store message
      store.addMessage(roomId, message);

      // Broadcast to all users in the room (including sender)
      io.to(roomId).emit('new_message', message);

      console.log(`📨 Message sent in ${roomId}: "${text}"`);
    });

    // ---------- TYPING INDICATOR ----------
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data;
      
      const user = store.getUserBySocket(socket.id);
      if (!user) return;

      // Broadcast typing status to others in room (not to sender)
      socket.to(roomId).emit('user_typing', {
        roomId: roomId,
        userId: user.id,
        userName: user.name,
        isTyping: isTyping
      });
    });

    // ---------- DISCONNECT ----------
    socket.on('disconnect', () => {
      const user = store.removeUser(socket.id);
      if (user) {
        console.log(`❌ User disconnected: ${user.name}`);
      }
    });

  });

  console.log('✅ Socket handlers initialized');
}

module.exports = setupSocketHandlers;