// 消息类型
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
};

// 消息状态
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

// 会话类型
export const CONVERSATION_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
};

// 消息模型
export class Message {
  constructor({
    id,
    senderId,
    receiverId,
    type = MESSAGE_TYPES.TEXT,
    content,
    timestamp,
    status = MESSAGE_STATUS.SENT,
    conversationId,
  }) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.type = type;
    this.content = content;
    this.timestamp = timestamp;
    this.status = status;
    this.conversationId = conversationId;
  }
}

// 会话模型
export class Conversation {
  constructor({
    id,
    type = CONVERSATION_TYPES.PRIVATE,
    participants,
    lastMessage,
    unreadCount = 0,
    updatedAt,
  }) {
    this.id = id;
    this.type = type;
    this.participants = participants;
    this.lastMessage = lastMessage;
    this.unreadCount = unreadCount;
    this.updatedAt = updatedAt;
  }
} 