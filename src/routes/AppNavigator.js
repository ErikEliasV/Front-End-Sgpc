import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importando as telas
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import Home from '../screens/Home';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Remove o header padrão
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{
            title: 'Login'
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={{
            title: 'Criar Conta'
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPassword}
          options={{
            title: 'Esqueceu a Senha'
          }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPassword}
          options={{
            title: 'Redefinir Senha'
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{
            title: 'Home'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 