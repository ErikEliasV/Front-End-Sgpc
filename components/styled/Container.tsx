import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
  centered?: boolean;
}

export const Container = styled(SafeAreaView)<ContainerProps>`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  ${props => props.centered && `
    justify-content: center;
    align-items: center;
  `}
`;