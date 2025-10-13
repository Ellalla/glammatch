/**
 * 聊天工具函数
 */

/**
 * 生成统一的会话ID
 * 确保两个用户之间的会话ID始终一致，无论从哪个用户发起
 * @param {string} userId1 - 第一个用户ID
 * @param {string} userId2 - 第二个用户ID
 * @returns {string} 统一的会话ID
 */
export function generateConversationId(userId1, userId2) {
  if (!userId1 || !userId2) {
    throw new Error('用户ID不能为空');
  }
  
  // 按字母顺序排序，确保两个用户之间的会话ID始终一致
  const sortedIds = [userId1, userId2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
}

/**
 * 从会话ID中提取用户ID
 * @param {string} conversationId - 会话ID
 * @returns {Array<string>} 用户ID数组
 */
export function extractUserIdsFromConversationId(conversationId) {
  if (!conversationId || !conversationId.startsWith('chat_')) {
    throw new Error('无效的会话ID格式');
  }
  
  const parts = conversationId.split('_');
  if (parts.length !== 3) {
    throw new Error('会话ID格式错误');
  }
  
  return [parts[1], parts[2]];
}

/**
 * 获取会话中的另一个用户ID
 * @param {string} conversationId - 会话ID
 * @param {string} currentUserId - 当前用户ID
 * @returns {string} 另一个用户ID
 */
export function getOtherUserId(conversationId, currentUserId) {
  const userIds = extractUserIdsFromConversationId(conversationId);
  return userIds.find(id => id !== currentUserId);
}
