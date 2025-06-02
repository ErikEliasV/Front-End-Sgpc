import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { Container } from '@/components/styled/Container';



export default function AuthIndex() {
  useEffect(() => {
    // Redirect to login screen after a short delay
    // In a real app, you would check if the user is already logged in
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container centered>
      <ActivityIndicator size="large" color="#3B82F6" />
    </Container>
  );
}