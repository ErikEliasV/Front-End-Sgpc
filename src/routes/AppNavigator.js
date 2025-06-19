import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importando as telas
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import UserManagement from '../screens/UserManagement';
import Projects from '../screens/Projects';
import Reports from '../screens/Reports';
import Tasks from '../screens/Tasks';
import ManageMaterials from '../screens/ManageMaterials';
import RequestMaterials from '../screens/RequestMaterials';
import TabNavigator from './TabNavigator';

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
          name="MainApp" 
          component={TabNavigator}
          options={{
            title: 'TaskManager'
          }}
        />
        <Stack.Screen 
          name="UserManagement" 
          component={UserManagement}
          options={{
            title: 'Gerenciamento de Usuários'
          }}
        />
        <Stack.Screen 
          name="Projects" 
          component={Projects}
          options={{
            title: 'Projetos'
          }}
        />
        <Stack.Screen 
          name="Reports" 
          component={Reports}
          options={{
            title: 'Relatórios'
          }}
        />
        <Stack.Screen 
          name="Tasks" 
          component={Tasks}
          options={{
            title: 'Tarefas'
          }}
        />
        <Stack.Screen 
          name="ManageMaterials" 
          component={ManageMaterials}
          options={{
            title: 'Gerenciar Materiais'
          }}
        />
        <Stack.Screen 
          name="RequestMaterials" 
          component={RequestMaterials}
          options={{
            title: 'Solicitar Materiais'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 