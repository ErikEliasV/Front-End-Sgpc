import { useState } from 'react';
import { TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
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

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to login after successful registration
      router.replace('/(auth)/login');
    }, 1500);
  };

  return (
    <Container>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <AuthContainer>
          <Logo>🔐</Logo>
          <Title>Create Account</Title>
          <Subtitle>Sign up to get started</Subtitle>

          <InputContainer>
            <InputWrapper isFocused={nameFocused} hasError={!!nameError}>
              <InputIcon>
                <User 
                  size={20} 
                  color={nameFocused ? '#3B82F6' : '#9CA3AF'} 
                  strokeWidth={2}
                />
              </InputIcon>
              <StyledInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => {
                  setNameFocused(false);
                  validateName(name);
                }}
                autoCapitalize="words"
              />
              {nameFocused && name && (
                <InputLabel isActive>Full Name</InputLabel>
              )}
            </InputWrapper>
            {nameError ? <ErrorText>{nameError}</ErrorText> : null}

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

            <InputWrapper isFocused={confirmPasswordFocused} hasError={!!confirmPasswordError}>
              <InputIcon>
                <Lock 
                  size={20} 
                  color={confirmPasswordFocused ? '#3B82F6' : '#9CA3AF'} 
                  strokeWidth={2}
                />
              </InputIcon>
              <StyledInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => {
                  setConfirmPasswordFocused(false);
                  validateConfirmPassword(confirmPassword);
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              {confirmPasswordFocused && confirmPassword && (
                <InputLabel isActive>Confirm Password</InputLabel>
              )}
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 8 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </InputWrapper>
            {confirmPasswordError ? <ErrorText>{confirmPasswordError}</ErrorText> : null}

            <Button onPress={handleRegister} disabled={isLoading} style={{ marginTop: 24 }}>
              <ButtonText>{isLoading ? 'Creating Account...' : 'Sign Up'}</ButtonText>
            </Button>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              style={{ marginTop: 24, alignSelf: 'center' }}
            >
              <FooterText>
                Already have an account? <FooterText style={{ color: '#3B82F6' }}>Sign In</FooterText>
              </FooterText>
            </TouchableOpacity>
          </InputContainer>
        </AuthContainer>
      </ScrollView>
    </Container>
  );
}