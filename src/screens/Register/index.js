import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hourlyRate: '',
    roleNames: ['USER'], // Valor padrão
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const newRoles = prev.roleNames.includes(role)
        ? prev.roleNames.filter(r => r !== role)
        : [...prev.roleNames, role];
      
      return {
        ...prev,
        roleNames: newRoles
      };
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome completo');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o email');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o telefone');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a senha');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (!formData.hourlyRate.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o valor por hora');
      return false;
    }

    if (formData.roleNames.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos uma função');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        hourlyRate: parseFloat(formData.hourlyRate),
        roleNames: formData.roleNames
      };

      const response = await fetch('https://sgpc-api.koyeb.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              // Navegar para a tela de login após registro bem-sucedido
              console.log('Usuário registrado:', result);
              navigation.navigate('Login');
            }
          }
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Erro ao registrar usuário');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se registrar</Text>

          {/* Nome Completo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Digite seu email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirme sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Valor por Hora */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Valor por Hora (R$)</Text>
            <TextInput
              style={styles.input}
              value={formData.hourlyRate}
              onChangeText={(value) => handleInputChange('hourlyRate', value)}
              placeholder="50.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Funções */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Funções</Text>
            <View style={styles.rolesContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.roleNames.includes('USER') && styles.roleButtonSelected
                ]}
                onPress={() => handleRoleToggle('USER')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.roleNames.includes('USER') && styles.roleButtonTextSelected
                ]}>
                  USUÁRIO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.roleNames.includes('MANAGER') && styles.roleButtonSelected
                ]}
                onPress={() => handleRoleToggle('MANAGER')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.roleNames.includes('MANAGER') && styles.roleButtonTextSelected
                ]}>
                  GERENTE
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão de Registro */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkTextBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  roleButtonTextSelected: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666',
  },
  loginLinkTextBold: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default Register;