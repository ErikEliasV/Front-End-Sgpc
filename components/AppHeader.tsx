import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export function AppHeader({ title, subtitle, rightIcon, onRightPress }: AppHeaderProps) {
  const theme = useTheme();

  console.log('AppHeader render - title:', title, 'subtitle:', subtitle);

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.border 
    }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 50,
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  rightButton: {
    padding: 8,
    borderRadius: 6,
  },
}); 