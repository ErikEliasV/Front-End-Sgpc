import { Stack } from 'expo-router';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <ThemeProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </ThemeProvider>
  );
}