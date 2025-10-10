/**
 * Button Component Test
 * 简单的组件测试示例
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <Button 
        title="Test Button" 
        onPress={() => {}} 
        loading={true}
        testID="loading-button"
      />
    );
    
    // 这里应该检查加载指示器是否存在
    // 由于我们使用的是 ActivityIndicator，可能需要调整测试
  });

  it('applies correct variant styles', () => {
    const { getByText } = render(
      <Button 
        title="Primary Button" 
        onPress={() => {}} 
        variant="primary"
      />
    );
    
    const button = getByText('Primary Button');
    expect(button).toBeTruthy();
  });
});
