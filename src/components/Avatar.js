import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors, typography } from '../theme';

/**
 * 通用头像组件
 * 支持图片、文字头像、多种尺寸和状态指示
 */
const Avatar = ({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  status,
  onPress,
  style,
  ...props
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'xs':
        return styles.xs;
      case 'small':
        return styles.small;
      case 'medium':
        return styles.medium;
      case 'large':
        return styles.large;
      case 'xl':
        return styles.xl;
      default:
        return styles.medium;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'circle':
        return styles.circle;
      case 'square':
        return styles.square;
      case 'rounded':
        return styles.rounded;
      default:
        return styles.circle;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs':
        return 10;
      case 'small':
        return 12;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      case 'xl':
        return 24;
      default:
        return 16;
    }
  };

  const getInitials = () => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return colors.status.success;
      case 'away':
        return colors.status.warning;
      case 'busy':
        return colors.status.error;
      case 'offline':
        return colors.gray[400];
      default:
        return null;
    }
  };

  const renderAvatar = () => {
    const avatarStyle = [
      styles.avatar,
      getSizeStyle(),
      getVariantStyle(),
      style,
    ];

    if (source && source.uri) {
      return (
        <Image
          source={source}
          style={avatarStyle}
          resizeMode="cover"
          {...props}
        />
      );
    }

    return (
      <View style={[avatarStyle, styles.textAvatar]}>
        <Text style={[styles.text, { fontSize: getTextSize() }]}>
          {getInitials()}
        </Text>
      </View>
    );
  };

  const renderStatusIndicator = () => {
    if (!status) return null;

    const statusColor = getStatusColor();
    if (!statusColor) return null;

    return (
      <View style={[
        styles.statusIndicator,
        { backgroundColor: statusColor },
        styles[`${size}Status`]
      ]} />
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.container}
      >
        {renderAvatar()}
        {renderStatusIndicator()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {renderAvatar()}
      {renderStatusIndicator()}
    </View>
  );
};

Avatar.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string,
  }),
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xl']),
  variant: PropTypes.oneOf(['circle', 'square', 'rounded']),
  status: PropTypes.oneOf(['online', 'away', 'busy', 'offline']),
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  
  avatar: {
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 尺寸样式
  xs: {
    width: 24,
    height: 24,
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 40,
    height: 40,
  },
  large: {
    width: 56,
    height: 56,
  },
  xl: {
    width: 80,
    height: 80,
  },
  
  // 形状样式
  circle: {
    borderRadius: 50,
  },
  square: {
    borderRadius: 4,
  },
  rounded: {
    borderRadius: 8,
  },
  
  // 文字头像
  textAvatar: {
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.styles.button,
    color: colors.white,
    fontWeight: '600',
  },
  
  // 状态指示器
  statusIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  // 不同尺寸的状态指示器
  xsStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    bottom: 0,
    right: 0,
  },
  smallStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 0,
    right: 0,
  },
  mediumStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 0,
    right: 0,
  },
  largeStatus: {
    width: 14,
    height: 14,
    borderRadius: 7,
    bottom: 0,
    right: 0,
  },
  xlStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 0,
    right: 0,
  },
});

export default Avatar;
