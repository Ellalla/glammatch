import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../theme';

/**
 * 通用卡片组件
 * 支持多种样式变体和点击事件
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  shadow = true,
  onPress,
  style,
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // 变体样式
    switch (variant) {
      case 'default':
        baseStyle.push(styles.default);
        break;
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      case 'flat':
        baseStyle.push(styles.flat);
        break;
      default:
        baseStyle.push(styles.default);
    }
    
    // 内边距
    switch (padding) {
      case 'none':
        baseStyle.push(styles.paddingNone);
        break;
      case 'small':
        baseStyle.push(styles.paddingSmall);
        break;
      case 'medium':
        baseStyle.push(styles.paddingMedium);
        break;
      case 'large':
        baseStyle.push(styles.paddingLarge);
        break;
      default:
        baseStyle.push(styles.paddingMedium);
    }
    
    // 外边距
    switch (margin) {
      case 'none':
        baseStyle.push(styles.marginNone);
        break;
      case 'small':
        baseStyle.push(styles.marginSmall);
        break;
      case 'medium':
        baseStyle.push(styles.marginMedium);
        break;
      case 'large':
        baseStyle.push(styles.marginLarge);
        break;
      default:
        baseStyle.push(styles.marginNone);
    }
    
    // 阴影
    if (shadow && variant !== 'flat') {
      baseStyle.push(styles.shadow);
    }
    
    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  margin: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  shadow: PropTypes.bool,
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
  },
  
  // 变体样式
  default: {
    backgroundColor: colors.background.secondary,
  },
  elevated: {
    backgroundColor: colors.background.secondary,
    boxShadow: `0px 4px 8px ${colors.shadow.medium}`,
    elevation: 6,
  },
  outlined: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  flat: {
    backgroundColor: 'transparent',
  },
  
  // 内边距
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
  
  // 外边距
  marginNone: {
    margin: 0,
  },
  marginSmall: {
    margin: 8,
  },
  marginMedium: {
    margin: 16,
  },
  marginLarge: {
    margin: 24,
  },
  
  // 阴影
  shadow: {
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
});

export default Card;
