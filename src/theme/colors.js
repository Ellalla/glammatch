/**
 * GlamMatch App - Color Theme (Creamy Luxury Edition)
 * 高级极简风格：奶白、摩卡、香槟粉、浅金
 */

export const colors = {
  // ✨ 主色调
  primary: '#B18C74',        // 奶咖色 Mocha Latte - 主按钮、标题
  secondary: '#EAC4B3',      // 香槟粉 Champagne Pink - 强调色
  highlight: '#F2D5C4',      // 奶杏米色 - hover / active

  // ⚪ 中性色
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FCFBFA',           // 奶白 - 最浅背景
    100: '#F8F6F4',          // 奶油白 - 主背景
    200: '#F2EFEC',          // 米白 - 次级背景
    300: '#E8E3DF',          // 雾灰 - 区块边缘
    400: '#D9D2CB',          // 浅摩卡灰
    500: '#BCAAA4',          // 摩卡灰
    600: '#8C7B74',          // 深摩卡
    700: '#5A4B43',          // 咖啡棕
    800: '#3C2E27',          // 深咖
    900: '#241E1A',          // 极深咖
  },

  // 🧊 背景色（以奶白为主）
  background: {
    primary: '#FCFBFA',      // 净白主背景
    secondary: '#FFFFFF',    // 卡片纯白
    tertiary: '#F8F6F4',     // 奶油底色（用于输入区、底部区域）
  },

  // ✍️ 文本色（柔和但对比足够）
  text: {
    primary: '#2E2E2E',      // 主文本 - 深灰
    secondary: '#6E6E6E',    // 次文本 - 中灰
    tertiary: '#A0A0A0',     // 辅助文本
    inverse: '#FFFFFF',      // 反色文本
    link: '#B18C74',         // 链接文本 - 奶咖主色
  },

  // 📊 状态色（去掉饱和感，走柔彩路线）
  status: {
    success: '#B5C8A6',      // 低饱和橄榄绿
    warning: '#EED8A3',      // 奶金色
    error: '#E8A5A0',        // 干玫瑰红
    info: '#C3CBD9',         // 雾蓝灰
  },

  // 👥 角色色
  role: {
    client: '#D8C7B7',       // 柔沙米
    professional: '#B18C74', // 奶咖
  },

  // 🔲 边框色（轻薄感）
  border: {
    light: '#EFEAE6',
    medium: '#E0DAD5',
    dark: '#BCAAA4',
  },

  // ☁️ 阴影（暖灰调）
  shadow: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(177, 140, 116, 0.12)', // 奶咖阴影
    dark: 'rgba(177, 140, 116, 0.2)',
  },

  // 🌈 渐变（柔光感）
  gradient: {
    primary: ['#FDFCFB', '#F8F6F4'],     // 纯净奶白渐变
    secondary: ['#EAC4B3', '#F2D5C4'],   // 香槟粉 → 奶杏
    accent: ['#B18C74', '#EAC4B3'],      // 奶咖 → 香槟粉
  },
};

export default colors;
