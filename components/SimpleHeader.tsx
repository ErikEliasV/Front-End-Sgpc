import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

interface SimpleHeaderProps {
  title: string;
  onPress?: () => void;
  onBackPress?: () => void;
}

export function SimpleHeader({ title, onPress, onBackPress }: SimpleHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
      )}
      
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            Gerenciar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 