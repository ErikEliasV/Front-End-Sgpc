import styled from 'styled-components/native';
import { TouchableOpacity, Platform } from 'react-native';

export const AuthContainer = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

export const Logo = styled.Text`
  font-size: 48px;
  text-align: center;
  margin-bottom: 24px;
`;

export const Title = styled.Text`
  font-family: 'Inter-Bold';
  font-size: 28px;
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: 8px;
`;

export const Subtitle = styled.Text`
  font-family: 'Inter-Regular';
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 32px;
`;

export const InputContainer = styled.View`
  width: 100%;
  max-width: 400px;
  align-self: center;
`;

interface InputWrapperProps {
  isFocused: boolean;
  hasError: boolean;
}

export const InputWrapper = styled.View<InputWrapperProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 8px;
  padding: 0 16px;
  height: 56px;
  margin-top: 16px;
  border-width: 1px;
  border-color: ${props => 
    props.hasError ? props.theme.colors.error : 
    props.isFocused ? props.theme.colors.primary : 
    props.theme.colors.border
  };
`;

export const InputIcon = styled.View`
  margin-right: 12px;
`;

export const StyledInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-family: 'Inter-Regular';
`;

interface InputLabelProps {
  isActive: boolean;
}

export const InputLabel = styled.Text<InputLabelProps>`
  position: absolute;
  top: -10px;
  left: 12px;
  background-color: ${props => props.theme.colors.background};
  padding: 0 4px;
  font-size: 12px;
  color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-family: 'Inter-Regular';
`;

export const Button = styled(TouchableOpacity)`
  background-color: ${props => props.disabled ? props.theme.colors.primaryLight : props.theme.colors.primary};
  border-radius: 8px;
  height: 56px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
`;

export const ButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-family: 'Inter-Bold';
`;

export const FooterText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  font-family: 'Inter-Regular';
`;

export const ErrorText = styled.Text`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  margin-left: 16px;
  font-family: 'Inter-Regular';
`;

export const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${Platform.OS === 'ios' ? '50px' : '20px'};
  left: 20px;
  z-index: 10;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.card};
  border-radius: 20px;
`;