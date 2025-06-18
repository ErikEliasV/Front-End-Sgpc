// Arquivo de rotas do aplicativo
// Aqui você pode configurar sua navegação usando React Navigation ou outra biblioteca

import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import Register from '../screens/Register';
import Login from '../screens/Login';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';

// Exportando as telas para uso nas rotas
export {
  Home,
  Profile,
  Settings,
  Register,
  Login,
  ForgotPassword,
  ResetPassword,
};

// Configuração de rotas - exemplo para uso futuro com React Navigation
export const routes = [
  {
    name: 'Login',
    component: Login,
    title: 'Login',
  },
  {
    name: 'Register',
    component: Register,
    title: 'Registro',
  },
  {
    name: 'ForgotPassword',
    component: ForgotPassword,
    title: 'Esqueceu a Senha',
  },
  {
    name: 'ResetPassword',
    component: ResetPassword,
    title: 'Redefinir Senha',
  },
  {
    name: 'Home',
    component: Home,
    title: 'Início',
  },
  {
    name: 'Profile',
    component: Profile,
    title: 'Perfil',
  },
  {
    name: 'Settings',
    component: Settings,
    title: 'Configurações',
  },
]; 