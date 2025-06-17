import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export function Header({ title, subtitle, rightIcon, onRightPress }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { 
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.border 
    }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onRightPress}
        >
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightButton: {
    padding: 8,
  },
}); 