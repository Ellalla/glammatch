import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { colors, typography } from '../src/theme';
import { Button, Card, Input, Avatar } from '../src/components';

export default function ThemeTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>主题系统测试</Text>
        
        {/* 颜色测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>颜色测试</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.primary }]} />
            <Text style={styles.colorLabel}>Primary</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.secondary }]} />
            <Text style={styles.colorLabel}>Secondary</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.background.primary }]} />
            <Text style={styles.colorLabel}>Background Primary</Text>
          </View>
        </Card>

        {/* 字体测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>字体测试</Text>
          <Text style={typography.styles.h1}>H1 标题</Text>
          <Text style={typography.styles.h2}>H2 标题</Text>
          <Text style={typography.styles.h3}>H3 标题</Text>
          <Text style={typography.styles.body}>正文内容</Text>
          <Text style={typography.styles.caption}>辅助文本</Text>
        </Card>

        {/* 按钮测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>按钮测试</Text>
          <Button title="主要按钮" onPress={() => {}} variant="primary" style={styles.button} />
          <Button title="次要按钮" onPress={() => {}} variant="secondary" style={styles.button} />
          <Button title="轮廓按钮" onPress={() => {}} variant="outline" style={styles.button} />
          <Button title="幽灵按钮" onPress={() => {}} variant="ghost" style={styles.button} />
          <Button title="危险按钮" onPress={() => {}} variant="danger" style={styles.button} />
          <Button title="加载中..." onPress={() => {}} loading={true} style={styles.button} />
        </Card>

        {/* 输入框测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>输入框测试</Text>
          <Input 
            label="用户名" 
            placeholder="请输入用户名" 
            style={styles.input}
          />
          <Input 
            label="密码" 
            placeholder="请输入密码" 
            secureTextEntry={true}
            style={styles.input}
          />
          <Input 
            label="描述" 
            placeholder="请输入描述" 
            multiline={true}
            numberOfLines={4}
            style={styles.input}
          />
        </Card>

        {/* 头像测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>头像测试</Text>
          <View style={styles.avatarRow}>
            <Avatar name="张三" size="xs" />
            <Avatar name="李四" size="small" />
            <Avatar name="王五" size="medium" />
            <Avatar name="赵六" size="large" />
            <Avatar name="钱七" size="xl" />
          </View>
          <View style={styles.avatarRow}>
            <Avatar name="在线用户" size="medium" status="online" />
            <Avatar name="离开用户" size="medium" status="away" />
            <Avatar name="忙碌用户" size="medium" status="busy" />
            <Avatar name="离线用户" size="medium" status="offline" />
          </View>
        </Card>

        {/* 卡片测试 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>卡片变体测试</Text>
          <Card variant="outlined" padding="small" margin="small">
            <Text>轮廓卡片</Text>
          </Card>
          <Card variant="flat" padding="small" margin="small">
            <Text>扁平卡片</Text>
          </Card>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    ...typography.styles.h1,
    textAlign: 'center',
    marginVertical: 20,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: 16,
    color: colors.text.primary,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 12,
  },
  colorLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  button: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
});
