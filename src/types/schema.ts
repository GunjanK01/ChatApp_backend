import { z } from 'zod';

/**
 * Phase 1: Core types for 1:1 chat
 * Simplified schema focusing on essential features
 */

// ===== BASE TYPES =====
export type ID = string;

export const idSchema = z.string().uuid();
export const timestampSchema = z.string().datetime();

// ===== USER SCHEMAS =====
export const userSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(255),
  avatarUrl: z.string().url().optional(),
  isOnline: z.boolean().optional(),
  lastSeenAt: timestampSchema.optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ===== MESSAGE SCHEMAS =====
export const messagePreviewSchema = z.object({
  id: idSchema,
  text: z.string().optional(),
  senderId: idSchema,
  createdAt: timestampSchema,
});

export const messageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  senderId: idSchema,
  text: z.string().optional(),
  createdAt: timestampSchema,
  isDeliveredTo: z.array(idSchema).optional(),
  isSeenBy: z.array(idSchema).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: idSchema,
  text: z.string().min(1).max(10000),
  tempId: z.string().optional(),
});

// ===== CONVERSATION SCHEMAS =====
export const conversationSchema = z.object({
  id: idSchema,
  name: z.string().optional(),
  isGroup: z.boolean(),
  participantIds: z.array(idSchema),
  lastMessage: messagePreviewSchema.optional(),
  unreadCount: z.number().int().min(0).optional(),
  updatedAt: timestampSchema,
});

export const createConversationSchema = z.object({
  participantIds: z.array(idSchema).min(1).max(1), // Only 1:1 for Phase 1
});

// ===== SOCKET EVENT SCHEMAS =====
export const socketAuthSchema = z.object({
  token: z.string().min(1),
});

export const joinConversationSchema = z.object({
  conversationId: idSchema,
});

export const typingSchema = z.object({
  conversationId: idSchema,
  isTyping: z.boolean(),
});

export const markSeenSchema = z.object({
  messageId: idSchema,
});

// ===== QUERY SCHEMAS =====
export const searchUsersSchema = z.object({
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const paginationSchema = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ===== RESPONSE SCHEMAS =====
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export const conversationsResponseSchema = z.object({
  conversations: z.array(conversationSchema),
});

export const messagesResponseSchema = z.object({
  messages: z.array(messageSchema),
  nextCursor: idSchema.optional(),
  hasMore: z.boolean(),
});

// ===== EXPORTED TYPES =====
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type Login = z.infer<typeof loginSchema>;

export type MessagePreview = z.infer<typeof messagePreviewSchema>;
export type Message = z.infer<typeof messageSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;

export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;

export type SocketAuth = z.infer<typeof socketAuthSchema>;
export type JoinConversation = z.infer<typeof joinConversationSchema>;
export type Typing = z.infer<typeof typingSchema>;
export type MarkSeen = z.infer<typeof markSeenSchema>;

export type SearchUsers = z.infer<typeof searchUsersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ConversationsResponse = z.infer<typeof conversationsResponseSchema>;
export type MessagesResponse = z.infer<typeof messagesResponseSchema>;