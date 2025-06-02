import { useState } from 'react';
import { TouchableOpacity, Keyboard, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { Container } from '@/components/styled/Container';
import { 
  AuthContainer, 
  Logo, 
  Title, 
  Subtitle,
  InputContainer,
  InputWrapper,
  StyledInput,
  InputLabel,
  InputIcon,
  Button,
  ButtonText,
  FooterText,
  ErrorText
} from '@/components/styled/AuthStyles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to main app after successful login
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <Container>
      <AuthContainer>
        <Logo>🔐</Logo>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to continue</Subtitle>

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

          <InputWrapper isFocused={passwordFocused} hasError={!!passwordError}>
            <InputIcon>
              <Lock 
                size={20} 
                color={passwordFocused ? '#3B82F6' : '#9CA3AF'} 
                strokeWidth={2}
              />
            </InputIcon>
            <StyledInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => {
                setPasswordFocused(false);
                validatePassword(password);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {passwordFocused && password && (
              <InputLabel isActive>Password</InputLabel>
            )}
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 8 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </InputWrapper>
          {passwordError ? <ErrorText>{passwordError}</ErrorText> : null}

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <FooterText style={{ alignSelf: 'flex-end', marginVertical: 16 }}>
                Forgot Password?
              </FooterText>
            </TouchableOpacity>
          </Link>

          <Button onPress={handleLogin} disabled={isLoading}>
            <ButtonText>{isLoading ? 'Signing in...' : 'Sign In'}</ButtonText>
          </Button>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register')}
            style={{ marginTop: 24, alignSelf: 'center' }}
          >
            <FooterText>
              Don't have an account? <FooterText style={{ color: '#3B82F6' }}>Sign Up</FooterText>
            </FooterText>
          </TouchableOpacity>
        </InputContainer>
      </AuthContainer>
    </Container>
  );
}