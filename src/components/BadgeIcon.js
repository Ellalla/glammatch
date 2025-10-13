import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '../theme';

export default function BadgeIcon({ 
  name, 
  size = 24, 
  color = colors.text.primary, 
  badgeCount = 0, 
  badgeColor = colors.error,
  badgeTextColor = colors.white,
  style 
}) {
  return (
    <View style={[styles.container, style]}>
      <Icon name={name} size={size} color={color} />
      {badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    ...colors.shadow.small,
  },
  badgeText: {
    ...typography.styles.caption,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
});
