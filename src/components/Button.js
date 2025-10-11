import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors, typography } from '../theme';

/**
 * 通用按钮组件
 * 支持多种样式变体和加载状态
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    // 变体样式
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    // 禁用状态
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    // 变体文本样式
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseTextStyle.push(styles.ghostText);
        break;
      case 'danger':
        baseTextStyle.push(styles.dangerText);
        break;
      default:
        baseTextStyle.push(styles.primaryText);
    }
    
    // 禁用状态
    if (disabled || loading) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? colors.white : colors.primary} 
          />
          <Text style={[getTextStyle(), { marginLeft: 8 }]}>
            {title}
          </Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={styles.iconContainer}>
          {iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      );
    }

    return <Text style={getTextStyle()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.element,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // 尺寸样式
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // 变体样式
  primary: {
    backgroundColor: colors.primary,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.secondary,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.status.error,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  disabled: {
    backgroundColor: colors.gray[300],
    boxShadow: 'none',
    elevation: 0,
  },
  
  // 文本样式
  text: {
    ...typography.styles.button,
    textAlign: 'center',
  },
  smallText: {
    ...typography.styles.buttonSmall,
  },
  mediumText: {
    ...typography.styles.button,
  },
  largeText: {
    ...typography.styles.buttonLarge,
  },
  
  // 变体文本样式
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.gray[500],
  },
  
  // 图标容器
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Button;
