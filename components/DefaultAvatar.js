import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DefaultAvatar({ size = 60, name = 'U' }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6B4C3B',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
}); 