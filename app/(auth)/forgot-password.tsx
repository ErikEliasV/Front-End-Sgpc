import { useState } from 'react';
import { TouchableOpacity, Keyboard, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Container } from '@/components/styled/Container';
import { 
  AuthContainer, 
  Title, 
  Subtitle,
  InputContainer,
  InputWrapper,
  StyledInput,
  InputLabel,
  InputIcon,
  Button,
  ButtonText,
  ErrorText,
  BackButton
} from '@/components/styled/AuthStyles';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!re.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    const isEmailValid = validateEmail(email);
    
    if (!isEmailValid) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
      
      // Show success message
      Alert.alert(
        "Reset Email Sent",
        "Check your email for instructions to reset your password.",
        [
          { 
            text: "OK", 
            onPress: () => router.push('/(auth)/login') 
          }
        ]
      );
    }, 1500);
  };

  return (
    <Container>
      <BackButton onPress={() => router.back()}>
        <ArrowLeft size={24} color="#333" />
      </BackButton>
      
      <AuthContainer>
        <Title>Reset Password</Title>
        <Subtitle>Enter your email to receive reset instructions</Subtitle>

        <InputContainer>
          <InputWrapper isFocused={emailFocused} hasError={!!emailError}>
            <InputIcon>
              <Mail 
                size={20} 
                color={emailFocused ? '#3B82F6' : '#9CA3AF'} 
                strokeWidth={2}
              />
            </InputIcon>
            <StyledInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                validateEmail(email);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailFocused && email && (
              <InputLabel isActive>Email</InputLabel>
            )}
          </InputWrapper>
          {emailError ? <ErrorText>{emailError}</ErrorText> : null}

          <Button 
            onPress={handleResetPassword} 
            disabled={isLoading || emailSent}
            style={{ marginTop: 24 }}
          >
            <ButtonText>
              {isLoading ? 'Sending...' : emailSent ? 'Email Sent' : 'Reset Password'}
            </ButtonText>
          </Button>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: 24, alignSelf: 'center' }}
          >
            <ButtonText style={{ fontSize: 16, color: '#3B82F6' }}>
              Back to Login
            </ButtonText>
          </TouchableOpacity>
        </InputContainer>
      </AuthContainer>
    </Container>
  );
}