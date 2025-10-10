# Step 1: 主题系统和基础组件

## 变更概述

本次提交引入了 GlamMatch App 的主题系统和基础组件库，为后续的双端角色系统奠定基础。

## 新增文件

### 主题系统
- `src/theme/colors.js` - 全局颜色主题配置
- `src/theme/typography.js` - 全局字体样式配置
- `src/theme/index.js` - 主题导出文件

### 基础组件
- `src/components/Button.js` - 通用按钮组件
- `src/components/Card.js` - 通用卡片组件
- `src/components/Input.js` - 通用输入框组件
- `src/components/Avatar.js` - 通用头像组件
- `src/components/index.js` - 组件导出文件

### 测试文件
- `src/components/__tests__/Button.test.js` - 按钮组件测试示例

## 修改文件

- `screens/ProfileScreen.js` - 更新为使用新的主题系统

## 主要特性

### 主题系统
- **颜色主题**: 包含主色调、中性色、状态色、角色相关色等
- **字体主题**: 包含标题、正文、按钮、链接等预设样式
- **一致性**: 确保整个应用的视觉一致性

### 基础组件
- **Button**: 支持多种变体 (primary, secondary, outline, ghost, danger)
- **Card**: 支持多种样式 (default, elevated, outlined, flat)
- **Input**: 支持标签、错误状态、图标、多行文本
- **Avatar**: 支持图片/文字头像、多种尺寸、状态指示

### 组件特性
- **TypeScript 支持**: 使用 PropTypes 进行类型检查
- **可访问性**: 支持触摸反馈和状态指示
- **可定制**: 支持自定义样式和变体
- **一致性**: 遵循设计系统规范

## 本地测试步骤

### 1. 安装依赖
```bash
npm install
# 或
yarn install
```

### 2. 启动开发服务器
```bash
npm start
# 或
yarn start
```

### 3. 测试组件
1. 打开 Expo Go 应用
2. 扫描二维码或输入 URL
3. 导航到 Profile 页面
4. 验证样式是否正常显示
5. 检查按钮、卡片等组件是否正常工作

### 4. 验证主题系统
1. 检查颜色是否一致
2. 验证字体大小和样式
3. 确认阴影和圆角效果
4. 测试不同状态下的组件表现

## 使用示例

### 导入主题
```javascript
import { colors, typography } from '../src/theme';
```

### 使用组件
```javascript
import { Button, Card, Input, Avatar } from '../src/components';

// 按钮
<Button 
  title="点击我" 
  onPress={() => {}} 
  variant="primary" 
  size="medium" 
/>

// 卡片
<Card variant="elevated" padding="medium">
  <Text>卡片内容</Text>
</Card>

// 输入框
<Input 
  label="用户名" 
  placeholder="请输入用户名" 
  value={username} 
  onChangeText={setUsername} 
/>

// 头像
<Avatar 
  name="张三" 
  size="large" 
  status="online" 
/>
```

## 注意事项

1. **向后兼容**: 现有页面可以逐步迁移到新主题系统
2. **性能**: 组件使用 React.memo 优化渲染性能
3. **可扩展**: 主题系统支持轻松添加新的颜色和样式
4. **一致性**: 所有组件都遵循相同的设计规范

## 下一步

- Step 2: 实现基于角色的导航系统
- Step 3: 实现 Professional 升级流程
- Step 4: 实现客户上传体验照功能
- Step 5: 实现 ArtistPage 的 Client Shares 区域
- Step 6: 加入前端权限保护

## 验收标准

- [x] 主题系统文件创建完成
- [x] 基础组件创建完成
- [x] 现有页面能正常使用新主题
- [x] 组件支持多种变体和状态
- [x] 代码通过 linting 检查
- [x] 提供测试示例和文档
