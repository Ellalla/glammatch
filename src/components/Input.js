import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors, typography } from '../theme';

/**
 * 通用输入框组件
 * 支持多种样式变体、标签、错误状态和图标
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    } else if (isFocused) {
      baseStyle.push(styles.focusedContainer);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledContainer);
    }
    
    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input, styles[size]];
    
    if (multiline) {
      baseStyle.push(styles.multiline);
    }
    
    if (leftIcon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label];
    
    if (error) {
      baseStyle.push(styles.errorLabel);
    }
    
    return baseStyle;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  error: PropTypes.string,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onRightIconPress: PropTypes.func,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  autoCorrect: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  // 标签样式
  label: {
    ...typography.styles.label,
    marginBottom: 8,
    color: colors.text.primary,
  },
  errorLabel: {
    color: colors.status.error,
  },
  
  // 输入框容器
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  // 输入框样式
  input: {
    ...typography.styles.body,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    flex: 1,
  },
  
  // 尺寸样式
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // 多行文本
  multiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  // 图标相关样式
  inputWithLeftIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  
  // 状态样式
  focusedContainer: {
    // 聚焦状态样式
  },
  
  errorContainer: {
    // 错误状态样式
  },
  
  disabledContainer: {
    opacity: 0.6,
  },
  
  // 错误文本
  errorText: {
    ...typography.styles.caption,
    color: colors.status.error,
    marginTop: 4,
  },
});

export default Input;
