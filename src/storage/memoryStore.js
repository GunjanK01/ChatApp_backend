/**
 * IN-MEMORY DATA STORE
 * Holds all messages, users, and rooms temporarily (lost on restart)
 */

class MemoryStore {
  constructor() {
    this.messages = {};      // { roomId: [message1, message2, ...] }
    this.users = {};         // { userId: { id, name, socketId } }
    this.socketToUser = {};  // { socketId: userId } - for quick lookup
    this.rooms = {};         // { roomId: { id, participants: [userId1, userId2] } }
    
    console.log('📦 Memory store initialized');
  }

  // ==================== USER METHODS ====================
  
  addUser(userId, socketId, name) {
    this.users[userId] = {
      id: userId,
      name: name,
      socketId: socketId,
      connectedAt: new Date().toISOString()
    };
    
    this.socketToUser[socketId] = userId;
    console.log(`✅ User added: ${name} (${userId})`);
    return this.users[userId];
  }

  getUser(userId) {
    return this.users[userId];
  }

  getUserBySocket(socketId) {
    const userId = this.socketToUser[socketId];
    return userId ? this.users[userId] : null;
  }

  removeUser(socketId) {
    const userId = this.socketToUser[socketId];
    if (userId) {
      const user = this.users[userId];
      delete this.users[userId];
      delete this.socketToUser[socketId];
      console.log(`👋 User removed: ${user?.name}`);
      return user;
    }
    return null;
  }

  getAllUsers() {
    return Object.values(this.users);
  }

  // ==================== ROOM METHODS ====================

  createRoom(roomId, participants) {
    this.rooms[roomId] = {
      id: roomId,
      participants: participants,
      createdAt: new Date().toISOString()
    };
    // Initialize empty message array for this room
    this.messages[roomId] = [];
    console.log(`🏠 Room created: ${roomId}`);
    return this.rooms[roomId];
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  getRoomForUsers(userId1, userId2) {
    // Generate consistent room ID for 1:1 chat
    const sortedIds = [userId1, userId2].sort();
    return `room_${sortedIds[0]}_${sortedIds[1]}`;
  }

  // ==================== MESSAGE METHODS ====================

  addMessage(roomId, message) {
    if (!this.messages[roomId]) {
      this.messages[roomId] = [];
    }

    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };

    this.messages[roomId].push(messageWithTimestamp);
    console.log(`💬 Message added to ${roomId}`);
    
    return messageWithTimestamp;
  }

  getMessages(roomId) {
    return this.messages[roomId] || [];
  }

  // ==================== DEBUG ====================

  getDebugInfo() {
    return {
      totalUsers: Object.keys(this.users).length,
      totalRooms: Object.keys(this.rooms).length,
      totalMessages: Object.values(this.messages).flat().length,
      users: this.users,
      rooms: this.rooms,
      messages: this.messages
    };
  }
}

// Singleton instance
const store = new MemoryStore();
module.exports = store;