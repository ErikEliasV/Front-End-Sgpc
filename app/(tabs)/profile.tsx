import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { User, Mail, Lock } from 'lucide-react-native';

export default function ProfileScreen() {
  const { name, email, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);

  const handleSave = () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    updateProfile(newName, newEmail);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be implemented soon!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={isEditing ? newName : name}
              onChangeText={setNewName}
              placeholder="Name"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={isEditing ? newEmail : email}
              onChangeText={setNewEmail}
              placeholder="Email"
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handleChangePassword}
          >
            <Lock size={20} color="#6B7280" />
            <Text style={styles.passwordButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isEditing && styles.saveButton]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <Text style={[styles.buttonText, isEditing && styles.saveButtonText]}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
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
    backgroundColor: '#fff',
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
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 24,
  },
  passwordButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});