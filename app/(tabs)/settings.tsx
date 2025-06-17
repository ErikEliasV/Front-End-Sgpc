import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Moon, LogOut } from 'lucide-react-native';
import { useThemeStore } from '@/store/useThemeStore';
import { useTheme } from '@/constants/theme';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => router.replace('/(auth)/login'),
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>
        
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Modo Escuro</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={isDarkMode ? theme.colors.primary : theme.colors.card}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="white" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
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
  section: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
});