import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/constants/theme';
import { User, Mail, Lock } from 'lucide-react-native';

export default function ProfileScreen() {
  const { currentUser, updateUser, getUser, isLoading } = useUserStore();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');

  // Carregar usuário atual se não existir
  useEffect(() => {
    if (!currentUser) {
      // Usar o primeiro usuário mockado como usuário atual
      getUser('1');
    }
  }, [currentUser, getUser]);

  // Atualizar estados quando currentUser mudar
  useEffect(() => {
    if (currentUser) {
      setNewName(currentUser.name);
      setNewEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!newName.trim() || !newEmail.trim() || !currentUser) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return;
    }

    try {
      await updateUser(currentUser.id, {
        name: newName.trim(),
        email: newEmail.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Alterar Senha',
      'Esta funcionalidade será implementada em breve!'
    );
  };

  if (isLoading || !currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Perfil</Text>

        <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.inputContainer, { 
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border 
          }]}>
            <User size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={isEditing ? newName : currentUser?.name || ''}
              onChangeText={setNewName}
              placeholder="Nome"
              placeholderTextColor={theme.colors.textSecondary}
              editable={isEditing}
            />
          </View>

          <View style={[styles.inputContainer, { 
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border 
          }]}>
            <Mail size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={isEditing ? newEmail : currentUser?.email || ''}
              onChangeText={setNewEmail}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <TouchableOpacity
            style={[styles.passwordButton, { 
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border 
            }]}
            onPress={handleChangePassword}
          >
            <Lock size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.passwordButtonText, { color: theme.colors.text }]}>
              Alterar Senha
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button, 
              isEditing && styles.saveButton,
              { backgroundColor: isEditing ? theme.colors.primary : theme.colors.border }
            ]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <Text style={[
              styles.buttonText, 
              isEditing && styles.saveButtonText,
              { color: isEditing ? 'white' : theme.colors.text }
            ]}>
              {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  form: {
    padding: 20,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
  passwordButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    // Cor será aplicada dinamicamente
  },
  saveButtonText: {
    // Cor será aplicada dinamicamente
  },
});