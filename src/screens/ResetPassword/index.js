import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResetPassword = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    token: route?.params?.token || '',
    newPassword: '',
    confirmPassword: '',
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

  const validateForm = () => {
    if (!formData.token.trim()) {
      Alert.alert('Erro', 'Token de recuperação é obrigatório');
      return false;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Erro', 'Por favor, digite a nova senha');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    // Validação de senha forte (opcional)
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      Alert.alert(
        'Senha Fraca', 
        'A senha deve conter pelo menos:\n• Uma letra maiúscula\n• Uma letra minúscula\n• Um número\n• Um caractere especial',
        [
          {
            text: 'Continuar mesmo assim',
            style: 'destructive',
            onPress: () => {}
          },
          {
            text: 'Alterar senha',
            style: 'cancel'
          }
        ]
      );
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const resetPasswordData = {
        token: formData.token,
        newPassword: formData.newPassword,
      };

      const response = await fetch('https://sgpc-api.koyeb.app/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetPasswordData),
      });

      let result = null;
      let responseText = '';

      try {
        result = await response.json();
      } catch (jsonError) {
        try {
          responseText = await response.text();
          console.log('Resposta como texto:', responseText);
        } catch (textError) {
          console.log('Erro ao ler resposta:', textError);
        }
      }

      if (response.ok) {
        Alert.alert(
          'Senha Redefinida!', 
          'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Senha redefinida com sucesso');
                if (result) console.log('Resultado:', result);
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        const errorMessage = result?.message || responseText || 'Token inválido ou expirado';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={60} color="#007AFF" />
            </View>
            
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>
              Digite o token recebido por email e sua nova senha
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Token */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Token de Recuperação</Text>
              <View style={styles.tokenInputContainer}>
                <Ionicons name="receipt-outline" size={20} color="#666" style={styles.tokenIcon} />
                <TextInput
                  style={styles.tokenInput}
                  value={formData.token}
                  onChangeText={(value) => handleInputChange('token', value)}
                  placeholder="Cole o token recebido por email"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.newPassword}
                  onChangeText={(value) => handleInputChange('newPassword', value)}
                  placeholder="Digite sua nova senha"
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

            {/* Confirmar Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Confirme sua nova senha"
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

            {/* Dicas de Senha Forte */}
            <View style={styles.passwordTips}>
              <Text style={styles.tipsTitle}>Sua senha deve conter:</Text>
              <Text style={styles.tipItem}>• Pelo menos 6 caracteres</Text>
              <Text style={styles.tipItem}>• Uma letra maiúscula (A-Z)</Text>
              <Text style={styles.tipItem}>• Uma letra minúscula (a-z)</Text>
              <Text style={styles.tipItem}>• Um número (0-9)</Text>
              <Text style={styles.tipItem}>• Um caractere especial (!@#$%...)</Text>
            </View>

            {/* Botão de Redefinir */}
            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Redefinir Senha</Text>
              )}
            </TouchableOpacity>

            {/* Voltar para Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.loginText}>
                Voltar para <Text style={styles.loginTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    width: '100%',
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
  tokenInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  tokenIcon: {
    marginRight: 10,
  },
  tokenInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
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
  passwordTips: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginTextBold: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default ResetPassword;