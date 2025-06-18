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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return false;
    }

    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);

    try {
      const forgotPasswordData = {
        email: email,
      };

      const response = await fetch('https://sgpc-api.koyeb.app/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(forgotPasswordData),
      });

      let result = null;
      let responseText = '';

      try {
        // Tenta fazer parse como JSON
        result = await response.json();
      } catch (jsonError) {
        // Se falhar, tenta ler como texto
        try {
          responseText = await response.text();
          console.log('Resposta como texto:', responseText);
        } catch (textError) {
          console.log('Erro ao ler resposta:', textError);
        }
      }

      // Independente da resposta, sempre mostra a mesma mensagem por segurança
      Alert.alert(
        'Email Enviado', 
        'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Status da resposta:', response.status);
              console.log('Recuperação de senha solicitada para:', email);
              if (result) console.log('Resultado JSON:', result);
              if (responseText) console.log('Resultado texto:', responseText);
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
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
            <Ionicons name="lock-closed-outline" size={60} color="#007AFF" />
          </View>
          
          <Text style={styles.title}>Esqueceu a senha?</Text>
          <Text style={styles.subtitle}>
            Digite seu email e enviaremos instruções para redefinir sua senha
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailInputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.emailIcon} />
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Botão de Enviar */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar Instruções</Text>
            )}
          </TouchableOpacity>

          {/* Informações de Segurança */}
          <View style={styles.securityInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.securityText}>
              Por motivos de segurança, sempre enviamos a mesma mensagem, 
              independente do email existir em nosso sistema.
            </Text>
          </View>

          {/* Já tem o token? */}
          <TouchableOpacity
            style={styles.tokenButton}
            onPress={() => navigation.navigate('ResetPassword')}
          >
            <Text style={styles.tokenText}>
              Já tem o token? <Text style={styles.tokenTextBold}>Redefinir senha</Text>
            </Text>
          </TouchableOpacity>

          {/* Lembrou da senha? */}
          <TouchableOpacity
            style={styles.rememberButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.rememberText}>
              Lembrou da senha? <Text style={styles.rememberTextBold}>Fazer login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    flex: 1,
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
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  emailIcon: {
    marginRight: 10,
  },
  emailInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 25,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
  },
  tokenButton: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 16,
    color: '#666',
  },
  tokenTextBold: {
    fontWeight: '600',
    color: '#28a745',
  },
  rememberButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  rememberText: {
    fontSize: 16,
    color: '#666',
  },
  rememberTextBold: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default ForgotPassword; 