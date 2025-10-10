/**
 * GlamMatch App - Typography Theme
 * 全局字体样式配置
 */

export const typography = {
  // 字体大小
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // 字重
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // 预设文本样式
  styles: {
    // 标题样式
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
      color: '#1F2937',
    },
    h2: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.3,
      color: '#1F2937',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
      color: '#1F2937',
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
      color: '#1F2937',
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
      color: '#1F2937',
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.4,
      color: '#1F2937',
    },
    
    // 正文样式
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
      color: '#374151',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      color: '#6B7280',
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.6,
      color: '#374151',
    },
    
    // 标签样式
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.4,
      color: '#374151',
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.3,
      color: '#6B7280',
    },
    
    // 按钮文本样式
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    
    // 链接样式
    link: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.4,
      color: '#6B4C3B',
      textDecorationLine: 'underline',
    },
    
    // 辅助文本样式
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.3,
      color: '#9CA3AF',
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 1.2,
      color: '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
};

export default typography;
