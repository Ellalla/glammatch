# Firestore 数据模型文档

## 概述

本文档描述了 GlamMatch App 的 Firestore 数据库结构，支持双端角色系统（客户端/专业化妆师）。

## 集合结构

### 1. users 集合

存储用户基本信息，支持角色区分。

```javascript
// 文档 ID: {userId}
{
  // 基本信息
  email: string,
  displayName: string,
  avatar: string, // Firebase Storage URL
  bio: string,
  location: string,
  
  // 角色相关
  role: 'client' | 'professional', // 用户角色
  isVerified: boolean, // 是否认证
  
  // 专业化妆师专有字段
  services: string[], // 提供的服务列表
  rating: number, // 平均评分
  reviewCount: number, // 评价数量
  workHours: { // 工作时间设置
    monday: { enabled: boolean, start: string, end: string },
    tuesday: { enabled: boolean, start: string, end: string },
    // ... 其他天
  },
  
  // 统计信息
  followers: number,
  following: number,
  posts: number,
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp,
  lastActive: timestamp
}
```

### 2. posts 集合

存储用户发布的体验照片和内容。

```javascript
// 文档 ID: {postId}
{
  // 基本信息
  userId: string, // 发布者 ID
  userName: string, // 发布者姓名（冗余存储）
  userAvatar: string, // 发布者头像（冗余存储）
  
  // 内容
  images: string[], // 图片 URL 数组
  description: string, // 描述文本
  visibility: 'public' | 'private', // 可见性
  
  // @功能
  taggedArtistId: string | null, // @的化妆师 ID
  taggedArtistName: string | null, // @的化妆师姓名（冗余存储）
  
  // 互动数据
  likes: number,
  comments: number,
  shares: number,
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. portfolio 集合

存储专业化妆师的作品集。

```javascript
// 文档 ID: {portfolioId}
{
  // 基本信息
  artistId: string, // 化妆师 ID
  title: string, // 作品标题
  description: string, // 作品描述
  imageUrl: string, // 作品图片 URL
  
  // 分类
  category: 'makeup' | 'hair' | 'nail' | 'other',
  tags: string[], // 标签数组
  
  // 互动数据
  likes: number,
  views: number,
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. packages 集合

存储专业化妆师的服务套餐。

```javascript
// 文档 ID: {packageId}
{
  // 基本信息
  stylistId: string, // 化妆师 ID
  name: string, // 套餐名称
  description: string, // 套餐描述
  price: number, // 价格
  duration: number, // 时长（分钟）
  
  // 分类
  category: 'makeup' | 'hair' | 'nail' | 'other',
  
  // 状态
  isActive: boolean, // 是否启用
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. bookings 集合

存储预约信息。

```javascript
// 文档 ID: {bookingId}
{
  // 基本信息
  userId: string, // 客户 ID
  stylistId: string, // 化妆师 ID
  packageId: string, // 套餐 ID
  
  // 预约详情
  date: timestamp, // 预约日期
  startTime: string, // 开始时间 (HH:mm)
  endTime: string, // 结束时间 (HH:mm)
  
  // 状态
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  
  // 客户信息
  clientName: string,
  clientPhone: string,
  clientNotes: string, // 客户备注
  
  // 价格信息
  price: number,
  paymentStatus: 'pending' | 'paid' | 'refunded',
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. vacations 集合

存储化妆师的休假时间。

```javascript
// 文档 ID: {vacationId}
{
  // 基本信息
  stylistId: string, // 化妆师 ID
  startDate: timestamp, // 休假开始日期
  endDate: timestamp, // 休假结束日期
  reason: string, // 休假原因
  
  // 时间戳
  createdAt: timestamp
}
```

### 7. blockedSlots 集合

存储化妆师的不可用时间段。

```javascript
// 文档 ID: {blockedSlotId}
{
  // 基本信息
  stylistId: string, // 化妆师 ID
  date: timestamp, // 日期
  startTime: string, // 开始时间 (HH:mm)
  endTime: string, // 结束时间 (HH:mm)
  reason: string, // 不可用原因
  
  // 时间戳
  createdAt: timestamp
}
```

### 8. messages 集合

存储聊天消息。

```javascript
// 文档 ID: {messageId}
{
  // 基本信息
  chatId: string, // 聊天室 ID
  senderId: string, // 发送者 ID
  receiverId: string, // 接收者 ID
  
  // 消息内容
  content: string, // 消息文本
  type: 'text' | 'image' | 'file', // 消息类型
  imageUrl: string | null, // 图片 URL（如果是图片消息）
  
  // 状态
  isRead: boolean, // 是否已读
  readAt: timestamp | null, // 阅读时间
  
  // 时间戳
  createdAt: timestamp
}
```

### 9. chats 集合

存储聊天室信息。

```javascript
// 文档 ID: {chatId}
{
  // 参与者
  participants: string[], // 参与者 ID 数组
  participantNames: string[], // 参与者姓名数组（冗余存储）
  
  // 最后消息
  lastMessage: string, // 最后一条消息内容
  lastMessageTime: timestamp, // 最后消息时间
  lastMessageSender: string, // 最后消息发送者 ID
  
  // 时间戳
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 索引建议

### 复合索引

1. **posts 集合**
   - `taggedArtistId` + `createdAt` (降序)
   - `userId` + `createdAt` (降序)

2. **bookings 集合**
   - `stylistId` + `date` (升序)
   - `userId` + `createdAt` (降序)
   - `status` + `date` (升序)

3. **messages 集合**
   - `chatId` + `createdAt` (升序)
   - `receiverId` + `isRead` + `createdAt` (升序)

4. **portfolio 集合**
   - `artistId` + `createdAt` (降序)

5. **packages 集合**
   - `stylistId` + `isActive` + `createdAt` (降序)

## 安全规则建议

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的用户文档
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 帖子：用户可以创建自己的帖子，所有人可以读取公开帖子
    match /posts/{postId} {
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read: if resource.data.visibility == 'public';
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // 作品集：专业化妆师可以管理自己的作品集，所有人可以读取
    match /portfolio/{portfolioId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.artistId &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professional';
    }
    
    // 预约：相关用户可以读写
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.stylistId);
    }
    
    // 消息：聊天参与者可以读写
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
  }
}
```

## 数据迁移策略

### 现有用户升级为专业化妆师

1. 更新 `users/{userId}` 文档：
   - 设置 `role: 'professional'`
   - 添加 `services` 数组
   - 设置默认 `workHours`

2. 创建初始作品集（可选）

3. 创建服务套餐

### 数据一致性

- 使用 Firestore 事务确保数据一致性
- 重要操作使用批处理
- 实现适当的错误处理和重试机制

## 性能优化建议

1. **分页查询**：使用 `limit()` 和 `startAfter()` 实现分页
2. **数据冗余**：在相关文档中冗余存储常用字段（如用户名、头像）
3. **缓存策略**：客户端缓存频繁访问的数据
4. **批量操作**：使用批处理减少网络请求

## 监控和维护

1. **数据清理**：定期清理过期或无效数据
2. **性能监控**：监控查询性能和成本
3. **备份策略**：定期备份重要数据
4. **版本控制**：记录数据结构变更历史
