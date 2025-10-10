/**
 * GlamMatch App - Color Theme
 * 全局颜色主题配置
 */

export const colors = {
  // 主色调
  primary: '#6B4C3B',        // 深棕色 - 主要按钮、导航
  secondary: '#FF5A5F',      // 珊瑚红 - 强调色、点赞等
  
  // 中性色
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 背景色
  background: {
    primary: '#fff9f7',      // 主背景色
    secondary: '#FFFFFF',    // 卡片背景
    tertiary: '#F9FAFB',     // 次要背景
  },
  
  // 文本色
  text: {
    primary: '#1F2937',      // 主要文本
    secondary: '#6B7280',    // 次要文本
    tertiary: '#9CA3AF',     // 辅助文本
    inverse: '#FFFFFF',      // 反色文本
    link: '#6B4C3B',         // 链接文本
  },
  
  // 状态色
  status: {
    success: '#10B981',      // 成功
    warning: '#F59E0B',      // 警告
    error: '#EF4444',        // 错误
    info: '#3B82F6',         // 信息
  },
  
  // 角色相关色
  role: {
    client: '#3B82F6',       // 客户 - 蓝色
    professional: '#6B4C3B', // 专业化妆师 - 深棕色
  },
  
  // 边框色
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // 阴影色
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
  
  // 渐变色
  gradient: {
    primary: ['#6B4C3B', '#8B5A3C'],
    secondary: ['#FF5A5F', '#FF7A7F'],
    sunset: ['#FF6B6B', '#FFE66D'],
  },
};

export default colors;
